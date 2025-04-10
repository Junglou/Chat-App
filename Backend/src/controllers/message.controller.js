import User from "../models/user.model.js";
import Message from "../models/message.model.js";
import cloudinary from "cloudinary";
import { getReceiverSocketId, io } from "../lib/socket.js";

export const getUsersForSideBar = async (req, res) => {
  try {
    const loggedInUserId = req.user._id;
    const filteredUsers = await User.find({
      _id: { $ne: loggedInUserId },
    }).select("-passWord");

    res.status(200).json({ filteredUsers });
  } catch (e) {
    console.error("Error in getUsersForSideBar", e.message);
    res.status(500).json({ message: "Internal Server Error!!" });
  }
};

export const getMessages = async (req, res) => {
  try {
    const { id: userToChatId } = req.params; // ID của người nhận
    const senderId = req.user._id; // ID của người gửi (người đang đăng nhập)

    // Lấy các tin nhắn giữa người gửi và người nhận
    const messages = await Message.find({
      $or: [
        { senderId: senderId, receiverId: userToChatId }, // Tin nhắn từ người gửi đến người nhận
        { senderId: userToChatId, receiverId: senderId }, // Tin nhắn từ người nhận đến người gửi
      ],
    });

    res.status(200).json(messages); // Trả về danh sách tin nhắn
  } catch (e) {
    console.error("Error in getMessages controller ", e.message);
    res.status(500).json({ message: "Internal Server Error!!" });
  }
};

export const sendMessages = async (req, res) => {
  try {
    const { text, image } = req.body;
    const { id: receiverId } = req.params; 
    const senderId = req.user._id;

    let imageURL;
    if (image) {
      const uploadResponse = await cloudinary.uploader.upload(image);
      imageURL = uploadResponse.secure_url;
    }

    const newMessage = new Message({
      senderId,
      receiverId, 
      text,
      image: imageURL,
    });

    await newMessage.save();

    const receiverSocketId = getReceiverSocketId(receiverId);
    if (receiverSocketId) {
      io.to(receiverSocketId).emit("newMessage", newMessage);
    }
    res.status(201).json({ newMessage });
  } catch (e) {
    console.error("Error in sendMessages controller ", e.message);
    res.status(500).json({ message: "Internal Server Error!!" });
  }
};
