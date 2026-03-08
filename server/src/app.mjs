import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import authRoutes from "./routes/auth.mjs";
import taskRoutes from "./routes/taskRoutes.mjs";
import { globalErrorHandler } from "./middleware/errorMiddleware.mjs";
import AppError from "./utils/appError.mjs";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;


// Replace app.use(cors()) with this:
app.use(
  cors({
    origin: [
      "https://focusflow-frontend-seven.vercel.app",
      "http://localhost:5173",
    ],
    methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
    credentials: true,
  }),
);

// Global Middlewares
app.use(express.json());

// Heartbeat
app.get("/health", (req, res) => {
  res.status(200).json({ status: "FocusFlow Server is flowing... 🌊" });
});

// ROUTES - Changed '/api/task' to '/api/tasks' to match Frontend plural calls
app.use("/api/auth", authRoutes);
app.use("/api/tasks", taskRoutes);

// 404 Handler for undefined routes
app.use((req, res, next) => {
  next(new AppError(`Can't find ${req.originalUrl} on this server`, 404));
});

// Global Error Handler
app.use(globalErrorHandler);

app.listen(PORT, () => {
  console.log(`
  🚀 FocusFlow Engine Started!
  📡 URL: http://localhost:${PORT}
  🛠️  Routes: /api/auth & /api/tasks
  `);
});
