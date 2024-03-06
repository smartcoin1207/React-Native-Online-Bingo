import { NativeStackScreenProps } from "@react-navigation/native-stack";

declare global {
  namespace ReactNavigation {
    interface RootParamList extends RootStackParamList {}
  }
}

export type RootStackParamList = {
  Splash: undefined;
  Login: undefined;
  Home: undefined;
  Notice: undefined;
  Chating: undefined;
  SettingMain: undefined;
  SettingChat: undefined;
  Request: undefined;
  RequestSend: undefined;
  Exhibit: undefined;
};

export type RootStackScreenProps<Screen extends keyof RootStackParamList> =
  NativeStackScreenProps<RootStackParamList, Screen>;