"use client"

import {
  View,
  Text,
  Image,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
  ActivityIndicator,
  Modal,
  FlatList,
  Alert,
} from "react-native"
import { usePlayer } from "../context/PlayerContext"
import { useFavorite } from "../hooks/useFavorite"
import { Ionicons } from "@expo/vector-icons"
import { LinearGradient } from "expo-linear-gradient"
import { useNavigation } from "@react-navigation/native"
import ProgressBar from "../components/ProgressBar"
import { COLORS, GRADIENTS, BORDER_RADIUS, SHADOWS } from "../constants/theme"
import { useState } from "react"
import { playlistApi } from "../api"
import type { Playlist } from "../types"

const { width } = Dimensions.get("window")

const PLACEHOLDER_IMAGE = "https://via.placeholder.com/300x300.png?text=No+Cover"

export default function PlayerScreen() {
  const navigation = useNavigation<any>()
  const {
    currentSong,
    isPlaying,
    isLoading,
    positionMillis,
    durationMillis,
    shuffle,
    repeatMode,
    togglePlay,
    nextSong,
    prevSong,
    toggleShuffle,
    toggleRepeat,
  } = usePlayer()

  const { isFavorite, toggleFavorite } = useFavorite("song", currentSong?._id || "")
  const [imageError, setImageError] = useState(false)

  const [showPlaylistModal, setShowPlaylistModal] = useState(false)
  const [playlists, setPlaylists] = useState<Playlist[]>([])
  const [loadingPlaylists, setLoadingPlaylists] = useState(false)
  const [addingToPlaylist, setAddingToPlaylist] = useState<string | null>(null)

  const fetchPlaylists = async () => {
    setLoadingPlaylists(true)
    try {
      const res = await playlistApi.getMyPlaylists()
      console.log("[v0] PlayerScreen raw response:", JSON.stringify(res.data))
      const playlistsData = res.data?.playlists ?? res.data ?? []
      console.log("[v0] PlayerScreen playlists fetched:", Array.isArray(playlistsData) ? playlistsData.length : 0)
      setPlaylists(Array.isArray(playlistsData) ? playlistsData : [])
    } catch (error) {
      console.warn("[v0] fetchPlaylists error", error)
    } finally {
      setLoadingPlaylists(false)
    }
  }

  const handleOpenPlaylistModal = () => {
    setShowPlaylistModal(true)
    fetchPlaylists()
  }

  const handleAddToPlaylist = async (playlistId: string) => {
    if (!currentSong) return

    setAddingToPlaylist(playlistId)
    try {
      await playlistApi.addSong(playlistId, currentSong._id)
      Alert.alert("Success", "Song added to playlist")
      setShowPlaylistModal(false)
    } catch (error: any) {
      if (error.response?.status === 400) {
        Alert.alert("Already added", "This song is already in the playlist")
      } else {
        Alert.alert("Error", "Failed to add song to playlist")
      }
    } finally {
      setAddingToPlaylist(null)
    }
  }

  const handleNavigateToPlaylist = (playlistId: string) => {
    setShowPlaylistModal(false)
    // Navigate to Library tab first, then to Playlist screen
    navigation.navigate("Library", {
      screen: "Playlist",
      params: { playlistId },
    })
  }

  if (!currentSong) {
    return (
      <LinearGradient colors={GRADIENTS.background} style={styles.emptyContainer}>
        <Ionicons name="headset-outline" size={96} color={COLORS.primary} style={{ marginBottom: 24 }} />
        <Text style={styles.emptyTitle}>No song playing</Text>
        <Text style={styles.emptySubtitle}>Choose a song from your library to start listening</Text>
        <TouchableOpacity style={styles.browseBtn} onPress={() => navigation.navigate("Home")}>
          <Text style={styles.browseBtnText}>Browse Music</Text>
        </TouchableOpacity>
      </LinearGradient>
    )
  }

  const getRepeatIcon = () => {
    if (repeatMode === "one") return "repeat-outline"
    return "repeat"
  }

  const coverUrl = currentSong.coverUrl || PLACEHOLDER_IMAGE
  const imageSource = imageError ? PLACEHOLDER_IMAGE : coverUrl

  return (
    <LinearGradient colors={GRADIENTS.background} style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.headerBtn}>
          <Ionicons name="chevron-down" size={28} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Now Playing</Text>
        <TouchableOpacity style={styles.headerBtn}>
          <Ionicons name="ellipsis-horizontal" size={24} color="#fff" />
        </TouchableOpacity>
      </View>

      {/* Cover Art */}
      <View style={styles.coverContainer}>
        <View style={styles.coverWrapper}>
          <Image source={{ uri: imageSource }} style={styles.cover} onError={() => setImageError(true)} />
          {isLoading && (
            <View style={styles.coverLoadingOverlay}>
              <ActivityIndicator size="large" color={COLORS.primary} />
            </View>
          )}
        </View>
      </View>

      {/* Song Info */}
      <View style={styles.infoContainer}>
        <View style={styles.infoRow}>
          <View style={styles.infoText}>
            <Text style={styles.title} numberOfLines={1}>
              {currentSong.title}
            </Text>
            <Text style={styles.artist} numberOfLines={1}>
              {currentSong.artist}
            </Text>
          </View>
          <TouchableOpacity onPress={toggleFavorite} style={styles.favoriteBtn}>
            <Ionicons
              name={isFavorite ? "heart" : "heart-outline"}
              size={28}
              color={isFavorite ? COLORS.error : COLORS.text}
            />
          </TouchableOpacity>
        </View>
      </View>

      {/* Progress Bar */}
      <View style={styles.progressContainer}>
        <ProgressBar positionMillis={positionMillis} durationMillis={durationMillis} />
      </View>

      {/* Controls */}
      <View style={styles.controls}>
        <TouchableOpacity onPress={toggleShuffle} style={styles.secondaryBtn}>
          <Ionicons name="shuffle" size={24} color={shuffle ? COLORS.primary : COLORS.textSecondary} />
        </TouchableOpacity>

        <TouchableOpacity onPress={prevSong} style={styles.controlBtn} disabled={isLoading}>
          <Ionicons name="play-skip-back" size={32} color={isLoading ? COLORS.textMuted : "#fff"} />
        </TouchableOpacity>

        <TouchableOpacity onPress={togglePlay} style={styles.playBtn} disabled={isLoading}>
          <LinearGradient colors={GRADIENTS.primary} style={styles.playBtnGradient}>
            {isLoading ? (
              <ActivityIndicator size="small" color="#fff" />
            ) : (
              <Ionicons name={isPlaying ? "pause" : "play"} size={36} color="#fff" />
            )}
          </LinearGradient>
        </TouchableOpacity>

        <TouchableOpacity onPress={nextSong} style={styles.controlBtn} disabled={isLoading}>
          <Ionicons name="play-skip-forward" size={32} color={isLoading ? COLORS.textMuted : "#fff"} />
        </TouchableOpacity>

        <TouchableOpacity onPress={toggleRepeat} style={styles.secondaryBtn}>
          <Ionicons
            name={getRepeatIcon() as any}
            size={24}
            color={repeatMode !== "off" ? COLORS.primary : COLORS.textSecondary}
          />
          {repeatMode === "one" && <View style={styles.repeatOneDot} />}
        </TouchableOpacity>
      </View>

      {/* Bottom Actions */}
      <View style={styles.bottomActions}>
        <TouchableOpacity style={styles.actionBtn}>
          <Ionicons name="share-outline" size={22} color={COLORS.textSecondary} />
        </TouchableOpacity>
        <TouchableOpacity style={styles.actionBtn}>
          <Ionicons name="list" size={22} color={COLORS.textSecondary} />
        </TouchableOpacity>
        <TouchableOpacity style={styles.actionBtn} onPress={handleOpenPlaylistModal}>
          <Ionicons name="add-circle-outline" size={22} color={COLORS.textSecondary} />
        </TouchableOpacity>
      </View>

      <Modal visible={showPlaylistModal} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Add to Playlist</Text>
              <TouchableOpacity onPress={() => setShowPlaylistModal(false)}>
                <Ionicons name="close" size={24} color={COLORS.text} />
              </TouchableOpacity>
            </View>

            {loadingPlaylists ? (
              <View style={styles.modalLoading}>
                <ActivityIndicator size="large" color={COLORS.primary} />
              </View>
            ) : playlists.length === 0 ? (
              <View style={styles.modalEmpty}>
                <Ionicons name="list-outline" size={48} color={COLORS.textMuted} />
                <Text style={styles.modalEmptyText}>No playlists yet</Text>
                <TouchableOpacity
                  style={styles.createPlaylistBtn}
                  onPress={() => {
                    setShowPlaylistModal(false)
                    navigation.navigate("Library")
                  }}
                >
                  <Text style={styles.createPlaylistBtnText}>Create Playlist</Text>
                </TouchableOpacity>
              </View>
            ) : (
              <FlatList
                data={playlists}
                keyExtractor={(item) => item._id}
                renderItem={({ item }) => {
                  const songsCount = Array.isArray(item.songs) ? item.songs.length : 0
                  return (
                    <View style={styles.playlistItem}>
                      <TouchableOpacity
                        style={styles.playlistRowContent}
                        onPress={() => handleNavigateToPlaylist(item._id)}
                      >
                        <LinearGradient colors={GRADIENTS.primary} style={styles.playlistIcon}>
                          <Ionicons name="musical-notes" size={20} color="#fff" />
                        </LinearGradient>
                        <View style={styles.playlistInfo}>
                          <Text style={styles.playlistName}>{item.name}</Text>
                          <Text style={styles.playlistCount}>{songsCount} songs</Text>
                        </View>
                      </TouchableOpacity>
                      <TouchableOpacity
                        style={styles.addToPlaylistBtn}
                        onPress={() => handleAddToPlaylist(item._id)}
                        disabled={addingToPlaylist === item._id}
                      >
                        {addingToPlaylist === item._id ? (
                          <ActivityIndicator size="small" color={COLORS.primary} />
                        ) : (
                          <Ionicons name="add-circle" size={28} color={COLORS.primary} />
                        )}
                      </TouchableOpacity>
                    </View>
                  )
                }}
                style={{ maxHeight: 300 }}
              />
            )}
          </View>
        </View>
      </Modal>
    </LinearGradient>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: 50,
    paddingHorizontal: 24,
    paddingBottom: 40,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 32,
  },
  emptyTitle: {
    color: COLORS.text,
    fontSize: 24,
    fontWeight: "800",
    textAlign: "center",
    marginBottom: 12,
  },
  emptySubtitle: {
    color: COLORS.textSecondary,
    fontSize: 16,
    textAlign: "center",
    lineHeight: 24,
  },
  browseBtn: {
    backgroundColor: COLORS.primary,
    paddingHorizontal: 32,
    paddingVertical: 14,
    borderRadius: 28,
    marginTop: 32,
  },
  browseBtnText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "700",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 24,
  },
  headerBtn: {
    width: 40,
    height: 40,
    alignItems: "center",
    justifyContent: "center",
  },
  headerTitle: {
    color: COLORS.textSecondary,
    fontSize: 14,
    fontWeight: "600",
    textTransform: "uppercase",
    letterSpacing: 1,
  },
  coverContainer: {
    alignItems: "center",
    marginBottom: 32,
  },
  coverWrapper: {
    ...SHADOWS.large,
    shadowColor: COLORS.primary,
    borderRadius: BORDER_RADIUS.xl,
    position: "relative",
  },
  cover: {
    width: width - 80,
    height: width - 80,
    borderRadius: BORDER_RADIUS.xl,
    backgroundColor: COLORS.backgroundLight,
  },
  coverLoadingOverlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "rgba(0,0,0,0.5)",
    borderRadius: BORDER_RADIUS.xl,
    justifyContent: "center",
    alignItems: "center",
  },
  infoContainer: {
    marginBottom: 24,
  },
  infoRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  infoText: {
    flex: 1,
  },
  title: {
    color: COLORS.text,
    fontSize: 22,
    fontWeight: "800",
    letterSpacing: 0.5,
    marginBottom: 6,
  },
  artist: {
    color: COLORS.textSecondary,
    fontSize: 16,
    fontWeight: "500",
  },
  favoriteBtn: {
    padding: 8,
  },
  progressContainer: {
    marginBottom: 32,
  },
  controls: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 20,
    marginBottom: 32,
  },
  secondaryBtn: {
    width: 44,
    height: 44,
    alignItems: "center",
    justifyContent: "center",
    position: "relative",
  },
  repeatOneDot: {
    position: "absolute",
    bottom: 4,
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: COLORS.primary,
  },
  controlBtn: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: COLORS.backgroundLight,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  playBtn: {
    ...SHADOWS.primary,
  },
  playBtnGradient: {
    width: 72,
    height: 72,
    borderRadius: 36,
    alignItems: "center",
    justifyContent: "center",
  },
  bottomActions: {
    flexDirection: "row",
    justifyContent: "center",
    gap: 40,
  },
  actionBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: COLORS.backgroundLight,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.7)",
    justifyContent: "flex-end",
  },
  modalContent: {
    backgroundColor: COLORS.backgroundLight,
    borderTopLeftRadius: BORDER_RADIUS.xl,
    borderTopRightRadius: BORDER_RADIUS.xl,
    padding: 20,
    maxHeight: "60%",
  },
  modalHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 20,
  },
  modalTitle: {
    color: COLORS.text,
    fontSize: 20,
    fontWeight: "800",
  },
  modalLoading: {
    paddingVertical: 40,
    alignItems: "center",
  },
  modalEmpty: {
    alignItems: "center",
    paddingVertical: 40,
  },
  modalEmptyText: {
    color: COLORS.textMuted,
    fontSize: 16,
    marginTop: 12,
    marginBottom: 20,
  },
  createPlaylistBtn: {
    backgroundColor: COLORS.primary,
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 24,
  },
  createPlaylistBtnText: {
    color: "#fff",
    fontSize: 14,
    fontWeight: "700",
  },
  playlistItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  playlistRowContent: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
  },
  addToPlaylistBtn: {
    padding: 8,
  },
  playlistIcon: {
    width: 48,
    height: 48,
    borderRadius: BORDER_RADIUS.sm,
    alignItems: "center",
    justifyContent: "center",
  },
  playlistInfo: {
    flex: 1,
    marginLeft: 14,
  },
  playlistName: {
    color: COLORS.text,
    fontSize: 16,
    fontWeight: "600",
  },
  playlistCount: {
    color: COLORS.textSecondary,
    fontSize: 13,
    marginTop: 2,
  },
})
