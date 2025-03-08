import { Router } from 'express';
import { body } from 'express-validator';
import {
  getAboutMe,
  updateAboutMe,
} from '../controllers/aboutController';
import { adminAuth } from '../middleware/authMiddleware';

const router = Router();

const aboutValidation = [
  body('name').trim().notEmpty().withMessage('Name is required'),
  body('title').trim().notEmpty().withMessage('Title is required'),
  body('bio').trim().notEmpty().withMessage('Bio is required'),
  body('location').trim().notEmpty().withMessage('Location is required'),
  body('email')
    .trim()
    .notEmpty()
    .withMessage('Email is required')
    .isEmail()
    .withMessage('Invalid email format'),
  body('socialLinks.github').optional().isURL().withMessage('Invalid GitHub URL'),
  body('socialLinks.linkedin').optional().isURL().withMessage('Invalid LinkedIn URL'),
  body('socialLinks.twitter').optional().isURL().withMessage('Invalid Twitter URL'),
];

router
  .route('/')
  .get(getAboutMe)
  .put(adminAuth, aboutValidation, updateAboutMe);

export default router;
