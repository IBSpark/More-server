import mongoose from "mongoose";

const historySchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    text: {
      type: String,
      required: true,
    },

    voice: {
      type: String,
      required: true,
    },

    charactersUsed: {
      type: Number,
      required: true,
    },

    audioUrl: {
      type: String, // optional (if you later store in Cloudinary)
    },
  },
  { timestamps: true } // adds createdAt & updatedAt automatically
);

// Prevent model overwrite in dev/serverless
export default mongoose.models.History ||
  mongoose.model("History", historySchema);