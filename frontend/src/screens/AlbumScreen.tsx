"use client"

import { useEffect, useState } from "react"
import {
  View,
  Text,
  Image,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  Dimensions,
} from "react-native"
import { LinearGradient } from "expo-linear-gradient"
import { Ionicons } from "@expo/vector-icons"
import { SafeAreaView } from "react-native-safe-area-context"
import { useNavigation, useRoute } from "@react-navigation/native"
import { albumApi } from "../api"
import { usePlayer } from "../context/PlayerContext"
import { useFavorite } from "../hooks/useFavorite"
import type { Album, Song } from "../types"
import { getArtistName, getCoverImage } from "../types"
import { COLORS, GRADIENTS, BORDER_RADIUS, SHADOWS } from "../constants/theme"
import SongItem from "../components/SongItem"

const { width } = Dimensions.get("window")
const COVER_SIZE = width * 0.6

export default function AlbumScreen() {
  const navigation = useNavigation<any>()
  const route = useRoute<any>()
  const { album: initialAlbum } = route.params || {}

  const [album, setAlbum] = useState<Album | null>(initialAlbum)
  const [songs, setSongs] = useState<Song[]>([])
  const [loading, setLoading] = useState(true)

  const { playSongs } = usePlayer()
  const { isFavorite, toggleFavorite, loading: favLoading } = useFavorite("album", album?._id || "")

  useEffect(() => {
    const fetchAlbumData = async () => {
      if (!album?._id) return
      try {
        const [albumRes, songsRes] = await Promise.all([albumApi.getById(album._id), albumApi.getSongs(album._id)])
        setAlbum(albumRes.data.album)
        setSongs(songsRes.data.songs ?? [])
      } catch (error) {
        console.warn("fetchAlbumData error", error)
      } finally {
        setLoading(false)
      }
    }
    fetchAlbumData()
  }, [album?._id])

  const handlePlayAll = () => {
    if (songs.length > 0) {
      playSongs(songs, 0)
    }
  }

  const handleShufflePlay = () => {
    if (songs.length > 0) {
      const randomIndex = Math.floor(Math.random() * songs.length)
      playSongs(songs, randomIndex)
    }
  }

  const formatDuration = (seconds: number) => {
    const hours = Math.floor(seconds / 3600)
    const minutes = Math.floor((seconds % 3600) / 60)
    if (hours > 0) return `${hours}h ${minutes}m`
    return `${minutes} min`
  }

  if (loading || !album) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={COLORS.primary} />
      </View>
    )
  }

  return (
    <SafeAreaView style={styles.container} edges={["top"]}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 140 }}>
        {/* Header with back button */}
        <View style={styles.header}>
          <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
            <Ionicons name="arrow-back" size={24} color="#fff" />
          </TouchableOpacity>
          <TouchableOpacity style={styles.menuBtn}>
            <Ionicons name="ellipsis-horizontal" size={24} color="#fff" />
          </TouchableOpacity>
        </View>

        {/* Album Cover */}
        <View style={styles.coverContainer}>
          <View style={styles.coverWrapper}>
            <Image source={{ uri: getCoverImage(album) }} style={styles.cover} />
          </View>
        </View>

        {/* Album Info */}
        <View style={styles.infoContainer}>
          <Text style={styles.title}>{album.title}</Text>
          <TouchableOpacity
            onPress={() => {
              if (typeof album.artist !== "string") {
                navigation.navigate("Artist", { artist: album.artist })
              }
            }}
          >
            <Text style={styles.artist}>{getArtistName(album.artist)}</Text>
          </TouchableOpacity>
          <View style={styles.metaRow}>
            <Text style={styles.meta}>
              {album.releaseDate ? new Date(album.releaseDate).getFullYear() : ""} • {album.totalTracks} songs •{" "}
              {formatDuration(album.totalDuration)}
            </Text>
          </View>
        </View>

        {/* Action Buttons */}
        <View style={styles.actions}>
          <TouchableOpacity
            style={[styles.favoriteBtn, isFavorite && styles.favoriteBtnActive]}
            onPress={toggleFavorite}
            disabled={favLoading}
          >
            <Ionicons
              name={isFavorite ? "heart" : "heart-outline"}
              size={24}
              color={isFavorite ? COLORS.error : "#fff"}
            />
          </TouchableOpacity>

          <TouchableOpacity style={styles.shuffleBtn} onPress={handleShufflePlay}>
            <Ionicons name="shuffle" size={22} color="#fff" />
          </TouchableOpacity>

          <TouchableOpacity style={styles.playAllBtn} onPress={handlePlayAll}>
            <LinearGradient colors={GRADIENTS.primary} style={styles.playAllGradient}>
              <Ionicons name="play" size={28} color="#fff" />
            </LinearGradient>
          </TouchableOpacity>

          <TouchableOpacity style={styles.downloadBtn}>
            <Ionicons name="download-outline" size={24} color="#fff" />
          </TouchableOpacity>

          <TouchableOpacity style={styles.shareBtn}>
            <Ionicons name="share-outline" size={24} color="#fff" />
          </TouchableOpacity>
        </View>

        {/* Songs List */}
        <View style={styles.songsList}>
          {songs.map((song, index) => (
            <SongItem key={song._id} song={song} index={index} onPress={() => playSongs(songs, index)} />
          ))}
        </View>
      </ScrollView>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  loadingContainer: {
    flex: 1,
    backgroundColor: COLORS.background,
    alignItems: "center",
    justifyContent: "center",
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  backBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: COLORS.backgroundLight,
    alignItems: "center",
    justifyContent: "center",
  },
  menuBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: COLORS.backgroundLight,
    alignItems: "center",
    justifyContent: "center",
  },
  coverContainer: {
    alignItems: "center",
    marginTop: 16,
    marginBottom: 24,
  },
  coverWrapper: {
    ...SHADOWS.large,
    shadowColor: COLORS.primary,
    borderRadius: BORDER_RADIUS.lg,
  },
  cover: {
    width: COVER_SIZE,
    height: COVER_SIZE,
    borderRadius: BORDER_RADIUS.lg,
    backgroundColor: COLORS.backgroundLight,
  },
  infoContainer: {
    alignItems: "center",
    paddingHorizontal: 20,
  },
  title: {
    color: COLORS.text,
    fontSize: 24,
    fontWeight: "800",
    textAlign: "center",
    letterSpacing: 0.5,
  },
  artist: {
    color: COLORS.primary,
    fontSize: 16,
    fontWeight: "600",
    marginTop: 8,
  },
  metaRow: {
    marginTop: 8,
  },
  meta: {
    color: COLORS.textSecondary,
    fontSize: 14,
  },
  actions: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 16,
    marginTop: 24,
    marginBottom: 24,
    paddingHorizontal: 20,
  },
  favoriteBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: COLORS.backgroundLight,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  favoriteBtnActive: {
    borderColor: COLORS.error,
  },
  shuffleBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: COLORS.backgroundLight,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  playAllBtn: {
    ...SHADOWS.primary,
  },
  playAllGradient: {
    width: 64,
    height: 64,
    borderRadius: 32,
    alignItems: "center",
    justifyContent: "center",
  },
  downloadBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: COLORS.backgroundLight,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  shareBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: COLORS.backgroundLight,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  songsList: {
    paddingTop: 8,
  },
})
