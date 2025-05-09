import express from "express";
import {
  getGroupMessages,
  sendGroupMessage,
} from "../controllers/groupMessage.controller.js";

import { protectRoute } from "../middleware/auth.middleware.js";

const router = express.Router();

router.get("/:id/messages", protectRoute, getGroupMessages);
router.post("/:id/messages", protectRoute, sendGroupMessage);

export default router;
