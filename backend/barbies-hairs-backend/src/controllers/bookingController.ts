// import { NextFunction, Request, Response } from 'express';
// import Booking from '../models/bookingModel.js';
// import ApiFeatures from '../utils/apiFeatures.js';
// import catchAsync from '../utils/catchAsync.js';
// import Order from '../models/orderModel.js';

// // @desc Create new booking
// export const createBooking = catchAsync(async (req: Request, res: Response) => {
//   if (!req.user) {
//     return res.status(401).json({ message: 'Unauthorized' });
//   }
//   const booking = await Booking.create({
//     ...req.body,
//     user: req.user._id,
//   });
//   res.status(201).json({ success: true, data: booking });
// });

// export const getAllBookings = catchAsync(
//   async (req: Request, res: Response) => {
//     if (!req.user) {
//       return res.status(401).json({ message: 'Unauthorized' });
//     }

//     let filter = {};
//     if ((req.user.roles as unknown) !== 'admin') {
//       filter = { user: req.user._id };
//     }

//     const features = new ApiFeatures(
//       Booking.find(filter).populate('user product'),
//       req.query,
//     )
//       .filter()
//       .sort()
//       .limitFields()
//       .paginate();

//     const bookings = await features.query;
//     res.json({ success: true, results: bookings.length, data: bookings });
//   },
// );

// export const getMyBooking = catchAsync(async (req: Request, res: Response) => {
//   const booking = await Booking.findById(req.params.id).populate(
//     'user product',
//   );
//   if (!booking)
//     return res
//       .status(404)
//       .json({ success: false, message: 'Booking not found' });
//   res.json({ success: true, data: booking });
// });

// export const updateBooking = catchAsync(async (req: Request, res: Response) => {
//   let booking = await Booking.findById(req.params.id);
//   if (!booking)
//     return res
//       .status(404)
//       .json({ success: false, message: 'Booking not found' });

//   if (!req.user) {
//     return res.status(401).json({ message: 'unauthorized' });
//   }

//   if (
//     (req.user.roles as unknown) !== 'admin' &&
//     booking.user.toString() !== req.user._id.toString()
//   ) {
//     return res.status(403).json({ success: false, message: 'Not authorized' });
//   }

//   const updatedBooking = await Booking.findByIdAndUpdate(
//     req.params.id,
//     req.body,
//     {
//       new: true,
//       runValidators: true,
//     },
//   );

//   if (updatedBooking?.status === 'confirmed') {
//     const existingOrder = await Order.findOne({ booking: updatedBooking._id });
//     if (!existingOrder) {
//       await Order.create({
//         user: updatedBooking.user,
//         booking: updatedBooking._id,
//         orderItems: [
//           {
//             product: updatedBooking.product,
//             quantity: 1,
//             price: updatedBooking.price,
//           },
//         ],
//         shippingAddress: {
//           address: '',
//           city: '',
//           state: '',
//           postalCode: '',
//           country: '',
//         },
//         paymentMethod: 'cash',
//         itemsPrice: updatedBooking.price,
//         taxPrice: 0,
//         shippingPrice: 0,
//         totalPrice: updatedBooking.price,
//         paymentStatus: 'unpaid',
//         orderStatus: 'Pending',
//       });
//     }
//   }

//   res.status(200).json({
//     success: true,
//     data: updatedBooking,
//   });
// });

// export const deleteBooking = catchAsync(async (req: Request, res: Response) => {
//   const booking = await Booking.findById(req.params.id);
//   if (!booking)
//     return res
//       .status(404)
//       .json({ success: false, message: 'Booking not found' });

//   if (!req.user) {
//     return res.status(401).json({ message: 'unauthrized' });
//   }
//   if (
//     (req.user.roles as unknown) !== 'admin' &&
//     booking.user.toString() !== req.user._id.toString()
//   ) {
//     return res.status(403).json({ success: false, message: 'Not authorized' });
//   }

//   await booking.deleteOne();
//   res.json({ success: true, message: 'Booking deleted' });
// });

// export const cancelBooking = catchAsync(async (req: Request, res: Response) => {
//   if (!req.user) return res.status(401).json({ message: 'Unauthorized' });

//   const booking = await Booking.findById(req.params.id);
//   if (!booking) return res.status(404).json({ message: 'Booking not found' });

//   if (booking.user.toString() !== req.user._id.toString() && !req.user.roles) {
//     return res
//       .status(403)
//       .json({ message: 'Not authorized to cancel this booking' });
//   }

//   await booking.deleteOne();
//   res.json({ message: 'Booking cancelled' });
// });

import { NextFunction, Request, Response } from 'express';
import Booking from '../models/bookingModel.js';
import ApiFeatures from '../utils/apiFeatures.js';
import catchAsync from '../utils/catchAsync.js';
import Order from '../models/orderModel.js';
import { mapBookingToFrontend } from '../utils/mappers/bookingMapper.js';

// @desc Create new booking
export const createBooking = catchAsync(async (req: Request, res: Response) => {
  if (!req.user) {
    return res.status(401).json({ message: 'Unauthorized' });
  }

  const booking = await Booking.create({
    ...req.body,
    user: req.user._id,
  });

  res.status(201).json({ success: true, data: mapBookingToFrontend(booking) });
});

// @desc Get all bookings (admin sees all, user sees theirs)
export const getAllBookings = catchAsync(
  async (req: Request, res: Response) => {
    if (!req.user) {
      return res.status(401).json({ message: 'Unauthorized' });
    }

    let filter = {};
    if ((req.user.roles as unknown) !== 'admin') {
      filter = { user: req.user._id };
    }

    const features = new ApiFeatures(
      Booking.find(filter).populate('user product'),
      req.query,
    )
      .filter()
      .sort()
      .limitFields()
      .paginate();

    const bookings = await features.query;

    res.json({
      success: true,
      results: bookings.length,
      data: bookings.map((b) => mapBookingToFrontend(b)),
    });
  },
);

// @desc Get single booking (by ID)
export const getMyBooking = catchAsync(async (req: Request, res: Response) => {
  const booking = await Booking.findById(req.params.id).populate(
    'user product',
  );
  if (!booking) {
    return res
      .status(404)
      .json({ success: false, message: 'Booking not found' });
  }

  res.json({ success: true, data: mapBookingToFrontend(booking) });
});

// @desc Update booking
export const updateBooking = catchAsync(async (req: Request, res: Response) => {
  let booking = await Booking.findById(req.params.id);
  if (!booking) {
    return res
      .status(404)
      .json({ success: false, message: 'Booking not found' });
  }

  if (!req.user) {
    return res.status(401).json({ message: 'unauthorized' });
  }

  if (
    (req.user.roles as unknown) !== 'admin' &&
    booking.user.toString() !== req.user._id.toString()
  ) {
    return res.status(403).json({ success: false, message: 'Not authorized' });
  }

  const updatedBooking = await Booking.findByIdAndUpdate(
    req.params.id,
    req.body,
    { new: true, runValidators: true },
  );

  //

  if (updatedBooking?.status === 'confirmed') {
    const existingOrder = await Order.findOne({ booking: updatedBooking._id });
    if (!existingOrder) {
      // 🔹 Map services to orderItems
      const orderItems =
        updatedBooking.services?.map((svc: any) => ({
          product: svc.product._id || svc.product, // handle populated or ObjectId
          quantity: svc.quantity || 1,
          price: svc.price,
        })) || [];

      // 🔹 Calculate total price from services
      const itemsPrice = orderItems.reduce(
        (sum: number, item: any) => sum + item.price * item.quantity,
        0,
      );

      await Order.create({
        user: updatedBooking.user,
        booking: updatedBooking._id,
        orderItems,
        shippingAddress: {
          address: '',
          city: '',
          state: '',
          postalCode: '',
          country: '',
        },
        paymentMethod: 'cash',
        itemsPrice,
        taxPrice: 0,
        shippingPrice: 0,
        totalPrice: itemsPrice,
        paymentStatus: 'unpaid',
        orderStatus: 'Pending',
      });
    }
  }

  res.status(200).json({
    success: true,
    data: updatedBooking && mapBookingToFrontend(updatedBooking),
  });
});

// @desc Delete booking
export const deleteBooking = catchAsync(async (req: Request, res: Response) => {
  const booking = await Booking.findById(req.params.id);
  if (!booking) {
    return res
      .status(404)
      .json({ success: false, message: 'Booking not found' });
  }

  if (!req.user) {
    return res.status(401).json({ message: 'unauthrized' });
  }

  if (
    (req.user.roles as unknown) !== 'admin' &&
    booking.user.toString() !== req.user._id.toString()
  ) {
    return res.status(403).json({ success: false, message: 'Not authorized' });
  }

  await booking.deleteOne();
  res.json({ success: true, message: 'Booking deleted' });
});

// @desc Cancel booking
export const cancelBooking = catchAsync(async (req: Request, res: Response) => {
  if (!req.user) return res.status(401).json({ message: 'Unauthorized' });

  const booking = await Booking.findById(req.params.id);
  if (!booking) return res.status(404).json({ message: 'Booking not found' });

  if (booking.user.toString() !== req.user._id.toString() && !req.user.roles) {
    return res
      .status(403)
      .json({ message: 'Not authorized to cancel this booking' });
  }

  await booking.deleteOne();
  res.json({ success: true, message: 'Booking cancelled' });
});
