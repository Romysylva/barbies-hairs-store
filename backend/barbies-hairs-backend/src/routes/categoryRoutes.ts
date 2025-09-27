import express from 'express';
import {
  createCategory,
  getCategories,
  getCategoryTree,
  getCategoryById,
  updateCategory,
  deleteCategory,
  getCategory,
} from '../controllers/categoryController.js';

const router = express.Router();

router.post('/', createCategory);
// router.get('/', getCategories);
router.get('/', getCategory);
router.get('/tree', getCategoryTree);
router.get('/:id', getCategoryById);
router.put('/:id', updateCategory);
router.delete('/:id', deleteCategory);

export default router;
