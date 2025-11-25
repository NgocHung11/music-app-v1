import Playlist from "../models/Playlist.js"

// Lấy playlists của user hiện tại
export const getMyPlaylists = async (req, res) => {
  try {
    const playlists = await Playlist.find({ user: req.user._id })
      .populate("songs.song", "title coverUrl artist")
      .sort({ updatedAt: -1 })

    res.status(200).json({ playlists })
  } catch (error) {
    console.error("getMyPlaylists error:", error)
    res.status(500).json({ message: "Lỗi server", error: error.message })
  }
}

// Lấy playlist theo ID
export const getPlaylistById = async (req, res) => {
  try {
    const playlist = await Playlist.findById(req.params.id)
      .populate("user", "displayName avatarUrl")
      .populate({
        path: "songs.song",
        populate: [
          { path: "artist", select: "name avatarUrl" },
          { path: "album", select: "title coverUrl" },
        ],
      })

    if (!playlist) {
      return res.status(404).json({ message: "Không tìm thấy playlist" })
    }

    // Kiểm tra quyền truy cập
    if (!playlist.isPublic && playlist.user._id.toString() !== req.user?._id?.toString()) {
      return res.status(403).json({ message: "Bạn không có quyền xem playlist này" })
    }

    res.status(200).json({ playlist })
  } catch (error) {
    console.error("getPlaylistById error:", error)
    res.status(500).json({ message: "Lỗi server", error: error.message })
  }
}

// Tạo playlist mới
export const createPlaylist = async (req, res) => {
  try {
    const { name, description, coverUrl, isPublic } = req.body

    if (!name) {
      return res.status(400).json({ message: "Tên playlist là bắt buộc" })
    }

    const playlist = await Playlist.create({
      name,
      description,
      coverUrl,
      isPublic: isPublic || false,
      user: req.user._id,
      songs: [],
    })

    res.status(201).json({ message: "Tạo playlist thành công", playlist })
  } catch (error) {
    console.error("createPlaylist error:", error)
    res.status(500).json({ message: "Lỗi server", error: error.message })
  }
}

// Cập nhật playlist
export const updatePlaylist = async (req, res) => {
  try {
    const playlist = await Playlist.findById(req.params.id)

    if (!playlist) {
      return res.status(404).json({ message: "Không tìm thấy playlist" })
    }

    if (playlist.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: "Bạn không có quyền sửa playlist này" })
    }

    const { name, description, coverUrl, isPublic } = req.body

    if (name) playlist.name = name
    if (description !== undefined) playlist.description = description
    if (coverUrl !== undefined) playlist.coverUrl = coverUrl
    if (isPublic !== undefined) playlist.isPublic = isPublic

    await playlist.save()

    res.status(200).json({ message: "Cập nhật thành công", playlist })
  } catch (error) {
    console.error("updatePlaylist error:", error)
    res.status(500).json({ message: "Lỗi server", error: error.message })
  }
}

// Xóa playlist
export const deletePlaylist = async (req, res) => {
  try {
    const playlist = await Playlist.findById(req.params.id)

    if (!playlist) {
      return res.status(404).json({ message: "Không tìm thấy playlist" })
    }

    if (playlist.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: "Bạn không có quyền xóa playlist này" })
    }

    await Playlist.findByIdAndDelete(req.params.id)
    res.status(200).json({ message: "Đã xóa playlist" })
  } catch (error) {
    console.error("deletePlaylist error:", error)
    res.status(500).json({ message: "Lỗi server", error: error.message })
  }
}

// Thêm bài hát vào playlist
export const addSongToPlaylist = async (req, res) => {
  try {
    const { songId } = req.body
    const playlist = await Playlist.findById(req.params.id)

    if (!playlist) {
      return res.status(404).json({ message: "Không tìm thấy playlist" })
    }

    if (playlist.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: "Bạn không có quyền sửa playlist này" })
    }

    // Kiểm tra bài hát đã có trong playlist chưa
    const songExists = playlist.songs.some((s) => s.song.toString() === songId)
    if (songExists) {
      return res.status(400).json({ message: "Bài hát đã có trong playlist" })
    }

    playlist.songs.push({ song: songId, addedAt: new Date() })
    await playlist.save()

    const updatedPlaylist = await Playlist.findById(req.params.id).populate({
      path: "songs.song",
      populate: { path: "artist", select: "name" },
    })

    res.status(200).json({ message: "Đã thêm bài hát vào playlist", playlist: updatedPlaylist })
  } catch (error) {
    console.error("addSongToPlaylist error:", error)
    res.status(500).json({ message: "Lỗi server", error: error.message })
  }
}

// Xóa bài hát khỏi playlist
export const removeSongFromPlaylist = async (req, res) => {
  try {
    const { songId } = req.params
    const playlist = await Playlist.findById(req.params.id)

    if (!playlist) {
      return res.status(404).json({ message: "Không tìm thấy playlist" })
    }

    if (playlist.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: "Bạn không có quyền sửa playlist này" })
    }

    playlist.songs = playlist.songs.filter((s) => s.song.toString() !== songId)
    await playlist.save()

    res.status(200).json({ message: "Đã xóa bài hát khỏi playlist", playlist })
  } catch (error) {
    console.error("removeSongFromPlaylist error:", error)
    res.status(500).json({ message: "Lỗi server", error: error.message })
  }
}
