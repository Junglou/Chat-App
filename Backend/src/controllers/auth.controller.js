import cloudinary from "../lib/cloudinary.js";
import { generateToken } from "../lib/utils.js";
import User from "../models/user.model.js";
import bcrypt from "bcryptjs";

export const signup = async (req, res) => {
  const { fullName, email, passWord } = req.body;
  try {
    if (!fullName || !email || !passWord) {
      return res.status(400).json({ message: "All Fields are required" });
    }
    if (passWord.length < 6) {
      return res
        .status(400)
        .json({ message: "Password must be at least 6 characters!!" });
    }
    const user = await User.findOne({ email });
    if (user) {
      return res.status(400).json({ message: "Email Already Exists!!!" });
    }
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(passWord, salt);

    const newUSer = new User({
      fullName,
      email,
      passWord: hashedPassword,
    });

    if (newUSer) {
      const savedUser = await newUSer.save();
      generateToken(savedUser._id, res);
      return res.status(201).json({
        _id: newUSer._id,
        fullName: newUSer.fullName,
        email: newUSer.email,
        profilePic: newUSer.profilePic,
      });
    } else {
      res.status(400).json({ message: "Invalid User Data!!" });
    }
  } catch (e) {
    console.log("Error in Sign Up controller", e.message);
    res.status(500).json({ message: "Internal Server Error!!" });
  }
};

export const login = async (req, res) => {
  const { email, passWord } = req.body;
  try {
    const user = await User.findOne({ email });

    if (!user) {
      return res.status(400).json({ message: "Invalid credentials!" });
    }

    const isPasswordCorrect = await bcrypt.compare(passWord, user.passWord);
    if (!isPasswordCorrect) {
      return res.status(400).json({ message: "Invalid credentials!" });
    }
    generateToken(user._id, res);
    res.status(201).json({
      _id: user._id,
      fullName: user.fullName,
      email: user.email,
      profilePic: user.profilePic,
    });
  } catch (e) {
    console.error("Error in LogIn controller", e.message);
    res.status(500).json({ message: "Internal Server Error!!" });
  }
};

export const logout = (req, res) => {
  try {
    res.cookie("jwt", "", { maxAge: 0 });
    res.status(200).json({ message: "Logged out successfully!!" });
  } catch (e) {
    console.error("Error in LogOut controller", e.message);
    res.status(500).json({ message: "Internal Server Error!!" });
  }
};

export const updateProfiel = async (req, res) => {
  try {
    const { profilePic } = req.body;
    const userId = req.user._id;

    if (!profilePic) {
      return res.status(400).json({ message: "Profile Pic is required" });
    }

    const uploadRespond = await cloudinary.uploader.upload(profilePic);
    const updatedUser = await User.findByIdAndUpdate(
      userId,
      { profilePic: uploadRespond.secure_url },
      { new: true }
    );

    res.status(200).json(updatedUser);
  } catch (e) {
    console.error("Error in update Profile Pic controller", e.message);
    res.status(500).json({ message: "Internal Server Error!!" });
  }
};

export const checkAuth = async (req, res) => {
  try {
    res.status(200).json(req.user);
  } catch (e) {
    console.error("Error in CheckAuth controller", e.message);
    res.status(500).json({ message: "Internal Server Error!!" });
  }
};
