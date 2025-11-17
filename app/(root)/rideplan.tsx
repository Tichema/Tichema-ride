import {
  View,
  Text,
  KeyboardAvoidingView,
  Platform,
  TouchableOpacity,
  Dimensions,
  TextInput,
  Pressable,
  ScrollView,
  Image,
  ActivityIndicator,
} from "react-native";
import { useCallback, useRef, useEffect, useState } from "react";
import { windowHeight, windowWidth } from "@/themes/app.constant";
import MapView, { Marker, PROVIDER_GOOGLE } from "react-native-maps";
import MapViewDirections from "react-native-maps-directions";
import { router } from "expo-router";
import { icons, images } from "@/constants";
import { GooglePlacesAutocomplete } from "react-native-google-places-autocomplete";
import axios from "axios";
import _ from "lodash";
import * as Location from "expo-location";
import { Toast } from "react-native-toast-notifications";
import moment from "moment";
import { parseDuration } from "@/utils/time/parse.duration";
import CustomButton from "@/components/CustomButton";
import { DriverType } from "@/types/global";
import { useGetUserData } from "@/hooks/useGetUserDbData";
import {
  AlarmClock,
  ChevronDown,
  MapPinned,
  MapPinHouse,
} from "lucide-react-native";
import Constants from "expo-constants";
import * as Notifications from "expo-notifications";
import * as Device from "expo-device";

const rideplan = () => {
  const { dBUser } = useGetUserData();
  const notificationListener = useRef<any>();

  const [places, setPlaces] = useState<any>([]);
  const [query, setQuery] = useState("");
  const ws = useRef<any>(null);
  const [wsConnected, setWsConnected] = useState(false);
  const [region, setRegion] = useState<any>({
    latitude: 9.4071,
    longitude: -0.8539,
    latitudeDelta: 0.0922,
    longitudeDelta: 0.0421,
  });
  const [marker, setMarker] = useState<any>(null);
  const [currentLocation, setCurrentLocation] = useState<any>(null);
  const [distance, setDistance] = useState<any>(null);
  const [locationSelected, setLocationSelected] = useState(false);
  const [selectedVehicle, setSelectedVehicle] = useState("Car");
  const [travelTimes, setTravelTimes] = useState({
    driving: null,
    walking: null,
    bicycle: null,
  });
  const [keyboardAvoidingHeight, setKeyboardAvoidingHeight] = useState(false);
  const [driverLists, setDriverLists] = useState([]);
  const [selectedDriver, setSelectedDriver] = useState<DriverType>();
  const [driverLoader, setDriverLoader] = useState(true);

  // console.log(dBUser);

  //*NOTIFICATIONS
  Notifications.setNotificationHandler({
    handleNotification: async () => ({
      shouldShowAlert: true,
      shouldPlaySound: true,
      shouldSetBadge: false,
      shouldShowBanner: true,
      shouldShowList: true,
    }),
  });

  //* NOTIFICATION EFFECT
  useEffect(() => {
    notificationListener.current =
      Notifications.addNotificationReceivedListener((notification) => {
        const orderData = {
          currentLocation: notification.request.content.data.currentLocation,
          marker: notification.request.content.data.marker,
          distance: notification.request.content.data.distance,
          driver: notification.request.content.data.orderData,
        };
        router.push({
          pathname: "/(root)/ride-details",
          params: { orderData: JSON.stringify(orderData) },
        });
      });

    return () => {
      Notifications.removeNotificationSubscription(
        notificationListener.current
      );
    };
  }, []);

  //*REGISTERING PUSH NOTIFICATIONS EFFECT
  useEffect(() => {
    registerForPushNotificationsAsync();
  }, []);

  //*REGISTERING PUSH NOTIFICATIONS FUNCTION
  async function registerForPushNotificationsAsync() {
    if (Platform.OS === "android") {
      Notifications.setNotificationChannelAsync("default", {
        name: "default",
        importance: Notifications.AndroidImportance.MAX,
        vibrationPattern: [0, 250, 250, 250],
        lightColor: "#FF231F7C",
      });
    }
    console.log("Registering For Push Notifications");
    if (Device.isDevice) {
      const { status: existingStatus } =
        await Notifications.getPermissionsAsync();
      let finalStatus = existingStatus;
      if (existingStatus !== "granted") {
        const { status } = await Notifications.requestPermissionsAsync();
        finalStatus = status;
      }
      if (finalStatus !== "granted") {
        Toast.show("Failed to get push token for push notification!", {
          type: "danger",
        });
        return;
      }
      const projectId =
        Constants?.expoConfig?.extra?.eas?.projectId ??
        Constants?.easConfig?.projectId;
      console.log("Project ID:", projectId);
      if (!projectId) {
        Toast.show("Failed to get project id for push notification!", {
          type: "danger",
        });
      }
      try {
        const pushTokenString = (
          await Notifications.getExpoPushTokenAsync({
            projectId,
          })
        ).data;
        if (!pushTokenString) {
          console.warn("Push token not received");
          return;
        }
        console.log(pushTokenString);
        // ExponentPushToken[88qC5tEgDe2wKPRxKaPMSf]
        return pushTokenString;
      } catch (e: unknown) {
        console.error("Error getting push token:", e);
        const errorMessage = e instanceof Error ? e.message : JSON.stringify(e);
        Toast.show(errorMessage, { type: "danger" });
      }
    } else {
      Toast.show("Must use physical device for Push Notifications", {
        type: "danger",
      });
    }
  }

  //*FETCH TRAVEL TIMES/
  const fetchTravelTimes = async (origin: any, destination: any) => {
    const modes = ["driving", "walking", "bicycling"];
    let travelTimes = {
      driving: null,
      walking: null,
      bicycling: null,
    } as any;

    for (const mode of modes) {
      let params = {
        origins: `${origin.latitude},${origin.longitude}`,
        destinations: `${destination.latitude},${destination.longitude}`,
        key: process.env.EXPO_PUBLIC_GOOGLE_CLOUD_API_KEY!,
        mode: mode,
      } as any;

      if (mode === "driving") {
        params.departure_time = "now";
      }

      try {
        const response = await axios.get(
          `https://maps.googleapis.com/maps/api/distancematrix/json`,
          { params }
        );

        const rows = response.data?.rows;
        if (
          rows &&
          rows.length > 0 &&
          rows[0].elements &&
          rows[0].elements.length > 0
        ) {
          const element = rows[0].elements[0];
          if (element.status === "OK") {
            travelTimes[mode] = element.duration.text;
          } else {
            console.warn(`Mode ${mode} failed:`, element.status);
          }
        } else {
          console.warn(`Mode ${mode} returned invalid response`, response.data);
        }
      } catch (error) {
        console.log(error);
      }
    }

    setTravelTimes(travelTimes);
  };

  //*CALCULATE DISTANCE
  const calculateDistance = (lat1: any, lon1: any, lat2: any, lon2: any) => {
    var p = 0.017453292519943295; // Math.PI / 180
    var c = Math.cos;
    var a =
      0.5 -
      c((lat2 - lat1) * p) / 2 +
      (c(lat1 * p) * c(lat2 * p) * (1 - c((lon2 - lon1) * p))) / 2;

    return 12742 * Math.asin(Math.sqrt(a)); // 2 * R; R = 6371 km
  };

  //*HANDLE PLACE SELECT//
  const handlePlaceSelect = async (placeId: any) => {
    try {
      const response = await axios.get(
        `https://maps.googleapis.com/maps/api/place/details/json`,
        {
          params: {
            place_id: placeId,
            key: process.env.EXPO_PUBLIC_GOOGLE_CLOUD_API_KEY,
          },
        }
      );
      const { lat, lng } = response.data.result.geometry.location;

      const selectedDestination = { latitude: lat, longitude: lng };
      setRegion({
        ...region,
        latitude: lat,
        longitude: lng,
      });
      setMarker({
        latitude: lat,
        longitude: lng,
      });
      setPlaces([]);
      requestNearbyDrivers();
      setLocationSelected(true);
      setKeyboardAvoidingHeight(false);
      if (currentLocation) {
        await fetchTravelTimes(currentLocation, selectedDestination);
      }
    } catch (error) {
      console.log(error);
    }
  };
  //*HANDLE INPUT CHANGE
  const handleInputChange = (text: any) => {
    setQuery(text);
  };
  //*FETCH PLACES
  const fetchPlaces = async (input: any) => {
    try {
      const response = await axios.get(
        `https://maps.googleapis.com/maps/api/place/autocomplete/json`,
        {
          params: {
            input,
            key: process.env.EXPO_PUBLIC_GOOGLE_CLOUD_API_KEY,
            language: "en",
          },
        }
      );
      setPlaces(response.data.predictions);
    } catch (error) {
      console.log(error);
    }
  };

  //*GET ESTIMATED ARRIVAL TIME
  const getEstimatedArrivalTime = (travelTime: any) => {
    const now = moment();
    const travelMinutes = parseDuration(travelTime);
    const arrivalTime = now.add(travelMinutes, "minutes");
    return arrivalTime.format("hh:mm A");
  };

  const debouncedFetchPlaces = useCallback(_.debounce(fetchPlaces, 100), []);

  //*INITIALIZING WEBSOCKETS
  const initializeWebSocket = () => {
    ws.current = new WebSocket("ws://192.168.0.135:8080");
    ws.current.onopen = () => {
      console.log("Connected to websocket server");
      setWsConnected(true);
    };

    ws.current.onerror = (e: any) => {
      console.log("WebSocket error:", e.message);
    };

    ws.current.onclose = (e: any) => {
      console.log("WebSocket closed:", e.code, e.reason);
      setWsConnected(false);
      // Attempt to reconnect after a delay
      setTimeout(() => {
        initializeWebSocket();
      }, 5000);
    };
  };

  //*INITIALIZE WEBSOCKET ON MOUNT
  useEffect(() => {
    initializeWebSocket();
    return () => {
      if (ws.current) {
        ws.current.close();
      }
    };
  }, []);

  //*GETTING CURRENT LOCATION EFFECT
  useEffect(() => {
    (async () => {
      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== "granted") {
        Toast.show(
          "Please approve your location permission to use this feature",
          {
            type: "danger",
            placement: "bottom",
          }
        );
      }
      let location = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.High,
      });
      const { latitude, longitude } = location.coords;
      setCurrentLocation({
        latitude,
        longitude,
      });
      setRegion({
        latitude,
        longitude,
        latitudeDelta: 0.0922,
        longitudeDelta: 0.0421,
      });
    })();
  }, []);

  //*DEBOUNCE PLACES FETCHING EFFECT
  useEffect(() => {
    if (query.length > 2) {
      debouncedFetchPlaces(query);
    } else {
      setPlaces([]);
    }
  }, [query, debouncedFetchPlaces]);

  //*CURRENT LOCATION AND MARKER DISTANCE EFFECT
  useEffect(() => {
    if (marker && currentLocation) {
      const dist = calculateDistance(
        currentLocation.latitude,
        currentLocation.longitude,
        marker.latitude,
        marker.longitude
      );
      setDistance(dist);
      console.log(dist);
    }
  }, [marker, currentLocation]);

  //* GET NEAR BY DRIVERS
  const getNearbyDrivers = () => {
    ws.current.onmessage = async (e: any) => {
      try {
        const message = JSON.parse(e.data);
        if (message.type === "nearbyDrivers") {
          await getDriversData(message.drivers);
        }
      } catch (error) {
        console.log(error, "Error parsing websocket");
      }
    };
  };

  //* GET DRIVERS DATA
  const getDriversData = async (drivers: any) => {
    // Extract driver IDs from the drivers array
    const driverIds = drivers.map((driver: any) => driver.id).join(",");
    const response = await axios.get(
      `${process.env.EXPO_PUBLIC_SERVER_URI}/driver/get-drivers-data`,
      {
        params: { ids: driverIds },
      }
    );

    const driverData = response.data;
    setDriverLists(driverData);
    setDriverLoader(false);
  };

  //* REQUEST NEARBY DRIVERS
  const requestNearbyDrivers = () => {
    console.log(wsConnected);
    if (currentLocation && wsConnected) {
      ws.current.send(
        JSON.stringify({
          type: "requestRide",
          role: "user",
          latitude: currentLocation.latitude,
          longitude: currentLocation.longitude,
        })
      );
      getNearbyDrivers();
    }
  };

  //*HANDLE ORDER

  const handleOrder = async () => {
    const currentLocationName = await axios.get(
      `https://maps.googleapis.com/maps/api/geocode/json?latlng=${currentLocation?.latitude},${currentLocation?.longitude}&key=${process.env.EXPO_PUBLIC_GOOGLE_CLOUD_API_KEY}`
    );
    const destinationLocationName = await axios.get(
      `https://maps.googleapis.com/maps/api/geocode/json?latlng=${marker?.latitude},${marker?.longitude}&key=${process.env.EXPO_PUBLIC_GOOGLE_CLOUD_API_KEY}`
    );
    // console.log(dBUser);

    const data = {
      dBUser,
      currentLocation,
      marker,
      // distance: distance.toFixed(2),
      // currentLocationName:
      //   currentLocationName.data.results[0].formatted_address,
      // destinationLocation:
      //   destinationLocationName.data.results[0].formatted_address,
    };
    console.log(data);
    const driverPushToken = "ExponentPushToken[88qC5tEgDe2wKPRxKaPMSf]";

    await sendPushNotification(driverPushToken, JSON.stringify(data));
  };

  //*SEND PUSH NOTIFICATION
  const sendPushNotification = async (expoPushToken: string, data: any) => {
    const message = {
      to: expoPushToken,
      sound: "default",
      title: "New Ride Request",
      body: "You have a new ride request.",
      data: { orderData: data },
    };

    await axios.post("https://exp.host/--/api/v2/push/send", message);
  };

  return (
    <KeyboardAvoidingView
      style={{ flex: 1, backgroundColor: "#fff" }}
      behavior={Platform.OS === "android" ? "padding" : "height"}
    >
      <View>
        <View
          style={{ height: windowHeight(!keyboardAvoidingHeight ? 400 : 80) }}
        >
          <MapView
            className="flex-1"
            region={region}
            provider={PROVIDER_GOOGLE}
            onRegionChangeComplete={(region) => setRegion(region)}
          >
            {marker && <Marker coordinate={marker} />}
            {currentLocation && <Marker coordinate={currentLocation} />}
            {currentLocation && marker && (
              <MapViewDirections
                origin={currentLocation}
                destination={marker}
                apikey={process.env.EXPO_PUBLIC_GOOGLE_CLOUD_API_KEY!}
                strokeWidth={4}
                strokeColor="blue"
              />
            )}
          </MapView>
        </View>
      </View>
      <View className="flex-1">
        <View className="flex-1 px-4">
          {locationSelected ? (
            <>
              {driverLoader ? (
                <View className="flex-1 items-center justify-center">
                  <ActivityIndicator size={"large"} />
                </View>
              ) : (
                <ScrollView
                  className="pb-5"
                  style={{ height: windowHeight(400) }}
                >
                  <View className="flex-row border-b border-gray-400 pb-2">
                    <Pressable onPress={() => setLocationSelected(false)}>
                      <Image source={icons.backArrow} className="h-5 w-5" />
                    </Pressable>
                    <Text className="text-[20px] font-semibold mx-auto">
                      Gathering options
                    </Text>
                  </View>

                  <View className="p-3">
                    {driverLists?.map((driver: DriverType) => (
                      <Pressable
                        className={`w-full border ${selectedVehicle === driver.vehicle_type ? "border-2" : "border"} rounded-xl p-1 my-1`}
                        onPress={() => setSelectedVehicle(driver.vehicle_type)}
                        key={driver.id}
                      >
                        <View className="flex-row items-center justify-between mt-2">
                          <View>
                            <Image
                              // source={require("@/assets/images/car.png")}
                              source={
                                driver?.vehicle_type === "Rickshaw"
                                  ? require("@/assets/images/car.png")
                                  : driver?.vehicle_type === "Motorcycle"
                                    ? require("@/assets/images/bike.png")
                                    : require("@/assets/images/bike.png")
                              }
                              style={{ width: 60, height: 50 }}
                            />
                          </View>
                          <View>
                            <Text className="text-[16px] font-semibold">
                              Tichema {driver?.vehicle_type}
                            </Text>
                            <Text className="text-[11px]">
                              {getEstimatedArrivalTime(travelTimes?.driving)}{" "}
                              dropoff
                            </Text>
                          </View>
                          <Text className="text-[16px] font-semibold">
                            GHC{" "}
                            {(distance?.toFixed(2) * driver?.rate).toFixed(2)}
                          </Text>
                        </View>
                      </Pressable>
                    ))}

                    <View className="mt-4">
                      <CustomButton
                        title={"Confirm Booking"}
                        onPress={() => handleOrder()}
                        className="w-11/12 mt-10 mb-5"
                      />
                    </View>
                  </View>
                </ScrollView>
              )}
            </>
          ) : (
            <>
              <View className="flex-row items-center">
                <TouchableOpacity onPress={() => router.back()}>
                  <Image source={icons.backArrow} className="h-5 w-5" />
                </TouchableOpacity>
                <Text className="text-[18px] font-semibold mx-auto">
                  Plan Your Ride
                </Text>
              </View>
              {/* Pick-up time */}
              <View className="w-[320px] h-[28px] rounded-2xl bg-gray-200 items-center justify-center my-2.5">
                <View className="flex-row items-center">
                  {/* <Image source={icons.backArrow} className="h-5 w-5" /> */}
                  <AlarmClock color="black" size={20} />
                  <Text className="text-[12px] font-semibold px-2">
                    Pick-Up Now
                  </Text>
                  {/* <Image source={icons.backArrow} className="h-5 w-5" /> */}
                  <ChevronDown color="black" size={20} />
                </View>
              </View>

              {/* Pick-up location input */}
              <View className="border-2 border-black rounded-xl mb-2 px-4 py-2">
                <View className="flex-row items-center">
                  <MapPinned color="#EAB308" size={20} />
                  {/* <Image source={icons.backArrow} className="h-5 w-5" /> */}
                  <View
                    className="ml-1 border-b border-gray-500"
                    style={{
                      width: Dimensions.get("window").width - 110,
                      height: windowHeight(25),
                    }}
                  >
                    <Text className="text-[#EAB308] text-[18px] pl-1">
                      Current Location
                    </Text>
                  </View>
                </View>

                <View className="flex-row p-3">
                  <MapPinHouse color="black" size={20} />
                  {/* <Image source={icons.backArrow} className="h-5 w-5" /> */}
                  <View
                    className="ml-1"
                    style={{ width: Dimensions.get("window").width - 110 }}
                  >
                    <GooglePlacesAutocomplete
                      placeholder="Where to?"
                      onPress={(data, details = null) => {
                        setKeyboardAvoidingHeight(true);
                        setPlaces([
                          {
                            description: data.description,
                            place_id: data.place_id,
                          },
                        ]);
                      }}
                      query={{
                        key: `${process.env.EXPO_PUBLIC_GOOGLE_CLOUD_API_KEY!}`,
                        language: "en",
                      }}
                      styles={{
                        textInputContainer: { width: "100%" },
                        textInput: {
                          height: 38,
                          color: "#000",
                          fontSize: 16,
                        },
                        predefinedPlacesDescription: { color: "#000" },
                      }}
                      textInputProps={{
                        onChangeText: (text) => handleInputChange(text),
                        value: query,
                        onFocus: () => setKeyboardAvoidingHeight(true),
                      }}
                      onFail={(error) => console.log(error)}
                      fetchDetails={true}
                      debounce={200}
                    />
                  </View>
                </View>
              </View>
              {places.map((place: any, index: number) => (
                <Pressable
                  key={index}
                  className="flex-row items-center mb-5"
                  onPress={() => handlePlaceSelect(place.place_id)}
                >
                  <Image source={icons.backArrow} className="h-5 w-5" />
                  <Text className="pl-4 text-[18px]">{place.description}</Text>
                </Pressable>
              ))}
            </>
          )}
        </View>
      </View>
    </KeyboardAvoidingView>
  );
};

export default rideplan;
