import { Request, Response, NextFunction } from 'express';
import { AppError } from '../utils/errorHandler';
import jwt from 'jsonwebtoken';

export interface AuthRequest extends Request {
  isAdmin?: boolean;
}

export const adminAuth = (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    
    if (!token) {
      throw new AppError('No authentication token provided', 401);
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key');
    req.isAdmin = true;
    next();
  } catch (error) {
    next(new AppError('Not authorized as admin', 401));
  }
};
