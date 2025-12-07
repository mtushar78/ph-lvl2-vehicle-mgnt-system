import { Request, Response } from 'express';
import * as vehicleService from './vehicles.service';

export const createVehicleController = async (req: Request, res: Response) => {
  try {
    const vehicle = await vehicleService.createVehicle(req.body);

    res.status(201).json({
      success: true,
      message: 'Vehicle created successfully',
      data: vehicle
    });
  } catch (error: any) {
    res.status(400).json({
      success: false,
      message: 'Failed to create vehicle',
      errors: error.message
    });
  }
};

export const getAllVehiclesController = async (req: Request, res: Response) => {
  try {
    const vehicles = await vehicleService.getAllVehicles();

    if (vehicles.length === 0) {
      return res.status(200).json({
        success: true,
        message: 'No vehicles found',
        data: []
      });
    }

    res.status(200).json({
      success: true,
      message: 'Vehicles retrieved successfully',
      data: vehicles
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve vehicles',
      errors: error.message
    });
  }
};

export const getVehicleByIdController = async (req: Request, res: Response) => {
  try {
    const vehicleId = parseInt(req.params.vehicleId);

    if (isNaN(vehicleId)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid vehicle ID',
        errors: 'Vehicle ID must be a number'
      });
    }

    const vehicle = await vehicleService.getVehicleById(vehicleId);

    res.status(200).json({
      success: true,
      message: 'Vehicle retrieved successfully',
      data: vehicle
    });
  } catch (error: any) {
    if (error.message === 'Vehicle not found') {
      return res.status(404).json({
        success: false,
        message: 'Vehicle not found',
        errors: error.message
      });
    }

    res.status(500).json({
      success: false,
      message: 'Failed to retrieve vehicle',
      errors: error.message
    });
  }
};

export const updateVehicleController = async (req: Request, res: Response) => {
  try {
    const vehicleId = parseInt(req.params.vehicleId);

    if (isNaN(vehicleId)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid vehicle ID',
        errors: 'Vehicle ID must be a number'
      });
    }

    const vehicle = await vehicleService.updateVehicle(vehicleId, req.body);

    res.status(200).json({
      success: true,
      message: 'Vehicle updated successfully',
      data: vehicle
    });
  } catch (error: any) {
    if (error.message === 'Vehicle not found') {
      return res.status(404).json({
        success: false,
        message: 'Vehicle not found',
        errors: error.message
      });
    }

    res.status(400).json({
      success: false,
      message: 'Failed to update vehicle',
      errors: error.message
    });
  }
};

export const deleteVehicleController = async (req: Request, res: Response) => {
  try {
    const vehicleId = parseInt(req.params.vehicleId);

    if (isNaN(vehicleId)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid vehicle ID',
        errors: 'Vehicle ID must be a number'
      });
    }

    await vehicleService.deleteVehicle(vehicleId);

    res.status(200).json({
      success: true,
      message: 'Vehicle deleted successfully'
    });
  } catch (error: any) {
    if (error.message === 'Vehicle not found') {
      return res.status(404).json({
        success: false,
        message: 'Vehicle not found',
        errors: error.message
      });
    }

    if (error.message === 'Cannot delete vehicle with active bookings') {
      return res.status(400).json({
        success: false,
        message: 'Cannot delete vehicle',
        errors: error.message
      });
    }

    res.status(500).json({
      success: false,
      message: 'Failed to delete vehicle',
      errors: error.message
    });
  }
};
