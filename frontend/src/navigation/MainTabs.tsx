import { createBottomTabNavigator } from "@react-navigation/bottom-tabs"
import { createNativeStackNavigator } from "@react-navigation/native-stack"
import { Ionicons } from "@expo/vector-icons"
import { COLORS } from "../constants/theme"
import { StyleSheet } from "react-native"

// Home Stack Screens
import HomeScreen from "../screens/HomeScreen"
import SearchScreen from "../screens/SearchScreen"
import AlbumScreen from "../screens/AlbumScreen"
import ArtistScreen from "../screens/ArtistScreen"
import GenreScreen from "../screens/GenreScreen"
import PlaylistScreen from "../screens/PlaylistScreen"
import AlbumsScreen from "../screens/AlbumsScreen"
import ArtistsScreen from "../screens/ArtistsScreen"
import TopSongsScreen from "../screens/TopSongsScreen"
import ArtistSongsScreen from "../screens/ArtistSongsScreen"
import ArtistAlbumsScreen from "../screens/ArtistAlbumsScreen"

// Library Stack Screens
import LibraryScreen from "../screens/LibraryScreen"
import LikedSongsScreen from "../screens/LikedSongsScreen"
import HistoryScreen from "../screens/HistoryScreen"

// Player Screen
import PlayerScreen from "../screens/PlayerScreen"

// Profile Stack Screens
import ProfileScreen from "../screens/ProfileScreen"
import EditProfileScreen from "../screens/EditProfileScreen"

const Tab = createBottomTabNavigator()
const HomeStack = createNativeStackNavigator()
const LibraryStack = createNativeStackNavigator()
const ProfileStack = createNativeStackNavigator()

function HomeStackScreen() {
  return (
    <HomeStack.Navigator screenOptions={{ headerShown: false }}>
      <HomeStack.Screen name="HomeMain" component={HomeScreen} />
      <HomeStack.Screen name="Search" component={SearchScreen} />
      <HomeStack.Screen name="Album" component={AlbumScreen} />
      <HomeStack.Screen name="Artist" component={ArtistScreen} />
      <HomeStack.Screen name="Genre" component={GenreScreen} />
      <HomeStack.Screen name="Playlist" component={PlaylistScreen} />
      <HomeStack.Screen name="Albums" component={AlbumsScreen} />
      <HomeStack.Screen name="Artists" component={ArtistsScreen} />
      <HomeStack.Screen name="TopSongs" component={TopSongsScreen} />
      <HomeStack.Screen name="ArtistSongs" component={ArtistSongsScreen} />
      <HomeStack.Screen name="ArtistAlbums" component={ArtistAlbumsScreen} />
    </HomeStack.Navigator>
  )
}

function LibraryStackScreen() {
  return (
    <LibraryStack.Navigator screenOptions={{ headerShown: false }}>
      <LibraryStack.Screen name="LibraryMain" component={LibraryScreen} />
      <LibraryStack.Screen name="LikedSongs" component={LikedSongsScreen} />
      <LibraryStack.Screen name="History" component={HistoryScreen} />
      <LibraryStack.Screen name="Playlist" component={PlaylistScreen} />
      <LibraryStack.Screen name="Album" component={AlbumScreen} />
      <LibraryStack.Screen name="Artist" component={ArtistScreen} />
    </LibraryStack.Navigator>
  )
}

function ProfileStackScreen() {
  return (
    <ProfileStack.Navigator screenOptions={{ headerShown: false }}>
      <ProfileStack.Screen name="ProfileMain" component={ProfileScreen} />
      <ProfileStack.Screen name="EditProfile" component={EditProfileScreen} />
      <ProfileStack.Screen name="History" component={HistoryScreen} />
      <ProfileStack.Screen name="LikedSongs" component={LikedSongsScreen} />
    </ProfileStack.Navigator>
  )
}

export default function MainTabs() {
  return (
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
      <Tab.Screen name="Home" component={HomeStackScreen} />
      <Tab.Screen name="Library" component={LibraryStackScreen} />
      <Tab.Screen name="Player" component={PlayerScreen} />
      <Tab.Screen name="Profile" component={ProfileStackScreen} />
    </Tab.Navigator>
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
