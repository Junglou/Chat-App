import express from "express";
import dotenv from "dotenv";
import authRoute from "./routes/auth.route.js";
import messageRoute from "./routes/message.route.js";
import { ConnectDB } from "./lib/db.js";
import cookieParser from "cookie-parser";
import bodyParser from "body-parser";
import cors from "cors";
import { app, server } from "./lib/socket.js";
import path from "path";

dotenv.config();
const port = process.env.PORT || 5000;
const __dirname = path.resolve();

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
app.use("/api/auth", authRoute);
app.use("/api/messages", messageRoute);
ConnectDB();

if (process.env.NODE_ENV === "production") {
  app.use(express.static(path.join(__dirname, "../Frontend/dist")));

  app.get("*", (req, res) => {
    res.sendFile(path.join(__dirname, "../Frontend", "dist", "index.html"));
  });
}

server.listen(port, (req, res) => {
  console.log(`Server is Running in ${port}`);
});
