import PDFDocument from 'pdfkit';
import { uploadToCloudinary } from './cloudinary.js';

/**
 * Generate payment receipt PDF
 */
export const generateReceipt = async (paymentData, studentData) => {
  return new Promise((resolve, reject) => {
    try {
      const doc = new PDFDocument({ margin: 50 });
      const chunks = [];

      // Collect PDF data
      doc.on('data', chunk => chunks.push(chunk));
      doc.on('end', async () => {
        const pdfBuffer = Buffer.concat(chunks);
        
        // Upload to Cloudinary
        try {
          const result = await uploadToCloudinary(pdfBuffer, 'receipts', 'raw');
          resolve(result.secure_url);
        } catch (uploadError) {
          reject(uploadError);
        }
      });

      // Header
      doc.fontSize(24)
         .font('Helvetica-Bold')
         .text('PAYMENT RECEIPT', { align: 'center' });
      
      doc.moveDown();
      doc.fontSize(10)
         .font('Helvetica')
         .text('School Registration System', { align: 'center' });
      
      doc.moveDown(2);

      // Receipt details
      doc.fontSize(12)
         .font('Helvetica-Bold')
         .text('Receipt Information', { underline: true });
      
      doc.moveDown(0.5);
      doc.font('Helvetica');
      
      const receiptInfo = [
        ['Receipt ID:', paymentData.id],
        ['Date:', new Date(paymentData.createdAt).toLocaleDateString()],
        ['Payment Status:', paymentData.paymentStatus],
      ];

      receiptInfo.forEach(([label, value]) => {
        doc.text(label, 50, doc.y, { continued: true, width: 150 })
           .text(value, 200);
      });

      doc.moveDown(2);

      // Student details
      doc.fontSize(12)
         .font('Helvetica-Bold')
         .text('Student Information', { underline: true });
      
      doc.moveDown(0.5);
      doc.font('Helvetica');
      
      const studentInfo = [
        ['Name:', `${studentData.firstName} ${studentData.lastName}`],
        ['Student ID:', studentData.id],
        ['Grade Level:', studentData.gradeLevel],
        ['Academic Year:', studentData.academicYear],
      ];

      studentInfo.forEach(([label, value]) => {
        doc.text(label, 50, doc.y, { continued: true, width: 150 })
           .text(value, 200);
      });

      doc.moveDown(2);

      // Payment details
      doc.fontSize(12)
         .font('Helvetica-Bold')
         .text('Payment Details', { underline: true });
      
      doc.moveDown(0.5);
      doc.font('Helvetica');
      
      const paymentInfo = [
        ['Payment Type:', paymentData.paymentType.replace(/_/g, ' ')],
        ['Payment Method:', paymentData.paymentMethod],
        ['Amount:', `$${parseFloat(paymentData.amount).toFixed(2)}`],
      ];

      paymentInfo.forEach(([label, value]) => {
        doc.text(label, 50, doc.y, { continued: true, width: 150 })
           .text(value, 200);
      });

      doc.moveDown(3);

      // Amount box
      doc.rect(50, doc.y, 500, 60)
         .stroke();
      
      doc.fontSize(14)
         .font('Helvetica-Bold')
         .text('TOTAL AMOUNT PAID', 60, doc.y + 10);
      
      doc.fontSize(20)
         .text(`₱${parseFloat(paymentData.amount).toFixed(2)}`, 60, doc.y + 10);

      doc.moveDown(4);

      // Footer
      doc.fontSize(10)
         .font('Helvetica-Oblique')
         .text('This is a computer-generated receipt and does not require a signature.', 
               { align: 'center' });
      
      doc.moveDown();
      doc.text('Thank you for your payment!', { align: 'center' });

      // Finalize PDF
      doc.end();
    } catch (error) {
      reject(error);
    }
  });
};
