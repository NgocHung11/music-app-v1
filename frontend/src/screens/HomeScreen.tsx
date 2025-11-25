"use client"

import { useEffect, useState, useCallback } from "react"
import {
  View,
  Text,
  ScrollView,
  FlatList,
  RefreshControl,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
} from "react-native"
import { LinearGradient } from "expo-linear-gradient"
import { Ionicons } from "@expo/vector-icons"
import { SafeAreaView } from "react-native-safe-area-context"
import { useNavigation } from "@react-navigation/native"
import { useAuth } from "../context/AuthContext"
import { usePlayer } from "../context/PlayerContext"
import { songApi, albumApi, artistApi, genreApi } from "../api"
import type { Song, Album, Artist, Genre } from "../types"
import { COLORS, GRADIENTS } from "../constants/theme"
import SongCard from "../components/SongCard"
import AlbumCard from "../components/AlbumCard"
import ArtistCard from "../components/ArtistCard"
import GenreCard from "../components/GenreCard"
import SectionHeader from "../components/SectionHeader"
import SongItem from "../components/SongItem"

type TopPeriod = "day" | "week" | "month"

export default function HomeScreen() {
  const navigation = useNavigation<any>()
  const { user } = useAuth()
  const { playSongs } = usePlayer()

  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [topPeriod, setTopPeriod] = useState<TopPeriod>("week")

  // Data states
  const [topSongs, setTopSongs] = useState<Song[]>([])
  const [newAlbums, setNewAlbums] = useState<Album[]>([])
  const [popularArtists, setPopularArtists] = useState<Artist[]>([])
  const [genres, setGenres] = useState<Genre[]>([])
  const [recentSongs, setRecentSongs] = useState<Song[]>([])

  const fetchData = useCallback(async () => {
    try {
      const [topRes, albumRes, artistRes, genreRes, recentRes] = await Promise.all([
        songApi.getTopSongs(topPeriod, 10),
        albumApi.getAll({ limit: 8 }),
        artistApi.getAll({ limit: 10 }),
        genreApi.getAll(),
        songApi.getAll({ limit: 10 }),
      ])

      const topSongsData = topRes.data.songs || []
      // TopSongs có thể trả về format khác (với song nested)
      setTopSongs(topSongsData.map((item: any) => item.song || item))
      setNewAlbums(albumRes.data.albums || [])
      setPopularArtists(artistRes.data.artists || [])
      setGenres(genreRes.data.genres || [])
      setRecentSongs(recentRes.data.songs || [])
    } catch (error) {
      console.warn("fetchData error", error)
    } finally {
      setLoading(false)
    }
  }, [topPeriod])

  useEffect(() => {
    fetchData()
  }, [fetchData])

  const onRefresh = async () => {
    setRefreshing(true)
    await fetchData()
    setRefreshing(false)
  }

  const getGreeting = () => {
    const hour = new Date().getHours()
    if (hour < 12) return "Good Morning"
    if (hour < 18) return "Good Afternoon"
    return "Good Evening"
  }

  const handlePlayTopSong = (index: number) => {
    playSongs(topSongs, index)
  }

  const handlePlayRecentSong = (index: number) => {
    playSongs(recentSongs, index)
  }

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={COLORS.primary} />
      </View>
    )
  }

  return (
    <SafeAreaView style={styles.container} edges={["top", "left", "right"]}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={COLORS.primary}
            colors={[COLORS.primary]}
          />
        }
        contentContainerStyle={{ paddingBottom: 140 }}
      >
        {/* Header */}
        <LinearGradient colors={GRADIENTS.header} style={styles.header}>
          <View style={styles.headerContent}>
            <View>
              <Text style={styles.greeting}>{getGreeting()}</Text>
              <Text style={styles.username}>{user?.firstName || user?.username || "Music Lover"}</Text>
            </View>
            <View style={styles.headerActions}>
              <TouchableOpacity style={styles.headerBtn} onPress={() => navigation.navigate("Search")}>
                <Ionicons name="search" size={22} color="#fff" />
              </TouchableOpacity>
            </View>
          </View>
        </LinearGradient>

        {/* Top Songs Section */}
        <View>
          <SectionHeader
            title="Top Songs"
            subtitle={`Top of the ${topPeriod}`}
            onSeeAll={() => navigation.navigate("TopSongs", { period: topPeriod })}
          />

          {/* Period Filter */}
          <View style={styles.periodFilter}>
            {(["day", "week", "month"] as TopPeriod[]).map((period) => (
              <TouchableOpacity
                key={period}
                style={[styles.periodBtn, topPeriod === period && styles.periodBtnActive]}
                onPress={() => setTopPeriod(period)}
              >
                <Text style={[styles.periodText, topPeriod === period && styles.periodTextActive]}>
                  {period.charAt(0).toUpperCase() + period.slice(1)}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          {topSongs.length > 0 ? (
            <FlatList
              data={topSongs.slice(0, 6)}
              horizontal
              showsHorizontalScrollIndicator={false}
              keyExtractor={(item) => item._id}
              contentContainerStyle={{ paddingHorizontal: 20 }}
              renderItem={({ item, index }) => (
                <SongCard song={item} rank={index + 1} onPress={() => handlePlayTopSong(index)} />
              )}
            />
          ) : (
            <Text style={styles.emptyText}>No top songs available</Text>
          )}
        </View>

        {/* Genres Section */}
        <View>
          <SectionHeader title="Browse by Genre" />
          {genres.length > 0 ? (
            <FlatList
              data={genres}
              horizontal
              showsHorizontalScrollIndicator={false}
              keyExtractor={(item) => item._id}
              contentContainerStyle={{ paddingHorizontal: 20 }}
              renderItem={({ item }) => (
                <GenreCard genre={item} onPress={() => navigation.navigate("Genre", { genreId: item._id })} />
              )}
            />
          ) : (
            <Text style={styles.emptyText}>No genres available</Text>
          )}
        </View>

        {/* New Albums Section */}
        <View>
          <SectionHeader title="New Releases" subtitle="Latest albums" />
          {newAlbums.length > 0 ? (
            <FlatList
              data={newAlbums}
              horizontal
              showsHorizontalScrollIndicator={false}
              keyExtractor={(item) => item._id}
              contentContainerStyle={{ paddingHorizontal: 20 }}
              renderItem={({ item }) => (
                <AlbumCard album={item} onPress={() => navigation.navigate("Album", { album: item, albumId: item._id })}
                />
              )}
            />
          ) : (
            <Text style={styles.emptyText}>No albums available</Text>
          )}
        </View>

        {/* Popular Artists Section */}
        <View>
          <SectionHeader title="Popular Artists" />
          {popularArtists.length > 0 ? (
            <FlatList
              data={popularArtists}
              horizontal
              showsHorizontalScrollIndicator={false}
              keyExtractor={(item) => item._id}
              contentContainerStyle={{ paddingHorizontal: 20 }}
              renderItem={({ item }) => (
                <ArtistCard artist={item} onPress={() => navigation.navigate("Artist", { artist: item })} />
              )}
            />
          ) : (
            <Text style={styles.emptyText}>No artists available</Text>
          )}
        </View>

        {/* Recently Added Section */}
        <View>
          <SectionHeader title="Recently Added" />
          {recentSongs.length > 0 ? (
            recentSongs
              .slice(0, 5)
              .map((song, index) => (
                <SongItem key={song._id} song={song} index={index} onPress={() => handlePlayRecentSong(index)} />
              ))
          ) : (
            <Text style={styles.emptyText}>No songs available</Text>
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
  header: {
    paddingHorizontal: 20,
    paddingTop: 8,
    paddingBottom: 24,
  },
  headerContent: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  greeting: {
    color: COLORS.textSecondary,
    fontSize: 14,
    fontWeight: "500",
    letterSpacing: 0.5,
  },
  username: {
    color: COLORS.text,
    fontSize: 26,
    fontWeight: "800",
    letterSpacing: 0.5,
    marginTop: 4,
  },
  headerActions: {
    flexDirection: "row",
    gap: 12,
  },
  headerBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: COLORS.backgroundLight,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  periodFilter: {
    flexDirection: "row",
    paddingHorizontal: 20,
    marginBottom: 16,
    gap: 8,
  },
  periodBtn: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: COLORS.backgroundLight,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  periodBtnActive: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },
  periodText: {
    color: COLORS.textSecondary,
    fontSize: 13,
    fontWeight: "600",
  },
  periodTextActive: {
    color: "#fff",
  },
  emptyText: {
    color: COLORS.textSecondary,
    fontSize: 14,
    textAlign: "center",
    paddingVertical: 20,
    paddingHorizontal: 20,
  },
})
