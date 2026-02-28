import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import connectDB from "../../lib/db.js";
import User from "../../models/user.js";

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ message: "Method not allowed" });
  }

  try {
    await connectDB();

    const { email, password } = req.body ?? {};

    if (!email || !password) {
      return res.status(400).json({ message: "Invalid credentials" });
    }

    const normalizedEmail = email.toLowerCase().trim();

    const user = await User.findOne({ email: normalizedEmail });

    // prevent timing attack
    if (!user || !user.password) {
      await bcrypt.compare(password, "$2a$10$invalidsaltstringforsecurity");
      return res.status(400).json({ message: "Invalid credentials" });
    }

    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      return res.status(400).json({ message: "Invalid credentials" });
    }

    if (!process.env.JWT_SECRET) {
      return res.status(500).json({ message: "Server configuration error" });
    }

    const token = jwt.sign(
      {
        id: user._id,
        email: user.email,
      },
      process.env.JWT_SECRET,
      {
        expiresIn: "1d",
      }
    );

    return res.status(200).json({
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
      },
    });

  } catch (error) {
    console.error("Login error:", error);
    return res.status(500).json({ message: "Internal Server Error" });
  }
}