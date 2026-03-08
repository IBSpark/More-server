import jwt from "jsonwebtoken";
import connectDB from "../lib/db.js";
import History from "../models/History.js";

export default async function handler(req, res) {
  if (req.method !== "GET") {
    return res.status(405).json({ message: "Method not allowed" });
  }

  try {
    await connectDB();

    const token = req.headers.authorization;
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    const history = await History.find({
      userId: decoded.id,
    }).sort({ createdAt: -1 });

    return res.status(200).json(history);

  } catch (error) {
    return res.status(401).json({ message: "Unauthorized" });
  }
}