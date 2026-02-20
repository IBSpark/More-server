import mongoose from "mongoose";

const aboutSchema = new mongoose.Schema(
  {
    appName: { type: String, required: true },
    description: { type: String, required: true },
    version: { type: String, required: true },
    developer: { type: String, required: true },
    image: { type: String },
  },
  { timestamps: true }
);

export default mongoose.models.About || mongoose.model("About", aboutSchema);