import express, { Application, Request, Response, NextFunction } from 'express';
import authRoutes from './auth/auth.routes';
import vehicleRoutes from './vehicles/vehicles.routes';
import userRoutes from './users/users.routes';
import bookingRoutes from './bookings/bookings.routes';

const app: Application = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.get('/', (req: Request, res: Response) => {
  res.json({
    success: true,
    message: 'Vehicle Rental System API',
    version: '1.0.0'
  });
});

app.use('/api/v1/auth', authRoutes);
app.use('/api/v1/vehicles', vehicleRoutes);
app.use('/api/v1/users', userRoutes);
app.use('/api/v1/bookings', bookingRoutes);

app.use((req: Request, res: Response) => {
  res.status(404).json({
    success: false,
    message: 'Route not found',
    errors: `Cannot ${req.method} ${req.path}`
  });
});

app.use((err: Error, _req: Request, res: Response, _next: NextFunction) => {
  console.error('Server error:', err);
  res.status(500).json({
    success: false,
    message: 'Internal server error',
    errors: err.message
  });
});

export default app;
