import mongoose from "mongoose"

const playlistSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
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
    // Người tạo playlist
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    // Danh sách bài hát trong playlist
    songs: [
      {
        song: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Song",
        },
        addedAt: {
          type: Date,
          default: Date.now,
        },
      },
    ],
    // Playlist public hay private
    isPublic: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true },
)

export default mongoose.model("Playlist", playlistSchema)
