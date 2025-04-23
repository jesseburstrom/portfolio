import { Router } from 'express';
import { body } from 'express-validator';
import {
  getAllSkills,
  getSkill,
  createSkill,
  updateSkill,
  deleteSkill,
} from '../controllers/skillController';
import { adminAuth } from '../middleware/authMiddleware';
import { isValidObjectId } from 'mongoose'; // Import helper

const router = Router();

// Updated validation
const skillValidation = [
  body('name').trim().notEmpty().withMessage('Name is required'),
  // Validate 'category' as a required MongoDB ObjectId
  body('category')
    .notEmpty().withMessage('Category reference is required')
    .custom((value) => {
        if (!isValidObjectId(value)) {
            throw new Error('Invalid Category ID format');
        }
        return true;
     }),
];

// Validation for updates (fields are optional)
const updateSkillValidation = [
  body('name').optional().trim().notEmpty().withMessage('Name cannot be empty'),
  body('category')
      .optional()
      .custom((value) => {
           if (!isValidObjectId(value)) {
               throw new Error('Invalid Category ID format');
           }
           return true;
      }),
];

router
  .route('/')
  .get(getAllSkills)
  .post(adminAuth, skillValidation, createSkill); // Use updated validation

router
  .route('/:id')
  .get(getSkill)
  // Apply validation partially for updates if needed, or use full validation
  .patch(adminAuth, updateSkillValidation, updateSkill)
  .delete(adminAuth, deleteSkill);

export default router;