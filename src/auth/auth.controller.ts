import { Request, Response } from 'express';
import * as authService from './auth.service';

export const signupController = async (req: Request, res: Response) => {
  try {
    const user = await authService.signup(req.body);

    res.status(201).json({
      success: true,
      message: 'User registered successfully',
      data: user
    });
  } catch (error: any) {
    res.status(400).json({
      success: false,
      message: 'User registration failed',
      errors: error.message
    });
  }
};

export const signinController = async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Email and password are required',
        errors: 'Missing credentials'
      });
    }

    const data = await authService.signin(email, password);

    return res.status(200).json({
      success: true,
      message: 'Login successful',
      data
    });
  } catch (error: any) {
    return res.status(400).json({
      success: false,
      message: 'Login failed',
      errors: error.message
    });
  }
};
