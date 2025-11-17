import React from "react";
import {
  View,
  Text,
  StyleSheet,
  Button,
  ActivityIndicator,
} from "react-native";
import { useAuth, useUser, ClerkProvider } from "@clerk/clerk-expo";
import { router } from "expo-router";

export default function UserProfileScreen() {
  const { isLoaded, signOut } = useAuth();
  const { user, isLoaded: isUserLoaded } = useUser();

  const handleSignOut = () => {
    signOut();
    router.replace("/(auth)/sign-up");
  };

  if (!isLoaded || !isUserLoaded) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" />
        <Text>Loading user...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Welcome, {user?.fullName || "User"} 👋</Text>
      <Text style={styles.info}>
        Email: {user?.primaryEmailAddress?.emailAddress}
      </Text>
      <Text style={styles.info}>Username: {user?.username || "N/A"}</Text>

      <View style={styles.buttonContainer}>
        <Button title="Sign Out" onPress={handleSignOut} color="#FF5A5F" />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    justifyContent: "center",
    backgroundColor: "#fff",
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  title: {
    fontSize: 26,
    fontWeight: "bold",
    marginBottom: 10,
  },
  info: {
    fontSize: 18,
    marginBottom: 5,
  },
  buttonContainer: {
    marginTop: 30,
  },
});
