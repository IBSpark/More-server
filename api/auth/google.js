import { OAuth2Client } from "google-auth-library";
import jwt from "jsonwebtoken";
import connectDB from "../../lib/db.js";
import User from "../../models/user.js";

const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ message: "Method not allowed" });
  }

  try {
    await connectDB();

    const { token } = req.body;

    if (!token) {
      return res.status(400).json({ message: "Google token missing" });
    }

    // Verify Google token
    const ticket = await client.verifyIdToken({
      idToken: token,
      audience: process.env.GOOGLE_CLIENT_ID,
    });

    const payload = ticket.getPayload();

    const { email, name, sub } = payload;

    if (!email) {
      return res.status(400).json({ message: "Google email missing" });
    }

    // Check if user exists
    let user = await User.findOne({ email });

    // If not → create user
    if (!user) {
      user = await User.create({
        name,
        email,
        password: sub, // dummy unique password (not used)
      });
    }

    // Create your own JWT
    const appToken = jwt.sign(
      {
        id: user._id,
        email: user.email,
      },
      process.env.JWT_SECRET,
      {
        expiresIn: "1d",
        issuer: "more-app",
        audience: "more-client",
      }
    );

    return res.status(200).json({
      token: appToken,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
      },
    });

  } catch (error) {
    console.error("Google Auth Error:", error);
    return res.status(401).json({ message: "Google authentication failed" });
  }
}