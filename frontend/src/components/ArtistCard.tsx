"use client"

import type React from "react"
import { View, Text, Image, TouchableOpacity, StyleSheet } from "react-native"
import { LinearGradient } from "expo-linear-gradient"
import { Ionicons } from "@expo/vector-icons"
import { COLORS, SHADOWS, GRADIENTS } from "../constants/theme"
import type { Artist } from "../types"
import { getArtistAvatar, getArtistFollowers } from "../types"
import { useState, useEffect } from "react"
import { favoriteApi } from "../api"

type Props = {
  artist: Artist
  onPress: () => void
  size?: "small" | "medium" | "large"
  style?: any
  showFollowStatus?: boolean
}

const SIZES = {
  small: 80,
  medium: 100,
  large: 120,
}

const ArtistCard: React.FC<Props> = ({ artist, onPress, size = "medium", style, showFollowStatus = true }) => {
  const dimension = SIZES[size]
  const [imageError, setImageError] = useState(false)
  const [isFollowed, setIsFollowed] = useState(false)

  const avatarUrl = getArtistAvatar(artist)
  const isPlaceholder = avatarUrl.includes("placeholder")
  const hasValidImage = !imageError && !isPlaceholder

  const followers = getArtistFollowers(artist)

  useEffect(() => {
    if (showFollowStatus && artist._id) {
      const checkFollowStatus = async () => {
        try {
          const res = await favoriteApi.check("artist", artist._id)
          setIsFollowed(res.data.isFavorite)
        } catch (error) {
          // Silently fail - user might not be logged in
        }
      }
      checkFollowStatus()
    }
  }, [artist._id, showFollowStatus])

  return (
    <TouchableOpacity style={[styles.container, style]} onPress={onPress} activeOpacity={0.8}>
      <View style={[styles.imageWrapper, { width: dimension, height: dimension, borderRadius: dimension / 2 }]}>
        {hasValidImage ? (
          <Image
            source={{ uri: avatarUrl }}
            style={[styles.image, { width: dimension, height: dimension, borderRadius: dimension / 2 }]}
            onError={() => setImageError(true)}
          />
        ) : (
          <LinearGradient
            colors={GRADIENTS.primary}
            style={[styles.placeholder, { width: dimension, height: dimension, borderRadius: dimension / 2 }]}
          >
            <Ionicons name="person" size={dimension * 0.4} color="#fff" />
          </LinearGradient>
        )}
        {showFollowStatus && isFollowed && (
          <View style={styles.followedBadge}>
            <Ionicons name="checkmark-circle" size={20} color={COLORS.primary} />
          </View>
        )}
      </View>
      <Text style={styles.name} numberOfLines={1}>
        {artist.name}
      </Text>
      <Text style={styles.followers}>
        {followers >= 1000 ? `${(followers / 1000).toFixed(1)}K` : followers} followers
      </Text>
    </TouchableOpacity>
  )
}

const styles = StyleSheet.create({
  container: {
    alignItems: "center",
    marginRight: 16,
  },
  imageWrapper: {
    position: "relative",
    ...SHADOWS.medium,
  },
  image: {
    backgroundColor: COLORS.backgroundLight,
  },
  placeholder: {
    alignItems: "center",
    justifyContent: "center",
  },
  followedBadge: {
    position: "absolute",
    bottom: 0,
    right: 0,
    backgroundColor: "#fff",
    borderRadius: 10,
  },
  name: {
    color: COLORS.text,
    fontSize: 13,
    fontWeight: "600",
    marginTop: 10,
    textAlign: "center",
    maxWidth: 100,
  },
  followers: {
    color: COLORS.textMuted,
    fontSize: 11,
    marginTop: 2,
  },
})

export default ArtistCard
