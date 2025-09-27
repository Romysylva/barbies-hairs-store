// import multer from 'multer';
// import crypto from 'crypto';
// import AppError from '../utils/appError.js';
// import { Request, Response, NextFunction } from 'express';
// import path from 'path';
// import fs from 'fs';
// import sharp from 'sharp';
// import catchAsync from '../utils/catchAsync.js';

// // Ensure uploads folder exists
// const uploadPath = path.join('uploads');
// if (!fs.existsSync(uploadPath)) {
//   fs.mkdirSync(uploadPath);
// }

// const multerStorage = multer.memoryStorage();

// const multerFilter = (
//   req: Request,
//   file: Express.Multer.File,
//   cb: multer.FileFilterCallback
// ) => {
//   if (file.mimetype.startsWith('image')) {
//     cb(null, true);
//   } else {
//     cb(new AppError('Only image files are allowed!', 400));
//   }
// };

// const upload = multer({
//   storage: multerStorage,
//   fileFilter: multerFilter,
// });

// export const uploadProductImages = upload.fields([
//   { name: 'imageCover', maxCount: 1 },
//   { name: 'photos', maxCount: 5 },
// ]);

// export const resizeProductImages = catchAsync(
//   async (req: Request, res: Response, next: NextFunction) => {
//     if (!req.files) return next();

//     // Safely cast req.files
//     const files = req.files as {
//       imageCover?: Express.Multer.File[];
//       photos?: Express.Multer.File[];
//     };

//     // Process cover image
//     if (files.imageCover && files.imageCover.length > 0) {
//       const coverImage = files.imageCover[0];
//       const uniqueCoverId = crypto.randomUUID?.() ?? Date.now().toString();
//       const coverFilename = `product-cover-${uniqueCoverId}.jpeg`;

//       await sharp(coverImage.buffer)
//         .resize(800, 800)
//         .toFormat('jpeg')
//         .jpeg({ quality: 90 })
//         .toFile(path.join('uploads', coverFilename));

//       req.body.imageCover = coverFilename;
//       console.log('✅ ImageCover added to req.body:', req.body.imageCover);
//     }

//     // Process additional photos
//     if (files.photos && files.photos.length > 0) {
//       // req.body.photos = [];

//       await Promise.all(
//         files.photos.map(async (file: Express.Multer.File, i: number) => {
//           const uniqueId = crypto.randomUUID?.() ?? `${Date.now()}-${i}`;
//           const filename = `product-${uniqueId}.jpeg`;

//           await sharp(file.buffer)
//             .resize(800, 800)
//             .toFormat('jpeg')
//             .jpeg({ quality: 85 })
//             .toFile(path.join('uploads', filename));

//           // req.body.photos.push(filename);
//           file.filename = filename;
//         })
//       );
//     }

//     next();
//   }
// );

// // Upload single user photo (field name = "photo")
// export const uploadUserPhoto = upload.single('photo');

// // Resize and store user photo
// export const resizeUserPhoto = async (
//   req: Request,
//   res: Response,
//   next: NextFunction
// ) => {
//   if (!req.file) return next();

//   const uniqueId = crypto.randomUUID?.() ?? Date.now().toString();
//   const filename = `user-${uniqueId}.jpeg`;
//   req.file.filename = filename;

//   await sharp(req.file.buffer)
//     .resize(500, 500)
//     .toFormat('jpeg')
//     .jpeg({ quality: 90 })
//     .toFile(path.join('uploads', filename));

//   // Attach filename to request for controller
//   req.body.photo = filename;

//   next();
// };

import multer from 'multer';
import crypto from 'crypto';
import AppError from '../utils/appError.js';
import { Request, Response, NextFunction } from 'express';
import path from 'path';
import fs from 'fs';
import sharp from 'sharp';
import catchAsync from '../utils/catchAsync.js';
import { fileURLToPath } from 'url';

// Simulate __dirname in ESM
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Ensure uploads folder exists
const uploadPath = path.join(__dirname, '../uploads');
if (!fs.existsSync(uploadPath)) {
  fs.mkdirSync(uploadPath, { recursive: true });
}

const multerStorage = multer.memoryStorage();

const multerFilter = (
  req: Request,
  file: Express.Multer.File,
  cb: multer.FileFilterCallback
) => {
  if (file.mimetype.startsWith('image')) {
    cb(null, true);
  } else {
    cb(new AppError('Only image files are allowed!', 400));
  }
};

const upload = multer({
  storage: multerStorage,
  fileFilter: multerFilter,
});

// ====================== PRODUCT UPLOAD ======================
export const uploadProductImages = upload.fields([
  { name: 'imageCover', maxCount: 1 },
  { name: 'photos', maxCount: 5 },
]);

export const resizeProductImages = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    if (!req.files) return next();

    const files = req.files as {
      imageCover?: Express.Multer.File[];
      photos?: Express.Multer.File[];
    };

    // Cover image
    if (files.imageCover && files.imageCover.length > 0) {
      const coverImage = files.imageCover[0];
      const coverFilename = `product-cover-${
        crypto.randomUUID?.() ?? Date.now()
      }.jpeg`;

      await sharp(coverImage.buffer)
        .resize(800, 800)
        .toFormat('jpeg')
        .jpeg({ quality: 90 })
        .toFile(path.join(uploadPath, coverFilename));

      req.body.imageCover = coverFilename;
    }

    // Additional photos
    if (files.photos && files.photos.length > 0) {
      req.body.photos = [];

      await Promise.all(
        files.photos.map(async (file: Express.Multer.File, i: number) => {
          const filename = `product-${
            crypto.randomUUID?.() ?? `${Date.now()}-${i}`
          }.jpeg`;

          await sharp(file.buffer)
            .resize(800, 800)
            .toFormat('jpeg')
            .jpeg({ quality: 85 })
            .toFile(path.join(uploadPath, filename));

          req.body.photos.push(filename);
        })
      );
    }

    next();
  }
);

// ====================== USER UPLOAD ======================
export const uploadUserPhoto = upload.single('photo');

export const resizeUserPhoto = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  if (!req.file) return next();

  const filename = `user-${crypto.randomUUID?.() ?? Date.now()}.jpeg`;
  req.file.filename = filename;

  await sharp(req.file.buffer)
    .resize(500, 500)
    .toFormat('jpeg')
    .jpeg({ quality: 90 })
    .toFile(path.join(uploadPath, filename));

  req.body.photo = filename;
  next();
};
