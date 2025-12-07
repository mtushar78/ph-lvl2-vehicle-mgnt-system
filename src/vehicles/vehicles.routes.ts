import express from 'express';
import {
  createVehicleController,
  getAllVehiclesController,
  getVehicleByIdController,
  updateVehicleController,
  deleteVehicleController
} from './vehicles.controller';
import { authenticate, authorizeAdmin } from '../middleware/auth';

const router = express.Router();

router.post('/', authenticate, authorizeAdmin, createVehicleController);
router.get('/', getAllVehiclesController);
router.get('/:vehicleId', getVehicleByIdController);
router.put('/:vehicleId', authenticate, authorizeAdmin, updateVehicleController);
router.delete('/:vehicleId', authenticate, authorizeAdmin, deleteVehicleController);

export default router;
