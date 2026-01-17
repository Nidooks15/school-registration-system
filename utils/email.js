import nodemailer from 'nodemailer';
import dotenv from 'dotenv';

dotenv.config();

// Create transporter
const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST,
  port: process.env.EMAIL_PORT,
  secure: false, // true for 465, false for other ports
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASSWORD,
  },
});

/**
 * Send registration confirmation email
 */
export const sendRegistrationEmail = async (email, studentName) => {
  try {
    const mailOptions = {
      from: process.env.EMAIL_FROM,
      to: email,
      subject: 'Registration Successful - Welcome!',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #2563eb;">Welcome to Our School!</h2>
          <p>Dear ${studentName},</p>
          <p>Thank you for registering with us. Your registration has been received and is currently under review.</p>
          <p>You will receive another email once your registration has been approved by our admin team.</p>
          <p>In the meantime, you can:</p>
          <ul>
            <li>Upload required documents</li>
            <li>Complete your payment</li>
            <li>Update your personal information</li>
          </ul>
          <p>If you have any questions, please don't hesitate to contact us.</p>
          <br>
          <p>Best regards,<br>School Administration</p>
        </div>
      `
    };

    await transporter.sendMail(mailOptions);
    console.log('Registration email sent to:', email);
  } catch (error) {
    console.error('Error sending registration email:', error);
    throw error;
  }
};

/**
 * Send payment confirmation email
 */
export const sendPaymentConfirmationEmail = async (email, studentName, amount, paymentType, receiptUrl) => {
  try {
    const mailOptions = {
      from: process.env.EMAIL_FROM,
      to: email,
      subject: 'Payment Confirmation - Receipt Attached',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #16a34a;">Payment Successful!</h2>
          <p>Dear ${studentName},</p>
          <p>We have successfully received your payment.</p>
          <div style="background-color: #f3f4f6; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <p><strong>Payment Type:</strong> ${paymentType}</p>
            <p><strong>Amount:</strong> $${amount}</p>
            <p><strong>Status:</strong> <span style="color: #16a34a;">Paid</span></p>
          </div>
          <p>Your receipt has been generated and is available for download in your student dashboard.</p>
          ${receiptUrl ? `<p><a href="${receiptUrl}" style="background-color: #2563eb; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px; display: inline-block;">Download Receipt</a></p>` : ''}
          <p>Thank you for your payment!</p>
          <br>
          <p>Best regards,<br>School Administration</p>
        </div>
      `
    };

    await transporter.sendMail(mailOptions);
    console.log('Payment confirmation email sent to:', email);
  } catch (error) {
    console.error('Error sending payment email:', error);
    throw error;
  }
};

/**
 * Send enrollment approval email
 */
export const sendApprovalEmail = async (email, studentName, status) => {
  const isApproved = status === 'APPROVED';
  
  try {
    const mailOptions = {
      from: process.env.EMAIL_FROM,
      to: email,
      subject: isApproved ? 'Registration Approved!' : 'Registration Status Update',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: ${isApproved ? '#16a34a' : '#dc2626'};">
            Registration ${isApproved ? 'Approved' : 'Update'}
          </h2>
          <p>Dear ${studentName},</p>
          ${isApproved 
            ? `<p>Congratulations! Your registration has been approved.</p>
               <p>You can now proceed with the enrollment process. Please log in to your student dashboard for next steps.</p>`
            : `<p>We regret to inform you that your registration requires additional review.</p>
               <p>Please contact our admissions office for more information.</p>`
          }
          <br>
          <p>Best regards,<br>School Administration</p>
        </div>
      `
    };

    await transporter.sendMail(mailOptions);
    console.log('Approval email sent to:', email);
  } catch (error) {
    console.error('Error sending approval email:', error);
    throw error;
  }
};
