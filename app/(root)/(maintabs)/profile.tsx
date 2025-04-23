import { View, Text, Button } from 'react-native'
import React from 'react'
import { useEffect, useState } from "react";
import { SafeAreaView } from 'react-native-safe-area-context'
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

const Profile = () => {
 
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
          <Text>Profile</Text>
          <Text>Connected as {shortenAddress(account.address)}</Text>
          {email && <Text>{email}</Text>}
          <View style={{ height: 16 }} />
          <Button onPress={() => disconnect(wallet)} title="Disconnect" />
        </View>
      </SafeAreaView>
    ) : null;
}

export default Profile