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


// Updated validation for creating projects
const projectValidation = [
  body('title').trim().notEmpty().withMessage('Title is required'),
  body('thumbnailDescription').optional().trim().isLength({ max: 150 }).withMessage('Thumbnail description max 150 chars'),
  body('description').trim().notEmpty().withMessage('Description is required'),
  body('technologies').isArray({ min: 1 }).withMessage('At least one technology is required'),
  // Validate images array
  body('images')
    .isArray({ min: 1, max: 3 })
    .withMessage('Please provide between 1 and 3 images for the project.')
    .custom((images) => {
        if (!Array.isArray(images)) return false; // Ensure it's an array
        // Basic check: Ensure all elements are non-empty strings (URLs or base64)
        return images.every(img => typeof img === 'string' && img.trim().length > 0);
    }).withMessage('Invalid image data format.'),
  body('date').trim().notEmpty().withMessage('Date is required'),
  body('featured').optional().isBoolean(),
  ...linkValidation('link1'),
  ...linkValidation('link2'),
];

// Updated validation for updating projects
const updateProjectValidation = [
  body('title').optional().trim().notEmpty().withMessage('Title cannot be empty'),
  body('thumbnailDescription').optional({ nullable: true }).trim().isLength({ max: 150 }).withMessage('Thumbnail description max 150 chars'),
  body('description').optional().trim().notEmpty().withMessage('Description cannot be empty'),
  body('technologies').optional().isArray().withMessage('Technologies must be an array'),
  // Validate images array if present
  body('images')
    .optional()
    .isArray({ min: 1, max: 3 }) // Must have 1-3 images if the field is included in the update
    .withMessage('If updating images, provide between 1 and 3 images.')
    .custom((images) => {
        if (!Array.isArray(images)) return false;
        return images.every(img => typeof img === 'string' && img.trim().length > 0);
    }).withMessage('Invalid image data format.'),
  body('date').optional().trim().notEmpty().withMessage('Date cannot be empty'),
  body('featured').optional().isBoolean(),
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