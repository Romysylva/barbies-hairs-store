import { Request, Response, NextFunction } from 'express';
import { Cart, ICart, Coupon, ShippingMethod } from '../models/cartModel.js';
import { Product } from '../models/productModules.js';
import { User } from '../models/userModle.js';
import catchAsync from '../utils/catchAsync.js';
import AppError from '../utils/appError.js';
// import type {Request} '../types/express.js';

type AuthenticatedRequest = Request;

// Get user cart
export const getCart = catchAsync(
  async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    const userId = req.user?._id;
    const sessionId = req.headers['x-session-id'] as string;

    let cart;
    if (userId) {
      cart = await (Cart as any).findUserCart(userId);
      if (!cart) {
        cart = await (Cart as any).createUserCart(userId);
      }
    } else if (sessionId) {
      cart = await (Cart as any).findGuestCart(sessionId);
      if (!cart) {
        cart = await (Cart as any).createGuestCart(sessionId);
      }
    } else {
      return next(new AppError('User ID or Session ID required', 400));
    }

    res.status(200).json({
      status: 'success',
      data: {
        cart,
      },
    });
  },
);

// Add item to cart
export const addToCart = catchAsync(
  async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    const {
      productId,
      quantity = 1,
      variationId,
      selectedAttributes,
      personalization,
    } = req.body;
    const userId = req.user?._id;
    const sessionId = req.headers['x-session-id'] as string;

    // Validate product exists and is in stock
    const product = await Product.findById(productId);
    if (!product) {
      return next(new AppError('Product not found', 404));
    }

    if (product.quantity < quantity) {
      return next(new AppError('Insufficient stock', 400));
    }

    // Get or create cart
    let cart;
    if (userId) {
      cart = await (Cart as any).findUserCart(userId);
      if (!cart) {
        cart = await (Cart as any).createUserCart(userId);
      }
    } else if (sessionId) {
      cart = await (Cart as any).findGuestCart(sessionId);
      if (!cart) {
        cart = await (Cart as any).createGuestCart(sessionId);
      }
    } else {
      return next(new AppError('User ID or Session ID required', 400));
    }

    // Check if item already exists in cart
    const existingItemIndex = cart.items.findIndex(
      (item: any) =>
        item.product.toString() === productId &&
        (!variationId || item.variation?.toString() === variationId) &&
        !item.savedForLater,
    );

    if (existingItemIndex !== -1) {
      // Update existing item quantity
      const newQuantity = cart.items[existingItemIndex].quantity + quantity;
      if (newQuantity > product.quantity) {
        return next(
          new AppError('Cannot add more items than available in stock', 400),
        );
      }
      cart.items[existingItemIndex].quantity = newQuantity;
    } else {
      // Add new item
      const currentPrice = product.priceDiscount || product.price;
      cart.items.push({
        product: productId,
        variation: variationId,
        quantity,
        price: currentPrice,
        selectedAttributes,
        personalization,
        addedAt: new Date(),
        savedForLater: false,
      } as any);
    }

    await cart.save();

    // Populate cart items
    await cart.populate({
      path: 'items.product',
      select: 'name price priceDiscount imageCover category quantity',
    });

    res.status(200).json({
      status: 'success',
      data: {
        cart,
      },
    });
  },
);

// Update cart item quantity
export const updateCartItem = catchAsync(
  async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    const { itemId } = req.params;
    const { quantity } = req.body;
    const userId = req.user?._id;
    const sessionId = req.headers['x-session-id'] as string;

    if (quantity < 1) {
      return next(new AppError('Quantity must be at least 1', 400));
    }

    // Get cart
    let cart;
    if (userId) {
      cart = await (Cart as any).findUserCart(userId);
    } else if (sessionId) {
      cart = await (Cart as any).findGuestCart(sessionId);
    }

    if (!cart) {
      return next(new AppError('Cart not found', 404));
    }

    const itemIndex = cart.items.findIndex(
      (item: any) => item._id.toString() === itemId,
    );
    if (itemIndex === -1) {
      return next(new AppError('Cart item not found', 404));
    }

    // Validate stock availability
    const product = await Product.findById(cart.items[itemIndex].product);
    if (!product) {
      return next(new AppError('Product not found', 404));
    }

    if (product.quantity < quantity) {
      return next(new AppError('Insufficient stock', 400));
    }

    cart.items[itemIndex].quantity = quantity;
    await cart.save();

    res.status(200).json({
      status: 'success',
      data: {
        cart,
      },
    });
  },
);

// Remove item from cart
export const removeFromCart = catchAsync(
  async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    const { itemId } = req.params;
    const userId = req.user?._id;
    const sessionId = req.headers['x-session-id'] as string;

    // Get cart
    let cart;
    if (userId) {
      cart = await (Cart as any).findUserCart(userId);
    } else if (sessionId) {
      cart = await (Cart as any).findGuestCart(sessionId);
    }

    if (!cart) {
      return next(new AppError('Cart not found', 404));
    }

    const itemIndex = cart.items.findIndex(
      (item: any) => item._id.toString() === itemId,
    );
    if (itemIndex === -1) {
      return next(new AppError('Cart item not found', 404));
    }

    cart.items.splice(itemIndex, 1);
    await cart.save();

    res.status(200).json({
      status: 'success',
      data: {
        cart,
      },
    });
  },
);

// Save item for later
export const saveForLater = catchAsync(
  async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    const { itemId } = req.params;
    const userId = req.user?._id;
    const sessionId = req.headers['x-session-id'] as string;

    // Get cart
    let cart;
    if (userId) {
      cart = await (Cart as any).findUserCart(userId);
    } else if (sessionId) {
      cart = await (Cart as any).findGuestCart(sessionId);
    }

    if (!cart) {
      return next(new AppError('Cart not found', 404));
    }

    const itemIndex = cart.items.findIndex(
      (item: any) => item._id.toString() === itemId,
    );
    if (itemIndex === -1) {
      return next(new AppError('Cart item not found', 404));
    }

    const item = cart.items[itemIndex];
    cart.items.splice(itemIndex, 1);
    cart.savedItems.push(item);

    await cart.save();

    res.status(200).json({
      status: 'success',
      data: {
        cart,
      },
    });
  },
);

// Move item back to cart from saved
export const moveToCart = catchAsync(
  async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    const { itemId } = req.params;
    const userId = req.user?._id;
    const sessionId = req.headers['x-session-id'] as string;

    // Get cart
    let cart;
    if (userId) {
      cart = await (Cart as any).findUserCart(userId);
    } else if (sessionId) {
      cart = await (Cart as any).findGuestCart(sessionId);
    }

    if (!cart) {
      return next(new AppError('Cart not found', 404));
    }

    const itemIndex = cart.savedItems.findIndex(
      (item: any) => item._id.toString() === itemId,
    );
    if (itemIndex === -1) {
      return next(new AppError('Saved item not found', 404));
    }

    // Validate stock before moving back
    const item = cart.savedItems[itemIndex];
    const product = await Product.findById(item.product);
    if (!product) {
      return next(new AppError('Product no longer exists', 404));
    }

    if (product.quantity < item.quantity) {
      return next(
        new AppError('Insufficient stock to move item back to cart', 400),
      );
    }

    cart.savedItems.splice(itemIndex, 1);
    cart.items.push(item);

    await cart.save();

    res.status(200).json({
      status: 'success',
      data: {
        cart,
      },
    });
  },
);

// Clear cart
export const clearCart = catchAsync(
  async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    const userId = req.user?._id;
    const sessionId = req.headers['x-session-id'] as string;

    // Get cart
    let cart;
    if (userId) {
      cart = await (Cart as any).findUserCart(userId);
    } else if (sessionId) {
      cart = await (Cart as any).findGuestCart(sessionId);
    }

    if (!cart) {
      return next(new AppError('Cart not found', 404));
    }

    cart.items = [];
    cart.appliedCoupons = [];
    await cart.save();

    res.status(200).json({
      status: 'success',
      data: {
        cart,
      },
    });
  },
);

// Apply coupon
export const applyCoupon = catchAsync(
  async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    const { code } = req.body;
    const userId = req.user?._id;
    const sessionId = req.headers['x-session-id'] as string;

    // Get cart
    let cart;
    if (userId) {
      cart = await (Cart as any).findUserCart(userId);
    } else if (sessionId) {
      cart = await (Cart as any).findGuestCart(sessionId);
    }

    if (!cart) {
      return next(new AppError('Cart not found', 404));
    }

    if (cart.items.length === 0) {
      return next(new AppError('Cannot apply coupon to empty cart', 400));
    }

    // Find and validate coupon
    const coupon = await Coupon.findOne({
      code: code.toUpperCase(),
      isActive: true,
    });
    if (!coupon) {
      return next(new AppError('Invalid or expired coupon code', 400));
    }

    // Check if coupon is currently valid
    const now = new Date();
    if (coupon.validFrom > now || coupon.validTo < now) {
      return next(new AppError('Coupon is not currently valid', 400));
    }

    // Check usage limits
    if (coupon.usageLimit && coupon.usageCount >= coupon.usageLimit) {
      return next(new AppError('Coupon usage limit exceeded', 400));
    }

    // Check if already applied
    const alreadyApplied = cart.appliedCoupons.some(
      (applied: any) => applied.coupon.toString() === coupon._id.toString(),
    );
    if (alreadyApplied) {
      return next(new AppError('Coupon already applied', 400));
    }

    // Check minimum amount
    if (coupon.minimumAmount && cart.subtotal < coupon.minimumAmount) {
      return next(
        new AppError(
          `Minimum order amount of $${coupon.minimumAmount} required`,
          400,
        ),
      );
    }

    // Calculate discount
    let discountAmount = 0;
    if (coupon.type === 'percentage') {
      discountAmount = (cart.subtotal * coupon.value) / 100;
      if (coupon.maximumDiscount) {
        discountAmount = Math.min(discountAmount, coupon.maximumDiscount);
      }
    } else if (coupon.type === 'fixed_amount') {
      discountAmount = Math.min(coupon.value, cart.subtotal);
    } else if (coupon.type === 'free_shipping') {
      // Will be handled in shipping calculation
      discountAmount = 0;
    }

    // Apply coupon
    cart.appliedCoupons.push({
      coupon: coupon._id,
      discountAmount,
      appliedAt: new Date(),
    } as any);

    // Update coupon usage count
    coupon.usageCount += 1;
    await coupon.save();

    await cart.save();

    res.status(200).json({
      status: 'success',
      data: {
        cart,
        coupon: {
          code: coupon.code,
          name: coupon.name,
          discountAmount,
        },
      },
    });
  },
);

// Remove coupon
export const removeCoupon = catchAsync(
  async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    const { couponId } = req.params;
    const userId = req.user?._id;
    const sessionId = req.headers['x-session-id'] as string;

    // Get cart
    let cart;
    if (userId) {
      cart = await (Cart as any).findUserCart(userId);
    } else if (sessionId) {
      cart = await (Cart as any).findGuestCart(sessionId);
    }

    if (!cart) {
      return next(new AppError('Cart not found', 404));
    }

    const couponIndex = cart.appliedCoupons.findIndex(
      (applied: any) => applied.coupon.toString() === couponId,
    );

    if (couponIndex === -1) {
      return next(new AppError('Coupon not found in cart', 404));
    }

    // Decrement usage count
    const appliedCoupon = cart.appliedCoupons[couponIndex];
    const coupon = await Coupon.findById(appliedCoupon.coupon);
    if (coupon) {
      coupon.usageCount = Math.max(0, coupon.usageCount - 1);
      await coupon.save();
    }

    cart.appliedCoupons.splice(couponIndex, 1);
    await cart.save();

    res.status(200).json({
      status: 'success',
      data: {
        cart,
      },
    });
  },
);

// Get available coupons for cart
export const getAvailableCoupons = catchAsync(
  async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    const userId = req.user?._id;
    const sessionId = req.headers['x-session-id'] as string;

    // Get cart
    let cart;
    if (userId) {
      cart = await (Cart as any).findUserCart(userId);
    } else if (sessionId) {
      cart = await (Cart as any).findGuestCart(sessionId);
    }

    if (!cart || cart.items.length === 0) {
      return res.status(200).json({
        status: 'success',
        data: {
          coupons: [],
        },
      });
    }

    const now = new Date();

    // Get valid coupons
    const validCoupons = await Coupon.find({
      isActive: true,
      validFrom: { $lte: now },
      validTo: { $gte: now },
      $and: [
        {
          $or: [
            { usageLimit: { $exists: false } },
            { $expr: { $lt: ['$usageCount', '$usageLimit'] } },
          ],
        },
        {
          $or: [
            { minimumAmount: { $exists: false } },
            { minimumAmount: { $lte: cart.subtotal } },
          ],
        },
      ],
    });

    // Filter out already applied coupons
    const appliedCouponIds = cart.appliedCoupons.map((applied: any) =>
      applied.coupon.toString(),
    );
    const availableCoupons = validCoupons.filter(
      (coupon) => !appliedCouponIds.includes(coupon._id.toString()),
    );

    res.status(200).json({
      status: 'success',
      results: availableCoupons.length,
      data: {
        coupons: availableCoupons,
      },
    });
  },
);

// Get shipping methods for cart
export const getShippingMethods = catchAsync(
  async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    const userId = req.user?._id;
    const sessionId = req.headers['x-session-id'] as string;

    // Get cart
    let cart;
    if (userId) {
      cart = await (Cart as any).findUserCart(userId);
    } else if (sessionId) {
      cart = await (Cart as any).findGuestCart(sessionId);
    }

    if (!cart) {
      return next(new AppError('Cart not found', 404));
    }

    // Get available shipping methods
    const shippingMethods = await ShippingMethod.find({ isActive: true }).sort({
      cost: 1,
    });

    // Apply free shipping logic
    const methodsWithPricing = shippingMethods.map((method) => {
      let finalCost = method.cost;

      // Check for free shipping threshold
      if (
        method.freeShippingThreshold &&
        cart.subtotal >= method.freeShippingThreshold
      ) {
        finalCost = 0;
      }

      // Check for free shipping coupon
      const hasFreeShippingCoupon = cart.appliedCoupons.some((applied: any) => {
        // This would need to be populated to check coupon type
        return false; // Placeholder
      });

      if (hasFreeShippingCoupon) {
        finalCost = 0;
      }

      return {
        ...method.toObject(),
        finalCost,
        estimatedDelivery: new Date(
          Date.now() + method.estimatedDays * 24 * 60 * 60 * 1000,
        ),
      };
    });

    res.status(200).json({
      status: 'success',
      data: {
        methods: methodsWithPricing,
      },
    });
  },
);

// Update shipping method
export const updateShippingMethod = catchAsync(
  async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    const { shippingMethodId } = req.body;
    const userId = req.user?._id;
    const sessionId = req.headers['x-session-id'] as string;

    // Validate shipping method
    const shippingMethod = await ShippingMethod.findById(shippingMethodId);
    if (!shippingMethod || !shippingMethod.isActive) {
      return next(new AppError('Invalid shipping method', 400));
    }

    // Get cart
    let cart;
    if (userId) {
      cart = await (Cart as any).findUserCart(userId);
    } else if (sessionId) {
      cart = await (Cart as any).findGuestCart(sessionId);
    }

    if (!cart) {
      return next(new AppError('Cart not found', 404));
    }

    // Calculate shipping cost
    let shippingCost = shippingMethod.cost;

    // Apply free shipping logic
    if (
      shippingMethod.freeShippingThreshold &&
      cart.subtotal >= shippingMethod.freeShippingThreshold
    ) {
      shippingCost = 0;
    }

    // Check for free shipping coupon
    const hasFreeShippingCoupon = cart.appliedCoupons.some((applied: any) => {
      // Would need coupon populated
      return false; // Placeholder
    });

    if (hasFreeShippingCoupon) {
      shippingCost = 0;
    }

    cart.shippingMethod = shippingMethodId;
    cart.shipping = shippingCost;
    cart.estimatedDelivery = new Date(
      Date.now() + shippingMethod.estimatedDays * 24 * 60 * 60 * 1000,
    );

    await cart.save();

    res.status(200).json({
      status: 'success',
      data: {
        cart,
      },
    });
  },
);

// Validate coupon
export const validateCoupon = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const { code, subtotal, userId } = req.body;

    const coupon = await Coupon.findOne({
      code: code.toUpperCase(),
      isActive: true,
    });

    if (!coupon) {
      return res.status(200).json({
        status: 'success',
        data: {
          valid: false,
          message: 'Invalid coupon code',
        },
      });
    }

    const now = new Date();
    if (coupon.validFrom > now || coupon.validTo < now) {
      return res.status(200).json({
        status: 'success',
        data: {
          valid: false,
          message: 'Coupon is not currently valid',
        },
      });
    }

    if (coupon.usageLimit && coupon.usageCount >= coupon.usageLimit) {
      return res.status(200).json({
        status: 'success',
        data: {
          valid: false,
          message: 'Coupon usage limit exceeded',
        },
      });
    }

    if (coupon.minimumAmount && subtotal < coupon.minimumAmount) {
      return res.status(200).json({
        status: 'success',
        data: {
          valid: false,
          message: `Minimum order amount of $${coupon.minimumAmount} required`,
        },
      });
    }

    // Calculate potential discount
    let discountAmount = 0;
    if (coupon.type === 'percentage') {
      discountAmount = (subtotal * coupon.value) / 100;
      if (coupon.maximumDiscount) {
        discountAmount = Math.min(discountAmount, coupon.maximumDiscount);
      }
    } else if (coupon.type === 'fixed_amount') {
      discountAmount = Math.min(coupon.value, subtotal);
    }

    res.status(200).json({
      status: 'success',
      data: {
        valid: true,
        coupon: {
          code: coupon.code,
          name: coupon.name,
          type: coupon.type,
          value: coupon.value,
          discountAmount,
        },
      },
    });
  },
);

// Merge guest cart with user cart (when user logs in)
export const mergeGuestCart = catchAsync(
  async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    const { guestSessionId } = req.body;
    const userId = req.user?._id;

    if (!guestSessionId) {
      return next(new AppError('Guest session ID required', 400));
    }

    // Get guest cart
    const guestCart = await (Cart as any).findGuestCart(guestSessionId);
    if (!guestCart || guestCart.items.length === 0) {
      return res.status(200).json({
        status: 'success',
        data: {
          message: 'No guest cart to merge',
        },
      });
    }

    // Get or create user cart
    let userCart = await (Cart as any).findUserCart(userId);
    if (!userCart) {
      userCart = await (Cart as any).createUserCart(userId);
    }

    // Merge items (avoid duplicates)
    for (const guestItem of guestCart.items) {
      const existingItemIndex = userCart.items.findIndex(
        (item: any) =>
          item.product.toString() === guestItem.product.toString() &&
          (!guestItem.variation ||
            item.variation?.toString() === guestItem.variation?.toString()),
      );

      if (existingItemIndex !== -1) {
        // Update quantity
        userCart.items[existingItemIndex].quantity += guestItem.quantity;
      } else {
        // Add new item
        userCart.items.push(guestItem);
      }
    }

    // Merge saved items
    for (const savedItem of guestCart.savedItems) {
      const existingItemIndex = userCart.savedItems.findIndex(
        (item: any) =>
          item.product.toString() === savedItem.product.toString() &&
          (!savedItem.variation ||
            item.variation?.toString() === savedItem.variation?.toString()),
      );

      if (existingItemIndex === -1) {
        userCart.savedItems.push(savedItem);
      }
    }

    await userCart.save();

    // Delete guest cart
    await Cart.findByIdAndDelete(guestCart._id);

    res.status(200).json({
      status: 'success',
      data: {
        cart: userCart,
      },
    });
  },
);
