import express from 'express';
import { 
  getExperiences, 
  getExperience, 
  createExperience, 
  updateExperience, 
  deleteExperience 
} from '../controllers/experienceController';
import { adminAuth } from '../middleware/authMiddleware';

const router = express.Router();

// Public routes
router.get('/', getExperiences);
router.get('/:id', getExperience);

// Protected routes (admin only)
router.post('/', adminAuth, createExperience);
router.put('/:id', adminAuth, updateExperience);
router.delete('/:id', adminAuth, deleteExperience);

export default router;
