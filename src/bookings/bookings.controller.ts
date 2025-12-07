import { Request, Response } from 'express';
import * as bookingService from './bookings.service';
import { AuthRequest } from '../types';

export const createBookingController = async (req: Request, res: Response) => {
  try {
    const authReq = req as AuthRequest;
    const { customer_id } = req.body;

    if (authReq.user!.role === 'customer' && customer_id !== authReq.user!.id) {
      return res.status(403).json({
        success: false,
        message: 'Access denied',
        errors: 'Customers can only create bookings for themselves'
      });
    }

    const booking = await bookingService.createBooking(req.body);

    res.status(201).json({
      success: true,
      message: 'Booking created successfully',
      data: booking
    });
  } catch (error: any) {
    res.status(400).json({
      success: false,
      message: 'Failed to create booking',
      errors: error.message
    });
  }
};

export const getAllBookingsController = async (req: Request, res: Response) => {
  try {
    const authReq = req as AuthRequest;
    const bookings = await bookingService.getAllBookings(
      authReq.user?.id,
      authReq.user?.role
    );

    const message = authReq.user?.role === 'admin'
      ? 'Bookings retrieved successfully'
      : 'Your bookings retrieved successfully';

    res.status(200).json({
      success: true,
      message,
      data: bookings
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve bookings',
      errors: error.message
    });
  }
};

export const updateBookingController = async (req: Request, res: Response) => {
  try {
    const bookingId = parseInt(req.params.bookingId);
    const authReq = req as AuthRequest;
    const { status } = req.body;

    if (isNaN(bookingId)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid booking ID',
        errors: 'Booking ID must be a number'
      });
    }

    if (!status) {
      return res.status(400).json({
        success: false,
        message: 'Status is required',
        errors: 'Please provide a status'
      });
    }

    const booking = await bookingService.updateBooking(
      bookingId,
      status,
      authReq.user!.id,
      authReq.user!.role
    );

    let message = 'Booking updated successfully';
    if (status === 'cancelled') {
      message = 'Booking cancelled successfully';
    } else if (status === 'returned') {
      message = 'Booking marked as returned. Vehicle is now available';
    }

    res.status(200).json({
      success: true,
      message,
      data: booking
    });
  } catch (error: any) {
    if (error.message === 'Booking not found') {
      return res.status(404).json({
        success: false,
        message: 'Booking not found',
        errors: error.message
      });
    }

    if (error.message.includes('Unauthorized') || error.message.includes('Only admins')) {
      return res.status(403).json({
        success: false,
        message: 'Access denied',
        errors: error.message
      });
    }

    res.status(400).json({
      success: false,
      message: 'Failed to update booking',
      errors: error.message
    });
  }
};
