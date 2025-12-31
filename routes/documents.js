import express from 'express';
import { prisma } from '../server.js';
import { authenticate, requireOwnerOrAdmin } from '../middleware/auth.js';
import upload from '../middleware/upload.js';
import { uploadToCloudinary, deleteFromCloudinary } from '../utils/cloudinary.js';

const router = express.Router();

/**
 * POST /api/documents/upload
 * Upload a document
 */
router.post('/upload', authenticate, upload.single('file'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }

    const { studentId, documentType } = req.body;

    if (!studentId || !documentType) {
      return res.status(400).json({ error: 'Student ID and document type are required' });
    }

    // Verify student ownership or admin
    const student = await prisma.student.findUnique({ where: { id: studentId } });
    if (!student) {
      return res.status(404).json({ error: 'Student not found' });
    }

    if (req.user.role !== 'ADMIN' && req.user.student?.id !== studentId) {
      return res.status(403).json({ error: 'Access denied' });
    }

    // Determine resource type for Cloudinary
    const resourceType = req.file.mimetype === 'application/pdf' ? 'raw' : 'image';

    // Upload to Cloudinary
    const result = await uploadToCloudinary(req.file.buffer, 'school-documents', resourceType);

    // Check if document of this type already exists
    const existingDoc = await prisma.document.findFirst({
      where: {
        studentId,
        documentType,
      },
    });

    if (existingDoc) {
      // Delete old file from Cloudinary
      try {
        const publicId = existingDoc.fileUrl.split('/').slice(-2).join('/').split('.')[0];
        await deleteFromCloudinary(publicId, resourceType);
      } catch (deleteError) {
        console.error('Failed to delete old file:', deleteError);
      }

      // Update existing document
      const document = await prisma.document.update({
        where: { id: existingDoc.id },
        data: {
          fileUrl: result.secure_url,
          fileName: req.file.originalname,
          fileSize: req.file.size,
          uploadedAt: new Date(),
        },
      });

      return res.json({ message: 'Document updated successfully', document });
    }

    // Create new document
    const document = await prisma.document.create({
      data: {
        studentId,
        documentType,
        fileUrl: result.secure_url,
        fileName: req.file.originalname,
        fileSize: req.file.size,
      },
    });

    res.status(201).json({ message: 'Document uploaded successfully', document });
  } catch (error) {
    console.error('Upload error:', error);
    res.status(500).json({ error: 'Failed to upload document' });
  }
});

/**
 * GET /api/documents/student/:studentId
 * Get all documents for a student
 */
router.get('/student/:studentId', authenticate, requireOwnerOrAdmin('studentId'), async (req, res) => {
  try {
    const documents = await prisma.document.findMany({
      where: { studentId: req.params.studentId },
      orderBy: { uploadedAt: 'desc' },
    });

    res.json(documents);
  } catch (error) {
    console.error('Get documents error:', error);
    res.status(500).json({ error: 'Failed to fetch documents' });
  }
});

/**
 * DELETE /api/documents/:id
 * Delete a document
 */
router.delete('/:id', authenticate, async (req, res) => {
  try {
    const document = await prisma.document.findUnique({
      where: { id: req.params.id },
      include: { student: true },
    });

    if (!document) {
      return res.status(404).json({ error: 'Document not found' });
    }

    // Check ownership or admin
    if (req.user.role !== 'ADMIN' && req.user.student?.id !== document.studentId) {
      return res.status(403).json({ error: 'Access denied' });
    }

    // Delete from Cloudinary
    try {
      const resourceType = document.fileUrl.includes('.pdf') ? 'raw' : 'image';
      const publicId = document.fileUrl.split('/').slice(-2).join('/').split('.')[0];
      await deleteFromCloudinary(publicId, resourceType);
    } catch (deleteError) {
      console.error('Failed to delete from Cloudinary:', deleteError);
    }

    // Delete from database
    await prisma.document.delete({ where: { id: req.params.id } });

    res.json({ message: 'Document deleted successfully' });
  } catch (error) {
    console.error('Delete document error:', error);
    res.status(500).json({ error: 'Failed to delete document' });
  }
});

export default router;
