import express from "express"
import { protectedRoute } from "../middlewares/authMiddleware.js"
import { getMyFavorites, addFavorite, removeFavorite, checkFavorite } from "../controllers/favoriteController.js"

const router = express.Router()

// Tất cả routes đều cần đăng nhập
router.get("/", protectedRoute, getMyFavorites)
router.get("/check", protectedRoute, checkFavorite)
router.post("/", protectedRoute, addFavorite)
router.delete("/", protectedRoute, removeFavorite)

export default router
