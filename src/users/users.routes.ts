import express from 'express';
import {
  getAllUsersController,
  updateUserController,
  deleteUserController
} from './users.controller';
import { authenticate, authorizeAdmin, authorizeOwnerOrAdmin } from '../middleware/auth';

const router = express.Router();

router.get('/', authenticate, authorizeAdmin, getAllUsersController);
router.put('/:userId', authenticate, authorizeOwnerOrAdmin, updateUserController);
router.delete('/:userId', authenticate, authorizeAdmin, deleteUserController);

export default router;
