import { Server as SocketIOServer } from "socket.io";
import http from "http";
import express from "express";

const app = express();
const server = http.createServer(app);

// Define a type for the user socket map
interface UserSocketMap {
  [userId: string]: string;
}

const userSocketMap: UserSocketMap = {}; // {userId: socketId}
const allowedOrigins = [
  'https://be-social-eta.vercel.app',
  'https://be-social-git-main-shubham-gunds-projects.vercel.app',
  'http://localhost:5173',
];
const io = new SocketIOServer(server, {
  cors: {
    origin: allowedOrigins,
  },
});

// Function to get receiver's socket ID
export function getReceiverSocketId(userId: string): string | undefined {
  return userSocketMap[userId];
}

io.on("connection", (socket) => {
  console.log("A user connected", socket.id);

  // Ensure userId is a string and not undefined
  const userId = socket.handshake.query.userId as string;

  if (userId) {
    userSocketMap[userId] = socket.id;
  }

  // Emit online users to all connected clients
  io.emit("getOnlineUsers", Object.keys(userSocketMap));

  socket.on("disconnect", () => {
    console.log("A user disconnected", socket.id);
    
    if (userId) {
      delete userSocketMap[userId];
      io.emit("getOnlineUsers", Object.keys(userSocketMap));
    }
  });
});

export { io, app, server };