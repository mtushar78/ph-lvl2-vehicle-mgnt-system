import pool from '../config/database';

export const processExpiredBookings = async () => {
  const client = await pool.connect();

  try {
    await client.query('BEGIN');

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const expiredBookings = await client.query(
      `SELECT b.id, b.vehicle_id
       FROM bookings b
       WHERE b.status = $1
       AND b.rent_end_date < $2`,
      ['active', today]
    );

    if (expiredBookings.rows.length > 0) {
      const bookingIds = expiredBookings.rows.map(b => b.id);
      const vehicleIds = expiredBookings.rows.map(b => b.vehicle_id);

      await client.query(
        `UPDATE bookings
         SET status = $1
         WHERE id = ANY($2::int[])`,
        ['returned', bookingIds]
      );

      await client.query(
        `UPDATE vehicles
         SET availability_status = $1
         WHERE id = ANY($2::int[])`,
        ['available', vehicleIds]
      );

      console.log(`Auto-returned ${expiredBookings.rows.length} expired bookings`);
    }

    await client.query('COMMIT');
    return expiredBookings.rows.length;
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('Error processing expired bookings:', error);
    throw error;
  } finally {
    client.release();
  }
};

export const startAutoReturnScheduler = () => {
  const checkInterval = 24 * 60 * 60 * 1000;

  processExpiredBookings().catch(err => {
    console.error('Initial auto-return check failed:', err);
  });

  setInterval(() => {
    processExpiredBookings().catch(err => {
      console.error('Scheduled auto-return check failed:', err);
    });
  }, checkInterval);

  console.log('Auto-return scheduler started (runs every 24 hours)');
};
