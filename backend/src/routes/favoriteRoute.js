import express from "express"
import { protectedRoute } from "../middlewares/authMiddleware.js"
import {
  getMyFavorites,
  addFavorite,
  removeFavorite,
  checkFavorite,
  getLikedSongs,
  getLikedAlbums,
  getLikedArtists,
} from "../controllers/favoriteController.js"

const router = express.Router()

// Tất cả routes đều cần đăng nhập
router.get("/", protectedRoute, getMyFavorites)
router.get("/check/:itemType/:itemId", protectedRoute, checkFavorite)
router.post("/", protectedRoute, addFavorite)
router.delete("/:itemType/:itemId", protectedRoute, removeFavorite)

router.get("/songs", protectedRoute, getLikedSongs)
router.get("/albums", protectedRoute, getLikedAlbums)
router.get("/artists", protectedRoute, getLikedArtists)

export default router
