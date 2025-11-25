import type React from "react"
import { View, Text, Image, TouchableOpacity, StyleSheet } from "react-native"
import { Ionicons } from "@expo/vector-icons"
import { COLORS, BORDER_RADIUS, SHADOWS } from "../constants/theme"
import type { Song } from "../types"
import { getArtistName, getCoverImage } from "../types"

type Props = {
  song: Song
  onPress: () => void
  showMenu?: boolean
  onMenuPress?: () => void
  index?: number
}

const SongItem: React.FC<Props> = ({ song, onPress, showMenu = true, onMenuPress, index }) => {
  const formatDuration = (seconds?: number) => {
    if (!seconds) return "--:--"
    const m = Math.floor(seconds / 60)
    const s = seconds % 60
    return `${m}:${s.toString().padStart(2, "0")}`
  }

  return (
    <TouchableOpacity style={styles.item} onPress={onPress} activeOpacity={0.7}>
      {index !== undefined && <Text style={styles.index}>{index + 1}</Text>}
      <View style={styles.coverWrapper}>
        <Image source={{ uri: getCoverImage(song) }} style={styles.cover} />
      </View>
      <View style={styles.meta}>
        <Text numberOfLines={1} style={styles.title}>
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
  index: {
    color: COLORS.textSecondary,
    fontSize: 14,
    fontWeight: "600",
    width: 24,
    textAlign: "center",
  },
  coverWrapper: {
    ...SHADOWS.small,
    borderRadius: 10,
  },
  cover: {
    width: 56,
    height: 56,
    borderRadius: 10,
    backgroundColor: COLORS.backgroundLight,
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
