import mongoose, { Schema, Document, Model } from 'mongoose';

export interface ICategory extends Document {
  name: string;
  slug: string;
  description?: string;
  parent?: mongoose.Types.ObjectId | null;
  children: ICategory[];
  createdAt: Date;
  updatedAt: Date;
}

const categorySchema = new Schema<ICategory>(
  {
    name: {
      type: String,
      required: [true, 'Category name is required'],
      trim: true,
    },
    slug: {
      type: String,
      required: [true, 'Category slug is required'],
      unique: true,
      lowercase: true,
      trim: true,
    },
    description: {
      type: String,
    },
    parent: {
      type: Schema.Types.ObjectId,
      ref: 'Category',
      default: null,
    },
  },
  { timestamps: true, toJSON: { virtuals: true }, toObject: { virtuals: true } }
);

categorySchema.index({ parent: 1, slug: 1 }, { unique: true });

// 🔹 Virtual field for children
categorySchema.virtual('children', {
  ref: 'Category',
  localField: '_id',
  foreignField: 'parent',
});

// 🔹 Middleware: always populate children if explicitly requested
categorySchema.pre(/^find/, function (next) {
  const query = this as mongoose.Query<any, ICategory>;
  query.populate('children');
  next();
});

// 🔹 Helper function to build category tree
async function buildCategoryTree(): Promise<ICategory[]> {
  const categories = await Category.find().lean();

  const categoryMap: Record<string, any> = {};
  categories.forEach((cat) => {
    categoryMap[cat._id.toString()] = { ...cat, children: [] };
  });

  const tree: any[] = [];

  categories.forEach((cat) => {
    if (cat.parent) {
      categoryMap[cat.parent.toString()].children.push(
        categoryMap[cat._id.toString()]
      );
    } else {
      tree.push(categoryMap[cat._id.toString()]);
    }
  });

  return tree;
}

export const Category: Model<ICategory> = mongoose.model<ICategory>(
  'Category',
  categorySchema
);

export { buildCategoryTree };
