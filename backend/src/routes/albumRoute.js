import express from "express"
import { protectedRoute, adminRoute } from "../middlewares/authMiddleware.js"
import {
  getAlbums,
  getAlbumById,
  getAlbumSongs,
  getNewAlbums,
  createAlbum,
  updateAlbum,
  deleteAlbum,
} from "../controllers/albumController.js"

const router = express.Router()

// PUBLIC ROUTES
router.get("/", getAlbums)
router.get("/new", getNewAlbums)
router.get("/:id", getAlbumById)
router.get("/:id/songs", getAlbumSongs)

// ADMIN ROUTES
router.post("/", protectedRoute, adminRoute, createAlbum)
router.put("/:id", protectedRoute, adminRoute, updateAlbum)
router.delete("/:id", protectedRoute, adminRoute, deleteAlbum)

export default router
