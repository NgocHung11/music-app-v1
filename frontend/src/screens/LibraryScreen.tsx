"use client"

import { useState, useCallback } from "react"
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  RefreshControl,
  Image,
  Alert,
  TextInput,
  Modal,
} from "react-native"
import { LinearGradient } from "expo-linear-gradient"
import { Ionicons } from "@expo/vector-icons"
import { SafeAreaView } from "react-native-safe-area-context"
import { useNavigation, useFocusEffect } from "@react-navigation/native"
import { playlistApi, favoriteApi, userApi } from "../api"
import { usePlayer } from "../context/PlayerContext"
import type { Playlist, Song, Album, Artist } from "../types"
import { getCoverImage } from "../types"
import { COLORS, GRADIENTS, BORDER_RADIUS, SHADOWS } from "../constants/theme"

type TabType = "playlists" | "songs" | "albums" | "artists"

export default function LibraryScreen() {
  const navigation = useNavigation<any>()
  const { playSongs } = usePlayer()

  const [activeTab, setActiveTab] = useState<TabType>("playlists")
  const [refreshing, setRefreshing] = useState(false)
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [newPlaylistName, setNewPlaylistName] = useState("")
  const [newPlaylistDesc, setNewPlaylistDesc] = useState("")

  // Data
  const [playlists, setPlaylists] = useState<Playlist[]>([])
  const [likedSongs, setLikedSongs] = useState<Song[]>([])
  const [likedAlbums, setLikedAlbums] = useState<Album[]>([])
  const [likedArtists, setLikedArtists] = useState<Artist[]>([])
  const [history, setHistory] = useState<any[]>([])

  const fetchData = useCallback(async () => {
    try {
      console.log("[v0] LibraryScreen: Starting to fetch data...")

      const playlistsRes = await playlistApi.getMyPlaylists()
      console.log("[v0] LibraryScreen raw playlists response:", JSON.stringify(playlistsRes.data))

      const playlistsData = playlistsRes.data?.playlists ?? playlistsRes.data ?? []
      console.log(
        "[v0] LibraryScreen playlists count:",
        Array.isArray(playlistsData) ? playlistsData.length : "not array",
      )
      setPlaylists(Array.isArray(playlistsData) ? playlistsData : [])

      const [songsRes, albumsRes, artistsRes, historyRes] = await Promise.all([
        favoriteApi.getLikedSongs(),
        favoriteApi.getLikedAlbums(),
        favoriteApi.getLikedArtists(),
        userApi.getHistory({ limit: 20 }),
      ])

      setLikedSongs(songsRes.data?.songs ?? [])
      setLikedAlbums(albumsRes.data?.albums ?? [])
      setLikedArtists(artistsRes.data?.artists ?? [])
      setHistory(historyRes.data?.history ?? [])
    } catch (error) {
      console.warn("[v0] fetchLibrary error", error)
    }
  }, [])

  useFocusEffect(
    useCallback(() => {
      fetchData()
    }, [fetchData]),
  )

  const onRefresh = async () => {
    setRefreshing(true)
    await fetchData()
    setRefreshing(false)
  }

  const handleCreatePlaylist = async () => {
    if (!newPlaylistName.trim()) {
      Alert.alert("Error", "Please enter a playlist name")
      return
    }
    try {
      const res = await playlistApi.create({
        name: newPlaylistName.trim(),
        description: newPlaylistDesc.trim(),
      })
      const newPlaylist = res.data?.playlist ?? res.data
      console.log("[v0] Playlist created:", newPlaylist?.name)
      if (newPlaylist) {
        setPlaylists((prev) => [...prev, newPlaylist])
      }
      setShowCreateModal(false)
      setNewPlaylistName("")
      setNewPlaylistDesc("")
    } catch (error) {
      console.warn("[v0] Create playlist error", error)
      Alert.alert("Error", "Failed to create playlist")
    }
  }

  const handleDeletePlaylist = (playlist: Playlist) => {
    Alert.alert("Delete Playlist", `Are you sure you want to delete "${playlist.name}"?`, [
      { text: "Cancel", style: "cancel" },
      {
        text: "Delete",
        style: "destructive",
        onPress: async () => {
          try {
            await playlistApi.delete(playlist._id)
            setPlaylists((prev) => prev.filter((p) => p._id !== playlist._id))
          } catch (error) {
            console.warn("Delete playlist error", error)
          }
        },
      },
    ])
  }

  const handleRemoveFavoriteSong = (song: Song) => {
    Alert.alert("Remove from Liked Songs", `Are you sure you want to remove "${song.title}" from your liked songs?`, [
      { text: "Cancel", style: "cancel" },
      {
        text: "Remove",
        style: "destructive",
        onPress: async () => {
          try {
            await favoriteApi.remove("song", song._id)
            setLikedSongs((prev) => prev.filter((s) => s._id !== song._id))
          } catch (error) {
            console.warn("Remove favorite song error", error)
            Alert.alert("Error", "Failed to remove song from favorites")
          }
        },
      },
    ])
  }

  const handleRemoveFavoriteAlbum = (album: Album) => {
    Alert.alert(
      "Remove from Liked Albums",
      `Are you sure you want to remove "${album.title}" from your liked albums?`,
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Remove",
          style: "destructive",
          onPress: async () => {
            try {
              await favoriteApi.remove("album", album._id)
              setLikedAlbums((prev) => prev.filter((a) => a._id !== album._id))
            } catch (error) {
              console.warn("Remove favorite album error", error)
              Alert.alert("Error", "Failed to remove album from favorites")
            }
          },
        },
      ],
    )
  }

  const handleRemoveFavoriteArtist = (artist: Artist) => {
    Alert.alert("Unfollow Artist", `Are you sure you want to unfollow "${artist.name}"?`, [
      { text: "Cancel", style: "cancel" },
      {
        text: "Unfollow",
        style: "destructive",
        onPress: async () => {
          try {
            await favoriteApi.remove("artist", artist._id)
            setLikedArtists((prev) => prev.filter((a) => a._id !== artist._id))
          } catch (error) {
            console.warn("Remove favorite artist error", error)
            Alert.alert("Error", "Failed to unfollow artist")
          }
        },
      },
    ])
  }

  const tabs: { key: TabType; label: string; icon: string }[] = [
    { key: "playlists", label: "Playlists", icon: "list" },
    { key: "songs", label: "Songs", icon: "musical-note" },
    { key: "albums", label: "Albums", icon: "disc" },
    { key: "artists", label: "Artists", icon: "person" },
  ]

  const renderPlaylistItem = ({ item }: { item: Playlist }) => {
    const songsArray = (item.songs || []) as any[]
    const songsCount = songsArray.length
    const firstSong = songsArray.length > 0 ? songsArray[0].song || songsArray[0] : null

    return (
      <TouchableOpacity
        style={styles.playlistItem}
        onPress={() => navigation.navigate("Playlist", { playlistId: item._id })}
        onLongPress={() => handleDeletePlaylist(item)}
      >
        <View style={styles.playlistCover}>
          {firstSong?.coverUrl ? (
            <Image source={{ uri: firstSong.coverUrl }} style={styles.playlistImage} />
          ) : (
            <LinearGradient colors={GRADIENTS.primary} style={styles.playlistImage}>
              <Ionicons name="musical-notes" size={28} color="#fff" />
            </LinearGradient>
          )}
        </View>
        <View style={styles.playlistInfo}>
          <Text style={styles.playlistName} numberOfLines={1}>
            {item.name}
          </Text>
          <Text style={styles.playlistMeta}>{songsCount} songs</Text>
        </View>
        <Ionicons name="chevron-forward" size={20} color={COLORS.textMuted} />
      </TouchableOpacity>
    )
  }

  const renderSongItem = ({ item, index }: { item: Song; index: number }) => (
    <TouchableOpacity
      style={styles.songItem}
      onPress={() => playSongs(likedSongs, index)}
      onLongPress={() => handleRemoveFavoriteSong(item)}
    >
      <Image source={{ uri: getCoverImage(item) }} style={styles.songCover} />
      <View style={styles.songInfo}>
        <Text style={styles.songTitle} numberOfLines={1}>
          {item.title}
        </Text>
        <Text style={styles.songArtist} numberOfLines={1}>
          {typeof item.artist === "string" ? item.artist : item.artist.name}
        </Text>
      </View>
      <TouchableOpacity
        onPress={() => handleRemoveFavoriteSong(item)}
        hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
      >
        <Ionicons name="heart" size={20} color={COLORS.error} />
      </TouchableOpacity>
    </TouchableOpacity>
  )

  const renderAlbumItem = ({ item }: { item: Album }) => (
    <TouchableOpacity
      style={styles.albumItem}
      onPress={() => navigation.navigate("Album", { album: item })}
      onLongPress={() => handleRemoveFavoriteAlbum(item)}
    >
      <Image source={{ uri: getCoverImage(item) }} style={styles.albumCover} />
      <Text style={styles.albumTitle} numberOfLines={1}>
        {item.title}
      </Text>
      <Text style={styles.albumArtist} numberOfLines={1}>
        {typeof item.artist === "string" ? item.artist : item.artist.name}
      </Text>
    </TouchableOpacity>
  )

  const renderArtistItem = ({ item }: { item: Artist }) => (
    <TouchableOpacity
      style={styles.artistItem}
      onPress={() => navigation.navigate("Artist", { artist: item })}
      onLongPress={() => handleRemoveFavoriteArtist(item)}
    >
      {item.avatar ? (
        <Image source={{ uri: item.avatar }} style={styles.artistAvatar} />
      ) : (
        <LinearGradient colors={GRADIENTS.primary} style={styles.artistAvatar}>
          <Ionicons name="person" size={28} color="#fff" />
        </LinearGradient>
      )}
      <Text style={styles.artistName} numberOfLines={1}>
        {item.name}
      </Text>
    </TouchableOpacity>
  )

  return (
    <SafeAreaView style={styles.container} edges={["top", "left", "right"]}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Your Library</Text>
        <TouchableOpacity style={styles.addBtn} onPress={() => setShowCreateModal(true)}>
          <Ionicons name="add" size={24} color="#fff" />
        </TouchableOpacity>
      </View>

      {/* Quick Actions */}
      <View style={styles.quickActions}>
        <TouchableOpacity style={styles.quickAction} onPress={() => navigation.navigate("LikedSongs")}>
          <LinearGradient colors={["#667EEA", "#764BA2"]} style={styles.quickActionIcon}>
            <Ionicons name="heart" size={24} color="#fff" />
          </LinearGradient>
          <View style={styles.quickActionText}>
            <Text style={styles.quickActionTitle}>Liked Songs</Text>
            <Text style={styles.quickActionMeta}>{likedSongs.length} songs</Text>
          </View>
        </TouchableOpacity>

        <TouchableOpacity style={styles.quickAction} onPress={() => navigation.navigate("History")}>
          <LinearGradient colors={["#11998E", "#38EF7D"]} style={styles.quickActionIcon}>
            <Ionicons name="time" size={24} color="#fff" />
          </LinearGradient>
          <View style={styles.quickActionText}>
            <Text style={styles.quickActionTitle}>Recently Played</Text>
            <Text style={styles.quickActionMeta}>{history.length} songs</Text>
          </View>
        </TouchableOpacity>
      </View>

      {/* Tabs */}
      <View style={styles.tabs}>
        {tabs.map((tab) => (
          <TouchableOpacity
            key={tab.key}
            style={[styles.tab, activeTab === tab.key && styles.tabActive]}
            onPress={() => setActiveTab(tab.key)}
          >
            <Ionicons
              name={tab.icon as any}
              size={18}
              color={activeTab === tab.key ? COLORS.primary : COLORS.textSecondary}
            />
            <Text style={[styles.tabText, activeTab === tab.key && styles.tabTextActive]}>{tab.label}</Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Content */}
      <View style={styles.content}>
        {activeTab === "playlists" && (
          <FlatList
            data={playlists}
            keyExtractor={(item) => item._id}
            renderItem={renderPlaylistItem}
            refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={COLORS.primary} />}
            contentContainerStyle={{ paddingBottom: 140 }}
            ListEmptyComponent={
              <View style={styles.emptyContainer}>
                <Ionicons name="list-outline" size={64} color={COLORS.textMuted} />
                <Text style={styles.emptyText}>No playlists yet</Text>
                <TouchableOpacity style={styles.createBtn} onPress={() => setShowCreateModal(true)}>
                  <Text style={styles.createBtnText}>Create Playlist</Text>
                </TouchableOpacity>
              </View>
            }
          />
        )}

        {activeTab === "songs" && (
          <FlatList
            data={likedSongs}
            keyExtractor={(item) => item._id}
            renderItem={renderSongItem}
            refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={COLORS.primary} />}
            contentContainerStyle={{ paddingBottom: 140 }}
            ListEmptyComponent={
              <View style={styles.emptyContainer}>
                <Ionicons name="heart-outline" size={64} color={COLORS.textMuted} />
                <Text style={styles.emptyText}>No liked songs yet</Text>
              </View>
            }
          />
        )}

        {activeTab === "albums" && (
          <FlatList
            data={likedAlbums}
            keyExtractor={(item) => item._id}
            numColumns={2}
            renderItem={renderAlbumItem}
            refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={COLORS.primary} />}
            contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: 140 }}
            columnWrapperStyle={{ justifyContent: "space-between" }}
            ListEmptyComponent={
              <View style={styles.emptyContainer}>
                <Ionicons name="disc-outline" size={64} color={COLORS.textMuted} />
                <Text style={styles.emptyText}>No liked albums yet</Text>
              </View>
            }
          />
        )}

        {activeTab === "artists" && (
          <FlatList
            data={likedArtists}
            keyExtractor={(item) => item._id}
            numColumns={3}
            renderItem={renderArtistItem}
            refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={COLORS.primary} />}
            contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: 140 }}
            ListEmptyComponent={
              <View style={styles.emptyContainer}>
                <Ionicons name="person-outline" size={64} color={COLORS.textMuted} />
                <Text style={styles.emptyText}>No followed artists yet</Text>
              </View>
            }
          />
        )}
      </View>

      {/* Create Playlist Modal */}
      <Modal visible={showCreateModal} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Create Playlist</Text>
            <TextInput
              style={styles.modalInput}
              placeholder="Playlist name"
              placeholderTextColor={COLORS.textMuted}
              value={newPlaylistName}
              onChangeText={setNewPlaylistName}
            />
            <TextInput
              style={[styles.modalInput, { height: 80 }]}
              placeholder="Description (optional)"
              placeholderTextColor={COLORS.textMuted}
              value={newPlaylistDesc}
              onChangeText={setNewPlaylistDesc}
              multiline
            />
            <View style={styles.modalActions}>
              <TouchableOpacity style={styles.modalCancelBtn} onPress={() => setShowCreateModal(false)}>
                <Text style={styles.modalCancelText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.modalCreateBtn} onPress={handleCreatePlaylist}>
                <Text style={styles.modalCreateText}>Create</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  headerTitle: {
    color: COLORS.text,
    fontSize: 28,
    fontWeight: "800",
    letterSpacing: 0.5,
  },
  addBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: COLORS.primary,
    alignItems: "center",
    justifyContent: "center",
  },
  quickActions: {
    paddingHorizontal: 20,
    gap: 12,
    marginBottom: 20,
  },
  quickAction: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: COLORS.surface,
    borderRadius: BORDER_RADIUS.md,
    padding: 12,
    borderWidth: 1,
    borderColor: COLORS.borderLight,
  },
  quickActionIcon: {
    width: 56,
    height: 56,
    borderRadius: BORDER_RADIUS.sm,
    alignItems: "center",
    justifyContent: "center",
  },
  quickActionText: {
    flex: 1,
    marginLeft: 14,
  },
  quickActionTitle: {
    color: COLORS.text,
    fontSize: 16,
    fontWeight: "700",
  },
  quickActionMeta: {
    color: COLORS.textSecondary,
    fontSize: 13,
    marginTop: 2,
  },
  tabs: {
    flexDirection: "row",
    paddingHorizontal: 20,
    gap: 8,
    marginBottom: 16,
  },
  tab: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: COLORS.backgroundLight,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  tabActive: {
    backgroundColor: `${COLORS.primary}20`,
    borderColor: COLORS.primary,
  },
  tabText: {
    color: COLORS.textSecondary,
    fontSize: 13,
    fontWeight: "600",
  },
  tabTextActive: {
    color: COLORS.primary,
  },
  content: {
    flex: 1,
  },
  playlistItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingVertical: 12,
  },
  playlistCover: {
    ...SHADOWS.small,
    borderRadius: BORDER_RADIUS.sm,
  },
  playlistImage: {
    width: 56,
    height: 56,
    borderRadius: BORDER_RADIUS.sm,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: COLORS.backgroundLight,
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
  playlistMeta: {
    color: COLORS.textSecondary,
    fontSize: 13,
    marginTop: 2,
  },
  songItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingVertical: 10,
  },
  songCover: {
    width: 52,
    height: 52,
    borderRadius: BORDER_RADIUS.sm,
    backgroundColor: COLORS.backgroundLight,
  },
  songInfo: {
    flex: 1,
    marginLeft: 14,
  },
  songTitle: {
    color: COLORS.text,
    fontSize: 15,
    fontWeight: "600",
  },
  songArtist: {
    color: COLORS.textSecondary,
    fontSize: 13,
    marginTop: 2,
  },
  albumItem: {
    width: "47%",
    marginBottom: 20,
  },
  albumCover: {
    width: "100%",
    aspectRatio: 1,
    borderRadius: BORDER_RADIUS.md,
    backgroundColor: COLORS.backgroundLight,
  },
  albumTitle: {
    color: COLORS.text,
    fontSize: 14,
    fontWeight: "600",
    marginTop: 8,
  },
  albumArtist: {
    color: COLORS.textSecondary,
    fontSize: 12,
    marginTop: 2,
  },
  artistItem: {
    width: "31%",
    alignItems: "center",
    marginBottom: 20,
  },
  artistAvatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: COLORS.backgroundLight,
  },
  artistName: {
    color: COLORS.text,
    fontSize: 13,
    fontWeight: "600",
    marginTop: 8,
    textAlign: "center",
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
  },
  createBtn: {
    backgroundColor: COLORS.primary,
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 24,
    marginTop: 20,
  },
  createBtnText: {
    color: "#fff",
    fontSize: 14,
    fontWeight: "700",
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.7)",
    justifyContent: "center",
    paddingHorizontal: 20,
  },
  modalContent: {
    backgroundColor: COLORS.backgroundLight,
    borderRadius: BORDER_RADIUS.lg,
    padding: 24,
  },
  modalTitle: {
    color: COLORS.text,
    fontSize: 20,
    fontWeight: "800",
    marginBottom: 20,
    textAlign: "center",
  },
  modalInput: {
    backgroundColor: COLORS.surface,
    borderRadius: BORDER_RADIUS.md,
    padding: 14,
    color: COLORS.text,
    fontSize: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  modalActions: {
    flexDirection: "row",
    gap: 12,
    marginTop: 12,
  },
  modalCancelBtn: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: BORDER_RADIUS.md,
    backgroundColor: COLORS.surface,
    alignItems: "center",
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  modalCancelText: {
    color: COLORS.text,
    fontSize: 16,
    fontWeight: "600",
  },
  modalCreateBtn: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: BORDER_RADIUS.md,
    backgroundColor: COLORS.primary,
    alignItems: "center",
  },
  modalCreateText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "700",
  },
})
