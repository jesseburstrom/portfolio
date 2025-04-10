import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { AppError, catchAsync } from '../utils/errorHandler';

export const login = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
  const { username, password } = req.body;
  
   // --- DEBUGGING ---
   console.log('Login Attempt:', { username, password });
   console.log('Env Vars:', {
       ADMIN_USERNAME: process.env.ADMIN_USERNAME,
       ADMIN_PASSWORD: process.env.ADMIN_PASSWORD
   });
   // --- END DEBUGGING ---
   
  // Compare with environment variables for admin credentials
  if (username === process.env.ADMIN_USERNAME && 
      password === process.env.ADMIN_PASSWORD) {
    
    const token = jwt.sign(
      { isAdmin: true },
      process.env.JWT_SECRET || 'your-secret-key',
      { expiresIn: '24h' }
    );

    res.status(200).json({
      status: 'success',
      token
    });
  } else {
    return next(new AppError('Invalid credentials', 401));
  }
});
