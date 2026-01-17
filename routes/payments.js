import express from 'express';
import Stripe from 'stripe';
import { body, validationResult } from 'express-validator';
import { prisma } from '../server.js';
import { authenticate, requireAdmin, requireOwnerOrAdmin } from '../middleware/auth.js';
import { generateReceipt } from '../utils/pdf.js';
import { sendPaymentConfirmationEmail } from '../utils/email.js';

const router = express.Router();
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

/**
 * POST /api/payments/create-intent
 * Create Stripe payment intent
 */
router.post('/create-intent', [
  authenticate,
  body('studentId').notEmpty().withMessage('Student ID is required'),
  body('amount').isFloat({ min: 0.5 }).withMessage('Amount must be at least $0.50'),
  body('paymentType').isIn(['REGISTRATION_FEE', 'TUITION_DOWN_PAYMENT']).withMessage('Invalid payment type'),
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      console.log('Payment validation errors:', JSON.stringify(errors.array(), null, 2));
      return res.status(400).json({ errors: errors.array() });
    }

    if (!process.env.STRIPE_SECRET_KEY || process.env.STRIPE_SECRET_KEY === 'sk_test_placeholder') {
      console.error('STRIPE_SECRET_KEY is not configured correctly in Railway');
      return res.status(500).json({ error: 'Payment system is not configured. Please check STRIPE_SECRET_KEY in Railway.' });
    }

    const { studentId, amount, paymentType } = req.body;

    // Verify student ownership or admin
    const student = await prisma.student.findUnique({
      where: { id: studentId },
      include: { user: true },
    });

    if (!student) {
      return res.status(404).json({ error: 'Student not found' });
    }

    if (req.user.role !== 'ADMIN' && req.user.student?.id !== studentId) {
      return res.status(403).json({ error: 'Access denied' });
    }

    // Create payment record
    const payment = await prisma.payment.create({
      data: {
        studentId,
        amount,
        paymentType,
        paymentMethod: 'STRIPE',
        paymentStatus: 'PENDING',
      },
    });

    // Create Stripe payment intent
    try {
      console.log(`Creating payment intent for student: ${studentId}, amount: ${amount}`);
      const paymentIntent = await stripe.paymentIntents.create({
        amount: Math.round(parseFloat(amount) * 100), // Convert to cents
        currency: 'usd',
        metadata: {
          paymentId: payment.id,
          studentId,
          studentName: `${student.firstName} ${student.lastName}`,
        },
      });

      // Update payment with Stripe intent ID
      await prisma.payment.update({
        where: { id: payment.id },
        data: { stripePaymentIntentId: paymentIntent.id },
      });

      console.log(`Payment intent created: ${paymentIntent.id}`);
      res.json({
        clientSecret: paymentIntent.client_secret,
        paymentId: payment.id,
      });
    } catch (stripeError) {
      console.error('Stripe error creating intent:', stripeError);
      res.status(400).json({ error: stripeError.message || 'Failed to create payment intent' });
    }
  } catch (error) {
    console.error('Create payment intent error:', error);
    res.status(500).json({ error: 'Failed to create payment intent' });
  }
});

/**
 * POST /api/payments/confirm
 * Confirm payment and generate receipt
 */
router.post('/confirm', [
  authenticate,
  body('paymentId').notEmpty(),
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { paymentId } = req.body;

    const payment = await prisma.payment.findUnique({
      where: { id: paymentId },
      include: {
        student: {
          include: { user: true },
        },
      },
    });

    if (!payment) {
      return res.status(404).json({ error: 'Payment not found' });
    }

    // Verify ownership or admin
    if (req.user.role !== 'ADMIN' && req.user.student?.id !== payment.studentId) {
      return res.status(403).json({ error: 'Access denied' });
    }

    // Verify payment with Stripe
    if (payment.stripePaymentIntentId) {
      console.log(`Verifying payment intent: ${payment.stripePaymentIntentId}`);
      const paymentIntent = await stripe.paymentIntents.retrieve(payment.stripePaymentIntentId);
      console.log(`Payment intent status: ${paymentIntent.status}`);
      
      if (paymentIntent.status !== 'succeeded') {
        console.warn(`Payment not completed. Status: ${paymentIntent.status}`);
        return res.status(400).json({ error: `Payment not completed (Status: ${paymentIntent.status})` });
      }
    }

    // Generate receipt PDF
    console.log(`Generating receipt for payment: ${paymentId}`);
    const receiptUrl = await generateReceipt(payment, payment.student);

    // Update payment status
    const updatedPayment = await prisma.payment.update({
      where: { id: paymentId },
      data: {
        paymentStatus: 'PAID',
        paidAt: new Date(),
        receiptUrl,
      },
    });

    console.log(`Payment confirmed and marked as PAID: ${paymentId}`);
    // Send confirmation email
    try {
      await sendPaymentConfirmationEmail(
        payment.student.user.email,
        `${payment.student.firstName} ${payment.student.lastName}`,
        payment.amount.toString(),
        payment.paymentType.replace(/_/g, ' '),
        receiptUrl
      );
    } catch (emailError) {
      console.error('Failed to send payment confirmation email:', emailError);
    }

    res.json({
      message: 'Payment confirmed successfully',
      payment: updatedPayment,
    });
  } catch (error) {
    console.error('Confirm payment error:', error);
    res.status(500).json({ error: 'Failed to confirm payment' });
  }
});

/**
 * GET /api/payments/student/:studentId
 * Get payment history for a student
 */
router.get('/student/:studentId', authenticate, requireOwnerOrAdmin('studentId'), async (req, res) => {
  try {
    const payments = await prisma.payment.findMany({
      where: { studentId: req.params.studentId },
      orderBy: { createdAt: 'desc' },
    });

    res.json(payments);
  } catch (error) {
    console.error('Get payments error:', error);
    res.status(500).json({ error: 'Failed to fetch payments' });
  }
});

/**
 * GET /api/payments/:id/receipt
 * Get payment receipt URL
 */
router.get('/:id/receipt', authenticate, async (req, res) => {
  try {
    const payment = await prisma.payment.findUnique({
      where: { id: req.params.id },
    });

    if (!payment) {
      return res.status(404).json({ error: 'Payment not found' });
    }

    // Verify ownership or admin
    if (req.user.role !== 'ADMIN' && req.user.student?.id !== payment.studentId) {
      return res.status(403).json({ error: 'Access denied' });
    }

    if (!payment.receiptUrl) {
      return res.status(404).json({ error: 'Receipt not available' });
    }

    res.json({ receiptUrl: payment.receiptUrl });
  } catch (error) {
    console.error('Get receipt error:', error);
    res.status(500).json({ error: 'Failed to fetch receipt' });
  }
});

/**
 * GET /api/payments
 * Get all payments (admin only)
 */
router.get('/', authenticate, requireAdmin, async (req, res) => {
  try {
    const { status, page = 1, limit = 20 } = req.query;
    
    const where = {};
    if (status) {
      where.paymentStatus = status;
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);
    
    const [payments, total] = await Promise.all([
      prisma.payment.findMany({
        where,
        include: {
          student: {
            select: {
              firstName: true,
              lastName: true,
              gradeLevel: true,
            },
          },
        },
        skip,
        take: parseInt(limit),
        orderBy: { createdAt: 'desc' },
      }),
      prisma.payment.count({ where }),
    ]);

    res.json({
      payments,
      pagination: {
        total,
        page: parseInt(page),
        limit: parseInt(limit),
        totalPages: Math.ceil(total / parseInt(limit)),
      },
    });
  } catch (error) {
    console.error('Get all payments error:', error);
    res.status(500).json({ error: 'Failed to fetch payments' });
  }
});

export default router;
