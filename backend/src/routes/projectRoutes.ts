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

// Common validation for link structure
const linkValidation = (field: string) => [
  body(`${field}.url`).optional({ checkFalsy: true }).isURL().withMessage(`Invalid URL format for ${field}`),
  // Require name if URL is present
  body(`${field}.name`).if(body(`${field}.url`).exists({ checkFalsy: true })).trim().notEmpty().withMessage(`${field} name is required when URL is provided`),
  // Allow empty name if URL is also empty/missing
  body(`${field}.name`).optional({ checkFalsy: true }).trim(),
];


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
  body('featured').optional().isBoolean(), // Validate featured field
  ...linkValidation('link1'),
  ...linkValidation('link2'),
];

const updateProjectValidation = [
  body('title').optional().trim().notEmpty().withMessage('Title cannot be empty'),
  body('description').optional().trim().notEmpty().withMessage('Description cannot be empty'),
  body('technologies').optional().isArray().withMessage('Technologies must be an array'),
  body().custom((value) => {
    // For updates, we only validate if either image field is present
    if (value.imageUrl === '' || value.imageData === '') {
      throw new Error('Image URL or data cannot be empty if provided');
    }
    return true;
  }),
  body('date').optional().trim().notEmpty().withMessage('Date cannot be empty'),
  body('featured').optional().isBoolean(), // Validate featured field
  ...linkValidation('link1'),
  ...linkValidation('link2'),
];

router
  .route('/')
  .get(getAllProjects)
  .post(adminAuth, projectValidation, createProject);

router
  .route('/:id')
  .get(getProject)
  .patch(adminAuth, updateProjectValidation, updateProject) // Use PATCH for partial updates
  .delete(adminAuth, deleteProject);

export default router;