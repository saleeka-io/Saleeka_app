import React, { useEffect, useState } from 'react';
import { Stack, useRouter } from 'expo-router'; // Ensure useRouter is imported
import { ActivityIndicator, View } from 'react-native';
import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import * as SplashScreen from 'expo-splash-screen';
import { useFonts } from 'expo-font';
import { useColorScheme } from '@/hooks/useColorScheme';
import auth, { FirebaseAuthTypes } from '@react-native-firebase/auth';

SplashScreen.preventAutoHideAsync();

export default function Layout() {
  const colorScheme = useColorScheme();
  const router = useRouter(); // Initialize the router

  const [fontsLoaded] = useFonts({
    "Poppins-Black": require("../assets/fonts/Poppins-Black.ttf"),
    "Poppins-Bold": require("../assets/fonts/Poppins-Bold.ttf"),
    "Poppins-ExtraBold": require("../assets/fonts/Poppins-ExtraBold.ttf"),
    "Poppins-ExtraLight": require("../assets/fonts/Poppins-ExtraLight.ttf"),
    "Poppins-Light": require("../assets/fonts/Poppins-Light.ttf"),
    "Poppins-Medium": require("../assets/fonts/Poppins-Medium.ttf"),
    "Poppins-Regular": require("../assets/fonts/Poppins-Regular.ttf"),
    "Poppins-SemiBold": require("../assets/fonts/Poppins-SemiBold.ttf"),
    "Poppins-Thin": require("../assets/fonts/Poppins-Thin.ttf"),
  });

  const [authChecking, setAuthChecking] = useState(true);
  const [user, setUser] = useState<FirebaseAuthTypes.User | null>(null);
  const [layoutReady, setLayoutReady] = useState(false);
  const [navigationTriggered, setNavigationTriggered] = useState(false);

  useEffect(() => {
    if (fontsLoaded) {
      SplashScreen.hideAsync();
    }
  }, [fontsLoaded]);

  // Firebase Authentication Check
  useEffect(() => {
    const unsubscribe = auth().onAuthStateChanged((user) => {
      setUser(user);
      setAuthChecking(false);
    });

    return () => unsubscribe();
  }, []);

  // Track when layout is ready
  useEffect(() => {
    if (!authChecking && fontsLoaded) {
      setLayoutReady(true);
    }
  }, [authChecking, fontsLoaded]);

  // Ensure navigation only happens once
  useEffect(() => {
    if (layoutReady && !navigationTriggered) {
      if (user !== null) {
        router.replace('/scan'); // Adjust to your camera screen route
      } else {
        router.replace('/login'); // Adjust to your login screen route
      }
      setNavigationTriggered(true); // Mark navigation as triggered
    }
  }, [layoutReady, user, router, navigationTriggered]);

  if (!layoutReady) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" color="#0000ff" />
      </View>
    );
  }

  return (
    <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
      <Stack>
        <Stack.Screen name="index" options={{ headerShown: false }} />
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen name="ResultScreen" options={{ headerShown: false }} />
        <Stack.Screen name="+not-found" />
      </Stack>
    </ThemeProvider>
  );
}
