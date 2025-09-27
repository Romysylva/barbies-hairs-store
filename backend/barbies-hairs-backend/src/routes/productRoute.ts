import express from 'express';
import mongoose from 'mongoose';

import * as authController from '../middlewares/authmiddleware.js';
import * as uploadcontroller from '../middlewares/uploadMiddleware.js';
import authorizeRoles from '../middlewares/authroles.js';

import * as productController from '../controllers/productController.js';
import { Product } from '../models/productModules.js';
import catchAsync from '../utils/catchAsync.js';

const router = express.Router();

router
  .route('/')
  .post(
    uploadcontroller.uploadProductImages,
    uploadcontroller.resizeProductImages,
    authController.protect,
    authorizeRoles('admin', 'mananger'),
    productController.createProduct
  )
  .get(productController.getAllProducts);
router.get('/featured', productController.getFeaturedProducts);
router.get('/bestsellers', productController.getBestsellers);
router.get('/new-arrivals', productController.getNewArrivals);
router.get('/discounts', productController.getDiscountedProducts);
router.get('/:id/similar', productController.getSimilarProducts);
router
  .route('/:id')
  .get(authController.protect, productController.getProduct)
  .patch(
    authController.protect,
    authorizeRoles('admin', 'mananger'),
    uploadcontroller.uploadProductImages,
    uploadcontroller.resizeProductImages,
    productController.updateProduct
  )
  .delete(
    authController.protect,
    authorizeRoles('admin', 'mananger'),
    productController.deleteProduct
  );

// Admin
router.patch(
  '/:id/highlights',
  authController.protect,
  authorizeRoles('admin'),
  productController.updateProductHighlights
);

router.get(
  '/products',
  catchAsync(async (req, res) => {
    const { subcategory } = req.query;
    console.log('Incoming subcategory query:', subcategory);
    let filter: any = {};

    if (subcategory) {
      // ensure it's treated as ObjectId
      filter.subcategory = new mongoose.Types.ObjectId(subcategory as string);
    }

    const products = await Product.find(filter)
      .populate('category')
      .populate('subcategory');

    res.status(200).json({
      status: 'success',
      results: products.length,
      data: products,
    });
  })
);

export default router;
