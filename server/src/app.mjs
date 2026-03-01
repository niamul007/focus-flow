import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import authRoutes from './routes/auth.mjs'
import taskRoutes from './routes/taskRoutes.mjs';
import { globalErrorHandler } from './middleware/errorMiddleware.mjs';
import AppError from './utils/appError.mjs'

// 1. Load Environment Variables
dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// 2. Global Middlewares
app.use(cors());          // Allows Frontend to talk to Backend
app.use(express.json());  // Allows Server to read JSON data

// 3. The "Heartbeat" Route
app.get('/health', (req, res) => {
  res.status(200).json({ 
    status: 'FocusFlow Server is flowing... 🌊',
    timestamp: new Date().toISOString()
  });
});

app.use('/api/auth',authRoutes);
app.use('/api/task',taskRoutes);
app.use((req, res, next) => {
    next(new AppError(`can't find ${req.originalUrl} on this server`, 404));
})
console.log("--- DEBUG: APP REACHED END ---");

app.use(globalErrorHandler)
// 4. Start the Engine
// 4. Start the Engine
const server = app.listen(PORT, () => {
  console.log(`
  🚀 Server is running!
  📡 URL: http://localhost:${PORT}
  🛠️ Mode: Development
  `);
});

// ADD THIS: Keep the process alive manually for 24 hours
// This is a "hack" to see if the server stays open
setInterval(() => {
  // This empty function keeps the Event Loop "busy" so it won't exit
}, 1000 * 60 * 60); 

server.on('error', (err) => {
  console.error("Critical Server Error:", err);
});