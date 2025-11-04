import React from "react";
import { View, Text, Image, TouchableOpacity } from "react-native";
import { usePlayer } from "../context/PlayerContext";
import { useNavigation } from "@react-navigation/native";
import { Ionicons } from "@expo/vector-icons";

export default function MiniPlayer() {
  const { currentSong, isPlaying, togglePlay, nextSong, prevSong } = usePlayer();
  const navigation = useNavigation<any>();

  if (!currentSong) return null;

  return (
    <TouchableOpacity
      activeOpacity={0.9}
      onPress={() =>
        navigation.navigate("MainTabs", { screen: "Explore" })
      }
      style={{
        position: "absolute",
        bottom: 60,
        left: 0,
        right: 0,
        backgroundColor: "#222",
        flexDirection: "row",
        alignItems: "center",
        paddingHorizontal: 10,
        paddingVertical: 8,
        marginBottom: 15,
        borderRadius: 8,
        marginHorizontal: 10,
      }}
    >
      <Image
        source={{ uri: currentSong.coverUrl }}
        style={{ width: 48, height: 48, borderRadius: 6, marginRight: 10 }}
      />

      <View style={{ flex: 1 }}>
        <Text style={{ color: "#fff", fontWeight: "bold" }}>{currentSong.title}</Text>
        <Text style={{ color: "#ccc", fontSize: 12 }}>{currentSong.artist}</Text>
      </View>

      <TouchableOpacity onPress={prevSong}>
        <Ionicons name="play-skip-back" size={22} color="white" style={{ marginHorizontal: 5 }} />
      </TouchableOpacity>

      <TouchableOpacity onPress={togglePlay}>
        <Ionicons
          name={isPlaying ? "pause" : "play"}
          size={24}
          color="white"
          style={{ marginHorizontal: 5 }}
        />
      </TouchableOpacity>

      <TouchableOpacity onPress={nextSong}>
        <Ionicons
          name="play-skip-forward"
          size={22}
          color="white"
          style={{ marginHorizontal: 5 }}
        />
      </TouchableOpacity>
    </TouchableOpacity>
  );
}
