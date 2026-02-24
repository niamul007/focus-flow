// 1. Correct Import (Notice we use the path to your service file)
import * as authService from "../services/authService.mjs";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

export const register = async (req, res) => {
  // 2. Extract data
  const { email, password } = req.body;

  // 3. Validation (Email OR Password missing)
  if (!email || !password) {
    return res.status(400).json({
      status: "Failed",
      message: "Email and password are required",
    });
  }

  try {
    // 4. Call the worker
    const user = await authService.registerUser(email, password);

    // 5. Success!
    res.status(201).json({
      status: "success",
      data: { user },
    });
  } catch (err) {
    // 6. Send error instead of throwing it
    console.error("DETAILED ERROR:", err); // <--- Add this line
    res.status(500).json({
      status: "error",
      message: err.message,
    });
  }
};

export const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // 1. Call your function: findUserByEmail
    const user = await authService.findUserByEmail(email);

    // 2. If the user doesn't exist, stop here!
    if (!user) {
      return res.status(401).json({ message: "Invalid Credentials" });
    }

    // 3. Compare the plain password with the HASH from the DB
    const isMatch = await bcrypt.compare(password, user.password_hash);

    if (!isMatch) {
      return res.status(401).json({ message: "Invalid Credentials" });
    }

    // 4. Generate the "Passport" (Token)
    const token = jwt.sign({ id: user.id }, process.env.JWT_SECRET, {
      expiresIn: "1d",
    });

    // 4. Success!
    res.status(200).json({
      status: "success",
      message: "Login successful!",
      data: {
        user: { id: user.id, email: user.email },
        token: token,
      },
    });
  } catch (err) {
    console.error("LOGIN ERROR:", err);
    res.status(500).json({ status: "error", message: "Internal Server Error" });
  }
};
