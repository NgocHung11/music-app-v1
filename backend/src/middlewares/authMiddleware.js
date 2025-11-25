// @ts-nocheck
import jwt from "jsonwebtoken"
import User from "../models/User.js"

// Authorization - xác minh user là ai (bắt buộc)
export const protectedRoute = (req, res, next) => {
  try {
    const authHeader = req.headers["authorization"]
    const token = authHeader && authHeader.split(" ")[1]

    if (!token) {
      return res.status(401).json({ message: "Không tìm thấy access token" })
    }

    jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, async (err, decodedUser) => {
      if (err) {
        console.error(err)
        return res.status(403).json({ message: "Access token hết hạn hoặc không đúng" })
      }

      const user = await User.findById(decodedUser.userId).select("-hashedPassword")

      if (!user) {
        return res.status(404).json({ message: "Người dùng không tồn tại." })
      }

      if (!user.isActive) {
        return res.status(403).json({ message: "Tài khoản đã bị vô hiệu hóa." })
      }

      req.user = user
      next()
    })
  } catch (error) {
    console.error("Lỗi khi xác minh JWT trong authMiddleware", error)
    return res.status(500).json({ message: "Lỗi hệ thống" })
  }
}

// Optional auth - không bắt buộc đăng nhập
export const optionalAuth = (req, res, next) => {
  try {
    const authHeader = req.headers["authorization"]
    const token = authHeader && authHeader.split(" ")[1]

    if (!token) {
      return next()
    }

    jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, async (err, decodedUser) => {
      if (err) {
        return next()
      }

      const user = await User.findById(decodedUser.userId).select("-hashedPassword")
      if (user && user.isActive) {
        req.user = user
      }
      next()
    })
  } catch (error) {
    next()
  }
}

// Admin route - chỉ admin mới được truy cập
export const adminRoute = (req, res, next) => {
  if (req.user && req.user.role === "admin") {
    next()
  } else {
    return res.status(403).json({ message: "Bạn không có quyền truy cập" })
  }
}
