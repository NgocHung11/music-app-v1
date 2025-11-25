"use client"

import { useState } from "react"
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ScrollView,
  Image,
  ActivityIndicator,
} from "react-native"
import { LinearGradient } from "expo-linear-gradient"
import { Ionicons } from "@expo/vector-icons"
import { SafeAreaView } from "react-native-safe-area-context"
import { useNavigation } from "@react-navigation/native"
import { useAuth } from "../context/AuthContext"
import { userApi } from "../api"
import { COLORS, GRADIENTS, BORDER_RADIUS } from "../constants/theme"

export default function EditProfileScreen() {
  const navigation = useNavigation<any>()
  const { user, updateUser } = useAuth()

  const [firstName, setFirstName] = useState(user?.firstName || "")
  const [lastName, setLastName] = useState(user?.lastName || "")
  const [loading, setLoading] = useState(false)

  const handleSave = async () => {
    setLoading(true)
    try {
      const res = await userApi.updateProfile({ firstName, lastName })
      updateUser(res.data.user)
      Alert.alert("Success", "Profile updated successfully")
      navigation.goBack()
    } catch (error: any) {
      Alert.alert("Error", error.message || "Failed to update profile")
    } finally {
      setLoading(false)
    }
  }

  return (
    <SafeAreaView style={styles.container} edges={["top"]}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
            <Ionicons name="close" size={24} color="#fff" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Edit Profile</Text>
          <TouchableOpacity onPress={handleSave} disabled={loading}>
            {loading ? (
              <ActivityIndicator size="small" color={COLORS.primary} />
            ) : (
              <Text style={styles.saveBtn}>Save</Text>
            )}
          </TouchableOpacity>
        </View>

        {/* Avatar */}
        <View style={styles.avatarSection}>
          {user?.avatar ? (
            <Image source={{ uri: user.avatar }} style={styles.avatar} />
          ) : (
            <LinearGradient colors={GRADIENTS.primary} style={styles.avatar}>
              <Ionicons name="person" size={48} color="#fff" />
            </LinearGradient>
          )}
          <TouchableOpacity style={styles.changePhotoBtn}>
            <Text style={styles.changePhotoText}>Change Photo</Text>
          </TouchableOpacity>
        </View>

        {/* Form */}
        <View style={styles.form}>
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Username</Text>
            <View style={styles.disabledInput}>
              <Text style={styles.disabledText}>{user?.username}</Text>
              <Ionicons name="lock-closed" size={16} color={COLORS.textMuted} />
            </View>
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Email</Text>
            <View style={styles.disabledInput}>
              <Text style={styles.disabledText}>{user?.email}</Text>
              <Ionicons name="lock-closed" size={16} color={COLORS.textMuted} />
            </View>
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>First Name</Text>
            <TextInput
              style={styles.input}
              value={firstName}
              onChangeText={setFirstName}
              placeholder="Enter first name"
              placeholderTextColor={COLORS.textMuted}
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Last Name</Text>
            <TextInput
              style={styles.input}
              value={lastName}
              onChangeText={setLastName}
              placeholder="Enter last name"
              placeholderTextColor={COLORS.textMuted}
            />
          </View>
        </View>

        {/* Change Password */}
        <TouchableOpacity style={styles.changePasswordBtn} onPress={() => navigation.navigate("ChangePassword")}>
          <Ionicons name="key-outline" size={20} color={COLORS.primary} />
          <Text style={styles.changePasswordText}>Change Password</Text>
          <Ionicons name="chevron-forward" size={20} color={COLORS.textMuted} />
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  scrollContent: {
    paddingBottom: 40,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  backBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: COLORS.backgroundLight,
    alignItems: "center",
    justifyContent: "center",
  },
  headerTitle: {
    color: COLORS.text,
    fontSize: 18,
    fontWeight: "700",
  },
  saveBtn: {
    color: COLORS.primary,
    fontSize: 16,
    fontWeight: "700",
  },
  avatarSection: {
    alignItems: "center",
    marginVertical: 24,
  },
  avatar: {
    width: 100,
    height: 100,
    borderRadius: 50,
    alignItems: "center",
    justifyContent: "center",
  },
  changePhotoBtn: {
    marginTop: 12,
  },
  changePhotoText: {
    color: COLORS.primary,
    fontSize: 14,
    fontWeight: "600",
  },
  form: {
    paddingHorizontal: 20,
    gap: 20,
  },
  inputGroup: {
    gap: 8,
  },
  label: {
    color: COLORS.textSecondary,
    fontSize: 13,
    fontWeight: "600",
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  input: {
    backgroundColor: COLORS.backgroundLight,
    borderRadius: BORDER_RADIUS.md,
    padding: 14,
    color: COLORS.text,
    fontSize: 16,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  disabledInput: {
    backgroundColor: COLORS.surface,
    borderRadius: BORDER_RADIUS.md,
    padding: 14,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  disabledText: {
    color: COLORS.textMuted,
    fontSize: 16,
  },
  changePasswordBtn: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: COLORS.backgroundLight,
    marginHorizontal: 20,
    marginTop: 32,
    padding: 16,
    borderRadius: BORDER_RADIUS.md,
    borderWidth: 1,
    borderColor: COLORS.border,
    gap: 12,
  },
  changePasswordText: {
    flex: 1,
    color: COLORS.text,
    fontSize: 15,
    fontWeight: "600",
  },
})
