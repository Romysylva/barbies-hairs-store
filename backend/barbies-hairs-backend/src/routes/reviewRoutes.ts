import express from 'express';
import { protect } from '../middlewares/authmiddleware.js';
import {
  createReview,
  getProductReviews,
  addReview,
  updateReview,
  deleteReview,
} from '../controllers/reviewController.js';

const router = express.Router({ mergeParams: true });

router.post('/', protect, addReview);
router.get('/:productId', getProductReviews);

router.patch('/:id', protect, updateReview);

router.delete('/:id', protect, deleteReview);

export default router;

// 6888dc38744d5b4e4f6a9f78
// 6888db76218fcf0465abeee6
// 6888131798dff450585891ba
// 688500a919c9bc0ee6f44e12
