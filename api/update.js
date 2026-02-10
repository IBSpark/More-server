import express from "express";
import bcrypt from "bcryptjs";
import connectDB from "../lib/db.js";
import User from "../models/User.js";
import auth from "../middleware/auth.middleware.js";

const router = express.Router();

router.put("/update", auth, async (req, res) => {
  try {
    await connectDB();

    const userId = req.user.id; // ✅ from middleware
    const { name, email, oldPassword, newPassword } = req.body ?? {};

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    if (newPassword) {
      if (!oldPassword) {
        return res.status(400).json({ message: "Old password required" });
      }

      const isMatch = await bcrypt.compare(oldPassword, user.password);
      if (!isMatch) {
        return res.status(400).json({ message: "Old password incorrect" });
      }

      user.password = await bcrypt.hash(newPassword, 10);
    }

    if (name) user.name = name;
    if (email) user.email = email;

    await user.save();

    return res.status(200).json({
      message: "Account updated successfully",
      user: {
        name: user.name,
        email: user.email,
      },
    });
  } catch (error) {
    console.error("Update error:", error);
    return res.status(500).json({ message: "Server error" });
  }
});

export default router;
