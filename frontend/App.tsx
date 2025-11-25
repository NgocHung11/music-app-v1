"use client"
import { StatusBar } from "expo-status-bar"
import { SafeAreaProvider } from "react-native-safe-area-context"
import { GestureHandlerRootView } from "react-native-gesture-handler"
import { NavigationContainer } from "@react-navigation/native"
import { createNativeStackNavigator } from "@react-navigation/native-stack"
import { ActivityIndicator, View } from "react-native"
import { AuthProvider, useAuth } from "./context/AuthContext"
import { PlayerProvider } from "./context/PlayerContext"
import { COLORS } from "./constants/theme"

// Auth Screens
import SignInScreen from "./screens/SignInScreen"
import SignUpScreen from "./screens/SignUpScreen"

// Main Tabs
import MainTabs from "./navigation/MainTabs"

// Detail Screens
import SearchScreen from "./screens/SearchScreen"
import SongsScreen from "./screens/SongsScreen"
import AlbumScreen from "./screens/AlbumScreen"
import ArtistScreen from "./screens/ArtistScreen"
import GenreScreen from "./screens/GenreScreen"
import PlaylistScreen from "./screens/PlaylistScreen"
import HistoryScreen from "./screens/HistoryScreen"
import LikedSongsScreen from "./screens/LikedSongsScreen"
import EditProfileScreen from "./screens/EditProfileScreen"

// Types for navigation
export type RootStackParamList = {
  // Auth
  SignIn: undefined
  SignUp: undefined
  // Main
  MainTabs: undefined
  Search: undefined
  Songs: undefined
  Album: { albumId: string }
  Artist: { artistId: string }
  Genre: { genreId: string }
  Playlist: { playlistId: string }
  History: undefined
  LikedSongs: undefined
  EditProfile: undefined
}

const Stack = createNativeStackNavigator<RootStackParamList>()

const RootNavigator = () => {
  const { loading, isAuthenticated } = useAuth()

  if (loading) {
    return (
      <View style={{ flex: 1, backgroundColor: COLORS.background, alignItems: "center", justifyContent: "center" }}>
        <ActivityIndicator size="large" color={COLORS.primary} />
      </View>
    )
  }

  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      {isAuthenticated ? (
        <>
          <Stack.Screen name="MainTabs" component={MainTabs} />
          <Stack.Screen name="Search" component={SearchScreen} />
          <Stack.Screen name="Songs" component={SongsScreen} />
          <Stack.Screen name="Album" component={AlbumScreen} />
          <Stack.Screen name="Artist" component={ArtistScreen} />
          <Stack.Screen name="Genre" component={GenreScreen} />
          <Stack.Screen name="Playlist" component={PlaylistScreen} />
          <Stack.Screen name="History" component={HistoryScreen} />
          <Stack.Screen name="LikedSongs" component={LikedSongsScreen} />
          <Stack.Screen name="EditProfile" component={EditProfileScreen} />
        </>
      ) : (
        <>
          <Stack.Screen name="SignIn" component={SignInScreen} />
          <Stack.Screen name="SignUp" component={SignUpScreen} />
        </>
      )}
    </Stack.Navigator>
  )
}

export default function App() {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        <AuthProvider>
          <PlayerProvider>
            <StatusBar style="light" />
            <NavigationContainer>
              <RootNavigator />
            </NavigationContainer>
          </PlayerProvider>
        </AuthProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  )
}
