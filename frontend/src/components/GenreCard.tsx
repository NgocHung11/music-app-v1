import type React from "react"
import { Text, TouchableOpacity, StyleSheet, ImageBackground } from "react-native"
import { LinearGradient } from "expo-linear-gradient"
import { BORDER_RADIUS } from "../constants/theme"
import type { Genre } from "../types"

type Props = {
  genre: Genre
  onPress: () => void
}

// Màu gradient cho từng genre
const GENRE_COLORS: Record<string, [string, string]> = {
  pop: ["#FF6B6B", "#FF8E53"],
  rock: ["#667EEA", "#764BA2"],
  hiphop: ["#11998E", "#38EF7D"],
  jazz: ["#F093FB", "#F5576C"],
  classical: ["#4FACFE", "#00F2FE"],
  electronic: ["#43E97B", "#38F9D7"],
  rnb: ["#FA709A", "#FEE140"],
  country: ["#A8EB12", "#CAFC2B"],
  default: ["#4a5fd9", "#7c3aed"],
}

const GenreCard: React.FC<Props> = ({ genre, onPress }) => {
  const colors = GENRE_COLORS[genre.name.toLowerCase().replace(/[^a-z]/g, "")] || GENRE_COLORS.default

  return (
    <TouchableOpacity style={styles.container} onPress={onPress} activeOpacity={0.8}>
      {genre.coverImage ? (
        <ImageBackground
          source={{ uri: genre.coverImage }}
          style={styles.background}
          imageStyle={styles.backgroundImage}
        >
          <LinearGradient colors={["transparent", "rgba(0,0,0,0.7)"]} style={styles.overlay}>
            <Text style={styles.title}>{genre.name}</Text>
          </LinearGradient>
        </ImageBackground>
      ) : (
        <LinearGradient colors={colors} style={styles.gradient}>
          <Text style={styles.title}>{genre.name}</Text>
        </LinearGradient>
      )}
    </TouchableOpacity>
  )
}

const styles = StyleSheet.create({
  container: {
    width: 140,
    height: 80,
    marginRight: 12,
    borderRadius: BORDER_RADIUS.md,
    overflow: "hidden",
  },
  background: {
    flex: 1,
  },
  backgroundImage: {
    borderRadius: BORDER_RADIUS.md,
  },
  overlay: {
    flex: 1,
    justifyContent: "flex-end",
    padding: 12,
  },
  gradient: {
    flex: 1,
    justifyContent: "flex-end",
    padding: 12,
    borderRadius: BORDER_RADIUS.md,
  },
  title: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "800",
    letterSpacing: 0.5,
  },
})

export default GenreCard
