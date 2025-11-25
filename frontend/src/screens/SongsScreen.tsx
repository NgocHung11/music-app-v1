"use client"

import { useEffect, useState } from "react"
import { View, FlatList, ActivityIndicator, RefreshControl, Text, StyleSheet, TouchableOpacity } from "react-native"
import { Ionicons } from "@expo/vector-icons"
import { SafeAreaView } from "react-native-safe-area-context"
import { useNavigation } from "@react-navigation/native"
import { LinearGradient } from "expo-linear-gradient"
import api from "../api"
import SongItem from "../components/SongItem"
import type { Song } from "../types"
import { usePlayer } from "../context/PlayerContext"
import { COLORS } from "../constants/theme"

export default function SongsScreen() {
  const [songs, setSongs] = useState<Song[]>([])
  const [loading, setLoading] = useState(false)
  const [refreshing, setRefreshing] = useState(false)

  const { playSongs, isPlaying, currentSong, togglePlay } = usePlayer()
  const navigation = useNavigation<any>()

  const fetchSongs = async () => {
    try {
      setLoading(true)
      const res = await api.get("/songs")
      setSongs(res.data.songs ?? [])
    } catch (err) {
      console.warn("fetchSongs error", err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchSongs()
  }, [])

  const onRefresh = async () => {
    setRefreshing(true)
    await fetchSongs()
    setRefreshing(false)
  }

  const isSongsListPlaying = () => {
    if (!currentSong || songs.length === 0) return false
    return songs.some((s) => s._id === currentSong._id)
  }

  const handlePlayAll = () => {
    if (songs.length === 0) return
    if (isSongsListPlaying()) {
      togglePlay()
    } else {
      playSongs(songs, 0)
    }
  }

  const isThisListPlaying = isSongsListPlaying()
  const showPauseIcon = isThisListPlaying && isPlaying

  return (
    <SafeAreaView style={styles.container} edges={["top", "left", "right"]}>
      <LinearGradient
        colors={["#1a1a2e", "#0a0a12"]}
        start={{ x: 0, y: 0 }}
        end={{ x: 0, y: 1 }}
        style={styles.headerGradient}
      >
        <View style={styles.header}>
          <View>
            <Text style={styles.greeting}>Your Music</Text>
            <Text style={styles.title}>Discover & Play</Text>
          </View>

          <View style={styles.headerButtons}>
            {songs.length > 0 && (
              <TouchableOpacity onPress={handlePlayAll} style={styles.playAllBtn}>
                <Ionicons name={showPauseIcon ? "pause" : "play"} size={20} color="#fff" />
              </TouchableOpacity>
            )}
            <TouchableOpacity onPress={() => navigation.navigate("Search")} style={styles.searchBtn}>
              <Ionicons name="search" size={22} color="#fff" />
            </TouchableOpacity>
          </View>
        </View>
      </LinearGradient>

      <View style={{ flex: 1 }}>
        {loading && songs.length === 0 ? (
          <View style={styles.center}>
            <ActivityIndicator size="large" color="#4a5fd9" />
          </View>
        ) : (
          <FlatList
            data={songs}
            keyExtractor={(item) => item._id}
            renderItem={({ item, index }) => <SongItem song={item} onPress={() => playSongs(songs, index)} />}
            refreshControl={
              <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#4a5fd9" colors={["#4a5fd9"]} />
            }
            ListEmptyComponent={
              !loading ? (
                <View style={styles.center}>
                  <Ionicons name="musical-notes-outline" size={64} color="#4a5fd9" style={{ marginBottom: 16 }} />
                  <Text style={styles.emptyText}>No songs available</Text>
                </View>
              ) : null
            }
            contentContainerStyle={{ paddingBottom: 140, paddingTop: 8 }}
            showsVerticalScrollIndicator={false}
          />
        )}
      </View>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#000",
  },
  headerGradient: {
    paddingBottom: 16,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingTop: 8,
  },
  greeting: {
    color: "#9999b3",
    fontSize: 14,
    fontWeight: "500",
    letterSpacing: 0.5,
    marginBottom: 2,
  },
  title: {
    color: "#fff",
    fontSize: 28,
    fontWeight: "800",
    letterSpacing: 0.5,
  },
  headerButtons: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  playAllBtn: {
    backgroundColor: COLORS.primary,
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#4a5fd9",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 6,
    elevation: 8,
  },
  searchBtn: {
    backgroundColor: "#4a5fd9",
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#4a5fd9",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 6,
    elevation: 8,
  },
  center: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingTop: 60,
  },
  emptyText: {
    color: "#9999b3",
    fontSize: 16,
    fontWeight: "500",
  },
})
