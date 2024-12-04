import { Request, Response, NextFunction } from "express";
import User from "../models/user.model.js";
import jwt from "jsonwebtoken";

interface DecodedToken {
  userId: string;
  // Add other properties as needed
}

export const protectedRoute = async (req: Request, res: Response, next: NextFunction) => {
  try {
    // const token = req.cookies.jwt_token;
    const token = req.headers.authorization;  // token
    if (!token) {
      return res.status(401).json({ message: "Unauthorized token not found" });
    }
    const secret = process.env.JWT_SECRET || "";
    const decoded = jwt.verify(token, secret) as DecodedToken;
    if (!decoded) {
      return res.status(401).json({ message: "Unauthorized token not decoded" });
    }

    const user = await User.findById(decoded.userId).select("-password");
    if (!user) {
      return res.status(401).json({ message: "Unauthorized " });
    }

    req.user = user; 
    next();
  } catch (error) {
    console.error("Error in protectedRoute middleware", error);
    res.status(500).json({ error: "Internal server error" });
  }
};
