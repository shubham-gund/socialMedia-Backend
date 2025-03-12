import express from 'express';
import { protectedRoute } from "../middleware/protectedRoute.js"
import { getMessages, getUsersForSidebar, sendMessage, getAiReplySuggestions } from "../controllers/message.controller.js";

const router = express.Router();

router.get("/users", protectedRoute, getUsersForSidebar);
router.get("/suggestions/:messageId", protectedRoute, getAiReplySuggestions);
router.get("/:id", protectedRoute, getMessages);
router.post("/send/:id", protectedRoute, sendMessage);

export default router;

