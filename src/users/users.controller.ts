import { Request, Response } from 'express';
import * as userService from './users.service';
import { AuthRequest } from '../types';

export const getAllUsersController = async (req: Request, res: Response) => {
  try {
    const users = await userService.getAllUsers();

    res.status(200).json({
      success: true,
      message: 'Users retrieved successfully',
      data: users
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve users',
      errors: error.message
    });
  }
};

export const updateUserController = async (req: Request, res: Response) => {
  try {
    const userId = parseInt(req.params.userId);
    const authReq = req as AuthRequest;

    if (isNaN(userId)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid user ID',
        errors: 'User ID must be a number'
      });
    }

    const user = await userService.updateUser(
      userId,
      req.body,
      authReq.user!.id,
      authReq.user!.role
    );

    res.status(200).json({
      success: true,
      message: 'User updated successfully',
      data: user
    });
  } catch (error: any) {
    if (error.message === 'User not found') {
      return res.status(404).json({
        success: false,
        message: 'User not found',
        errors: error.message
      });
    }

    res.status(400).json({
      success: false,
      message: 'Failed to update user',
      errors: error.message
    });
  }
};

export const deleteUserController = async (req: Request, res: Response) => {
  try {
    const userId = parseInt(req.params.userId);

    if (isNaN(userId)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid user ID',
        errors: 'User ID must be a number'
      });
    }

    await userService.deleteUser(userId);

    res.status(200).json({
      success: true,
      message: 'User deleted successfully'
    });
  } catch (error: any) {
    if (error.message === 'User not found') {
      return res.status(404).json({
        success: false,
        message: 'User not found',
        errors: error.message
      });
    }

    if (error.message === 'Cannot delete user with active bookings') {
      return res.status(400).json({
        success: false,
        message: 'Cannot delete user',
        errors: error.message
      });
    }

    res.status(500).json({
      success: false,
      message: 'Failed to delete user',
      errors: error.message
    });
  }
};
