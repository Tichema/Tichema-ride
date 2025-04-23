import { View, Text, Button } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { useEffect, useState } from "react";
import { router } from "expo-router";
import {
  useActiveAccount,
  useConnect,
  useDisconnect,
  useActiveWallet,
  ConnectButton,
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

import React from 'react'

const Home = () => {
const wallet = useActiveWallet();
  const account = useActiveAccount();
  const [email, setEmail] = useState<string | undefined>();
  
  
  const disconnectWallet = async (wallet: any) => {
    const { disconnect } = useDisconnect();
    try {
      // Disconnect the wallet
      disconnect(wallet);
      // Redirect to home or login page
      router.push("/(auth)/(tabs)/signUp"); // or "/login"
    } catch (error) {
      console.error("Failed to disconnect wallet:", error);
    }
  };
  useEffect(() => {
    if (wallet && wallet.id === "inApp") {
      getUserEmail({ client }).then(setEmail);
    }
  }, [wallet]);

  return wallet && account ? (
    <SafeAreaView>
    <View>
      <Text>Connected as {shortenAddress(account.address)}</Text>
      {email && <Text >{email}</Text>}
      <View style={{ height: 16 }} />
      <Button onPress={disconnectWallet} title="Disconnect" />
    </View>
 
      
    </SafeAreaView>):(
      <SafeAreaView>
        <Text> Not signed In</Text>
      </SafeAreaView>
    )
 
}

export default Home