import { Server } from "socket.io";
import http from "http";
import express from "express";

const app = express();
const server = http.createServer(app);

// Cấu hình CORS cho client
const io = new Server(server, {
  cors: {
    origin: ["http://localhost:5173"], // URL frontend
  },
});

// Map userId => socketId để quản lý người dùng online
const userSocketMap = {};

// Hàm get socketId theo userId
export function getReceiverSocketId(userId) {
  return userSocketMap[userId];
}

io.on("connection", (socket) => {
  console.log("🔌 A user connected:", socket.id);

  // Lấy userId từ query và lưu socketId
  const userId = socket.handshake.query.userId;
  if (userId) {
    userSocketMap[userId] = socket.id;
  }

  // Gửi danh sách người dùng online đến tất cả client
  io.emit("getOnlineUsers", Object.keys(userSocketMap));

  // 👉 Lắng nghe sự kiện tham gia nhóm
  socket.on("joinGroup", (groupId) => {
    socket.join(groupId);
    console.log(`👥 User ${socket.id} joined group: ${groupId}`);
  });

  // 👉 Nhận tin nhắn từ client và phát đến tất cả client trong group
  socket.on("sendGroupMessage", (data) => {
    const { groupId, message } = data;

    // ❗ FIXED: dùng io.to(...) thay vì socket.broadcast
    io.to(groupId).emit("receiveGroupMessage", data);

    console.log("📨 Message sent to group:", groupId, message);
  });

  // 👉 Khi user disconnect
  socket.on("disconnect", () => {
    console.log("❌ A user disconnected:", socket.id);

    if (userId) {
      delete userSocketMap[userId];
    }

    io.emit("getOnlineUsers", Object.keys(userSocketMap));
  });
});

export { io, app, server };
