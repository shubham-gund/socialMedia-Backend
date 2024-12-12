import express from "express";
import 'dotenv/config';
import { v2 as cloudinary } from "cloudinary";
import cors from "cors";

import authRoutes from "./routes/auth.route.js";
import userRoutes from "./routes/user.route.js";
import postRoutes from "./routes/post.route.js";
import notificationRoutes from "./routes/notification.route.js";
import chatRoutes from './routes/chat.route.js';
import messageRoutes from './routes/messages.route.js';

import connectMongoDB from "./db/connection.js";

// Import the Socket.IO server from socket.ts
import { app,server } from './service/socket.js'; 

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});
// Allowing CORS for frontend applications
const allowedOrigins = [
  'https://be-social-eta.vercel.app',
  'https://be-social-git-main-shubham-gunds-projects.vercel.app',
  'http://localhost:5173',
];

app.use(cors({
  origin: allowedOrigins,
  credentials: true,
}));

app.use(express.json({ limit: "5mb" }));
app.use(express.urlencoded({ extended: true, limit: "10mb" }));

// API Routes
app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);
app.use("/api/posts", postRoutes);
app.use("/api/notification", notificationRoutes);
app.use('/api/chat', chatRoutes);
app.use("/api/messages", messageRoutes);

app.get("/", (req, res) => {
  res.send("Hello World");
});

server.listen(3000, () => {
  console.log("Server running on port 3000");
  connectMongoDB();
});

