import { Request, Response } from "express";
import User from "../models/user.model.js";
import mongoose from "mongoose";
import Notification from "../models/notification.model.js";
import {v2 as cloudinary} from "cloudinary"
import bcrypt from "bcryptjs"

export const getUserProfile = async (req: Request, res: Response) => {
  const { username } = req.params;
  try {
    const user = await User.findOne({ username }).select("-password");

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    res.status(200).json(user);
  } catch (error: any) {
    console.log("Error in getUserProfile:", error.message);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

export const followUnfollowUser = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const userToModify = await User.findById(id);
    const currentUser = await User.findById(req.user._id);

    if (!userToModify || !currentUser) {
      return res.status(400).json({ error: "User not found" });
    }

    if (id === req.user._id.toString()) {
      return res.status(400).json({ error: "You cannot follow/unfollow yourself" });
    }

    const isFollowing = currentUser.following.includes(new mongoose.Types.ObjectId(id));

    if (isFollowing) {
      // Unfollow the user
      await User.findByIdAndUpdate(id,{$pull:{followers:req.user._id}});
      await User.findByIdAndUpdate(req.user._id,{$pull:{following:id}});
      res.status(200).json({ message: "User unfollowed successfully" });
    } else {
      // Follow the user
      await User.findByIdAndUpdate(id,{$push:{followers:req.user._id}});
      await User.findByIdAndUpdate(req.user._id,{$push:{following:id}});
      //send Notification
      const newNotification = new Notification({
        type:"follow",
        from:req.user._id,
        to:userToModify._id,
      })
      await newNotification.save();
      res.status(200).json({ message: "User followed successfully" });
    }
  } catch (error: any) {
    console.log("Error in followUnfollowUser:", error.message);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

export const getSuggestedUsers = async (req: Request, res: Response) => {
  try {
    const userId = req.user._id;

    // Fetch the current user to get the list of users they follow
    const currentUser = await User.findById(userId).select("following");
    if (!currentUser) {
      return res.status(404).json({ message: "User not found" });
    }

    // Aggregate pipeline to get a random sample of users excluding the current user
    const users = await User.aggregate([
      { $match: { _id: { $ne: new mongoose.Types.ObjectId(userId) } } },
      { $sample: { size: 10 } }
    ]);

    // Filter out users that are already followed by the current user
    const filteredUsers = users.filter(user =>
      !currentUser.following.includes(user._id)
    );

    // Select the top 4 suggested users
    const suggestedUsers = filteredUsers.slice(0, 4);

    // Remove password field from the suggested users
    const sanitizedUsers = suggestedUsers.map(user => {
      user.password = undefined;
      return user;
    });

    res.status(200).json(sanitizedUsers);
  } catch (error: any) {
    console.log("Error in getSuggestedUsers:", error.message);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

export const updateUser = async (req: Request, res: Response) => {
  const { fullName, email, username, currentPassword, newPassword, bio, link } = req.body;
  let { profileImg, coverImg } = req.body;

  const userId = req.user._id;

  try {
    let user = await User.findById(userId);
    if (!user) return res.status(400).json({ message: "User not found" });

    if ((!newPassword && currentPassword) || (!currentPassword && newPassword)) {
      return res.status(400).json({ message: "Please enter both current and new password" });
    }

    if (currentPassword && newPassword) {
      const isMatch = await bcrypt.compare(currentPassword, user.password);
      if (!isMatch) return res.status(400).json({ error: "Current password is incorrect" });
      if (newPassword.length < 6) return res.status(400).json({ error: "Password must be at least 6 characters long" });
      const salt = await bcrypt.genSalt(10);
      user.password = await bcrypt.hash(newPassword, salt);
    }

    if (profileImg) {
      if (user.profileImg) {
        const profileImgPublicId = user.profileImg.split("/").pop()?.split(".")[0];
        if (profileImgPublicId) {
          await cloudinary.uploader.destroy(profileImgPublicId);
        }
      }
      const uploadedResponse = await cloudinary.uploader.upload(profileImg);
      profileImg = uploadedResponse.secure_url;
    }

    if (coverImg) {
      if (user.coverImg) {
        const coverImgPublicId = user.coverImg.split("/").pop()?.split(".")[0];
        if (coverImgPublicId) {
          await cloudinary.uploader.destroy(coverImgPublicId);
        }
      }
      const uploadedResponse = await cloudinary.uploader.upload(coverImg);
      coverImg = uploadedResponse.secure_url;
    }

    user.fullName = fullName || user.fullName;
    user.email = email || user.email;
    user.username = username || user.username;
    user.bio = bio || user.bio;
    user.link = link || user.link;
    user.profileImg = profileImg || user.profileImg;
    user.coverImg = coverImg || user.coverImg;

    user = await user.save();
    user.password = "";

    return res.status(200).json(user);
  } catch (error: any) {
    console.log("Error in updateUser:", error.message);
    res.status(500).json({ message: "Internal Server Error" });
  }
};