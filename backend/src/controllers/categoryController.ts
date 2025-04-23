import { Request, Response, NextFunction } from 'express';
import Category from '../models/Category';
import Skill from '../models/Skill'; // Needed for delete check
import { AppError, catchAsync } from '../utils/errorHandler';
import { validationResult } from 'express-validator';

// Get all categories, sorted by order then displayName
export const getAllCategories = catchAsync(async (req: Request, res: Response) => {
  const categories = await Category.find().sort({ order: 1, displayName: 1 });
  res.status(200).json({
    status: 'success',
    data: categories,
  });
});

// Get single category
export const getCategory = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
    const category = await Category.findById(req.params.id);
    if (!category) {
        return next(new AppError('Category not found', 404));
    }
    res.status(200).json({ status: 'success', data: category });
});

// Create category
export const createCategory = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return next(new AppError(errors.array()[0].msg, 400));
  }
  const newCategory = await Category.create(req.body);
  res.status(201).json({
    status: 'success',
    data: newCategory,
  });
});

// Update category (mainly displayName and order)
export const updateCategory = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return next(new AppError(errors.array()[0].msg, 400));
  }

  // Prevent changing the 'key' easily after creation
  const { key, ...updateData } = req.body;
  if (key) {
      console.warn(`Attempt to update category key for ID ${req.params.id} ignored.`);
  }


  const category = await Category.findByIdAndUpdate(req.params.id, updateData, {
    new: true,
    runValidators: true,
  });

  if (!category) {
    return next(new AppError('Category not found', 404));
  }

  res.status(200).json({
    status: 'success',
    data: category,
  });
});

// Delete category (Check if skills are using it first)
export const deleteCategory = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
   // Check if any skills reference this category
   const skillsUsingCategory = await Skill.countDocuments({ category: req.params.id });
   if (skillsUsingCategory > 0) {
       return next(new AppError(`Cannot delete category: ${skillsUsingCategory} skill(s) are using it. Please reassign skills first.`, 400));
   }

   const category = await Category.findByIdAndDelete(req.params.id);

   if (!category) {
       return next(new AppError('Category not found', 404));
   }

   res.status(204).json({
       status: 'success',
       data: null,
   });
});