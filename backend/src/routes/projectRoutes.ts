import { Router } from 'express';
import { body } from 'express-validator';
import {
  getAllProjects,
  getProject,
  createProject,
  updateProject,
  deleteProject,
} from '../controllers/projectController';
import { adminAuth } from '../middleware/authMiddleware';

const router = Router();

const projectValidation = [
  body('title').trim().notEmpty().withMessage('Title is required'),
  body('description').trim().notEmpty().withMessage('Description is required'),
  body('technologies').isArray().withMessage('Technologies must be an array'),
  body().custom((value) => {
    if (!value.imageUrl && !value.imageData) {
      throw new Error('Either imageUrl or imageData must be provided');
    }
    return true;
  }),
  body('date').trim().notEmpty().withMessage('Date is required'),
];

const updateProjectValidation = [
  body('title').optional().trim().notEmpty().withMessage('Title cannot be empty'),
  body('description').optional().trim().notEmpty().withMessage('Description cannot be empty'),
  body('technologies').optional().isArray().withMessage('Technologies must be an array'),
  body().custom((value) => {
    // For updates, we only validate if either field is present
    if (value.imageUrl === '' || value.imageData === '') {
      throw new Error('Image URL or data cannot be empty if provided');
    }
    return true;
  }),
  body('date').optional().trim().notEmpty().withMessage('Date cannot be empty'),
];

router
  .route('/')
  .get(getAllProjects)
  .post(adminAuth, projectValidation, createProject);

router
  .route('/:id')
  .get(getProject)
  .patch(adminAuth, updateProjectValidation, updateProject)
  .delete(adminAuth, deleteProject);

export default router;
