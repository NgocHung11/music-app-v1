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
  coverImage?: string
  followers: number
  isVerified: boolean
  genres: string[]
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

export const getCoverImage = (item: Song | Album | Artist | Playlist): string => {
  if ("coverImage" in item && item.coverImage) return item.coverImage
  if ("avatar" in item && item.avatar) return item.avatar
  return "https://via.placeholder.com/300x300?text=No+Image"
}
