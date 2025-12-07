import pool from '../config/database';
import { Booking } from '../types';

const calculateDays = (start: string, end: string): number => {
  const startDate = new Date(start);
  const endDate = new Date(end);
  const timeDiff = endDate.getTime() - startDate.getTime();
  const days = Math.ceil(timeDiff / (1000 * 60 * 60 * 24));
  return days;
};

export const createBooking = async (bookingData: Omit<Booking, 'id' | 'total_price' | 'status'>) => {
  const { customer_id, vehicle_id, rent_start_date, rent_end_date } = bookingData;

  const vehicleQuery = await pool.query(
    'SELECT * FROM vehicles WHERE id = $1',
    [vehicle_id]
  );

  if (vehicleQuery.rows.length === 0) {
    throw new Error('Vehicle not found');
  }

  const vehicle = vehicleQuery.rows[0];

  if (vehicle.availability_status !== 'available') {
    throw new Error('Vehicle is not available for booking');
  }

  const startDate = new Date(rent_start_date);
  const endDate = new Date(rent_end_date);

  if (endDate <= startDate) {
    throw new Error('End date must be after start date');
  }

  const numberOfDays = calculateDays(rent_start_date, rent_end_date);
  const totalPrice = vehicle.daily_rent_price * numberOfDays;

  const client = await pool.connect();

  try {
    await client.query('BEGIN');

    const bookingResult = await client.query(
      'INSERT INTO bookings (customer_id, vehicle_id, rent_start_date, rent_end_date, total_price, status) VALUES ($1, $2, $3, $4, $5, $6) RETURNING *',
      [customer_id, vehicle_id, rent_start_date, rent_end_date, totalPrice, 'active']
    );

    await client.query(
      'UPDATE vehicles SET availability_status = $1 WHERE id = $2',
      ['booked', vehicle_id]
    );

    await client.query('COMMIT');

    const booking = bookingResult.rows[0];

    return {
      ...booking,
      vehicle: {
        vehicle_name: vehicle.vehicle_name,
        daily_rent_price: vehicle.daily_rent_price
      }
    };
  } catch (error) {
    await client.query('ROLLBACK');
    throw error;
  } finally {
    client.release();
  }
};

export const getAllBookings = async (userId?: number, userRole?: string) => {
  let query = `
    SELECT
      b.*,
      u.name as customer_name,
      u.email as customer_email,
      v.vehicle_name,
      v.registration_number,
      v.type as vehicle_type
    FROM bookings b
    JOIN users u ON b.customer_id = u.id
    JOIN vehicles v ON b.vehicle_id = v.id
  `;

  let params: any[] = [];

  if (userRole === 'customer' && userId) {
    query += ' WHERE b.customer_id = $1';
    params = [userId];
  }

  query += ' ORDER BY b.id DESC';

  const result = await pool.query(query, params);

  if (userRole === 'admin') {
    return result.rows.map(row => ({
      id: row.id,
      customer_id: row.customer_id,
      vehicle_id: row.vehicle_id,
      rent_start_date: row.rent_start_date,
      rent_end_date: row.rent_end_date,
      total_price: row.total_price,
      status: row.status,
      customer: {
        name: row.customer_name,
        email: row.customer_email
      },
      vehicle: {
        vehicle_name: row.vehicle_name,
        registration_number: row.registration_number
      }
    }));
  } else {
    return result.rows.map(row => ({
      id: row.id,
      vehicle_id: row.vehicle_id,
      rent_start_date: row.rent_start_date,
      rent_end_date: row.rent_end_date,
      total_price: row.total_price,
      status: row.status,
      vehicle: {
        vehicle_name: row.vehicle_name,
        registration_number: row.registration_number,
        type: row.vehicle_type
      }
    }));
  }
};

export const updateBooking = async (bookingId: number, status: string, userId: number, userRole: string) => {
  const bookingResult = await pool.query(
    'SELECT * FROM bookings WHERE id = $1',
    [bookingId]
  );

  if (bookingResult.rows.length === 0) {
    throw new Error('Booking not found');
  }

  const booking = bookingResult.rows[0];

  if (status === 'cancelled') {
    if (userRole !== 'customer' && userRole !== 'admin') {
      throw new Error('Unauthorized to cancel booking');
    }

    if (userRole === 'customer' && booking.customer_id !== userId) {
      throw new Error('Unauthorized! You can only cancel your own bookings');
    }

    const today = new Date();
    const startDate = new Date(booking.rent_start_date);

    if (startDate < today) {
      throw new Error('Cannot cancel booking that has already started');
    }

    const client = await pool.connect();

    try {
      await client.query('BEGIN');

      await client.query(
        'UPDATE bookings SET status = $1 WHERE id = $2',
        ['cancelled', bookingId]
      );

      await client.query(
        'UPDATE vehicles SET availability_status = $1 WHERE id = $2',
        ['available', booking.vehicle_id]
      );

      await client.query('COMMIT');

      const updatedBooking = await pool.query('SELECT * FROM bookings WHERE id = $1', [bookingId]);

      return updatedBooking.rows[0];
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  } else if (status === 'returned') {
    if (userRole !== 'admin') {
      throw new Error('Only admins can mark bookings as returned');
    }

    const client = await pool.connect();

    try {
      await client.query('BEGIN');

      await client.query(
        'UPDATE bookings SET status = $1 WHERE id = $2',
        ['returned', bookingId]
      );

      const vehicleResult = await client.query(
        'UPDATE vehicles SET availability_status = $1 WHERE id = $2 RETURNING *',
        ['available', booking.vehicle_id]
      );

      await client.query('COMMIT');

      const updatedBooking = await pool.query('SELECT * FROM bookings WHERE id = $1', [bookingId]);

      return {
        ...updatedBooking.rows[0],
        vehicle: {
          availability_status: vehicleResult.rows[0].availability_status
        }
      };
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  } else {
    throw new Error('Invalid status update');
  }
};
