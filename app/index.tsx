import { View, Text } from 'react-native'
import AsyncStorage from "@react-native-async-storage/async-storage";
import React from 'react'
import { SafeAreaView } from 'react-native-safe-area-context'
import { Redirect } from 'expo-router'
import { useEffect, useState } from "react";


const Home = () => {

  const [isLoggedIn, setisLoggedIn] = useState(false);
  const [isLoading, setisLoading] = useState(true);


  // useEffect(() => {
  //   let isMounted = true; // flag to check if the component is mounted

  //   const getData = async () => {
  //     try {
  //       const walletAddress = await AsyncStorage.getItem("walletAddress");
  //       console.log(walletAddress)
  //       if (isMounted) {
  //         setisLoggedIn(!!walletAddress);
  //       }
  //     } catch (error) {
  //       console.log("Failed to retrieve access token from async storage", error);
  //     } finally {
  //       if (isMounted) {
  //         setisLoading(false);
  //       }
  //     }
  //   };

  //   getData();

  //   return () => {
  //     isMounted = false;
  //   };
  // }, []);


  return <Redirect href={ "/(auth)/welcome"}/>
  // return <Redirect href={isLoggedIn ? "/(root)/(maintabs)/home" : "/(auth)/welcome"}/>
}

export default Home