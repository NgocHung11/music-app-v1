// Types cho toàn bộ ứng dụng, đồng bộ với backend models

export interface User {
  _id: string
  username: string
  email: string
  firstName?: string
  lastName?: string
  avatar?: string
  role: "user" | "admin"
  createdAt: string
  updatedAt: string
}

export interface Artist {
  _id: string
  name: string
  bio?: string
  avatar?: string
  avatarUrl?: string // Backend uses this
  coverImage?: string
  coverUrl?: string // Backend uses this
  followers?: number
  followersCount?: number // Backend uses this
  isVerified: boolean
  genres?: string[]
  socialLinks?: {
    facebook?: string
    instagram?: string
    twitter?: string
  }
  createdAt: string
}

export interface Genre {
  _id: string
  name: string
  description?: string
  coverImage?: string
  color?: string
  createdAt: string
}

export interface Album {
  _id: string
  title: string
  artist: Artist | string
  coverImage?: string
  coverUrl?: string // Added coverUrl field to match backend
  releaseDate?: string
  genre?: Genre | string
  description?: string
  totalTracks: number
  totalDuration: number
  playCount: number
  createdAt: string
}

export interface Song {
  _id: string
  title: string
  artist: Artist | string
  album?: Album | string
  genre?: Genre | string
  duration: number
  audioUrl: string
  coverImage?: string
  coverUrl?: string // Added coverUrl field to match backend
  lyrics?: string
  playCount: number
  releaseDate?: string
  isExplicit: boolean
  createdAt: string
}

export interface Playlist {
  _id: string
  name: string
  description?: string
  coverImage?: string
  user: User | string
  songs: Song[] | string[]
  isPublic: boolean
  totalDuration: number
  createdAt: string
  updatedAt: string
}

export interface Favorite {
  _id: string
  user: string
  itemType: "song" | "album" | "artist" | "playlist"
  itemId: string
  createdAt: string
}

export interface PlayHistory {
  _id: string
  user: string
  song: Song | string
  playedAt: string
  duration: number
  completedAt?: string
}

// API Response types
export interface PaginatedResponse<T> {
  data: T[]
  pagination: {
    page: number
    limit: number
    total: number
    totalPages: number
  }
}

export interface TopSongsResponse {
  songs: Song[]
  period: "day" | "week" | "month"
}

// Helper functions để lấy thông tin từ populated hoặc unpopulated fields
export const getArtistName = (artist: Artist | string): string => {
  if (typeof artist === "string") return "Unknown Artist"
  return artist.name
}

export const getArtistId = (artist: Artist | string): string => {
  if (typeof artist === "string") return artist
  return artist._id
}

export const getAlbumTitle = (album?: Album | string): string => {
  if (!album) return "Unknown Album"
  if (typeof album === "string") return "Unknown Album"
  return album.title
}

export const getGenreName = (genre?: Genre | string): string => {
  if (!genre) return "Unknown Genre"
  if (typeof genre === "string") return "Unknown Genre"
  return genre.name
}

const PLACEHOLDER_IMAGE = "https://via.placeholder.com/300x300.png?text=No+Cover"

export const getCoverImage = (item: Song | Album | Artist | Playlist | null | undefined): string => {
  if (!item) return PLACEHOLDER_IMAGE

  // Check direct coverUrl first (backend uses this)
  if ("coverUrl" in item && item.coverUrl) return item.coverUrl

  // Check coverImage
  if ("coverImage" in item && item.coverImage) return item.coverImage

  // Check avatarUrl (for artists - backend uses this)
  if ("avatarUrl" in item && item.avatarUrl) return item.avatarUrl

  // Check avatar (for artists)
  if ("avatar" in item && item.avatar) return item.avatar

  // For songs: try to get cover from album or artist
  if ("album" in item && item.album && typeof item.album !== "string") {
    const album = item.album as Album
    if (album.coverUrl) return album.coverUrl
    if (album.coverImage) return album.coverImage
  }

  if ("artist" in item && item.artist && typeof item.artist !== "string") {
    const artist = item.artist as Artist
    if (artist.avatarUrl) return artist.avatarUrl
    if (artist.avatar) return artist.avatar
    if (artist.coverUrl) return artist.coverUrl
    if (artist.coverImage) return artist.coverImage
  }

  return PLACEHOLDER_IMAGE
}

export const getArtistAvatar = (artist: Artist | string | null | undefined): string => {
  if (!artist || typeof artist === "string") return PLACEHOLDER_IMAGE
  return artist.avatarUrl || artist.avatar || artist.coverUrl || artist.coverImage || PLACEHOLDER_IMAGE
}

export const getArtistFollowers = (artist: Artist | null | undefined): number => {
  if (!artist) return 0
  return artist.followersCount ?? artist.followers ?? 0
}
