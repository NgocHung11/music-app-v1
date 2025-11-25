"use client"

import { useEffect, useState, useCallback } from "react"
import { View, Text, FlatList, RefreshControl, TouchableOpacity, StyleSheet, ActivityIndicator } from "react-native"
import { Ionicons } from "@expo/vector-icons"
import { SafeAreaView } from "react-native-safe-area-context"
import { useNavigation, useRoute } from "@react-navigation/native"
import { artistApi } from "../api"
import { usePlayer } from "../context/PlayerContext"
import type { Artist, Song } from "../types"
import { COLORS } from "../constants/theme"
import SongItem from "../components/SongItem"

export default function ArtistSongsScreen() {
    const navigation = useNavigation<any>()
    const route = useRoute<any>()
    const { artist } = route.params as { artist: Artist }

    const { playSongs, isPlaying, currentSong, togglePlay } = usePlayer()
    const [songs, setSongs] = useState<Song[]>([])
    const [loading, setLoading] = useState(true)
    const [refreshing, setRefreshing] = useState(false)
    const [page, setPage] = useState(1)
    const [hasMore, setHasMore] = useState(true)

    const fetchSongs = useCallback(
        async (pageNum = 1, refresh = false) => {
            try {
                const res = await artistApi.getSongs(artist._id, { page: pageNum, limit: 20 })
                const newSongs = res.data.songs ?? []

                if (refresh) {
                    setSongs(newSongs)
                } else {
                    setSongs((prev) => (pageNum === 1 ? newSongs : [...prev, ...newSongs]))
                }
                setHasMore(newSongs.length === 20)
            } catch (error) {
                console.warn("fetchSongs error", error)
            } finally {
                setLoading(false)
                setRefreshing(false)
            }
        },
        [artist._id],
    )

    useEffect(() => {
        fetchSongs()
    }, [fetchSongs])

    const onRefresh = async () => {
        setRefreshing(true)
        setPage(1)
        await fetchSongs(1, true)
    }

    const onEndReached = () => {
        if (!loading && hasMore) {
            const nextPage = page + 1
            setPage(nextPage)
            fetchSongs(nextPage)
        }
    }

    const handlePlaySong = (index: number) => {
        playSongs(songs, index)
    }

    const isArtistSongsPlaying = () => {
        if (!currentSong || songs.length === 0) return false
        return songs.some((s) => s._id === currentSong._id)
    }

    const handlePlayAll = () => {
        if (songs.length === 0) return
        if (isArtistSongsPlaying()) {
            togglePlay()
        } else {
            playSongs(songs, 0)
        }
    }

    const isThisPlaying = isArtistSongsPlaying()
    const showPauseIcon = isThisPlaying && isPlaying

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
                    <Ionicons name="arrow-back" size={24} color={COLORS.text} />
                </TouchableOpacity>
                <View style={styles.headerInfo}>
                    <Text style={styles.title}>{artist.name}</Text>
                    <Text style={styles.subtitle}>All Songs</Text>
                </View>
                <TouchableOpacity style={styles.playAllBtn} onPress={handlePlayAll}>
                    <Ionicons name={showPauseIcon ? "pause" : "play"} size={20} color="#fff" />
                </TouchableOpacity>
            </View>

            <FlatList
                data={songs}
                keyExtractor={(item) => item._id}
                contentContainerStyle={styles.listContent}
                showsVerticalScrollIndicator={false}
                refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={COLORS.primary} />}
                onEndReached={onEndReached}
                onEndReachedThreshold={0.5}
                renderItem={({ item, index }) => <SongItem song={item} index={index} onPress={() => handlePlaySong(index)} />}
                ListEmptyComponent={
                    <View style={styles.emptyContainer}>
                        <Ionicons name="musical-notes-outline" size={64} color={COLORS.textSecondary} />
                        <Text style={styles.emptyText}>No songs found</Text>
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
        gap: 12,
    },
    backBtn: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: COLORS.backgroundLight,
        alignItems: "center",
        justifyContent: "center",
    },
    headerInfo: {
        flex: 1,
    },
    title: {
        color: COLORS.text,
        fontSize: 18,
        fontWeight: "700",
    },
    subtitle: {
        color: COLORS.textSecondary,
        fontSize: 14,
        marginTop: 2,
    },
    playAllBtn: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: COLORS.primary,
        alignItems: "center",
        justifyContent: "center",
    },
    listContent: {
        paddingBottom: 140,
    },
    emptyContainer: {
        flex: 1,
        alignItems: "center",
        justifyContent: "center",
        paddingTop: 100,
    },
    emptyText: {
        color: COLORS.textSecondary,
        fontSize: 16,
        marginTop: 16,
    },
})
