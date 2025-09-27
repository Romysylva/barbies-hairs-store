import { Request, Response, NextFunction } from 'express';
import { Types } from 'mongoose';
import {
  UserProfile,
  IUserProfile,
  IAddress,
  IPaymentMethod,
} from '../models/userProfileModel.js';
import catchAsync from '../utils/catchAsync.js';
import AppError from '../utils/appError.js';

// Get user profile
export const getUserProfile = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const userId = req.user?._id;

    if (!userId) {
      return next(new AppError('User not authenticated', 401));
    }

    let profile = await UserProfile.findOne({ userId }).populate(
      'userId',
      'name email avatar',
    );

    // Create profile if it doesn't exist
    if (!profile) {
      profile = await UserProfile.create({ userId });
      await profile.populate('userId', 'name email avatar');
    }

    res.status(200).json({
      success: true,
      data: {
        profile,
      },
    });
  },
);

// Update user preferences
export const updateUserPreferences = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const userId = req.user?._id;
    const { preferences } = req.body;

    if (!userId) {
      return next(new AppError('User not authenticated', 401));
    }

    const profile = await UserProfile.findOneAndUpdate(
      { userId },
      { $set: { preferences } },
      { new: true, upsert: true },
    );

    res.status(200).json({
      success: true,
      data: {
        profile,
      },
    });
  },
);

// ADDRESSES

// Get all user addresses
export const getUserAddresses = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const userId = req.user?._id;

    if (!userId) {
      return next(new AppError('User not authenticated', 401));
    }

    const profile = await UserProfile.findOne({ userId });
    const addresses = profile?.addresses || [];

    res.status(200).json({
      success: true,
      data: {
        addresses,
      },
    });
  },
);

// Add new address
export const addAddress = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const userId = req.user?._id;
    const addressData = req.body;

    if (!userId) {
      return next(new AppError('User not authenticated', 401));
    }

    // Validate required fields
    const requiredFields = [
      'type',
      'firstName',
      'lastName',
      'address1',
      'city',
      'state',
      'zipCode',
    ];
    const missingFields = requiredFields.filter((field) => !addressData[field]);

    if (missingFields.length > 0) {
      return next(
        new AppError(
          `Missing required fields: ${missingFields.join(', ')}`,
          400,
        ),
      );
    }

    let profile = await UserProfile.findOne({ userId });

    if (!profile) {
      profile = await UserProfile.create({ userId, addresses: [] });
    }

    // If this is set as default, remove default from other addresses of same type
    if (addressData.isDefault) {
      profile.addresses.forEach((addr) => {
        if (addr.type === addressData.type) {
          addr.isDefault = false;
        }
      });
    }

    // Add new address
    profile.addresses.push(addressData);
    await profile.save();

    const newAddress = profile.addresses[profile.addresses.length - 1];

    res.status(201).json({
      success: true,
      data: {
        address: newAddress,
      },
    });
  },
);

// Update address
export const updateAddress = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const userId = req.user?._id;
    const { addressId } = req.params;
    const updateData = req.body;

    if (!userId) {
      return next(new AppError('User not authenticated', 401));
    }

    const profile = await UserProfile.findOne({ userId });

    if (!profile) {
      return next(new AppError('User profile not found', 404));
    }

    const address = (
      profile.addresses as unknown as Types.DocumentArray<IAddress>
    ).id(addressId);

    if (!address) {
      return next(new AppError('Address not found', 404));
    }

    // If setting as default, remove default from other addresses of same type
    if (updateData.isDefault && updateData.isDefault !== address.isDefault) {
      profile.addresses.forEach((addr) => {
        if (addr.type === address.type && addr._id.toString() !== addressId) {
          addr.isDefault = false;
        }
      });
    }

    // Update address fields
    Object.keys(updateData).forEach((key) => {
      if (updateData[key] !== undefined) {
        (address as any)[key] = updateData[key];
      }
    });

    await profile.save();

    res.status(200).json({
      success: true,
      data: {
        address,
      },
    });
  },
);

// Delete address
export const deleteAddress = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const userId = req.user?._id;
    const { addressId } = req.params;

    if (!userId) {
      return next(new AppError('User not authenticated', 401));
    }

    const profile = await UserProfile.findOne({ userId });

    if (!profile) {
      return next(new AppError('User profile not found', 404));
    }

    const address = (
      profile.addresses as unknown as Types.DocumentArray<IAddress>
    ).id(addressId);

    if (!address) {
      return next(new AppError('Address not found', 404));
    }

    address.deleteOne();
    await profile.save();

    res.status(204).json({
      success: true,
      data: null,
    });
  },
);

// Set default address
export const setDefaultAddress = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const userId = req.user?._id;
    const { addressId } = req.params;
    const { type } = req.body;

    if (!userId) {
      return next(new AppError('User not authenticated', 401));
    }

    if (!type || !['shipping', 'billing'].includes(type)) {
      return next(
        new AppError('Valid address type (shipping/billing) is required', 400),
      );
    }

    const profile = await UserProfile.findOne({ userId });

    if (!profile) {
      return next(new AppError('User profile not found', 404));
    }

    const address = (
      profile.addresses as unknown as Types.DocumentArray<IAddress>
    ).id(addressId);

    if (!address) {
      return next(new AppError('Address not found', 404));
    }

    // Remove default from other addresses of same type
    profile.addresses.forEach((addr) => {
      if (addr.type === type) {
        addr.isDefault = false;
      }
    });

    // Set this address as default
    address.isDefault = true;
    await profile.save();

    res.status(200).json({
      success: true,
      data: {
        address,
      },
    });
  },
);

// PAYMENT METHODS

// Get all user payment methods
export const getPaymentMethods = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const userId = req.user?._id;

    if (!userId) {
      return next(new AppError('User not authenticated', 401));
    }

    const profile = await UserProfile.findOne({ userId });
    const paymentMethods =
      profile?.paymentMethods?.filter((pm) => pm.isActive) || [];

    res.status(200).json({
      success: true,
      data: {
        paymentMethods,
      },
    });
  },
);

// Add new payment method
export const addPaymentMethod = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const userId = req.user?._id;
    const paymentData = req.body;

    if (!userId) {
      return next(new AppError('User not authenticated', 401));
    }

    // Validate required fields
    if (!paymentData.type || !paymentData.name) {
      return next(
        new AppError('Payment method type and name are required', 400),
      );
    }

    // Validate type-specific required fields
    if (paymentData.type === 'card') {
      if (
        !paymentData.cardLast4 ||
        !paymentData.cardBrand ||
        !paymentData.cardExpiry
      ) {
        return next(
          new AppError('Card details (last4, brand, expiry) are required', 400),
        );
      }
    } else if (paymentData.type === 'paypal') {
      if (!paymentData.paypalEmail) {
        return next(new AppError('PayPal email is required', 400));
      }
    } else if (paymentData.type === 'banktransfer') {
      if (!paymentData.bankName || !paymentData.accountLast4) {
        return next(
          new AppError('Bank name and account last 4 digits are required', 400),
        );
      }
    }

    let profile = await UserProfile.findOne({ userId });

    if (!profile) {
      profile = await UserProfile.create({ userId, paymentMethods: [] });
    }

    // If this is set as default, remove default from other payment methods
    if (paymentData.isDefault) {
      profile.paymentMethods.forEach((pm) => {
        pm.isDefault = false;
      });
    }

    // Add new payment method
    profile.paymentMethods.push({
      ...paymentData,
      isActive: true,
    });
    await profile.save();

    const newPaymentMethod =
      profile.paymentMethods[profile.paymentMethods.length - 1];

    res.status(201).json({
      success: true,
      data: {
        paymentMethod: newPaymentMethod,
      },
    });
  },
);

// Update payment method
export const updatePaymentMethod = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const userId = req.user?._id;
    const { paymentMethodId } = req.params;
    const updateData = req.body;

    if (!userId) {
      return next(new AppError('User not authenticated', 401));
    }

    const profile = await UserProfile.findOne({ userId });

    if (!profile) {
      return next(new AppError('User profile not found', 404));
    }

    const paymentMethod = (
      profile.paymentMethods as unknown as Types.DocumentArray<IPaymentMethod>
    ).id(paymentMethodId);

    if (!paymentMethod || !paymentMethod.isActive) {
      return next(new AppError('Payment method not found', 404));
    }

    // If setting as default, remove default from other payment methods
    if (
      updateData.isDefault &&
      updateData.isDefault !== paymentMethod.isDefault
    ) {
      profile.paymentMethods.forEach((pm) => {
        if (pm._id.toString() !== paymentMethodId) {
          pm.isDefault = false;
        }
      });
    }

    // Update payment method fields (except sensitive ones)
    const allowedFields = ['name', 'isDefault'];
    Object.keys(updateData).forEach((key) => {
      if (allowedFields.includes(key) && updateData[key] !== undefined) {
        (paymentMethod as any)[key] = updateData[key];
      }
    });

    await profile.save();

    res.status(200).json({
      success: true,
      data: {
        paymentMethod,
      },
    });
  },
);

// Delete payment method (soft delete)
export const deletePaymentMethod = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const userId = req.user?._id;
    const { paymentMethodId } = req.params;

    if (!userId) {
      return next(new AppError('User not authenticated', 401));
    }

    const profile = await UserProfile.findOne({ userId });

    if (!profile) {
      return next(new AppError('User profile not found', 404));
    }

    const paymentMethod = (
      profile.paymentMethods as unknown as Types.DocumentArray<IPaymentMethod>
    ).id(paymentMethodId);

    if (!paymentMethod || !paymentMethod.isActive) {
      return next(new AppError('Payment method not found', 404));
    }

    // Soft delete by setting isActive to false
    paymentMethod.isActive = false;
    paymentMethod.isDefault = false;

    await profile.save();

    res.status(204).json({
      success: true,
      data: null,
    });
  },
);

// Set default payment method
export const setDefaultPaymentMethod = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const userId = req.user?._id;
    const { paymentMethodId } = req.params;

    if (!userId) {
      return next(new AppError('User not authenticated', 401));
    }

    const profile = await UserProfile.findOne({ userId });

    if (!profile) {
      return next(new AppError('User profile not found', 404));
    }

    const paymentMethod = (
      profile.paymentMethods as unknown as Types.DocumentArray<IPaymentMethod>
    ).id(paymentMethodId);

    if (!paymentMethod || !paymentMethod.isActive) {
      return next(new AppError('Payment method not found', 404));
    }

    // Remove default from other payment methods
    profile.paymentMethods.forEach((pm) => {
      pm.isDefault = false;
    });

    // Set this payment method as default
    paymentMethod.isDefault = true;
    await profile.save();

    res.status(200).json({
      success: true,
      data: {
        paymentMethod,
      },
    });
  },
);

// Get default addresses
export const getDefaultAddresses = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const userId = req.user?._id;

    if (!userId) {
      return next(new AppError('User not authenticated', 401));
    }

    const profile = await UserProfile.findOne({ userId });

    if (!profile) {
      return res.status(200).json({
        success: true,
        data: {
          shippingAddress: null,
          billingAddress: null,
        },
      });
    }

    const shippingAddress = profile.addresses.find(
      (addr) => addr.type === 'shipping' && addr.isDefault,
    );
    const billingAddress = profile.addresses.find(
      (addr) => addr.type === 'billing' && addr.isDefault,
    );

    res.status(200).json({
      success: true,
      data: {
        shippingAddress: shippingAddress || null,
        billingAddress: billingAddress || null,
      },
    });
  },
);

// Get default payment method
export const getDefaultPaymentMethod = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const userId = req.user?._id;

    if (!userId) {
      return next(new AppError('User not authenticated', 401));
    }

    const profile = await UserProfile.findOne({ userId });
    const defaultPaymentMethod = profile?.paymentMethods?.find(
      (pm) => pm.isDefault && pm.isActive,
    );

    res.status(200).json({
      success: true,
      data: {
        paymentMethod: defaultPaymentMethod || null,
      },
    });
  },
);

// LOYALTY PROGRAM

// Get loyalty profile
export const getLoyaltyProfile = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const userId = req.user?._id;

    if (!userId) {
      return next(new AppError('User not authenticated', 401));
    }

    let profile = await UserProfile.findOne({ userId });

    if (!profile) {
      profile = await UserProfile.create({ userId });
    }

    res.status(200).json({
      success: true,
      data: {
        loyaltyProfile: profile.loyaltyProfile,
      },
    });
  },
);

// Update loyalty points (admin only)
export const updateLoyaltyPoints = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const { userId } = req.params;
    const { points, reason } = req.body;

    if (!points || typeof points !== 'number') {
      return next(
        new AppError('Points amount is required and must be a number', 400),
      );
    }

    const profile = await UserProfile.findOne({ userId });

    if (!profile) {
      return next(new AppError('User profile not found', 404));
    }

    if (!profile.loyaltyProfile) {
      profile.loyaltyProfile = {
        tier: 'bronze',
        points: 0,
        lifetimePoints: 0,
        referralCode: generateReferralCode(),
      };
    }

    // Update points
    profile.loyaltyProfile.points += points;
    if (points > 0) {
      profile.loyaltyProfile.lifetimePoints += points;
    }

    // Ensure points don't go negative
    if (profile.loyaltyProfile.points < 0) {
      profile.loyaltyProfile.points = 0;
    }

    // Update tier based on lifetime points
    const lifetimePoints = profile.loyaltyProfile.lifetimePoints;
    if (lifetimePoints >= 10000) {
      profile.loyaltyProfile.tier = 'platinum';
    } else if (lifetimePoints >= 5000) {
      profile.loyaltyProfile.tier = 'gold';
    } else if (lifetimePoints >= 1000) {
      profile.loyaltyProfile.tier = 'silver';
    } else {
      profile.loyaltyProfile.tier = 'bronze';
    }

    await profile.save();

    res.status(200).json({
      success: true,
      data: {
        loyaltyProfile: profile.loyaltyProfile,
        reason,
      },
    });
  },
);

// Apply referral code
export const applyReferralCode = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const userId = req.user?._id;
    const { referralCode } = req.body;

    if (!userId) {
      return next(new AppError('User not authenticated', 401));
    }

    if (!referralCode) {
      return next(new AppError('Referral code is required', 400));
    }

    // Find the referring user
    const referrerProfile = await UserProfile.findOne({
      'loyaltyProfile.referralCode': referralCode,
    });

    if (!referrerProfile) {
      return next(new AppError('Invalid referral code', 400));
    }

    // Get current user profile
    let profile = await UserProfile.findOne({ userId });

    if (!profile) {
      profile = await UserProfile.create({ userId });
    }

    // Check if user already used a referral code
    if (profile.loyaltyProfile?.referredBy) {
      return next(new AppError('You have already used a referral code', 400));
    }

    // Can't refer yourself
    if (referrerProfile.userId.toString() === userId.toString()) {
      return next(new AppError('You cannot use your own referral code', 400));
    }

    // Apply referral
    if (!profile.loyaltyProfile) {
      profile.loyaltyProfile = {
        tier: 'bronze',
        points: 0,
        lifetimePoints: 0,
        referralCode: generateReferralCode(),
      };
    }

    profile.loyaltyProfile.referredBy = referrerProfile.userId;
    profile.loyaltyProfile.points += 500; // Bonus points for using referral
    profile.loyaltyProfile.lifetimePoints += 500;

    // Give points to referrer
    if (!referrerProfile.loyaltyProfile) {
      referrerProfile.loyaltyProfile = {
        tier: 'bronze',
        points: 0,
        lifetimePoints: 0,
        referralCode: generateReferralCode(),
      };
    }

    referrerProfile.loyaltyProfile.points += 1000; // Bonus for successful referral
    referrerProfile.loyaltyProfile.lifetimePoints += 1000;

    await Promise.all([profile.save(), referrerProfile.save()]);

    res.status(200).json({
      success: true,
      message: 'Referral code applied successfully! You earned 500 points.',
      data: {
        loyaltyProfile: profile.loyaltyProfile,
      },
    });
  },
);

function generateReferralCode(): string {
  return Math.random().toString(36).substring(2, 10).toUpperCase();
}
