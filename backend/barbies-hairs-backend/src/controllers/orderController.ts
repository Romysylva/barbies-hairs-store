import { Request, Response } from 'express';
import Order from '../models/orderModel.js';
import { Product } from '../models/productModules.js';
import { ActivityLog } from '../models/activityModel.js';
import { IUser } from '../models/userModle.js';
import catchAsync from '../utils/catchAsync.js';

// Create a new order
export const createOrder = catchAsync(async (req: Request, res: Response) => {
  const { items, shippingAddress, paymentMethod } = req.body;
  if (!items || items.length === 0) {
    return res.status(400).json({ message: 'No order items' });
  }

  // Optional: Check stock before creating order
  let totalAmount = 0;

  const orderItems = await Promise.all(
    items.map(async (item: any) => {
      const product = await Product.findById(item.product);
      if (!product) {
        throw new Error(`Product not found: ${item.product}`);
      }
      const subtotal = product.price * item.quantity;
      totalAmount += subtotal;
      return {
        product: product._id,
        quantity: item.quantity,
        price: product.price,
        subtotal,
      };
    })
  );

  const order = await Order.create({
    user: (req.user as IUser)._id,
    items: orderItems,
    totalAmount,
    shippingAddress,
    paymentMethod,
    deliveryTracking: [
      {
        status: 'pending',
        note: 'Order placed',
      },
    ],
  });

  await ActivityLog.create({
    user: (req.user as IUser)._id,
    action: 'Order Created',
    details: { orderId: order._id, totalAmount },
  });

  res.status(201).json({ success: true, order });
});

export const getMyOrders = catchAsync(async (req: Request, res: Response) => {
  const orders = await Order.find({ user: (req.user as IUser)._id }).populate(
    'items.product',
    'name price'
  );
  res.json({ success: true, orders });
});

export const getOrderById = catchAsync(async (req: Request, res: Response) => {
  const order = await Order.findById(req.params.id)
    .populate('items.product', 'name price')
    .populate('user', 'name email');
  if (!order) return res.status(404).json({ message: 'Order not found' });

  // Allow only the owner or admin
  if (
    String(order.user._id) !== String((req.user as IUser)._id) &&
    !(req.user as IUser).isAdmin
  ) {
    return res
      .status(403)
      .json({ message: 'Not authorized to view this order' });
  }

  res.json({ success: true, order });
});

export const getAllOrders = catchAsync(async (req: Request, res: Response) => {
  const orders = await Order.find()
    .populate('user', 'name email')
    .populate('items.product', 'name price');
  res.json({ success: true, orders });
});

export const updateOrderStatus = catchAsync(
  async (req: Request, res: Response) => {
    const { status, note } = req.body;
    const order = await Order.findById(req.params.id);
    if (!order) return res.status(404).json({ message: 'Order not found' });

    order.orderStatus = status;
    order.deliveryTracking.push({
      status,
      updatedAt: new Date(),
      note: note || `Status changed to ${status}`,
    });

    await order.save({ validateBeforeSave: true });

    await ActivityLog.create({
      user: (req.user as IUser)._id,
      action: 'Order Status Updated',
      details: { orderId: order._id, status: status },
    });

    res.json({ success: true, order });
  }
);

export const cancelOrder = catchAsync(async (req: Request, res: Response) => {
  const order = await Order.findById(req.params.id);
  if (!order) return res.status(404).json({ message: 'Order not found' });

  if (!req.user) return;

  if (
    (req.user.roles as unknown) !== 'admin' &&
    String(order.user) !== String((req.user as IUser)._id)
  ) {
    return res.status(403).json({ message: 'Not authorized' });
  }

  if (order.orderStatus !== 'pending') {
    return res
      .status(400)
      .json({ message: 'Only pending orders can be cancelled' });
  }

  order.orderStatus = 'cancelled';
  order.deliveryTracking.push({
    status: 'cancelled',
    updatedAt: new Date(),
    note: 'Order cancelled by user',
  });

  await order.save();

  await ActivityLog.create({
    user: (req.user as IUser)._id,
    action: 'Order Cancelled',
    details: { orderId: order._id },
  });

  res.json({ success: true, message: 'Order cancelled', order });
});

export const deleteOrder = catchAsync(async (req: Request, res: Response) => {
  if (!req.user) return;

  const roles = Array.isArray(req.user.roles)
    ? req.user.roles
    : [req.user.roles];
  if (!roles.includes('admin')) {
    return res.status(403).json({ message: 'Not authorized' });
  }
  const order = await Order.findById(req.params.id);
  if (!order) return res.status(404).json({ message: 'Order not found' });

  await order.deleteOne();
  res.json({ message: 'Order deleted successfully' });
});
