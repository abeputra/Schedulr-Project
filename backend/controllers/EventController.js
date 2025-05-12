import Event from "../models/EventModel.js";
import User from "../models/UserModel.js";
import nodemailer from "nodemailer";
import dotenv from "dotenv";

// Load environment variables
dotenv.config();

// Validate email configuration
if (!process.env.EMAIL_SENDER || !process.env.EMAIL_PASS) {
  console.error(
    "❌ Missing EMAIL_SENDER or EMAIL_PASS in environment variables."
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
          `❌ Failed to send email to ${email}:`,
          emailError.message
        );
      }
    }

    res.status(201).json({
      message: "Event created successfully",
      event: newEvent,
    });
  } catch (error) {
    console.error("❌ Error creating event:", error.message);
    res.status(500).json({ message: "Failed to create event" });
  }
};

// Mendapatkan event milik user yang sedang login
export const getUserEvents = async (req, res) => {
  try {
    const userId = req.user.id;
    const events = await Event.findAll({ where: { userId } });

    res.status(200).json(events);
  } catch (error) {
    console.error("❌ Error fetching events:", error.message);
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

    await event.destroy();

    res.status(200).json({ message: "Event deleted successfully" });
  } catch (error) {
    console.error("❌ Error deleting event:", error.message);
    res.status(500).json({ message: "Failed to delete event" });
  }
};
