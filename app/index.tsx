// import { View, Text } from 'react-native'
import React from 'react'
// import AsyncStorage from "@react-native-async-storage/async-storage"
import { useEffect, useState } from 'react';
import { Redirect } from "expo-router";
import { useActiveAccount, useActiveWallet } from "thirdweb/react";
// import {walletStorage} from "../utils/mmkv"

const Home = () => {


  const [isLoggedIn, setIsLoggedIn] = useState(false);

  const activeAccount = useActiveAccount();
  const wallet = useActiveWallet();

  
  useEffect(()=>{
    
    const getUserData = async () =>{
      try{
        // const walletAddress = await AsyncStorage.getItem("walletAddress")
        
        // const walletObject = JSON.parse(walletStorage.getString('walletValue')?? '');
        // const walletObject = await AsyncStorage.getItem("walletObject")
      // console.log(walletObject)
      // console.log(walletAddress)
      // setIsLoggedIn(!!walletAddress)
    }catch{
      console.error("failed to retrieve wallet address")
      setIsLoggedIn(false)
    }
  }
  getUserData();

},[]);


  return (
  <Redirect href={!wallet && !activeAccount? "/(auth)/welcome": "/(root)/(maintabs)/home"} />
)
};

export default Home;
