import express from "express";
import fileUpload from "express-fileupload";
import cors from "cors";
import session from "express-session";
import passport from "passport";
import { Strategy as GoogleStrategy } from "passport-google-oauth20";
import cookieParser from "cookie-parser";
import dotenv from "dotenv";
import EventRoute from "./routes/EventRoute.js";
import SubEventRoute from "./routes/SubEventRoute.js";

import db from "./config/database.js";
import UserRoute from "./routes/UserRoute.js";
import AuthRoute from "./routes/AuthRoute.js";
import "./passport.js"; // Jika file ini tidak ada, boleh dihapus

import "./models/UserModel.js";
import "./models/EventModel.js";
import "./models/SubEventModel.js";
import "./models/associations.js"; // <== WAJIB: pasang asosiasi setelah semua model dimuat

dotenv.config();
const app = express();

// ===== Middleware Setup =====
app.use(cors({ origin: "http://localhost:3000", credentials: true })); // sesuaikan origin frontend
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

// ===== Passport Setup =====
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

// ===== Routes =====
app.use("/api", UserRoute);
app.use("/auth", AuthRoute);
app.use("/api", EventRoute);
app.use("/api/subevents", SubEventRoute);

// ===== DB Connection =====
try {
  await db.authenticate();
  console.log("Database connected...");
} catch (err) {
  console.error("Unable to connect to DB:", err);
}

// ===== Server Start =====
app.listen(5000, () => console.log("Server Up and Running on port 5000"));
