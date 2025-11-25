import Album from "../models/Album.js"
import Song from "../models/Song.js"

// Lấy danh sách albums
export const getAlbums = async (req, res) => {
  try {
    const { q, artist, type, page = 1, limit = 20 } = req.query

    const query = { isPublished: true }

    if (q && q.trim()) {
      query.title = { $regex: q.trim(), $options: "i" }
    }

    if (artist) {
      query.artist = artist
    }

    if (type) {
      query.type = type
    }

    const skip = (Number.parseInt(page) - 1) * Number.parseInt(limit)

    const albums = await Album.find(query)
      .populate("artist", "name avatarUrl")
      .sort({ releaseDate: -1 })
      .skip(skip)
      .limit(Number.parseInt(limit))

    const total = await Album.countDocuments(query)

    res.status(200).json({
      albums,
      pagination: {
        page: Number.parseInt(page),
        limit: Number.parseInt(limit),
        total,
        totalPages: Math.ceil(total / Number.parseInt(limit)),
      },
    })
  } catch (error) {
    console.error("getAlbums error:", error)
    res.status(500).json({ message: "Lỗi server", error: error.message })
  }
}

// Lấy album theo ID kèm danh sách bài hát
export const getAlbumById = async (req, res) => {
  try {
    const album = await Album.findById(req.params.id).populate("artist", "name avatarUrl bio")

    if (!album) {
      return res.status(404).json({ message: "Không tìm thấy album" })
    }

    // Lấy các bài hát trong album
    const songs = await Song.find({ album: req.params.id, isPublished: true })
      .populate("artist", "name avatarUrl")
      .sort({ createdAt: 1 })

    res.status(200).json({ album, songs })
  } catch (error) {
    console.error("getAlbumById error:", error)
    res.status(500).json({ message: "Lỗi server", error: error.message })
  }
}

// Lấy albums mới nhất
export const getNewAlbums = async (req, res) => {
  try {
    const { limit = 10 } = req.query

    const albums = await Album.find({ isPublished: true })
      .populate("artist", "name avatarUrl")
      .sort({ releaseDate: -1 })
      .limit(Number.parseInt(limit))

    res.status(200).json({ albums })
  } catch (error) {
    console.error("getNewAlbums error:", error)
    res.status(500).json({ message: "Lỗi server", error: error.message })
  }
}

// ==================== ADMIN ROUTES ====================

export const createAlbum = async (req, res) => {
  try {
    const { title, artist, coverUrl, releaseDate, description, type } = req.body

    if (!title || !artist || !coverUrl) {
      return res.status(400).json({ message: "Thiếu thông tin album" })
    }

    const album = await Album.create({
      title,
      artist,
      coverUrl,
      releaseDate,
      description,
      type,
      createdBy: req.user._id,
    })

    const populatedAlbum = await Album.findById(album._id).populate("artist", "name")

    res.status(201).json({ message: "Tạo album thành công", album: populatedAlbum })
  } catch (error) {
    console.error("createAlbum error:", error)
    res.status(500).json({ message: "Lỗi server", error: error.message })
  }
}

export const updateAlbum = async (req, res) => {
  try {
    const album = await Album.findById(req.params.id)
    if (!album) {
      return res.status(404).json({ message: "Không tìm thấy album" })
    }

    const updates = req.body
    const updatedAlbum = await Album.findByIdAndUpdate(req.params.id, updates, { new: true }).populate("artist", "name")

    res.status(200).json({ message: "Cập nhật thành công", album: updatedAlbum })
  } catch (error) {
    console.error("updateAlbum error:", error)
    res.status(500).json({ message: "Lỗi server", error: error.message })
  }
}

export const deleteAlbum = async (req, res) => {
  try {
    const album = await Album.findById(req.params.id)
    if (!album) {
      return res.status(404).json({ message: "Không tìm thấy album" })
    }

    await Album.findByIdAndDelete(req.params.id)
    res.status(200).json({ message: "Đã xóa album" })
  } catch (error) {
    console.error("deleteAlbum error:", error)
    res.status(500).json({ message: "Lỗi server", error: error.message })
  }
}
