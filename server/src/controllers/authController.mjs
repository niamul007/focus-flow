// 1. Correct Import (Notice we use the path to your service file)
import * as authService from "../services/authService.mjs";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

export const register = async (req, res) => {
  const { email, password, username } = req.body; // Added 'name' here
  try {
    // 1. Save the user to the database
    const user = await authService.registerUser(email, password, username);

    // 2. CREATE THE TOKEN (The missing piece!)
    const token = jwt.sign(
      { id: user.id }, 
      process.env.JWT_SECRET || 'dev_secret_key', 
      { expiresIn: '1d' }
    );

    // 3. SEND EVERYTHING BACK
    res.status(201).json({
      status: "success",
      token: token, // <--- NOW YOU WILL SEE IT
      message: "Welcome to FocusFlow!",
      data: { 
        user: { 
          id: user.id, 
          email: user.email,
          name: user.username || "New User" // <--- SHOWING THE NAME
        } 
      },
    });
  } catch (err) {
    console.error("REGISTER ERROR:", err);
    res.status(500).json({ status: "error", message: err.message });
  }
};

export const login = async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await authService.findUserByEmail(email);

    if (!user) {
      return res.status(401).json({ status: "fail", message: "Invalid Credentials" });
    }

    const isMatch = await bcrypt.compare(password, user.password_hash);
    if (!isMatch) {
      return res.status(401).json({ status: "fail", message: "Invalid Credentials" });
    }

    // 1. Generate the token
    const token = jwt.sign(
      { id: user.id }, 
      process.env.JWT_SECRET || 'dev_secret_key', 
      { expiresIn: '1d' }
    );

    // 2. SEND IT (Notice the token is right here at the top)
    return res.status(200).json({
      status: "success",
      token: token, 
      message: "NIAMUL_VERIFIED_LOGIN",
      data: {
        user: { id: user.id, email: user.email }
      }
    });
  } catch (err) {
    console.error("LOGIN ERROR:", err);
    res.status(500).json({ status: "error", message: "Check server terminal" });
  }
};