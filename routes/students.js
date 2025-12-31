import express from 'express';
import { body, validationResult } from 'express-validator';
import { prisma } from '../server.js';
import { authenticate, requireAdmin, requireOwnerOrAdmin } from '../middleware/auth.js';
import { sendApprovalEmail } from '../utils/email.js';

const router = express.Router();

/**
 * GET /api/students
 * Get all students (admin only)
 */
router.get('/', authenticate, requireAdmin, async (req, res) => {
  try {
    const { search, status, gradeLevel, page = 1, limit = 10 } = req.query;
    
    const where = {};
    
    if (search) {
      where.OR = [
        { firstName: { contains: search, mode: 'insensitive' } },
        { lastName: { contains: search, mode: 'insensitive' } },
        { user: { email: { contains: search, mode: 'insensitive' } } },
      ];
    }
    
    if (status) {
      where.enrollmentStatus = status;
    }
    
    if (gradeLevel) {
      where.gradeLevel = gradeLevel;
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);
    
    const [students, total] = await Promise.all([
      prisma.student.findMany({
        where,
        include: {
          user: { select: { email: true } },
          guardians: true,
          documents: true,
          payments: true,
        },
        skip,
        take: parseInt(limit),
        orderBy: { createdAt: 'desc' },
      }),
      prisma.student.count({ where }),
    ]);

    res.json({
      students,
      pagination: {
        total,
        page: parseInt(page),
        limit: parseInt(limit),
        totalPages: Math.ceil(total / parseInt(limit)),
      },
    });
  } catch (error) {
    console.error('Get students error:', error);
    res.status(500).json({ error: 'Failed to fetch students' });
  }
});

/**
 * GET /api/students/:id
 * Get student by ID
 */
router.get('/:id', authenticate, requireOwnerOrAdmin('id'), async (req, res) => {
  try {
    const student = await prisma.student.findUnique({
      where: { id: req.params.id },
      include: {
        user: { select: { email: true } },
        guardians: true,
        documents: true,
        payments: { orderBy: { createdAt: 'desc' } },
      },
    });

    if (!student) {
      return res.status(404).json({ error: 'Student not found' });
    }

    res.json(student);
  } catch (error) {
    console.error('Get student error:', error);
    res.status(500).json({ error: 'Failed to fetch student' });
  }
});

/**
 * PUT /api/students/:id
 * Update student information
 */
router.put('/:id', [
  authenticate,
  requireOwnerOrAdmin('id'),
  body('firstName').optional().trim().notEmpty(),
  body('lastName').optional().trim().notEmpty(),
  body('phone').optional().trim().notEmpty(),
  body('address').optional().trim().notEmpty(),
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { firstName, lastName, middleName, phone, address } = req.body;
    
    const student = await prisma.student.update({
      where: { id: req.params.id },
      data: {
        ...(firstName && { firstName }),
        ...(lastName && { lastName }),
        ...(middleName !== undefined && { middleName }),
        ...(phone && { phone }),
        ...(address && { address }),
      },
      include: {
        user: { select: { email: true } },
        guardians: true,
      },
    });

    res.json({ message: 'Student updated successfully', student });
  } catch (error) {
    console.error('Update student error:', error);
    res.status(500).json({ error: 'Failed to update student' });
  }
});

/**
 * PUT /api/students/:id/status
 * Update enrollment status (admin only)
 */
router.put('/:id/status', [
  authenticate,
  requireAdmin,
  body('status').isIn(['PENDING', 'APPROVED', 'REJECTED', 'ENROLLED']),
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { status } = req.body;
    
    const student = await prisma.student.update({
      where: { id: req.params.id },
      data: { enrollmentStatus: status },
      include: { user: true },
    });

    // Send approval/rejection email
    if (status === 'APPROVED' || status === 'REJECTED') {
      try {
        await sendApprovalEmail(
          student.user.email,
          `${student.firstName} ${student.lastName}`,
          status
        );
      } catch (emailError) {
        console.error('Failed to send approval email:', emailError);
      }
    }

    res.json({ message: 'Status updated successfully', student });
  } catch (error) {
    console.error('Update status error:', error);
    res.status(500).json({ error: 'Failed to update status' });
  }
});

export default router;
