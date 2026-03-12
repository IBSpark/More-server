import textToSpeech from "@google-cloud/text-to-speech";
import jwt from "jsonwebtoken";
import connectDB from "../lib/db.js";
import User from "../models/user.js";
import History from "../models/history.js";
import cloudinary from "../utils/cloudinary.js";

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

    const decoded = jwt.verify(token.replace("Bearer ", ""), process.env.JWT_SECRET);

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
      voice: {
        name: voiceName,
        languageCode: voiceName.split("-").slice(0,2).join("-")
      },
      audioConfig: {
        audioEncoding: "MP3",
        pitch: Number(pitch || 0),
        speakingRate: Number(rate || 1),
      },
    };

    const [response] = await client.synthesizeSpeech(request);

    const audioBuffer = Buffer.from(response.audioContent, "binary");

    // convert buffer to base64
    const base64Audio = audioBuffer.toString("base64");

    const dataURI = `data:audio/mp3;base64,${base64Audio}`;

    // upload to Cloudinary
    const uploadResult = await cloudinary.uploader.upload(dataURI, {
      resource_type: "video",
      folder: "ai-audio"
    });

    const audioUrl = uploadResult.secure_url;

    // deduct credits
    user.credits -= cost;
    await user.save();

    // save history with audio url
    await History.create({
      userId: user._id,
      text,
      voice: voiceName,
      charactersUsed: text.length,
      audioUrl: audioUrl
    });

    return res.status(200).json({
      success: true,
      audioUrl: audioUrl
    });

  } catch (error) {

    console.error("Speech error:", error);

    return res.status(500).json({
      message: "Generation failed"
    });

  }
}