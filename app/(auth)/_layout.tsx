import { Stack } from 'expo-router';

const layout =  () => {

  return (
      <Stack>
        <Stack.Screen name="welcome" options={{ headerShown: false }} />
        <Stack.Screen name="sign-up" options={{ headerShown: false }} />
        <Stack.Screen name="verify/[phone]" options={{title: 'Verify Your Phone Number', headerShown: true, headerBackTitle: 'Edit number',}}/>
        <Stack.Screen name="sign-in" options={{ headerShown: false }} />
      </Stack>
      // <StatusBar style="auto" />
   
  );
}

export default layout;