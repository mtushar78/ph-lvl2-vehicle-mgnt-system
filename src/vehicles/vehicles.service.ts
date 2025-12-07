import pool from '../config/database';
import { Vehicle } from '../types';

export const createVehicle = async (vehicleData: Vehicle) => {
  const { vehicle_name, type, registration_number, daily_rent_price, availability_status } = vehicleData;

  const existingVehicle = await pool.query(
    'SELECT * FROM vehicles WHERE registration_number = $1',
    [registration_number]
  );

  if (existingVehicle.rows.length > 0) {
    throw new Error('Vehicle with this registration number already exists');
  }

  const result = await pool.query(
    'INSERT INTO vehicles (vehicle_name, type, registration_number, daily_rent_price, availability_status) VALUES ($1, $2, $3, $4, $5) RETURNING *',
    [vehicle_name, type, registration_number, daily_rent_price, availability_status || 'available']
  );

  return result.rows[0];
};

export const getAllVehicles = async () => {
  const result = await pool.query('SELECT * FROM vehicles ORDER BY id');
  return result.rows;
};

export const getVehicleById = async (id: number) => {
  const result = await pool.query('SELECT * FROM vehicles WHERE id = $1', [id]);

  if (result.rows.length === 0) {
    throw new Error('Vehicle not found');
  }

  return result.rows[0];
};

export const updateVehicle = async (id: number, vehicleData: Partial<Vehicle>) => {
  const currentVehicle = await getVehicleById(id);

  if (vehicleData.registration_number && vehicleData.registration_number !== currentVehicle.registration_number) {
    const check = await pool.query(
      'SELECT * FROM vehicles WHERE registration_number = $1 AND id != $2',
      [vehicleData.registration_number, id]
    );

    if (check.rows.length > 0) {
      throw new Error('Vehicle with this registration number already exists');
    }
  }

  const updated = {
    vehicle_name: vehicleData.vehicle_name || currentVehicle.vehicle_name,
    type: vehicleData.type || currentVehicle.type,
    registration_number: vehicleData.registration_number || currentVehicle.registration_number,
    daily_rent_price: vehicleData.daily_rent_price !== undefined ? vehicleData.daily_rent_price : currentVehicle.daily_rent_price,
    availability_status: vehicleData.availability_status || currentVehicle.availability_status
  };

  const result = await pool.query(
    'UPDATE vehicles SET vehicle_name = $1, type = $2, registration_number = $3, daily_rent_price = $4, availability_status = $5 WHERE id = $6 RETURNING *',
    [updated.vehicle_name, updated.type, updated.registration_number, updated.daily_rent_price, updated.availability_status, id]
  );

  return result.rows[0];
};

export const deleteVehicle = async (id: number) => {
  await getVehicleById(id);

  const activeBookings = await pool.query(
    'SELECT * FROM bookings WHERE vehicle_id = $1 AND status = $2',
    [id, 'active']
  );

  if (activeBookings.rows.length > 0) {
    throw new Error('Cannot delete vehicle with active bookings');
  }

  await pool.query('DELETE FROM vehicles WHERE id = $1', [id]);
};
