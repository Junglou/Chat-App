import express from "express";
import dotenv from "dotenv";
import path from "path";
import cookieParser from "cookie-parser";
import bodyParser from "body-parser";
import cors from "cors";

import { ConnectDB } from "./lib/db.js";
import { app, server } from "./lib/socket.js";

import authRoute from "./routes/auth.route.js";
import messageRoute from "./routes/message.route.js";
import groupRoute from "./routes/group.route.js";
import groupMessageRoutes from "./routes/messageGroup.route.js"; 

dotenv.config();
const port = process.env.PORT || 5000;
const __dirname = path.resolve();

// ===== Middlewares =====
app.use(express.json());
app.use(cookieParser());
app.use(bodyParser.json({ limit: "100mb" }));
app.use(bodyParser.urlencoded({ limit: "100mb", extended: true }));

app.use(
  cors({
    origin: "http://localhost:5173", 
    credentials: true,
  })
);

// ===== Routes =====
app.use("/api/auth", authRoute);
app.use("/api/messages", messageRoute);
app.use("/api/groups", groupRoute); 
app.use("/api/group-messages", groupMessageRoutes); 

// ===== Connect DB =====
ConnectDB();

// ===== Serve frontend in production =====
if (process.env.NODE_ENV === "production") {
  app.use(express.static(path.join(__dirname, "../Frontend/dist")));

  app.get("*", (req, res) => {
    res.sendFile(path.join(__dirname, "../Frontend", "dist", "index.html"));
  });
}

// ===== Start Server =====
server.listen(port, () => {
  console.log(`✅ Server is running on port ${port}`);
});
