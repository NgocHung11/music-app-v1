import express from "express"
import { protectedRoute } from "../middlewares/authMiddleware.js"
import { authMe, updateProfile, getPlayHistory, getRecentlyPlayed } from "../controllers/userController.js"

const router = express.Router()

router.get("/me", protectedRoute, authMe)
router.put("/me", protectedRoute, updateProfile)
router.get("/me/history", protectedRoute, getPlayHistory)
router.get("/me/recently-played", protectedRoute, getRecentlyPlayed)

export default router
