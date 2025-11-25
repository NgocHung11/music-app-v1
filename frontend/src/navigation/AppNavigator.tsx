"use client"
import { NavigationContainer } from "@react-navigation/native"
import { createNativeStackNavigator } from "@react-navigation/native-stack"
import { useAuth } from "../context/AuthContext"
import { ActivityIndicator, View } from "react-native"
import { COLORS } from "../constants/theme"

// Auth Screens
import SignInScreen from "../screens/SignInScreen"
import SignUpScreen from "../screens/SignUpScreen"

// Main Tabs
import MainTabs from "./MainTabs"

// Detail Screens
import SearchScreen from "../screens/SearchScreen"
import AlbumScreen from "../screens/AlbumScreen"
import ArtistScreen from "../screens/ArtistScreen"
import GenreScreen from "../screens/GenreScreen"
import PlaylistScreen from "../screens/PlaylistScreen"
import HistoryScreen from "../screens/HistoryScreen"
import LikedSongsScreen from "../screens/LikedSongsScreen"
import EditProfileScreen from "../screens/EditProfileScreen"

const Stack = createNativeStackNavigator()

function AuthStack() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="SignIn" component={SignInScreen} />
      <Stack.Screen name="SignUp" component={SignUpScreen} />
    </Stack.Navigator>
  )
}

function MainStack() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="MainTabs" component={MainTabs} />
      <Stack.Screen name="Search" component={SearchScreen} />
      <Stack.Screen name="Album" component={AlbumScreen} />
      <Stack.Screen name="Artist" component={ArtistScreen} />
      <Stack.Screen name="Genre" component={GenreScreen} />
      <Stack.Screen name="Playlist" component={PlaylistScreen} />
      <Stack.Screen name="History" component={HistoryScreen} />
      <Stack.Screen name="LikedSongs" component={LikedSongsScreen} />
      <Stack.Screen name="EditProfile" component={EditProfileScreen} />
    </Stack.Navigator>
  )
}

export default function AppNavigator() {
  const { loading, isAuthenticated } = useAuth()

  if (loading) {
    return (
      <View style={{ flex: 1, backgroundColor: COLORS.background, alignItems: "center", justifyContent: "center" }}>
        <ActivityIndicator size="large" color={COLORS.primary} />
      </View>
    )
  }

  return <NavigationContainer>{isAuthenticated ? <MainStack /> : <AuthStack />}</NavigationContainer>
}
