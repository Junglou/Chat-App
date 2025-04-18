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

import { protectRoute } from "../middleware/auth.middleware.js";

const router = express.Router();

// Tạo group mới 
router.post("/", protectRoute, createGroup);

// Lấy các group mà user đang tham gia 
router.get("/me", protectRoute, getUserGroups);

// Lấy tất cả các group 
router.get("/all", protectRoute, getAllGroups);

// Lấy chi tiết group theo ID
router.get("/:id", protectRoute, getGroupById);

// Thêm thành viên vào group 
router.post("/:id/members", protectRoute, addMember);

// Xoá group 
router.delete("/:id", protectRoute, deleteGroup);

// Chỉ owner mới được xoá thành viên 
router.put("/:id/remove-member", protectRoute, removeMember);

export default router;
