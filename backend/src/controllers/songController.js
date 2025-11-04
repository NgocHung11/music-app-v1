import Song from "../models/Song.js";

// 🟢 Thêm bài hát mới (chỉ dành cho user đã đăng nhập)
export const createSong = async (req, res) => {
  try {
    const { title, artist, album, genre, coverUrl, audioUrl, duration } = req.body;

    if (!title || !artist || !coverUrl || !audioUrl) {
      return res.status(400).json({ message: "Thiếu thông tin bài hát" });
    }

    const song = await Song.create({
      title,
      artist,
      album,
      genre,
      coverUrl,
      audioUrl,
      duration,
      uploadedBy: req.user._id, // từ protectedRoute
    });

    res.status(201).json({ message: "Tạo bài hát thành công", song });
  } catch (error) {
    console.error("createSong error:", error);
    res.status(500).json({ message: "Lỗi server", error: error.message });
  }
};

// 🟢 Lấy danh sách bài hát (hoặc tìm kiếm)
export const getSongs = async (req, res) => {
  try {
    const q = req.query.q || ""; // 👈 nhận đúng param từ frontend
    let songs;

    if (q.trim()) {
      // Nếu có từ khóa => lọc theo tiêu đề
      songs = await Song.find({
        title: { $regex: q, $options: "i" },
      })
        .populate("uploadedBy", "username")
        .sort({ createdAt: -1 });
    } else {
      // Nếu không có từ khóa => trả tất cả bài hát
      songs = await Song.find()
        .populate("uploadedBy", "username")
        .sort({ createdAt: -1 });
    }
    
    res.status(200).json({ songs });
  } catch (error) {
    console.error("getSongs error:", error);
    res.status(500).json({ message: "Lỗi server", error: error.message });
  }
};


// 🟢 Lấy bài hát theo ID
export const getSongById = async (req, res) => {
  try {
    const song = await Song.findById(req.params.id).populate("uploadedBy", "username");
    if (!song) return res.status(404).json({ message: "Không tìm thấy bài hát" });
    res.status(200).json({ song });
  } catch (error) {
    res.status(500).json({ message: "Lỗi server", error: error.message });
  }
};

// 🟢 Cập nhật bài hát
export const updateSong = async (req, res) => {
  try {
    const song = await Song.findById(req.params.id);
    if (!song) return res.status(404).json({ message: "Không tìm thấy bài hát" });

    // Kiểm tra quyền
    if (song.uploadedBy.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: "Bạn không có quyền sửa bài hát này" });
    }

    const updates = req.body;
    const updatedSong = await Song.findByIdAndUpdate(req.params.id, updates, { new: true });

    res.status(200).json({ message: "Cập nhật thành công", song: updatedSong });
  } catch (error) {
    console.error("updateSong error:", error);
    res.status(500).json({ message: "Lỗi server", error: error.message });
  }
};

// 🟢 Xóa bài hát
export const deleteSong = async (req, res) => {
  try {
    const song = await Song.findById(req.params.id);
    if (!song) return res.status(404).json({ message: "Không tìm thấy bài hát" });

    // Kiểm tra quyền
    if (song.uploadedBy.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: "Bạn không có quyền xóa bài hát này" });
    }

    await Song.findByIdAndDelete(req.params.id);
    res.status(200).json({ message: "Đã xóa bài hát" });
  } catch (error) {
    console.error("deleteSong error:", error);
    res.status(500).json({ message: "Lỗi server", error: error.message });
  }
};
