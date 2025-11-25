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
  Alert,
  Dimensions,
} from "react-native"
import { LinearGradient } from "expo-linear-gradient"
import { Ionicons } from "@expo/vector-icons"
import { SafeAreaView } from "react-native-safe-area-context"
import { useNavigation, useRoute } from "@react-navigation/native"
import { playlistApi } from "../api"
import { usePlayer } from "../context/PlayerContext"
import type { Playlist, Song } from "../types"
import { getCoverImage } from "../types"
import { COLORS, GRADIENTS, BORDER_RADIUS, SHADOWS } from "../constants/theme"
import SongItem from "../components/SongItem"

const { width } = Dimensions.get("window")
const COVER_SIZE = width * 0.5

export default function PlaylistScreen() {
  const navigation = useNavigation<any>()
  const route = useRoute<any>()
  const { playlistId } = route.params || {}

  const [playlist, setPlaylist] = useState<Playlist | null>(null)
  const [loading, setLoading] = useState(true)

  const { playSongs } = usePlayer()

  useEffect(() => {
    const fetchPlaylist = async () => {
      if (!playlistId) return
      try {
        const res = await playlistApi.getById(playlistId)
        setPlaylist(res.data.playlist)
      } catch (error) {
        console.warn("fetchPlaylist error", error)
      } finally {
        setLoading(false)
      }
    }
    fetchPlaylist()
  }, [playlistId])

  const handlePlayAll = () => {
    if (playlist?.songs && (playlist.songs as Song[]).length > 0) {
      playSongs(playlist.songs as Song[], 0)
    }
  }

  const handleRemoveSong = async (songId: string) => {
    Alert.alert("Remove Song", "Are you sure you want to remove this song from the playlist?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Remove",
        style: "destructive",
        onPress: async () => {
          try {
            await playlistApi.removeSong(playlistId, songId)
            setPlaylist((prev) => {
              if (!prev) return prev
              return {
                ...prev,
                songs: (prev.songs as Song[]).filter((s) => s._id !== songId),
              }
            })
          } catch (error) {
            console.warn("Remove song error", error)
          }
        },
      },
    ])
  }

  const formatDuration = (seconds: number) => {
    const hours = Math.floor(seconds / 3600)
    const minutes = Math.floor((seconds % 3600) / 60)
    if (hours > 0) return `${hours}h ${minutes}m`
    return `${minutes} min`
  }

  const songs = (playlist?.songs || []) as Song[]

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={COLORS.primary} />
      </View>
    )
  }

  if (!playlist) {
    return (
      <View style={styles.loadingContainer}>
        <Text style={styles.errorText}>Playlist not found</Text>
      </View>
    )
  }

  return (
    <SafeAreaView style={styles.container} edges={["top"]}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 140 }}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
            <Ionicons name="arrow-back" size={24} color="#fff" />
          </TouchableOpacity>
          <TouchableOpacity style={styles.menuBtn}>
            <Ionicons name="ellipsis-horizontal" size={24} color="#fff" />
          </TouchableOpacity>
        </View>

        {/* Playlist Cover */}
        <View style={styles.coverContainer}>
          {songs.length > 0 ? (
            <View style={styles.coverGrid}>
              {songs.slice(0, 4).map((song, index) => (
                <Image key={song._id} source={{ uri: getCoverImage(song) }} style={styles.gridImage} />
              ))}
            </View>
          ) : (
            <LinearGradient colors={GRADIENTS.primary} style={styles.emptyCover}>
              <Ionicons name="musical-notes" size={64} color="#fff" />
            </LinearGradient>
          )}
        </View>

        {/* Playlist Info */}
        <View style={styles.infoContainer}>
          <Text style={styles.title}>{playlist.name}</Text>
          {playlist.description && <Text style={styles.description}>{playlist.description}</Text>}
          <Text style={styles.meta}>
            {songs.length} songs • {formatDuration(playlist.totalDuration)}
          </Text>
        </View>

        {/* Actions */}
        <View style={styles.actions}>
          <TouchableOpacity style={styles.shuffleBtn}>
            <Ionicons name="shuffle" size={22} color="#fff" />
          </TouchableOpacity>

          <TouchableOpacity style={styles.playAllBtn} onPress={handlePlayAll}>
            <LinearGradient colors={GRADIENTS.primary} style={styles.playAllGradient}>
              <Ionicons name="play" size={28} color="#fff" />
            </LinearGradient>
          </TouchableOpacity>

          <TouchableOpacity style={styles.addBtn} onPress={() => navigation.navigate("AddSongs", { playlistId })}>
            <Ionicons name="add" size={24} color="#fff" />
          </TouchableOpacity>
        </View>

        {/* Songs List */}
        <View style={styles.songsList}>
          {songs.length > 0 ? (
            songs.map((song, index) => (
              <SongItem
                key={song._id}
                song={song}
                index={index}
                onPress={() => playSongs(songs, index)}
                onMenuPress={() => handleRemoveSong(song._id)}
              />
            ))
          ) : (
            <View style={styles.emptyContainer}>
              <Ionicons name="musical-notes-outline" size={64} color={COLORS.textMuted} />
              <Text style={styles.emptyText}>No songs yet</Text>
              <TouchableOpacity
                style={styles.addSongsBtn}
                onPress={() => navigation.navigate("AddSongs", { playlistId })}
              >
                <Ionicons name="add" size={20} color="#fff" />
                <Text style={styles.addSongsBtnText}>Add Songs</Text>
              </TouchableOpacity>
            </View>
          )}
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
  errorText: {
    color: COLORS.error,
    fontSize: 16,
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
    marginVertical: 24,
  },
  coverGrid: {
    width: COVER_SIZE,
    height: COVER_SIZE,
    flexDirection: "row",
    flexWrap: "wrap",
    borderRadius: BORDER_RADIUS.lg,
    overflow: "hidden",
    ...SHADOWS.large,
  },
  gridImage: {
    width: COVER_SIZE / 2,
    height: COVER_SIZE / 2,
    backgroundColor: COLORS.backgroundLight,
  },
  emptyCover: {
    width: COVER_SIZE,
    height: COVER_SIZE,
    borderRadius: BORDER_RADIUS.lg,
    alignItems: "center",
    justifyContent: "center",
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
  description: {
    color: COLORS.textSecondary,
    fontSize: 14,
    textAlign: "center",
    marginTop: 8,
  },
  meta: {
    color: COLORS.textMuted,
    fontSize: 14,
    marginTop: 8,
  },
  actions: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 20,
    marginTop: 24,
    marginBottom: 24,
  },
  shuffleBtn: {
    width: 48,
    height: 48,
    borderRadius: 24,
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
  addBtn: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: COLORS.backgroundLight,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  songsList: {
    paddingTop: 8,
  },
  emptyContainer: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 60,
  },
  emptyText: {
    color: COLORS.textMuted,
    fontSize: 16,
    marginTop: 16,
    marginBottom: 24,
  },
  addSongsBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    backgroundColor: COLORS.primary,
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 24,
  },
  addSongsBtnText: {
    color: "#fff",
    fontSize: 14,
    fontWeight: "700",
  },
})
