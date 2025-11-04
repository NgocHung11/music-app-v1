import React from "react";
import { View, Text, Image, TouchableOpacity, StyleSheet } from "react-native";
import { usePlayer } from "../context/PlayerContext";
import { Ionicons } from "@expo/vector-icons";
import ProgressBar from "../components/ProgressBar";

export default function PlayerScreen() {
  const { currentSong, isPlaying, positionMillis, durationMillis, togglePlay, nextSong, prevSong } =
    usePlayer();

  if (!currentSong) {
    return (
      <View style={styles.emptyContainer}>
        <Ionicons name="headset-outline" size={80} color="#3c60d6" style={{ marginBottom: 20 }} />
        <Text style={styles.emptyTitle}>Chưa có bài hát nào được chọn 🎵</Text>
        <Text style={styles.emptySubtitle}>
          Hãy chọn một bài hát từ danh sách để bắt đầu nghe nhé!
        </Text>
      </View>
    );
  }


  return (
    <View style={styles.container}>
      <Image source={{ uri: currentSong.coverUrl }} style={styles.cover} />
      <Text style={styles.title}>{currentSong.title}</Text>
      <Text style={styles.artist}>{currentSong.artist}</Text>

      <ProgressBar positionMillis={positionMillis} durationMillis={durationMillis} />

      <View style={styles.controls}>
        <TouchableOpacity onPress={prevSong}>
          <Ionicons name="play-skip-back" size={42} color="white" />
        </TouchableOpacity>

        <TouchableOpacity onPress={togglePlay}>
          <Ionicons name={isPlaying ? "pause-circle" : "play-circle"} size={64} color="white" />
        </TouchableOpacity>

        <TouchableOpacity onPress={nextSong}>
          <Ionicons name="play-skip-forward" size={42} color="white" />
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#000", alignItems: "center", justifyContent: "center" },
  cover: { width: 280, height: 280, borderRadius: 8, marginBottom: 30 },
  title: { color: "white", fontSize: 22, fontWeight: "bold" },
  artist: { color: "#aaa", fontSize: 16, marginBottom: 20 },
  controls: { flexDirection: "row", alignItems: "center", gap: 25 },
  center: { flex: 1, justifyContent: "center", alignItems: "center" },
  emptyContainer: {
    flex: 1,
    backgroundColor: "#000",
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 24,
  },
  emptyTitle: {
    color: "#3c60d6",
    fontSize: 20,
    fontWeight: "700",
    textAlign: "center",
    marginBottom: 6,
  },
  emptySubtitle: {
    color: "#aaa",
    fontSize: 14,
    textAlign: "center",
    lineHeight: 20,
  },
});
