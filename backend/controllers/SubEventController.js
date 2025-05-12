import SubEvent from "../models/SubEventModel.js";
import Event from "../models/EventModel.js";
import { Op, Sequelize } from "sequelize";
import nodemailer from "nodemailer";
import dotenv from "dotenv";

dotenv.config();

// Helper function untuk kirim email
const sendAssignmentEmails = async ({ emails, subject, html }) => {
  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: process.env.EMAIL_SENDER,
      pass: process.env.EMAIL_PASS,
    },
  });

  for (const to of emails) {
    await transporter.sendMail({
      from: `"Event App" <${process.env.EMAIL_SENDER}>`,
      to,
      subject,
      html,
    });
  }
};

// POST /api/subevents
export const createSubEvent = async (req, res) => {
  try {
    const {
      title,
      description,
      additional_description,
      date,
      time,
      location,
      eventId,
      assignedtasks,
      assignedmembers,
      task_or_agenda,
    } = req.body;

    // Validasi input dasar
    if (!eventId || !title || !date || !time || !location) {
      return res.status(400).json({ message: "Missing required fields" });
    }

    // Validasi format date dan time
    if (isNaN(Date.parse(`${date}T${time}`))) {
      return res.status(400).json({ message: "Invalid date or time format" });
    }

    // Validasi assignedtasks
    if (
      assignedtasks &&
      (!Array.isArray(assignedtasks) ||
        !assignedtasks.every((task) => typeof task.email === "string"))
    ) {
      return res.status(400).json({ message: "Invalid assignedtasks format" });
    }

    const event = await Event.findByPk(eventId, {
      attributes: ["organizer"],
    });

    if (!event) {
      return res.status(404).json({ message: "Event not found" });
    }

    const organizer = event.organizer;

    // Ambil email user yang login dari sesi
    const createdBy = req.user?.email || null;

    if (!createdBy) {
      return res
        .status(401)
        .json({ message: "Unauthorized: user not logged in" });
    }

    const newSubEvent = await SubEvent.create({
      eventId,
      title,
      description,
      additional_description,
      organizer,
      date,
      time,
      location,
      task_or_agenda,
      assignedtasks: Array.isArray(assignedtasks) ? assignedtasks : [],
      assignedmembers: Array.isArray(assignedmembers)
        ? assignedmembers
        : typeof assignedmembers === "string"
        ? [assignedmembers]
        : [],
      createdBy,
    });

    // Kirim email setelah subevent berhasil dibuat
    const emailsToNotify =
      task_or_agenda === "task"
        ? assignedtasks.map((t) => t.email)
        : assignedmembers;

    if (emailsToNotify.length > 0) {
      await sendAssignmentEmails({
        emails: emailsToNotify,
        subject: `You’ve been assigned to a subevent: ${title}`,
        html: `
          <p>Hello,</p>
          <p>You have been assigned to <strong>${title}</strong>.</p>
          <p><strong>Date:</strong> ${date}<br/>
          <strong>Time:</strong> ${time}<br/>
          <strong>Location:</strong> ${location}</p>
          <p>Check the event platform for more details.</p>
        `,
      });
    }

    res.status(201).json({
      message: "Sub Event created successfully",
      subEvent: newSubEvent,
    });
  } catch (error) {
    console.error("Error creating sub event:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

// GET /api/subevents/invited-members/:eventId
export const getInvitedMembers = async (req, res) => {
  const { eventId } = req.params;
  try {
    const event = await Event.findByPk(eventId, {
      attributes: ["invited_members"],
    });

    if (!event) {
      return res.status(404).json({ message: "Event not found" });
    }

    const members = event.invited_members || [];
    res.status(200).json(members);
  } catch (error) {
    console.error("Error getting invited members:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// GET /api/subevents/event/:eventId
export const getSubEventsByEventId = async (req, res) => {
  const { eventId } = req.params;
  try {
    const subEvents = await SubEvent.findAll({
      where: { eventId },
    });
    res.status(200).json(subEvents);
  } catch (err) {
    console.error("Error fetching sub-events:", err);
    res.status(500).json({ message: "Failed to fetch sub-events" });
  }
};

// GET /api/subevents/mine
export const getMySubEvents = async (req, res) => {
  try {
    if (!req.user || !req.user.email) {
      return res.status(401).json({ message: "User not authenticated" });
    }

    const userEmail = req.user.email;

    const subEvents = await SubEvent.findAll({
      where: {
        [Op.or]: [
          Sequelize.literal(
            `"assignedtasks"::jsonb @> '${JSON.stringify([
              { email: userEmail },
            ])}'`
          ),
          Sequelize.literal(`'${userEmail}' = ANY("assignedmembers")`),
        ],
      },
      include: [
        {
          model: Event,
          as: "Event",
          attributes: ["title"],
        },
      ],
    });

    if (!Array.isArray(subEvents) || subEvents.length === 0) {
      return res
        .status(404)
        .json({ message: "No sub-events found for this user" });
    }

    const currentUserEmail =
      req.user?.email || req.body?.email || req.query?.email || "";

    const result = subEvents.map((subEvent) => {
      const safeAssignedTasks = Array.isArray(subEvent.assignedtasks)
        ? subEvent.assignedtasks
        : [];

      const assigned = safeAssignedTasks.find(
        (task) => task.email === currentUserEmail
      );

      return {
        title: subEvent.title,
        eventName: subEvent.Event?.title || "Unknown Event",
        description: subEvent.description,
        additional_description: subEvent.additional_description,
        organizer: subEvent.organizer,
        date: subEvent.date,
        time: subEvent.time,
        location: subEvent.location,
        task_or_agenda: subEvent.task_or_agenda,
        taskType:
          subEvent.task_or_agenda === "task"
            ? assigned?.taskType || "Belum Ditentukan"
            : null,
      };
    });

    res.status(200).json(result);
  } catch (error) {
    console.error("Error fetching sub-events:", error);
    res.status(500).json({
      message: "Failed to fetch sub-events",
      error: error.message,
    });
  }
};

// DELETE /api/subevents/:id
export const deleteSubEvent = async (req, res) => {
  try {
    const subEvent = await SubEvent.findByPk(req.params.id);

    if (!subEvent) {
      return res.status(404).json({ message: "Sub-event not found" });
    }

    await subEvent.destroy();
    res.status(200).json({ message: "Sub-event deleted successfully" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Failed to delete sub-event" });
  }
};

// GET /api/subevents/detail/:subEventId
export const getSubEventById = async (req, res) => {
  const { subEventId } = req.params;
  try {
    const subEvent = await SubEvent.findByPk(subEventId);

    if (!subEvent) {
      return res.status(404).json({ message: "Sub-event not found" });
    }

    res.status(200).json(subEvent);
  } catch (error) {
    console.error("Error fetching sub-event by id:", error);
    res.status(500).json({ message: "Server error" });
  }
};
