"use client"

import { useEffect, useState } from "react"
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Image, Alert } from "react-native"
import { LinearGradient } from "expo-linear-gradient"
import { Ionicons } from "@expo/vector-icons"
import { SafeAreaView } from "react-native-safe-area-context"
import { useNavigation } from "@react-navigation/native"
import { useAuth } from "../context/AuthContext"
import { userApi } from "../api"
import { COLORS, GRADIENTS, BORDER_RADIUS, SHADOWS } from "../constants/theme"

export default function ProfileScreen() {
  const navigation = useNavigation<any>()
  const { user, signOut } = useAuth()

  const [stats, setStats] = useState({
    totalListeningTime: 0,
    totalSongsPlayed: 0,
    totalPlaylists: 0,
    favoriteGenre: "",
  })

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const res = await userApi.getStats()
        setStats(res.data)
      } catch (error) {
        console.warn("fetchStats error", error)
      }
    }
    fetchStats()
  }, [])

  const handleSignOut = () => {
    Alert.alert("Sign Out", "Are you sure you want to sign out?", [
      { text: "Cancel", style: "cancel" },
      { text: "Sign Out", style: "destructive", onPress: signOut },
    ])
  }

  const formatListeningTime = (minutes: number) => {
    const hours = Math.floor(minutes / 60)
    if (hours > 0) return `${hours}h ${minutes % 60}m`
    return `${minutes}m`
  }

  const menuItems = [
    { icon: "person-outline", label: "Edit Profile", screen: "EditProfile" },
    { icon: "notifications-outline", label: "Notifications", screen: "Notifications" },
    { icon: "musical-notes-outline", label: "Audio Quality", screen: "AudioQuality" },
    { icon: "download-outline", label: "Downloads", screen: "Downloads" },
    { icon: "shield-outline", label: "Privacy", screen: "Privacy" },
    { icon: "help-circle-outline", label: "Help & Support", screen: "Help" },
    { icon: "information-circle-outline", label: "About", screen: "About" },
  ]

  return (
    <SafeAreaView style={styles.container} edges={["top", "left", "right"]}>
      <LinearGradient colors={GRADIENTS.background} style={styles.gradient}>
        <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
          {/* Header */}
          <View style={styles.headerSection}>
            <View style={styles.avatarContainer}>
              {user?.avatar ? (
                <Image source={{ uri: user.avatar }} style={styles.avatar} />
              ) : (
                <LinearGradient colors={GRADIENTS.primary} style={styles.avatar}>
                  <Ionicons name="person" size={48} color="#fff" />
                </LinearGradient>
              )}
              <TouchableOpacity style={styles.editAvatarBtn} onPress={() => navigation.navigate("EditProfile")}>
                <Ionicons name="camera" size={16} color="#fff" />
              </TouchableOpacity>
            </View>

            <Text style={styles.username}>
              {user?.firstName ? `${user.firstName} ${user.lastName || ""}`.trim() : user?.username || "User"}
            </Text>
            {user?.email && <Text style={styles.email}>{user.email}</Text>}
          </View>

          {/* Stats */}
          <View style={styles.statsContainer}>
            <View style={styles.statCard}>
              <Ionicons name="time-outline" size={24} color={COLORS.primary} style={{ marginBottom: 8 }} />
              <Text style={styles.statValue}>{formatListeningTime(stats.totalListeningTime)}</Text>
              <Text style={styles.statLabel}>Listening</Text>
            </View>

            <View style={styles.statCard}>
              <Ionicons name="musical-notes-outline" size={24} color={COLORS.primary} style={{ marginBottom: 8 }} />
              <Text style={styles.statValue}>{stats.totalSongsPlayed}</Text>
              <Text style={styles.statLabel}>Songs Played</Text>
            </View>

            <View style={styles.statCard}>
              <Ionicons name="list-outline" size={24} color={COLORS.primary} style={{ marginBottom: 8 }} />
              <Text style={styles.statValue}>{stats.totalPlaylists}</Text>
              <Text style={styles.statLabel}>Playlists</Text>
            </View>
          </View>

          {/* Favorite Genre */}
          {stats.favoriteGenre && (
            <View style={styles.favoriteGenre}>
              <Text style={styles.favoriteGenreLabel}>Your Top Genre</Text>
              <Text style={styles.favoriteGenreValue}>{stats.favoriteGenre}</Text>
            </View>
          )}

          {/* Menu Items */}
          <View style={styles.menuSection}>
            {menuItems.map((item, index) => (
              <TouchableOpacity
                key={index}
                style={[styles.menuItem, index === menuItems.length - 1 && { borderBottomWidth: 0 }]}
                onPress={() => navigation.navigate(item.screen)}
              >
                <View style={styles.menuIconWrapper}>
                  <Ionicons name={item.icon as any} size={22} color={COLORS.primary} />
                </View>
                <Text style={styles.menuText}>{item.label}</Text>
                <Ionicons name="chevron-forward" size={20} color={COLORS.textMuted} />
              </TouchableOpacity>
            ))}
          </View>

          {/* Sign Out Button */}
          <TouchableOpacity style={styles.logoutButton} onPress={handleSignOut}>
            <Ionicons name="log-out-outline" size={20} color="#fff" style={{ marginRight: 8 }} />
            <Text style={styles.logoutText}>Sign Out</Text>
          </TouchableOpacity>

          {/* App Version */}
          <Text style={styles.version}>Version 1.0.0</Text>
        </ScrollView>
      </LinearGradient>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  gradient: {
    flex: 1,
  },
  scrollContent: {
    padding: 20,
    paddingBottom: 140,
  },
  headerSection: {
    alignItems: "center",
    marginBottom: 24,
    marginTop: 12,
  },
  avatarContainer: {
    position: "relative",
    marginBottom: 16,
    ...SHADOWS.large,
    shadowColor: COLORS.primary,
  },
  avatar: {
    width: 100,
    height: 100,
    borderRadius: 50,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 3,
    borderColor: COLORS.border,
  },
  editAvatarBtn: {
    position: "absolute",
    bottom: 0,
    right: 0,
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: COLORS.primary,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 2,
    borderColor: COLORS.background,
  },
  username: {
    color: COLORS.text,
    fontSize: 24,
    fontWeight: "800",
    letterSpacing: 0.5,
    marginBottom: 4,
  },
  email: {
    color: COLORS.textSecondary,
    fontSize: 14,
    fontWeight: "500",
    letterSpacing: 0.3,
  },
  statsContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 20,
    gap: 12,
  },
  statCard: {
    flex: 1,
    backgroundColor: COLORS.backgroundLight,
    borderRadius: BORDER_RADIUS.lg,
    paddingVertical: 20,
    paddingHorizontal: 12,
    alignItems: "center",
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  statValue: {
    color: COLORS.text,
    fontSize: 20,
    fontWeight: "800",
    letterSpacing: 0.5,
  },
  statLabel: {
    color: COLORS.textSecondary,
    fontSize: 11,
    marginTop: 4,
    fontWeight: "600",
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  favoriteGenre: {
    backgroundColor: COLORS.backgroundLight,
    borderRadius: BORDER_RADIUS.lg,
    padding: 16,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: COLORS.border,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  favoriteGenreLabel: {
    color: COLORS.textSecondary,
    fontSize: 14,
    fontWeight: "500",
  },
  favoriteGenreValue: {
    color: COLORS.primary,
    fontSize: 16,
    fontWeight: "700",
  },
  menuSection: {
    backgroundColor: COLORS.backgroundLight,
    borderRadius: BORDER_RADIUS.lg,
    borderWidth: 1,
    borderColor: COLORS.border,
    marginBottom: 24,
    overflow: "hidden",
  },
  menuItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  menuIconWrapper: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: COLORS.surface,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 14,
  },
  menuText: {
    flex: 1,
    color: COLORS.text,
    fontSize: 15,
    fontWeight: "600",
    letterSpacing: 0.3,
  },
  logoutButton: {
    backgroundColor: COLORS.error,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 16,
    borderRadius: BORDER_RADIUS.lg,
    ...SHADOWS.medium,
    shadowColor: COLORS.error,
  },
  logoutText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "700",
    letterSpacing: 0.5,
  },
  version: {
    color: COLORS.textMuted,
    fontSize: 12,
    textAlign: "center",
    marginTop: 20,
  },
})
