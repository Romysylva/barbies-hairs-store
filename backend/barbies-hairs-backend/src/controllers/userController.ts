import { User } from '../models/userModle.js';
import AppError from '../utils/appError.js';
import catchAsync from '../utils/catchAsync.js';
import * as factory from './handleFactpry.js';
import { NextFunction, Request, Response } from 'express';
import { Types } from 'mongoose';

function filterObject<T extends object, K extends keyof T>(
  obj: T,
  ...allowedFields: K[]
): Partial<T> {
  const newObj: Partial<T> = {};

  Object.keys(obj).forEach((key) => {
    if (allowedFields.includes(key as K)) {
      newObj[key as K] = obj[key as K];
    }
  });

  return newObj;
}

export const getMe = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    if (!req.user || !req.user._id) {
      return res.status(401).json({ message: 'Not authenticated' });
    }

    const user = await User.findById(req.user._id).select('-password');
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found',
      });
    }

    res.status(200).json({
      status: 'success',
      success: true,
      data: {
        user,
      },
    });
  },
);

export const updateMe = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    if (!req.user) {
      return res.status(404).json({
        message: 'user not found',
      });
    }
    if (req.body.passowrd || req.body.passwordConfirm) {
      return next(
        new AppError(
          'This is not for password updates. please use /updateMyPassword',
          400,
        ),
      );
    }
    const filteredBody = filterObject(
      req.body,
      'name',
      'email',
      'phone',
      'location',
      'preferences',
    );
    if (req.file) filteredBody.userImage = req.file.filename;

    const updatedUser = await User.findByIdAndUpdate(
      req.user._id,
      filteredBody,
      {
        new: true,
        runvalidators: true,
      },
    );
    res.status(200).json({
      status: 'success',
      data: {
        user: updatedUser,
      },
    });
  },
);

export const deleteMe = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    await User.findByIdAndDelete(req.user?._id, {
      active: false,
    });
    res.status(204).json({
      status: 'success',
      data: null,
    });
  },
);

// export const createUser = (req: Request, res: Response) => {
//   res.status(500).json({
//     status: 'error',
//     message: 'This route is not defined! Please use /signup instead',
//   });
// };

export const passwordUpdapte = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
      return next(
        new AppError('Please provide both current and new password', 400),
      );
    }

    if (!req.user) {
      throw new AppError('User not found', 404);
    }

    const user = await User.findById(req.user._id).select('+password');

    if (!user) {
      throw new AppError('User not found', 404);
    }

    const isMatch = await user.comparePassword(currentPassword);
    if (!isMatch) {
      throw new AppError('Your current password is incorrect', 401);
    }

    user.password = newPassword;
    user.passwordConfirm = newPassword;

    await user.save();

    res.status(200).json({
      status: 'success',
      message: 'password updated successfully',
    });
  },
);

export const getUser = factory.getOne(User);
export const getAllUsers = factory.getAll(User);

export const updatedUser = factory.updateOne(User);
export const deleteUser = factory.deleteOne(User);
export const createsUser = factory.createOne(User);
