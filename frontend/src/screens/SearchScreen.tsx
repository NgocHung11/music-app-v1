"use client"

import { useEffect, useState, useCallback } from "react"
import { View, Text, TextInput, FlatList, TouchableOpacity, StyleSheet, ActivityIndicator } from "react-native"
import { Ionicons } from "@expo/vector-icons"
import { LinearGradient } from "expo-linear-gradient"
import { SafeAreaView } from "react-native-safe-area-context"
import { debounce } from "lodash"
import { useNavigation } from "@react-navigation/native"
import api from "../api"
import { usePlayer } from "../context/PlayerContext"
import SongItem, { type Song } from "../components/SongItem"

export default function SearchScreen() {
    const [query, setQuery] = useState("")
    const [songs, setSongs] = useState<Song[]>([])
    const [loading, setLoading] = useState(false)
    const [searched, setSearched] = useState(false)

    const navigation = useNavigation<any>()
    const { setQueue } = usePlayer()

    const fetchSongs = async (q: string) => {
        if (!q.trim()) {
            setSongs([])
            return
        }

        try {
            setLoading(true)
            const res = await api.get(`/songs?q=${encodeURIComponent(q)}`)
            setSongs(res.data.songs ?? [])
        } catch (error) {
            console.warn("searchSongs error", error)
        } finally {
            setLoading(false)
        }
    }

    const debouncedSearch = useCallback(debounce(fetchSongs, 400), [])

    useEffect(() => {
        debouncedSearch(query)
    }, [query])

    const renderSuggestion = ({ item, index }: { item: Song; index: number }) => (
        <TouchableOpacity
            style={styles.suggestionItem}
            onPress={() => {
                setQuery(item.title)
                setSearched(true)
                fetchSongs(item.title)
            }}
            activeOpacity={0.7}
        >
            <View style={styles.suggestionIcon}>
                <Ionicons name="search" size={18} color="#9999b3" />
            </View>
            <Text style={styles.suggestionText}>{item.title}</Text>
            <Ionicons name="arrow-forward" size={16} color="#4a5fd9" />
        </TouchableOpacity>
    )

    const renderResult = ({ item, index }: { item: Song; index: number }) => (
        <SongItem
            song={item}
            onPress={() => {
                setQueue(songs, index)
                navigation.navigate("MainTabs", { screen: "Explore" })
            }}
        />
    )

    return (
        <SafeAreaView style={styles.container} edges={["top", "left", "right"]}>
            <LinearGradient colors={["#1a1a2e", "#0a0a12"]} style={styles.searchContainer}>
                <View style={styles.searchBar}>
                    <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
                        <Ionicons name="arrow-back" size={24} color="#fff" />
                    </TouchableOpacity>

                    <View style={styles.inputWrapper}>
                        <Ionicons name="search" size={20} color="#9999b3" style={{ marginRight: 10 }} />
                        <TextInput
                            placeholder="Search songs..."
                            placeholderTextColor="#666"
                            value={query}
                            onChangeText={(text) => {
                                setQuery(text)
                                setSearched(false)
                            }}
                            style={styles.input}
                            autoFocus
                        />
                        {query.length > 0 && (
                            <TouchableOpacity onPress={() => setQuery("")} style={styles.clearBtn}>
                                <Ionicons name="close-circle" size={20} color="#666" />
                            </TouchableOpacity>
                        )}
                    </View>
                </View>
            </LinearGradient>

            {loading && (
                <View style={styles.center}>
                    <ActivityIndicator size="large" color="#4a5fd9" />
                    <Text style={styles.loadingText}>Searching...</Text>
                </View>
            )}

            {!loading && (
                <FlatList
                    data={songs}
                    keyExtractor={(item) => item._id}
                    renderItem={searched ? renderResult : renderSuggestion}
                    ListEmptyComponent={
                        query.length === 0 ? (
                            <View style={styles.emptyState}>
                                <Ionicons name="musical-note" size={80} color="#2a2a3e" style={{ marginBottom: 20 }} />
                                <Text style={styles.emptyTitle}>Find Your Music</Text>
                                <Text style={styles.emptySubtitle}>Search for songs, artists, or albums</Text>
                            </View>
                        ) : (
                            <View style={styles.emptyState}>
                                <Ionicons name="sad-outline" size={80} color="#2a2a3e" style={{ marginBottom: 20 }} />
                                <Text style={styles.emptyTitle}>No Results Found</Text>
                                <Text style={styles.emptySubtitle}>Try searching with different keywords</Text>
                            </View>
                        )
                    }
                    contentContainerStyle={{ paddingBottom: 120, paddingTop: 8 }}
                    showsVerticalScrollIndicator={false}
                />
            )}
        </SafeAreaView>
    )
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "#000",
    },
    searchContainer: {
        paddingBottom: 16,
    },
    searchBar: {
        flexDirection: "row",
        alignItems: "center",
        paddingHorizontal: 16,
        paddingTop: 8,
        gap: 12,
    },
    backBtn: {
        padding: 4,
    },
    inputWrapper: {
        flex: 1,
        flexDirection: "row",
        alignItems: "center",
        backgroundColor: "#1a1a2e",
        borderRadius: 12,
        paddingHorizontal: 14,
        paddingVertical: 12,
        borderWidth: 1,
        borderColor: "#2a2a3e",
    },
    input: {
        flex: 1,
        color: "#fff",
        fontSize: 16,
        fontWeight: "500",
    },
    clearBtn: {
        padding: 2,
    },
    suggestionItem: {
        flexDirection: "row",
        alignItems: "center",
        paddingVertical: 14,
        paddingHorizontal: 20,
        marginHorizontal: 16,
        marginVertical: 4,
        backgroundColor: "#0d0d15",
        borderRadius: 12,
        borderWidth: 1,
        borderColor: "#1a1a2e",
    },
    suggestionIcon: {
        width: 36,
        height: 36,
        borderRadius: 18,
        backgroundColor: "#1a1a2e",
        alignItems: "center",
        justifyContent: "center",
        marginRight: 12,
    },
    suggestionText: {
        flex: 1,
        color: "#fff",
        fontSize: 15,
        fontWeight: "500",
        letterSpacing: 0.3,
    },
    center: {
        alignItems: "center",
        justifyContent: "center",
        marginTop: 100,
    },
    loadingText: {
        color: "#9999b3",
        fontSize: 16,
        fontWeight: "600",
        marginTop: 16,
    },
    emptyState: {
        alignItems: "center",
        justifyContent: "center",
        paddingHorizontal: 40,
        marginTop: 100,
    },
    emptyTitle: {
        color: "#fff",
        fontSize: 22,
        fontWeight: "800",
        marginBottom: 8,
        letterSpacing: 0.5,
    },
    emptySubtitle: {
        color: "#9999b3",
        fontSize: 15,
        textAlign: "center",
        lineHeight: 22,
        letterSpacing: 0.3,
    },
})
