"use client"

import { useEffect, useState } from "react"
import { View, Text, FlatList, TouchableOpacity, StyleSheet, ActivityIndicator } from "react-native"
import { LinearGradient } from "expo-linear-gradient"
import { Ionicons } from "@expo/vector-icons"
import { SafeAreaView } from "react-native-safe-area-context"
import { useNavigation } from "@react-navigation/native"
import { favoriteApi } from "../api"
import { usePlayer } from "../context/PlayerContext"
import type { Song } from "../types"
import { COLORS, GRADIENTS, BORDER_RADIUS, SHADOWS } from "../constants/theme"
import SongItem from "../components/SongItem"

export default function LikedSongsScreen() {
  const navigation = useNavigation<any>()
  const { playSongs } = usePlayer()

  const [songs, setSongs] = useState<Song[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchLikedSongs = async () => {
      try {
        const res = await favoriteApi.getLikedSongs()
        setSongs(res.data.songs ?? [])
      } catch (error) {
        console.warn("fetchLikedSongs error", error)
      } finally {
        setLoading(false)
      }
    }
    fetchLikedSongs()
  }, [])

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

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={COLORS.primary} />
      </View>
    )
  }

  return (
    <SafeAreaView style={styles.container} edges={["top"]}>
      <FlatList
        data={songs}
        keyExtractor={(item) => item._id}
        contentContainerStyle={{ paddingBottom: 140 }}
        ListHeaderComponent={
          <View>
            {/* Header */}
            <LinearGradient colors={["#667EEA", "#764BA2"]} style={styles.header}>
              <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
                <Ionicons name="arrow-back" size={24} color="#fff" />
              </TouchableOpacity>
              <Ionicons name="heart" size={64} color="#fff" style={{ marginTop: 20 }} />
              <Text style={styles.title}>Liked Songs</Text>
              <Text style={styles.count}>{songs.length} songs</Text>
            </LinearGradient>

            {/* Actions */}
            {songs.length > 0 && (
              <View style={styles.actions}>
                <TouchableOpacity style={styles.shuffleBtn} onPress={handleShufflePlay}>
                  <Ionicons name="shuffle" size={22} color="#fff" />
                  <Text style={styles.shuffleText}>Shuffle</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.playAllBtn} onPress={handlePlayAll}>
                  <LinearGradient colors={GRADIENTS.primary} style={styles.playAllGradient}>
                    <Ionicons name="play" size={24} color="#fff" />
                  </LinearGradient>
                </TouchableOpacity>
              </View>
            )}
          </View>
        }
        renderItem={({ item, index }) => <SongItem song={item} index={index} onPress={() => playSongs(songs, index)} />}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Ionicons name="heart-outline" size={64} color={COLORS.textMuted} />
            <Text style={styles.emptyText}>No liked songs yet</Text>
            <Text style={styles.emptySubtext}>Tap the heart icon on songs you love</Text>
          </View>
        }
      />
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
    alignItems: "center",
    paddingTop: 16,
    paddingBottom: 32,
    borderBottomLeftRadius: BORDER_RADIUS.xl,
    borderBottomRightRadius: BORDER_RADIUS.xl,
  },
  backBtn: {
    position: "absolute",
    top: 16,
    left: 16,
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "rgba(0,0,0,0.2)",
    alignItems: "center",
    justifyContent: "center",
  },
  title: {
    color: "#fff",
    fontSize: 28,
    fontWeight: "800",
    marginTop: 16,
  },
  count: {
    color: "rgba(255,255,255,0.8)",
    fontSize: 14,
    marginTop: 4,
  },
  actions: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 16,
    marginVertical: 24,
  },
  shuffleBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 24,
    backgroundColor: COLORS.backgroundLight,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  shuffleText: {
    color: "#fff",
    fontSize: 14,
    fontWeight: "600",
  },
  playAllBtn: {
    ...SHADOWS.primary,
  },
  playAllGradient: {
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: "center",
    justifyContent: "center",
  },
  emptyContainer: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 60,
  },
  emptyText: {
    color: COLORS.text,
    fontSize: 18,
    fontWeight: "700",
    marginTop: 16,
  },
  emptySubtext: {
    color: COLORS.textMuted,
    fontSize: 14,
    marginTop: 8,
  },
})
