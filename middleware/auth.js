import jwt from 'jsonwebtoken';
import { prisma } from '../server.js';

// Verify JWT token
export const authenticate = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'No token provided' });
    }

    const token = authHeader.substring(7);
    
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    const user = await prisma.user.findUnique({
      where: { id: decoded.userId },
      include: { student: true }
    });

    if (!user) {
      return res.status(401).json({ error: 'User not found' });
    }

    req.user = user;
    next();
  } catch (error) {
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({ error: 'Invalid token' });
    }
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({ error: 'Token expired' });
    }
    return res.status(500).json({ error: 'Authentication failed' });
  }
};

// Check if user is admin
export const requireAdmin = (req, res, next) => {
  if (req.user.role !== 'ADMIN') {
    return res.status(403).json({ error: 'Admin access required' });
  }
  next();
};

// Check if user is student or admin
export const requireStudent = (req, res, next) => {
  if (req.user.role !== 'STUDENT' && req.user.role !== 'ADMIN') {
    return res.status(403).json({ error: 'Student access required' });
  }
  next();
};

// Check if user owns the resource or is admin
export const requireOwnerOrAdmin = (resourceIdParam = 'id') => {
  return (req, res, next) => {
    const resourceId = req.params[resourceIdParam];
    
    if (req.user.role === 'ADMIN') {
      return next();
    }
    
    if (req.user.student && req.user.student.id === resourceId) {
      return next();
    }
    
    return res.status(403).json({ error: 'Access denied' });
  };
};
