"use client"

import type React from "react"
import { View, Text, Image, TouchableOpacity, StyleSheet, Dimensions } from "react-native"
import { Ionicons } from "@expo/vector-icons"
import { LinearGradient } from "expo-linear-gradient"
import { COLORS, BORDER_RADIUS, SHADOWS } from "../constants/theme"
import type { Song } from "../types"
import { getArtistName, getCoverImage } from "../types"
import { useState } from "react"

const { width } = Dimensions.get("window")
const CARD_WIDTH = (width - 48 - 12) / 2

const PLACEHOLDER_IMAGE = "https://via.placeholder.com/300x300.png?text=No+Cover"

type Props = {
  song: Song
  onPress: () => void
  rank?: number
}

const SongCard: React.FC<Props> = ({ song, onPress, rank }) => {
  const [imageError, setImageError] = useState(false)
  const coverImageUrl = getCoverImage(song)
  const imageSource = imageError ? PLACEHOLDER_IMAGE : coverImageUrl

  return (
    <TouchableOpacity style={styles.container} onPress={onPress} activeOpacity={0.8}>
      <View style={styles.imageWrapper}>
        <Image source={{ uri: imageSource }} style={styles.image} onError={() => setImageError(true)} />
        {rank && (
          <View style={styles.rankBadge}>
            <Text style={styles.rankText}>#{rank}</Text>
          </View>
        )}
        <LinearGradient colors={["transparent", "rgba(0,0,0,0.8)"]} style={styles.gradient} />
        {/* <TouchableOpacity style={styles.playBtn}>
          <Ionicons name="play" size={18} color="#fff" />
        </TouchableOpacity> */}
      </View>
      <Text style={styles.title} numberOfLines={1}>
        {song.title}
      </Text>
      <Text style={styles.artist} numberOfLines={1}>
        {getArtistName(song.artist)}
      </Text>
    </TouchableOpacity>
  )
}

const styles = StyleSheet.create({
  container: {
    width: CARD_WIDTH,
    marginRight: 12,
  },
  imageWrapper: {
    position: "relative",
    borderRadius: BORDER_RADIUS.md,
    overflow: "hidden",
    ...SHADOWS.medium,
  },
  image: {
    width: CARD_WIDTH,
    height: CARD_WIDTH,
    backgroundColor: COLORS.backgroundLight,
  },
  gradient: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    height: 60,
  },
  playBtn: {
    position: "absolute",
    bottom: 8,
    right: 8,
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: COLORS.primary,
    alignItems: "center",
    justifyContent: "center",
    ...SHADOWS.primary,
  },
  rankBadge: {
    position: "absolute",
    top: 8,
    left: 8,
    backgroundColor: COLORS.primary,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: BORDER_RADIUS.sm,
  },
  rankText: {
    color: "#fff",
    fontSize: 12,
    fontWeight: "700",
  },
  title: {
    color: COLORS.text,
    fontSize: 14,
    fontWeight: "600",
    marginTop: 10,
    letterSpacing: 0.3,
  },
  artist: {
    color: COLORS.textSecondary,
    fontSize: 12,
    marginTop: 4,
    letterSpacing: 0.2,
  },
})

export default SongCard
