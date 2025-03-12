import express, { Request, Response } from "express";
import dotenv from "dotenv";
import cookieParser from "cookie-parser";
import cors from "cors";
import { app, server } from "./service/socket.js";
import authRoutes from "./routes/auth.route.js";
import messageRoutes from "./routes/messages.route.js";
import userRoutes from "./routes/user.route.js";
import connectToMongoDB from "./db/connection.js";

dotenv.config();

const PORT = process.env.PORT || 3000;

// Middleware
app.use(express.json()); // Parse JSON bodies
app.use(cookieParser()); // Parse Cookie header and populate req.cookies
app.use(cors({
  origin: ["http://localhost:5173", "https://be-social-eta.vercel.app"],
  credentials: true,
}));

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/messages", messageRoutes);
app.use("/api/users", userRoutes);

// Health check endpoint
app.get("/health", (_: Request, res: Response) => {
  res.status(200).json({ status: "OK" });
});

server.listen(PORT, () => {
  connectToMongoDB();
  console.log(`Server Running on Port ${PORT}`);
});

