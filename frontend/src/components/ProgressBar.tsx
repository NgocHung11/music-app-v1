import React from "react";
import { View, Text, StyleSheet } from "react-native";

type Props = {
  positionMillis: number;
  durationMillis: number | null;
};

const formatTime = (ms?: number | null) => {
  if (!ms) return "0:00";
  const totalSec = Math.floor(ms / 1000);
  const m = Math.floor(totalSec / 60);
  const s = totalSec % 60;
  return `${m}:${s.toString().padStart(2, "0")}`;
};

const ProgressBar: React.FC<Props> = ({ positionMillis, durationMillis }) => {
  const percent = durationMillis ? (positionMillis / durationMillis) * 100 : 0;
  return (
    <View style={styles.row}>
      <Text style={styles.time}>{formatTime(positionMillis)}</Text>
      <View style={styles.bar}>
        <View style={[styles.inner, { width: `${percent}%` }]} />
      </View>
      <Text style={styles.time}>{formatTime(durationMillis)}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  row: {
    width: "100%",
    flexDirection: "row",
    alignItems: "center",
    marginTop: 20,
    paddingHorizontal: 8,
  },
  time: { width: 40, textAlign: "center", color: "#444" },
  bar: {
    flex: 1,
    height: 6,
    backgroundColor: "#eee",
    borderRadius: 4,
    overflow: "hidden",
    marginHorizontal: 8,
  },
  inner: {
    height: 6,
    backgroundColor: "#3c60d6"
  },
});

export default ProgressBar;