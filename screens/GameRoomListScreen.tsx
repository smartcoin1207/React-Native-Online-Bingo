import { useEffect, useState } from "react";
import { useNavigation } from "@react-navigation/native";
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  Dimensions,
  TouchableOpacity,
  Button,
  FlatList,
} from "react-native";

import { Avatar, Image } from "react-native-elements";

import { createBingoRoom, getWaitingBingoRooms, joinBingoRoom } from "../utils/firebase/FirebaseUtil";
import { BingoRoom, User, NavigatorType } from "../utils/Types";
import { useDispatch, useSelector } from "react-redux";
import { RootState } from "../store";
import { setBingoRooms } from "../store/reducers/bingo/bingoRoomSlice";

const screenHeight = Dimensions.get("window").height;
const cellSize = screenHeight / 5;

const GameRoomScreen = () => {
  const navigator: NavigatorType = useNavigation();
  const [user, setUser] = useState<User | null>();
  const authUser = useSelector((state: RootState) => state.auth.authUser);
  const isLoggedIn = useSelector((state: RootState) => state.auth.isLoggedIn);
  
  const bingoRooms = useSelector((state: RootState) => state.bingoRoom.bingoRooms);
  const dispatch = useDispatch();

  useEffect(() => {
    setUser(authUser);
  }, [authUser]);

  useEffect(() => {
  }, [bingoRooms])

  useEffect(() => {
    getWaitingBingoRooms((bingoRooms: BingoRoom[]) => {
      dispatch(setBingoRooms(bingoRooms));
    });
  }, []);

  const createRoom = async () => {
    if(authUser.uid) {
        const newBingoId = await createBingoRoom(authUser.uid);
        navigator.navigate("prepare", { isCreator: true, bingoId: newBingoId });
    }
  };

  const joinRoom = async (bingoRoomItem: BingoRoom) => {
    if(authUser.uid) {
        const x = await joinBingoRoom(authUser.uid, bingoRoomItem.bingoId);
        navigator.navigate("prepare", { isCreator: false, bingoId: bingoRoomItem.bingoId })
    }
  }

  const renderPlayerItem = ({ item }: { item: BingoRoom }) => (
    <View style={styles.playerItem}>
      <Avatar
        rounded
        size="medium"
        source={{
          uri: item.photoURL,
        }}
      />
      <Text style={styles.nameTitle}>{item.displayName}</Text>
      <Text style={styles.nameTitle}>{item.subscriberNum}</Text>
      <Pressable
        style={styles.joinBtn}
        onPress={() => joinRoom (item)}
        >
        <Text style={styles.joinBtnText}>参加する</Text>
      </Pressable>
    </View>
  );

  const ProfileAvatar = (
    photoURL: string | undefined | null,
    displayName: string | null | undefined
  ): JSX.Element => {
    return (
      <View style={styles.profile}>
        <Avatar
          rounded
          size="large"
          source={{
            uri: photoURL,
          }}
        />
        <Text style={styles.textTitle}>{displayName}</Text>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      {ProfileAvatar(user?.photoURL, user?.displayName)}

      <View style={styles.btnList}>
        <Pressable
          style={styles.button}
          onPress={createRoom}
        >
          <Text style={styles.textTitle}>プレイルームを作成</Text>
        </Pressable>

        {/* <Pressable style={styles.button}>
                        <Text style={styles.textTitle}>ゲーム参加</Text>
                    </Pressable> */}
      </View>

      <Text style={styles.listTitle}>プレイルーム一覧</Text>

      <View style={styles.FlatListStyle}>
        <FlatList
          data={bingoRooms}
          renderItem={renderPlayerItem}
          keyExtractor={(item, index) => index.toString()}
        />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  profile: {
    flexDirection: "row",
    justifyContent: "center",
    width: "100%",
    textAlign: "center",
    alignItems: "center",
  },
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "black",
    paddingHorizontal: 15,
    paddingVertical: 50,
    width: "100%",
  },
  btnList: {
    flexDirection: "row",
  },
  button: {
    backgroundColor: "#ff0000",
    paddingVertical: 8,
    paddingHorizontal: 6,
    marginHorizontal: 4,
    marginVertical: 4,
    borderRadius: 6,
  },
  textTitle: {
    fontSize: 20,
    color: "white",
    fontFamily: "serif",
    fontWeight: "700",
    textAlign: "center",
  },
  playerItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 10,
    borderBottomWidth: 1,
    borderBottomColor: "#ccc",
    width: "100%",
  },
  nameTitle: {
    color: "#ffffff",
    fontSize: 18,
  },
  ItemStatus: {
    fontSize: 15,
    color: "#ffffff",
  },
  joinBtn: {
    backgroundColor: "#ff0000",
    // paddingVertical: 8,
    // paddingHorizontal: 6,
    padding: 4,
    marginHorizontal: 4,
    marginVertical: 4,
    borderRadius: 6,
  },
  joinBtnText: {
    fontSize: 16,
    color: "white",
    fontFamily: "serif",
    fontWeight: "700",
    textAlign: "center",
  },
  listTitle: {
    fontSize: 20,
    color: "white",
    fontFamily: "serif",
    fontWeight: "700",
    textAlign: "center",
    marginTop: 30,
  },
  FlatListStyle: {
    flex: 1,
    borderWidth: 1,
    borderColor: "gray",
    borderRadius: 8,
    margin: 5,
  },
});

export default GameRoomScreen;
