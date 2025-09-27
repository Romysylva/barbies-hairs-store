// src/models/Service.ts
import { Schema, model, Document } from 'mongoose';

export interface IService extends Document {
  id?: string;
  name: string;
  category: string;
  duration: number;
  price: number;
  description: string;
  rating: number;
  reviewCount: number;
  features: string[];
  staffIds: string[];
  image?: string;
  isPopular?: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const serviceSchema = new Schema<IService>(
  {
    name: { type: String, required: true, trim: true },
    category: { type: String, required: true, trim: true },
    duration: { type: Number, required: true },
    price: { type: Number, required: true },
    description: { type: String, required: true },
    rating: { type: Number, default: 0 },
    reviewCount: { type: Number, default: 0 },
    features: { type: [String], required: true },
    staffIds: { type: [String], default: [] },
    image: { type: String },
    isPopular: { type: Boolean, default: false },
  },
  {
    timestamps: true,
    toJSON: {
      virtuals: true,
      transform: (_doc, ret: any) => {
        ret.id = ret._id?.toString();
        delete ret._id;
        delete ret.__v;
        return ret;
      },
    },
  },
);

serviceSchema.set('toObject', { virtuals: true });

const Service = model<IService>('Service', serviceSchema);
export default Service;
