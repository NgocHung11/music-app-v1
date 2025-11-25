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
  artistId: typeof song.artist === "string" ? song.artist : (song.artist as any)?._id,
  coverUrl: getCoverImage(song),
  audioUrl: song.audioUrl,
  duration: song.duration,
})

interface PlayerContextType {
  currentSong: PlayerSong | null
  isPlaying: boolean
  isLoading: boolean
  positionMillis: number
  durationMillis: number | null
  songList: PlayerSong[]
  currentIndex: number
  shuffle: boolean
  repeatMode: "off" | "all" | "one"
  // Actions
  setQueue: (songs: PlayerSong[], startIndex?: number) => Promise<void>
  updateQueuePreserveCurrent: (songs: PlayerSong[]) => Promise<void>
  playSongs: (songs: Song[], startIndex?: number) => Promise<void>
  playSong: (song: Song) => Promise<void>
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
  const [isLoading, setIsLoading] = useState(false)
  const [positionMillis, setPositionMillis] = useState(0)
  const [durationMillis, setDurationMillis] = useState<number | null>(null)
  const [shuffle, setShuffle] = useState(false)
  const [repeatMode, setRepeatMode] = useState<"off" | "all" | "one">("off")

  const soundRef = useRef<Audio.Sound | null>(null)
  const isChangingRef = useRef(false)
  const playStartTimeRef = useRef<number>(0)
  const pendingSongIdRef = useRef<string | null>(null)

  const preloadCacheRef = useRef<Map<string, Audio.Sound>>(new Map())
  const preloadingRef = useRef<Set<string>>(new Set())
  const MAX_PRELOAD_CACHE = 5

  useEffect(() => {
    Audio.setAudioModeAsync({
      allowsRecordingIOS: false,
      staysActiveInBackground: true,
      playsInSilentModeIOS: true,
    })

    return () => {
      if (soundRef.current) soundRef.current.unloadAsync()
      preloadCacheRef.current.forEach((sound) => sound.unloadAsync().catch(() => { }))
      preloadCacheRef.current.clear()
    }
  }, [])

  const preloadSong = useCallback(async (song: PlayerSong) => {
    if (!song?.audioUrl) return
    if (preloadCacheRef.current.has(song._id)) return
    if (preloadingRef.current.has(song._id)) return

    preloadingRef.current.add(song._id)

    try {
      const { sound } = await Audio.Sound.createAsync(
        { uri: song.audioUrl },
        { shouldPlay: false, progressUpdateIntervalMillis: 500 },
      )

      if (preloadCacheRef.current.size >= MAX_PRELOAD_CACHE) {
        const firstKey = preloadCacheRef.current.keys().next().value
        if (firstKey) {
          const oldSound = preloadCacheRef.current.get(firstKey)
          oldSound?.unloadAsync().catch(() => { })
          preloadCacheRef.current.delete(firstKey)
        }
      }

      preloadCacheRef.current.set(song._id, sound)
    } catch (e) {
      // ignore
    } finally {
      preloadingRef.current.delete(song._id)
    }
  }, [])

  useEffect(() => {
    if (songList.length === 0 || currentIndex < 0) return

    const songsToPreload: PlayerSong[] = []

    for (let i = 1; i <= 2; i++) {
      const nextIdx = (currentIndex + i) % songList.length
      if (nextIdx !== currentIndex && songList[nextIdx]) {
        songsToPreload.push(songList[nextIdx])
      }
    }

    const prevIdx = (currentIndex - 1 + songList.length) % songList.length
    if (prevIdx !== currentIndex && songList[prevIdx]) {
      songsToPreload.push(songList[prevIdx])
    }

    songsToPreload.forEach((s) => preloadSong(s))
  }, [currentIndex, songList, preloadSong])

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

      if (status.didJustFinish && !isChangingRef.current) {
        isChangingRef.current = true

        if (currentSong) {
          const playedDuration = Date.now() - playStartTimeRef.current
          recordPlayHistory(currentSong, playedDuration)
        }

        if (repeatMode === "one") {
          await soundRef.current?.setPositionAsync(0)
          await soundRef.current?.playAsync()
        } else {
          await handleNextSong()
        }
        isChangingRef.current = false
      }
    },
    [currentSong, repeatMode],
  )

  const playPlayerSong = async (song: PlayerSong, forceRestart = false) => {
    pendingSongIdRef.current = song._id

    // If same song already loaded & playing, just resume
    if (currentSong?._id === song._id && soundRef.current && !forceRestart) {
      try {
        const status = await soundRef.current.getStatusAsync()
        if (status.isLoaded) {
          // resume from beginning of track for consistent behavior
          soundRef.current.setPositionAsync(0)
          soundRef.current.playAsync()
          setPositionMillis(0)
          setIsPlaying(true)
          playStartTimeRef.current = Date.now()
          return
        }
      } catch (e) {
        // fall through
      }
    }

    setCurrentSong(song)
    setIsPlaying(true)
    setPositionMillis(0)

    const oldSound = soundRef.current
    soundRef.current = null
    if (oldSound) {
      oldSound.setOnPlaybackStatusUpdate(null)
      oldSound.unloadAsync().catch(() => { })
    }

    const preloadedSound = preloadCacheRef.current.get(song._id)
    if (preloadedSound) {
      try {
        preloadCacheRef.current.delete(song._id)

        if (pendingSongIdRef.current !== song._id) {
          preloadedSound.unloadAsync().catch(() => { })
          return
        }

        soundRef.current = preloadedSound
        preloadedSound.setOnPlaybackStatusUpdate(onPlaybackStatusUpdate)

        preloadedSound.setPositionAsync(0)
        preloadedSound.playAsync()
        playStartTimeRef.current = Date.now()
        setIsLoading(false)
        return
      } catch (e) {
        // fall through
      }
    }

    setIsLoading(true)

    try {
      const { sound } = await Audio.Sound.createAsync(
        { uri: song.audioUrl },
        { shouldPlay: true, progressUpdateIntervalMillis: 500 },
      )

      if (pendingSongIdRef.current !== song._id) {
        sound.unloadAsync().catch(() => { })
        return
      }

      soundRef.current = sound
      sound.setOnPlaybackStatusUpdate(onPlaybackStatusUpdate)
      playStartTimeRef.current = Date.now()
    } catch (err) {
      console.warn("playSong error:", err)
      setIsPlaying(false)
    } finally {
      if (pendingSongIdRef.current === song._id) {
        setIsLoading(false)
      }
    }
  }

  // Set queue and start playing at startIndex (current behavior)
  const setQueue = async (songs: PlayerSong[], startIndex = 0) => {
    if (!songs || songs.length === 0) return
    setSongList(songs)
    setCurrentIndex(startIndex)
    await playPlayerSong(songs[startIndex])
  }

  /**
   * Update queue but preserve current playing song without restarting it,
   * if the currentSong exists in the new list. If currentSong is not in the new list,
   * start playing from index 0.
   */
  const updateQueuePreserveCurrent = async (songs: PlayerSong[]) => {
    if (!songs || songs.length === 0) {
      setSongList([])
      setCurrentIndex(0)
      return
    }

    // If no currentSong → behave like normal setQueue
    if (!currentSong) {
      setSongList(songs)
      setCurrentIndex(0)
      await playPlayerSong(songs[0])
      return
    }

    // Find if currentSong exists in new songs
    const idx = songs.findIndex((s) => s._id === currentSong._id)
    if (idx === -1) {
      // current song not present → start from first
      setSongList(songs)
      setCurrentIndex(0)
      await playPlayerSong(songs[0])
      return
    }

    // currentSong exists in list → update songList but don't reload audio
    setSongList(songs)
    setCurrentIndex(idx)

    // do NOT call playPlayerSong to avoid restart. However ensure soundRef is connected
    // to onPlaybackStatusUpdate (it already is). Keep playing state.
    // If for some reason there's no soundRef or not loaded, then attempt to load currentSong
    try {
      const status = await soundRef.current?.getStatusAsync()
      if (!status || !("isLoaded" in status) || !status.isLoaded) {
        // Load currentSong into player silently without resetting playback if possible
        await playPlayerSong(songs[idx])
      }
    } catch (e) {
      // ignore
    }
  }

  const playSongs = async (songs: Song[], startIndex = 0) => {
    const playerSongs = songs.map(toPlayerSong)
    await setQueue(playerSongs, startIndex)
  }

  const playSong = async (song: Song) => {
    const playerSong = toPlayerSong(song)

    const existingIndex = songList.findIndex((s) => s._id === playerSong._id)
    if (existingIndex >= 0) {
      setCurrentIndex(existingIndex)
      await playPlayerSong(playerSong)
    } else {
      setSongList((prev) => [...prev, playerSong])
      setCurrentIndex(songList.length)
      await playPlayerSong(playerSong)
    }
  }

  const togglePlay = async () => {
    const sound = soundRef.current
    if (!sound) return

    try {
      const status = await sound.getStatusAsync()
      if (!status.isLoaded) return

      if (status.isPlaying) {
        await sound.pauseAsync()
        setIsPlaying(false)
      } else {
        await sound.playAsync()
        setIsPlaying(true)
      }
    } catch (err) {
      console.warn("togglePlay error:", err)
    }
  }

  const getNextIndex = useCallback(() => {
    if (songList.length === 0) return 0

    if (shuffle) {
      let nextIdx = Math.floor(Math.random() * songList.length)
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

  const handleNextSong = async () => {
    if (songList.length === 0) return
    const nextIdx = getNextIndex()
    if (nextIdx !== currentIndex || repeatMode !== "off") {
      setCurrentIndex(nextIdx)
      await playPlayerSong(songList[nextIdx])
    }
  }

  const nextSong = async () => {
    await handleNextSong()
  }

  const prevSong = async () => {
    if (songList.length === 0) return

    if (positionMillis > 3000 && soundRef.current) {
      soundRef.current.setPositionAsync(0)
      setPositionMillis(0)
      return
    }

    const prev = (currentIndex - 1 + songList.length) % songList.length
    setCurrentIndex(prev)
    await playPlayerSong(songList[prev])
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
        isLoading,
        positionMillis,
        durationMillis,
        songList,
        currentIndex,
        shuffle,
        repeatMode,
        setQueue,
        updateQueuePreserveCurrent,
        playSongs,
        playSong,
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
