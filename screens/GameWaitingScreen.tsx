import { useEffect, useState } from "react";
import { useNavigation } from "@react-navigation/native";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Dimensions,
  Button,
  FlatList,
  BackHandler,
  ActivityIndicator,
  Modal,
  TextInput,
} from "react-native";
import { Avatar, Icon, Image } from "react-native-elements";
import { useRoute } from "@react-navigation/native";

import {
  exitGameRoom,
  getGameRoom,
  startGameRoom,
} from "../utils/firebase/FirebaseUtil";
import { GameWaitingRouteParams, Player, User } from "../utils/Types";
import { useDispatch, useSelector } from "react-redux";
import { RootState } from "../store";
import { setCurrentGameRoom } from "../store/reducers/bingo/gameRoomSlice";
import { remove } from "lodash";
import { setBingoInitial } from "../store/reducers/bingo/bingoSlice";
import { customColors } from "../utils/Color";

const screenHeight = Dimensions.get("window").height;
const cellSize = screenHeight / 5;
const defaultAvatar = require("../assets/images/default1.png");

const GameWaitingScreen = () => {
  const navigator = useNavigation();
  const [subscribers, setSubscribers] = useState<Player[]>([]);

  const route = useRoute();
  const { isHost, gameRoomId }: GameWaitingRouteParams =
    route.params as GameWaitingRouteParams;
  const authUser = useSelector((state: RootState) => state.auth.authUser);
  const [listLoading, setListLoading] = useState<boolean>(false);
  const [exitModalVisible, setExitModalVisible] = useState<boolean>(false);
  const [gameListModalVisible, setGameListModalVisible] =
    useState<boolean>(false);

  const [modalAlertText, setModalAlertText] = useState("");
  const [isExitModal, setIsExitModal] = useState(true);
  const [currentRemoveUserId, setCurrentRemoveUserId] = useState("");
  const currentGameRoom = useSelector(
    (state: RootState) => state.gameRoom.currentGameRoom
  );
  const dispatch = useDispatch();

  useEffect(() => {
    dispatch(setBingoInitial({ gameRoomId: gameRoomId, isHost: isHost }));
  }, []);

  useEffect(() => {
    if (currentGameRoom) {
      setSubscribers(currentGameRoom?.subscribersPlayers);
    } else {
      setSubscribers([]);
    }
  }, [currentGameRoom]);

  //get bingo room from firebase
  useEffect(() => {
    setListLoading(true);

    getGameRoom(gameRoomId, (gameRoom: any) => {
      if (!gameRoom) {
        navigator.navigate("gameRoomList");
        dispatch(setCurrentGameRoom(null));
      }
      if (gameRoom.subscribersPlayers) {
        if (
          !gameRoom.subscribersPlayers.some(
            (player: any) => player.uid === authUser.uid
          )
        ) {
          navigator.navigate("gameRoomList");
        }
      }

      if (gameRoom?.gameStarted == true) {
        navigator.navigate("bingo");
      }

      const currentGameRoom = {
        gameRoomId: gameRoomId,
        subscribersPlayers: gameRoom?.subscribersPlayers,
      };
      dispatch(setCurrentGameRoom(currentGameRoom));
      setListLoading(false);
    });
  }, []);

  useEffect(() => {
    const backAction = () => {
      setModalAlertText("プレイルームから脱退しますか？");
      setExitModalVisible(true);
      return true;
    };

    const backHandler = BackHandler.addEventListener(
      "hardwareBackPress",
      backAction
    );
    return () => backHandler.remove(); // Clean up the event listener
  }, []);

  const startBingo = async () => {
    await startGameRoom(gameRoomId);
    navigator.navigate("bingo");
  };

  const exitRoom = () => {
    console.log("xxxx");
    if (authUser.uid) {
      navigator.navigate("gameRoomList");
      setExitModalVisible(false);
      exitGameRoom(authUser?.uid, gameRoomId, isHost);
    }
  };

  const exitRoomModal = () => {
    setExitModalVisible(true);
    setIsExitModal(true);

    setModalAlertText("プレイルームを削除しますか？");
  };

  const removeUser = (uid: string) => {
    setExitModalVisible(false);
    if (uid) {
      exitGameRoom(uid, gameRoomId, false);
    }
  };

  const removeUserModal = (uid: string) => {
    setExitModalVisible(true);
    setIsExitModal(false);
    setCurrentRemoveUserId(uid);
    setModalAlertText("このユーザーをエクスポートしますか？");
  };

  const renderPlayerItem = ({ item }: { item: Player }) => (
    <TouchableOpacity style={styles.playerItem} activeOpacity={0.5}>
      <Avatar
        rounded
        size="medium"
        source={
          item.photoURL
            ? {
                uri: item.photoURL,
              }
            : defaultAvatar
        }
      />
      <Text style={styles.nameTitle}>{item.displayName}</Text>
      {/* <Text style={styles.nameTitle}>{item.age}</Text> */}

      {isHost && item.uid != authUser.uid && (
        <TouchableOpacity
          style={styles.joinBtn}
          onPress={() => removeUserModal(item.uid)}
        >
          <Text style={styles.joinBtnText}>　退出　</Text>
        </TouchableOpacity>
      )}
    </TouchableOpacity>
  );

  const ProfileAvatar = (
    imageUrl: string,
    displayName: string | null | undefined
  ): JSX.Element => {
    return (
      <View style={styles.profile}>
        <Avatar
          rounded
          size="large"
          source={
            imageUrl
              ? {
                  uri: imageUrl,
                }
              : defaultAvatar
          }
        />
        {/* <Text style={styles.textTitle}>{displayName}</Text> */}
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <Modal
        animationType="fade"
        transparent={true}
        visible={exitModalVisible}
        onRequestClose={() => {
          setExitModalVisible(false);
        }}
      >
        <View
          style={{
            flex: 1,
            justifyContent: "center",
            alignItems: "center",
            backgroundColor: customColors.modalBackgroundColor,
          }}
        >
          <View style={styles.modalBody}>
            <Text style={styles.modalText}>{modalAlertText}</Text>

            <View style={styles.roomModalBtns}>
              <TouchableOpacity
                style={styles.modalCancelBtn}
                onPress={() => setExitModalVisible(false)}
              >
                <Text style={styles.modalOkText}> キャンセル </Text>
              </TouchableOpacity>
              {isExitModal ? (
                <TouchableOpacity style={styles.modalOkBtn} onPress={exitRoom}>
                  <Text style={styles.modalOkText}> は い </Text>
                </TouchableOpacity>
              ) : (
                <TouchableOpacity
                  style={styles.modalOkBtn}
                  onPress={() => removeUser(currentRemoveUserId)}
                >
                  <Text style={styles.modalOkText}> は い </Text>
                </TouchableOpacity>
              )}
            </View>
          </View>
        </View>
      </Modal>

      <Modal
        animationType="fade"
        transparent={true}
        visible={gameListModalVisible}
        onRequestClose={() => {
          setGameListModalVisible(false);
        }}
      >
        <View
          style={{
            flex: 1,
            justifyContent: "center",
            alignItems: "center",
            backgroundColor: customColors.modalBackgroundColor,
          }}
        >
          <View style={styles.modalBody}>
            {/* <TouchableOpacity style={styles.modalCloseButton}>
                                <Icon
                                    name="fontawesome|facebook-square"
                                    
                                >
                                </Icon>
                            </TouchableOpacity> */}
            <Text style={styles.modalText}>ゲームを選択してください。</Text>

            <View style={styles.modalGameListContainer}>
              <TouchableOpacity
                style={styles.modalGameListButton}
                onPress={() => startBingo()}
              >
                <Text style={styles.textTitle}>ビンゴ</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.modalGameListButton}>
                <Text style={styles.textTitle}>ゲーム1</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.modalGameListButton}>
                <Text style={styles.textTitle}>ゲーム2</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.modalGameListButton}>
                <Text style={styles.textTitle}>ゲーム3</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.modalGameListButton}>
                <Text style={styles.textTitle}>ゲーム4</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
      {ProfileAvatar(authUser?.photoURL, authUser?.displayName)}

      <View style={styles.btnList}>
        {isHost && (
          <TouchableOpacity
            style={styles.successButton}
            onPress={() => {
              setGameListModalVisible(true);
            }}
          >
            <Text style={styles.textTitle}>ゲーム開始</Text>
          </TouchableOpacity>
        )}

        <TouchableOpacity style={styles.button} onPress={() => exitRoomModal()}>
          <Text style={styles.textTitle}>退出する</Text>
        </TouchableOpacity>
      </View>

      <Text style={styles.listTitle}>ゲームメンバー</Text>

      {listLoading ? <ActivityIndicator size="large" color="#007AFF" /> : ""}

      <View style={styles.FlatListStyle}>
        <FlatList
          data={subscribers}
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
    backgroundColor: customColors.blackRed,
    paddingVertical: 8,
    paddingHorizontal: 6,
    marginHorizontal: 4,
    marginVertical: 4,
    borderRadius: 6,
  },
  successButton: {
    backgroundColor: customColors.blackGreen,
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
    backgroundColor: customColors.blackRed,
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
  modalBody: {
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: customColors.modalContainerBackgroundColor,
    paddingHorizontal: 15,
    paddingVertical: 50,
    borderWidth: 1,
    borderColor: "grey",
    borderRadius: 20,
    width: "80%",
  },
  modalOkBtn: {
    backgroundColor: customColors.blackRed,
    paddingVertical: 8,
    paddingHorizontal: 6,
    padding: 4,
    marginHorizontal: 4,
    marginVertical: 4,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: "white",
  },
  modalCancelBtn: {
    backgroundColor: "grey",
    paddingVertical: 8,
    paddingHorizontal: 6,
    padding: 4,
    marginHorizontal: 4,
    marginVertical: 4,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: "white",
  },
  modalOkText: {
    fontSize: 16,
    color: "white",
    fontFamily: "serif",
    fontWeight: "700",
    textAlign: "center",
  },

  completedText: {
    fontSize: 30,
    color: "white",
    width: "90%",
    fontFamily: "serif",
    fontWeight: "700",
    textAlign: "center",
  },
  roomModalBtns: {
    flexDirection: "row",
  },
  modalText: {
    fontSize: 16,
    color: "white",
    fontFamily: "serif",
    fontWeight: "700",
    textAlign: "center",
    marginBottom: 20,
  },
  modalGameListContainer: {
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 15,
    borderColor: "grey",
    borderRadius: 20,
    width: "90%",
  },
  modalGameListButton: {
    backgroundColor: customColors.blackGreen,
    paddingVertical: 8,
    paddingHorizontal: 6,
    marginHorizontal: 4,
    marginVertical: 8,
    borderRadius: 10,
    width: "80%",
  },
  modalCloseButton: {
    position: "absolute",
    color: "green",
  },
});

export default GameWaitingScreen;
