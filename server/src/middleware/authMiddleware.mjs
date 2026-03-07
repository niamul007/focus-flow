import jwt from "jsonwebtoken";
import pool from "../db/index.mjs";

export const protect = async (req, res, next) => {
  console.log("Checking Secret:", process.env.JWT_SECRET);
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({ message: "No token, authorization denied" });
    }

    const token = authHeader.split(" ")[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    const result = await pool.query(
      "SELECT id, email, username FROM users WHERE id = $1",
      [decoded.id]
    );

    if (result.rows.length === 0) {
      return res.status(401).json({ message: "User not found" });
    }

    req.user = result.rows[0];
    next();

  } catch (error) {
    console.error("JWT Verification Error:", error.message);
    res.status(401).json({ message: "Token not valid" });
  }
};