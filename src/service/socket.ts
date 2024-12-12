import { Server as SocketIOServer } from "socket.io";
import http from "http";
import express from "express"


const app = express();
const server = http.createServer(app);

// This will be imported and used in the main server (server.ts)
const io = new SocketIOServer(server, {
  cors: {
    origin: [
      'https://be-social-eta.vercel.app',
      'https://be-social-git-main-shubham-gunds-projects.vercel.app',
      'http://localhost:5173',
    ],
  },
});

// User socket map
interface UserSocketMap {
  [userId: string]: string;
}

const userSocketMap: UserSocketMap = {}; // Map of userId to socketId

// Function to get receiver's socket ID
export function getReceiverSocketId(userId: string): string | undefined {
  return userSocketMap[userId];
}

io.on("connection", (socket) => {
  console.log("A user connected:", socket.id);

  const userId = socket.handshake.query.userId as string;

  if (userId)  userSocketMap[userId] = socket.id; 

  io.emit("getOnlineUsers", Object.keys(userSocketMap));

  socket.on("disconnect", () => {
    console.log("A user disconnected:", socket.id);
    
    if (userId) {
      delete userSocketMap[userId];
      io.emit("getOnlineUsers", Object.keys(userSocketMap));
    }
  });
});

export { io, app, server };