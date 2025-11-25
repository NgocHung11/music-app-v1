"use client"
import { StatusBar } from "expo-status-bar"
import { SafeAreaProvider } from "react-native-safe-area-context"
import { GestureHandlerRootView } from "react-native-gesture-handler"
import { NavigationContainer } from "@react-navigation/native"
import { createNativeStackNavigator } from "@react-navigation/native-stack"
import { ActivityIndicator, View } from "react-native"
import { AuthProvider, useAuth } from "./src/context/AuthContext"
import { PlayerProvider } from "./src/context/PlayerContext"
import { COLORS } from "./src/constants/theme"
import MiniPlayer from "./src/components/MiniPlayer"

// Auth Screens
import SignInScreen from "./src/screens/SignInScreen"
import SignUpScreen from "./src/screens/SignUpScreen"

// Main Tabs
import MainTabs from "./src/navigation/MainTabs"

// Types for navigation
export type RootStackParamList = {
  // Auth
  SignIn: undefined
  SignUp: undefined
  // Main
  MainTabs: undefined
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
        <Stack.Screen name="MainTabs" component={MainTabs} />
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
              <View style={{ flex: 1 }}>
                <RootNavigator />
                <MiniPlayer />
              </View>
            </NavigationContainer>
          </PlayerProvider>
        </AuthProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  )
}
