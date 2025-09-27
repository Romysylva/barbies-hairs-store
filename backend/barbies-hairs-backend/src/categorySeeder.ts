// // seeders/categorySeeder.ts
// import mongoose from 'mongoose';
// import dotenv from 'dotenv';
// import { Category } from './models/categoryModel.js';

// dotenv.config();

// const categories = [
//   {
//     name: 'Human Hair',
//     subcategories: [
//       'Bone Straight',
//       'Body Wave',
//       'Deep Wave',
//       'Afro Curl',
//       'Brazilian Hair',
//       'Peruvian Hair',
//     ],
//   },
//   {
//     name: 'Synthetic Hair',
//     subcategories: [
//       'Xpression',
//       'Pre-stretched',
//       'Jumbo Braid',
//       'Straight Synthetic Weave',
//       'Curly Synthetic Weave',
//     ],
//   },
//   {
//     name: 'Wigs',
//     subcategories: [
//       'Lace Front Wig',
//       'Full Lace Wig',
//       'Closure Wig',
//       'U-Part Wig',
//       'Headband Wig',
//       '360 Wig',
//     ],
//   },
//   {
//     name: 'Closures & Frontals',
//     subcategories: ['2x6 Closure', '4x4 Closure', '13x4 Frontal', 'HD Lace'],
//   },
//   {
//     name: 'Hair Care & Accessories',
//     subcategories: [
//       'Hair Conditioner',
//       'Shampoo',
//       'Wig Spray',
//       'Satin Bonnet',
//       'Hair Glue',
//     ],
//   },
//   {
//     name: 'Braided Wigs / Crochet',
//     subcategories: [
//       'Box Braid Wigs',
//       'Knotless Braid Wigs',
//       'Passion Twist',
//       'Butterfly Locs',
//     ],
//   },
//   {
//     name: 'Ponytails & Clip-Ins',
//     subcategories: [
//       'Wrap Ponytail',
//       'Drawstring Ponytail',
//       'Straight Clip-ins',
//       'Curly Clip-ins',
//     ],
//   },
// ];

// const seedCategories = async () => {
//   try {
//     await mongoose.connect(process.env.DATABASE || '', {
//       dbName: 'barbies-hairs',
//     });
//     await Category.deleteMany();
//     const data = [];

//     for (const cat of categories) {
//       const parent = await Category.create({ name: cat.name });
//       for (const sub of cat.subcategories) {
//         const subCat = await Category.create({
//           name: sub,
//           parent: parent._id,
//         });
//         data.push(subCat);
//       }
//       data.push(parent);
//     }

//     console.log('Categories seeded:', data.length);
//     process.exit();
//   } catch (error) {
//     console.error(error);
//     process.exit(1);
//   }
// };

// seedCategories();

// seeders/categorySeeder.ts
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import slugify from 'slugify';
import { Category } from './models/categoryModel.js';

dotenv.config();

const categories = [
  {
    subcategories: [
      'Bone Straight',
      'Body Wave',
      'Deep Wave',
      'Afro Curl',
      'Brazilian Hair',
      'Peruvian Hair',
    ],
  },
  {
    name: 'Synthetic Hair',
    subcategories: [
      'Xpression',
      'Pre-stretched',
      'Jumbo Braid',
      'Straight Synthetic Weave',
      'Curly Synthetic Weave',
    ],
  },
  {
    name: 'Wigs',
    subcategories: [
      'Lace Front Wig',
      'Full Lace Wig',
      'Closure Wig',
      'U-Part Wig',
      'Headband Wig',
      '360 Wig',
    ],
  },
  {
    name: 'Closures & Frontals',
    subcategories: ['2x6 Closure', '4x4 Closure', '13x4 Frontal', 'HD Lace'],
  },
  {
    name: 'Hair Care & Accessories',
    subcategories: [
      'Hair Conditioner',
      'Shampoo',
      'Wig Spray',
      'Satin Bonnet',
      'Hair Glue',
    ],
  },
  {
    name: 'Braided Wigs / Crochet',
    subcategories: [
      'Box Braid Wigs',
      'Knotless Braid Wigs',
      'Passion Twist',
      'Butterfly Locs',
    ],
  },
  {
    name: 'Ponytails & Clip-Ins',
    subcategories: [
      'Wrap Ponytail',
      'Drawstring Ponytail',
      'Straight Clip-ins',
      'Curly Clip-ins',
    ],
  },
];

const seedCategories = async () => {
  try {
    await mongoose.connect(process.env.DATABASE || '', {
      dbName: 'barbies-hairs',
    });

    // clean DB
    await Category.deleteMany();

    const created: any[] = [];

    for (const cat of categories) {
      // parent category
      const parent = await Category.create({
        name: cat.name,
        slug: (slugify as unknown as Function)(cat.name, { lower: true }),
      });

      created.push(parent);

      // subcategories
      for (const sub of cat.subcategories) {
        const subCat = await Category.create({
          name: sub,
          slug: (slugify as unknown as Function)(sub, { lower: true }),
          parent: parent._id,
        });
        created.push(subCat);
      }
    }

    console.log(`✅ Seeded ${created.length} categories`);
    process.exit();
  } catch (error) {
    console.error('❌ Seeder error:', error);
    process.exit(1);
  }
};

seedCategories();
