// import Colors from '@/constants/Colors';
import {
  useSignUp,
  isClerkAPIResponseError,
  useSignIn,
} from "@clerk/clerk-expo";
import axios from "axios";
import { Stack, useLocalSearchParams } from "expo-router";
import { useEffect, useState } from "react";
import { View, Text, TouchableOpacity } from "react-native";
import {
  CodeField,
  Cursor,
  useBlurOnFulfill,
  useClearByFocusCell,
} from "react-native-confirmation-code-field";

const CELL_COUNT = 6;

const Page = () => {
  const { phone, signin } = useLocalSearchParams<{
    phone: string;
    signin: string;
  }>();
  const [code, setCode] = useState("");

  const ref = useBlurOnFulfill({ value: code, cellCount: CELL_COUNT });
  const [props, getCellOnLayoutHandler] = useClearByFocusCell({
    value: code,
    setValue: setCode,
  });

  const { signUp, setActive } = useSignUp();
  const { signIn } = useSignIn();

  useEffect(() => {
    if (code.length === 6) {
      console.log("verify", code);
      signin === "true" ? veryifySignIn() : verifyCode();
    }
  }, [code]);

  const verifyCode = async () => {
    if (!signUp) {
      console.warn("signUp is not ready yet.");
      return;
    }

    try {
      await signUp!.attemptPhoneNumberVerification({ code });
      await setActive!({ session: signUp!.createdSessionId });

      console.log(signUp);
      console.log(signUp.createdUserId);

      const res = await axios.post(
        `${process.env.EXPO_PUBLIC_SERVER_URI}/registerUser`,
        {
          createdUserId: signUp.createdUserId,
          createdSessionId: signUp.createdSessionId,
          phoneNumber: signUp.phoneNumber,
          status: signUp.status,
        }
      );

      console.log("Account registered:", res.data.user.walletAddress);
      const userAddress = res.data.user.walletAddress;
      const userId = res.data.user.walletAddress;
      console.log("Account registered:", userAddress);
    } catch (err) {
      console.log("error", JSON.stringify(err, null, 2));
      if (isClerkAPIResponseError(err)) {
        alert(err.errors[0].message);
      }
    }
  };

  const veryifySignIn = async () => {
    try {
      await signIn!.attemptFirstFactor({ strategy: "phone_code", code });
      await setActive!({ session: signIn!.createdSessionId });
    } catch (err) {
      console.log("error", JSON.stringify(err, null, 2));
      if (isClerkAPIResponseError(err)) {
        alert(err.errors[0].message);
      }
    }
  };

  const resendCode = async () => {
    try {
      if (signin === "true") {
        const { supportedFirstFactors } = await signIn!.create({
          identifier: phone,
        });
        const firstPhoneFactor: any = supportedFirstFactors?.find(
          (factor: any) => factor.strategy === "phone_code"
        );
        await signIn!.prepareFirstFactor({
          strategy: "phone_code",
          phoneNumberId: firstPhoneFactor.phoneNumberId,
        });
      } else {
        await signUp!.create({ phoneNumber: phone });
        signUp!.preparePhoneNumberVerification();
      }
    } catch (err) {
      console.log("error", JSON.stringify(err, null, 2));
      if (isClerkAPIResponseError(err)) {
        alert(err.errors[0].message);
      }
    }
  };

  return (
    <View className="flex-1 items-center px-5 py-10 bg-white gap-6">
      <Stack.Screen options={{ title: phone }} />

      <Text className="text-center text-sm text-black">
        We have sent you an SMS with a code to the number above.
      </Text>
      <Text className="text-center text-sm text-black">
        To complete your phone number verification, please enter the 6-digit
        activation code.
      </Text>

      <CodeField
        {...props}
        value={code}
        onChangeText={setCode}
        cellCount={CELL_COUNT}
        rootStyle={{ marginTop: 20, width: 260, alignSelf: "center", gap: 4 }}
        keyboardType="number-pad"
        textContentType="oneTimeCode"
        renderCell={({ index, symbol, isFocused }) => (
          <View
            key={index}
            onLayout={getCellOnLayoutHandler(index)}
            className={
              isFocused
                ? "w-10 h-10 justify-center items-center border-b-2 border-black pb-1"
                : "w-10 h-10 justify-center items-center border-b border-gray-300"
            }
          >
            <Text className="text-black text-3xl text-center">
              {symbol || (isFocused ? <Cursor /> : null)}
            </Text>
          </View>
        )}
      />

      <TouchableOpacity
        className="w-full items-center mt-6"
        onPress={resendCode}
      >
        <Text className="text-blue-600 text-lg">
          Didn’t receive a verification code?
        </Text>
      </TouchableOpacity>
    </View>
  );
};

export default Page;
