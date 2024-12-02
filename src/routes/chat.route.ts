import express, { Request, Response } from 'express';
import { protectedRoute } from '../middleware/protectedRoute.js'; // Add authentication
import { chatWithAI } from '../controllers/chat.controller.js';

const router = express.Router();

// Add authentication middleware
router.post('/', protectedRoute,chatWithAI);

export default router;