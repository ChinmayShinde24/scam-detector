import express from 'express';
import { createUser, loginUser, logoutUser } from '../controllers/user.controller.js';

const router = express.Router();

// Register/Create User
router.post('/register', createUser);

// Login User
router.post('/login', loginUser);

// Logout User
router.post('/logout', logoutUser);

export default router;