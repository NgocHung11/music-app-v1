// src/screens/ProfileScreen.tsx
import React from "react";
import { View, Text, StyleSheet, TouchableOpacity, Image } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { useAuth } from "../context/AuthContext";

export default function ProfileScreen() {
  const { user, signOut } = useAuth();

  return (
    <LinearGradient
      colors={["#000", "#111", "#1a1a1a"]}
      style={styles.container}
    >
      <View style={styles.headerSection}>
        <Text style={styles.username}>
          {user?.username || "Người dùng mới"}
        </Text>
        {user?.email && <Text style={styles.email}>{user.email}</Text>}
      </View>

      <View style={styles.infoBox}>
        <View style={styles.statBox}>
          <Text style={styles.statValue}>12</Text>
          <Text style={styles.statLabel}>Playlist</Text>
        </View>
        <View style={styles.statBox}>
          <Text style={styles.statValue}>58</Text>
          <Text style={styles.statLabel}>Bài hát</Text>
        </View>
        <View style={styles.statBox}>
          <Text style={styles.statValue}>35h</Text>
          <Text style={styles.statLabel}>Thời gian nghe</Text>
        </View>
      </View>

      <TouchableOpacity style={styles.editButton}>
        <Text style={styles.editText}>Chỉnh sửa hồ sơ</Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.logoutButton} onPress={signOut}>
        <Text style={styles.logoutText}>Đăng xuất</Text>
      </TouchableOpacity>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: 20,
  },
  headerSection: {
    alignItems: "center",
    marginBottom: 40,
  },
  avatar: {
    width: 110,
    height: 110,
    borderRadius: 55,
    borderWidth: 2,
    borderColor: "#1DB954", // màu xanh Spotify
    marginBottom: 15,
  },
  username: {
    color: "#fff",
    fontSize: 22,
    fontWeight: "700",
  },
  email: {
    color: "#aaa",
    fontSize: 14,
    marginTop: 4,
  },
  infoBox: {
    flexDirection: "row",
    backgroundColor: "#111",
    borderRadius: 12,
    paddingVertical: 20,
    paddingHorizontal: 10,
    width: "100%",
    justifyContent: "space-around",
    marginBottom: 40,
  },
  statBox: {
    alignItems: "center",
  },
  statValue: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "700",
  },
  statLabel: {
    color: "#aaa",
    fontSize: 13,
    marginTop: 4,
  },
  editButton: {
    backgroundColor: "#3c60d6",
    paddingVertical: 12,
    paddingHorizontal: 50,
    borderRadius: 30,
    marginBottom: 20,
  },
  editText: {
    color: "white",
    fontSize: 16,
    fontWeight: "600",
  },
  logoutButton: {
    backgroundColor: "#677980ff",
    paddingVertical: 12,
    paddingHorizontal: 66,
    borderRadius: 30,
  },
  logoutText: {
    color: "white",
    fontSize: 16,
    fontWeight: "600",
  },
});
