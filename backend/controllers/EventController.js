import Event from "../models/EventModel.js";
import SubEvent from "../models/SubEventModel.js"; //
import User from "../models/UserModel.js";
import nodemailer from "nodemailer";
import dotenv from "dotenv";
import { Op } from "sequelize";

// Load environment variables
dotenv.config();

// Validate email configuration
if (!process.env.EMAIL_SENDER || !process.env.EMAIL_PASS) {
  console.error(
    "\u274C Missing EMAIL_SENDER or EMAIL_PASS in environment variables."
  );
  process.exit(1); // Stop server if email config is missing
}

// Setup nodemailer transporter
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_SENDER,
    pass: process.env.EMAIL_PASS,
  },
});

// Menambahkan event baru
export const createEvent = async (req, res) => {
  try {
    const { title, organizer, description, invited_members } = req.body;
    const userId = req.user.id;
    const creatorEmail = req.user.email; // Ambil email creator dari token

    if (!userId) {
      return res
        .status(400)
        .json({ message: "User ID is missing or invalid." });
    }

    // Verifikasi apakah setiap email anggota yang diundang terdaftar
    const invalidEmails = [];
    for (let email of invited_members) {
      const user = await User.findOne({ where: { email } });
      if (!user) {
        invalidEmails.push(email);
      }
    }

    if (invalidEmails.length > 0) {
      return res.status(400).json({
        message: `The following emails are not registered: ${invalidEmails.join(
          ", "
        )}`,
      });
    }

    // Jika semua email valid, lanjutkan untuk membuat event
    const newEvent = await Event.create({
      title,
      organizer,
      description,
      invited_members,
      userId,
      creator_email: creatorEmail, // Menambahkan email creator ke database
    });

    // Kirim email ke semua invited members
    for (let email of invited_members) {
      try {
        await transporter.sendMail({
          from: `"${organizer}" <${process.env.EMAIL_SENDER}>`,
          to: email,
          subject: `You're invited to the event: ${title}`,
          html: `
            <h3>Hello!</h3>
            <p>You have been invited to join the event <strong>${title}</strong>.</p>
            <p><strong>Organizer:</strong> ${organizer}</p>
            <p><strong>Description:</strong> ${description}</p>
            <p>We hope to see you there!</p>
          `,
        });
      } catch (emailError) {
        console.error(
          `\u274C Failed to send email to ${email}:`,
          emailError.message
        );
      }
    }

    res.status(201).json({
      message: "Event created successfully",
      event: newEvent,
    });
  } catch (error) {
    console.error("\u274C Error creating event:", error.message);
    res.status(500).json({ message: "Failed to create event" });
  }
};

// 🟢 GET EVENTS FOR USER
export const getUserEvents = async (req, res) => {
  try {
    const userId = req.user.id;
    const userEmail = req.user.email.toLowerCase();

    console.log("\uD83D\uDD0D User ID:", userId);
    console.log("\uD83D\uDD0D User Email:", userEmail);

    const allEvents = await Event.findAll();
    console.log(
      "\uD83D\uDCE6 All Events:",
      allEvents.map((e) => ({
        id: e.id,
        userId: e.userId,
        invited_members: e.invited_members,
      }))
    );

    const filteredEvents = allEvents.filter((event) => {
      let members = event.invited_members ?? [];

      // Handle case if stored as stringified JSON
      if (typeof members === "string") {
        try {
          members = JSON.parse(members);
        } catch (e) {
          console.warn("Invalid invited_members JSON:", members);
          members = [];
        }
      }

      const normalized = members.map((email) => email.toLowerCase());
      const isOwner = event.userId === userId;
      const isInvited = normalized.includes(userEmail);

      console.log(
        `Checking event ${event.title}: isOwner=${isOwner}, isInvited=${isInvited}`
      );

      return isOwner || isInvited;
    });

    console.log("\u2705 Filtered Events:", filteredEvents);

    res.status(200).json(filteredEvents.map((event) => event.dataValues));
  } catch (error) {
    console.error("\u274C Error fetching events:", error.message);
    res.status(500).json({ message: "Failed to fetch events" });
  }
};

// Menghapus event berdasarkan ID dan user
export const deleteEvent = async (req, res) => {
  try {
    const userId = req.user.id;
    const eventId = req.params.id;

    const event = await Event.findOne({ where: { id: eventId, userId } });

    if (!event) {
      return res
        .status(404)
        .json({ message: "Event not found or access denied" });
    }

    const { title, organizer, description, invited_members } = event;

    // Delete all sub-events linked to this event
    await SubEvent.destroy({ where: { eventId } });

    // Delete the main event
    await event.destroy();

    for (let email of invited_members) {
      try {
        await transporter.sendMail({
          from: `"${organizer}" <${process.env.EMAIL_SENDER}>`,
          to: email,
          subject: `The event "${title}" has been deleted`,
          html: `
            <h3>Hello!</h3>
            <p>We regret to inform you that the event <strong>${title}</strong> has been deleted.</p>
            <p><strong>Organizer:</strong> ${organizer}</p>
            <p><strong>Description:</strong> ${description}</p>
            <p>If you have any questions, feel free to reach out to the organizer.</p>
          `,
        });
      } catch (emailError) {
        console.error(
          `\u274C Failed to send email to ${email}:`,
          emailError.message
        );
      }
    }

    res
      .status(200)
      .json({ message: "Event and its sub-events deleted successfully" });
  } catch (error) {
    console.error("\u274C Error deleting event:", error.message);
    res.status(500).json({ message: "Failed to delete event" });
  }
};

export const updateEvent = async (req, res) => {
  try {
    const event = await Event.findByPk(req.params.id); // ✅ untuk PostgreSQL

    if (!event) {
      return res.status(404).json({ message: "Event not found" });
    }

    // Verifikasi kepemilikan
    if (event.userId !== req.user.id) {
      return res.status(403).json({ message: "Unauthorized" });
    }

    const { title, organizer, description, invited_members } = req.body;

    // Identify old and new invited members
    const oldInvitedMembers = event.invited_members ?? [];
    const newInvitedMembers = invited_members ?? [];

    // Determine newly added emails
    const addedEmails = newInvitedMembers.filter(
      (email) => !oldInvitedMembers.includes(email)
    );

    // Determine removed emails
    const removedEmails = oldInvitedMembers.filter(
      (email) => !newInvitedMembers.includes(email)
    );

    // Update the event with new data
    await event.update({
      title,
      organizer,
      description,
      invited_members: newInvitedMembers,
    });

    // Send emails to newly added members
    for (let email of addedEmails) {
      try {
        await transporter.sendMail({
          from: `"${organizer}" <${process.env.EMAIL_SENDER}>`,
          to: email,
          subject: `You're invited to the event: ${title}`,
          html: `
            <h3>Hello!</h3>
            <p>You have been invited to join the event <strong>${title}</strong>.</p>
            <p><strong>Organizer:</strong> ${organizer}</p>
            <p><strong>Description:</strong> ${description}</p>
            <p>We hope to see you there!</p>
          `,
        });
      } catch (emailError) {
        console.error(
          `\u274C Failed to send email to ${email}:`,
          emailError.message
        );
      }
    }

    // Send emails to removed members informing them they are no longer invited
    for (let email of removedEmails) {
      try {
        await transporter.sendMail({
          from: `"${organizer}" <${process.env.EMAIL_SENDER}>`,
          to: email,
          subject: `You're no longer invited to the event: ${title}`,
          html: `
            <h3>Hello!</h3>
            <p>We're sorry to inform you that you are no longer invited to the event <strong>${title}</strong>.</p>
            <p><strong>Organizer:</strong> ${organizer}</p>
            <p><strong>Description:</strong> ${description}</p>
            <p>If you have any questions, feel free to reach out to the organizer.</p>
          `,
        });
      } catch (emailError) {
        console.error(
          `\u274C Failed to send email to ${email}:`,
          emailError.message
        );
      }
    }

    res.status(200).json(event);
  } catch (err) {
    console.error("Update error:", err);
    res
      .status(500)
      .json({ message: "Failed to update event", error: err.message });
  }
};

export const getEventById = async (req, res) => {
  const { id } = req.params;
  try {
    // Use Sequelize to find the event by its primary key (id)
    const event = await Event.findByPk(id); // Find event by ID using Sequelize

    // Check if event exists
    if (!event) {
      return res.status(404).json({ message: "Event not found" });
    }

    // Return the event details as JSON
    res.status(200).json(event);
  } catch (err) {
    console.error("Error retrieving event:", err.message);
    res.status(500).json({ message: "Server error" });
  }
};
