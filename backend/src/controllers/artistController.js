import Artist from "../models/Artist.js"
import Song from "../models/Song.js"
import Album from "../models/Album.js"

// Lấy danh sách nghệ sĩ
export const getArtists = async (req, res) => {
  try {
    const { q, page = 1, limit = 20 } = req.query

    const query = {}

    if (q && q.trim()) {
      query.name = { $regex: q.trim(), $options: "i" }
    }

    const skip = (Number.parseInt(page) - 1) * Number.parseInt(limit)

    const artists = await Artist.find(query)
      .sort({ followersCount: -1, name: 1 })
      .skip(skip)
      .limit(Number.parseInt(limit))

    const total = await Artist.countDocuments(query)

    res.status(200).json({
      artists,
      pagination: {
        page: Number.parseInt(page),
        limit: Number.parseInt(limit),
        total,
        totalPages: Math.ceil(total / Number.parseInt(limit)),
      },
    })
  } catch (error) {
    console.error("getArtists error:", error)
    res.status(500).json({ message: "Lỗi server", error: error.message })
  }
}

// Lấy nghệ sĩ theo ID kèm bài hát và albums
export const getArtistById = async (req, res) => {
  try {
    const artist = await Artist.findById(req.params.id)

    if (!artist) {
      return res.status(404).json({ message: "Không tìm thấy nghệ sĩ" })
    }

    // Lấy top bài hát của nghệ sĩ
    const topSongs = await Song.find({ artist: req.params.id, isPublished: true })
      .populate("album", "title coverUrl")
      .sort({ playCount: -1 })
      .limit(10)

    // Lấy albums của nghệ sĩ
    const albums = await Album.find({ artist: req.params.id, isPublished: true }).sort({ releaseDate: -1 })

    res.status(200).json({ artist, topSongs, albums })
  } catch (error) {
    console.error("getArtistById error:", error)
    res.status(500).json({ message: "Lỗi server", error: error.message })
  }
}

// Lấy nghệ sĩ phổ biến
export const getPopularArtists = async (req, res) => {
  try {
    const { limit = 10 } = req.query

    const artists = await Artist.find().sort({ followersCount: -1 }).limit(Number.parseInt(limit))

    res.status(200).json({ artists })
  } catch (error) {
    console.error("getPopularArtists error:", error)
    res.status(500).json({ message: "Lỗi server", error: error.message })
  }
}

// ==================== ADMIN ROUTES ====================

export const createArtist = async (req, res) => {
  try {
    const { name, bio, avatarUrl, coverUrl, isVerified } = req.body

    if (!name) {
      return res.status(400).json({ message: "Tên nghệ sĩ là bắt buộc" })
    }

    const artist = await Artist.create({
      name,
      bio,
      avatarUrl,
      coverUrl,
      isVerified,
      createdBy: req.user._id,
    })

    res.status(201).json({ message: "Tạo nghệ sĩ thành công", artist })
  } catch (error) {
    console.error("createArtist error:", error)
    res.status(500).json({ message: "Lỗi server", error: error.message })
  }
}

export const updateArtist = async (req, res) => {
  try {
    const artist = await Artist.findById(req.params.id)
    if (!artist) {
      return res.status(404).json({ message: "Không tìm thấy nghệ sĩ" })
    }

    const updates = req.body
    const updatedArtist = await Artist.findByIdAndUpdate(req.params.id, updates, { new: true })

    res.status(200).json({ message: "Cập nhật thành công", artist: updatedArtist })
  } catch (error) {
    console.error("updateArtist error:", error)
    res.status(500).json({ message: "Lỗi server", error: error.message })
  }
}

export const deleteArtist = async (req, res) => {
  try {
    const artist = await Artist.findById(req.params.id)
    if (!artist) {
      return res.status(404).json({ message: "Không tìm thấy nghệ sĩ" })
    }

    await Artist.findByIdAndDelete(req.params.id)
    res.status(200).json({ message: "Đã xóa nghệ sĩ" })
  } catch (error) {
    console.error("deleteArtist error:", error)
    res.status(500).json({ message: "Lỗi server", error: error.message })
  }
}
