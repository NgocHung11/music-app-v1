"use client"
import { NavigationContainer } from "@react-navigation/native"
import { useAuth } from "../context/AuthContext"
import { ActivityIndicator, View } from "react-native"
import { COLORS } from "../constants/theme"
import { createNativeStackNavigator } from "@react-navigation/native-stack"

// Auth Screens
import SignInScreen from "../screens/SignInScreen"
import SignUpScreen from "../screens/SignUpScreen"

// Main Tabs with MiniPlayer
import MainTabs from "./MainTabs"
import MiniPlayer from "../components/MiniPlayer"

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
    <View style={{ flex: 1 }}>
      <MainTabs />
      <MiniPlayer />
    </View>
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
