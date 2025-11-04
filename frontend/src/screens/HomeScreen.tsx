import React from "react";
import { View, Text, Button, StyleSheet } from "react-native";
import { useAuth } from "../context/AuthContext";

export default function HomeScreen() {
  const { user, signOut } = useAuth();

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Welcome, {user?.firstName ?? user?.username ?? "User"}</Text>
      <Text style={{ marginBottom: 20 }}>Đây là placeholder cho app nghe nhạc.</Text>

      <Button title="Đăng xuất" onPress={() => signOut()} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, alignItems: "center", justifyContent: "center", padding: 20 },
  title: { fontSize: 22, fontWeight: "600", marginBottom: 12 },
});
