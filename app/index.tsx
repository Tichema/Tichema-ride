import { View, Text } from 'react-native'
import React, { useEffect } from 'react'
import { SafeAreaView } from 'react-native-safe-area-context'
import { Redirect ,useSegments, useRouter} from 'expo-router'
import { useAuth } from "@clerk/clerk-expo";
import 'react-native-get-random-values';



const Home = () => {

    const { isLoaded, isSignedIn } = useAuth();

    // const segments = useSegments();
    // const router = useRouter();



    // if (isSignedIn) return <Redirect href="/(root)/(tabs)/home" />;
    
    // useEffect(() => {
    //     if (!isLoaded) return;
    //     const inTabsGroup = segments[0] === '(root)' && segments[1] === '(tabs)';

    //     if(isSignedIn && !inTabsGroup){
    //         console.log('done')
    //         router.replace('/(root)/(tabs)/home');
    //     } else if(!isSignedIn && inTabsGroup){
    //         router.replace('/(auth)/sign-in');
    //     }

    // }, [isSignedIn]);

  return <Redirect href="/(auth)/welcome"/>
}

export default Home