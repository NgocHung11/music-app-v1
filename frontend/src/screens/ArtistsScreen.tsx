"use client"

import { useEffect, useState, useCallback } from "react"
import { View, Text, FlatList, RefreshControl, TouchableOpacity, StyleSheet, ActivityIndicator } from "react-native"
import { Ionicons } from "@expo/vector-icons"
import { SafeAreaView } from "react-native-safe-area-context"
import { useNavigation } from "@react-navigation/native"
import { artistApi } from "../api"
import type { Artist } from "../types"
import { COLORS } from "../constants/theme"
import ArtistCard from "../components/ArtistCard"

export default function ArtistsScreen() {
    const navigation = useNavigation<any>()
    const [artists, setArtists] = useState<Artist[]>([])
    const [loading, setLoading] = useState(true)
    const [refreshing, setRefreshing] = useState(false)
    const [page, setPage] = useState(1)
    const [hasMore, setHasMore] = useState(true)

    const fetchArtists = useCallback(async (pageNum = 1, refresh = false) => {
        try {
            const res = await artistApi.getAll({ page: pageNum, limit: 20 })
            const newArtists = res.data.artists ?? []

            if (refresh) {
                setArtists(newArtists)
            } else {
                setArtists((prev) => (pageNum === 1 ? newArtists : [...prev, ...newArtists]))
            }
            setHasMore(newArtists.length === 20)
        } catch (error) {
            console.warn("fetchArtists error", error)
        } finally {
            setLoading(false)
            setRefreshing(false)
        }
    }, [])

    useEffect(() => {
        fetchArtists()
    }, [fetchArtists])

    const onRefresh = async () => {
        setRefreshing(true)
        setPage(1)
        await fetchArtists(1, true)
    }

    const onEndReached = () => {
        if (!loading && hasMore) {
            const nextPage = page + 1
            setPage(nextPage)
            fetchArtists(nextPage)
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
            {/* Header */}
            <View style={styles.header}>
                <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
                    <Ionicons name="arrow-back" size={24} color={COLORS.text} />
                </TouchableOpacity>
                <Text style={styles.title}>Popular Artists</Text>
                <View style={{ width: 40 }} />
            </View>

            <FlatList
                data={artists}
                numColumns={2}
                keyExtractor={(item) => item._id}
                contentContainerStyle={styles.listContent}
                columnWrapperStyle={styles.columnWrapper}
                showsVerticalScrollIndicator={false}
                refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={COLORS.primary} />}
                onEndReached={onEndReached}
                onEndReachedThreshold={0.5}
                renderItem={({ item }) => (
                    <ArtistCard
                        artist={item}
                        onPress={() => navigation.navigate("Artist", { artist: item })}
                    />
                )}
                ListEmptyComponent={
                    <View style={styles.emptyContainer}>
                        <Ionicons name="people-outline" size={64} color={COLORS.textSecondary} />
                        <Text style={styles.emptyText}>No artists found</Text>
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
    title: {
        color: COLORS.text,
        fontSize: 20,
        fontWeight: "700",
    },
    listContent: {
        paddingHorizontal: 16,
        paddingBottom: 140,
    },
    columnWrapper: {
        justifyContent: "space-between",
    },
    artistCard: {
        width: "48%",
        marginBottom: 16,
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
