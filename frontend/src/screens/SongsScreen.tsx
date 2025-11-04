import React, { useEffect, useState } from "react";
import {
  View,
  FlatList,
  ActivityIndicator,
  RefreshControl,
  Text,
  StyleSheet,
  TouchableOpacity,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { SafeAreaView } from "react-native-safe-area-context";
import { useNavigation } from "@react-navigation/native";
import api from "../api";
import SongItem, { Song } from "../components/SongItem";
import { usePlayer } from "../context/PlayerContext";

export default function SongsScreen() {
  const [songs, setSongs] = useState<Song[]>([]);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  const { setQueue } = usePlayer();
  const navigation = useNavigation<any>();

  const fetchSongs = async () => {
    try {
      setLoading(true);
      const res = await api.get("/songs");
      setSongs(res.data.songs ?? []);
    } catch (err) {
      console.warn("fetchSongs error", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSongs();
  }, []);

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchSongs();
    setRefreshing(false);
  };

  return (
    <SafeAreaView style={styles.container} edges={["top", "left", "right"]}>
      {/* 🔹 Header App */}
      <View style={styles.header}>
        <Text style={styles.title}>Music App 🎵</Text>

        <TouchableOpacity
          onPress={() => navigation.navigate("Search")}
          style={styles.searchBtn}
        >
          <Ionicons name="search" size={24} color="white" />
        </TouchableOpacity>
      </View>

      {/* 🔹 Danh sách nhạc */}
      <View style={{ flex: 1 }}>
        {loading && songs.length === 0 ? (
          <View style={styles.center}>
            <ActivityIndicator size="large" color="#1DB954" />
          </View>
        ) : (
          <FlatList
            data={songs}
            keyExtractor={(item) => item._id}
            renderItem={({ item, index }) => (
              <SongItem
                song={item}
                onPress={() => setQueue(songs, index)}
              />
            )}
            refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
            ListEmptyComponent={
              !loading ? (
                <View style={styles.center}>
                  <Text>Không có bài hát nào.</Text>
                </View>
              ) : null
            }
            contentContainerStyle={{ paddingBottom: 80 }}
          />
        )}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#000" },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingTop: 6,
    paddingBottom: 10,
  },
  title: {
    color: "#3c60d6ff",
    fontSize: 22,
    fontWeight: "bold",
  },
  searchBtn: {
    backgroundColor: "#591db933",
    padding: 8,
    borderRadius: 50,
  },
  center: { flex: 1, alignItems: "center", justifyContent: "center" },
});
