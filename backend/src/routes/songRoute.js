import express from "express"
import { protectedRoute, optionalAuth, adminRoute } from "../middlewares/authMiddleware.js"
import {
  getSongs,
  getSongById,
  playSong,
  getTopSongs,
  getNewReleases,
  createSong,
  updateSong,
  deleteSong,
} from "../controllers/songController.js"

const router = express.Router()

// PUBLIC ROUTES
router.get("/", getSongs)
router.get("/top", getTopSongs)
router.get("/top/:period", getTopSongs)
router.get("/new", getNewReleases)
router.get("/:id", getSongById)

// PROTECTED ROUTES (user đăng nhập)
router.post("/:id/play", optionalAuth, playSong)

// ADMIN ROUTES
router.post("/", protectedRoute, adminRoute, createSong)
router.put("/:id", protectedRoute, adminRoute, updateSong)
router.delete("/:id", protectedRoute, adminRoute, deleteSong)

export default router
