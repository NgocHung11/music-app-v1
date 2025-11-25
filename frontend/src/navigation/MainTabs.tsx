import { View, StyleSheet } from "react-native"
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs"
import { Ionicons } from "@expo/vector-icons"
import HomeScreen from "../screens/HomeScreen"
import LibraryScreen from "../screens/LibraryScreen"
import PlayerScreen from "../screens/PlayerScreen"
import ProfileScreen from "../screens/ProfileScreen"
import MiniPlayer from "../components/MiniPlayer"
import { COLORS } from "../constants/theme"

export type RootTabParamList = {
  Home: undefined
  Library: undefined
  Player: undefined
  Profile: undefined
}

const Tab = createBottomTabNavigator<RootTabParamList>()

export default function MainTabs() {
  return (
    <View style={{ flex: 1 }}>
      <Tab.Navigator
        initialRouteName="Home"
        screenOptions={({ route }) => ({
          headerShown: false,
          tabBarShowLabel: true,
          tabBarActiveTintColor: COLORS.primary,
          tabBarInactiveTintColor: COLORS.textMuted,
          tabBarStyle: styles.tabBar,
          tabBarLabelStyle: styles.tabBarLabel,
          tabBarIcon: ({ color, size, focused }) => {
            let iconName: string
            switch (route.name) {
              case "Home":
                iconName = focused ? "home" : "home-outline"
                break
              case "Library":
                iconName = focused ? "library" : "library-outline"
                break
              case "Player":
                iconName = focused ? "play-circle" : "play-circle-outline"
                break
              case "Profile":
                iconName = focused ? "person" : "person-outline"
                break
              default:
                iconName = "ellipse"
            }
            return <Ionicons name={iconName as any} color={color} size={focused ? size + 2 : size} />
          },
        })}
      >
        <Tab.Screen name="Home" component={HomeScreen} />
        <Tab.Screen name="Library" component={LibraryScreen} />
        <Tab.Screen name="Player" component={PlayerScreen} />
        <Tab.Screen name="Profile" component={ProfileScreen} />
      </Tab.Navigator>

      <MiniPlayer />
    </View>
  )
}

const styles = StyleSheet.create({
  tabBar: {
    backgroundColor: COLORS.surface,
    borderTopColor: COLORS.borderLight,
    borderTopWidth: 1,
    height: 65,
    paddingBottom: 8,
    paddingTop: 8,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 16,
  },
  tabBarLabel: {
    fontSize: 11,
    fontWeight: "600",
    letterSpacing: 0.3,
  },
})
