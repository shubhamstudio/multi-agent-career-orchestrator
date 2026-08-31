import crypto from "crypto";

import { getAuth } from "firebase-admin/auth";


import { app } from "../configs/firebase.js";
import User from "../models/user.model.js";
import  redis from "../../../shared/redis/redis.js";

const COIN_COSTS = Object.freeze({
  "resume-scorer": 10,
  "roadmap-builder": 20,
  "start-interview": 50,
  "download-pdf": 10,
});

const toSessionUser = (user) => ({
  userId: user._id,
  name: user.name,
  email: user.email,
  interviewCoin: user.interviewCoin,
  headline: user.headline || "",
  currentRole: user.currentRole || "",
  targetRole: user.targetRole || "",
  experienceLevel: user.experienceLevel || "",
  location: user.location || "",
  bio: user.bio || "",
  skills: user.skills || [],
  careerGoal: user.careerGoal || "",
});


export const login = async (req, res) => {

  try {

    const { token } = req.body;

    const decoded = await getAuth(app).verifyIdToken(token);

    let user = await User.findOne({
      firebaseUid: decoded.uid,
    });

    if (!user) {

      user = await User.create({

        firebaseUid: decoded.uid,

        email: decoded.email,

        name: decoded.name

      });

    }

    const sessionId =crypto.randomUUID();

    await redis.set(`session:${sessionId}`, JSON.stringify(toSessionUser(user)),"EX", 60 * 60 * 24 * 7);

    const isProduction = process.env.NODE_ENV === "production";

    res.cookie("session", sessionId, {
        httpOnly: true,
        secure: isProduction,
        sameSite: isProduction ? "none" : "lax",
        maxAge:1000 * 60 * 60 * 24 * 7,
      }
    );

    return res.json({ success:true,user});

  } catch (error) {
console.log(error)
    return res.status(401).json({ message: error.message, });

  }

};

export const logout = async (req, res) => {
  try {

    const sessionId = req.cookies?.session;

    if (sessionId) {
      await redis.del(`session:${sessionId}`);
    }

    const isProduction = process.env.NODE_ENV === "production";

    res.clearCookie("session", {
        httpOnly: true,
        secure: isProduction,
        sameSite: isProduction ? "none" : "lax",
    });

    return res.json({
      success: true,
      message: "Logged out successfully",
    });

  } catch (error) {

    return res.status(500).json({
      success: false,
      message: error.message,
    });

  }
};
export const useInterviewCoins = async (req, res) => {
  try {
const sessionId = req.cookies?.session;

  const session = await redis.get(`session:${sessionId}`)

  if (!session) {
    return res.status(401).json({
      success: false,
      message: "Session expired",
    });
  }

  const sessionData = JSON.parse(session);

    const { action } = req.body;
    const coins = COIN_COSTS[action];

    if (!coins) {
      return res.status(400).json({ 
        success: false,
        message: "Invalid coin action",
      });
    }

    const user = await User.findOneAndUpdate(
      {
        _id: sessionData.userId,
        interviewCoin: { $gte: coins },
      },
      { $inc: { interviewCoin: -coins } },
      { returnDocument: "after" },
    );

    if (!user) {
      return res.status(403).json({
        success: false,
        message: "Not enough interview coins",
      });
    }
    await redis.set(`session:${sessionId}`, JSON.stringify(toSessionUser(user)),"EX", 60 * 60 * 24 * 7);


    return res.status(200).json({
      success: true,
      message: "Interview coins updated successfully",
      action,
      interviewCoin: user.interviewCoin,
    });

  } catch (error) {

    console.log(error);

    return res.status(500).json({
      success: false,
      message: error.message,
    });

  }
};

const editableProfileFields = [
  "name", "headline", "currentRole", "targetRole", "experienceLevel",
  "location", "bio", "skills", "careerGoal",
];

export const getProfile = async (req, res) => {
  try {
    const sessionId = req.cookies?.session;
    const cachedSession = sessionId ? await redis.get(`session:${sessionId}`) : null;
    if (!cachedSession) return res.status(401).json({ success: false, message: "Session expired" });
    const { userId } = JSON.parse(cachedSession);
    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ success: false, message: "User not found" });
    await redis.set(`session:${sessionId}`, JSON.stringify(toSessionUser(user)), "EX", 60 * 60 * 24 * 7);
    return res.json({ success: true, user });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

export const updateProfile = async (req, res) => {
  try {
    const sessionId = req.cookies?.session;
    const cachedSession = sessionId ? await redis.get(`session:${sessionId}`) : null;
    if (!cachedSession) {
      return res.status(401).json({ success: false, message: "Session expired" });
    }

    const sessionData = JSON.parse(cachedSession);
    const updates = {};
    editableProfileFields.forEach((field) => {
      if (req.body[field] !== undefined) updates[field] = req.body[field];
    });

    if (typeof updates.name === "string" && !updates.name.trim()) {
      return res.status(400).json({ success: false, message: "Name is required" });
    }
    if (Array.isArray(updates.skills)) {
      updates.skills = updates.skills.map((skill) => String(skill).trim()).filter(Boolean).slice(0, 30);
    }

    const user = await User.findByIdAndUpdate(
      sessionData.userId,
      { $set: updates },
      { new: true, runValidators: true },
    );
    if (!user) return res.status(404).json({ success: false, message: "User not found" });

    await redis.set(`session:${sessionId}`, JSON.stringify(toSessionUser(user)), "EX", 60 * 60 * 24 * 7);

    return res.json({ success: true, message: "Profile updated", user });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};




