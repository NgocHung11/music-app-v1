"use client"
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from "react-native"
import { LinearGradient } from "expo-linear-gradient"
import { Ionicons } from "@expo/vector-icons"
import { SafeAreaView } from "react-native-safe-area-context"
import { useAuth } from "../context/AuthContext"

export default function ProfileScreen() {
  const { user, signOut } = useAuth()

  return (
    <SafeAreaView style={styles.container} edges={["top", "left", "right"]}>
      <LinearGradient colors={["#0a0a12", "#1a1a2e"]} style={styles.gradient}>
        <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
          <View style={styles.headerSection}>
            <View style={styles.avatarContainer}>
              <LinearGradient colors={["#4a5fd9", "#7c3aed"]} style={styles.avatar}>
                <Ionicons name="person" size={48} color="#fff" />
              </LinearGradient>
            </View>

            <Text style={styles.username}>{user?.username || "New User"}</Text>
            {user?.email && <Text style={styles.email}>{user.email}</Text>}
          </View>

          <View style={styles.statsContainer}>
            <View style={styles.statCard}>
              <Ionicons name="musical-notes" size={28} color="#4a5fd9" style={{ marginBottom: 8 }} />
              <Text style={styles.statValue}>58</Text>
              <Text style={styles.statLabel}>Songs</Text>
            </View>

            <View style={styles.statCard}>
              <Ionicons name="list" size={28} color="#4a5fd9" style={{ marginBottom: 8 }} />
              <Text style={styles.statValue}>12</Text>
              <Text style={styles.statLabel}>Playlists</Text>
            </View>

            <View style={styles.statCard}>
              <Ionicons name="time" size={28} color="#4a5fd9" style={{ marginBottom: 8 }} />
              <Text style={styles.statValue}>35h</Text>
              <Text style={styles.statLabel}>Listening</Text>
            </View>
          </View>

          <View style={styles.menuSection}>
            <TouchableOpacity style={styles.menuItem}>
              <View style={styles.menuIconWrapper}>
                <Ionicons name="person-outline" size={22} color="#4a5fd9" />
              </View>
              <Text style={styles.menuText}>Edit Profile</Text>
              <Ionicons name="chevron-forward" size={20} color="#666" />
            </TouchableOpacity>

            <TouchableOpacity style={styles.menuItem}>
              <View style={styles.menuIconWrapper}>
                <Ionicons name="heart-outline" size={22} color="#4a5fd9" />
              </View>
              <Text style={styles.menuText}>Favorites</Text>
              <Ionicons name="chevron-forward" size={20} color="#666" />
            </TouchableOpacity>

            <TouchableOpacity style={styles.menuItem}>
              <View style={styles.menuIconWrapper}>
                <Ionicons name="settings-outline" size={22} color="#4a5fd9" />
              </View>
              <Text style={styles.menuText}>Settings</Text>
              <Ionicons name="chevron-forward" size={20} color="#666" />
            </TouchableOpacity>

            <TouchableOpacity style={styles.menuItem}>
              <View style={styles.menuIconWrapper}>
                <Ionicons name="help-circle-outline" size={22} color="#4a5fd9" />
              </View>
              <Text style={styles.menuText}>Help & Support</Text>
              <Ionicons name="chevron-forward" size={20} color="#666" />
            </TouchableOpacity>
          </View>

          <TouchableOpacity style={styles.logoutButton} onPress={signOut}>
            <Ionicons name="log-out-outline" size={20} color="#fff" style={{ marginRight: 8 }} />
            <Text style={styles.logoutText}>Sign Out</Text>
          </TouchableOpacity>
        </ScrollView>
      </LinearGradient>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#0a0a12",
  },
  gradient: {
    flex: 1,
  },
  scrollContent: {
    padding: 20,
    paddingBottom: 120,
  },
  headerSection: {
    alignItems: "center",
    marginBottom: 32,
    marginTop: 20,
  },
  avatarContainer: {
    marginBottom: 16,
    shadowColor: "#4a5fd9",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.5,
    shadowRadius: 16,
    elevation: 10,
  },
  avatar: {
    width: 100,
    height: 100,
    borderRadius: 50,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 3,
    borderColor: "#2a2a3e",
  },
  username: {
    color: "#fff",
    fontSize: 26,
    fontWeight: "800",
    letterSpacing: 0.5,
    marginBottom: 6,
  },
  email: {
    color: "#9999b3",
    fontSize: 15,
    fontWeight: "500",
    letterSpacing: 0.3,
  },
  statsContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 32,
    gap: 12,
  },
  statCard: {
    flex: 1,
    backgroundColor: "#1a1a2e",
    borderRadius: 16,
    paddingVertical: 20,
    paddingHorizontal: 12,
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#2a2a3e",
  },
  statValue: {
    color: "#fff",
    fontSize: 22,
    fontWeight: "800",
    letterSpacing: 0.5,
  },
  statLabel: {
    color: "#9999b3",
    fontSize: 12,
    marginTop: 4,
    fontWeight: "600",
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  menuSection: {
    backgroundColor: "#1a1a2e",
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "#2a2a3e",
    marginBottom: 24,
    overflow: "hidden",
  },
  menuItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 16,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#2a2a3e",
  },
  menuIconWrapper: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#0d0d15",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 14,
  },
  menuText: {
    flex: 1,
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
    letterSpacing: 0.3,
  },
  logoutButton: {
    backgroundColor: "#e63946",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 16,
    borderRadius: 16,
    shadowColor: "#e63946",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 8,
    elevation: 6,
  },
  logoutText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "700",
    letterSpacing: 0.5,
  },
})
