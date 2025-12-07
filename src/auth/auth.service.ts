import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import pool from '../config/database';
import { User } from '../types';

const JWT_SECRET = process.env.JWT_SECRET || 'dsjfsjdhjdshfjghj234u23i4';

export const signup = async (userData: User) => {
  const { name, email, password, phone, role } = userData;

  if (password.length < 6) {
    throw new Error('Password must be at least 6 characters long');
  }

  const normalizedEmail = email.toLowerCase();

  const checkExisting = await pool.query(
    'SELECT * FROM users WHERE email = $1',
    [normalizedEmail]
  );

  if (checkExisting.rows.length > 0) {
    throw new Error('User with this email already exists');
  }

  const hashedPassword = await bcrypt.hash(password, 10);
  const userRole = role || 'customer';

  const result = await pool.query(
    'INSERT INTO users (name, email, password, phone, role) VALUES ($1, $2, $3, $4, $5) RETURNING id, name, email, phone, role',
    [name, normalizedEmail, hashedPassword, phone, userRole]
  );

  return result.rows[0];
};

export const signin = async (email: string, password: string) => {
  const normalizedEmail = email.toLowerCase();

  const userQuery = await pool.query(
    'SELECT * FROM users WHERE email = $1',
    [normalizedEmail]
  );

  if (userQuery.rows.length === 0) {
    throw new Error('Invalid email or password');
  }

  const user = userQuery.rows[0];
  const passwordMatch = await bcrypt.compare(password, user.password);

  if (!passwordMatch) {
    throw new Error('Invalid email or password');
  }

  const payload = {
    id: user.id,
    email: user.email,
    role: user.role
  };

  const token = jwt.sign(payload, JWT_SECRET, { expiresIn: '7d' });

  return {
    token,
    user: {
      id: user.id,
      name: user.name,
      email: user.email,
      phone: user.phone,
      role: user.role
    }
  };
};
