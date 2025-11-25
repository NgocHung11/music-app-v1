import { useEffect, useState, useCallback } from "react"
import { View, Text, FlatList, RefreshControl, TouchableOpacity, StyleSheet, ActivityIndicator } from "react-native"
import { Ionicons } from "@expo/vector-icons"
import { SafeAreaView } from "react-native-safe-area-context"
import { useNavigation, useRoute } from "@react-navigation/native"
import { artistApi } from "../api"
import type { Artist, Album } from "../types"
import { COLORS } from "../constants/theme"
import AlbumCard from "../components/AlbumCard"

export default function ArtistAlbumsScreen() {
    const navigation = useNavigation<any>()
    const route = useRoute<any>()
    const { artist } = route.params as { artist: Artist }

    const [albums, setAlbums] = useState<Album[]>([])
    const [loading, setLoading] = useState(true)
    const [refreshing, setRefreshing] = useState(false)

    const fetchAlbums = useCallback(async () => {
        try {
            const res = await artistApi.getAlbums(artist._id)
            setAlbums(res.data.albums ?? [])
        } catch (error) {
            console.warn("fetchAlbums error", error)
        } finally {
            setLoading(false)
            setRefreshing(false)
        }
    }, [artist._id])

    useEffect(() => {
        fetchAlbums()
    }, [fetchAlbums])

    const onRefresh = async () => {
        setRefreshing(true)
        await fetchAlbums()
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
                <View style={styles.headerInfo}>
                    <Text style={styles.title}>{artist.name}</Text>
                    <Text style={styles.subtitle}>All Albums</Text>
                </View>
                <View style={{ width: 40 }} />
            </View>

            <FlatList
                data={albums}
                numColumns={2}
                keyExtractor={(item) => item._id}
                contentContainerStyle={styles.listContent}
                columnWrapperStyle={styles.columnWrapper}
                showsVerticalScrollIndicator={false}
                refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={COLORS.primary} />}
                renderItem={({ item }) => (
                    <AlbumCard
                        album={item}
                        onPress={() => navigation.navigate("Album", { album: item })}
                    />
                )}
                ListEmptyComponent={
                    <View style={styles.emptyContainer}>
                        <Ionicons name="disc-outline" size={64} color={COLORS.textSecondary} />
                        <Text style={styles.emptyText}>No albums found</Text>
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
    listContent: {
        paddingHorizontal: 16,
        paddingBottom: 140,
    },
    columnWrapper: {
        justifyContent: "space-between",
    },
    albumCard: {
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
