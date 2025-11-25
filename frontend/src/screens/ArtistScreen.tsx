"use client"

import { useEffect, useState } from "react"
import {
  View,
  Text,
  Image,
  ScrollView,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  Dimensions,
} from "react-native"
import { LinearGradient } from "expo-linear-gradient"
import { Ionicons } from "@expo/vector-icons"
import { SafeAreaView } from "react-native-safe-area-context"
import { useNavigation, useRoute } from "@react-navigation/native"
import { artistApi } from "../api"
import { usePlayer } from "../context/PlayerContext"
import { useFavorite } from "../hooks/useFavorite"
import type { Artist, Song, Album } from "../types"
import { getArtistAvatar, getArtistFollowers } from "../types"
import { COLORS, GRADIENTS, SHADOWS } from "../constants/theme"
import SongItem from "../components/SongItem"
import AlbumCard from "../components/AlbumCard"
import SectionHeader from "../components/SectionHeader"

const { width } = Dimensions.get("window")

export default function ArtistScreen() {
  const navigation = useNavigation<any>()
  const route = useRoute<any>()
  const { artist: initialArtist, artistId } = route.params || {}

  const [artist, setArtist] = useState<Artist | null>(initialArtist || null)
  const [songs, setSongs] = useState<Song[]>([])
  const [albums, setAlbums] = useState<Album[]>([])
  const [loading, setLoading] = useState(true)
  const [imageError, setImageError] = useState(false)

  const { playSongs, isPlaying, currentSong, togglePlay, songList } = usePlayer()
  const currentArtistId = artist?._id || artistId || ""
  const { isFavorite, toggleFavorite, loading: favLoading } = useFavorite("artist", currentArtistId)

  useEffect(() => {
    const fetchArtistData = async () => {
      const idToFetch = initialArtist?._id || artistId
      if (!idToFetch) {
        setLoading(false)
        return
      }

      try {
        const [artistRes, songsRes, albumsRes] = await Promise.all([
          artistApi.getById(idToFetch),
          artistApi.getSongs(idToFetch, { limit: 10 }),
          artistApi.getAlbums(idToFetch),
        ])
        setArtist(artistRes.data.artist)
        setSongs(songsRes.data.songs ?? [])
        setAlbums(albumsRes.data.albums ?? [])
      } catch (error) {
        console.warn("fetchArtistData error", error)
      } finally {
        setLoading(false)
      }
    }
    fetchArtistData()
  }, [initialArtist?._id, artistId])

  const isCurrentArtistPlaying = () => {
    if (!currentSong || songs.length === 0) return false
    return songs.some((s) => s._id === currentSong._id)
  }

  const isThisArtistPlaying = isCurrentArtistPlaying()
  const showPauseIcon = isThisArtistPlaying && isPlaying

  const handlePlayAll = () => {
    if (songs.length === 0) return
    if (isThisArtistPlaying) {
      togglePlay()
    } else {
      playSongs(songs, 0)
    }
  }

  const formatFollowers = (count: number) => {
    if (count >= 1000000) return `${(count / 1000000).toFixed(1)}M`
    if (count >= 1000) return `${(count / 1000).toFixed(1)}K`
    return count.toString()
  }

  if (loading || !artist) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={COLORS.primary} />
      </View>
    )
  }

  const artistImage = getArtistAvatar(artist)
  const isPlaceholder = artistImage.includes("placeholder")
  const hasValidImage = !imageError && !isPlaceholder
  const followers = getArtistFollowers(artist)

  return (
    <SafeAreaView style={styles.container} edges={["top"]}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 140 }}>
        {/* Header Image */}
        <View style={styles.headerImage}>
          {hasValidImage ? (
            <Image source={{ uri: artistImage }} style={styles.coverImage} onError={() => setImageError(true)} />
          ) : (
            <LinearGradient colors={GRADIENTS.primary} style={styles.coverImage}>
              <Ionicons name="person" size={80} color="rgba(255,255,255,0.5)" />
            </LinearGradient>
          )}
          <LinearGradient colors={["transparent", COLORS.background]} style={styles.headerGradient} />

          {/* Back button */}
          <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
            <Ionicons name="arrow-back" size={24} color="#fff" />
          </TouchableOpacity>
        </View>

        {/* Artist Info */}
        <View style={styles.infoContainer}>
          <View style={styles.nameRow}>
            <Text style={styles.name}>{artist.name}</Text>
            {artist.isVerified && (
              <Ionicons name="checkmark-circle" size={24} color={COLORS.primary} style={{ marginLeft: 8 }} />
            )}
          </View>
          <Text style={styles.followers}>{formatFollowers(followers)} followers</Text>

          {artist.bio && (
            <Text style={styles.bio} numberOfLines={3}>
              {artist.bio}
            </Text>
          )}

          {artist.genres && artist.genres.length > 0 && (
            <View style={styles.genresRow}>
              {artist.genres.slice(0, 3).map((genre, index) => (
                <View key={index} style={styles.genreTag}>
                  <Text style={styles.genreText}>{genre}</Text>
                </View>
              ))}
            </View>
          )}
        </View>

        {/* Action Buttons */}
        <View style={styles.actions}>
          <TouchableOpacity
            style={[styles.followBtn, isFavorite && styles.followBtnActive]}
            onPress={toggleFavorite}
            disabled={favLoading}
          >
            <Text style={[styles.followBtnText, isFavorite && styles.followBtnTextActive]}>
              {isFavorite ? "Following" : "Follow"}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.playBtn} onPress={handlePlayAll}>
            <LinearGradient colors={GRADIENTS.primary} style={styles.playBtnGradient}>
              <Ionicons name={showPauseIcon ? "pause" : "play"} size={24} color="#fff" />
              <Text style={styles.playBtnText}>{showPauseIcon ? "Pause" : "Play"}</Text>
            </LinearGradient>
          </TouchableOpacity>

          <TouchableOpacity style={styles.moreBtn}>
            <Ionicons name="ellipsis-horizontal" size={24} color="#fff" />
          </TouchableOpacity>
        </View>

        {/* Popular Songs */}
        {songs.length > 0 && (
          <View>
            <SectionHeader title="Popular Songs" onSeeAll={() => navigation.navigate("ArtistSongs", { artist })} />
            {songs.slice(0, 5).map((song, index) => (
              <SongItem key={song._id} song={song} index={index} onPress={() => playSongs(songs, index)} />
            ))}
          </View>
        )}

        {/* Albums */}
        {albums.length > 0 && (
          <View>
            <SectionHeader title="Albums" onSeeAll={() => navigation.navigate("ArtistAlbums", { artist })} />
            <FlatList
              data={albums}
              horizontal
              showsHorizontalScrollIndicator={false}
              keyExtractor={(item) => item._id}
              contentContainerStyle={{ paddingHorizontal: 20 }}
              renderItem={({ item }) => (
                <AlbumCard album={item} onPress={() => navigation.navigate("Album", { album: item })} />
              )}
            />
          </View>
        )}
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
  headerImage: {
    height: 280,
    position: "relative",
    alignItems: "center",
    justifyContent: "center",
  },
  coverImage: {
    width: "100%",
    height: "100%",
    backgroundColor: COLORS.backgroundLight,
    alignItems: "center",
    justifyContent: "center",
  },
  headerGradient: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    height: 120,
  },
  backBtn: {
    position: "absolute",
    top: 12,
    left: 16,
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "rgba(0,0,0,0.4)",
    alignItems: "center",
    justifyContent: "center",
  },
  infoContainer: {
    paddingHorizontal: 20,
    marginTop: -40,
  },
  nameRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  name: {
    color: COLORS.text,
    fontSize: 32,
    fontWeight: "800",
    letterSpacing: 0.5,
  },
  followers: {
    color: COLORS.textSecondary,
    fontSize: 14,
    marginTop: 4,
  },
  bio: {
    color: COLORS.textSecondary,
    fontSize: 14,
    lineHeight: 20,
    marginTop: 12,
  },
  genresRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
    marginTop: 12,
  },
  genreTag: {
    backgroundColor: COLORS.backgroundLight,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  genreText: {
    color: COLORS.textSecondary,
    fontSize: 12,
    fontWeight: "600",
  },
  actions: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    paddingHorizontal: 20,
    marginTop: 20,
    marginBottom: 8,
  },
  followBtn: {
    paddingHorizontal: 24,
    paddingVertical: 10,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: COLORS.text,
  },
  followBtnActive: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },
  followBtnText: {
    color: COLORS.text,
    fontSize: 14,
    fontWeight: "700",
  },
  followBtnTextActive: {
    color: "#fff",
  },
  playBtn: {
    flex: 1,
    ...SHADOWS.primary,
  },
  playBtnGradient: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    paddingVertical: 12,
    borderRadius: 24,
  },
  playBtnText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "700",
  },
  moreBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: COLORS.backgroundLight,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: COLORS.border,
  },
})
