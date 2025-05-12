import User from "../models/UserModel.js";
import bcrypt from "bcrypt";
import jwt from 'jsonwebtoken';

// Fungsi untuk register
export const register = async (req, res) => {
  const {
    full_name,
    username,
    email,
    password,
    phone_number,
    country,
    address,
    gender,
    dob
  } = req.body;

  if (!full_name || !username || !email || !password) {
    return res.status(400).json({ error: "Full name, username, email, and password are required." });
  }

  try {
    const emailExists = await User.findOne({ where: { email } });
    if (emailExists) {
      return res.status(409).json({ error: "Email already in use." });
    }

    const usernameExists = await User.findOne({ where: { username } });
    if (usernameExists) {
      return res.status(409).json({ error: "Username already in use." });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const newUser = await User.create({
      full_name,
      username,
      email,
      password: hashedPassword,
      phone_number,
      country,
      address,
      gender,
      dob,
    });

    res.status(201).json({ message: "Registration successful", user: newUser });
  } catch (error) {
    console.error("Registration error:", error);
    res.status(500).json({ error: "Registration failed. Please try again." });
  }
};

// Fungsi untuk login
export const login = async (req, res) => {
  const { email, password } = req.body;

  try {
    const user = await User.findOne({ where: { email } });
    if (!user) {
      return res.status(401).json({ error: "Invalid email or password" });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ error: "Invalid email or password" });
    }

    const token = jwt.sign(
      {
        id: user.id,
        username: user.username,
        full_name: user.full_name,
        email: user.email, // ✅ Tambahkan email ke dalam payload token
      },
      process.env.JWT_SECRET,
      { expiresIn: "1d" }
    );

    res.status(200).json({
      message: "Login successful",
      token,
      user: {
        id: user.id,
        username: user.username,
        full_name: user.full_name,
        email: user.email
      }
    });
  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({ error: "Login failed. Please try again." });
  }
};

// Fungsi untuk mendapatkan data user berdasarkan token
export const getUser = async (req, res) => {
  try {
    const userId = req.user.id; // dari token yang didekode di middleware
    const user = await User.findByPk(userId);
    if (!user) return res.status(404).json({ error: 'User not found' });

    res.json({
      id: user.id,
      full_name: user.full_name,
      username: user.username,
    });
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch user' });
  }
};


