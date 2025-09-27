import mongoose, { Document, Schema, Types, model } from 'mongoose';
import slugify from 'slugify';

// Enhanced product interface with all features
export interface IProduct extends Document {
  name: string;
  slug: string;
  price: number;
  priceDiscount?: number;
  discountPercent?: number;
  description: string;
  summary?: string;
  category: Types.ObjectId;
  subcategory?: Types.ObjectId;
  inStock: boolean;
  quantity: number;
  hairLength: string;
  photos?: string[];
  ratingsAverage?: number;
  ratingsQuantity?: number;
  reviews?: Types.ObjectId[];
  isFeatured?: boolean;
  isBestseller?: boolean;
  isNewArrival?: boolean;
  salesCount?: number;
  createdAt?: Date;
  color: string;
  texture: string;
  tags: string[];
  brand: string;
  imageCover: string;
}

const ProductSchema = new Schema<IProduct>(
  {
    name: {
      type: String,
      required: [true, 'A product must have a name'],
      trim: true,
      unique: true,
      maxlength: [100, 'Name must not exceed 100 characters'],
    },
    slug: String,
    price: {
      type: Number,
      required: [true, 'A product must have a price'],
      min: 0,
    },
    priceDiscount: {
      type: Number,
      min: 0,
      validate: {
        validator(this: IProduct, val: number) {
          return val == null || val < this.price;
        },
        message: 'Discount price ({VALUE}) must be less than actual price',
      },
    },
    discountPercent: {
      type: Number,
      min: 0,
      max: 100,
    },
    summary: {
      type: String,
      trim: true,
    },
    description: {
      type: String,
      required: [true, 'Product must have a description'],
      trim: true,
    },
    category: {
      type: Schema.Types.ObjectId,
      ref: 'Category',
      required: [true, 'Product must belong to a category'],
    },
    subcategory: {
      type: Schema.Types.ObjectId,
      ref: 'Category',
    },
    inStock: {
      type: Boolean,
      default: true,
    },
    quantity: {
      type: Number,
      default: 0,
      min: 0,
    },
    tags: {
      type: [String],
      default: [],
    },
    hairLength: {
      type: String,
      trim: true,
    },
    photos: [String],
    ratingsAverage: {
      type: Number,
      default: 4.5,
      min: [1, 'Rating must be at least 1'],
      max: [5, 'Rating must be at most 5'],
      set: (val: number) => Math.round(val * 10) / 10,
    },
    ratingsQuantity: {
      type: Number,
      default: 0,
    },
    isBestseller: {
      type: Boolean,
      default: false,
    },
    isNewArrival: {
      type: Boolean,
      default: false,
    },
    salesCount: {
      type: Number,
      default: 0,
      min: 0,
    },
    createdAt: {
      type: Date,
      default: Date.now,
    },
    imageCover: String,
    color: String,
    texture: String,
    brand: String,
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  },
);

// Indexing for performance
ProductSchema.index({ price: 1, ratingsAverage: -1 });
ProductSchema.index({ slug: 1 });
ProductSchema.index({ isFeatured: 1, createdAt: -1 });
ProductSchema.index({ isBestseller: 1, salesCount: -1 });
ProductSchema.index({ isNewArrival: 1, createdAt: -1 });
ProductSchema.index({ category: 1, inStock: 1 });
ProductSchema.index({ tags: 1 });

// Virtual populate for reviews
ProductSchema.virtual('reviews', {
  ref: 'Review',
  foreignField: 'product',
  localField: '_id',
});

// Derived final price virtual
ProductSchema.virtual('finalPrice').get(function (this: IProduct) {
  if (this.priceDiscount != null) return this.priceDiscount;
  if (this.discountPercent != null && this.discountPercent > 0) {
    return Math.round((this.price * (100 - this.discountPercent)) / 100);
  }
  return this.price;
});

// Auto-generate slug from name
ProductSchema.pre('save', function (next) {
  if (this.isModified('name')) {
    this.slug = slugify(this.name, { lower: true });
  }
  next();
});

// Validate discount consistency
ProductSchema.pre('validate', function (next) {
  if (this.priceDiscount != null && this.discountPercent != null) {
    const percentPrice = Math.round(
      (this.price * (100 - this.discountPercent)) / 100,
    );
    if (Math.abs(this.priceDiscount - percentPrice) > 1) {
      // Auto-sync discount percent to match price discount
      this.discountPercent = Math.round(
        ((this.price - this.priceDiscount) / this.price) * 100,
      );
    }
  }
  next();
});

export const Product = model<IProduct>('Product', ProductSchema);
