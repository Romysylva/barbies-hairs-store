import { NextFunction, Request, Response } from 'express';
import { Product } from '../models/productModules.js';
import catchAsync from '../utils/catchAsync.js';
import { logActivity } from '../middlewares/activityLoger.js';
import { Category } from '../models/categoryModel.js';
import * as factory from './handleFactpry.js';
import sharp from 'sharp';

export const createProduct = catchAsync(async (req: Request, res: Response) => {
  const imageCover = req.body.imageCover;
  if (req.files && (req.files as any).photos) {
    req.body.photos = (req.files as any).photos.map(
      (f: Express.Multer.File) => f.filename
    );
  }

  if (!req.body) {
    return res.status(400).json({ message: 'Request body is missing' });
  }
  console.log(req.body);
  const { categoryName, subcategoryName, photos } = req.body;
  const category = await Category.findOne({
    name: categoryName,
    parent: null,
  });
  if (!category)
    return res.status(400).json({
      message: 'Category not found',
    });
  const subcategory = await Category.findOne({
    name: subcategoryName,
    parent: category._id,
  });
  if (!subcategory)
    return res.status(400).json({ message: 'subcategory not found' });

  console.log('Final photos:', photos);
  const totalProducts = await Product.countDocuments();
  const product = await Product.create({
    imageCover,
    ...req.body,
    category: category._id,
    subcategory: subcategory._id,
    photos,
  });
  console.log('Final imageCover:', imageCover);
  await product.populate([
    { path: 'category', select: 'name' },
    { path: 'subcategory', select: 'name' },
  ]);
  logActivity(product.id, 'USER_REGISTERED', {
    message: 'new product add',
  });
  res.status(201).json({ success: true, totalProducts, data: product });
});
const getPaging = (req: Request) => {
  const page = Math.max(parseInt((req.query.page as string) || '1', 10), 1);
  const limit = Math.min(
    Math.max(parseInt((req.query.limit as string) || '5', 10), 1),
    100
  );
  const skip = (page - 1) * limit;
  return { page, limit, skip };
};

// GET /api/products/featured
export const getFeaturedProducts = async (req: Request, res: Response) => {
  const { page, limit, skip } = getPaging(req);
  const [items, total] = await Promise.all([
    Product.find({ isFeatured: true })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean(),
    Product.countDocuments({ isFeatured: true }),
  ]);
  res.json({ success: true, total, page, limit, items });
};

// GET /api/products/bestsellers
export const getBestsellers = async (req: Request, res: Response) => {
  const { page, limit, skip } = getPaging(req);
  // You can also require salesCount > X if you want.
  const [items, total] = await Promise.all([
    Product.find({ $or: [{ isBestseller: true }, { salesCount: { $gt: 0 } }] })
      .sort({ salesCount: -1, ratingsQuantity: -1 })
      .skip(skip)
      .limit(limit)
      .lean(),
    Product.countDocuments({
      $or: [{ isBestseller: true }, { salesCount: { $gt: 0 } }],
    }),
  ]);
  res.json({
    success: true,
    total,
    page,
    limit,
    items,
  });
};

// GET /api/products/new-arrivals
export const getNewArrivals = async (req: Request, res: Response) => {
  const { page, limit, skip } = getPaging(req);
  const [items, total] = await Promise.all([
    Product.find({}) // optionally: { isNewArrival: true } to force manual control
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean(),
    Product.estimatedDocumentCount(),
  ]);
  res.json({ success: true, total, page, limit, items });
};

// GET /api/products/discounts
export const getDiscountedProducts = async (req: Request, res: Response) => {
  const { page, limit, skip } = getPaging(req);

  // Match either discountPercent > 0 or priceDiscount < price
  const match = {
    $or: [
      { discountPercent: { $gt: 0 } },
      {
        $and: [
          { priceDiscount: { $ne: null } },
          { $expr: { $lt: ['$priceDiscount', '$price'] } },
        ],
      },
    ],
  };

  const [items, total] = await Promise.all([
    Product.find(match as any)
      .sort({ discountPercent: -1, priceDiscount: 1 })
      .skip(skip)
      .limit(limit)
      .lean(),
    Product.countDocuments(match as any),
  ]);

  res.json({ success: true, total, page, limit, items });
};

// OPTIONAL: Admin – PATCH product flags/discounts
// PATCH /api/products/:id/highlights
export const updateProductHighlights = async (req: Request, res: Response) => {
  // Ensure caller is admin in your auth middleware before this
  const { id } = req.params;
  const {
    isFeatured,
    isBestseller,
    isNewArrival,
    discountPercent,
    priceDiscount,
  } = req.body;

  const updated = await Product.findByIdAndUpdate(
    id,
    {
      ...(isFeatured !== undefined && { isFeatured }),
      ...(isBestseller !== undefined && { isBestseller }),
      ...(isNewArrival !== undefined && { isNewArrival }),
      ...(discountPercent !== undefined && { discountPercent }),
      ...(priceDiscount !== undefined && { priceDiscount }),
    },
    { new: true, runValidators: true }
  );

  if (!updated)
    return res
      .status(404)
      .json({ success: false, message: 'Product not found' });
  res.json({ success: true, product: updated });
};

export const getSimilarProducts = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const product = await Product.findById(id).lean();

    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }

    const similar = await Product.find({
      subcategory: product.subcategory, // same subcategory
      _id: { $ne: product._id }, // exclude current
    })
      .limit(6)
      .lean();

    res.json({ product, similar });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};
// export const getAllProducts = catchAsync(async (_: Request, res: Response) => {
//   const products = await Product.find();

//   const productCount = await Product.countDocuments();

//   res
//     .status(200)
//     .json({ success: true, totalProduct: productCount, data: products });
// });

// export const getProductById = catchAsync(
//   async (req: Request, res: Response) => {
//     const product = await Product.findById(req.params.id);
//     if (!product)
//       return res
//         .status(404)
//         .json({ success: false, message: 'product not found' });
//     res.status(200).json({ success: true, data: product });
//   }
// );

// export const updateProduct = catchAsync(async (req: Request, res: Response) => {
//   const product = await Product.findByIdAndUpdate(req.params.id, req.body, {
//     new: true,
//     runValidators: true,
//   });
//   if (!product)
//     return res
//       .status(404)
//       .json({ success: false, message: 'Product not found' });
//   res.status(200).json({ success: true, data: product });
// });

// export const deleteProduct = catchAsync(async (req: Request, res: Response) => {
//   const product = await Product.findByIdAndDelete(req.params.id);
//   if (!product)
//     return res
//       .status(404)
//       .json({ success: false, message: 'Product not found' });
//   res
//     .status(200)
//     .json({ success: true, message: 'product deleted successfully' });
// });

export const aliasTopProduct = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  req.query.limit = '5';
  req.query.sort = '-ratingsAverage, price';
  req.query.fields = 'name, price,ratingsAverage, summary,';
  next();
};

export const getAllProducts = factory.getAll(Product);
export const getProduct = factory.getOne(Product);
export const updateProduct = factory.updateOne(Product);
export const deleteProduct = factory.deleteOne(Product);
