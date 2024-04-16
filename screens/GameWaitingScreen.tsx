import { ReactNode, useEffect, useState } from "react";
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
// import DraggableFlatList, {ScaleDecorator} from "react-native-draggable-flatlist";
import { Avatar, Divider,  Image } from "react-native-elements";
import { useRoute } from "@react-navigation/native";
import Icon from "react-native-vector-icons/FontAwesome";

import {
  exitGameRoom,
  getGameRoom,
  setPlayerGameSort,
  startGameBingo,
} from "../utils/firebase/FirebaseUtil";
import { GameWaitingRouteParams, Player, User } from "../utils/Types";
import { useDispatch, useSelector } from "react-redux";
import { RootState } from "../store";
import { setCurrentGameRoom, setGameRoomId } from "../store/reducers/bingo/gameRoomSlice";
import { customColors } from "../utils/Color";
import EffectBorder from "../components/EffectBorder";
import { setBingoInitial } from "../store/reducers/bingo/bingoSlice";

const { width: viewportWidth, height: viewportHeight } = Dimensions.get("window");

const screenHeight = Dimensions.get("window").height;
const cellSize = screenHeight / 5;
const defaultAvatar = require("../assets/images/default1.png");

const GameWaitingScreen = () => {
  const navigator = useNavigation();
  const dispatch = useDispatch();
  const route = useRoute();
  const { isHost, gameRoomId }: GameWaitingRouteParams =  route.params as GameWaitingRouteParams;

  const [gameRoomDisplayName, setGameRoomDisplayName] = useState("");

  const [subscribers, setSubscribers] = useState<Player[]>([]);
  const [sortedPlayers, setSortedPlayers] = useState<Player[]>([]);
  const [sort, setSort] = useState<string[]>([]);

  const [listLoading, setListLoading] = useState<boolean>(false);
  const [exitModalVisible, setExitModalVisible] = useState<boolean>(false);
  const [gameListModalVisible, setGameListModalVisible] = useState<boolean>(false);

  const [modalAlertText, setModalAlertText] = useState("");
  const [isExitModal, setIsExitModal] = useState(true);
  const [currentRemoveUserId, setCurrentRemoveUserId] = useState("");

  const authUser = useSelector((state: RootState) => state.auth.authUser);
  const currentGameRoom = useSelector(
    (state: RootState) => state.gameRoom.currentGameRoom
  );

  useEffect(() => {
    dispatch(setGameRoomId({ gameRoomId: gameRoomId, isHost: isHost }))
  }, []);

  useEffect(() => {
    if (currentGameRoom) {
      setSubscribers(currentGameRoom?.subscribersPlayers || []);
    } else {
      setSubscribers([]);
    }
  }, [currentGameRoom]);

  useEffect(() => {
    let sortedPlayersTemp: Player[] = [];
    if(sort) {
      sort.forEach(sortItem => {
        const p  = currentGameRoom?.subscribersPlayers.find(player => player.uid === sortItem);
        if(p) {
          sortedPlayersTemp.push(p);
        }
      });
  
      setSortedPlayers(sortedPlayersTemp || []);
    }
  }, [JSON.stringify(sort)]);

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
        dispatch(setBingoInitial({}));
        navigator.navigate("bingo");
      }

      setGameRoomDisplayName(gameRoom?.displayRoomName);
      setSort(gameRoom?.sort || []);

      const currentGameRoom = {
        gameRoomId: gameRoomId,
        subscribersPlayers: gameRoom?.subscribersPlayers || [],
        sort: gameRoom?.sort || []
      };

      dispatch(setCurrentGameRoom(currentGameRoom));
      setListLoading(false);
    });
  }, []);

  // useEffect(() => {
  //   const backAction = () => {
  //     setModalAlertText("プレイルームから脱退しますか？");
  //     setExitModalVisible(true);
  //     return true;
  //   };

  //   const backHandler = BackHandler.addEventListener(
  //     "hardwareBackPress",
  //     backAction
  //   );
  //   return () => backHandler.remove(); // Clean up the event listener
  // }, []);

  const startBingo = async () => {
    const turnPlayerId = sort[0];
    if(!turnPlayerId) return false;
    
    dispatch(setBingoInitial({}));
    await startGameBingo(gameRoomId, turnPlayerId);
    navigator.navigate("bingo");
  };

  const exitRoom = () => {
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

  const handleRandomSort = async () => {
    const subscribersPlayers = currentGameRoom ?.subscribersPlayers;
    const uids = subscribersPlayers ?.map((player) => {
        return player.uid;
    });

    const randomSort = () => Math.random() - 0.5;
    uids ?.sort(randomSort);

    const uids1 = uids ? uids : [];
    await setPlayerGameSort(gameRoomId, uids1);
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

      <View style={{ marginLeft: '20%' }}>
        <Text style={[styles.nameTitle, { opacity: 0.5, fontSize: 15} ]}>ユーザー名</Text>
        <Text style={styles.nameTitle}>{item.displayName}</Text>
      </View>

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


  return (
    <View style={[styles.container]}>
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
          <Text style={[styles.modalText, { position: 'absolute', top: -20, padding: 10, paddingHorizontal: 20, borderWidth: 2, borderColor: customColors.customLightBlue, borderRadius: 10, backgroundColor: customColors.modalContainerBackgroundColor }]}>
              ゲームを選択してください
            </Text>
            {/* <Text style={styles.modalText}>ゲームを選択してください。</Text> */}
            <View style={styles.modalGameListContainer}>
              
              <EffectBorder style={{width: '80%'}}>
                <TouchableOpacity
                  style={styles.modalGameListButton}
                  onPress={() => startBingo()}
                >
                  <Text style={styles.textTitle}>ビンゴ</Text>
                </TouchableOpacity>
              </EffectBorder>

              <EffectBorder style={{width: '80%', marginTop: 10}}>
                <TouchableOpacity style={styles.modalGameListButton}>
                  <Text style={styles.textTitle}>ゲーム1</Text>
                </TouchableOpacity>
              </EffectBorder>
                   
              <EffectBorder style={{width: '80%', marginTop: 10}}>
                <TouchableOpacity style={styles.modalGameListButton}>
                  <Text style={styles.textTitle}>ゲーム2</Text>
                </TouchableOpacity>
              </EffectBorder>
              
              <EffectBorder style={{width: '80%', marginTop: 10}}>
                <TouchableOpacity style={styles.modalGameListButton}>
                  <Text style={styles.textTitle}>ゲーム3</Text>
                </TouchableOpacity>
              </EffectBorder>
              
              <EffectBorder style={{width: '80%', marginTop: 10}}>
                <TouchableOpacity style={styles.modalGameListButton}>
                  <Text style={styles.textTitle}>ゲーム4</Text>
                </TouchableOpacity>
              </EffectBorder>
            </View>
          </View>
        </View>
      </Modal>

      <View style={{width: '97%', padding: 20, borderRadius: 20, backgroundColor: customColors.customDarkBlueBackground, alignItems: 'center', flexDirection: 'row', justifyContent: 'space-evenly'}}>
        <Text style={{fontSize: 20, color: 'grey'}}>
          タイトル:
        </Text>
        <Text style={{fontSize: 30, color: 'white'}}>
          { gameRoomDisplayName }
        </Text>
      </View>

      <View style={styles.FlatListStyle}>
        <View style={{ position: 'absolute', top: -20, borderRadius: 10, borderColor: customColors.blackGrey, borderWidth: 0, backgroundColor: customColors.black, padding: 5, paddingHorizontal: 15}}>
          <Text style={styles.listTitle}>ゲームメンバー</Text>
        </View>
        { isHost && 
          <TouchableOpacity 
            style={{position: 'absolute', top: -25, right: 10, width: 50, height: 50, borderColor: customColors.customLightBlue, borderWidth:1, borderRadius: 25, alignItems:'center', flexDirection: 'row', justifyContent: 'space-around' }}
            onPress={ () => handleRandomSort() }
          >
            <View style={{ padding:5 }}><Icon name="sort" size={30} color={"white"} /></View>
            {/* <Text style={[styles.listTitle, {fontSize: 20}]}>ソート</Text> */}
          </TouchableOpacity>
        }
        
        { listLoading ? <ActivityIndicator style={{position: 'absolute', top: '50%'}} size="large" color="#007AFF" /> : "" }

          <FlatList
            data={ (sortedPlayers && sortedPlayers.length == subscribers.length) ? sortedPlayers : subscribers }
            renderItem={renderPlayerItem}
            keyExtractor={(item, index) => index.toString()}
          />
      </View>

      <View style={styles.btnList}>
        <TouchableOpacity style={styles.dangeButton} onPress={() => exitRoomModal()}>
          <Text style={styles.textTitle}>退出する</Text>
        </TouchableOpacity>
        
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
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "black",
    paddingTop: 50,
    width: "100%",
  },

  profile: {
    flexDirection: "row",
    justifyContent: "center",
    width: "100%",
    textAlign: "center",
    alignItems: "center",
  },

  btnList: {
    width: '100%',
    flexDirection: "row",
    display: 'flex',
    justifyContent: 'space-around',
    paddingHorizontal: 10
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
    backgroundColor: customColors.customLightBlue,
    paddingVertical: 8,
    paddingHorizontal: 6,
    marginHorizontal: 4,
    marginVertical: 4,
    borderRadius: 30,
    width: '30%'
  },

  dangeButton: {
    backgroundColor: customColors.blackRed,
    paddingVertical: 8,
    paddingHorizontal: 6,
    marginHorizontal: 4,
    marginVertical: 4,
    borderRadius: 30,
    width: '30%'
  },
  
  textTitle: {
    fontSize: 20,
    color: "white",
    fontFamily: "serif",
    fontWeight: "700",
    textAlign: "center",
  },

  playerItem: {
    display: 'flex',
    justifyContent: 'space-between',
    flexDirection: "row",
    padding: 10,
    width: '100%',
    backgroundColor: customColors.customOpacityDarkBlack,
    borderWidth: 1,
    borderColor: customColors.customLightBlue,
    borderRadius: 10,
    marginVertical: 3,
  },

  nameTitle: {
    color: "#ffffff",
    fontSize: 20,
  },
  ItemStatus: {
    fontSize: 15,
    color: "#ffffff",
  },
  joinBtn: {
    backgroundColor: customColors.blackRed,
    paddingVertical: 6,
    paddingHorizontal: 6,
    marginHorizontal: 4,
    marginVertical: 4,
    borderRadius: 6,
    alignItems: 'center',
    alignSelf: 'center',
    right: 5,
    position: 'absolute'
  },

  joinBtnText: {
    fontSize: 16,
    color: "white",
    fontFamily: "serif",
    fontWeight: "700",
    textAlign: "center",
  },
  listTitle: {
    fontSize: 25,
    color: "white",
    fontFamily: "serif",
    fontWeight: "700",
    textAlign: "center",
  },

  FlatListStyle: {
    flex: 1,
    borderWidth: 1,
    borderTopRightRadius: 30,
    borderTopLeftRadius: 30,
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,

    backgroundColor: customColors.customDarkBlueBackground,
    width: '97%',
    alignItems: 'center',
    paddingTop: 40,
    paddingHorizontal: 6,
    marginTop: 30,
    marginBottom: 10,
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
    fontSize: 20,
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
    backgroundColor: customColors.customLightBlue,
    paddingVertical: 8,
    paddingHorizontal: 6,
    borderRadius: 30,
  },
  modalCloseButton: {
    position: "absolute",
    color: "green",
  },

  outBorder: {
    borderColor: 'red',
    borderWidth: 2,
    
  }
});

export default GameWaitingScreen;

