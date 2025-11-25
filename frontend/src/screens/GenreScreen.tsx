"use client"

import { useEffect, useState } from "react"
import { View, Text, FlatList, TouchableOpacity, StyleSheet, ActivityIndicator, Dimensions } from "react-native"
import { LinearGradient } from "expo-linear-gradient"
import { Ionicons } from "@expo/vector-icons"
import { SafeAreaView } from "react-native-safe-area-context"
import { useNavigation, useRoute } from "@react-navigation/native"
import { genreApi } from "../api"
import { usePlayer } from "../context/PlayerContext"
import type { Song, Album } from "../types"
import { COLORS, BORDER_RADIUS } from "../constants/theme"
import SongItem from "../components/SongItem"
import AlbumCard from "../components/AlbumCard"
import SectionHeader from "../components/SectionHeader"

const { width } = Dimensions.get("window")

// Màu gradient cho từng genre
const GENRE_COLORS: Record<string, [string, string]> = {
  pop: ["#FF6B6B", "#FF8E53"],
  rock: ["#667EEA", "#764BA2"],
  hiphop: ["#11998E", "#38EF7D"],
  jazz: ["#F093FB", "#F5576C"],
  classical: ["#4FACFE", "#00F2FE"],
  electronic: ["#43E97B", "#38F9D7"],
  rnb: ["#FA709A", "#FEE140"],
  default: ["#4a5fd9", "#7c3aed"],
}

export default function GenreScreen() {
  const navigation = useNavigation<any>()
  const route = useRoute<any>()
  const { genre } = route.params || {}

  const [songs, setSongs] = useState<Song[]>([])
  const [albums, setAlbums] = useState<Album[]>([])
  const [loading, setLoading] = useState(true)

  const { playSongs, isPlaying, currentSong, togglePlay } = usePlayer()

  const colors = GENRE_COLORS[genre?.name?.toLowerCase().replace(/[^a-z]/g, "")] || GENRE_COLORS.default

  useEffect(() => {
    const fetchGenreData = async () => {
      if (!genre?._id) return
      try {
        const [songsRes, albumsRes] = await Promise.all([
          genreApi.getSongs(genre._id, { limit: 20 }),
          genreApi.getAlbums(genre._id),
        ])
        setSongs(songsRes.data.songs ?? [])
        setAlbums(albumsRes.data.albums ?? [])
      } catch (error) {
        console.warn("fetchGenreData error", error)
      } finally {
        setLoading(false)
      }
    }
    fetchGenreData()
  }, [genre?._id])

  const isGenreSongsPlaying = () => {
    if (!currentSong || songs.length === 0) return false
    const genreSongIds = songs.map((s) => s._id)
    return genreSongIds.includes(currentSong._id)
  }

  const handlePlayAll = () => {
    if (songs.length === 0) return
    if (isGenreSongsPlaying()) {
      togglePlay()
    } else {
      playSongs(songs, 0)
    }
  }

  if (!genre) {
    return (
      <View style={styles.loadingContainer}>
        <Text style={styles.errorText}>Genre not found</Text>
      </View>
    )
  }

  const showPauseIcon = isGenreSongsPlaying() && isPlaying

  return (
    <SafeAreaView style={styles.container} edges={["top"]}>
      {/* Header */}
      <LinearGradient colors={colors} style={styles.header}>
        <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.title}>{genre.name}</Text>
        {genre.description && <Text style={styles.description}>{genre.description}</Text>}
        <TouchableOpacity style={styles.playAllBtn} onPress={handlePlayAll}>
          <Ionicons name={showPauseIcon ? "pause" : "play"} size={20} color={colors[0]} />
          <Text style={[styles.playAllText, { color: colors[0] }]}>{showPauseIcon ? "Pause" : "Play All"}</Text>
        </TouchableOpacity>
      </LinearGradient>

      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={COLORS.primary} />
        </View>
      ) : (
        <FlatList
          data={songs}
          keyExtractor={(item) => item._id}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingBottom: 140 }}
          ListHeaderComponent={
            albums.length > 0 ? (
              <View>
                <SectionHeader title="Albums" />
                <FlatList
                  data={albums}
                  horizontal
                  showsHorizontalScrollIndicator={false}
                  keyExtractor={(item) => item._id}
                  contentContainerStyle={{ paddingHorizontal: 20, marginBottom: 16 }}
                  renderItem={({ item }) => (
                    <AlbumCard album={item} onPress={() => navigation.navigate("Album", { album: item })} />
                  )}
                />
                <SectionHeader title="Songs" />
              </View>
            ) : (
              <SectionHeader title="Songs" />
            )
          }
          renderItem={({ item, index }) => (
            <SongItem song={item} index={index} onPress={() => playSongs(songs, index)} />
          )}
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Ionicons name="musical-notes-outline" size={64} color={COLORS.textMuted} />
              <Text style={styles.emptyText}>No songs in this genre</Text>
            </View>
          }
        />
      )}
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
    alignItems: "center",
    justifyContent: "center",
  },
  header: {
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 24,
    borderBottomLeftRadius: BORDER_RADIUS.xl,
    borderBottomRightRadius: BORDER_RADIUS.xl,
  },
  backBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "rgba(0,0,0,0.2)",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 16,
  },
  title: {
    color: "#fff",
    fontSize: 36,
    fontWeight: "800",
    letterSpacing: 0.5,
  },
  description: {
    color: "rgba(255,255,255,0.8)",
    fontSize: 14,
    marginTop: 8,
    lineHeight: 20,
  },
  playAllBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    backgroundColor: "#fff",
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 24,
    alignSelf: "flex-start",
    marginTop: 20,
  },
  playAllText: {
    fontSize: 14,
    fontWeight: "700",
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
  errorText: {
    color: COLORS.error,
    fontSize: 16,
  },
})
