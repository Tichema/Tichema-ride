import { Stack } from "expo-router";

const layout = () => {
  return (
    <Stack>
      <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
      <Stack.Screen name="rideplan" options={{ headerShown: false }} />
      <Stack.Screen name="confirm-ride" options={{ headerShown: false }} />
      <Stack.Screen name="find-ride" options={{ headerShown: false }} />
      <Stack.Screen name="ride-details" options={{ headerShown: false }} />
    </Stack>
    // <StatusBar style="auto" />
  );
};

export default layout;
