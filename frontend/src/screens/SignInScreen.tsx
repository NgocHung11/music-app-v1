"use client"

import { useState } from "react"
import {
  View,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  Text,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from "react-native"
import { LinearGradient } from "expo-linear-gradient"
import { Ionicons } from "@expo/vector-icons"
import { useAuth } from "../context/AuthContext"

export default function SignInScreen({ navigation }: any) {
  const { signIn } = useAuth()
  const [username, setUsername] = useState("")
  const [password, setPassword] = useState("")
  const [loading, setLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)

  const onLogin = async () => {
    if (!username || !password) {
      Alert.alert("Missing Information", "Please enter both username and password.")
      return
    }

    setLoading(true)
    try {
      await signIn(username.trim().toLowerCase(), password)
    } catch (e: any) {
      Alert.alert("Login Failed", e.message || "Incorrect username or password.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : undefined} style={{ flex: 1 }}>
      <LinearGradient colors={["#0a0a12", "#1a1a2e", "#0a0a12"]} style={{ flex: 1 }}>
        <ScrollView contentContainerStyle={styles.container}>
          <View style={styles.headerContainer}>
            <View style={styles.iconWrapper}>
              <Ionicons name="musical-notes" size={48} color="#4a5fd9" />
            </View>
            <Text style={styles.title}>Welcome Back</Text>
            <Text style={styles.subtitle}>Sign in to continue listening</Text>
          </View>

          <View style={styles.formContainer}>
            <View style={styles.inputContainer}>
              <Ionicons name="person-outline" size={20} color="#9999b3" style={styles.inputIcon} />
              <TextInput
                placeholder="Username"
                placeholderTextColor="#666"
                style={styles.input}
                autoCapitalize="none"
                value={username}
                onChangeText={setUsername}
              />
            </View>

            <View style={styles.inputContainer}>
              <Ionicons name="lock-closed-outline" size={20} color="#9999b3" style={styles.inputIcon} />
              <TextInput
                placeholder="Password"
                placeholderTextColor="#666"
                style={styles.input}
                secureTextEntry={!showPassword}
                value={password}
                onChangeText={setPassword}
              />
              <TouchableOpacity onPress={() => setShowPassword(!showPassword)} style={styles.eyeIcon}>
                <Ionicons name={showPassword ? "eye-outline" : "eye-off-outline"} size={20} color="#666" />
              </TouchableOpacity>
            </View>

            <TouchableOpacity
              style={[styles.buttonWrapper, loading && { opacity: 0.6 }]}
              onPress={onLogin}
              disabled={loading}
              activeOpacity={0.8}
            >
              <LinearGradient
                colors={["#4a5fd9", "#7c3aed"]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={styles.button}
              >
                {loading ? (
                  <ActivityIndicator color="#fff" />
                ) : (
                  <>
                    <Text style={styles.buttonText}>Sign In</Text>
                    <Ionicons name="arrow-forward" size={20} color="#fff" />
                  </>
                )}
              </LinearGradient>
            </TouchableOpacity>

            <TouchableOpacity onPress={() => navigation.navigate("SignUp")} style={styles.linkContainer}>
              <Text style={styles.linkText}>
                Don't have an account? <Text style={styles.linkHighlight}>Sign Up</Text>
              </Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </LinearGradient>
    </KeyboardAvoidingView>
  )
}

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    padding: 24,
    justifyContent: "center",
  },
  headerContainer: {
    alignItems: "center",
    marginBottom: 48,
  },
  iconWrapper: {
    width: 96,
    height: 96,
    borderRadius: 48,
    backgroundColor: "#1a1a2e",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 24,
    borderWidth: 2,
    borderColor: "#2a2a3e",
  },
  title: {
    color: "#fff",
    fontSize: 32,
    fontWeight: "800",
    letterSpacing: 0.5,
    marginBottom: 8,
  },
  subtitle: {
    color: "#9999b3",
    fontSize: 16,
    fontWeight: "500",
    letterSpacing: 0.3,
  },
  formContainer: {
    width: "100%",
  },
  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#1a1a2e",
    borderRadius: 14,
    paddingHorizontal: 16,
    paddingVertical: 4,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: "#2a2a3e",
  },
  inputIcon: {
    marginRight: 12,
  },
  input: {
    flex: 1,
    color: "#fff",
    paddingVertical: 14,
    fontSize: 16,
    fontWeight: "500",
  },
  eyeIcon: {
    padding: 4,
  },
  buttonWrapper: {
    marginTop: 8,
    borderRadius: 14,
    overflow: "hidden",
    shadowColor: "#4a5fd9",
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.5,
    shadowRadius: 12,
    elevation: 8,
  },
  button: {
    flexDirection: "row",
    paddingVertical: 16,
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
  },
  buttonText: {
    color: "#fff",
    fontSize: 17,
    fontWeight: "700",
    letterSpacing: 0.5,
  },
  linkContainer: {
    marginTop: 24,
    alignItems: "center",
  },
  linkText: {
    color: "#9999b3",
    fontSize: 15,
    fontWeight: "500",
  },
  linkHighlight: {
    color: "#4a5fd9",
    fontWeight: "700",
  },
})
