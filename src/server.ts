import express from "express";
import 'dotenv/config';
import cookieParser from "cookie-parser"
import {v2 as cloudinary} from "cloudinary"
import cors from "cors"

import authRoutes from "./routes/auth.route.js"
import userRoutes from "./routes/user.route.js"
import postRoutes from "./routes/post.route.js"
import notificationRoutes from "./routes/notification.route.js"
import chatRoutes from './routes/chat.route.js';
 
import connectMongoDB from "./db/connection.js";

import messageRoutes from './routes/messages.route.js';


import { createServer } from 'http';

// dotenv.config();
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
})

const app = express();
const httpServer = createServer(app);

app.use(express.urlencoded({extended:true}))
const allowedOrigins = [
  'https://be-social-eta.vercel.app',
  'https://be-social-git-main-shubham-gunds-projects.vercel.app',
  'http://localhost:5173',
];
app.use(cors(
  {
    origin: allowedOrigins,
  credentials: true,
  }
));
app.use(cookieParser())
// Custom JSON parsing middleware
app.use(express.json({
  verify: (req: express.Request, res: express.Response, buf: Buffer) => {
    try {
      JSON.parse(buf.toString());
    } catch (e) {
      res.status(400).json({ error: 'Invalid JSON' });
      throw new Error('Invalid JSON');
    }
  }
}));

app.use("/api/auth",authRoutes);
app.use("/api/users",userRoutes);
app.use("/api/posts",postRoutes);
app.use("/api/notification",notificationRoutes);
app.use('/api/chat', chatRoutes);
app.use("/api/messages", messageRoutes);

app.get("/",(req,res)=>{
  res.send("Hello World");
})

app.listen(3000,()=>{
  console.log("listening on port 3000");
  connectMongoDB();
})
