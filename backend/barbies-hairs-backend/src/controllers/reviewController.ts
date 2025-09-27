import { Request, Response } from 'express';
import { Review } from '../models/reviewModel.js';
import { Product } from '../models/productModules.js';
import Order from '../models/orderModel.js';
import catchAsync from '../utils/catchAsync.js';

export const createReview = async (req: any, res: Response) => {
  const { product, rating, comment } = req.body;

  const ordered = await Order.findOne({
    user: req.user._id,
    'products.product': product,
  });

  if (!ordered)
    return res
      .status(403)
      .json({ message: 'You must order this product before reviewing' });

  const review = await Review.create({
    user: req.user._id,
    product,
    rating,
    comment,
  });

  res.status(201).json(review);
};

export const addReview = catchAsync(async (req: Request, res: Response) => {
  const { productId } = req.params;
  const { rating, comment, product } = req.body;
  if (!req.user) return;

  const ordered = await Order.findOne({
    user: req.user._id,
    'products.product': product,
  });

  if (!ordered)
    return res
      .status(403)
      .json({ message: 'You must order this product before reviewing' });

  const userId = req.user._id;
  const review = await Review.create({
    user: userId,
    product: product,
    rating,
    comment,
  });

  // Update product stats
  const reviews = await Review.find({ product: product });
  const numReviews = reviews.length;
  const averageRating =
    reviews.reduce((acc, r) => acc + r.rating, 0) / numReviews;

  await Product.findByIdAndUpdate(product, {
    numReviews,
    averageRating,
  });

  res.status(201).json({ success: true, review });
});

export const updateReview = catchAsync(async (req: Request, res: Response) => {
  const { id } = req.params;
  const review = await Review.findById(id);

  if (!review) return res.status(404).json({ message: 'Review not found' });

  // Only review owner can update
  if (review.user.toString() !== req.user?._id.toString()) {
    return res
      .status(403)
      .json({ message: 'You can only update your own reviews' });
  }

  const updatedReview = await Review.findByIdAndUpdate(
    id,
    { comment: req.body.comment, rating: req.body.rating },
    { new: true, runValidators: true }
  );

  res.status(200).json({ status: 'success', data: updatedReview });
});

// ✅ Delete Review
export const deleteReview = catchAsync(async (req: Request, res: Response) => {
  const { id } = req.params;
  const review = await Review.findById(id);

  if (!review) return res.status(404).json({ message: 'Review not found' });

  if (review.user.toString() !== req.user?._id.toString()) {
    return res
      .status(403)
      .json({ message: 'You can only delete your own reviews' });
  }

  await Review.findByIdAndDelete(id);

  res.status(204).json({ status: 'success', data: null });
});

// ✅ Get All Reviews for a Product (with pagination)
export const getProductReviews = catchAsync(
  async (req: Request, res: Response) => {
    const { productId } = req.params;
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 5;
    const skip = (page - 1) * limit;

    const reviews = await Review.find({ product: productId })
      .populate('user', 'name email')
      .skip(skip)
      .limit(limit)
      .sort('-createdAt');

    const total = await Review.countDocuments({ product: productId });

    res.status(200).json({
      status: 'success',
      results: reviews.length,
      pagination: {
        total,
        page,
        pages: Math.ceil(total / limit),
      },
      data: reviews,
    });
  }
);
