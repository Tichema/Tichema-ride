import {
  DarkTheme,
  DefaultTheme,
  ThemeProvider,
} from "@react-navigation/native";
import { useFonts } from "expo-font";
import React, { useEffect } from "react";
import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import "react-native-reanimated";
import { ClerkProvider, ClerkLoading } from "@clerk/clerk-expo";
import { tokenCache } from "@clerk/clerk-expo/token-cache";
import { Redirect, useSegments, useRouter } from "expo-router";
import { useAuth } from "@clerk/clerk-expo";
import { View } from "react-native";

const CLERK_PUBLISHABLE_KEY = process.env.EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY;

const IntialLayout = () => {
  const { isLoaded, isSignedIn } = useAuth();

  const segments = useSegments();
  const router = useRouter();

  const [loaded] = useFonts({
    "Jakarta-Bold": require("../assets/fonts/PlusJakartaSans-Bold.ttf"),
    "Jakarta-ExtraBold": require("../assets/fonts/PlusJakartaSans-ExtraBold.ttf"),
    "Jakarta-ExtraLight": require("../assets/fonts/PlusJakartaSans-ExtraLight.ttf"),
    "Jakarta-Light": require("../assets/fonts/PlusJakartaSans-Light.ttf"),
    "Jakarta-Medium": require("../assets/fonts/PlusJakartaSans-Medium.ttf"),
    "Jakarta-Regular": require("../assets/fonts/PlusJakartaSans-Regular.ttf"),
    "Jakarta-SemiBold": require("../assets/fonts/PlusJakartaSans-SemiBold.ttf"),
  });

  useEffect(() => {
    if (!isLoaded) return;
    const inTabsGroup = segments[0] === "(root)" && segments[1] === "(tabs)";

    if (isSignedIn && !inTabsGroup) {
      console.log("done");
      router.replace("/(root)/(tabs)/home");
    } else if (!isSignedIn && inTabsGroup) {
      router.replace("/(auth)/sign-in");
    }
  }, [isSignedIn]);

  if (!loaded) {
    // Async font loading only occurs in development.
    return <View />;
  }

  return (
    <Stack>
      <Stack.Screen name="index" options={{ headerShown: false }} />
      <Stack.Screen name="(root)" options={{ headerShown: false }} />
      <Stack.Screen name="(auth)" options={{ headerShown: false }} />
      <Stack.Screen name="+not-found" />
    </Stack>
    // <StatusBar style="auto" />
  );
};

const RootLAyoutNav = () => {
  return (
    <ClerkProvider
      publishableKey={CLERK_PUBLISHABLE_KEY!}
      tokenCache={tokenCache}
    >
      <IntialLayout />
    </ClerkProvider>
  );
};

export default RootLAyoutNav;
