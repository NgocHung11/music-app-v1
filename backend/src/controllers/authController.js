// @ts-nocheck
import bcrypt from "bcrypt"
import User from "../models/User.js"
import jwt from "jsonwebtoken"
import crypto from "crypto"
import Session from "../models/Session.js"

const ACCESS_TOKEN_TTL = "30m" // thuờng là dưới 15m
const REFRESH_TOKEN_TTL_MS = 14 * 24 * 60 * 60 * 1000 // 14 ngày (tính bằng ms)

export const signUp = async (req, res) => {
  try {
    const { username, password, email, firstName, lastName } = req.body

    if (!username || !password || !email) {
      return res.status(400).json({
        message: "Không thể thiếu username, password, và email",
      })
    }

    // Kiểm tra email hợp lệ
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) {
      return res.status(400).json({ message: "Email không hợp lệ" })
    }

    // Kiểm tra password đủ mạnh
    if (password.length < 6) {
      return res.status(400).json({ message: "Password phải có ít nhất 6 ký tự" })
    }

    const duplicateUsername = await User.findOne({ username: username.toLowerCase() })
    if (duplicateUsername) {
      return res.status(409).json({ message: "Username đã tồn tại" })
    }

    const duplicateEmail = await User.findOne({ email: email.toLowerCase() })
    if (duplicateEmail) {
      return res.status(409).json({ message: "Email đã được sử dụng" })
    }

    const hashedPassword = await bcrypt.hash(password, 10)

    const displayName = firstName || lastName ? `${firstName || ""} ${lastName || ""}`.trim() : username

    await User.create({
      username: username.toLowerCase(),
      hashedPassword,
      email: email.toLowerCase(),
      displayName,
      firstName: firstName || "",
      lastName: lastName || "",
    })

    return res.status(201).json({ message: "Đăng ký thành công" })
  } catch (error) {
    console.error("Lỗi khi gọi signUp", error)
    return res.status(500).json({ message: "Lỗi hệ thống" })
  }
}

export const signIn = async (req, res) => {
  try {
    const { username, password } = req.body

    if (!username || !password) {
      return res.status(400).json({ message: "Thiếu username hoặc password." })
    }

    const user = await User.findOne({ username })

    if (!user) {
      return res.status(401).json({ message: "username hoặc password không chính xác" })
    }

    const passwordCorrect = await bcrypt.compare(password, user.hashedPassword)

    if (!passwordCorrect) {
      return res.status(401).json({ message: "username hoặc password không chính xác" })
    }

    const accessToken = jwt.sign(
      { userId: user._id },
      // @ts-ignore
      process.env.ACCESS_TOKEN_SECRET,
      { expiresIn: ACCESS_TOKEN_TTL },
    )

    const refreshToken = crypto.randomBytes(64).toString("hex")

    await Session.create({
      userId: user._id,
      refreshToken,
      expiresAt: new Date(Date.now() + REFRESH_TOKEN_TTL_MS),
    })

    return res.status(200).json({
      message: `User ${user.displayName} đã logged in!`,
      accessToken: accessToken,
      refreshToken: refreshToken,
    })
  } catch (error) {
    console.error("Lỗi khi gọi signIn", error)
    return res.status(500).json({ message: "Lỗi hệ thống" })
  }
}

export const signOut = async (req, res) => {
  try {
    const { refreshToken } = req.body

    if (refreshToken) {
      await Session.deleteOne({ refreshToken: refreshToken })
    }

    return res.sendStatus(204)
  } catch (error) {
    console.error("Lỗi khi gọi signOut", error)
    return res.status(500).json({ message: "Lỗi hệ thống" })
  }
}

export const refreshToken = async (req, res) => {
  try {
    const { refreshToken: token } = req.body

    if (!token) {
      return res.status(401).json({ message: "Token không tồn tại." })
    }

    const session = await Session.findOne({ refreshToken: token })

    if (!session) {
      return res.status(403).json({ message: "Token không hợp lệ hoặc đã hết hạn" })
    }

    if (session.expiresAt < new Date()) {
      await Session.deleteOne({ refreshToken: token })
      return res.status(403).json({ message: "Token đã hết hạn." })
    }

    const accessToken = jwt.sign(
      {
        userId: session.userId,
      },
      process.env.ACCESS_TOKEN_SECRET,
      { expiresIn: ACCESS_TOKEN_TTL },
    )

    return res.status(200).json({ accessToken })
  } catch (error) {
    console.error("Lỗi khi gọi refreshToken", error)
    return res.status(500).json({ message: "Lỗi hệ thống" })
  }
}
