import express from "express"
import { protectedRoute, adminRoute } from "../middlewares/authMiddleware.js"
import {
  getGenres,
  getGenreById,
  getGenreSongs,
  getGenreAlbums,
  createGenre,
  updateGenre,
  deleteGenre,
} from "../controllers/genreController.js"

const router = express.Router()

// PUBLIC ROUTES
router.get("/", getGenres)
router.get("/:id", getGenreById)
router.get("/:id/songs", getGenreSongs)
router.get("/:id/albums", getGenreAlbums)

// ADMIN ROUTES
router.post("/", protectedRoute, adminRoute, createGenre)
router.put("/:id", protectedRoute, adminRoute, updateGenre)
router.delete("/:id", protectedRoute, adminRoute, deleteGenre)

export default router
