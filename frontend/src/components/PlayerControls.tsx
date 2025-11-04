import React from "react";
import { View, TouchableOpacity, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";

type Props = {
  isPlaying: boolean;
  onPlayPause: () => void;
  onNext: () => void;
  onPrev: () => void;
};

const PlayerControls: React.FC<Props> = ({ isPlaying, onPlayPause, onNext, onPrev }) => {
  return (
    <View style={styles.controls}>
      <TouchableOpacity onPress={onPrev}>
        <Ionicons name="play-skip-back" size={36} />
      </TouchableOpacity>

      <TouchableOpacity onPress={onPlayPause} style={styles.playButton}>
        <Ionicons name={isPlaying ? "pause" : "play"} size={36} color="#fff" />
      </TouchableOpacity>

      <TouchableOpacity onPress={onNext}>
        <Ionicons name="play-skip-forward" size={36} />
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  controls: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    width: "60%",
    marginTop: 24,
  },
  playButton: {
    backgroundColor: "#1DB954",
    width: 64,
    height: 64,
    borderRadius: 32,
    alignItems: "center",
    justifyContent: "center",
  },
});

export default PlayerControls;
