import React from "react";
import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { AuthProvider, useAuth } from "./src/context/AuthContext";
import { PlayerProvider } from "./src/context/PlayerContext";
import SignInScreen from "./src/screens/SignInScreen";
import SignUpScreen from "./src/screens/SignUpScreen";
import PlayerScreen from "./src/screens/PlayerScreen";
import MainTabs from "./src/navigation/MainTabs";
import SearchScreen from "./src/screens/SearchScreen";

export type RootStackParamList = {
  SignIn: undefined;
  SignUp: undefined;
  MainTabs: undefined;
  Search: undefined;
  Player: {
    song: {
      _id: string;
      title: string;
      artist: string;
      coverUrl: string;
      audioUrl: string;
      duration?: number;
    };
    songs: any[];
    index: number;
  };
};

const Stack = createNativeStackNavigator<RootStackParamList>();

// ⬇️ WRAPPER phân nhánh user login
function RootNavigator() {
  const { user } = useAuth();

  if (!user) {
    // ⛔ CHƯA đăng nhập
    return (
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        <Stack.Screen name="SignIn" component={SignInScreen} />
        <Stack.Screen name="SignUp" component={SignUpScreen} />
      </Stack.Navigator>
    );
  }

  // ✅ ĐÃ đăng nhập → bọc PlayerProvider tại đây
  return (
    <PlayerProvider>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        <Stack.Screen name="MainTabs" component={MainTabs} />

        <Stack.Screen
          name="Search"
          component={SearchScreen}
          options={{
            headerShown: true,
            headerStyle: { backgroundColor: "#000" },
            headerTintColor: "#fff",
            title: "Tìm kiếm bài hát",
          }}
        />

        <Stack.Screen name="Player" component={PlayerScreen} />
      </Stack.Navigator>
    </PlayerProvider>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <NavigationContainer>
        <RootNavigator />
      </NavigationContainer>
    </AuthProvider>
  );
}
