import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
  Linking,
  Alert,
} from "react-native";
import MaskInput from "react-native-mask-input";
import {
  isClerkAPIResponseError,
  useSignIn,
  useSignUp,
} from "@clerk/clerk-expo";

const GH_PHONE = [
  "+",
  "2",
  "3",
  "3",
  " ",
  /\d/,
  /\d/,
  /\d/,
  " ",
  /\d/,
  /\d/,
  /\d/,
  " ",
  /\d/,
  /\d/,
  /\d/,
];

const Page = () => {
  const [phoneNumber, setPhoneNumber] = useState("");
  const keyboardVerticalOffset = Platform.OS === "ios" ? 90 : 0;
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const { signUp, setActive } = useSignUp();
  const { signIn } = useSignIn();

  //   const openLink = () => Linking.openURL('https://galaxies.dev');

  const sendOTP = async () => {
    setLoading(true);
    try {
      await signUp!.create({ phoneNumber });
      await signUp!.preparePhoneNumberVerification();
      router.push(`/verify/${phoneNumber}`);
    } catch (err) {
      if (isClerkAPIResponseError(err)) {
        if (err.errors[0].code === "form_identifier_exists") {
          await trySignIn();
        } else {
          setLoading(false);
          console.log("Error: ", err);
          Alert.alert("Error", err.errors[0].message);
        }
      }
    }
  };

  const trySignIn = async () => {
    console.log("trySignIn", phoneNumber);

    const { supportedFirstFactors } = await signIn!.create({
      identifier: phoneNumber,
    });

    const firstPhoneFactor: any = supportedFirstFactors?.find((factor: any) => {
      return factor.strategy === "phone_code";
    });

    const { phoneNumberId } = firstPhoneFactor;

    await signIn!.prepareFirstFactor({
      strategy: "phone_code",
      phoneNumberId,
    });

    router.push(`/verify/${phoneNumber}?signin=true`);
    setLoading(false);
  };

  return (
    <KeyboardAvoidingView
      behavior="padding"
      keyboardVerticalOffset={keyboardVerticalOffset}
      className="flex-1 bg-white"
    >
      {loading && (
        <View className="absolute top-0 left-0 right-0 bottom-0 z-10 bg-white justify-center items-center">
          <ActivityIndicator size="large" color="#EAB308" />
          <Text className="text-base p-2">Sending code...</Text>
        </View>
      )}

      <View className="flex-1 items-center px-5 pt-10 gap-5">
        <Text className="text-sm text-gray-500 text-center">
          Tichema will need to verify your account. Carrier charges may apply.
        </Text>

        <View className="bg-white w-full rounded-xl p-3">
          <View className="flex-row justify-between items-center mb-3 px-1">
            <Text className="text-lg text-blue-600">Ghana</Text>
            <Ionicons name="chevron-forward" size={20} color="gray" />
          </View>

          <View className="w-full h-px bg-gray-400 opacity-20 mb-3" />

          <MaskInput
            value={phoneNumber}
            keyboardType="numeric"
            autoFocus
            placeholder="+233 your phone number"
            onChangeText={(masked) => setPhoneNumber(masked)}
            mask={GH_PHONE}
            className="bg-white w-full text-base px-2 py-2"
          />
        </View>

        <Text className="text-xs text-center text-black mt-5">
          You must be{" "}
          {/* <Text className="text-blue-600" onPress={openLink}>at least 16 years old</Text>{' '} */}
          to register. Learn how Tichema works with the{" "}
          {/* <Text className="text-blue-600" onPress={openLink}>Meta Companies</Text>. */}
        </Text>

        <View className="flex-1" />

        <TouchableOpacity
          onPress={sendOTP}
          className={`w-full items-center py-3 rounded-xl ${
            phoneNumber !== "" ? "bg-warning-500" : "bg-gray-200"
          } mb-5`}
        >
          <Text
            className={`text-lg font-medium ${
              phoneNumber !== "" ? "text-white" : "text-gray-500"
            }`}
          >
            Next
          </Text>
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
};

export default Page;
