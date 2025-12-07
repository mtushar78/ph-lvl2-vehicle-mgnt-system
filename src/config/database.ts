import { Pool } from 'pg';
import { loadEnvironment } from '../utils/env';

loadEnvironment();

const connectionString = process.env.DATABASE_URL;

const pool = new Pool({
  connectionString,
});

pool.on('connect', () => {
  console.log('Database connected successfully');
});

pool.on('error', (err) => {
  console.error('Database connection error:', err);
  process.exit(-1);
});

export default pool;
