import pool from '../config/database';
import { User } from '../types';

export const getAllUsers = async () => {
  const result = await pool.query(
    'SELECT id, name, email, phone, role FROM users ORDER BY id'
  );
  return result.rows;
};

export const getUserById = async (id: number) => {
  const result = await pool.query(
    'SELECT id, name, email, phone, role FROM users WHERE id = $1',
    [id]
  );

  if (result.rows.length === 0) {
    throw new Error('User not found');
  }

  return result.rows[0];
};

export const updateUser = async (id: number, userData: Partial<User>, requestingUserId: number, requestingUserRole: string) => {
  const currentUser = await getUserById(id);

  if (userData.email && userData.email !== currentUser.email) {
    const normalizedEmail = userData.email.toLowerCase();
    const check = await pool.query(
      'SELECT * FROM users WHERE email = $1 AND id != $2',
      [normalizedEmail, id]
    );

    if (check.rows.length > 0) {
      throw new Error('User with this email already exists');
    }
  }

  const updated = {
    name: userData.name || currentUser.name,
    email: userData.email ? userData.email.toLowerCase() : currentUser.email,
    phone: userData.phone || currentUser.phone,
    role: currentUser.role
  };

  if (requestingUserRole === 'admin' && userData.role) {
    updated.role = userData.role;
  }

  const result = await pool.query(
    'UPDATE users SET name = $1, email = $2, phone = $3, role = $4 WHERE id = $5 RETURNING id, name, email, phone, role',
    [updated.name, updated.email, updated.phone, updated.role, id]
  );

  return result.rows[0];
};

export const deleteUser = async (id: number) => {
  await getUserById(id);

  const activeBookings = await pool.query(
    'SELECT * FROM bookings WHERE customer_id = $1 AND status = $2',
    [id, 'active']
  );

  if (activeBookings.rows.length > 0) {
    throw new Error('Cannot delete user with active bookings');
  }

  await pool.query('DELETE FROM users WHERE id = $1', [id]);
};
