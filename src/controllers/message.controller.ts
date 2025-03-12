import { Request, Response } from "express";
import User from "../models/user.model.js";
import Message from "../models/messages.model.js";
import { getReceiverSocketId, io } from "../service/socket.js";
import { generateReplySuggestions } from "../service/gemini.service.js";

export const getUsersForSidebar = async (req: Request, res: Response) => {
  try {
    const loggedInUserId = req.user._id;
    const filteredUsers = await User.find({ _id: { $ne: loggedInUserId } }).select("-password");
    res.status(200).json(filteredUsers);
  } catch (error: any) {
    console.error("Error in getUsersForSidebar: ", error.message);
    res.status(500).json({ error: "Internal server error" });
  }
};

export const getMessages = async (req: Request, res: Response) => {
  try {
    const { id: userToChatId } = req.params;
    const myId = req.user._id;

    const messages = await Message.find({
      $or: [
        { senderId: myId, receiverId: userToChatId },
        { senderId: userToChatId, receiverId: myId },
      ],
    })

    res.status(200).json(messages);
  } catch (error: any) {
    console.error("Error in getMessages controller: ", error.message);
    res.status(500).json({ error: "Internal server error" });
  }
};

export const sendMessage = async (req: Request, res: Response) => {
  try {
    const { text } = req.body;
    const { id: receiverId } = req.params;
    const senderId = req.user._id;

    const newMessage = new Message({ senderId, receiverId, text });
    await newMessage.save();

    const receiverSocketId = getReceiverSocketId(receiverId);
    if (receiverSocketId) {
      io.to(receiverSocketId).emit("newMessage", newMessage);
    }

    res.status(201).json(newMessage);
  } catch (error: any) {
    console.error("Error in sendMessage controller: ", error.message);
    res.status(500).json({ error: "Internal server error" });
  }
};

export const getAiReplySuggestions = async (req: Request, res: Response) => {
  try {
    const { messageId } = req.params;
    
    // Find the message to respond to
    const message = await Message.findById(messageId);
    if (!message) {
      return res.status(404).json({ error: "Message not found" });
    }
    
    // Get previous messages for context
    const previousMessages = await Message.find({
      $or: [
        { senderId: message.senderId, receiverId: message.receiverId },
        { senderId: message.receiverId, receiverId: message.senderId },
      ],
    }).sort({ createdAt: -1 }).limit(10);
    
    const messageText = message.text || "";
    
    // Use Gemini API to generate reply suggestions
    const replySuggestions = await generateReplySuggestions(messageText, previousMessages);
    
    res.status(200).json({ suggestions: replySuggestions });
  } catch (error: any) {
    console.error("Error in getAiReplySuggestions controller: ", error.message);
    res.status(500).json({ error: "Internal server error" });
  }
};
