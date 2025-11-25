"use client"

import type React from "react"
import { createContext, useState, useContext, useEffect, useRef, useCallback } from "react"
import { Audio, type AVPlaybackStatus } from "expo-av"
import { songApi } from "../api"
import type { Song } from "../types"
import { getArtistName, getCoverImage } from "../types"

// Định dạng Song cho Player (đã normalize)
export interface PlayerSong {
  _id: string
  title: string
  artist: string
  artistId?: string
  coverUrl: string
  audioUrl: string
  duration?: number
}

// Convert từ API Song sang PlayerSong
export const toPlayerSong = (song: Song): PlayerSong => ({
  _id: song._id,
  title: song.title,
  artist: getArtistName(song.artist),
  artistId: typeof song.artist === "string" ? song.artist : song.artist._id,
  coverUrl: getCoverImage(song),
  audioUrl: song.audioUrl,
  duration: song.duration,
})

interface PlayerContextType {
  currentSong: PlayerSong | null
  isPlaying: boolean
  positionMillis: number
  durationMillis: number | null
  songList: PlayerSong[]
  currentIndex: number
  // Shuffle & Repeat
  shuffle: boolean
  repeatMode: "off" | "all" | "one"
  // Actions
  setQueue: (songs: PlayerSong[], startIndex?: number) => Promise<void>
  playSongs: (songs: Song[], startIndex?: number) => Promise<void>
  togglePlay: () => Promise<void>
  nextSong: () => Promise<void>
  prevSong: () => Promise<void>
  seekTo: (positionMillis: number) => Promise<void>
  toggleShuffle: () => void
  toggleRepeat: () => void
  addToQueue: (song: PlayerSong) => void
  clearQueue: () => void
}

const PlayerContext = createContext<PlayerContextType | undefined>(undefined)

export const PlayerProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [songList, setSongList] = useState<PlayerSong[]>([])
  const [currentIndex, setCurrentIndex] = useState(0)
  const [currentSong, setCurrentSong] = useState<PlayerSong | null>(null)
  const [isPlaying, setIsPlaying] = useState(false)
  const [positionMillis, setPositionMillis] = useState(0)
  const [durationMillis, setDurationMillis] = useState<number | null>(null)
  const [shuffle, setShuffle] = useState(false)
  const [repeatMode, setRepeatMode] = useState<"off" | "all" | "one">("off")

  const soundRef = useRef<Audio.Sound | null>(null)
  const isChangingRef = useRef(false)
  const playStartTimeRef = useRef<number>(0)

  useEffect(() => {
    // Cấu hình Audio
    Audio.setAudioModeAsync({
      allowsRecordingIOS: false,
      staysActiveInBackground: true,
      playsInSilentModeIOS: true,
    })

    return () => {
      if (soundRef.current) soundRef.current.unloadAsync()
    }
  }, [])

  const recordPlayHistory = useCallback(async (song: PlayerSong, duration: number) => {
    try {
      await songApi.recordPlay(song._id, duration)
    } catch (e) {
      console.warn("Failed to record play history", e)
    }
  }, [])

  const onPlaybackStatusUpdate = useCallback(
    async (status: AVPlaybackStatus) => {
      if (!status || !("isLoaded" in status) || !status.isLoaded) return

      setIsPlaying(status.isPlaying ?? false)
      setPositionMillis(status.positionMillis ?? 0)
      setDurationMillis(status.durationMillis ?? null)

      // Khi bài hát kết thúc
      if (status.didJustFinish && !isChangingRef.current) {
        isChangingRef.current = true

        // Ghi lại lịch sử nghe
        if (currentSong) {
          const playedDuration = Date.now() - playStartTimeRef.current
          recordPlayHistory(currentSong, playedDuration)
        }

        // Xử lý repeat mode
        if (repeatMode === "one") {
          await soundRef.current?.setPositionAsync(0)
          await soundRef.current?.playAsync()
        } else {
          await nextSong()
        }
        isChangingRef.current = false
      }
    },
    [currentSong, repeatMode],
  )

  const playSong = async (song: PlayerSong) => {
    try {
      if (soundRef.current) {
        await soundRef.current.unloadAsync()
      }

      const { sound } = await Audio.Sound.createAsync({ uri: song.audioUrl }, { shouldPlay: true })
      soundRef.current = sound
      sound.setOnPlaybackStatusUpdate(onPlaybackStatusUpdate)

      setCurrentSong(song)
      setIsPlaying(true)
      setPositionMillis(0)
      playStartTimeRef.current = Date.now()
    } catch (err) {
      console.warn("playSong error:", err)
    }
  }

  const setQueue = async (songs: PlayerSong[], startIndex = 0) => {
    if (!songs || songs.length === 0) return
    setSongList(songs)
    setCurrentIndex(startIndex)
    await playSong(songs[startIndex])
  }

  // Helper để convert và play từ API songs
  const playSongs = async (songs: Song[], startIndex = 0) => {
    const playerSongs = songs.map(toPlayerSong)
    await setQueue(playerSongs, startIndex)
  }

  const togglePlay = async () => {
    const sound = soundRef.current
    if (!sound) return

    const status = await sound.getStatusAsync()
    if (!status.isLoaded) return

    if (status.isPlaying) {
      await sound.pauseAsync()
      setIsPlaying(false)
    } else {
      await sound.playAsync()
      setIsPlaying(true)
    }
  }

  const getNextIndex = useCallback(() => {
    if (songList.length === 0) return 0

    if (shuffle) {
      let nextIdx = Math.floor(Math.random() * songList.length)
      // Đảm bảo không chọn bài hiện tại nếu có nhiều hơn 1 bài
      while (nextIdx === currentIndex && songList.length > 1) {
        nextIdx = Math.floor(Math.random() * songList.length)
      }
      return nextIdx
    }

    const next = currentIndex + 1
    if (next >= songList.length) {
      return repeatMode === "all" ? 0 : currentIndex
    }
    return next
  }, [songList.length, shuffle, currentIndex, repeatMode])

  const nextSong = async () => {
    if (songList.length === 0) return
    const nextIdx = getNextIndex()
    if (nextIdx !== currentIndex || repeatMode !== "off") {
      setCurrentIndex(nextIdx)
      await playSong(songList[nextIdx])
    }
  }

  const prevSong = async () => {
    if (songList.length === 0) return

    // Nếu đã phát > 3 giây, quay lại đầu bài
    if (positionMillis > 3000) {
      await soundRef.current?.setPositionAsync(0)
      return
    }

    const prev = (currentIndex - 1 + songList.length) % songList.length
    setCurrentIndex(prev)
    await playSong(songList[prev])
  }

  const seekTo = async (position: number) => {
    if (soundRef.current) {
      await soundRef.current.setPositionAsync(position)
    }
  }

  const toggleShuffle = () => setShuffle((prev) => !prev)

  const toggleRepeat = () => {
    setRepeatMode((prev) => {
      if (prev === "off") return "all"
      if (prev === "all") return "one"
      return "off"
    })
  }

  const addToQueue = (song: PlayerSong) => {
    setSongList((prev) => [...prev, song])
  }

  const clearQueue = () => {
    setSongList([])
    setCurrentIndex(0)
    setCurrentSong(null)
    if (soundRef.current) {
      soundRef.current.unloadAsync()
      soundRef.current = null
    }
  }

  return (
    <PlayerContext.Provider
      value={{
        currentSong,
        isPlaying,
        positionMillis,
        durationMillis,
        songList,
        currentIndex,
        shuffle,
        repeatMode,
        setQueue,
        playSongs,
        togglePlay,
        nextSong,
        prevSong,
        seekTo,
        toggleShuffle,
        toggleRepeat,
        addToQueue,
        clearQueue,
      }}
    >
      {children}
    </PlayerContext.Provider>
  )
}

export const usePlayer = () => {
  const ctx = useContext(PlayerContext)
  if (!ctx) throw new Error("usePlayer must be used inside PlayerProvider")
  return ctx
}
