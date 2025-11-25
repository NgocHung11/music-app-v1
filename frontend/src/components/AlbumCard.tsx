"use client"

import type React from "react"
import { View, Text, Image, TouchableOpacity, StyleSheet, Dimensions } from "react-native"
import { Ionicons } from "@expo/vector-icons"
import { COLORS, BORDER_RADIUS, SHADOWS } from "../constants/theme"
import type { Album } from "../types"
import { getArtistName, getCoverImage } from "../types"
import { useState } from "react"

const { width } = Dimensions.get("window")
const CARD_WIDTH = width * 0.4

const PLACEHOLDER_IMAGE = "https://via.placeholder.com/300x300.png?text=No+Cover"

type Props = {
  album: Album
  onPress: () => void
}

const AlbumCard: React.FC<Props> = ({ album, onPress }) => {
  const [imageError, setImageError] = useState(false)
  const coverImageUrl = getCoverImage(album)
  const imageSource = imageError ? PLACEHOLDER_IMAGE : coverImageUrl

  return (
    <TouchableOpacity style={styles.container} onPress={onPress} activeOpacity={0.8}>
      <View style={styles.imageWrapper}>
        <Image source={{ uri: imageSource }} style={styles.image} onError={() => setImageError(true)} />
        <View style={styles.overlay}>
          <Ionicons name="play-circle" size={40} color="rgba(255,255,255,0.9)" />
        </View>
      </View>
      <Text style={styles.title} numberOfLines={1}>
        {album.title}
      </Text>
      <Text style={styles.artist} numberOfLines={1}>
        {getArtistName(album.artist)}
      </Text>
      <Text style={styles.meta}>{album.totalTracks} tracks</Text>
    </TouchableOpacity>
  )
}

const styles = StyleSheet.create({
  container: {
    width: CARD_WIDTH,
    marginRight: 16,
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
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0,0,0,0.3)",
    alignItems: "center",
    justifyContent: "center",
    opacity: 0,
  },
  title: {
    color: COLORS.text,
    fontSize: 14,
    fontWeight: "700",
    marginTop: 10,
    letterSpacing: 0.3,
  },
  artist: {
    color: COLORS.textSecondary,
    fontSize: 12,
    marginTop: 4,
    letterSpacing: 0.2,
  },
  meta: {
    color: COLORS.textMuted,
    fontSize: 11,
    marginTop: 2,
  },
})

export default AlbumCard
