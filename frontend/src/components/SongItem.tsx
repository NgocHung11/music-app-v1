"use client"

import type React from "react"
import { View, Text, Image, TouchableOpacity, StyleSheet, ActivityIndicator } from "react-native"
import { Ionicons } from "@expo/vector-icons"
import { COLORS, BORDER_RADIUS, SHADOWS } from "../constants/theme"
import type { Song } from "../types"
import { getArtistName, getCoverImage } from "../types"
import { usePlayer } from "../context/PlayerContext"
import { useState } from "react"

type Props = {
  song: Song
  onPress: () => void
  showMenu?: boolean
  onMenuPress?: () => void
  index?: number
}

const PLACEHOLDER_IMAGE = "https://via.placeholder.com/300x300.png?text=No+Cover"

const SongItem: React.FC<Props> = ({ song, onPress, showMenu = true, onMenuPress, index }) => {
  const { currentSong, isPlaying, isLoading } = usePlayer()
  const [imageError, setImageError] = useState(false)

  const isCurrentSong = currentSong?._id === song._id
  const isThisSongLoading = isCurrentSong && isLoading

  const formatDuration = (seconds?: number) => {
    if (!seconds) return "--:--"
    const m = Math.floor(seconds / 60)
    const s = seconds % 60
    return `${m}:${s.toString().padStart(2, "0")}`
  }

  const coverImageUrl = getCoverImage(song)
  const imageSource = imageError ? PLACEHOLDER_IMAGE : coverImageUrl

  return (
    <TouchableOpacity
      style={[styles.item, isCurrentSong && styles.itemActive]}
      onPress={onPress}
      activeOpacity={0.7}
      disabled={isLoading}
    >
      {index !== undefined && <Text style={[styles.index, isCurrentSong && styles.indexActive]}>{index + 1}</Text>}
      <View style={styles.coverWrapper}>
        <Image
          source={{ uri: imageSource }}
          style={styles.cover}
          onError={() => setImageError(true)}
          defaultSource={{ uri: PLACEHOLDER_IMAGE }}
        />
        {isThisSongLoading && (
          <View style={styles.loadingOverlay}>
            <ActivityIndicator size="small" color={COLORS.primary} />
          </View>
        )}
        {isCurrentSong && isPlaying && !isThisSongLoading && (
          <View style={styles.playingOverlay}>
            <Ionicons name="musical-notes" size={20} color={COLORS.primary} />
          </View>
        )}
      </View>
      <View style={styles.meta}>
        <Text numberOfLines={1} style={[styles.title, isCurrentSong && styles.titleActive]}>
          {song.title}
        </Text>
        <View style={styles.subtitleRow}>
          <Text numberOfLines={1} style={styles.artist}>
            {getArtistName(song.artist)}
          </Text>
          <Text style={styles.dot}>•</Text>
          <Text style={styles.duration}>{formatDuration(song.duration)}</Text>
        </View>
      </View>
      {showMenu && (
        <TouchableOpacity onPress={onMenuPress} style={styles.menuBtn}>
          <Ionicons name="ellipsis-vertical" size={20} color={COLORS.textSecondary} />
        </TouchableOpacity>
      )}
    </TouchableOpacity>
  )
}

const styles = StyleSheet.create({
  item: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 10,
    paddingHorizontal: 16,
    marginHorizontal: 12,
    marginVertical: 4,
    backgroundColor: COLORS.surface,
    borderRadius: BORDER_RADIUS.md,
    borderWidth: 1,
    borderColor: COLORS.borderLight,
  },
  itemActive: {
    backgroundColor: COLORS.primaryLight || "rgba(99, 102, 241, 0.1)",
    borderColor: COLORS.primary,
  },
  index: {
    color: COLORS.textSecondary,
    fontSize: 14,
    fontWeight: "600",
    width: 24,
    textAlign: "center",
  },
  indexActive: {
    color: COLORS.primary,
  },
  coverWrapper: {
    ...SHADOWS.small,
    borderRadius: 10,
    position: "relative",
  },
  cover: {
    width: 56,
    height: 56,
    borderRadius: 10,
    backgroundColor: COLORS.backgroundLight,
  },
  loadingOverlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "rgba(0,0,0,0.5)",
    borderRadius: 10,
    justifyContent: "center",
    alignItems: "center",
  },
  playingOverlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "rgba(0,0,0,0.4)",
    borderRadius: 10,
    justifyContent: "center",
    alignItems: "center",
  },
  meta: {
    flex: 1,
    marginLeft: 14,
  },
  title: {
    fontSize: 15,
    fontWeight: "600",
    color: COLORS.text,
    letterSpacing: 0.3,
  },
  titleActive: {
    color: COLORS.primary,
  },
  subtitleRow: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 5,
  },
  artist: {
    color: COLORS.textSecondary,
    fontSize: 13,
    letterSpacing: 0.2,
    flex: 1,
  },
  dot: {
    color: COLORS.textMuted,
    marginHorizontal: 6,
  },
  duration: {
    color: COLORS.textMuted,
    fontSize: 12,
  },
  menuBtn: {
    padding: 8,
  },
})

export default SongItem
