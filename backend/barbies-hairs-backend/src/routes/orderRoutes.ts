// import express from 'express';
// import { protect, adminOnly } from '../middlewares/authmiddleware.js';
// import {
//   createOrder,
//   getUserOrders,
//   getAllOrders,
//   updateOrderStatus,
// } from '../controllers/orderController.js';

// const router = express.Router();

// router.post('/', protect, createOrder);
// router.get('/mine', protect, getUserOrders);
// router.get('/admin', protect, adminOnly, getAllOrders);
// router.put('/:id/status', protect, adminOnly, updateOrderStatus);

// export default router;

import express from 'express';
import {
  createOrder,
  getMyOrders,
  getOrderById,
  getAllOrders,
  updateOrderStatus,
  cancelOrder,
  deleteOrder,
} from '../controllers/orderController.js';
import { protect, adminOnly } from '../middlewares/authmiddleware.js';

const router = express.Router();

router
  .route('/')
  .post(protect, createOrder) // Create new order
  .get(protect, adminOnly, getAllOrders); // Admin: all orders

router.get('/my', protect, getMyOrders); // My orders
router.get('/my-orders', protect, getMyOrders); // My orders (alias)

router
  .route('/:id')
  .get(protect, getOrderById)
  .patch(protect, adminOnly, updateOrderStatus);

router.put('/:id/cancel', protect, cancelOrder);
router.delete('/:id/delete', protect, adminOnly, deleteOrder);
export default router;
