import React from "react";
import { View, Text, Image, TouchableOpacity, StyleSheet } from "react-native";

export type Song = {
  _id: string;
  title: string;
  artist: string;
  coverUrl: string;
  audioUrl: string;
  duration?: number;
};

type Props = {
  song: Song;
  onPress: () => void;
};

const SongItem: React.FC<Props> = ({ song, onPress }) => {
  return (
    <TouchableOpacity style={styles.item} onPress={onPress}>
      <Image source={{ uri: song.coverUrl }} style={styles.cover} />
      <View style={styles.meta}>
        <Text numberOfLines={1} style={styles.title}>
          {song.title}
        </Text>
        <Text numberOfLines={1} style={styles.artist}>
          {song.artist}
        </Text>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  item: {
    flexDirection: "row",
    padding: 12,
    borderBottomWidth: 1,
    alignItems: "center",
  },
  cover: { width: 64, height: 64, borderRadius: 6, marginRight: 12, backgroundColor: "#ddd" },
  meta: { flex: 1 },
  title: { fontSize: 16, fontWeight: "600", color: "white" },
  artist: {
    color: "white", marginTop: 4
  },
});

export default SongItem;
