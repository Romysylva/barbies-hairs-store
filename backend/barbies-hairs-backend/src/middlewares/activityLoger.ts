// 🧪

import { ActivityLog } from '../models/activityModel.js';
import { Types } from 'mongoose';

type ActivityAction =
  | 'USER_REGISTERED'
  | 'USER_LOGGED_IN'
  | 'USER_LOGGED_OUT'
  | 'PRODUCT_CREATED'
  | 'ORDER_PLACED';

// Normalize a value recursively to remove null-prototype issues
const deepNormalize = (obj: any): any => {
  if (Array.isArray(obj)) {
    return obj.map(deepNormalize);
  } else if (
    obj &&
    typeof obj === 'object' &&
    Object.getPrototypeOf(obj) === null
  ) {
    // Handle null prototype
    return Object.entries(obj).reduce((acc, [key, val]) => {
      acc[key] = deepNormalize(val);
      return acc;
    }, {} as Record<string, any>);
  } else if (obj && typeof obj === 'object') {
    // Regular object, recurse normally
    return Object.entries(obj).reduce((acc, [key, val]) => {
      acc[key] = deepNormalize(val);
      return acc;
    }, {} as Record<string, any>);
  }
  return obj;
};

const toObjectId = (id: string | Types.ObjectId) =>
  typeof id === 'string' ? new Types.ObjectId(id) : id;

export const logActivity = async (
  userId: string | Types.ObjectId | null,
  action: ActivityAction,
  details: Record<string, any>
) => {
  try {
    const safeDetails = deepNormalize(details);
    return await ActivityLog.create({
      user: userId ? toObjectId(userId) : null,
      action,
      details: safeDetails,
    });
  } catch (error) {
    console.error('Error logging activity:', (error as Error).message);
    throw error; // Bubble up
  }
};

// Export alias for compatibility
export const activityLogger = logActivity;
