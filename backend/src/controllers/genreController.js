import Genre from "../models/Genre.js"
import Song from "../models/Song.js"
import Album from "../models/Album.js"

// Lấy tất cả thể loại
export const getGenres = async (req, res) => {
  try {
    const genres = await Genre.find().sort({ name: 1 })
    res.status(200).json({ genres })
  } catch (error) {
    console.error("getGenres error:", error)
    res.status(500).json({ message: "Lỗi server", error: error.message })
  }
}

// Lấy thể loại theo ID kèm bài hát
export const getGenreById = async (req, res) => {
  try {
    const genre = await Genre.findById(req.params.id)

    if (!genre) {
      return res.status(404).json({ message: "Không tìm thấy thể loại" })
    }

    const { page = 1, limit = 20 } = req.query
    const skip = (Number.parseInt(page) - 1) * Number.parseInt(limit)

    const songs = await Song.find({ genre: req.params.id, isPublished: true })
      .populate("artist", "name avatarUrl")
      .populate("album", "title coverUrl")
      .sort({ playCount: -1 })
      .skip(skip)
      .limit(Number.parseInt(limit))

    const total = await Song.countDocuments({ genre: req.params.id, isPublished: true })

    res.status(200).json({
      genre,
      songs,
      pagination: {
        page: Number.parseInt(page),
        limit: Number.parseInt(limit),
        total,
        totalPages: Math.ceil(total / Number.parseInt(limit)),
      },
    })
  } catch (error) {
    console.error("getGenreById error:", error)
    res.status(500).json({ message: "Lỗi server", error: error.message })
  }
}

// ==================== ADMIN ROUTES ====================

export const createGenre = async (req, res) => {
  try {
    const { name, description, coverUrl, color } = req.body

    if (!name) {
      return res.status(400).json({ message: "Tên thể loại là bắt buộc" })
    }

    const existing = await Genre.findOne({ name: { $regex: new RegExp(`^${name}$`, "i") } })
    if (existing) {
      return res.status(409).json({ message: "Thể loại đã tồn tại" })
    }

    const genre = await Genre.create({ name, description, coverUrl, color })
    res.status(201).json({ message: "Tạo thể loại thành công", genre })
  } catch (error) {
    console.error("createGenre error:", error)
    res.status(500).json({ message: "Lỗi server", error: error.message })
  }
}

export const updateGenre = async (req, res) => {
  try {
    const genre = await Genre.findById(req.params.id)
    if (!genre) {
      return res.status(404).json({ message: "Không tìm thấy thể loại" })
    }

    const updates = req.body
    const updatedGenre = await Genre.findByIdAndUpdate(req.params.id, updates, { new: true })

    res.status(200).json({ message: "Cập nhật thành công", genre: updatedGenre })
  } catch (error) {
    console.error("updateGenre error:", error)
    res.status(500).json({ message: "Lỗi server", error: error.message })
  }
}

export const deleteGenre = async (req, res) => {
  try {
    const genre = await Genre.findById(req.params.id)
    if (!genre) {
      return res.status(404).json({ message: "Không tìm thấy thể loại" })
    }

    await Genre.findByIdAndDelete(req.params.id)
    res.status(200).json({ message: "Đã xóa thể loại" })
  } catch (error) {
    console.error("deleteGenre error:", error)
    res.status(500).json({ message: "Lỗi server", error: error.message })
  }
}

export const getGenreSongs = async (req, res) => {
  try {
    const { page = 1, limit = 20 } = req.query
    const skip = (Number.parseInt(page) - 1) * Number.parseInt(limit)

    const genre = await Genre.findById(req.params.id)
    if (!genre) {
      return res.status(404).json({ message: "Không tìm thấy thể loại" })
    }

    const songs = await Song.find({ genre: req.params.id, isPublished: true })
      .populate("artist", "name avatarUrl")
      .populate("album", "title coverUrl")
      .sort({ playCount: -1 })
      .skip(skip)
      .limit(Number.parseInt(limit))

    const total = await Song.countDocuments({ genre: req.params.id, isPublished: true })

    res.status(200).json({
      songs,
      pagination: {
        page: Number.parseInt(page),
        limit: Number.parseInt(limit),
        total,
        totalPages: Math.ceil(total / Number.parseInt(limit)),
      },
    })
  } catch (error) {
    console.error("getGenreSongs error:", error)
    res.status(500).json({ message: "Lỗi server", error: error.message })
  }
}

export const getGenreAlbums = async (req, res) => {
  try {
    const genre = await Genre.findById(req.params.id)
    if (!genre) {
      return res.status(404).json({ message: "Không tìm thấy thể loại" })
    }

    // Get songs in this genre to find their albums
    const songsInGenre = await Song.find({ genre: req.params.id, isPublished: true }).distinct("album")

    const albums = await Album.find({ _id: { $in: songsInGenre }, isPublished: true })
      .populate("artist", "name avatarUrl")
      .sort({ releaseDate: -1 })

    res.status(200).json({ albums })
  } catch (error) {
    console.error("getGenreAlbums error:", error)
    res.status(500).json({ message: "Lỗi server", error: error.message })
  }
}
