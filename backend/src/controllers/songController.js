import Song from "../models/Song.js"
import PlayHistory from "../models/PlayHistory.js"

// Lấy danh sách bài hát (có filter và pagination)
export const getSongs = async (req, res) => {
  try {
    const {
      q, // search query
      genre,
      artist,
      album,
      page = 1,
      limit = 20,
    } = req.query

    const query = { isPublished: true }

    // Tìm kiếm theo title
    if (q && q.trim()) {
      query.title = { $regex: q.trim(), $options: "i" }
    }

    // Filter theo genre
    if (genre) {
      query.genre = genre
    }

    // Filter theo artist
    if (artist) {
      query.artist = artist
    }

    // Filter theo album
    if (album) {
      query.album = album
    }

    const skip = (Number.parseInt(page) - 1) * Number.parseInt(limit)

    const songs = await Song.find(query)
      .populate("artist", "name avatarUrl")
      .populate("album", "title coverUrl")
      .populate("genre", "name color")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(Number.parseInt(limit))

    const total = await Song.countDocuments(query)

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
    console.error("getSongs error:", error)
    res.status(500).json({ message: "Lỗi server", error: error.message })
  }
}

// Lấy bài hát theo ID
export const getSongById = async (req, res) => {
  try {
    const song = await Song.findById(req.params.id)
      .populate("artist", "name avatarUrl bio")
      .populate("album", "title coverUrl")
      .populate("genre", "name color")

    if (!song) {
      return res.status(404).json({ message: "Không tìm thấy bài hát" })
    }

    res.status(200).json({ song })
  } catch (error) {
    console.error("getSongById error:", error)
    res.status(500).json({ message: "Lỗi server", error: error.message })
  }
}

// Ghi nhận lượt nghe và cập nhật play count
export const playSong = async (req, res) => {
  try {
    const { id } = req.params
    const userId = req.user?._id

    const song = await Song.findById(id)
    if (!song) {
      return res.status(404).json({ message: "Không tìm thấy bài hát" })
    }

    // Tăng play count
    song.playCount += 1
    await song.save()

    // Ghi lịch sử nghe nếu user đã đăng nhập
    if (userId) {
      await PlayHistory.create({
        user: userId,
        song: id,
        playedAt: new Date(),
      })
    }

    res.status(200).json({ message: "Đã ghi nhận lượt nghe", playCount: song.playCount })
  } catch (error) {
    console.error("playSong error:", error)
    res.status(500).json({ message: "Lỗi server", error: error.message })
  }
}

// Lấy top bài hát theo khoảng thời gian
export const getTopSongs = async (req, res) => {
  try {
    const { period = "week", limit = 10 } = req.query

    const dateFilter = new Date()
    switch (period) {
      case "day":
        dateFilter.setDate(dateFilter.getDate() - 1)
        break
      case "week":
        dateFilter.setDate(dateFilter.getDate() - 7)
        break
      case "month":
        dateFilter.setMonth(dateFilter.getMonth() - 1)
        break
      default:
        dateFilter.setDate(dateFilter.getDate() - 7)
    }

    // Aggregate play history để tính top songs
    const topSongs = await PlayHistory.aggregate([
      {
        $match: {
          playedAt: { $gte: dateFilter },
        },
      },
      {
        $group: {
          _id: "$song",
          playCount: { $sum: 1 },
        },
      },
      {
        $sort: { playCount: -1 },
      },
      {
        $limit: Number.parseInt(limit),
      },
      {
        $lookup: {
          from: "songs",
          localField: "_id",
          foreignField: "_id",
          as: "song",
        },
      },
      {
        $unwind: "$song",
      },
      {
        $lookup: {
          from: "artists",
          localField: "song.artist",
          foreignField: "_id",
          as: "song.artist",
        },
      },
      {
        $unwind: { path: "$song.artist", preserveNullAndEmptyArrays: true },
      },
    ])

    res.status(200).json({ songs: topSongs, period })
  } catch (error) {
    console.error("getTopSongs error:", error)
    res.status(500).json({ message: "Lỗi server", error: error.message })
  }
}

// Lấy bài hát mới nhất
export const getNewReleases = async (req, res) => {
  try {
    const { limit = 10 } = req.query

    const songs = await Song.find({ isPublished: true })
      .populate("artist", "name avatarUrl")
      .populate("album", "title coverUrl")
      .sort({ createdAt: -1 })
      .limit(Number.parseInt(limit))

    res.status(200).json({ songs })
  } catch (error) {
    console.error("getNewReleases error:", error)
    res.status(500).json({ message: "Lỗi server", error: error.message })
  }
}

// ==================== ADMIN ROUTES ====================

// Tạo bài hát mới (Admin only)
export const createSong = async (req, res) => {
  try {
    const { title, artist, album, genre, coverUrl, audioUrl, duration, lyrics } = req.body

    if (!title || !artist || !coverUrl || !audioUrl) {
      return res.status(400).json({ message: "Thiếu thông tin bài hát" })
    }

    const song = await Song.create({
      title,
      artist,
      album,
      genre,
      coverUrl,
      audioUrl,
      duration,
      lyrics,
      createdBy: req.user._id,
    })

    const populatedSong = await Song.findById(song._id)
      .populate("artist", "name")
      .populate("album", "title")
      .populate("genre", "name")

    res.status(201).json({ message: "Tạo bài hát thành công", song: populatedSong })
  } catch (error) {
    console.error("createSong error:", error)
    res.status(500).json({ message: "Lỗi server", error: error.message })
  }
}

// Cập nhật bài hát (Admin only)
export const updateSong = async (req, res) => {
  try {
    const song = await Song.findById(req.params.id)
    if (!song) {
      return res.status(404).json({ message: "Không tìm thấy bài hát" })
    }

    const updates = req.body
    const updatedSong = await Song.findByIdAndUpdate(req.params.id, updates, { new: true })
      .populate("artist", "name")
      .populate("album", "title")
      .populate("genre", "name")

    res.status(200).json({ message: "Cập nhật thành công", song: updatedSong })
  } catch (error) {
    console.error("updateSong error:", error)
    res.status(500).json({ message: "Lỗi server", error: error.message })
  }
}

// Xóa bài hát (Admin only)
export const deleteSong = async (req, res) => {
  try {
    const song = await Song.findById(req.params.id)
    if (!song) {
      return res.status(404).json({ message: "Không tìm thấy bài hát" })
    }

    await Song.findByIdAndDelete(req.params.id)
    res.status(200).json({ message: "Đã xóa bài hát" })
  } catch (error) {
    console.error("deleteSong error:", error)
    res.status(500).json({ message: "Lỗi server", error: error.message })
  }
}
