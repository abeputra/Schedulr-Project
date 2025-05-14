import express from "express";
import {
  createSubEvent,
  getInvitedMembers,
  getSubEventsByEventId,
  getMySubEvents,
  deleteSubEvent,
  getSubEventById, // ini yang benar
} from "../controllers/SubEventController.js";

import verifyToken from "../middleware/verifyToken.js";
import { updateSubEvent } from "../controllers/SubEventController.js";

const router = express.Router();

// Create sub-event
router.post("/subevents", verifyToken, createSubEvent);

// Get invited members of an event
router.get(
  "/subevents/invited-members/:eventId",
  verifyToken,
  getInvitedMembers
);

// ✅ Get sub-events by eventId (for page: /subevent/event/:eventId)
router.get("/subevents/event/:eventId", verifyToken, getSubEventsByEventId);

// ✅ Get detail of a sub-event (for page: /subevent/detail/:subEventId)
router.get("/subevents/detail/:subEventId", verifyToken, getSubEventById);

// Get sub-events assigned to logged-in user
router.get("/subevents/my-tasks", verifyToken, getMySubEvents);

router.delete("/subevents/:id", verifyToken, deleteSubEvent);

router.get("/subevents/:eventId", verifyToken, getSubEventsByEventId);

// backend routes (contoh)
router.put("/subevents/detail/:id", updateSubEvent);

export default router;
