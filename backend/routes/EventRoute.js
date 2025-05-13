import express from "express";
import {
  createEvent,
  getUserEvents,
  deleteEvent,
  updateEvent,
} from "../controllers/EventController.js";
import verifyToken from "../middleware/verifyToken.js";

const router = express.Router();

router.post("/events", verifyToken, createEvent);
router.get("/events", verifyToken, getUserEvents);
router.delete("/events/:id", verifyToken, deleteEvent);
router.put("/events/:id", verifyToken, updateEvent);

export default router;
