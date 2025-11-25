import express from "express"
import { protectedRoute, adminRoute } from "../middlewares/authMiddleware.js"
import {
  getArtists,
  getArtistById,
  getPopularArtists,
  createArtist,
  updateArtist,
  deleteArtist,
} from "../controllers/artistController.js"

const router = express.Router()

// PUBLIC ROUTES
router.get("/", getArtists)
router.get("/popular", getPopularArtists)
router.get("/:id", getArtistById)

// ADMIN ROUTES
router.post("/", protectedRoute, adminRoute, createArtist)
router.put("/:id", protectedRoute, adminRoute, updateArtist)
router.delete("/:id", protectedRoute, adminRoute, deleteArtist)

export default router
