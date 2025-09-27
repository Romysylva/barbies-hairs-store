// src/models/Staff.ts
import { Schema, model, Document } from 'mongoose';

export interface IStaff extends Document {
  id?: string; // alias for _id
  name: string;
  title?: string;
  bio?: string;
  rating?: number;
  reviewCount?: number;
  experience?: number;
  specialties: string[];
  serviceIds: string[];
  availability?: {
    monday?: string[];
    tuesday?: string[];
    wednesday?: string[];
    thursday?: string[];
    friday?: string[];
    saturday?: string[];
    sunday?: string[];
  };
  isTopRated?: boolean;
  languages?: string[];
  avatar?: string;
  createdAt: Date;
  updatedAt: Date;
}

const staffSchema = new Schema<IStaff>(
  {
    name: { type: String, required: true, trim: true },
    title: { type: String },
    bio: { type: String },
    rating: { type: Number, default: 0 },
    reviewCount: { type: Number, default: 0 },
    experience: { type: Number, default: 0 },
    specialties: { type: [String], default: [] },
    serviceIds: { type: [String], default: [] },
    availability: {
      monday: [String],
      tuesday: [String],
      wednesday: [String],
      thursday: [String],
      friday: [String],
      saturday: [String],
      sunday: [String],
    },
    isTopRated: { type: Boolean, default: false },
    languages: { type: [String], default: [] },
    avatar: { type: String, default: '/api/placeholder/40/40' },
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

staffSchema.set('toObject', { virtuals: true });

const Staff = model<IStaff>('Staff', staffSchema);
export default Staff;
