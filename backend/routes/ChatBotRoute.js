import express from "express";
import { checkConflict } from "../controllers/ChatBotController.js";
import verifyToken from "../middleware/verifyToken.js";

const router = express.Router();
router.post("/check", verifyToken, checkConflict);

export default router;
