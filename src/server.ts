import app from './app';
import { initializeDatabase } from './database/init';
import { loadEnvironment } from './utils/env';
import { startAutoReturnScheduler } from './bookings/auto-return';

loadEnvironment();

const PORT = parseInt(process.env.PORT || '5000');

const startServer = async () => {
  try {
    await initializeDatabase();

    startAutoReturnScheduler();

    app.listen(PORT, () => {
      console.log(`Server is running on port ${PORT}`);
      console.log(`API available at http://localhost:${PORT}/api/v1`);
    });
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
};

startServer();
