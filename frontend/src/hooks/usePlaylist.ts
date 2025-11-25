"use client"

import { useState, useEffect, useCallback } from "react"
import { playlistApi } from "../api"
import type { Playlist } from "../types"

export const useMyPlaylists = () => {
  const [playlists, setPlaylists] = useState<Playlist[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchPlaylists = useCallback(async () => {
    try {
      setLoading(true)
      const res = await playlistApi.getMyPlaylists()
      setPlaylists(res.data.playlists ?? [])
      setError(null)
    } catch (e: any) {
      setError(e.message || "Failed to fetch playlists")
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchPlaylists()
  }, [fetchPlaylists])

  const createPlaylist = async (name: string, description?: string) => {
    const res = await playlistApi.create({ name, description })
    setPlaylists((prev) => [...prev, res.data.playlist])
    return res.data.playlist
  }

  const deletePlaylist = async (id: string) => {
    await playlistApi.delete(id)
    setPlaylists((prev) => prev.filter((p) => p._id !== id))
  }

  return {
    playlists,
    loading,
    error,
    refresh: fetchPlaylists,
    createPlaylist,
    deletePlaylist,
  }
}

export const usePlaylistDetail = (playlistId: string) => {
  const [playlist, setPlaylist] = useState<Playlist | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchPlaylist = async () => {
      try {
        setLoading(true)
        const res = await playlistApi.getById(playlistId)
        setPlaylist(res.data.playlist)
      } catch (e) {
        console.warn("Fetch playlist error", e)
      } finally {
        setLoading(false)
      }
    }
    if (playlistId) fetchPlaylist()
  }, [playlistId])

  const addSong = async (songId: string) => {
    const res = await playlistApi.addSong(playlistId, songId)
    setPlaylist(res.data.playlist)
  }

  const removeSong = async (songId: string) => {
    await playlistApi.removeSong(playlistId, songId)
    if (playlist) {
      setPlaylist({
        ...playlist,
        songs: (playlist.songs as any[]).filter((s) => (typeof s === "string" ? s !== songId : s._id !== songId)),
      })
    }
  }

  return { playlist, loading, addSong, removeSong }
}
