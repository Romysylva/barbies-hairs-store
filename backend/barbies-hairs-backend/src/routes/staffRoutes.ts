// src/routes/staffRoutes.ts
import express from 'express';
import {
  createStaff,
  getStaff,
  getStaffById,
  updateStaff,
  deleteStaff,
} from '../controllers/staffController.js';

const router = express.Router();

router.route('/').get(getStaff).post(createStaff);

router.route('/:id').get(getStaffById).put(updateStaff).delete(deleteStaff);

export default router;
