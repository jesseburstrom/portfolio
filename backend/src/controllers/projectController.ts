import { Request, Response, NextFunction } from 'express';
import { validationResult } from 'express-validator';
import Project, { IProject } from '../models/Project';
import { AppError, catchAsync } from '../utils/errorHandler';

// Get all projects
export const getAllProjects = catchAsync(async (req: Request, res: Response) => {
  const projects = await Project.find().sort({ date: -1 });
  res.status(200).json({
    status: 'success',
    data: projects,
  });
});

// Get single project
export const getProject = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
  const project = await Project.findById(req.params.id);
  
  if (!project) {
    return next(new AppError('Project not found', 404));
  }

  res.status(200).json({
    status: 'success',
    data: project,
  });
});

// Create project
export const createProject = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return next(new AppError(errors.array()[0].msg, 400));
  }

  const project = await Project.create(req.body);
  res.status(201).json({
    status: 'success',
    data: project,
  });
});

// Update project
export const updateProject = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return next(new AppError(errors.array()[0].msg, 400));
  }

  const project = await Project.findByIdAndUpdate(
    req.params.id,
    req.body,
    {
      new: true,
      runValidators: true,
    }
  );

  if (!project) {
    return next(new AppError('Project not found', 404));
  }

  res.status(200).json({
    status: 'success',
    data: project,
  });
});

// Delete project
export const deleteProject = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
  const project = await Project.findByIdAndDelete(req.params.id);

  if (!project) {
    return next(new AppError('Project not found', 404));
  }

  res.status(204).json({
    status: 'success',
    data: null,
  });
});
