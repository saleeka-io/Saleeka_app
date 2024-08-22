import React, { useEffect, useState } from 'react';
import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { Stack, useRouter } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { ActivityIndicator, View } from 'react-native';
import { useFonts } from 'expo-font';
import { useColorScheme } from '@/hooks/useColorScheme';
import auth, { FirebaseAuthTypes } from '@react-native-firebase/auth';

import 'react-native-reanimated';

// Prevent the splash screen from auto-hiding before asset loading is complete.
SplashScreen.preventAutoHideAsync();

export default function Layout() {
  const colorScheme = useColorScheme();
  const router = useRouter();

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
  const [user, setUser] = useState<FirebaseAuthTypes.User | null>(null); // Correct type

  const [layoutReady, setLayoutReady] = useState(false); // New state to track when layout is ready

  useEffect(() => {
    if (fontsLoaded) {
      SplashScreen.hideAsync();
    }
  }, [fontsLoaded]);

  // Firebase Authentication Check
  useEffect(() => {
    const unsubscribe = auth().onAuthStateChanged((user) => {
      setUser(user); // Set user state based on authentication
      setAuthChecking(false); // Auth check is complete
    });

    // Clean up the subscription when the component unmounts
    return () => unsubscribe();
  }, []);

  // Track when layout is ready
  useEffect(() => {
    if (!authChecking && fontsLoaded) {
      setLayoutReady(true); // Set layout as ready only after both auth and fonts are done
    }
  }, [authChecking, fontsLoaded]);

  // Ensure navigation only happens after layout is mounted and ready
  useEffect(() => {
    if (layoutReady && user === null) {
      router.push('/login'); // Correct path format based on project structure
    }
  }, [layoutReady, user, router]);

  if (!layoutReady) {
    // While fonts and authentication status are loading, show a spinner
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" color="#0000ff" />
      </View>
    );
  }

  return (
    <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
      <Stack>
        {/* Authenticated user stack */}
        {user ? (
          <>
            <Stack.Screen name="index" options={{ headerShown: false }} />
            <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
            <Stack.Screen name="ResultScreen" options={{ headerShown: false }} />
            <Stack.Screen name="+not-found" />
          </>
        ) : null}
      </Stack>
    </ThemeProvider>
  );
}
