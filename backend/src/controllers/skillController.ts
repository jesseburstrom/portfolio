import { Request, Response, NextFunction } from 'express';
import { validationResult } from 'express-validator';
import Skill from '../models/Skill'; // ISkill now has category reference
import Category from '../models/Category'; // Import Category model
import { AppError, catchAsync } from '../utils/errorHandler';

// Get all skills and POPULATE category details
export const getAllSkills = catchAsync(async (req: Request, res: Response) => {
  const skills = await Skill.find().populate({
      path: 'category', // field in Skill model
      select: 'key displayName order' // fields to select from Category model
  });
  res.status(200).json(skills); // Return the array directly
});

// Get single skill (also populate)
export const getSkill = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
  const skill = await Skill.findById(req.params.id).populate({
      path: 'category',
      select: 'key displayName order'
  });

  if (!skill) {
    return next(new AppError('Skill not found', 404));
  }

  res.status(200).json(skill); // Return the object directly
});

// Create skill - expects category ID
export const createSkill = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return next(new AppError(errors.array()[0].msg, 400));
  }

  // Check if category exists
  const categoryExists = await Category.findById(req.body.category);
  if (!categoryExists) {
      return next(new AppError('Invalid category reference provided.', 400));
  }

  // Create skill with the category ID
  const skill = await Skill.create({
      name: req.body.name,
      category: req.body.category // Store the ID
  });

  // Populate the created skill before sending response
  const populatedSkill = await Skill.findById(skill._id).populate({
      path: 'category',
      select: 'key displayName order'
  });

  res.status(201).json(populatedSkill); // Return the populated skill
});

// Update skill - expects category ID if category is being changed
export const updateSkill = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return next(new AppError(errors.array()[0].msg, 400));
  }

  // If category is being updated, check if the new one exists
  if (req.body.category) {
      const categoryExists = await Category.findById(req.body.category);
       if (!categoryExists) {
           return next(new AppError('Invalid category reference provided for update.', 400));
       }
  }

  const skill = await Skill.findByIdAndUpdate(
    req.params.id,
    req.body, // Contains name and/or category ID
    {
      new: true,
      runValidators: true,
    }
  );

  if (!skill) {
    return next(new AppError('Skill not found', 404));
  }

   // Populate the updated skill before sending response
   const populatedSkill = await Skill.findById(skill._id).populate({
       path: 'category',
       select: 'key displayName order'
   });

  res.status(200).json(populatedSkill); // Return the populated skill
});

// Delete skill (no changes needed here)
export const deleteSkill = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
  const skill = await Skill.findByIdAndDelete(req.params.id);

  if (!skill) {
    return next(new AppError('Skill not found', 404));
  }

  res.status(204).send();
});