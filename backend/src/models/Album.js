import mongoose from "mongoose"

const albumSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
    },
    artist: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Artist",
      required: true,
    },
    coverUrl: {
      type: String,
      required: true,
    },
    releaseDate: {
      type: Date,
      default: Date.now,
    },
    description: {
      type: String,
      default: "",
    },
    // Loại album: album, single, EP
    type: {
      type: String,
      enum: ["album", "single", "ep"],
      default: "album",
    },
    isPublished: {
      type: Boolean,
      default: true,
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },
  },
  { timestamps: true },
)

albumSchema.index({ title: "text" })

export default mongoose.model("Album", albumSchema)
