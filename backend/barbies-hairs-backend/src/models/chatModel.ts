import mongoose, { Schema, Document, Types } from 'mongoose';

export interface IMessage {
  sender: Types.ObjectId;
  _id: Types.ObjectId;
  senderType: 'user' | 'admin' | 'staff';
  content: string;
  messageType: 'text' | 'image' | 'file';
  timestamp: Date;
  isRead: boolean;
}

export interface IChat extends Document {
  user: Types.ObjectId;
  admin?: Types.ObjectId;
  staff?: Types.ObjectId;
  subject: string;
  status: 'active' | 'closed' | 'pending';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  category:
    | 'general'
    | 'order_inquiry'
    | 'booking'
    | 'complaint'
    | 'technical_support';
  messages: Types.DocumentArray<IMessage>;
  lastMessageAt: Date;
  closedAt?: Date;
  tags?: string[];
  isAssigned: boolean;
  assignedTo?: Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const MessageSchema = new Schema<IMessage>(
  {
    sender: {
      type: Schema.Types.ObjectId,
      refPath: 'messages.senderType',
      required: true,
    },
    senderType: {
      type: String,
      enum: ['user', 'admin', 'staff'],
      required: true,
    },
    content: {
      type: String,
      required: true,
      trim: true,
    },
    messageType: {
      type: String,
      enum: ['text', 'image', 'file'],
      default: 'text',
    },
    timestamp: {
      type: Date,
      default: Date.now,
    },
    isRead: {
      type: Boolean,
      default: false,
    },
  },
  { _id: true },
);

const ChatSchema = new Schema<IChat>(
  {
    user: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    admin: {
      type: Schema.Types.ObjectId,
      ref: 'User',
    },
    staff: {
      type: Schema.Types.ObjectId,
      ref: 'Staff',
    },
    subject: {
      type: String,
      required: true,
      trim: true,
      maxlength: 200,
    },
    status: {
      type: String,
      enum: ['active', 'closed', 'pending'],
      default: 'pending',
    },
    priority: {
      type: String,
      enum: ['low', 'medium', 'high', 'urgent'],
      default: 'medium',
    },
    category: {
      type: String,
      enum: [
        'general',
        'order_inquiry',
        'booking',
        'complaint',
        'technical_support',
      ],
      default: 'general',
    },
    messages: [MessageSchema],
    lastMessageAt: {
      type: Date,
      default: Date.now,
    },
    closedAt: {
      type: Date,
    },
    tags: [String],
    isAssigned: {
      type: Boolean,
      default: false,
    },
    assignedTo: {
      type: Schema.Types.ObjectId,
      ref: 'User',
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  },
);

// Indexes for performance
ChatSchema.index({ user: 1, status: 1 });
ChatSchema.index({ assignedTo: 1, status: 1 });
ChatSchema.index({ status: 1, priority: -1, lastMessageAt: -1 });
ChatSchema.index({ category: 1, status: 1 });

// Virtual for unread messages count
ChatSchema.virtual('unreadMessagesCount').get(function () {
  return this.messages.filter(
    (msg) => !msg.isRead && msg.senderType !== 'admin',
  ).length;
});

// Update lastMessageAt when new message is added
ChatSchema.pre('save', function (next) {
  if (this.isModified('messages') && this.messages.length > 0) {
    this.lastMessageAt = this.messages[this.messages.length - 1].timestamp;
  }
  next();
});

export const Chat = mongoose.model<IChat>('Chat', ChatSchema);
export default Chat;
