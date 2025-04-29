import { router } from "expo-router";
import { Image, StyleSheet, View, useColorScheme } from "react-native";
import React from 'react'
import axios from 'axios'
import  ParallaxScrollView  from "@/components/ParallaxScrollView";
import { ThemedText } from "@/components/ThemedText";
import { ThemedView } from "@/components/ThemedView";
import {
  useActiveAccount,
  useConnect,
  useDisconnect,
  useActiveWallet,
  lightTheme,
  ConnectEmbed,
} from "thirdweb/react";
import {
  getUserEmail,
  hasStoredPasskey,
  inAppWallet,
} from "thirdweb/wallets/in-app";
import { chain, client } from "@/constants/thirdweb";
import { shortenAddress } from "thirdweb/utils";
import { ThemedButton } from "@/components/ThemeButton";
import {  useEffect, useState } from "react";
import { createWallet } from "thirdweb/wallets";
import { baseSepolia, ethereum } from "thirdweb/chains";
import { createAuth } from "thirdweb/auth";
import { Wallet } from "thirdweb/wallets";
import AsyncStorage from "@react-native-async-storage/async-storage"
// import {walletStorage} from "../../../utils/mmkv"

const wallets = [
  inAppWallet({
    auth: {
      options: [
        "google",
        "email",
        "phone",
    
      ],
      passkeyDomain: "thirdweb.com",
    },
    smartAccount: {
      chain: baseSepolia,
      sponsorGas: true,
    },
  }),
  createWallet("io.metamask"),
  createWallet("com.coinbase.wallet", {
    appMetadata: {
      name: "Thirdweb RN Demo",
    },
    mobileConfig: {
      callbackURL: "https://thirdweb.com",
    },
    walletConfig: {
      options: "smartWalletOnly",
    },
  }),
  createWallet("me.rainbow"),
  createWallet("com.trustwallet.app"),
  createWallet("io.zerion.wallet"),
];

const thirdwebAuth = createAuth({
  domain: "localhost:3000",
  client,
});

// fake login state, this should be returned from the backend
let isLoggedIn = false;




const handleConnect = async (wallet: Wallet) => {
  try {
    console.log("Wallet connected:", wallet);
    // Store wallet address locally
    // Save object
    // walletStorage.set('walletValue', JSON.stringify(wallet));
    // const walletValue = JSON.stringify(wallet)
    // console.log(walletValue);
    // await AsyncStorage.setItem("walletObject", walletValue);

    // Get the connected account (if available)
    const account = wallet.getAccount?.();
    if (!account) {
      console.warn("No account found from wallet.");
      return;
    }

    const res = await axios.post(`${process.env.EXPO_PUBLIC_SERVER_URI}/registerUser`, {
      account,
    });

    // console.log("Account registered:", res.data.walletAddress);
    console.log("Account registered:", res.data.user.walletAddress);
    const userAddress = res.data.user.walletAddress;

    // Store wallet address locally
    await AsyncStorage.setItem("walletAddress", userAddress);

    console.log("Connected account:", account);
    router.replace("/(root)/(maintabs)/home");

    // Get the wallet config
    // const userConfig = wallet.getConfig();
    // console.log("connect account:", userConfig);

    // Get the current chain
    // const chain = wallet.getChain?.();
    // console.log("Current Chain:", chain);

  } catch (error) {
    console.error("Error during wallet connection or registration:", error);
  }
};


export default function SignUp() {
  const account = useActiveAccount();
  const wallet = useActiveWallet();

  const theme = useColorScheme();
  return (
    <ParallaxScrollView
      headerBackgroundColor={{ light: "#A1CEDC", dark: "#1D3D47" }}
      headerImage={
        <Image
          source={require("@/assets/images/signup-car.png")}
          style={styles.reactLogo}
        />
      }
    >
      <ThemedView style={styles.titleContainer}>
        <ThemedText type="title">Connecting Wallets</ThemedText>
      </ThemedView>
      
      <View style={{ height: 16 }} />
      <View style={{ gap: 2 }}>
        {/* <ThemedText type="subtitle">{`<ConnectEmbed />`}</ThemedText> */}
        <ThemedText type="subtext">
          Signup and get started with the Tichema
        </ThemedText>
      </View>
      <ConnectEmbed
        client={client}
        theme={theme || "dark"}
        chain={ethereum}
        wallets={wallets}
        onConnect={handleConnect}
        auth={{
          async doLogin(params) {
            // fake delay
            await new Promise((resolve) => setTimeout(resolve, 2000));
            const verifiedPayload = await thirdwebAuth.verifyPayload(params);
            isLoggedIn = verifiedPayload.valid;
          },
          async doLogout() {
            isLoggedIn = false;
          },
          async getLoginPayload(params) {
            return thirdwebAuth.generatePayload(params);
          },
          async isLoggedIn(address) {
            return isLoggedIn;
          },
        }}
      />
      {account && (
        <ThemedText type="subtext">
          ConnectEmbed does not render when connected, use the `onConnect` prop
          to navigate to a new screen instead.
        </ThemedText>
      )}
      <View style={{ height: 16 }} />
   
    </ParallaxScrollView>
  );
}



const styles = StyleSheet.create({
  titleContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  stepContainer: {
    gap: 8,
    marginBottom: 8,
  },
  reactLogo: {
    height: "100%",
    width: "100%",
    bottom: 0,
    left: 0,
    position: "absolute",
  },
  rowContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 24,
    justifyContent: "space-evenly",
  },
  tableContainer: {
    width: "100%",
  },
  tableRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 4,
  },
  leftColumn: {
    flex: 1,
    textAlign: "left",
  },
  rightColumn: {
    flex: 1,
    textAlign: "right",
  },
});