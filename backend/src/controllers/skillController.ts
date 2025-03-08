import { Request, Response, NextFunction } from 'express';
import { validationResult } from 'express-validator';
import Skill, { ISkill } from '../models/Skill';
import { AppError, catchAsync } from '../utils/errorHandler';

// Get all skills
export const getAllSkills = catchAsync(async (req: Request, res: Response) => {
  const skills = await Skill.find();
  res.status(200).json(skills);
});

// Get single skill
export const getSkill = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
  const skill = await Skill.findById(req.params.id);
  
  if (!skill) {
    return next(new AppError('Skill not found', 404));
  }

  res.status(200).json(skill);
});

// Create skill
export const createSkill = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return next(new AppError(errors.array()[0].msg, 400));
  }

  const skill = await Skill.create(req.body);
  res.status(201).json(skill);
});

// Update skill
export const updateSkill = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return next(new AppError(errors.array()[0].msg, 400));
  }

  const skill = await Skill.findByIdAndUpdate(
    req.params.id,
    req.body,
    {
      new: true,
      runValidators: true,
    }
  );

  if (!skill) {
    return next(new AppError('Skill not found', 404));
  }

  res.status(200).json(skill);
});

// Delete skill
export const deleteSkill = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
  const skill = await Skill.findByIdAndDelete(req.params.id);

  if (!skill) {
    return next(new AppError('Skill not found', 404));
  }

  res.status(204).send();
});
