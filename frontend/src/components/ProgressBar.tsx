import type React from "react"
import { View, Text, StyleSheet } from "react-native"

type Props = {
  positionMillis: number
  durationMillis: number | null
}

const formatTime = (ms?: number | null) => {
  if (!ms) return "0:00"
  const totalSec = Math.floor(ms / 1000)
  const m = Math.floor(totalSec / 60)
  const s = totalSec % 60
  return `${m}:${s.toString().padStart(2, "0")}`
}

const ProgressBar: React.FC<Props> = ({ positionMillis, durationMillis }) => {
  const percent = durationMillis ? (positionMillis / durationMillis) * 100 : 0

  return (
    <View style={styles.container}>
      <View style={styles.row}>
        <View style={styles.bar}>
          <View style={[styles.inner, { width: `${percent}%` }]}>
            <View style={styles.thumb} />
          </View>
        </View>
      </View>
      <View style={styles.timeRow}>
        <Text style={styles.time}>{formatTime(positionMillis)}</Text>
        <Text style={styles.time}>{formatTime(durationMillis)}</Text>
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    width: "100%",
  },
  row: {
    width: "100%",
    flexDirection: "row",
    alignItems: "center",
  },
  bar: {
    flex: 1,
    height: 4,
    backgroundColor: "#2a2a3e",
    borderRadius: 2,
    overflow: "hidden",
  },
  inner: {
    height: 4,
    backgroundColor: "#4a5fd9",
    borderRadius: 2,
    position: "relative",
    shadowColor: "#4a5fd9",
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.8,
    shadowRadius: 4,
  },
  thumb: {
    position: "absolute",
    right: 0,
    top: -2,
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: "#fff",
    shadowColor: "#4a5fd9",
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 1,
    shadowRadius: 6,
    elevation: 8,
  },
  timeRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 8,
    paddingHorizontal: 2,
  },
  time: {
    fontSize: 12,
    fontWeight: "600",
    color: "#9999b3",
    letterSpacing: 0.5,
  },
})

export default ProgressBar
