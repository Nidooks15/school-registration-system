import express from 'express';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { body, validationResult } from 'express-validator';
import { prisma } from '../server.js';
import { authenticate } from '../middleware/auth.js';
import { sendRegistrationEmail } from '../utils/email.js';

const router = express.Router();

/**
 * POST /api/auth/register
 * Register a new student
 */
router.post('/register', [
  body('email').isEmail().withMessage('Invalid email address').normalizeEmail(),
  body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters long'),
  body('firstName').trim().notEmpty().withMessage('First name is required'),
  body('lastName').trim().notEmpty().withMessage('Last name is required'),
  body('dateOfBirth').isISO8601().withMessage('Invalid date of birth format'),
  body('gender').isIn(['MALE', 'FEMALE', 'OTHER']).withMessage('Invalid gender'),
  body('address').trim().notEmpty().withMessage('Address is required'),
  body('phone').trim().notEmpty().withMessage('Phone number is required'),
  body('gradeLevel').trim().notEmpty().withMessage('Grade level is required'),
  body('academicYear').trim().notEmpty().withMessage('Academic year is required'),
  body('guardian.firstName').trim().notEmpty().withMessage('Guardian first name is required'),
  body('guardian.lastName').trim().notEmpty().withMessage('Guardian last name is required'),
  body('guardian.relationship').trim().notEmpty().withMessage('Guardian relationship is required'),
  body('guardian.phone').trim().notEmpty().withMessage('Guardian phone number is required'),
  body('guardian.email').isEmail().withMessage('Invalid guardian email address').normalizeEmail(),
  body('guardian.address').trim().notEmpty().withMessage('Guardian address is required'),
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      console.log('Validation errors:', JSON.stringify(errors.array(), null, 2));
      return res.status(400).json({ errors: errors.array() });
    }

    const { email, password, guardian, ...studentData } = req.body;

    // Check if email already exists
    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) {
      return res.status(400).json({ error: 'Email already registered' });
    }

    // Hash password
    const passwordHash = await bcrypt.hash(password, 10);

    // Create user and student in a transaction
    const result = await prisma.$transaction(async (tx) => {
      const user = await tx.user.create({
        data: {
          email,
          passwordHash,
          role: 'STUDENT',
        },
      });

      const student = await tx.student.create({
        data: {
          userId: user.id,
          ...studentData,
          dateOfBirth: new Date(studentData.dateOfBirth),
        },
      });

      // Create guardian
      await tx.guardian.create({
        data: {
          studentId: student.id,
          ...guardian,
        },
      });

      return { user, student };
    });

    // Send registration email
    try {
      await sendRegistrationEmail(email, `${studentData.firstName} ${studentData.lastName}`);
    } catch (emailError) {
      console.error('Failed to send registration email:', emailError);
    }

    // Generate JWT token
    const token = jwt.sign(
      { userId: result.user.id, role: result.user.role },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
    );

    res.status(201).json({
      message: 'Registration successful',
      token,
      user: {
        id: result.user.id,
        email: result.user.email,
        role: result.user.role,
        studentId: result.student.id,
      },
    });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ error: 'Registration failed' });
  }
});

/**
 * POST /api/auth/login
 * Login user (student or admin)
 */
router.post('/login', [
  body('email').isEmail().normalizeEmail(),
  body('password').notEmpty(),
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { email, password } = req.body;

    // Find user
    const user = await prisma.user.findUnique({
      where: { email },
      include: { student: true },
    });

    if (!user) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    // Verify password
    const isValidPassword = await bcrypt.compare(password, user.passwordHash);
    if (!isValidPassword) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    // Generate JWT token
    const token = jwt.sign(
      { userId: user.id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
    );

    res.json({
      message: 'Login successful',
      token,
      user: {
        id: user.id,
        email: user.email,
        role: user.role,
        studentId: user.student?.id,
      },
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Login failed' });
  }
});

/**
 * GET /api/auth/me
 * Get current user info
 */
router.get('/me', authenticate, async (req, res) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.user.id },
      include: {
        student: {
          include: {
            guardians: true,
            documents: true,
            payments: true,
          },
        },
      },
    });

    res.json({
      id: user.id,
      email: user.email,
      role: user.role,
      student: user.student,
    });
  } catch (error) {
    console.error('Get user error:', error);
    res.status(500).json({ error: 'Failed to fetch user data' });
  }
});

export default router;
