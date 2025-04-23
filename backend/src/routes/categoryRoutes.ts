import { Router } from 'express';
import { body } from 'express-validator';
import * as categoryController from '../controllers/categoryController';
import { adminAuth } from '../middleware/authMiddleware';

const router = Router();

const categoryKeyRegex = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

// Validation for creating
const createCategoryValidation = [
    body('key')
        .trim()
        .notEmpty().withMessage('Key is required')
        .isLowercase().withMessage('Key must be lowercase')
        .matches(categoryKeyRegex).withMessage('Key must be alphanumeric with hyphens only'),
    body('displayName').trim().notEmpty().withMessage('Display name is required'),
    body('order').optional().isInt({ min: 0 }).withMessage('Order must be a positive integer')
];

// Validation for updating (don't validate 'key' as it shouldn't be changed here)
 const updateCategoryValidation = [
    body('displayName').optional().trim().notEmpty().withMessage('Display name cannot be empty'),
    body('order').optional().isInt({ min: 0 }).withMessage('Order must be a positive integer')
];

// Public route to get all categories (for dropdowns)
router.get('/', categoryController.getAllCategories);

// Admin routes
router.post('/', adminAuth, createCategoryValidation, categoryController.createCategory);

router.route('/:id')
    .get(categoryController.getCategory) // Can be public or admin-only
    .patch(adminAuth, updateCategoryValidation, categoryController.updateCategory)
    .delete(adminAuth, categoryController.deleteCategory);

export default router;