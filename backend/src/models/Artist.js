import mongoose from "mongoose"

const artistSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    bio: {
      type: String,
      default: "",
    },
    avatarUrl: {
      type: String,
      default: null,
    },
    coverUrl: {
      type: String,
      default: null,
    },
    // Số lượng người theo dõi (có thể cập nhật sau)
    followersCount: {
      type: Number,
      default: 0,
    },
    isVerified: {
      type: Boolean,
      default: false,
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },
  },
  { timestamps: true },
)

artistSchema.index({ name: "text" })

export default mongoose.model("Artist", artistSchema)
