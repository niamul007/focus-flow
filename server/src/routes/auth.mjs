import express from "express";
import { register, login } from "../controllers/authController.mjs";
import { protect } from "../middleware/authMiddleware.mjs"; // <--- Add this!
import { signupSchema, loginSchema } from "../validations/authValidation.mjs";
import { validate } from "../validations/validate.mjs";

const router = express.Router();

// This is your "Private" route
router.get("/me", protect, (req, res) => {
  res.json({ message: "You are authorized!", user: req.user });
});

router.post("/signup", validate(signupSchema), register);
router.post("/login", validate(loginSchema), login);

export default router;
