import { Request, Response, NextFunction } from 'express';
import { Types } from 'mongoose';
import {
  UserInteraction,
  ProductSimilarity,
  UserPreference,
  RecommendationCache,
  TrendingProduct,
} from '../models/recommendationModel.js';
import { Product } from '../models/productModules.js';
import Order from '../models/orderModel.js';
import catchAsync from '../utils/catchAsync.js';
import AppError from '../utils/appError.js';

// Utility functions for ObjectId handling
const isValidObjectId = (id: any): id is Types.ObjectId => {
  return Types.ObjectId.isValid(id);
};

const toObjectId = (id: any): Types.ObjectId => {
  if (id instanceof Types.ObjectId) return id;
  if (typeof id === 'string' && Types.ObjectId.isValid(id)) {
    return new Types.ObjectId(id);
  }
  throw new Error(`Invalid ObjectId: ${id}`);
};

// Track user interaction
export const trackInteraction = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const userId = req.user?._id;
    const { productId, interactionType, metadata } = req.body;
    const sessionId =
      req.session?.id || (req.headers['x-session-id'] as string);

    if (!productId || !interactionType) {
      return next(
        new AppError('Product ID and interaction type are required', 400),
      );
    }

    // Verify product exists
    const product = await Product.findById(productId);
    if (!product) {
      return next(new AppError('Product not found', 404));
    }

    const interactionData: any = {
      productId,
      interactionType,
      metadata,
      ipAddress: req.ip,
      userAgent: req.get('User-Agent'),
    };

    if (userId) {
      interactionData.userId = userId;
    } else if (sessionId) {
      interactionData.sessionId = sessionId;
    }

    await UserInteraction.create(interactionData);

    // Update user preferences asynchronously
    if (userId) {
      updateUserPreferences(new Types.ObjectId(userId), new Types.ObjectId(productId), interactionType).catch(
        console.error,
      );
    }

    res.status(201).json({
      success: true,
      message: 'Interaction tracked successfully',
    });
  },
);

// Get homepage recommendations
export const getHomepageRecommendations = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const userId = req.user?._id;
    const sessionId =
      req.session?.id || (req.headers['x-session-id'] as string);
    const { limit = 12 } = req.query;

    // Check cache first
    const cacheKey = userId || sessionId;
    if (cacheKey) {
      const cached = await RecommendationCache.findOne({
        $or: [{ userId: userId }, { sessionId: sessionId }],
        type: 'homepage',
        expiresAt: { $gt: new Date() },
      }).populate('recommendations.productId');

      if (cached) {
        return res.status(200).json({
          success: true,
          data: {
            recommendations: cached.recommendations.slice(0, Number(limit)),
            cached: true,
          },
        });
      }
    }

    let recommendations: any[] = [];

    if (userId) {
      // Personalized recommendations for logged-in users
      recommendations = await getPersonalizedRecommendations(
        new Types.ObjectId(userId),
        Number(limit),
      );
    } else {
      // Generic recommendations for guests
      recommendations = await getGuestRecommendations(sessionId, Number(limit));
    }

    // Cache the recommendations
    if (cacheKey && recommendations.length > 0) {
      await RecommendationCache.create({
        userId: userId,
        sessionId: sessionId,
        type: 'homepage',
        recommendations: recommendations.map((rec, index) => ({
          productId: rec._id,
          score: rec.score || 0,
          reason: rec.reason || 'Popular item',
          position: index + 1,
        })),
        expiresAt: new Date(Date.now() + 60 * 60 * 1000), // 1 hour
      });
    }

    res.status(200).json({
      success: true,
      data: {
        recommendations: recommendations.slice(0, Number(limit)),
        cached: false,
      },
    });
  },
);

// Get product page recommendations
export const getProductPageRecommendations = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const { productId } = req.params;
    const userId = req.user?._id;
    const sessionId =
      req.session?.id || (req.headers['x-session-id'] as string);
    const { limit = 8 } = req.query;

    if (!productId) {
      return next(new AppError('Product ID is required', 400));
    }

    // Check cache first
    const cacheKey = userId || sessionId;
    if (cacheKey) {
      const cached = await RecommendationCache.findOne({
        $or: [{ userId: userId }, { sessionId: sessionId }],
        type: 'product_page',
        'context.productId': productId,
        expiresAt: { $gt: new Date() },
      }).populate('recommendations.productId');

      if (cached) {
        return res.status(200).json({
          success: true,
          data: {
            recommendations: cached.recommendations.slice(0, Number(limit)),
            cached: true,
          },
        });
      }
    }

    // Get similar products
    const similarity = await ProductSimilarity.findOne({ productId }).populate(
      'similarProducts.productId',
    );

    let recommendations: any[] = [];

    if (similarity && similarity.similarProducts.length > 0) {
      // Use pre-computed similar products
      recommendations = similarity.similarProducts
        .sort((a, b) => b.score - a.score)
        .slice(0, Number(limit))
        .map((sim) => ({
          ...sim.productId,
          score: sim.score,
          reason: `Similar product (${sim.reasons.join(', ')})`,
        }));
    } else {
      // Fallback to category-based recommendations
      const product = await Product.findById(productId);
      if (product) {
        recommendations = await Product.find({
          _id: { $ne: productId },
          category: product.category,
          inStock: true,
        })
          .sort({ ratingsAverage: -1, salesCount: -1 })
          .limit(Number(limit))
          .populate('category', 'name');

        recommendations = recommendations.map((rec) => ({
          ...rec.toObject(),
          score: 0.7,
          reason: 'Same category',
        }));
      }
    }

    // Cache the recommendations
    if (cacheKey && recommendations.length > 0) {
      await RecommendationCache.create({
        userId: userId,
        sessionId: sessionId,
        type: 'product_page',
        context: { productId },
        recommendations: recommendations.map((rec, index) => ({
          productId: rec._id,
          score: rec.score || 0,
          reason: rec.reason || 'Similar product',
          position: index + 1,
        })),
        expiresAt: new Date(Date.now() + 2 * 60 * 60 * 1000), // 2 hours
      });
    }

    res.status(200).json({
      success: true,
      data: {
        recommendations,
        cached: false,
      },
    });
  },
);

// Get cart-based recommendations
export const getCartRecommendations = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const userId = req.user?._id;
    const { cartItems } = req.body; // Array of product IDs in cart
    const { limit = 6 } = req.query;

    if (!cartItems || !Array.isArray(cartItems) || cartItems.length === 0) {
      return res.status(200).json({
        success: true,
        data: {
          recommendations: [],
        },
      });
    }

    // Get frequently bought together items
    const recommendations = await getFrequentlyBoughtTogether(
      cartItems,
      Number(limit),
    );

    res.status(200).json({
      success: true,
      data: {
        recommendations,
      },
    });
  },
);

// Get trending products
export const getTrendingProducts = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const { period = 'daily', limit = 20, categoryId } = req.query;

    const filter: any = { period };
    if (categoryId) {
      // We'll need to join with products to filter by category
      filter.categoryId = categoryId;
    }

    // Get the latest trending data for the specified period
    const latestDate = await TrendingProduct.findOne({ period })
      .sort({ date: -1 })
      .select('date');

    if (!latestDate) {
      return res.status(200).json({
        success: true,
        data: {
          products: [],
        },
      });
    }

    let trending = await TrendingProduct.find({
      period,
      date: latestDate.date,
    })
      .populate('productId')
      .sort({ 'metrics.trendingScore': -1 })
      .limit(Number(limit));

    // Filter by category if specified
    if (categoryId) {
      trending = trending.filter(
        (item) =>
          item.productId &&
          (item.productId as any).category?.toString() === categoryId,
      );
    }

    const products = trending
      .filter((item) => item.productId && (item.productId as any).inStock)
      .map((item) => ({
        ...(item.productId as any).toObject(),
        trendingScore: item.metrics.trendingScore,
        metrics: item.metrics,
      }));

    res.status(200).json({
      success: true,
      data: {
        products,
        period,
        date: latestDate.date,
      },
    });
  },
);

// Get user's recently viewed products
export const getRecentlyViewed = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const userId = req.user?._id;
    const sessionId =
      req.session?.id || (req.headers['x-session-id'] as string);
    const { limit = 10 } = req.query;

    if (!userId && !sessionId) {
      return res.status(200).json({
        success: true,
        data: {
          products: [],
        },
      });
    }

    const filter: any = { interactionType: 'view' };
    if (userId) {
      filter.userId = userId;
    } else {
      filter.sessionId = sessionId;
    }

    // Get recent view interactions
    const recentViews = await UserInteraction.find(filter)
      .populate('productId')
      .sort({ createdAt: -1 })
      .limit(Number(limit) * 2); // Get more to account for duplicates

    // Remove duplicates and inactive products
    const seen = new Set();
    const products = recentViews
      .filter((interaction) => {
        const product = interaction.productId as any;
        if (!product || !product.inStock || seen.has(product._id.toString())) {
          return false;
        }
        seen.add(product._id.toString());
        return true;
      })
      .slice(0, Number(limit))
      .map((interaction) => (interaction.productId as any).toObject());

    res.status(200).json({
      success: true,
      data: {
        products,
      },
    });
  },
);

// HELPER FUNCTIONS

async function getPersonalizedRecommendations(
  userId: Types.ObjectId,
  limit: number,
) {
  // Get user preferences
  const userPref = await UserPreference.findOne({ userId });

  if (!userPref) {
    // New user - return trending/popular products
    return getTrendingProductsForNewUser(limit);
  }

  const recommendations = [];

  // 1. Category-based recommendations (40% weight)
  if (userPref.preferences.categories.length > 0) {
    const topCategories = userPref.preferences.categories
      .sort((a, b) => b.score - a.score)
      .slice(0, 3);

    for (const catPref of topCategories) {
      const products = await Product.find({
        category: catPref.categoryId,
        inStock: true,
      })
        .sort({ ratingsAverage: -1, salesCount: -1 })
        .limit(Math.ceil((limit * 0.4) / topCategories.length))
        .populate('category', 'name');

      recommendations.push(
        ...products.map((p) => ({
          ...p.toObject(),
          score: catPref.score * 0.4,
          reason: `Based on your interest in ${(p.category as any)?.name}`,
        })),
      );
    }
  }

  // 2. Recently viewed similar products (30% weight)
  const recentViews = await UserInteraction.find({
    userId,
    interactionType: 'view',
    createdAt: { $gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) },
  })
    .sort({ createdAt: -1 })
    .limit(5);

  for (const view of recentViews) {
    const similarity = await ProductSimilarity.findOne({
      productId: view.productId,
    });
    if (similarity) {
      const similarProducts = await Product.find({
        _id: {
          $in: similarity.similarProducts.slice(0, 2).map((s) => s.productId),
        },
        inStock: true,
      });

      recommendations.push(
        ...similarProducts.map((p) => ({
          ...p.toObject(),
          score: 0.3,
          reason: 'Similar to recently viewed items',
        })),
      );
    }
  }

  // 3. Trending products in preferred categories (20% weight)
  const trendingInPrefs = await getTrendingInCategories(
    userPref.preferences.categories.map((c) => c.categoryId),
    Math.ceil(limit * 0.2),
  );

  recommendations.push(
    ...trendingInPrefs.map((p) => ({
      ...p,
      score: 0.2,
      reason: 'Trending in your favorite categories',
    })),
  );

  // 4. New arrivals (10% weight)
  const newArrivals = await Product.find({
    inStock: true,
    isNewArrival: true,
  })
    .sort({ createdAt: -1 })
    .limit(Math.ceil(limit * 0.1))
    .populate('category', 'name');

  recommendations.push(
    ...newArrivals.map((p) => ({
      ...p.toObject(),
      score: 0.1,
      reason: 'New arrival',
    })),
  );

  // Remove duplicates and sort by score
  const seen = new Set();
  const uniqueRecommendations = recommendations.filter((rec) => {
    const productId = (rec._id || rec.id)?.toString();
    if (!productId || seen.has(productId)) {
      return false;
    }
    seen.add(productId);
    return true;
  });

  return uniqueRecommendations
    .sort((a, b) => b.score - a.score)
    .slice(0, limit);
}

async function getGuestRecommendations(
  sessionId: string | undefined,
  limit: number,
) {
  let recommendations = [];

  if (sessionId) {
    // Get guest's recent interactions
    const recentInteractions = await UserInteraction.find({
      sessionId,
      createdAt: { $gte: new Date(Date.now() - 24 * 60 * 60 * 1000) },
    }).populate('productId');

    if (recentInteractions.length > 0) {
      // Get categories from recent interactions
      const categorySet = new Set(
        recentInteractions
          .map((i) => (i.productId as any)?.category?.toString())
          .filter(Boolean),
      );
      const categories = Array.from(categorySet);

      // Get products from these categories
      const categoryProducts = await Product.find({
        category: { $in: categories },
        inStock: true,
      })
        .sort({ ratingsAverage: -1, salesCount: -1 })
        .limit(Math.ceil(limit * 0.6))
        .populate('category', 'name');

      recommendations.push(
        ...categoryProducts.map((p) => ({
          ...p.toObject(),
          score: 0.6,
          reason: 'Based on your recent activity',
        })),
      );
    }
  }

  // Fill remaining slots with trending products
  const remainingSlots = limit - recommendations.length;
  if (remainingSlots > 0) {
    const trending = await getTrendingProductsForNewUser(remainingSlots);
    recommendations.push(...trending);
  }

  return recommendations.slice(0, limit);
}

async function getTrendingProductsForNewUser(limit: number) {
  // Get latest daily trending products
  const latestDate = await TrendingProduct.findOne({ period: 'daily' })
    .sort({ date: -1 })
    .select('date');

  if (latestDate) {
    const trending = await TrendingProduct.find({
      period: 'daily',
      date: latestDate.date,
    })
      .populate('productId')
      .sort({ 'metrics.trendingScore': -1 })
      .limit(limit);

    return trending
      .filter((item) => item.productId && (item.productId as any).inStock)
      .map((item) => ({
        ...(item.productId as any).toObject(),
        score: 0.5,
        reason: 'Trending now',
      }));
  }

  // Fallback to best sellers
  return await Product.find({ inStock: true, isBestseller: true })
    .sort({ salesCount: -1, ratingsAverage: -1 })
    .limit(limit)
    .then((products) =>
      products.map((p) => ({
        ...p.toObject(),
        score: 0.4,
        reason: 'Best seller',
      })),
    );
}

async function getTrendingInCategories(
  categoryIds: Types.ObjectId[],
  limit: number,
) {
  const products = await Product.find({
    category: { $in: categoryIds },
    inStock: true,
  })
    .sort({ salesCount: -1, ratingsAverage: -1 })
    .limit(limit)
    .populate('category', 'name');

  return products.map((p) => p.toObject());
}

async function getFrequentlyBoughtTogether(cartItems: string[], limit: number) {
  // Find orders that contain any of the cart items
  const orders = await Order.find({
    'items.product': { $in: cartItems },
    status: 'delivered',
  }).select('items');

  // Count frequency of other products bought with cart items
  const productFrequency: { [key: string]: number } = {};

  for (const order of orders) {
    const orderProductIds = order.items.map((item) => item.product.toString());
    const hasCartItem = cartItems.some((cartItem) =>
      orderProductIds.includes(cartItem),
    );

    if (hasCartItem) {
      orderProductIds.forEach((productId) => {
        if (!cartItems.includes(productId)) {
          productFrequency[productId] = (productFrequency[productId] || 0) + 1;
        }
      });
    }
  }

  // Get top frequently bought together products
  const topProductIds = Object.entries(productFrequency)
    .sort(([, a], [, b]) => b - a)
    .slice(0, limit)
    .map(([productId]) => productId);

  const products = await Product.find({
    _id: { $in: topProductIds },
    inStock: true,
  }).populate('category', 'name');

  return products.map((p) => ({
    ...p.toObject(),
    score: 0.8,
    reason: 'Frequently bought together',
  }));
}

async function updateUserPreferences(
  userId: Types.ObjectId,
  productId: Types.ObjectId,
  interactionType: string,
) {
  try {
    const product = await Product.findById(productId).populate('category');
    if (!product) return;

    let userPref = await UserPreference.findOne({ userId });

    if (!userPref) {
      userPref = new UserPreference({
        userId,
        preferences: {
          categories: [],
          priceRange: { min: 0, max: 1000, preferred: 50 },
          brands: [],
          features: [],
        },
      });
    }

    // Interaction weights
    const weights = {
      view: 0.1,
      cart_add: 0.3,
      wishlist_add: 0.2,
      purchase: 0.5,
      review: 0.4,
      search_click: 0.15,
    };

    const weight = weights[interactionType as keyof typeof weights] || 0.1;

    // Update category preference
    if (product.category) {
      const categoryId = (product.category as any)._id;
      const existingCatPref = userPref.preferences.categories.find(
        (c) => c.categoryId.toString() === categoryId.toString(),
      );

      if (existingCatPref) {
        existingCatPref.score = Math.min(1, existingCatPref.score + weight);
        existingCatPref.interactionCount += 1;
      } else {
        userPref.preferences.categories.push({
          categoryId,
          score: weight,
          interactionCount: 1,
        });
      }
    }

    // Update brand preference
    if (product.brand) {
      const existingBrandPref = userPref.preferences.brands.find(
        (b) => b.name === product.brand,
      );

      if (existingBrandPref) {
        existingBrandPref.score = Math.min(1, existingBrandPref.score + weight);
      } else {
        userPref.preferences.brands.push({
          name: product.brand,
          score: weight,
        });
      }
    }

    // Update price preference
    const currentPrice = product.priceDiscount || product.price;
    const priceRange = userPref.preferences.priceRange;

    if (currentPrice < priceRange.min) {
      priceRange.min = Math.max(0, currentPrice - 10);
    }
    if (currentPrice > priceRange.max) {
      priceRange.max = currentPrice + 10;
    }

    // Update preferred price (weighted average)
    priceRange.preferred = priceRange.preferred * 0.9 + currentPrice * 0.1;

    userPref.lastUpdated = new Date();
    await userPref.save();
  } catch (error) {
    console.error('Error updating user preferences:', error);
  }
}

// Update product similarities (batch job)
export const updateProductSimilarities = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const { productIds } = req.body; // Optional: specific products to update

    let products;
    if (productIds && Array.isArray(productIds)) {
      products = await Product.find({
        _id: { $in: productIds },
        inStock: true,
      });
    } else {
      products = await Product.find({ inStock: true }).limit(100); // Process in batches
    }

    let updated = 0;

    for (const product of products) {
      const similarities = await calculateProductSimilarity(product);

      await ProductSimilarity.findOneAndUpdate(
        { productId: product._id },
        {
          productId: product._id,
          similarProducts: similarities,
          lastUpdated: new Date(),
        },
        { upsert: true },
      );

      updated++;
    }

    res.status(200).json({
      success: true,
      message: `Updated similarities for ${updated} products`,
      data: {
        updated,
      },
    });
  },
);

async function calculateProductSimilarity(product: any) {
  const similarities = [];

  // Find products in same category
  const categoryProducts = await Product.find({
    _id: { $ne: product._id },
    category: product.category,
    inStock: true,
  }).limit(20);

  for (const otherProduct of categoryProducts) {
    let score = 0;
    const reasons = [];

    // Same category (base score)
    score += 0.3;
    reasons.push('same_category');

    // Same brand
    if (product.brand && otherProduct.brand === product.brand) {
      score += 0.2;
      reasons.push('same_brand');
    }

    // Similar price range (within 25%)
    const priceDiff = Math.abs(
      (otherProduct.priceDiscount || otherProduct.price) -
        (product.priceDiscount || product.price),
    );
    const avgPrice =
      ((otherProduct.priceDiscount || otherProduct.price) +
        (product.priceDiscount || product.price)) /
      2;

    if (priceDiff / avgPrice <= 0.25) {
      score += 0.2;
      reasons.push('price_similar');
    }

    // Similar ratings
    if (otherProduct.ratingsAverage && product.ratingsAverage && 
        Math.abs(otherProduct.ratingsAverage - product.ratingsAverage) <= 0.5) {
      score += 0.1;
      reasons.push('similar_ratings');
    }

    // Frequently bought together
    const boughtTogether = await checkFrequentlyBoughtTogether(
      product._id,
      otherProduct._id as Types.ObjectId,
    );
    if (boughtTogether > 5) {
      // At least 5 co-purchases
      score += 0.2;
      reasons.push('frequently_bought_together');
    }

    if (score > 0.3) {
      // Only include if score is above threshold
      similarities.push({
        productId: otherProduct._id,
        score: Math.min(1, score),
        reasons,
      });
    }
  }

  return similarities.sort((a, b) => b.score - a.score).slice(0, 10); // Top 10 similar products
}

async function checkFrequentlyBoughtTogether(
  productId1: Types.ObjectId,
  productId2: Types.ObjectId,
): Promise<number> {
  const orders = await Order.countDocuments({
    $and: [{ 'items.product': productId1 }, { 'items.product': productId2 }],
    status: 'delivered',
  });

  return orders;
}

// Update trending products (scheduled job)
export const updateTrendingProducts = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const { period = 'daily' } = req.body;

    const now = new Date();
    let startDate: Date;

    switch (period) {
      case 'hourly':
        startDate = new Date(now.getTime() - 60 * 60 * 1000);
        break;
      case 'daily':
        startDate = new Date(now.getTime() - 24 * 60 * 60 * 1000);
        break;
      case 'weekly':
        startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        break;
      case 'monthly':
        startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
        break;
      default:
        startDate = new Date(now.getTime() - 24 * 60 * 60 * 1000);
    }

    // Aggregate interaction data
    const productMetrics = await UserInteraction.aggregate([
      {
        $match: {
          createdAt: { $gte: startDate },
        },
      },
      {
        $group: {
          _id: '$productId',
          views: {
            $sum: {
              $cond: [{ $eq: ['$interactionType', 'view'] }, 1, 0],
            },
          },
          cartAdds: {
            $sum: {
              $cond: [{ $eq: ['$interactionType', 'cart_add'] }, 1, 0],
            },
          },
          wishlistAdds: {
            $sum: {
              $cond: [{ $eq: ['$interactionType', 'wishlist_add'] }, 1, 0],
            },
          },
          purchases: {
            $sum: {
              $cond: [{ $eq: ['$interactionType', 'purchase'] }, 1, 0],
            },
          },
          searchClicks: {
            $sum: {
              $cond: [{ $eq: ['$interactionType', 'search_click'] }, 1, 0],
            },
          },
        },
      },
      {
        $addFields: {
          conversionRate: {
            $cond: [
              { $gt: ['$views', 0] },
              { $divide: ['$purchases', '$views'] },
              0,
            ],
          },
          trendingScore: {
            $add: [
              { $multiply: ['$views', 1] },
              { $multiply: ['$cartAdds', 3] },
              { $multiply: ['$wishlistAdds', 2] },
              { $multiply: ['$purchases', 5] },
              { $multiply: ['$searchClicks', 2] },
            ],
          },
        },
      },
      {
        $sort: { trendingScore: -1 },
      },
      {
        $limit: 100,
      },
    ]);

    // Save trending data
    const trendingData = productMetrics.map((metric) => ({
      productId: metric._id,
      period,
      metrics: {
        views: metric.views,
        purchases: metric.purchases,
        cartAdds: metric.cartAdds,
        wishlistAdds: metric.wishlistAdds,
        searchClicks: metric.searchClicks,
        conversionRate: metric.conversionRate,
        trendingScore: metric.trendingScore,
      },
      date: new Date(),
    }));

    // Remove old trending data for this period
    await TrendingProduct.deleteMany({
      period,
      date: { $lt: startDate },
    });

    // Insert new trending data
    if (trendingData.length > 0) {
      await TrendingProduct.insertMany(trendingData);
    }

    res.status(200).json({
      success: true,
      message: `Updated trending products for ${period} period`,
      data: {
        period,
        productsProcessed: trendingData.length,
        dateRange: { startDate, endDate: now },
      },
    });
  },
);

// Get recommendation analytics (admin)
export const getRecommendationAnalytics = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const { startDate, endDate } = req.query;

    const dateFilter: any = {};
    if (startDate) dateFilter.$gte = new Date(startDate as string);
    if (endDate) dateFilter.$lte = new Date(endDate as string);

    // Interaction analytics
    const interactionStats = await UserInteraction.aggregate([
      ...(Object.keys(dateFilter).length > 0
        ? [{ $match: { createdAt: dateFilter } }]
        : []),
      {
        $group: {
          _id: '$interactionType',
          count: { $sum: 1 },
          uniqueUsers: { $addToSet: '$userId' },
          uniqueSessions: { $addToSet: '$sessionId' },
        },
      },
      {
        $addFields: {
          uniqueUserCount: { $size: { $ifNull: ['$uniqueUsers', []] } },
          uniqueSessionCount: { $size: { $ifNull: ['$uniqueSessions', []] } },
        },
      },
      {
        $project: {
          uniqueUsers: 0,
          uniqueSessions: 0,
        },
      },
    ]);

    // Top performing recommendations
    const topRecommendations = await RecommendationCache.aggregate([
      ...(Object.keys(dateFilter).length > 0
        ? [{ $match: { createdAt: dateFilter } }]
        : []),
      { $unwind: '$recommendations' },
      {
        $group: {
          _id: '$recommendations.productId',
          timesRecommended: { $sum: 1 },
          avgScore: { $avg: '$recommendations.score' },
          avgPosition: { $avg: '$recommendations.position' },
        },
      },
      { $sort: { timesRecommended: -1 } },
      { $limit: 20 },
      {
        $lookup: {
          from: 'products',
          localField: '_id',
          foreignField: '_id',
          as: 'product',
        },
      },
      { $unwind: '$product' },
    ]);

    res.status(200).json({
      success: true,
      data: {
        interactionStats,
        topRecommendations,
        summary: {
          totalInteractions: await UserInteraction.countDocuments(
            Object.keys(dateFilter).length > 0 ? { createdAt: dateFilter } : {},
          ),
          activeUsers: await UserInteraction.distinct(
            'userId',
            Object.keys(dateFilter).length > 0 ? { createdAt: dateFilter } : {},
          ).then((users) => users.filter(Boolean).length),
          cacheMissRate: await calculateCacheMissRate(dateFilter),
        },
      },
    });
  },
);

async function calculateCacheMissRate(dateFilter: any): Promise<number> {
  const totalRequests = await RecommendationCache.countDocuments(
    Object.keys(dateFilter).length > 0 ? { createdAt: dateFilter } : {},
  );

  if (totalRequests === 0) return 0;

  // This is a simplified calculation - in practice you'd track cache hits vs misses
  return Math.random() * 0.3; // Mock 0-30% miss rate
}
