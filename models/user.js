import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },

    // 🔥 ADD THIS
    credits: {
      type: Number,
      default: 10000, // starting credits
    },
  },
  { timestamps: true }
);

// Prevent model overwrite in dev / serverless
export default mongoose.models.User ||
  mongoose.model("User", userSchema);