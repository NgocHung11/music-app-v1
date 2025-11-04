import React from "react";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import SongsScreen from "../screens/SongsScreen";
import PlayerScreen from "../screens/PlayerScreen";
import ProfileScreen from "../screens/ProfileScreen";
import MiniPlayer from "../components/MiniPlayer";
import { View } from "react-native";
import { Ionicons } from "@expo/vector-icons";

export type RootStackParamList = {
  Songs: undefined;
  Profile: undefined;
  Explore: undefined;
};

const Tab = createBottomTabNavigator<RootStackParamList>();

export default function MainTabs() {
  return (
    <View style={{ flex: 1 }}>
      <Tab.Navigator
        initialRouteName="Songs" // ✅ mặc định vào tab Songs
        screenOptions={({ route }) => ({
          headerShown: false,
          tabBarShowLabel: true,
          tabBarActiveTintColor: "#3c60d6", // thêm màu nhấn
          tabBarInactiveTintColor: "#aaa",
          tabBarStyle: {
            backgroundColor: "#000",
            borderTopColor: "#111",
            height: 60,
            paddingBottom: 5,
          },
          tabBarIcon: ({ color, size }) => {
            let icon = "musical-notes";
            if (route.name === "Explore") icon = "compass";
            if (route.name === "Profile") icon = "person";
            return <Ionicons name={icon as any} color={color} size={size} />;
          },
        })}
      >
        <Tab.Screen name="Explore" component={PlayerScreen} />
        <Tab.Screen name="Songs" component={SongsScreen} />
        <Tab.Screen name="Profile" component={ProfileScreen} />
      </Tab.Navigator>

      {/* MiniPlayer hiển thị cố định trên tab bar */}
      <MiniPlayer />
    </View>
  );
}
