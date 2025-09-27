// src/routes/serviceRoutes.ts
import express from 'express';
import {
  createService,
  getServices,
  getServiceById,
  updateService,
  deleteService,
} from '../controllers/serviceController.js';

const router = express.Router();

router.route('/').get(getServices).post(createService);

router
  .route('/:id')
  .get(getServiceById)
  .put(updateService)
  .delete(deleteService);

export default router;
