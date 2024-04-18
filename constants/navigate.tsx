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
  currentRoom: {isHost: boolean, gameRoomId: string};
  penalty: { startGame: () => void };
  penaltyEdit: undefined;
};

export type RootStackScreenProps<Screen extends keyof RootStackParamList> =
  NativeStackScreenProps<RootStackParamList, Screen>;