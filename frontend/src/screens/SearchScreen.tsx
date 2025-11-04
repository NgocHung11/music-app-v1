import React, { useEffect, useState, useCallback } from "react";
import {
    View,
    Text,
    TextInput,
    FlatList,
    TouchableOpacity,
    StyleSheet,
    ActivityIndicator,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { debounce } from "lodash";
import { useNavigation } from "@react-navigation/native";
import api from "../api";
import { usePlayer } from "../context/PlayerContext";
import SongItem, { Song } from "../components/SongItem";

export default function SearchScreen() {
    const [query, setQuery] = useState("");
    const [songs, setSongs] = useState<Song[]>([]);
    const [loading, setLoading] = useState(false);
    const [searched, setSearched] = useState(false);

    const navigation = useNavigation<any>();
    const { setQueue } = usePlayer();

    const fetchSongs = async (q: string) => {
        if (!q.trim()) {
            setSongs([]);
            return;
        }

        try {
            setLoading(true);
            const res = await api.get(`/songs?q=${encodeURIComponent(q)}`);
            setSongs(res.data.songs ?? []);
        } catch (error) {
            console.warn("searchSongs error", error);
        } finally {
            setLoading(false);
        }
    };

    // Debounce tránh gọi API liên tục
    const debouncedSearch = useCallback(debounce(fetchSongs, 400), []);

    // Khi query thay đổi, gọi API
    useEffect(() => {
        debouncedSearch(query);
    }, [query]);

    // Gợi ý 
    const renderSuggestion = ({ item, index }: { item: Song; index: number }) => (
        <TouchableOpacity
            style={styles.suggestionItem}
            onPress={() => {
                setQuery(item.title);
                setSearched(true);
                fetchSongs(item.title);
            }}
        >
            <Ionicons name="search" size={18} color="#888" style={{ marginRight: 10 }} />
            <Text style={styles.suggestionText}>{item.title}</Text>
        </TouchableOpacity>
    );

    // Kết quả (sau khi nhấn tìm)
    const renderResult = ({ item, index }: { item: Song; index: number }) => (
        <SongItem
            song={item}
            onPress={() => {
                setQueue(songs, index);
                navigation.navigate("MainTabs", { screen: "Explore" });
            }}
        />
    );

    return (
        <View style={styles.container}>
            {/* 🔹 Thanh tìm kiếm */}
            <View style={styles.searchBar}>
                <TouchableOpacity onPress={() => navigation.goBack()}>
                    <Ionicons name="arrow-back" size={24} color="#fff" style={{ marginRight: 10 }} />
                </TouchableOpacity>
                <TextInput
                    placeholder="Tìm kiếm bài hát..."
                    placeholderTextColor="#999"
                    value={query}
                    onChangeText={(text) => {
                        setQuery(text);
                        setSearched(false);
                    }}
                    style={styles.input}
                    autoFocus
                />
                {query.length > 0 && (
                    <TouchableOpacity onPress={() => setQuery("")}>
                        <Ionicons name="close" size={22} color="#aaa" />
                    </TouchableOpacity>
                )}
            </View>

            {/* 🔹 Loading */}
            {loading && (
                <View style={styles.center}>
                    <ActivityIndicator size="large" color="#1DB954" />
                </View>
            )}

            {/* 🔹 Hiển thị kết quả hoặc gợi ý */}
            {!loading && (
                <FlatList
                    data={songs}
                    keyExtractor={(item) => item._id}
                    renderItem={searched ? renderResult : renderSuggestion}
                    ListEmptyComponent={
                        query.length === 0 ? (
                            <View style={styles.center}>
                                <Text style={{ color: "#666" }}>Nhập tên bài hát để tìm kiếm</Text>
                            </View>
                        ) : (
                            <View style={styles.center}>
                                <Text style={{ color: "#666" }}>Không tìm thấy bài hát phù hợp</Text>
                            </View>
                        )
                    }
                    contentContainerStyle={{ paddingBottom: 100 }}
                />
            )}
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "#000",
        paddingTop: 50,
        paddingHorizontal: 16,
    },
    searchBar: {
        flexDirection: "row",
        alignItems: "center",
        backgroundColor: "#111",
        borderRadius: 8,
        paddingHorizontal: 12,
        paddingVertical: 8,
        marginBottom: 10,
    },
    input: {
        flex: 1,
        color: "#fff",
        fontSize: 16,
    },
    suggestionItem: {
        flexDirection: "row",
        alignItems: "center",
        paddingVertical: 10,
        borderBottomColor: "#222",
        borderBottomWidth: 1,
    },
    suggestionText: {
        color: "#ddd",
        fontSize: 16,
    },
    center: { alignItems: "center", justifyContent: "center", marginTop: 30 },
});
