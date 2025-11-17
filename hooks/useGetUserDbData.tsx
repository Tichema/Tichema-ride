import AsyncStorage from "@react-native-async-storage/async-storage";
import axios from "axios";
import { useEffect, useState } from "react";
import { useUser, useAuth } from "@clerk/clerk-expo";
import { UserType } from "@/types/global";

export const useGetUserData = () => {
  const { user, isLoaded } = useUser();
  const { getToken } = useAuth();
  const [dBUser, setDbUser] = useState<UserType>();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUser = async () => {
      if (!isLoaded || !user) return;

      try {
        const token = await getToken();
        if (!token) return;

        const phoneNumber = user?.primaryPhoneNumber?.phoneNumber;
        const res = await axios.get(
          `${process.env.EXPO_PUBLIC_SERVER_URI}/me`,
          {
            params: { phoneNumber },
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        console.log("User data fetched:", res.data);

        setDbUser(res.data.dBUser);
      } catch (error: any) {
        console.error("Fetch user error:", error.message);
      } finally {
        setLoading(false);
      }
    };
    fetchUser();
  }, []);

  return { loading, dBUser };
};
