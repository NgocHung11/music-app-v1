import mongoose from "mongoose"

const genreSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
    description: {
      type: String,
      default: "",
    },
    coverUrl: {
      type: String,
      default: null,
    },
    // Màu sắc để hiển thị UI
    color: {
      type: String,
      default: "#1DB954",
    },
  },
  { timestamps: true },
)

export default mongoose.model("Genre", genreSchema)
