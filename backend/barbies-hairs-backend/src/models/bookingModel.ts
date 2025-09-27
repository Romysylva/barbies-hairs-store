import mongoose, { Schema, model, Document, Types } from 'mongoose';
import Order from './orderModel.js';
import { User } from './userModle.js';
import Staff from './staffModels.js';
import Service from './serviceModel.js';

export interface IBookingService {
  service: Types.ObjectId; // reference to Service model
  serviceName: string;
  serviceCategory: string;
  duration: number;
  price: number;
}

export interface IBooking extends Document {
  user: Types.ObjectId;
  staff: Types.ObjectId;
  services: IBookingService[];
  product?: Types.ObjectId;

  bookingDate: Date;

  // authoritative snapshot values for this booking
  duration: number; // minutes
  price: number;

  status: 'pending' | 'confirmed' | 'completed' | 'cancelled';
  notes?: string;
  quantity: number;

  // --- snapshot fields (captured at time of booking) ---
  serviceName: string;
  serviceCategory: string;
  staffName: string;
  staffAvatar?: string;
  customerName: string;
  customerEmail: string;
  customerPhone: string;

  // computed virtual
  totalPrice: number;
  totalDuration: number;

  createdAt: Date;
  updatedAt: Date;
}

const bookingSchema = new Schema<IBooking>(
  {
    user: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    staff: { type: Schema.Types.ObjectId, ref: 'Staff', required: true },
    services: [
      {
        service: {
          type: Schema.Types.ObjectId,
          ref: 'Service',
          required: true,
        },
        serviceName: { type: String, required: true, trim: true },
        serviceCategory: { type: String, required: true, trim: true },
        duration: { type: Number, required: true }, // minutes
        price: { type: Number, required: true },
      },
    ],
    product: { type: Schema.Types.ObjectId, ref: 'Product' },

    bookingDate: { type: Date, required: true },

    // authoritative snapshot values (set from Service if not provided)
    duration: { type: Number, required: true }, // minutes
    price: { type: Number, required: true },

    status: {
      type: String,
      enum: ['pending', 'confirmed', 'completed', 'cancelled'],
      default: 'pending',
    },
    notes: { type: String, trim: true },
    quantity: { type: Number, default: 1, min: 1 },

    // --- snapshot fields (stored for historical accuracy) ---
    serviceName: { type: String, required: true, trim: true },
    serviceCategory: { type: String, required: true, trim: true },
    staffName: { type: String, required: true, trim: true },
    staffAvatar: { type: String },
    customerName: { type: String, required: true, trim: true },
    customerEmail: { type: String, required: true, trim: true },
    customerPhone: { type: String, required: true, trim: true },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  },
);

// Helpful indexes
bookingSchema.index({ user: 1, bookingDate: -1 });
bookingSchema.index({ staff: 1, bookingDate: 1 });

// Virtual totalPrice (not stored in DB)
bookingSchema.virtual('totalPrice').get(function (this: IBooking) {
  const qty = this.quantity ?? 1;
  const price = this.price ?? 0;
  return price * qty;
});

// bookingSchema.virtual("totalPrice").get(function (this: IBooking) {
//   return this.services.reduce((sum, s) => sum + (s.price ?? 0), 0);
// });

bookingSchema.virtual('totalDuration').get(function (this: IBooking) {
  return this.services.reduce((sum, s) => sum + (s.duration ?? 0), 0);
});

// --- Auto-snapshot middleware ---
// On create OR when user/staff/service changes, ensure snapshot fields are set.
// Also default price/duration from the Service if they weren't provided.
bookingSchema.pre('validate', async function (next) {
  try {
    // Only (re)grab when needed
    const needsUser =
      this.isNew ||
      this.isModified('user') ||
      !this.customerName ||
      !this.customerEmail ||
      !this.customerPhone;
    const needsStaff =
      this.isNew ||
      this.isModified('staff') ||
      !this.staffName ||
      !this.staffAvatar;
    const needsService =
      this.isNew ||
      this.isModified('service') ||
      !this.serviceName ||
      !this.serviceCategory ||
      !this.duration ||
      !this.price;

    if (needsUser && this.user) {
      const user = await User.findById(this.user).lean();
      if (user) {
        // @ts-ignore - your User fields may vary
        this.customerName ??= user.name;
        // @ts-ignore
        this.customerEmail ??= user.email;
        // @ts-ignore
        this.customerPhone ??= user.phone;
      }
    }

    if (needsStaff && this.staff) {
      const staff = await Staff.findById(this.staff).lean();
      if (staff) {
        // @ts-ignore
        this.staffName ??= staff.name;
        // @ts-ignore
        this.staffAvatar ??= staff.avatar;
      }
    }

    if (needsService && this.services) {
      const service = await Service.findById(this.services).lean();
      if (service) {
        // @ts-ignore
        this.serviceName ??= service.name;
        // @ts-ignore
        this.serviceCategory ??= service.category;

        // Price/duration are authoritative snapshots on the booking.
        // If caller didn't set them explicitly, pull from current service.
        // @ts-ignore
        this.duration ??= service.duration;
        // @ts-ignore
        this.price ??= service.price;
      }
    }

    // quantity default safety
    if (!this.quantity) this.quantity = 1;

    next();
  } catch (err) {
    next(err as any);
  }
});

// --- Hook to create order when booking is confirmed ---
bookingSchema.post('save', async function (doc, next) {
  try {
    if (doc.status === 'confirmed') {
      const existingOrder = await (mongoose.models.Order as any).findOne({
        booking: doc._id,
      });
      if (!existingOrder) {
        await Order.create({
          user: doc.user,
          product: doc.product,
          quantity: doc.quantity || 1,
          booking: doc._id,
          shippingAddress: {
            country: 'Nigeria',
            postalCode: '100001',
            state: 'Lagos',
            city: 'Lagos',
            street: '123 Test Street',
          },
          totalAmount: (doc.price ?? 0) * (doc.quantity ?? 1),
          paymentMethod: 'cash_on_delivery', // must match enum in Order
          paymentStatus: 'pending',
          orderStatus: 'pending',
        });
      }
    }
    next();
  } catch (err) {
    if (err instanceof Error) next(err);
    else next();
  }
});

const Booking = model<IBooking>('Booking', bookingSchema);
export default Booking;
