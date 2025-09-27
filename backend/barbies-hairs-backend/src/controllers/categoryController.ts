import { Request, Response, NextFunction } from 'express';
import {
  Category,
  buildCategoryTree,
  ICategory,
} from '../models/categoryModel.js';

import slugify from 'slugify';
import AppError from '../utils/appError.js';
import catchAsync from '../utils/catchAsync.js';

export const createCategory = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const { name, description, parent } = req.body;
    const image = req.file?.filename;

    if (!name) {
      return next(new AppError('Category name is required', 400));
    }

    // const slug = slugify(name, { lower: true });
    const slug = name.toLowerCase().replace(/\s+/g, '-');

    const existing = await Category.findOne({ slug });
    if (existing) {
      return next(new AppError('Category already exists', 400));
    }

    const category = await Category.create({
      name,
      slug,
      description,
      image,
      parent: parent || undefined,
    });

    res.status(201).json({
      success: true,
      data: category,
    });
  }
);

export const getCategory = async (req: Request, res: Response) => {
  const totalCat = await Category.countDocuments();
  const category = await Category.find({ parent: null }).lean();
  const categoryTree = await Promise.all(
    category.map(async (cat) => {
      const subcategories = await Category.find({ parent: cat._id }).lean();
      return { ...cat, subcategories };
    })
  );
  res.status(200).json({ status: 'success', totalCat, data: categoryTree });
};

// Get all categories (flat list)
export const getCategories = async (req: Request, res: Response) => {
  try {
    const categories = await Category.find();
    res.json({ success: true, data: categories });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// Get category tree (recursive hierarchy)
export const getCategoryTree = catchAsync(
  async (req: Request, res: Response) => {
    const tree = await buildCategoryTree();
    res.json({ success: true, data: tree });
  }
);

// Get single category by ID
export const getCategoryById = catchAsync(
  async (req: Request, res: Response) => {
    const category = await Category.findById(req.params.id).populate(
      'children'
    );
    if (!category)
      return res.status(404).json({ message: 'Category not found' });

    res.json({ success: true, data: category });
  }
);

// Update category
export const updateCategory = catchAsync(
  async (req: Request, res: Response) => {
    const { name, description, parent } = req.body;

    const slug = name ? name.toLowerCase().replace(/\s+/g, '-') : undefined;

    const category = await Category.findByIdAndUpdate(
      req.params.id,
      { name, slug, description, parent: parent || null },
      { new: true, runValidators: true }
    );

    if (!category)
      return res.status(404).json({ message: 'Category not found' });

    res.json({ success: true, data: category });
  }
);

// Delete category
export const deleteCategory = catchAsync(
  async (req: Request, res: Response) => {
    const category = await Category.findById(req.params.id);
    if (!category)
      return res.status(404).json({ message: 'Category not found' });

    // Check if it has children
    const hasChildren = await Category.findOne({ parent: category._id });
    if (hasChildren) {
      return res.status(400).json({
        success: false,
        message: 'Cannot delete category with subcategories',
      });
    }

    await category.deleteOne();

    res.json({ success: true, message: 'Category deleted' });
  }
);

// GET /api/products/:id/similar
