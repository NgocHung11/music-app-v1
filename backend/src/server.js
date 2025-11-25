import express from "express"
import dotenv from "dotenv"
import { connectDB } from "./libs/db.js"
import cors from "cors"
import cookieParser from "cookie-parser"

// Import routes
import authRoute from "./routes/authRoute.js"
import userRoute from "./routes/userRoute.js"
import songRoute from "./routes/songRoute.js"
import albumRoute from "./routes/albumRoute.js"
import artistRoute from "./routes/artistRoute.js"
import genreRoute from "./routes/genreRoute.js"
import playlistRoute from "./routes/playlistRoute.js"
import favoriteRoute from "./routes/favoriteRoute.js"

dotenv.config()

const app = express()
const PORT = process.env.PORT || 5001

// Middlewares
app.use(express.json())
app.use(cookieParser())
app.use(
  cors({
    origin: "*",
    credentials: true,
  }),
)

// API Routes
app.use("/api/auth", authRoute)
app.use("/api/users", userRoute)
app.use("/api/songs", songRoute)
app.use("/api/albums", albumRoute)
app.use("/api/artists", artistRoute)
app.use("/api/genres", genreRoute)
app.use("/api/playlists", playlistRoute)
app.use("/api/favorites", favoriteRoute)

// Health check
app.get("/api/health", (req, res) => {
  res.json({ status: "ok", timestamp: new Date().toISOString() })
})

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack)
  res.status(500).json({ message: "Đã xảy ra lỗi server" })
})

connectDB().then(() => {
  app.listen(PORT, () => {
    console.log(`Server đang chạy trên cổng ${PORT}`)
  })
})
