import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';

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

// 4. Start the Engine
app.listen(PORT, () => {
  console.log(`
  🚀 Server is running!
  📡 URL: http://localhost:${PORT}
  🛠️ Mode: Development
  `);
});