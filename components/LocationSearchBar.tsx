import { View, Text, Pressable, Image } from "react-native";
// import { Clock, Search } from "@/utils/icons";
// import DownArrow from "@/assets/icons/downArrow";
import { router } from "expo-router";
import { icons } from "@/constants";

export default function LocationSearchBar() {
  return (
    <Pressable
      className="
        bg-gray-200 
        flex-row 
        justify-around 
        items-center 
        h-10 
        rounded-full 
        mt-2.5 
        px-4 
        overflow-hidden
      "
      onPress={() => router.push("/(root)/rideplan")}
    >
      <View className="flex-row pl-2 items-center">
        <Image source={icons.search} className="w-6 h-6" resizeMode='contain' />
        <Text className="text-[10px] font-medium text-black pl-2">
          Where to?
        </Text>
      </View>

      <View className="bg-white rounded-full w-[100px] h-[28px] justify-center items-center">
        <View className="flex-row items-center">
        <Image source={icons.map} className="w-6 h-6" resizeMode='contain' />
          <Text className="text-[12px] font-semibold px-2">Now</Text>
        <Image source={icons.arrowDown} className="w-6 h-6" resizeMode='contain' />
        </View>
      </View>
    </Pressable>
  );
}
