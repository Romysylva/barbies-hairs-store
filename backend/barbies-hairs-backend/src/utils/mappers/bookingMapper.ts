// src/utils/mappers/bookingMapper.ts
import { IBooking } from '../../models/bookingModel.js';

export function mapBookingToFrontend(booking: IBooking) {
  return {
    bookingId: booking._id,
    status: booking.status,
    services: booking.services.map((s) => ({
      name: s.serviceName,
      duration: s.duration,
      price: s.price,
    })),
    date: booking.bookingDate.toISOString().split('T')[0], // yyyy-mm-dd
    time: booking.bookingDate.toISOString().split('T')[1].slice(0, 5), // HH:mm
    stylist: {
      name: booking.staffName,
      title: 'Hair Stylist', // extend Staff model if you want dynamic title
      avatar: booking.staffAvatar,
    },
    salon: {
      name: "Barbie's Hair Salon",
      address: '123 Beauty Avenue, New York, NY 10001',
      phone: '(555) 123-HAIR',
    },
    notes: booking.notes,
    totalPrice: booking.totalPrice,
    totalDuration: booking.totalDuration,
    bookedAt: booking.createdAt,
    customer: {
      name: booking.customerName,
      email: booking.customerEmail,
      phone: booking.customerPhone,
    },
  };
}
