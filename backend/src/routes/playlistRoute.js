import express from "express"
import { protectedRoute } from "../middlewares/authMiddleware.js"
import {
  getMyPlaylists,
  getPlaylistById,
  createPlaylist,
  updatePlaylist,
  deletePlaylist,
  addSongToPlaylist,
  removeSongFromPlaylist,
} from "../controllers/playlistController.js"

const router = express.Router()

// Tất cả routes đều cần đăng nhập
router.get("/", protectedRoute, getMyPlaylists)
router.get("/:id", protectedRoute, getPlaylistById)
router.post("/", protectedRoute, createPlaylist)
router.put("/:id", protectedRoute, updatePlaylist)
router.delete("/:id", protectedRoute, deletePlaylist)
router.post("/:id/songs", protectedRoute, addSongToPlaylist)
router.delete("/:id/songs/:songId", protectedRoute, removeSongFromPlaylist)

export default router
