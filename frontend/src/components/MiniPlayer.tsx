"use client"

import { View, Text, Image, TouchableOpacity, StyleSheet } from "react-native"
import { usePlayer } from "../context/PlayerContext"
import { useNavigation, useNavigationState } from "@react-navigation/native"
import { Ionicons } from "@expo/vector-icons"
import { LinearGradient } from "expo-linear-gradient"
import { useState, useEffect } from "react"

const PLACEHOLDER_IMAGE = "https://via.placeholder.com/300x300.png?text=No+Cover"

const getCurrentTabName = (state: any): string | null => {
  if (!state) return null
  const route = state.routes?.[state.index]
  return route?.name || null
}

export default function MiniPlayer() {
  const { currentSong, isPlaying, togglePlay, nextSong, prevSong } = usePlayer()
  const navigation = useNavigation<any>()
  const [imageError, setImageError] = useState(false)

  const navState = useNavigationState((state) => state)

  const currentTabName = getCurrentTabName(navState)

  useEffect(() => {
    setImageError(false)
  }, [currentSong?._id])

  if (!currentSong || currentTabName === "Player") {
    return null
  }

  const getImageSource = (): string => {
    if (imageError) return PLACEHOLDER_IMAGE
    if (currentSong.coverUrl) return currentSong.coverUrl

    const artist = currentSong.artist
    if (artist && typeof artist === "object") {
      if ((artist as any).avatarUrl) return (artist as any).avatarUrl
      if ((artist as any).avatar) return (artist as any).avatar
    }

    return PLACEHOLDER_IMAGE
  }

  const imageSource = getImageSource()

  const artistName = typeof currentSong.artist === "object" ? (currentSong.artist as any)?.name : currentSong.artist

  return (
    <TouchableOpacity activeOpacity={0.95} onPress={() => navigation.navigate("Player")} style={styles.container}>
      <LinearGradient
        colors={["#1a1a2e", "#16213e"]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.gradient}
      >
        <View style={styles.coverWrapper}>
          <Image source={{ uri: imageSource }} style={styles.cover} onError={() => setImageError(true)} />
        </View>

        <View style={styles.songInfo}>
          <Text style={styles.title} numberOfLines={1}>
            {currentSong.title}
          </Text>
          <Text style={styles.artist} numberOfLines={1}>
            {artistName || "Unknown Artist"}
          </Text>
        </View>

        <View style={styles.controls}>
          <TouchableOpacity
            onPress={(e) => {
              e.stopPropagation()
              prevSong()
            }}
            style={styles.controlBtn}
          >
            <Ionicons name="play-skip-back" size={20} color="#fff" />
          </TouchableOpacity>

          <TouchableOpacity
            onPress={(e) => {
              e.stopPropagation()
              togglePlay()
            }}
            style={styles.playBtn}
          >
            <Ionicons name={isPlaying ? "pause" : "play"} size={22} color="#fff" />
          </TouchableOpacity>

          <TouchableOpacity
            onPress={(e) => {
              e.stopPropagation()
              nextSong()
            }}
            style={styles.controlBtn}
          >
            <Ionicons name="play-skip-forward" size={20} color="#fff" />
          </TouchableOpacity>
        </View>
      </LinearGradient>
    </TouchableOpacity>
  )
}

const styles = StyleSheet.create({
  container: {
    position: "absolute",
    left: 12,
    right: 12,
    bottom: 70,
    borderRadius: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.44,
    shadowRadius: 10,
    elevation: 16,
    overflow: "hidden",
    zIndex: 999,
  },
  gradient: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 12,
    paddingVertical: 12,
  },
  coverWrapper: {
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 5,
    borderRadius: 10,
  },
  cover: {
    width: 52,
    height: 52,
    borderRadius: 10,
    backgroundColor: "#2a2a3e",
  },
  songInfo: {
    flex: 1,
    marginLeft: 14,
    justifyContent: "center",
  },
  title: {
    color: "#fff",
    fontWeight: "700",
    fontSize: 15,
    letterSpacing: 0.3,
  },
  artist: {
    color: "#b8b8d1",
    fontSize: 13,
    marginTop: 3,
    letterSpacing: 0.2,
  },
  controls: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  controlBtn: {
    padding: 6,
    opacity: 0.85,
  },
  playBtn: {
    backgroundColor: "#4a5fd9",
    width: 38,
    height: 38,
    borderRadius: 19,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#4a5fd9",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.5,
    shadowRadius: 4,
    elevation: 6,
  },
})
