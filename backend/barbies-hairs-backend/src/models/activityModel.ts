import { Schema, model, Document, Types } from 'mongoose';

export interface IActivityLog extends Document {
  user: Types.ObjectId | null;
  action: string;
  details: Record<string, any>;
  createdAt: Date;
}

const ActivityLogSchema = new Schema<IActivityLog>(
  {
    user: { type: Schema.Types.ObjectId, ref: 'User', default: null },
    action: { type: String, required: true },
    details: { type: Schema.Types.Mixed, required: true },
  },
  { timestamps: { createdAt: true, updatedAt: false } }
);
export const ActivityLog = model<IActivityLog>(
  'ActivityLog',
  ActivityLogSchema
);
