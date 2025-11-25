import mongoose from "mongoose"

const favoriteSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    // Loại item yêu thích: song, album, artist, playlist
    itemType: {
      type: String,
      enum: ["song", "album", "artist", "playlist"],
      required: true,
    },
    // ID của item (có thể là song, album, artist, hoặc playlist)
    itemId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      refPath: "itemModel",
    },
    // Model tương ứng để populate
    itemModel: {
      type: String,
      required: true,
      enum: ["Song", "Album", "Artist", "Playlist"],
    },
  },
  { timestamps: true },
)

// Đảm bảo mỗi user chỉ có thể like 1 item 1 lần
favoriteSchema.index({ user: 1, itemType: 1, itemId: 1 }, { unique: true })

export default mongoose.model("Favorite", favoriteSchema)
