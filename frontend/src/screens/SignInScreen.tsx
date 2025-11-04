import React, { useState } from "react";
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
  Image,
} from "react-native";
import { useAuth } from "../context/AuthContext";

export default function SignInScreen({ navigation }: any) {
  const { signIn } = useAuth();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const onLogin = async () => {
    if (!username || !password) {
      Alert.alert("Thiếu thông tin", "Vui lòng nhập đầy đủ tài khoản và mật khẩu.");
      return;
    }

    setLoading(true);
    try {
      await signIn(username.trim().toLowerCase(), password);
      // AuthContext sẽ tự điều hướng sau khi đăng nhập thành công
    } catch (e: any) {
      Alert.alert("Đăng nhập thất bại", e.message || "Sai tên đăng nhập hoặc mật khẩu.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : undefined}
      style={{ flex: 1 }}
    >

      < ScrollView contentContainerStyle={styles.container} >
        {/* <Image
          source={require("../../assets/logo.png")}
          style={{
            width: 200, height: 200, alignSelf: "center", marginBottom: 20,
          }}
        /> */}
        <Text style={styles.title}>Đăng nhập 🎵</Text>

        <TextInput
          placeholder="Tên đăng nhập"
          placeholderTextColor="#777"
          style={styles.input}
          autoCapitalize="none"
          value={username}
          onChangeText={setUsername}
        />

        <TextInput
          placeholder="Mật khẩu"
          placeholderTextColor="#777"
          style={styles.input}
          secureTextEntry
          value={password}
          onChangeText={setPassword}
        />

        <TouchableOpacity
          style={[styles.button, loading && { opacity: 0.6 }]}
          onPress={onLogin}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.buttonText}>Đăng nhập</Text>
          )}
        </TouchableOpacity>

        <TouchableOpacity
          onPress={() => navigation.navigate("SignUp")}
          style={{ marginTop: 18 }}
        >
          <Text style={{ color: "#aaa", textAlign: "center" }}>
            Chưa có tài khoản?{" "}
            <Text style={{ color: "#3c60d6", fontWeight: "600" }}>Đăng ký ngay</Text>
          </Text>
        </TouchableOpacity>
      </ScrollView>
    </KeyboardAvoidingView >
  );
}

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    backgroundColor: "#000",
    padding: 24,
    justifyContent: "center",
  },
  title: {
    color: "#3c60d6",
    fontSize: 28,
    fontWeight: "800",
    textAlign: "center",
    marginBottom: 30,
  },
  input: {
    backgroundColor: "#111",
    color: "#fff",
    paddingVertical: 12,
    paddingHorizontal: 14,
    borderRadius: 10,
    marginBottom: 14,
    fontSize: 15,
    borderWidth: 1,
    borderColor: "#222",
  },
  button: {
    backgroundColor: "#3c60d6",
    paddingVertical: 14,
    borderRadius: 10,
    alignItems: "center",
    marginTop: 6,
    shadowColor: "#3c60d6",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.4,
    shadowRadius: 6,
    elevation: 3,
  },
  buttonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "700",
    textTransform: "uppercase",
  },
});
