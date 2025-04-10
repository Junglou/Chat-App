import express from "express";
import {
  createGroup,
  getAllGroups,
  getUserGroups,
  getGroupById,
  addMember,
  deleteGroup,
  removeMember,
} from "../controllers/group.controller.js";

import {
  getGroupMessages,
  sendGroupMessage,
} from "../controllers/groupMessage.controller.js";

import { protectRoute } from "../middleware/auth.middleware.js";

const router = express.Router();

// ==== Nhóm routes thao tác với group ====

// Tạo group mới (cần đăng nhập)
router.post("/", protectRoute, createGroup);

// Lấy các group mà user đang tham gia (quan trọng: đặt trước /:id)
router.get("/me", protectRoute, getUserGroups);

// Lấy tất cả các group (dành cho admin hoặc debug)
router.get("/all", protectRoute, getAllGroups);

// Lấy chi tiết group theo ID
router.get("/:id", protectRoute, getGroupById);

// Thêm thành viên vào group (chỉ owner mới có quyền)
router.post("/:id/members", protectRoute, addMember);

// Xoá group (chỉ owner mới có quyền)
router.delete("/:id", protectRoute, deleteGroup);

// Chỉ owner mới được xoá thành viên (trừ chính họ)
router.put("/:id/remove-member", protectRoute, removeMember);

// ==== Nhóm routes nhắn tin trong group ====

router.get("/:id/messages", protectRoute, getGroupMessages);
router.post("/:id/messages", protectRoute, sendGroupMessage);

export default router;
