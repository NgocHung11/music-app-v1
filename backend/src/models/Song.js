import mongoose from "mongoose";

const songSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    artist: { type: String, required: true },
    album: { type: String },
    genre: { type: String },
    coverUrl: { type: String, required: true },  // link ảnh bìa từ AWS S3
    audioUrl: { type: String, required: true },  // link file nhạc từ AWS S3
    duration: { type: Number },                  // thời lượng (giây)
    uploadedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  },
  { timestamps: true }
);

export default mongoose.model("Song", songSchema);
