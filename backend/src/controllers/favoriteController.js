import Favorite from "../models/Favorite.js"

// Lấy danh sách yêu thích của user
export const getMyFavorites = async (req, res) => {
  try {
    const { type } = req.query // song, album, artist, playlist

    const query = { user: req.user._id }
    if (type) {
      query.itemType = type
    }

    const favorites = await Favorite.find(query).populate("itemId").sort({ createdAt: -1 })

    // Populate thêm thông tin artist cho songs
    const populatedFavorites = await Promise.all(
      favorites.map(async (fav) => {
        if (fav.itemType === "song" && fav.itemId) {
          await fav.populate({
            path: "itemId",
            populate: { path: "artist", select: "name avatarUrl" },
          })
        }
        return fav
      }),
    )

    res.status(200).json({ favorites: populatedFavorites })
  } catch (error) {
    console.error("getMyFavorites error:", error)
    res.status(500).json({ message: "Lỗi server", error: error.message })
  }
}

// Thêm vào yêu thích
export const addFavorite = async (req, res) => {
  try {
    const { itemType, itemId } = req.body

    if (!itemType || !itemId) {
      return res.status(400).json({ message: "Thiếu thông tin" })
    }

    // Map itemType to model name
    const modelMap = {
      song: "Song",
      album: "Album",
      artist: "Artist",
      playlist: "Playlist",
    }

    const itemModel = modelMap[itemType]
    if (!itemModel) {
      return res.status(400).json({ message: "Loại item không hợp lệ" })
    }

    // Kiểm tra đã favorite chưa
    const existing = await Favorite.findOne({
      user: req.user._id,
      itemType,
      itemId,
    })

    if (existing) {
      return res.status(400).json({ message: "Đã có trong danh sách yêu thích" })
    }

    const favorite = await Favorite.create({
      user: req.user._id,
      itemType,
      itemId,
      itemModel,
    })

    res.status(201).json({ message: "Đã thêm vào yêu thích", favorite })
  } catch (error) {
    console.error("addFavorite error:", error)
    res.status(500).json({ message: "Lỗi server", error: error.message })
  }
}

// Xóa khỏi yêu thích
export const removeFavorite = async (req, res) => {
  try {
    const { itemType, itemId } = req.params

    const result = await Favorite.findOneAndDelete({
      user: req.user._id,
      itemType,
      itemId,
    })

    if (!result) {
      return res.status(404).json({ message: "Không tìm thấy trong yêu thích" })
    }

    res.status(200).json({ message: "Đã xóa khỏi yêu thích" })
  } catch (error) {
    console.error("removeFavorite error:", error)
    res.status(500).json({ message: "Lỗi server", error: error.message })
  }
}

// Kiểm tra item có trong yêu thích không
export const checkFavorite = async (req, res) => {
  try {
    const { itemType, itemId } = req.params

    const favorite = await Favorite.findOne({
      user: req.user._id,
      itemType,
      itemId,
    })

    res.status(200).json({ isFavorite: !!favorite })
  } catch (error) {
    console.error("checkFavorite error:", error)
    res.status(500).json({ message: "Lỗi server", error: error.message })
  }
}

// Lấy danh sách bài hát yêu thích
export const getLikedSongs = async (req, res) => {
  try {
    const favorites = await Favorite.find({
      user: req.user._id,
      itemType: "song",
    })
      .populate({
        path: "itemId",
        populate: { path: "artist", select: "name avatarUrl" },
      })
      .sort({ createdAt: -1 })

    const songs = favorites.map((fav) => fav.itemId).filter(Boolean)
    res.status(200).json({ songs })
  } catch (error) {
    console.error("getLikedSongs error:", error)
    res.status(500).json({ message: "Lỗi server", error: error.message })
  }
}

// Lấy danh sách album yêu thích
export const getLikedAlbums = async (req, res) => {
  try {
    const favorites = await Favorite.find({
      user: req.user._id,
      itemType: "album",
    })
      .populate("itemId")
      .sort({ createdAt: -1 })

    const albums = favorites.map((fav) => fav.itemId).filter(Boolean)
    res.status(200).json({ albums })
  } catch (error) {
    console.error("getLikedAlbums error:", error)
    res.status(500).json({ message: "Lỗi server", error: error.message })
  }
}

// Lấy danh sách nghệ sĩ yêu thích
export const getLikedArtists = async (req, res) => {
  try {
    const favorites = await Favorite.find({
      user: req.user._id,
      itemType: "artist",
    })
      .populate("itemId")
      .sort({ createdAt: -1 })

    const artists = favorites.map((fav) => fav.itemId).filter(Boolean)
    res.status(200).json({ artists })
  } catch (error) {
    console.error("getLikedArtists error:", error)
    res.status(500).json({ message: "Lỗi server", error: error.message })
  }
}
