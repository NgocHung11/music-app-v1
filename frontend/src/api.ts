import axios from "axios"
import * as SecureStore from "expo-secure-store"
import { getAccessToken, setAccessToken } from "./context/tokenHelper"
import type { Song, Album, Artist, Genre, Playlist, User, TopSongsResponse, PlayHistory, Favorite } from "./types"

/**
 * CẤU HÌNH API_BASE:
 * - Android Emulator: http://10.0.2.2:5001
 * - iOS Simulator: http://localhost:5001
 * - Thiết bị thật: http://<IP_MÁY_TÍNH>:5001
 *   (Chạy "ipconfig" trên Windows hoặc "ifconfig" trên Mac để lấy IP)
 *
 * Thay đổi IP này thành IP máy tính của bạn
 * Ví dụ: nếu IP là 192.168.1.10 thì đổi thành "http://192.168.1.10:5001"
 */
export const API_BASE = "https://music-app-v1-3y0r.onrender.com"
// Android Emulator
// export const API_BASE = "http://localhost:5001" // iOS Simulator
// export const API_BASE = "http://YOUR_IP:5001" // Thiết bị thật - thay YOUR_IP bằng IP máy tính

const api = axios.create({
  baseURL: API_BASE + "/api",
  headers: {
    "Content-Type": "application/json",
  },
  timeout: 10000, // Thêm timeout 10 giây
  withCredentials: true,
})

// Request interceptor - thêm token vào header
api.interceptors.request.use(
  async (config) => {
    console.log(`[v0] API Request: ${config.method?.toUpperCase()} ${config.baseURL}${config.url}`)
    const token = await getAccessToken()
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (err) => {
    console.log("[v0] API Request Error:", err.message)
    return Promise.reject(err)
  },
)

// Response interceptor - xử lý refresh token
let isRefreshing = false
let failedQueue: { resolve: (v?: any) => void; reject: (e?: any) => void; config: any }[] = []

const processQueue = (error: any, token: string | null = null) => {
  failedQueue.forEach((p) => {
    if (error) p.reject(error)
    else {
      if (p.config.headers) p.config.headers.Authorization = `Bearer ${token}`
      p.resolve(api(p.config))
    }
  })
  failedQueue = []
}

api.interceptors.response.use(
  (res) => res,
  async (err) => {
    const originalRequest = err.config
    if (err.response && err.response.status === 401 && !originalRequest._retry) {
      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject, config: originalRequest })
        })
      }

      originalRequest._retry = true
      isRefreshing = true
      try {
        const refreshToken = await SecureStore.getItemAsync("refreshToken")
        if (!refreshToken) throw new Error("No refresh token")

        const r = await axios.post(
          API_BASE + "/api/auth/refresh",
          { refreshToken },
          { headers: { "Content-Type": "application/json" } },
        )

        const newAccessToken = r.data.accessToken
        await setAccessToken(newAccessToken)

        processQueue(null, newAccessToken)
        isRefreshing = false

        if (originalRequest.headers) originalRequest.headers.Authorization = `Bearer ${newAccessToken}`
        return api(originalRequest)
      } catch (e) {
        processQueue(e as any, null)
        isRefreshing = false
        return Promise.reject(e)
      }
    }
    return Promise.reject(err)
  },
)

// ========== SONGS API ==========
export const songApi = {
  getAll: (params?: { page?: number; limit?: number; genre?: string; artist?: string; album?: string; q?: string }) =>
    api.get<{ songs: Song[]; pagination: any }>("/songs", { params }),

  getById: (id: string) => api.get<{ song: Song }>(`/songs/${id}`),

  getTopSongs: (period: "day" | "week" | "month" = "week", limit = 10) =>
    api.get<TopSongsResponse>(`/songs/top/${period}`, { params: { limit } }),

  search: (q: string) => api.get<{ songs: Song[] }>("/songs", { params: { q } }),

  recordPlay: (songId: string, duration: number) => api.post(`/songs/${songId}/play`, { duration }),
}

// ========== ALBUMS API ==========
export const albumApi = {
  getAll: (params?: { page?: number; limit?: number; artist?: string; genre?: string }) =>
    api.get<{ albums: Album[]; pagination: any }>("/albums", { params }),

  getById: (id: string) => api.get<{ album: Album }>(`/albums/${id}`),

  getSongs: (id: string) => api.get<{ songs: Song[] }>(`/albums/${id}/songs`),

  getNewReleases: (limit = 10) => api.get<{ albums: Album[] }>("/albums", { params: { limit, sort: "-releaseDate" } }),
}

// ========== ARTISTS API ==========
export const artistApi = {
  getAll: (params?: { page?: number; limit?: number; q?: string }) =>
    api.get<{ artists: Artist[]; pagination: any }>("/artists", { params }),

  getById: (id: string) => api.get<{ artist: Artist }>(`/artists/${id}`),

  getSongs: (id: string, params?: { page?: number; limit?: number }) =>
    api.get<{ songs: Song[]; pagination: any }>(`/artists/${id}/songs`, { params }),

  getAlbums: (id: string) => api.get<{ albums: Album[] }>(`/artists/${id}/albums`),

  getPopular: (limit = 10) => api.get<{ artists: Artist[] }>("/artists", { params: { limit, sort: "-followers" } }),
}

// ========== GENRES API ==========
export const genreApi = {
  getAll: () => api.get<{ genres: Genre[] }>("/genres"),

  getById: (id: string) => api.get<{ genre: Genre }>(`/genres/${id}`),

  getSongs: (id: string, params?: { page?: number; limit?: number }) =>
    api.get<{ songs: Song[]; pagination: any }>(`/genres/${id}/songs`, { params }),

  getAlbums: (id: string) => api.get<{ albums: Album[] }>(`/genres/${id}/albums`),
}

// ========== PLAYLISTS API ==========
export const playlistApi = {
  getMyPlaylists: () => api.get<{ playlists: Playlist[] }>("/playlists/me"),

  getById: (id: string) => api.get<{ playlist: Playlist }>(`/playlists/${id}`),

  create: (data: { name: string; description?: string; isPublic?: boolean }) =>
    api.post<{ playlist: Playlist }>("/playlists", data),

  update: (id: string, data: { name?: string; description?: string; isPublic?: boolean }) =>
    api.put<{ playlist: Playlist }>(`/playlists/${id}`, data),

  delete: (id: string) => api.delete(`/playlists/${id}`),

  addSong: (playlistId: string, songId: string) =>
    api.post<{ playlist: Playlist }>(`/playlists/${playlistId}/songs`, { songId }),

  removeSong: (playlistId: string, songId: string) => api.delete(`/playlists/${playlistId}/songs/${songId}`),

  reorderSongs: (playlistId: string, songIds: string[]) => api.put(`/playlists/${playlistId}/reorder`, { songIds }),
}

// ========== FAVORITES API ==========
export const favoriteApi = {
  getAll: (type?: "song" | "album" | "artist" | "playlist") =>
    api.get<{ favorites: Favorite[] }>("/favorites", { params: { type } }),

  add: (itemType: "song" | "album" | "artist" | "playlist", itemId: string) =>
    api.post<{ favorite: Favorite }>("/favorites", { itemType, itemId }),

  remove: (itemType: "song" | "album" | "artist" | "playlist", itemId: string) =>
    api.delete(`/favorites/${itemType}/${itemId}`),

  check: (itemType: "song" | "album" | "artist" | "playlist", itemId: string) =>
    api.get<{ isFavorite: boolean }>(`/favorites/check/${itemType}/${itemId}`),

  getLikedSongs: () => api.get<{ songs: Song[] }>("/favorites/songs"),

  getLikedAlbums: () => api.get<{ albums: Album[] }>("/favorites/albums"),

  getLikedArtists: () => api.get<{ artists: Artist[] }>("/favorites/artists"),
}

// ========== USER API ==========
export const userApi = {
  getProfile: () => api.get<{ user: User }>("/users/me"),

  updateProfile: (data: { firstName?: string; lastName?: string; avatar?: string }) =>
    api.put<{ user: User }>("/users/me", data),

  changePassword: (data: { currentPassword: string; newPassword: string }) => api.put("/users/me/password", data),

  getHistory: (params?: { page?: number; limit?: number }) =>
    api.get<{ history: PlayHistory[]; pagination: any }>("/users/me/history", { params }),

  clearHistory: () => api.delete("/users/me/history"),

  getStats: () =>
    api.get<{
      totalListeningTime: number
      totalSongsPlayed: number
      totalPlaylists: number
      favoriteGenre: string
    }>("/users/me/stats"),
}

// ========== AUTH API ==========
export const authApi = {
  signIn: (username: string, password: string) => {
    console.log(`[v0] SignIn API call to: ${API_BASE}/api/auth/signin`)
    return axios.post(`${API_BASE}/api/auth/signin`, { username, password }, { timeout: 10000 })
  },

  signUp: (data: { username: string; password: string; email: string; firstName?: string; lastName?: string }) => {
    console.log(`[v0] SignUp API call to: ${API_BASE}/api/auth/signup`)
    console.log(`[v0] SignUp data:`, JSON.stringify(data))
    return axios.post(`${API_BASE}/api/auth/signup`, data, { timeout: 10000 })
  },

  signOut: (refreshToken: string) => axios.post(`${API_BASE}/api/auth/signout`, { refreshToken }, { timeout: 10000 }),

  refresh: (refreshToken: string) => axios.post(`${API_BASE}/api/auth/refresh`, { refreshToken }, { timeout: 10000 }),
}

export default api
