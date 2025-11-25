import type React from "react"
import { View, Text, Image, TouchableOpacity, StyleSheet } from "react-native"
import { Ionicons } from "@expo/vector-icons"

export type Song = {
  _id: string
  title: string
  artist: string
  coverUrl: string
  audioUrl: string
  duration?: number
}

type Props = {
  song: Song
  onPress: () => void
}

const SongItem: React.FC<Props> = ({ song, onPress }) => {
  return (
    <TouchableOpacity style={styles.item} onPress={onPress} activeOpacity={0.7}>
      <View style={styles.coverWrapper}>
        <Image source={{ uri: song.coverUrl }} style={styles.cover} />
      </View>

      <View style={styles.meta}>
        <Text numberOfLines={1} style={styles.title}>
          {song.title}
        </Text>
        <Text numberOfLines={1} style={styles.artist}>
          {song.artist}
        </Text>
      </View>

      <Ionicons name="play-circle-outline" size={24} color="#4a5fd9" style={styles.playIcon} />
    </TouchableOpacity>
  )
}

const styles = StyleSheet.create({
  item: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 10,
    paddingHorizontal: 16,
    marginHorizontal: 12,
    marginVertical: 4,
    backgroundColor: "#0d0d15",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#1a1a2e",
  },
  coverWrapper: {
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.5,
    elevation: 4,
    borderRadius: 10,
  },
  cover: {
    width: 60,
    height: 60,
    borderRadius: 10,
    backgroundColor: "#1a1a2e",
  },
  meta: {
    flex: 1,
    marginLeft: 14,
  },
  title: {
    fontSize: 16,
    fontWeight: "600",
    color: "#fff",
    letterSpacing: 0.3,
  },
  artist: {
    color: "#9999b3",
    marginTop: 5,
    fontSize: 13,
    letterSpacing: 0.2,
  },
  playIcon: {
    marginLeft: 8,
    opacity: 0.7,
  },
})

export default SongItem
