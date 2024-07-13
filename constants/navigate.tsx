import { NativeStackScreenProps } from "@react-navigation/native-stack";

declare global {
  namespace ReactNavigation {
    interface RootParamList extends RootStackParamList {}
  }
}

export type RootStackParamList = {
  Splash: undefined;
  bingo: undefined;
  Home: undefined;
  register: undefined;
  login: undefined;
  GameList: undefined;
  gameRoomList: undefined;
  currentRoom: {isHostParam: boolean, gameRoomIdParam: string};
  penaltyAB: undefined;
  penalty: undefined;
  penaltyEdit: undefined;
  highlow: undefined,
  tictactoe: undefined,
  plusminus: undefined,
  testscreen: undefined
};

export type RootStackScreenProps<Screen extends keyof RootStackParamList> =
  NativeStackScreenProps<RootStackParamList, Screen>;