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

const router = Router();

const skillValidation = [
  body('name').trim().notEmpty().withMessage('Name is required'),
  body('category')
    .isIn(['frontend', 'backend', 'tools', 'other'])
    .withMessage('Invalid category'),
  body('proficiency')
    .isInt({ min: 1, max: 5 })
    .withMessage('Proficiency must be between 1 and 5'),
];

router
  .route('/')
  .get(getAllSkills)
  .post(adminAuth, skillValidation, createSkill);

router
  .route('/:id')
  .get(getSkill)
  .patch(adminAuth, skillValidation, updateSkill)
  .delete(adminAuth, deleteSkill);

export default router;
