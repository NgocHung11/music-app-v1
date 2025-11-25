"use client"

import { useEffect, useState } from "react"
import { View, Text, FlatList, TouchableOpacity, StyleSheet, ActivityIndicator, Alert, Image } from "react-native"
import { Ionicons } from "@expo/vector-icons"
import { SafeAreaView } from "react-native-safe-area-context"
import { useNavigation } from "@react-navigation/native"
import { userApi } from "../api"
import { usePlayer } from "../context/PlayerContext"
import type { Song, PlayHistory } from "../types"
import { getCoverImage, getArtistName } from "../types"
import { COLORS, BORDER_RADIUS } from "../constants/theme"

export default function HistoryScreen() {
  const navigation = useNavigation<any>()
  const { playSongs } = usePlayer()

  const [history, setHistory] = useState<PlayHistory[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchHistory = async () => {
      try {
        const res = await userApi.getHistory({ limit: 50 })
        setHistory(res.data.history ?? [])
      } catch (error) {
        console.warn("fetchHistory error", error)
      } finally {
        setLoading(false)
      }
    }
    fetchHistory()
  }, [])

  const handleClearHistory = () => {
    Alert.alert("Clear History", "Are you sure you want to clear your listening history?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Clear",
        style: "destructive",
        onPress: async () => {
          try {
            await userApi.clearHistory()
            setHistory([])
          } catch (error) {
            console.warn("Clear history error", error)
          }
        },
      },
    ])
  }

  const songs = history.filter((h) => h.song && typeof h.song !== "string").map((h) => h.song as Song)

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    const now = new Date()
    const diff = now.getTime() - date.getTime()
    const days = Math.floor(diff / (1000 * 60 * 60 * 24))

    if (days === 0) return "Today"
    if (days === 1) return "Yesterday"
    if (days < 7) return `${days} days ago`
    return date.toLocaleDateString()
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
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Recently Played</Text>
        {history.length > 0 && (
          <TouchableOpacity onPress={handleClearHistory}>
            <Text style={styles.clearBtn}>Clear</Text>
          </TouchableOpacity>
        )}
      </View>

      <FlatList
        data={history}
        keyExtractor={(item) => item._id}
        contentContainerStyle={{ paddingBottom: 140 }}
        renderItem={({ item, index }) => {
          const song = item.song as Song
          if (!song || typeof song === "string") return null
          return (
            <TouchableOpacity style={styles.historyItem} onPress={() => playSongs(songs, index)}>
              <Image source={{ uri: getCoverImage(song) }} style={styles.cover} />
              <View style={styles.info}>
                <Text style={styles.title} numberOfLines={1}>
                  {song.title}
                </Text>
                <Text style={styles.artist} numberOfLines={1}>
                  {getArtistName(song.artist)}
                </Text>
                <Text style={styles.date}>{formatDate(item.playedAt)}</Text>
              </View>
              <Ionicons name="play-circle-outline" size={24} color={COLORS.primary} />
            </TouchableOpacity>
          )
        }}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Ionicons name="time-outline" size={64} color={COLORS.textMuted} />
            <Text style={styles.emptyText}>No listening history yet</Text>
            <Text style={styles.emptySubtext}>Start playing songs to see them here</Text>
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
    flexDirection: "row",
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
  headerTitle: {
    flex: 1,
    color: COLORS.text,
    fontSize: 20,
    fontWeight: "700",
    marginLeft: 12,
  },
  clearBtn: {
    color: COLORS.error,
    fontSize: 14,
    fontWeight: "600",
  },
  historyItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingVertical: 12,
  },
  cover: {
    width: 56,
    height: 56,
    borderRadius: BORDER_RADIUS.sm,
    backgroundColor: COLORS.backgroundLight,
  },
  info: {
    flex: 1,
    marginLeft: 14,
  },
  title: {
    color: COLORS.text,
    fontSize: 15,
    fontWeight: "600",
  },
  artist: {
    color: COLORS.textSecondary,
    fontSize: 13,
    marginTop: 2,
  },
  date: {
    color: COLORS.textMuted,
    fontSize: 11,
    marginTop: 4,
  },
  emptyContainer: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 100,
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
