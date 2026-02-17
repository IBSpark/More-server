import multer from "multer";
import streamifier from "streamifier";
import cloudinary from "../lib/cloudinary.js";
import mongoose from "mongoose";

const upload = multer({
  storage: multer.memoryStorage(),
});

// About Schema
const aboutSchema = new mongoose.Schema(
  {
    appName: String,
    description: String,
    version: String,
    developer: String,
    imageUrl: String,
  },
  { timestamps: true }
);

const About =
  mongoose.models.About || mongoose.model("About", aboutSchema);

export default async function handler(req, res) {
  if (req.method === "GET") {
    const about = await About.findOne();
    return res.status(200).json(about);
  }

  if (req.method === "POST") {
    upload.single("image")(req, res, async function (err) {
      if (err) {
        return res.status(400).json({ message: "Image upload error" });
      }

      try {
        const existing = await About.findOne();
        if (existing) {
          return res
            .status(400)
            .json({ message: "About already created" });
        }

        const { appName, description, version, developer } =
          req.body;

        if (!req.file) {
          return res.status(400).json({ message: "Image required" });
        }

        // Upload to Cloudinary using buffer
        const result = await new Promise((resolve, reject) => {
          const stream = cloudinary.uploader.upload_stream(
            { folder: "about_section" },
            (error, result) => {
              if (result) resolve(result);
              else reject(error);
            }
          );

          streamifier
            .createReadStream(req.file.buffer)
            .pipe(stream);
        });

        const about = await About.create({
          appName,
          description,
          version,
          developer,
          imageUrl: result.secure_url,
        });

        return res.status(201).json(about);
      } catch (error) {
        console.error(error);
        return res.status(500).json({ message: "Server error" });
      }
    });

    return;
  }

  return res.status(405).json({ message: "Method not allowed" });
}
