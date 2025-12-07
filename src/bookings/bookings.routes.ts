import express from 'express';
import {
  createBookingController,
  getAllBookingsController,
  updateBookingController
} from './bookings.controller';
import { authenticate } from '../middleware/auth';

const router = express.Router();

router.post('/', authenticate, createBookingController);
router.get('/', authenticate, getAllBookingsController);
router.put('/:bookingId', authenticate, updateBookingController);

export default router;
