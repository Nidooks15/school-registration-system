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

      // --- Official Header ---
      doc.rect(50, 50, 500, 80).fill('#f8fafc');
      doc.fillColor('#0f172a');
      
      doc.fontSize(20)
         .font('Helvetica-Bold')
         .text('OFFICIAL PAYMENT RECEIPT', 50, 70, { align: 'center' });
      
      doc.fontSize(10)
         .font('Helvetica')
         .text('SCHOOL REGISTRATION SYSTEM', { align: 'center' })
         .text('Electronic Document • Secure Transaction', { align: 'center' });
      
      doc.moveDown(4);

      // --- Horizontal Divider ---
      doc.moveTo(50, 140)
         .lineTo(550, 140)
         .strokeColor('#cbd5e1')
         .stroke();

      doc.moveDown(2);

      // --- Info Sections ---
      const drawSection = (title, data, yOffset) => {
        doc.fontSize(11)
           .font('Helvetica-Bold')
           .fillColor('#475569')
           .text(title.toUpperCase(), 50, yOffset);
        
        doc.moveTo(50, yOffset + 15)
           .lineTo(200, yOffset + 15)
           .stroke();

        let currentY = yOffset + 25;
        doc.font('Helvetica').fillColor('#1e293b').fontSize(10);
        
        data.forEach(([label, value]) => {
          doc.font('Helvetica-Bold').text(label, 70, currentY, { width: 120 })
             .font('Helvetica').text(value, 200, currentY);
          currentY += 18;
        });
        
        return currentY;
      };

      let yPos = 160;

      // Receipt Details
      yPos = drawSection('Transaction Info', [
        ['Receipt No:', paymentData.id],
        ['Date Issued:', new Date(paymentData.createdAt).toLocaleDateString('en-US', { 
            year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' 
        })],
        ['Status:', 'PAID / SETTLED'],
        ['Gateway:', 'STRIPE SECURE'],
      ], yPos);

      yPos += 20;

      // Student Details
      yPos = drawSection('Student Details', [
        ['Full Name:', `${studentData.firstName} ${studentData.lastName}`],
        ['Student ID:', studentData.id],
        ['Grade Level:', studentData.gradeLevel],
        ['Academic Year:', studentData.academicYear],
      ], yPos);

      yPos += 20;

      // Payment Details
      yPos = drawSection('Payment Breakdown', [
        ['Description:', paymentData.paymentType.replace(/_/g, ' ')],
        ['Payment Method:', 'CREDIT/DEBIT CARD'],
        ['Base Amount:', `$${parseFloat(paymentData.amount).toFixed(2)} USD`],
      ], yPos);

      // --- Grand Total Box ---
      const boxTop = yPos + 30;
      doc.rect(50, boxTop, 500, 50)
         .fill('#f1f5f9');
      
      doc.font('Helvetica-Bold')
         .fontSize(12)
         .fillColor('#0f172a')
         .text('TOTAL AMOUNT PAID', 70, boxTop + 18);
      
      doc.fontSize(18)
         .text(`$${parseFloat(paymentData.amount).toFixed(2)}`, 350, boxTop + 15, { align: 'right', width: 180 });

      // --- Security / Signature Area ---
      const footerTop = 650;
      
      doc.moveTo(50, footerTop)
         .lineTo(220, footerTop)
         .strokeColor('#94a3b8')
         .stroke();
      
      doc.fontSize(9)
         .font('Helvetica-Bold')
         .fillColor('#64748b')
         .text('OFFICIAL REGISTRAR', 50, footerTop + 5, { width: 170, align: 'center' })
         .text('(System Verified Digitally)', 50, footerTop + 18, { width: 170, align: 'center', font: 'Helvetica-Oblique' });

      // Footer Note
      doc.fontSize(8)
         .font('Helvetica')
         .fillColor('#94a3b8')
         .text('This is an official computer-generated receipt issued by the School Registration System.', 50, 720, { align: 'center' })
         .text('No physical signature is required for this digital document to be valid.', { align: 'center' });

      // Finalize PDF
      doc.end();
    } catch (error) {
      reject(error);
    }
  });
};
