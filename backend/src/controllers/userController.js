import User from "../models/User.js"
import PlayHistory from "../models/PlayHistory.js"

// Lấy thông tin user hiện tại
export const authMe = async (req, res) => {
  try {
    const user = req.user
    return res.status(200).json({ user })
  } catch (error) {
    console.error("Lỗi khi gọi authMe", error)
    return res.status(500).json({ message: "Lỗi hệ thống" })
  }
}

// Cập nhật profile
export const updateProfile = async (req, res) => {
  try {
    const { displayName, bio, phone, avatarUrl, avatarId } = req.body

    const updates = {}
    if (displayName) updates.displayName = displayName
    if (bio !== undefined) updates.bio = bio
    if (phone !== undefined) updates.phone = phone
    if (avatarUrl !== undefined) updates.avatarUrl = avatarUrl
    if (avatarId !== undefined) updates.avatarId = avatarId

    const user = await User.findByIdAndUpdate(req.user._id, updates, { new: true }).select("-hashedPassword")

    return res.status(200).json({ message: "Cập nhật thành công", user })
  } catch (error) {
    console.error("updateProfile error:", error)
    return res.status(500).json({ message: "Lỗi hệ thống" })
  }
}

// Lấy lịch sử nghe nhạc
export const getPlayHistory = async (req, res) => {
  try {
    const { page = 1, limit = 20 } = req.query
    const skip = (Number.parseInt(page) - 1) * Number.parseInt(limit)

    const history = await PlayHistory.find({ user: req.user._id })
      .populate({
        path: "song",
        populate: [
          { path: "artist", select: "name avatarUrl" },
          { path: "album", select: "title coverUrl" },
        ],
      })
      .sort({ playedAt: -1 })
      .skip(skip)
      .limit(Number.parseInt(limit))

    const total = await PlayHistory.countDocuments({ user: req.user._id })

    return res.status(200).json({
      history,
      pagination: {
        page: Number.parseInt(page),
        limit: Number.parseInt(limit),
        total,
        totalPages: Math.ceil(total / Number.parseInt(limit)),
      },
    })
  } catch (error) {
    console.error("getPlayHistory error:", error)
    return res.status(500).json({ message: "Lỗi hệ thống" })
  }
}

// Lấy bài hát đã nghe gần đây (không trùng lặp)
export const getRecentlyPlayed = async (req, res) => {
  try {
    const { limit = 10 } = req.query

    const recentSongs = await PlayHistory.aggregate([
      { $match: { user: req.user._id } },
      { $sort: { playedAt: -1 } },
      {
        $group: {
          _id: "$song",
          lastPlayed: { $first: "$playedAt" },
        },
      },
      { $sort: { lastPlayed: -1 } },
      { $limit: Number.parseInt(limit) },
      {
        $lookup: {
          from: "songs",
          localField: "_id",
          foreignField: "_id",
          as: "song",
        },
      },
      { $unwind: "$song" },
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

    return res.status(200).json({ songs: recentSongs })
  } catch (error) {
    console.error("getRecentlyPlayed error:", error)
    return res.status(500).json({ message: "Lỗi hệ thống" })
  }
}
