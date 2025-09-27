import express from 'express';
import {
  createBooking,
  getMyBooking,
  getAllBookings,
  cancelBooking,
  deleteBooking,
  updateBooking,
} from '../controllers/bookingController.js';
import { protect, adminOnly } from '../middlewares/authmiddleware.js';

const router = express.Router();

router.post('/', protect, createBooking);
router.get('/mine', protect, getMyBooking);
router.get('/admin', protect, adminOnly, getAllBookings);
router.delete('/:id', protect, cancelBooking);
router.delete('/:id/cancle', protect, deleteBooking);
router.put('/:id/update', protect, adminOnly, updateBooking);

export default router;
