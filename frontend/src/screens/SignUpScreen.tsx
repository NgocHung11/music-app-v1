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
} from "react-native";
import { useAuth } from "../context/AuthContext";

export default function SignUpScreen({ navigation }: any) {
  const { signUp } = useAuth();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [email, setEmail] = useState("");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [loading, setLoading] = useState(false);

  const onSignUp = async () => {
    if (!username || !password || !email) {
      Alert.alert("Thiếu thông tin", "Vui lòng nhập đầy đủ thông tin bắt buộc.");
      return;
    }
    setLoading(true);
    try {
      await signUp({
        username: username.trim().toLowerCase(),
        password,
        email,
        firstName,
        lastName,
      });
      Alert.alert("🎉 Đăng ký thành công", "Bạn có thể đăng nhập ngay bây giờ.");
      navigation.navigate("SignIn");
    } catch (e: any) {
      Alert.alert("Đăng ký thất bại", e.message || "Có lỗi xảy ra.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : undefined}
      style={{ flex: 1 }}
    >
      <ScrollView contentContainerStyle={styles.container}>
        <Text style={styles.title}>Tạo tài khoản 🎵</Text>

        <TextInput
          placeholder="Tên đăng nhập"
          placeholderTextColor="#777"
          style={styles.input}
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

        <TextInput
          placeholder="Email"
          placeholderTextColor="#777"
          style={styles.input}
          value={email}
          onChangeText={setEmail}
        />

        <TextInput
          placeholder="Họ"
          placeholderTextColor="#777"
          style={styles.input}
          value={firstName}
          onChangeText={setFirstName}
        />

        <TextInput
          placeholder="Tên"
          placeholderTextColor="#777"
          style={styles.input}
          value={lastName}
          onChangeText={setLastName}
        />

        <TouchableOpacity
          style={[styles.button, loading && { opacity: 0.6 }]}
          onPress={onSignUp}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.buttonText}>Đăng ký</Text>
          )}
        </TouchableOpacity>

        <TouchableOpacity
          onPress={() => navigation.navigate("SignIn")}
          style={{ marginTop: 18 }}
        >
          <Text style={{ color: "#aaa", textAlign: "center" }}>
            Đã có tài khoản?{" "}
            <Text style={{ color: "#3c60d6", fontWeight: "600" }}>Đăng nhập</Text>
          </Text>
        </TouchableOpacity>
      </ScrollView>
    </KeyboardAvoidingView>
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
