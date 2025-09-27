// models/systemSettingModel.ts
import mongoose, { Schema, Document } from 'mongoose';

export interface ISystemSetting extends Document {
  key: string;
  value: any;
  description?: string;
  type: 'string' | 'number' | 'boolean' | 'json';
  updatedAt?: Date;
}

const systemSettingSchema = new Schema<ISystemSetting>(
  {
    key: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
    value: {
      type: Schema.Types.Mixed,
      required: true,
    },
    description: {
      type: String,
    },
    type: {
      type: String,
      enum: ['string', 'number', 'boolean', 'json'],
    },
  },
  {
    timestamps: true,
  }
);

export default mongoose.model<ISystemSetting>(
  'SystemSetting',
  systemSettingSchema
);
