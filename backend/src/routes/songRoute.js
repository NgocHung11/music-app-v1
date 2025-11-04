import express from "express";
import { protectedRoute } from "../middlewares/authMiddleware.js";
import {
  createSong,
  getSongs,
  getSongById,
  updateSong,
  deleteSong,
} from "../controllers/songController.js";

const router = express.Router();

// 🟢 PUBLIC ROUTES (không cần đăng nhập)
router.get("/", getSongs); // có thể tìm kiếm qua query: /songs?query=love
router.get("/:id", getSongById);

// 🔒 PRIVATE ROUTES (yêu cầu JWT)
router.post("/", protectedRoute, createSong);
router.put("/:id", protectedRoute, updateSong);
router.delete("/:id", protectedRoute, deleteSong);

export default router;
