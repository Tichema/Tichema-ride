import { View, Text } from 'react-native'
import { useEffect, useState } from "react";

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
import { SafeAreaView } from 'react-native-safe-area-context'

const Home = () => {
const wallet = useActiveWallet();
  const account = useActiveAccount();
  const [email, setEmail] = useState<string | undefined>();
  const { disconnect } = useDisconnect();
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
      {/* <ThemedButton onPress={() => disconnect(wallet)} title="Disconnect" /> */}
    </View>
 
      
    </SafeAreaView>):(
      <Text> Not signed In</Text>
    )
 
}

export default Home