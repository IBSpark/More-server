import textToSpeech from "@google-cloud/text-to-speech";
import jwt from "jsonwebtoken";
import connectDB from "../lib/db.js";
import User from "../models/user.js";
import History from "../models/History.js";

const client = new textToSpeech.TextToSpeechClient({
  credentials: JSON.parse(process.env.GOOGLE_CREDENTIALS),
});

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ message: "Method not allowed" });
  }

  try {
    await connectDB();

    const token = req.headers.authorization;
    if (!token) {
      return res.status(401).json({ message: "No token provided" });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    const { text, voiceName, pitch, rate } = req.body;

    const user = await User.findById(decoded.id);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const cost = Math.ceil(text.length / 10);

    if (user.credits < cost) {
      return res.status(400).json({ message: "Not enough credits" });
    }

    const request = {
      input: { text },
      voice: { name: voiceName },
      audioConfig: {
        audioEncoding: "MP3",
        pitch: Number(pitch || 0),
        speakingRate: Number(rate || 1),
      },
    };

    const [response] = await client.synthesizeSpeech(request);

    user.credits -= cost;
    await user.save();

    await History.create({
      userId: user._id,
      text,
      voice: voiceName,
    });

    res.setHeader("Content-Type", "audio/mpeg");
    return res.status(200).send(response.audioContent);

  } catch (error) {
    console.error("Speech error:", error);
    return res.status(500).json({ message: "Generation failed" });
  }
}