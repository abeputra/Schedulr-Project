import express from 'express';
import { checkConflict } from '../controllers/ChatBotController.js';

const router = express.Router();
router.post('/check', checkConflict);

export default router;