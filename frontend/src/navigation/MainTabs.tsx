import { createBottomTabNavigator } from "@react-navigation/bottom-tabs"
import SongsScreen from "../screens/SongsScreen"
import PlayerScreen from "../screens/PlayerScreen"
import ProfileScreen from "../screens/ProfileScreen"
import MiniPlayer from "../components/MiniPlayer"
import { View, StyleSheet } from "react-native"
import { Ionicons } from "@expo/vector-icons"

export type RootStackParamList = {
  Songs: undefined
  Profile: undefined
  Explore: undefined
}

const Tab = createBottomTabNavigator<RootStackParamList>()

export default function MainTabs() {
  return (
    <View style={{ flex: 1 }}>
      <Tab.Navigator
        initialRouteName="Songs"
        screenOptions={({ route }) => ({
          headerShown: false,
          tabBarShowLabel: true,
          tabBarActiveTintColor: "#4a5fd9",
          tabBarInactiveTintColor: "#666",
          tabBarStyle: styles.tabBar,
          tabBarLabelStyle: styles.tabBarLabel,
          tabBarIcon: ({ color, size, focused }) => {
            let icon = "musical-notes"
            if (route.name === "Explore") icon = "play-circle"
            if (route.name === "Profile") icon = "person"

            const iconName = focused ? icon : `${icon}-outline`

            return <Ionicons name={iconName as any} color={color} size={focused ? size + 2 : size} />
          },
        })}
      >
        <Tab.Screen name="Explore" component={PlayerScreen} />
        <Tab.Screen name="Songs" component={SongsScreen} />
        <Tab.Screen name="Profile" component={ProfileScreen} />
      </Tab.Navigator>

      <MiniPlayer />
    </View>
  )
}

const styles = StyleSheet.create({
  tabBar: {
    backgroundColor: "#0d0d15",
    borderTopColor: "#1a1a2e",
    borderTopWidth: 1,
    height: 60,
    paddingBottom: 6,
    paddingTop: 6,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 16,
  },
  tabBarLabel: {
    fontSize: 11,
    fontWeight: "600",
    letterSpacing: 0.3,
  },
})
