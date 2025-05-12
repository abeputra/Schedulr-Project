import express from 'express';
import { register, login, getUser } from '../controllers/UserController.js';
import verifyToken from '../middleware/verifyToken.js';

const router = express.Router();

// Public routes
router.post('/register', register);
router.post('/login', login);

// Protected routes
router.get('/profile', verifyToken, getUser);

export default router;
