import { View, Text, Image, TouchableOpacity, StyleSheet, Dimensions } from "react-native"
import { usePlayer } from "../context/PlayerContext"
import { Ionicons } from "@expo/vector-icons"
import { LinearGradient } from "expo-linear-gradient"
import ProgressBar from "../components/ProgressBar"

const { width } = Dimensions.get("window")

export default function PlayerScreen() {
  const { currentSong, isPlaying, positionMillis, durationMillis, togglePlay, nextSong, prevSong } = usePlayer()

  if (!currentSong) {
    return (
      <LinearGradient colors={["#0a0a12", "#1a1a2e"]} style={styles.emptyContainer}>
        <Ionicons name="headset-outline" size={96} color="#4a5fd9" style={{ marginBottom: 24 }} />
        <Text style={styles.emptyTitle}>No song selected</Text>
        <Text style={styles.emptySubtitle}>Choose a song from your library to start listening</Text>
      </LinearGradient>
    )
  }

  return (
    <LinearGradient colors={["#0a0a12", "#1a1a2e", "#0a0a12"]} style={styles.container}>
      <View style={styles.coverContainer}>
        <View style={styles.coverWrapper}>
          <Image source={{ uri: currentSong.coverUrl }} style={styles.cover} />
        </View>
      </View>

      <View style={styles.infoContainer}>
        <Text style={styles.title} numberOfLines={1}>
          {currentSong.title}
        </Text>
        <Text style={styles.artist} numberOfLines={1}>
          {currentSong.artist}
        </Text>
      </View>

      <View style={styles.progressContainer}>
        <ProgressBar positionMillis={positionMillis} durationMillis={durationMillis} />
      </View>

      <View style={styles.controls}>
        <TouchableOpacity onPress={prevSong} style={styles.sideBtn}>
          <Ionicons name="play-skip-back" size={32} color="#fff" />
        </TouchableOpacity>

        <TouchableOpacity onPress={togglePlay} style={styles.playBtn}>
          <Ionicons name={isPlaying ? "pause" : "play"} size={40} color="#fff" />
        </TouchableOpacity>

        <TouchableOpacity onPress={nextSong} style={styles.sideBtn}>
          <Ionicons name="play-skip-forward" size={32} color="#fff" />
        </TouchableOpacity>
      </View>

      <View style={styles.actions}>
        <TouchableOpacity style={styles.actionBtn}>
          <Ionicons name="heart-outline" size={24} color="#fff" />
        </TouchableOpacity>
        <TouchableOpacity style={styles.actionBtn}>
          <Ionicons name="share-outline" size={24} color="#fff" />
        </TouchableOpacity>
        <TouchableOpacity style={styles.actionBtn}>
          <Ionicons name="ellipsis-horizontal" size={24} color="#fff" />
        </TouchableOpacity>
      </View>
    </LinearGradient>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: 60,
    paddingHorizontal: 24,
    paddingBottom: 40,
  },
  coverContainer: {
    alignItems: "center",
    marginBottom: 40,
  },
  coverWrapper: {
    shadowColor: "#4a5fd9",
    shadowOffset: { width: 0, height: 20 },
    shadowOpacity: 0.6,
    shadowRadius: 30,
    elevation: 20,
    borderRadius: 20,
  },
  cover: {
    width: width - 80,
    height: width - 80,
    borderRadius: 20,
    backgroundColor: "#1a1a2e",
  },
  infoContainer: {
    alignItems: "center",
    marginBottom: 32,
    paddingHorizontal: 20,
  },
  title: {
    color: "#fff",
    fontSize: 26,
    fontWeight: "800",
    textAlign: "center",
    letterSpacing: 0.5,
    marginBottom: 8,
  },
  artist: {
    color: "#9999b3",
    fontSize: 17,
    fontWeight: "500",
    textAlign: "center",
    letterSpacing: 0.3,
  },
  progressContainer: {
    marginBottom: 40,
  },
  controls: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 32,
    marginBottom: 32,
  },
  sideBtn: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: "#1a1a2e",
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: "#2a2a3e",
  },
  playBtn: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: "#4a5fd9",
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#4a5fd9",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.6,
    shadowRadius: 16,
    elevation: 12,
  },
  actions: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    gap: 40,
  },
  actionBtn: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: "#1a1a2e",
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: "#2a2a3e",
  },
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 32,
  },
  emptyTitle: {
    color: "#fff",
    fontSize: 24,
    fontWeight: "800",
    textAlign: "center",
    marginBottom: 12,
    letterSpacing: 0.5,
  },
  emptySubtitle: {
    color: "#9999b3",
    fontSize: 16,
    textAlign: "center",
    lineHeight: 24,
    letterSpacing: 0.3,
  },
})
