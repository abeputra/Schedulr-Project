import passport from "passport";
import { Strategy as GoogleStrategy } from "passport-google-oauth20";
import dotenv from "dotenv";
import User from "./models/UserModel.js"; // pastikan path-nya benar

dotenv.config(); // Memuat variabel lingkungan dari file .env

passport.use(
  new GoogleStrategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID, // Menggunakan variabel dari .env
      clientSecret: process.env.GOOGLE_CLIENT_SECRET, // Menggunakan variabel dari .env
      callbackURL: process.env.CALLBACK_URL, // Menggunakan variabel dari .env
    },
    async (accessToken, refreshToken, profile, done) => {
      try {
        const email = profile.emails[0].value;
        let user = await User.findOne({ where: { email } });

        if (!user) {
          user = await User.create({
            full_name: profile.displayName,
            email,
            username: profile.id, // Kamu bisa ubah logikanya
            password: "google_oauth",
            phone_number: "-",
            country: "-",
            address: "-",
            gender: "other",
            dob: "2000-01-01",
          });
        }

        return done(null, user);
      } catch (err) {
        return done(err, null);
      }
    }
  )
);

passport.serializeUser((user, done) => {
  done(null, user.id);
});

passport.deserializeUser(async (id, done) => {
  const user = await User.findByPk(id);
  done(null, user);
});
