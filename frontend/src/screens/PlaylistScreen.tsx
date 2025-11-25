"use client"

import { useState, useCallback } from "react"
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
  Modal,
} from "react-native"
import { LinearGradient } from "expo-linear-gradient"
import { Ionicons } from "@expo/vector-icons"
import { SafeAreaView } from "react-native-safe-area-context"
import { useNavigation, useRoute, useFocusEffect } from "@react-navigation/native"
import { playlistApi } from "../api"
import { usePlayer, toPlayerSong } from "../context/PlayerContext"
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
  const [songs, setSongs] = useState<Song[]>([])
  const [loading, setLoading] = useState(true)
  const [menuVisible, setMenuVisible] = useState(false)

  const {
    playSongs,
    isPlaying,
    songList,
    currentSong,
    togglePlay,
    shuffle,
    toggleShuffle,
    updateQueuePreserveCurrent,
  } = usePlayer()

  const isCurrentPlaylistPlaying = useCallback(() => {
    if (!currentSong || songs.length === 0) return false
    return songs.some((song) => song._id === currentSong._id)
  }, [currentSong, songs])

  const fetchPlaylist = useCallback(async () => {
    if (!playlistId) return
    try {
      const res = await playlistApi.getById(playlistId)
      const playlistData = res.data.playlist
      setPlaylist(playlistData)

      if (playlistData?.songs && Array.isArray(playlistData.songs)) {
        const processedSongs = playlistData.songs
          .map((item: any) => {
            if (item && item.song && typeof item.song === "object") {
              return item.song as Song
            }
            if (item && item._id && item.title) {
              return item as Song
            }
            return null
          })
          .filter((song: Song | null): song is Song => song !== null)

        setSongs(processedSongs)
      } else {
        setSongs([])
      }
    } catch (error) {
      console.warn("fetchPlaylist error", error)
    } finally {
      setLoading(false)
    }
  }, [playlistId])

  useFocusEffect(
    useCallback(() => {
      fetchPlaylist()
    }, [fetchPlaylist]),
  )

  const handlePlayAll = () => {
    if (songs.length > 0) {
      if (isCurrentPlaylistPlaying() && isPlaying) {
        togglePlay()
      } else if (isCurrentPlaylistPlaying() && !isPlaying) {
        togglePlay()
      } else {
        playSongs(songs, 0)
      }
    }
  }

  const handleShufflePlay = () => {
    if (songs.length === 0) return

    // copy original song objects (Song[])
    let newOrder = [...songs]

    // CASE A: chưa có bài nào đang phát thuộc playlist
    if (!isCurrentPlaylistPlaying()) {
      if (!shuffle) toggleShuffle()

      // shuffle entire array
      newOrder = newOrder.sort(() => Math.random() - 0.5)

      // update UI
      setSongs(newOrder)

      // play first in shuffled list
      playSongs(newOrder, 0)
      return
    }

    // CASE B: đang phát 1 bài trong playlist
    if (currentSong) {
      // playing is PlayerSong
      const playing = currentSong

      // others are Song[] (original objects)
      const others = newOrder.filter((s) => s._id !== playing._id)

      // shuffle others
      others.sort(() => Math.random() - 0.5)

      // Build PlayerSong[] for player: [playing, ...othersConverted]
      const othersPlayer = others.map((s) => toPlayerSong(s))
      const newOrderPlayers = [playing, ...othersPlayer]

      // Update player queue but preserve current playing track (no restart)
      updateQueuePreserveCurrent(newOrderPlayers)

      // Update UI songs (Song[]) — need to include the playing track as Song
      // Build a Song-like object for playing track by mapping minimal fields and casting
      const playingAsSong = {
        _id: playing._id,
        title: playing.title,
        artist: playing.artistId ? (playing.artistId as any) : playing.artist,
        duration: playing.duration ?? 0,
        audioUrl: playing.audioUrl,
        // include minimal required fields to satisfy Song type — cast to any
      } as any as Song

      const newOrderSongs = [playingAsSong, ...others]
      setSongs(newOrderSongs)
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
            setSongs((prev) => prev.filter((s) => s._id !== songId))
          } catch (error) {
            console.warn("Remove song error", error)
          }
        },
      },
    ])
  }

  const handleDeletePlaylist = () => {
    setMenuVisible(false)
    Alert.alert(
      "Delete Playlist",
      `Are you sure you want to delete "${playlist?.name}"? This action cannot be undone.`,
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: async () => {
            try {
              await playlistApi.delete(playlistId)
              navigation.goBack()
            } catch (error) {
              console.warn("Delete playlist error", error)
              Alert.alert("Error", "Failed to delete playlist")
            }
          },
        },
      ],
    )
  }

  const handleEditPlaylist = () => {
    setMenuVisible(false)
    navigation.navigate("EditPlaylist", { playlistId, playlist })
  }

  const formatDuration = (seconds: number) => {
    const hours = Math.floor(seconds / 3600)
    const minutes = Math.floor((seconds % 3600) / 60)
    if (hours > 0) return `${hours}h ${minutes}m`
    return `${minutes} min`
  }

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

  const isThisPlaylistPlaying = isCurrentPlaylistPlaying()
  const showPauseIcon = isThisPlaylistPlaying && isPlaying

  return (
    <SafeAreaView style={styles.container} edges={["top"]}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 140 }}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
            <Ionicons name="arrow-back" size={24} color="#fff" />
          </TouchableOpacity>
          <TouchableOpacity style={styles.menuBtn} onPress={() => setMenuVisible(true)}>
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
          <TouchableOpacity style={[styles.shuffleBtn, shuffle && styles.shuffleBtnActive]} onPress={handleShufflePlay}>
            <Ionicons name="shuffle" size={22} color={shuffle ? COLORS.primary : "#fff"} />
          </TouchableOpacity>

          <TouchableOpacity style={styles.playAllBtn} onPress={handlePlayAll}>
            <LinearGradient colors={GRADIENTS.primary} style={styles.playAllGradient}>
              <Ionicons name={showPauseIcon ? "pause" : "play"} size={28} color="#fff" />
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

      {/* Menu Modal */}
      <Modal visible={menuVisible} transparent animationType="fade" onRequestClose={() => setMenuVisible(false)}>
        <TouchableOpacity style={styles.modalOverlay} activeOpacity={1} onPress={() => setMenuVisible(false)}>
          <View style={styles.menuContainer}>
            <TouchableOpacity style={styles.menuItem} onPress={handleEditPlaylist}>
              <Ionicons name="pencil" size={22} color={COLORS.text} />
              <Text style={styles.menuItemText}>Edit Playlist</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.menuItem}
              onPress={() => {
                setMenuVisible(false)
                navigation.navigate("AddSongs", { playlistId })
              }}
            >
              <Ionicons name="add-circle-outline" size={22} color={COLORS.text} />
              <Text style={styles.menuItemText}>Add Songs</Text>
            </TouchableOpacity>

            <View style={styles.menuDivider} />

            <TouchableOpacity style={styles.menuItem} onPress={handleDeletePlaylist}>
              <Ionicons name="trash-outline" size={22} color={COLORS.error} />
              <Text style={[styles.menuItemText, { color: COLORS.error }]}>Delete Playlist</Text>
            </TouchableOpacity>
          </View>
        </TouchableOpacity>
      </Modal>
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
  shuffleBtnActive: {
    borderColor: COLORS.primary,
    backgroundColor: `${COLORS.primary}20`,
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
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.6)",
    justifyContent: "flex-end",
  },
  menuContainer: {
    backgroundColor: COLORS.backgroundLight,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingVertical: 16,
    paddingBottom: 40,
  },
  menuItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 14,
    paddingHorizontal: 20,
    gap: 14,
  },
  menuItemText: {
    color: COLORS.text,
    fontSize: 16,
    fontWeight: "500",
  },
  menuDivider: {
    height: 1,
    backgroundColor: COLORS.border,
    marginVertical: 8,
    marginHorizontal: 20,
  },
})
