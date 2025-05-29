import express from "express";
import fileUpload from "express-fileupload";
import cors from "cors";
import session from "express-session";
import passport from "passport";
import { Strategy as GoogleStrategy } from "passport-google-oauth20";
import cookieParser from "cookie-parser";
import dotenv from "dotenv";
import db from "./config/database.js";

// Route Imports
import UserRoute from "./routes/UserRoute.js";
import AuthRoute from "./routes/AuthRoute.js";
import EventRoute from "./routes/EventRoute.js";
import SubEventRoute from "./routes/SubEventRoute.js";
import ScheduleRoute from "./routes/ChatBotRoute.js";
// import invitationRoutes from "./routes/InvitationRoute.js";

// Passport Setup
import "./passport.js";

dotenv.config(); // ✅ Pindah ke atas agar tersedia sebelum dipakai

const app = express();

const startServer = async () => {
  // Middleware
  app.use(cors({ origin: "http://localhost:3001", credentials: true }));
  app.use(cookieParser());
  app.use(express.json());
  app.use(fileUpload());
  app.use(express.static("public"));

  app.use(
    session({
      secret: process.env.SESSION_SECRET || "your_secret_key",
      resave: false,
      saveUninitialized: true,
    })
  );

  app.use(passport.initialize());
  app.use(passport.session());

  passport.use(
    new GoogleStrategy(
      {
        clientID: process.env.GOOGLE_CLIENT_ID,
        clientSecret: process.env.GOOGLE_CLIENT_SECRET,
        callbackURL: "http://localhost:5000/auth/google/callback",
      },
      (accessToken, refreshToken, profile, done) => {
        return done(null, profile);
      }
    )
  );

  passport.serializeUser((user, done) => done(null, user));
  passport.deserializeUser((user, done) => done(null, user));

  // Test route (optional)
  app.get('/', (req, res) =>
    res.send(`
      <form action="/demo" method="post" enctype="multipart/form-data">
        <input type="file" name="image">
        <button type="submit">Upload</button>
      </form>
    `)
  );

  // Routes
  app.use("/api", UserRoute);
  app.use("/auth", AuthRoute);
  app.use("/api", EventRoute);
  app.use("/api", SubEventRoute);
  app.use("/api", ScheduleRoute);
  // app.use("/api", invitationRoutes);
  // app.use("/", azureDemoRoute);
  // app.use("/ask", openaiRoute);

  // Test DB connection
  try {
    await db.authenticate();
    console.log("✅ Database connected...");

    await db.sync(); // gunakan sync() jika perlu, atau pakai migration di project besar
    console.log("✅ Database synced...");
  } catch (err) {
    console.error("❌ Unable to connect to DB:", err.message);
  }

  app.listen(5000, () => {
    console.log("🚀 Server running at http://localhost:5000");
  });
};

startServer();