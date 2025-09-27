// import mongoose from 'mongoose';
// import dotenv from 'dotenv';
// import { Product } from './models/productModules.js';

// dotenv.config();
// const products = [
//   {
//     name: 'Luxury Bone Straight Wig',
//     price: 25000,
//     category: 'Wig',
//     subcategory: 'Bone Straight',
//     inStock: true,
//     image: '/images/luxury-straight-wig.jpg',
//     description: 'Silky bone straight luxury wig.',
//     hairLenght: '20"',
//     rating: 4.5,
//   },
//   {
//     name: 'Deep Wave Closure 4x4',
//     price: 12000,
//     category: 'Closure',
//     subcategory: 'Deep Wave',
//     inStock: true,
//     image: '/images/deep-wave-closure.jpg',
//     description: 'Soft deep wave closure with 4x4 lace.',
//     hairLenght: '14"',
//     rating: 4.2,
//   },
//   {
//     name: 'Body Wave Frontal 13x4',
//     price: 18000,
//     category: 'Frontal',
//     subcategory: 'Body Wave',
//     inStock: true,
//     image: '/images/body-wave-frontal.jpg',
//     description: 'Lace frontal with bouncy body wave.',
//     hairLenght: '18"',
//     rating: 4.3,
//   },
// ];

// const seedProducts = async () => {
//   try {
//     await mongoose.connect(process.env.DATABASE as string);
//     await Product.deleteMany(); // Optional: clean old products
//     const inserted = await Product.insertMany(products);
//     console.log('✅ Seeded products:', inserted.length);
//     process.exit(0);
//   } catch (err) {
//     console.error('❌ Failed to seed products:', err);
//     process.exit(1);
//   }
// };

// seedProducts();

import mongoose, { Types } from 'mongoose';
import dotenv from 'dotenv';
import { users } from './data/users.js';
import { products } from './data/products.js';
import { User } from './models/userModle.js';
import { Product } from './models/productModules.js';
import Order from './models/orderModel.js';
import { Review } from './models/reviewModel.js';
import Booking from './models/bookingModel.js';
import { Category } from './models/categoryModel.js';
import connectDB from './config/db.js';

dotenv.config();

const importData = async () => {
  try {
    await connectDB();

    // Clean up
    await Order.deleteMany();
    await Product.deleteMany();
    await User.deleteMany();
    await Review.deleteMany();
    await Booking.deleteMany();
    await Category.deleteMany();

    // Insert users
    const createdUsers = await User.insertMany(users);
    const adminUser = createdUsers[0]._id;

    // Insert parent categories
    const parentCategories = await Category.insertMany([
      { name: 'Wigs', slug: 'wigs', description: 'Wig collections' },
      {
        name: 'Closures',
        slug: 'closures',
        description: 'Closure collections',
      },
      { name: 'Bundles', slug: 'bundles', description: 'Bundle collections' },
    ]);

    const wigsCategory = parentCategories.find((cat) => cat.name);

    // Insert subcategories
    await Category.insertMany([
      {
        name: 'Closure Wigs',
        slug: 'closure-wigs',
        description: 'Closure wigs',
        parent: wigsCategory?._id,
      },
      {
        name: 'Frontal Wigs',
        slug: 'frontal-wigs',
        description: 'Frontal wigs',
        parent: wigsCategory?._id,
      },
    ]);

    // Fetch all categories for mapping
    const allCategories = await Category.find();
    const categoryMap: Record<string, Types.ObjectId> = {};
    allCategories.forEach((cat) => {
      categoryMap[cat.name.toLowerCase()] = cat._id as Types.ObjectId;
    });

    // Map products with correct category/subcategory ObjectIds
    const sampleProducts = products.map((product) => ({
      ...product,
      user: adminUser,
      category: categoryMap[product.category?.toLowerCase() || 'wigs'],
      subcategory: product.subcategory
        ? categoryMap[product.subcategory.toLowerCase()]
        : undefined,
    }));

    await Product.insertMany(sampleProducts);

    console.log('✅ Data successfully seeded!');
    process.exit();
  } catch (error) {
    console.error(`❌ Seeding failed: ${error}`);
    process.exit(1);
  }
};

const destroyData = async () => {
  try {
    await connectDB();

    await Order.deleteMany();
    await Product.deleteMany();
    await User.deleteMany();
    await Review.deleteMany();
    await Booking.deleteMany();
    await Category.deleteMany();

    console.log('🧹 All data destroyed!');
    process.exit();
  } catch (error) {
    console.error(`❌ Destruction failed: ${error}`);
    process.exit(1);
  }
};

if (process.argv[2] === '-d') {
  destroyData();
} else {
  importData();
}
