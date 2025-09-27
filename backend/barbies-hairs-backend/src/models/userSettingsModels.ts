// models/UserSettings.ts
import { Schema, model, Document } from 'mongoose';

export interface IUserSettings extends Document {
  user: Schema.Types.ObjectId;

  notifications: {
    email: boolean;
    push: boolean;
    marketing: boolean;
    orderUpdates: boolean;
    productUpdates: boolean;
  };

  privacy: {
    profileVisible: boolean;
    showLastActive: boolean;
    allowDataCollection: boolean;
  };

  preferences: {
    theme: 'light' | 'dark' | 'system';
    language: string;
    currency: string;
    timezone: string;
  };

  security: {
    twoFactorEnabled: boolean;
    sessionTimeout: number;
  };
}

const UserSettingsSchema = new Schema<IUserSettings>(
  {
    user: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      unique: true,
    },

    notifications: {
      email: { type: Boolean, default: true },
      push: { type: Boolean, default: false },
      marketing: { type: Boolean, default: true },
      orderUpdates: { type: Boolean, default: true },
      productUpdates: { type: Boolean, default: false },
    },

    privacy: {
      profileVisible: { type: Boolean, default: false },
      showLastActive: { type: Boolean, default: true },
      allowDataCollection: { type: Boolean, default: true },
    },

    preferences: {
      theme: {
        type: String,
        enum: ['light', 'dark', 'system'],
        default: 'system',
      },
      language: { type: String, default: 'en' },
      currency: { type: String, default: 'USD' },
      timezone: { type: String, default: 'America/New_York' },
    },

    security: {
      twoFactorEnabled: { type: Boolean, default: false },
      sessionTimeout: { type: Number, default: 480 },
    },
  },
  { timestamps: true },
);

export const UserSettings = model<IUserSettings>(
  'UserSettings',
  UserSettingsSchema,
);
