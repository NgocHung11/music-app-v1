import mongoose from "mongoose"

const playHistorySchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    song: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Song",
      required: true,
    },
    playedAt: {
      type: Date,
      default: Date.now,
    },
    // Thời gian nghe (giây) - để tính toán có thực sự nghe không
    listenDuration: {
      type: Number,
      default: 0,
    },
  },
  { timestamps: true },
)

// Index để query theo user và thời gian
playHistorySchema.index({ user: 1, playedAt: -1 })
// Index để tính top songs
playHistorySchema.index({ song: 1, playedAt: -1 })

export default mongoose.model("PlayHistory", playHistorySchema)
