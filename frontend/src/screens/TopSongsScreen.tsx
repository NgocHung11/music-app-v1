"use client"

import { useEffect, useState, useCallback, useRef } from "react"
import { View, Text, FlatList, RefreshControl, TouchableOpacity, StyleSheet, ActivityIndicator } from "react-native"
import { Ionicons } from "@expo/vector-icons"
import { SafeAreaView } from "react-native-safe-area-context"
import { useNavigation, useRoute } from "@react-navigation/native"
import { songApi } from "../api"
import { usePlayer } from "../context/PlayerContext"
import type { Song } from "../types"
import { COLORS } from "../constants/theme"
import SongItem from "../components/SongItem"

type TopPeriod = "day" | "week" | "month"

export default function TopSongsScreen() {
    const navigation = useNavigation<any>()
    const route = useRoute<any>()
    const { period: initialPeriod = "week" } = route.params || {}

    const { playSongs } = usePlayer()
    const [songs, setSongs] = useState<Song[]>([])
    const [initialLoading, setInitialLoading] = useState(true)
    const [switching, setSwitching] = useState(false)
    const [refreshing, setRefreshing] = useState(false)
    const [period, setPeriod] = useState<TopPeriod>(initialPeriod)
    const isFirstLoad = useRef(true)

    const fetchTopSongs = useCallback(
        async (isInitial = false) => {
            try {
                if (isInitial) {
                    setInitialLoading(true)
                } else {
                    setSwitching(true)
                }
                const res = await songApi.getTopSongs(period, 50)
                const topSongsData = res.data.songs ?? []
                setSongs(topSongsData.map((item: any) => item.song || item).filter(Boolean))
            } catch (error) {
                console.warn("fetchTopSongs error", error)
            } finally {
                setInitialLoading(false)
                setSwitching(false)
                setRefreshing(false)
            }
        },
        [period],
    )

    useEffect(() => {
        if (isFirstLoad.current) {
            isFirstLoad.current = false
            fetchTopSongs(true)
        } else {
            fetchTopSongs(false)
        }
    }, [period])

    const onRefresh = async () => {
        setRefreshing(true)
        await fetchTopSongs(false)
    }

    const handlePlaySong = (index: number) => {
        playSongs(songs, index)
    }

    const handlePlayAll = () => {
        if (songs.length > 0) {
            playSongs(songs, 0)
        }
    }

    if (initialLoading) {
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
                <Text style={styles.title}>Top Songs</Text>
                <TouchableOpacity style={styles.playAllBtn} onPress={handlePlayAll}>
                    <Ionicons name="play" size={20} color="#fff" />
                </TouchableOpacity>
            </View>

            {/* Period Filter */}
            <View style={styles.periodFilter}>
                {(["day", "week", "month"] as TopPeriod[]).map((p) => (
                    <TouchableOpacity
                        key={p}
                        style={[styles.periodBtn, period === p && styles.periodBtnActive]}
                        onPress={() => setPeriod(p)}
                        disabled={switching}
                    >
                        <Text style={[styles.periodText, period === p && styles.periodTextActive]}>
                            {p === "day" ? "Day" : p === "week" ? "Week" : "Month"}
                        </Text>
                    </TouchableOpacity>
                ))}
                {switching && <ActivityIndicator size="small" color={COLORS.primary} style={styles.switchingIndicator} />}
            </View>

            <FlatList
                data={songs}
                keyExtractor={(item) => item._id}
                contentContainerStyle={[styles.listContent, switching && styles.listContentSwitching]}
                showsVerticalScrollIndicator={false}
                refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={COLORS.primary} />}
                renderItem={({ item, index }) => <SongItem song={item} index={index} onPress={() => handlePlaySong(index)} />}
                ListEmptyComponent={
                    <View style={styles.emptyContainer}>
                        <Ionicons name="musical-notes-outline" size={64} color={COLORS.textSecondary} />
                        <Text style={styles.emptyText}>Không có bài hát</Text>
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
    playAllBtn: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: COLORS.primary,
        alignItems: "center",
        justifyContent: "center",
    },
    periodFilter: {
        flexDirection: "row",
        alignItems: "center",
        paddingHorizontal: 16,
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
    switchingIndicator: {
        marginLeft: 8,
    },
    listContent: {
        paddingBottom: 140,
    },
    listContentSwitching: {
        opacity: 0.6,
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
