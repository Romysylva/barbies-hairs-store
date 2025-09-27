import { Request, Response, NextFunction } from 'express';
import { Wishlist, IWishlist, StockAlert } from '../models/wishlistModel.js';
import { Product } from '../models/productModules.js';
import { User } from '../models/userModle.js';
import catchAsync from '../utils/catchAsync.js';
import AppError from '../utils/appError.js';
// import '../types/express.js';

type AuthenticatedRequest = Request;

// Get all user wishlists
export const getUserWishlists = catchAsync(
  async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    const wishlists = await Wishlist.find({ userId: req.user?._id })
      .populate({
        path: 'items.product',
        select:
          'name price priceDiscount imageCover ratingsAverage ratingsQuantity category slug',
      })
      .sort({ updatedAt: -1 });

    res.status(200).json({
      status: 'success',
      results: wishlists.length,
      data: {
        wishlists,
      },
    });
  },
);

// Get specific wishlist
export const getWishlist = catchAsync(
  async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    const { id } = req.params;

    const wishlist = await Wishlist.findOne({
      _id: id,
      userId: req.user?._id,
    }).populate({
      path: 'items.product',
      select:
        'name price priceDiscount imageCover ratingsAverage ratingsQuantity category slug quantity',
    });

    if (!wishlist) {
      return next(new AppError('Wishlist not found', 404));
    }

    res.status(200).json({
      status: 'success',
      data: {
        wishlist,
      },
    });
  },
);

// Create new wishlist
export const createWishlist = catchAsync(
  async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    const { name, privacy = 'private' } = req.body;

    if (!name || name.trim().length === 0) {
      return next(new AppError('Wishlist name is required', 400));
    }

    // Check if user already has a wishlist with this name
    const existingWishlist = await Wishlist.findOne({
      userId: req.user?._id,
      name: name.trim(),
    });

    if (existingWishlist) {
      return next(
        new AppError('You already have a wishlist with this name', 400),
      );
    }

    const wishlist = await Wishlist.create({
      userId: req.user?._id,
      name: name.trim(),
      privacy,
      items: [],
    });

    res.status(201).json({
      status: 'success',
      data: {
        wishlist,
      },
    });
  },
);

// Update wishlist
export const updateWishlist = catchAsync(
  async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    const { id } = req.params;
    const { name, privacy } = req.body;

    const wishlist = await Wishlist.findOneAndUpdate(
      { _id: id, userId: req.user?._id },
      { name, privacy },
      { new: true, runValidators: true },
    );

    if (!wishlist) {
      return next(new AppError('Wishlist not found', 404));
    }

    res.status(200).json({
      status: 'success',
      data: {
        wishlist,
      },
    });
  },
);

// Delete wishlist
export const deleteWishlist = catchAsync(
  async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    const { id } = req.params;

    const wishlist = await Wishlist.findOneAndDelete({
      _id: id,
      userId: req.user?._id,
    });

    if (!wishlist) {
      return next(new AppError('Wishlist not found', 404));
    }

    res.status(204).json({
      status: 'success',
      data: null,
    });
  },
);

// Add item to wishlist
export const addToWishlist = catchAsync(
  async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    const { id } = req.params; // wishlist id
    const { productId, variationId, notes } = req.body;

    // Validate product exists
    const product = await Product.findById(productId);
    if (!product) {
      return next(new AppError('Product not found', 404));
    }

    const wishlist = await Wishlist.findOne({
      _id: id,
      userId: req.user?._id,
    });

    if (!wishlist) {
      return next(new AppError('Wishlist not found', 404));
    }

    // Check if item already exists
    const existingItem = wishlist.items.find(
      (item) =>
        item.product.toString() === productId &&
        (!variationId || item.variation?.toString() === variationId),
    );

    if (existingItem) {
      return next(new AppError('Product is already in this wishlist', 400));
    }

    // Add item
    wishlist.items.push({
      product: productId,
      variation: variationId,
      notes: notes?.trim(),
      addedAt: new Date(),
    } as any);

    await wishlist.save();

    // Populate the new item
    await wishlist.populate({
      path: 'items.product',
      select:
        'name price priceDiscount imageCover ratingsAverage ratingsQuantity category slug',
    });

    res.status(200).json({
      status: 'success',
      data: {
        wishlist,
      },
    });
  },
);

// Remove item from wishlist
export const removeFromWishlist = catchAsync(
  async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    const { id, productId } = req.params; // wishlist id, product id

    const wishlist = await Wishlist.findOne({
      _id: id,
      userId: req.user?._id,
    });

    if (!wishlist) {
      return next(new AppError('Wishlist not found', 404));
    }

    const itemIndex = wishlist.items.findIndex(
      (item) => item.product.toString() === productId,
    );

    if (itemIndex === -1) {
      return next(new AppError('Product not found in wishlist', 404));
    }

    wishlist.items.splice(itemIndex, 1);
    await wishlist.save();

    res.status(200).json({
      status: 'success',
      data: {
        wishlist,
      },
    });
  },
);

// Clear entire wishlist
export const clearWishlist = catchAsync(
  async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    const { id } = req.params;

    const wishlist = await Wishlist.findOne({
      _id: id,
      userId: req.user?._id,
    });

    if (!wishlist) {
      return next(new AppError('Wishlist not found', 404));
    }

    wishlist.items = [];
    await wishlist.save();

    res.status(200).json({
      status: 'success',
      data: {
        wishlist,
      },
    });
  },
);

// Share wishlist
export const shareWishlist = catchAsync(
  async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    const { id } = req.params;

    const wishlist = await Wishlist.findOne({
      _id: id,
      userId: req.user?._id,
    });

    if (!wishlist) {
      return next(new AppError('Wishlist not found', 404));
    }

    wishlist.privacy = 'shared';
    await wishlist.save();

    const shareUrl = `${req.protocol}://${req.get('host')}/shared/wishlist/${wishlist.shareToken}`;

    res.status(200).json({
      status: 'success',
      data: {
        shareUrl,
        shareToken: wishlist.shareToken,
      },
    });
  },
);

// Get shared wishlist (public access)
export const getSharedWishlist = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const { token } = req.params;

    const wishlist = await Wishlist.findOne({
      shareToken: token,
      privacy: 'shared',
    })
      .populate({
        path: 'items.product',
        select:
          'name price priceDiscount imageCover ratingsAverage ratingsQuantity category slug',
      })
      .populate({
        path: 'userId',
        select: 'name',
      });

    if (!wishlist) {
      return next(new AppError('Shared wishlist not found', 404));
    }

    res.status(200).json({
      status: 'success',
      data: {
        wishlist,
      },
    });
  },
);

// Set price alert for wishlist item
export const setPriceAlert = catchAsync(
  async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    const { id, productId } = req.params; // wishlist id, product id
    const { targetPrice } = req.body;

    if (!targetPrice || targetPrice <= 0) {
      return next(new AppError('Valid target price is required', 400));
    }

    const wishlist = await Wishlist.findOne({
      _id: id,
      userId: req.user?._id,
    });

    if (!wishlist) {
      return next(new AppError('Wishlist not found', 404));
    }

    const item = wishlist.items.find(
      (item) => item.product.toString() === productId,
    );

    if (!item) {
      return next(new AppError('Product not found in wishlist', 404));
    }

    item.priceAlert = {
      enabled: true,
      targetPrice,
    };

    await wishlist.save();

    res.status(200).json({
      status: 'success',
      data: {
        message: 'Price alert set successfully',
      },
    });
  },
);

// Set stock alert for wishlist item
export const setStockAlert = catchAsync(
  async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    const { id, productId } = req.params; // wishlist id, product id
    const { enabled } = req.body;

    const wishlist = await Wishlist.findOne({
      _id: id,
      userId: req.user?._id,
    });

    if (!wishlist) {
      return next(new AppError('Wishlist not found', 404));
    }

    const item = wishlist.items.find(
      (item) => item.product.toString() === productId,
    );

    if (!item) {
      return next(new AppError('Product not found in wishlist', 404));
    }

    item.stockAlert = enabled;

    // Also create/update stock alert record
    if (enabled) {
      await StockAlert.findOneAndUpdate(
        {
          userId: req.user?._id,
          productId,
          variationId: item.variation,
        },
        {
          email: req.user?.email,
          notifyEmail: true,
          isActive: true,
        },
        {
          upsert: true,
          new: true,
        },
      );
    } else {
      await StockAlert.findOneAndUpdate(
        {
          userId: req.user?._id,
          productId,
          variationId: item.variation,
        },
        {
          isActive: false,
        },
      );
    }

    await wishlist.save();

    res.status(200).json({
      status: 'success',
      data: {
        message: `Stock alert ${enabled ? 'enabled' : 'disabled'} successfully`,
      },
    });
  },
);

// Move item from wishlist to cart (placeholder - requires cart implementation)
export const moveToCart = catchAsync(
  async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    const { id, productId } = req.params;
    const { quantity = 1 } = req.body;

    const wishlist = await Wishlist.findOne({
      _id: id,
      userId: req.user?._id,
    });

    if (!wishlist) {
      return next(new AppError('Wishlist not found', 404));
    }

    const itemIndex = wishlist.items.findIndex(
      (item) => item.product.toString() === productId,
    );

    if (itemIndex === -1) {
      return next(new AppError('Product not found in wishlist', 404));
    }

    const item = wishlist.items[itemIndex];

    // TODO: Integrate with cart system when implemented
    // await cartService.addToCart(req.user._id, item.product, quantity, item.variation);

    // Remove from wishlist
    wishlist.items.splice(itemIndex, 1);
    await wishlist.save();

    res.status(200).json({
      status: 'success',
      data: {
        message: 'Item moved to cart successfully',
        wishlist,
      },
    });
  },
);

// Get stock alerts for user
export const getUserStockAlerts = catchAsync(
  async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    const stockAlerts = await StockAlert.find({
      userId: req.user?._id,
      isActive: true,
    })
      .populate({
        path: 'productId',
        select: 'name price imageCover quantity',
      })
      .sort({ createdAt: -1 });

    res.status(200).json({
      status: 'success',
      results: stockAlerts.length,
      data: {
        stockAlerts,
      },
    });
  },
);

// Create stock alert
export const createStockAlert = catchAsync(
  async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    const {
      productId,
      variationId,
      notifyEmail = true,
      notifySms = false,
    } = req.body;

    // Validate product exists
    const product = await Product.findById(productId);
    if (!product) {
      return next(new AppError('Product not found', 404));
    }

    // Check if product is already in stock
    if (product.quantity > 0) {
      return next(new AppError('Product is currently in stock', 400));
    }

    const stockAlert = await StockAlert.findOneAndUpdate(
      {
        userId: req.user?._id,
        productId,
        variationId,
      },
      {
        email: req.user?.email,
        notifyEmail,
        notifySms,
        isActive: true,
      },
      {
        upsert: true,
        new: true,
      },
    );

    res.status(201).json({
      status: 'success',
      data: {
        stockAlert,
      },
    });
  },
);

// Delete stock alert
export const deleteStockAlert = catchAsync(
  async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    const { id } = req.params;

    const stockAlert = await StockAlert.findOneAndUpdate(
      {
        _id: id,
        userId: req.user?._id,
      },
      {
        isActive: false,
      },
      {
        new: true,
      },
    );

    if (!stockAlert) {
      return next(new AppError('Stock alert not found', 404));
    }

    res.status(200).json({
      status: 'success',
      data: {
        message: 'Stock alert deleted successfully',
      },
    });
  },
);

// Check price alerts (utility function for background jobs)
export const checkPriceAlerts = async () => {
  try {
    const wishlists = await Wishlist.find({
      'items.priceAlert.enabled': true,
    }).populate('items.product');

    for (const wishlist of wishlists) {
      for (const item of wishlist.items) {
        if (item.priceAlert?.enabled && item.product) {
          const product = item.product as any;
          const currentPrice = product.priceDiscount || product.price;

          if (currentPrice <= item.priceAlert.targetPrice) {
            // TODO: Send notification when notification system is implemented
            console.log(
              `Price alert triggered for user ${wishlist.userId}, product ${product.name}`,
            );
          }
        }
      }
    }
  } catch (error) {
    console.error('Error checking price alerts:', error);
  }
};

// Check stock alerts (utility function for background jobs)
export const checkStockAlerts = async (productId: string) => {
  try {
    const product = await Product.findById(productId);
    if (!product || product.quantity <= 0) {
      return;
    }

    const stockAlerts = await StockAlert.find({
      productId,
      isActive: true,
      notifiedAt: { $exists: false },
    }).populate('userId');

    for (const alert of stockAlerts) {
      // TODO: Send notification when notification system is implemented
      console.log(
        `Stock alert triggered for user ${alert.userId}, product ${product.name}`,
      );

      // Mark as notified
      alert.notifiedAt = new Date();
      alert.isActive = false;
      await alert.save();
    }
  } catch (error) {
    console.error('Error checking stock alerts:', error);
  }
};
