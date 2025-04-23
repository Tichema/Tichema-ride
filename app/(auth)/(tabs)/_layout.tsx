import { Tabs } from 'expo-router';
import React from 'react';
import { Platform } from 'react-native';

import { HapticTab } from '@/components/HapticTab';
import { IconSymbol } from '@/components/ui/IconSymbol';
import TabBarBackground from '@/components/ui/TabBarBackground';
import { Colors } from '@/constants/Colors';
import { useColorScheme } from '@/hooks/useColorScheme';
import { icons } from '@/constants';
import { Image, ImageSourcePropType, View } from 'react-native';


const TabIcon = ({source, focused}:{source : ImageSourcePropType; focused: boolean}) => {
    return ( 
        <View className={`flex fle-row justify-center items-center rounded-full
                ${focused?'bg-general-500':'' }`}>
            <View className={`rounded-full w-8 h-8 items-center justify-center
                ${focused? "bg-general-400": ""}`}>
                <Image
                source={source}
                tintColor="black"
                resizeMode="contain"
                className='w-5 h-5'
                />
            </View>
        </View>
    );
}

export default function TabLayout() {
  const colorScheme = useColorScheme();

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: Colors[colorScheme ?? 'light'].tint,
        headerShown: false,
        tabBarButton: HapticTab,
        tabBarBackground: TabBarBackground,
        tabBarStyle: Platform.select({
          ios: {
            // Use a transparent background on iOS to show the blur effect
            position: 'absolute',
          },
          default: {},
        }),
      }}>
      <Tabs.Screen
        name="signUp"
        options={{
          title: 'SignUp',
          tabBarIcon: ({ focused }) => <TabIcon focused={focused} source={icons.home} />,
        }}
      />
      <Tabs.Screen
        name="signIn"
        options={{
          title: 'SignIn',
          tabBarIcon: ({ focused }) => <TabIcon focused={focused} source={icons.person} />,
        }}
      />
    </Tabs>
  );
}
