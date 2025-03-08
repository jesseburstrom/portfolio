import { Request, Response, NextFunction } from 'express';
import { validationResult } from 'express-validator';
import AboutMe, { IAboutMe } from '../models/AboutMe';
import { AppError, catchAsync } from '../utils/errorHandler';

// Get about info (always returns the first document as there should only be one)
export const getAboutMe = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
  const about = await AboutMe.findOne();
  
  if (!about) {
    return next(new AppError('About information not found', 404));
  }

  res.status(200).json({
    status: 'success',
    data: about,
  });
});

// Create or update about info
export const updateAboutMe = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return next(new AppError(errors.array()[0].msg, 400));
  }

  // Use findOneAndUpdate with upsert to create if doesn't exist
  const about = await AboutMe.findOneAndUpdate(
    {},
    req.body,
    {
      new: true,
      runValidators: true,
      upsert: true,
      setDefaultsOnInsert: true,
    }
  );

  res.status(200).json({
    status: 'success',
    data: about,
  });
});
