"use client"

import { useEffect, useState, useCallback } from "react"
import {
    View,
    Text,
    FlatList,
    TouchableOpacity,
    StyleSheet,
    TextInput,
    ActivityIndicator,
    Alert,
    Image,
} from "react-native"
import { Ionicons } from "@expo/vector-icons"
import { SafeAreaView } from "react-native-safe-area-context"
import { useNavigation, useRoute } from "@react-navigation/native"
import { songApi, playlistApi } from "../api"
import type { Song } from "../types"
import { getCoverImage, getArtistName } from "../types"
import { COLORS, BORDER_RADIUS } from "../constants/theme"

const normalizeSong = (item: any): Song | null => {
    if (!item) return null
    // Handle case where API returns { song: Song } or just Song
    const song = item.song || item
    if (!song || !song._id) return null
    return song
}

export default function AddSongsScreen() {
    const navigation = useNavigation<any>()
    const route = useRoute<any>()
    const { playlistId } = route.params || {}

    const [songs, setSongs] = useState<Song[]>([])
    const [loading, setLoading] = useState(true)
    const [searchQuery, setSearchQuery] = useState("")
    const [searchResults, setSearchResults] = useState<Song[]>([])
    const [searching, setSearching] = useState(false)
    const [selectedSongs, setSelectedSongs] = useState<Set<string>>(new Set())
    const [adding, setAdding] = useState(false)

    useEffect(() => {
        const fetchSongs = async () => {
            try {
                const res = await songApi.getAll({ limit: 50 })
                const songsData = res.data.songs ?? res.data ?? []
                const normalizedSongs = (Array.isArray(songsData) ? songsData : [])
                    .map(normalizeSong)
                    .filter((s): s is Song => s !== null)
                setSongs(normalizedSongs)
            } catch (error) {
                console.warn("fetchSongs error", error)
            } finally {
                setLoading(false)
            }
        }
        fetchSongs()
    }, [])

    const handleSearch = useCallback(async (query: string) => {
        setSearchQuery(query)
        if (!query.trim()) {
            setSearchResults([])
            return
        }

        setSearching(true)
        try {
            const res = await songApi.search(query)
            const songsData = res.data.songs ?? res.data ?? []
            const normalizedSongs = (Array.isArray(songsData) ? songsData : [])
                .map(normalizeSong)
                .filter((s): s is Song => s !== null)
            setSearchResults(normalizedSongs)
        } catch (error) {
            console.warn("search error", error)
        } finally {
            setSearching(false)
        }
    }, [])

    const toggleSongSelection = (songId: string) => {
        setSelectedSongs((prev) => {
            const newSet = new Set(prev)
            if (newSet.has(songId)) {
                newSet.delete(songId)
            } else {
                newSet.add(songId)
            }
            return newSet
        })
    }

    const handleAddSongs = async () => {
        if (selectedSongs.size === 0) {
            Alert.alert("No songs selected", "Please select at least one song to add")
            return
        }

        setAdding(true)
        try {
            const songIds = Array.from(selectedSongs)
            for (const songId of songIds) {
                await playlistApi.addSong(playlistId, songId)
            }
            navigation.goBack()
        } catch (error) {
            console.warn("addSongs error", error)
            Alert.alert("Error", "Failed to add songs to playlist")
        } finally {
            setAdding(false)
        }
    }

    const displaySongs = searchQuery.trim() ? searchResults : songs

    const renderSongItem = ({ item }: { item: Song }) => {
        if (!item || !item._id) return null

        const isSelected = selectedSongs.has(item._id)

        return (
            <TouchableOpacity
                style={[styles.songItem, isSelected && styles.songItemSelected]}
                onPress={() => toggleSongSelection(item._id)}
            >
                <Image source={{ uri: getCoverImage(item) }} style={styles.songCover} />
                <View style={styles.songInfo}>
                    <Text style={styles.songTitle} numberOfLines={1}>
                        {item.title || "Unknown Title"}
                    </Text>
                    <Text style={styles.songArtist} numberOfLines={1}>
                        {getArtistName(item.artist)}
                    </Text>
                </View>
                <View style={[styles.checkbox, isSelected && styles.checkboxSelected]}>
                    {isSelected && <Ionicons name="checkmark" size={16} color="#fff" />}
                </View>
            </TouchableOpacity>
        )
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
                <Text style={styles.headerTitle}>Add Songs</Text>
                <TouchableOpacity
                    style={[styles.doneBtn, selectedSongs.size === 0 && styles.doneBtnDisabled]}
                    onPress={handleAddSongs}
                    disabled={adding || selectedSongs.size === 0}
                >
                    {adding ? (
                        <ActivityIndicator size="small" color="#fff" />
                    ) : (
                        <Text style={styles.doneBtnText}>Add ({selectedSongs.size})</Text>
                    )}
                </TouchableOpacity>
            </View>

            {/* Search */}
            <View style={styles.searchContainer}>
                <Ionicons name="search" size={20} color={COLORS.textMuted} />
                <TextInput
                    style={styles.searchInput}
                    placeholder="Search songs..."
                    placeholderTextColor={COLORS.textMuted}
                    value={searchQuery}
                    onChangeText={handleSearch}
                />
                {searchQuery.length > 0 && (
                    <TouchableOpacity onPress={() => handleSearch("")}>
                        <Ionicons name="close-circle" size={20} color={COLORS.textMuted} />
                    </TouchableOpacity>
                )}
            </View>

            {/* Songs List */}
            {searching ? (
                <View style={styles.searchingContainer}>
                    <ActivityIndicator size="small" color={COLORS.primary} />
                    <Text style={styles.searchingText}>Searching...</Text>
                </View>
            ) : (
                <FlatList
                    data={displaySongs}
                    keyExtractor={(item) => item._id}
                    renderItem={renderSongItem}
                    contentContainerStyle={{ paddingBottom: 100 }}
                    ListEmptyComponent={
                        <View style={styles.emptyContainer}>
                            <Ionicons name="musical-notes-outline" size={64} color={COLORS.textMuted} />
                            <Text style={styles.emptyText}>{searchQuery.trim() ? "No songs found" : "No songs available"}</Text>
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
        backgroundColor: COLORS.background,
        alignItems: "center",
        justifyContent: "center",
    },
    header: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
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
        color: COLORS.text,
        fontSize: 18,
        fontWeight: "700",
    },
    doneBtn: {
        backgroundColor: COLORS.primary,
        paddingHorizontal: 16,
        paddingVertical: 8,
        borderRadius: 20,
    },
    doneBtnDisabled: {
        opacity: 0.5,
    },
    doneBtnText: {
        color: "#fff",
        fontSize: 14,
        fontWeight: "600",
    },
    searchContainer: {
        flexDirection: "row",
        alignItems: "center",
        backgroundColor: COLORS.backgroundLight,
        marginHorizontal: 16,
        marginVertical: 12,
        paddingHorizontal: 14,
        borderRadius: BORDER_RADIUS.md,
        borderWidth: 1,
        borderColor: COLORS.border,
    },
    searchInput: {
        flex: 1,
        color: COLORS.text,
        fontSize: 16,
        paddingVertical: 12,
        marginLeft: 10,
    },
    searchingContainer: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "center",
        gap: 8,
        paddingVertical: 20,
    },
    searchingText: {
        color: COLORS.textSecondary,
        fontSize: 14,
    },
    songItem: {
        flexDirection: "row",
        alignItems: "center",
        paddingHorizontal: 16,
        paddingVertical: 10,
    },
    songItemSelected: {
        backgroundColor: `${COLORS.primary}15`,
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
    checkbox: {
        width: 24,
        height: 24,
        borderRadius: 12,
        borderWidth: 2,
        borderColor: COLORS.border,
        alignItems: "center",
        justifyContent: "center",
    },
    checkboxSelected: {
        backgroundColor: COLORS.primary,
        borderColor: COLORS.primary,
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
})
