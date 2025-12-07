import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { AuthRequest } from '../types';

const JWT_SECRET = process.env.JWT_SECRET || 'dsjfsjdhjdshfjghj234u23i4';

export const authenticate = (req: Request, res: Response, next: NextFunction) => {
  try {
    const header = req.headers.authorization;

    if (!header || !header.startsWith('Bearer ')) {
      return res.status(401).json({
        success: false,
        message: 'Authentication token required',
        errors: 'No token provided'
      });
    }

    const token = header.split(' ')[1];
    const decoded = jwt.verify(token, JWT_SECRET) as {
      id: number;
      email: string;
      role: 'admin' | 'customer';
    };

    (req as AuthRequest).user = decoded;
    next();
  } catch (err) {
    return res.status(401).json({
      success: false,
      message: 'Invalid or expired token',
      errors: 'Authentication failed'
    });
  }
};

export const authorizeAdmin = (req: Request, res: Response, next: NextFunction) => {
  const authReq = req as AuthRequest;

  if (!authReq.user || authReq.user.role !== 'admin') {
    return res.status(403).json({
      success: false,
      message: 'Access denied',
      errors: 'Admin privileges required'
    });
  }

  next();
};

export const authorizeOwnerOrAdmin = (req: Request, res: Response, next: NextFunction) => {
  const authReq = req as AuthRequest;
  const userId = parseInt(req.params.userId);

  if (!authReq.user) {
    return res.status(401).json({
      success: false,
      message: 'Authentication required',
      errors: 'No user information found'
    });
  }

  if (authReq.user.role === 'admin' || authReq.user.id === userId) {
    next();
  } else {
    return res.status(403).json({
      success: false,
      message: 'Access denied',
      errors: 'You can only update your own profile'
    });
  }
};
