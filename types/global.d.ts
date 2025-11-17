import { Float } from "react-native/Libraries/Types/CodegenTypes";

type ButtonProps = {
  title?: string;
  onPress?: () => void;
  width?: DimensionValue;
  backgroundColor?: string;
  textColor?: string;
  disabled?: boolean;
};

type UserType = {
  id: string;
  firstName: string;
  lastName: string;
  userName: string;
  walletAddress: string;
  privateKey: string;
  phoneNumber: string;
  email: string;
  ratings?: Number;
  totalRides?: Number;
  cratedAt: Date;
  updatedAt: Date;
  createdUserId: string;
  createdSessionId: string;
};

type DriverType = {
  id: string;
  firstName: string;
  lastName: string;
  userName: string;
  walletAddress: string;
  privateKey: string;
  phoneNumber: string;
  email: string;
  status: string;
  vehicle_type: string;
  registration_number: string;
  registration_date: string;
  driving_license: string;
  vehicle_color: string;
  rate: number;
  work_status: string;
  ratings: number;
  totalEarning: number;
  totalRides: number;
  pendingRides: number;
  cancelRides: number;
  createdAt: Date;
  updatedAt: Date;
  createdUserId: string;
  createdSessionId: string;
};