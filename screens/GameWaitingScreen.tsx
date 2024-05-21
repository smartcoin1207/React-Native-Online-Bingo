import { ReactNode, useCallback, useEffect, useState } from "react";
import { useFocusEffect, useNavigation } from "@react-navigation/native";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Dimensions,
  FlatList,
  BackHandler,
  ActivityIndicator,
  Modal,
} from "react-native";
import { Avatar, Divider, Image } from "react-native-elements";
import { useRoute } from "@react-navigation/native";
import Icon from "react-native-vector-icons/FontAwesome";
import {
  exitGameRoom,
  getGameRoom,
  setGameRoomOpen,
  setGameTypeF,
  setPlayerGameSort,
  startGameBingo,
  startGameHighLow,
  startGamePenalty,
  startGameTictactoe,
} from "../utils/firebase/FirebaseUtil";
import {
  GameType,
  GameWaitingRouteParams,
  Player,
  UnsubscribeOnsnapCallbackFunction,
  User,
} from "../utils/Types";
import { useDispatch, useSelector } from "react-redux";
import { RootState } from "../store";
import {
  setCurrentGameRoom,
  setGameRoomIdHost,
  setGameRoomInitial,
  setMainGameStart,
  setPenaltyGameType,
} from "../store/reducers/bingo/gameRoomSlice";
import { customColors } from "../utils/Color";
import EffectBorder from "../components/EffectBorder";
import { setBingoInitial } from "../store/reducers/bingo/bingoSlice";
import React from "react";
// import Roulette from "react-native-casino-roulette";

const screenHeight = Dimensions.get("window").height;
const defaultAvatar = require("../assets/images/default1.png");

const numbers = [
  0, 32, 15, 19, 4, 21, 2, 25, 17, 34, 6, 27, 13, 36, 11, 30, 8, 23, 10, 5, 24,
  16, 33, 1, 20, 14, 31, 9, 22, 18, 29, 7, 28, 12, 35, 3, 26,
];
const options = numbers.map((o) => ({ index: o }));

const GameWaitingScreen = () => {
  const navigator = useNavigation();
  const dispatch = useDispatch();
  const route = useRoute();
  const { isHostParam, gameRoomIdParam }: GameWaitingRouteParams =
    route.params as GameWaitingRouteParams;

  const [gameRoomDisplayName, setGameRoomDisplayName] = useState("");

  const [subscribers, setSubscribers] = useState<Player[]>([]);
  const [sortedPlayers, setSortedPlayers] = useState<Player[]>([]);
  const [sort, setSort] = useState<string[]>([]);

  const [listLoading, setListLoading] = useState<boolean>(false);
  const [exitModalVisible, setExitModalVisible] = useState<boolean>(false);
  const [gameListModalVisible, setGameListModalVisible] =
    useState<boolean>(false);

  const [sortModalVisible, setSortModalVisible] = useState<boolean>(false);
  const [pressedGameType, setPressedGameType] = useState<GameType>(
    GameType.Bingo
  );

  const [modalAlertText, setModalAlertText] = useState("");
  const [isExitModal, setIsExitModal] = useState(true);
  const [currentRemoveUserId, setCurrentRemoveUserId] = useState("");

  const authUser = useSelector((state: RootState) => state.auth.authUser);
  const currentGameRoom = useSelector(
    (state: RootState) => state.gameRoom.currentGameRoom
  );
  const penaltyGameType = useSelector((state: RootState) => state.gameRoom.penaltyGameType);
  const mainGameStart = useSelector((state: RootState) => state.gameRoom.mainGameStart);

  const [gameTypeR, setGameTypeR] = useState<GameType>(GameType.Room);
  const [gameRoomOpened, setGameRoomOpened] = useState<boolean>(true);
  const gameRoomId = useSelector(
    (state: RootState) => state.gameRoom.gameRoomId
  );
  const isHost = useSelector((state: RootState) => state.gameRoom.isHost);

  const [selectedOption, setSelectedOption] = useState(null);
  const handleSpin = (option: React.SetStateAction<null>) => {
    console.log(option);
    setSelectedOption(option);
  };

  useEffect(() => {
    console.log(mainGameStart, "=======")
    dispatch(setMainGameStart(false));
    dispatch(setPenaltyGameType(GameType.Bingo))
  }, [])

  useEffect(() => {
    dispatch(
      setGameRoomIdHost({ gameRoomId: gameRoomIdParam, isHost: isHostParam })
    );
  }, []);

  useFocusEffect(
    useCallback(() => {
      setGameListModalVisible(false);
      setSortModalVisible(false);
    }, [])
  );

  useEffect(() => {
    console.log("Gamelistmodalvisible", gameListModalVisible);
  }, [gameListModalVisible]);

  useEffect(() => {
    if (currentGameRoom) {
      setSubscribers(currentGameRoom?.subscribersPlayers || []);
    } else {
      setSubscribers([]);
    }
  }, [currentGameRoom]);

  useEffect(() => {
    let sortedPlayersTemp: Player[] = [];
    if (sort) {
      sort.forEach((sortItem) => {
        const p = currentGameRoom?.subscribersPlayers.find(
          (player) => player.uid === sortItem
        );
        if (p) {
          sortedPlayersTemp.push(p);
        }
      });

      setSortedPlayers(sortedPlayersTemp || []);
    }
  }, [JSON.stringify(sort)]);

  //get bingo room from firebase
  useFocusEffect(
    useCallback(() => {
      setListLoading(true);

      if (gameRoomId) {
        const unsubscribe: UnsubscribeOnsnapCallbackFunction = getGameRoom(
          gameRoomId,
          (gameRoom: any) => {
            if (!gameRoomId) {
              return false;
            }

            if (!gameRoom) {
              navigator.navigate("gameRoomList");
              dispatch(setGameRoomInitial(null));
              return false;
            }

            if (gameRoom.subscribersPlayers) {
              if (
                !gameRoom.subscribersPlayers.some(
                  (player: any) => player.uid === authUser.uid
                )
              ) {
                dispatch(setGameRoomInitial(null));
                navigator.navigate("gameRoomList");
                return false;
              }
            }

            if (gameRoom?.gameType == GameType.Penalty && !isHost) {
              navigator.navigate("penalty");
            }

            setGameRoomOpened(gameRoom?.gameRoomOpened || false);
            setGameTypeR(gameRoom?.gameType || GameType.Exit);
            setGameRoomDisplayName(gameRoom?.displayRoomName || "");
            setSort(gameRoom?.sort || []);

            const currentGameRoom = {
              gameRoomId: gameRoomId,
              subscribersPlayers: gameRoom?.subscribersPlayers || [],
              sort: gameRoom?.sort || [],
            };
            dispatch(setCurrentGameRoom(currentGameRoom));

            setListLoading(false);
          }
        );

        return () => unsubscribe();
      }
    }, [gameRoomId])
  );

  useEffect(() => {
    if(penaltyGameType == GameType.Bingo) {
      startBingo_();
    } else if(penaltyGameType == GameType.Tictactoe) {
      startTictactoe_();
    } else if(penaltyGameType == GameType.HighLow) {
      startHighLow_();
    }
  }, [penaltyGameType, mainGameStart])

  useEffect(() => {
    console.log(" Game Room was changed", gameRoomId);
  }, [gameRoomId]);

  useFocusEffect(
    useCallback(() => {
      const onBackPress = () => {
        if (sortModalVisible) {
          setSortModalVisible(false);
          return true;
        } else {
          setModalAlertText("プレイルームから脱退しますか？");
          setExitModalVisible(true);
          return true; // Indicate that the back press is handled
        }
      };

      BackHandler.addEventListener("hardwareBackPress", onBackPress);

      return () => {
        BackHandler.removeEventListener("hardwareBackPress", onBackPress);
      };
    }, [navigator, sortModalVisible])
  );

  const handleGameStart = () => {
    const turnPlayerId = sort[0];
    if (!turnPlayerId) return false;

    setGameRoomOpen(gameRoomId, false);
    startGamePenalty(gameRoomId);
    setGameTypeF(gameRoomId, GameType.Penalty);

    if (pressedGameType == GameType.Bingo) {
      try {
        dispatch(setPenaltyGameType(GameType.Bingo));
        navigator.navigate("penaltyAB");
      } catch (error) {
        console.log(error);
      }
    } else if (pressedGameType == GameType.Tictactoe) {
      try {
        dispatch(setPenaltyGameType(GameType.Tictactoe))
        navigator.navigate("penaltyAB");
      } catch (error) {}
    } else if (pressedGameType == GameType.HighLow) {
      try {        
        dispatch(setPenaltyGameType(GameType.HighLow));
        navigator.navigate("penaltyAB");
      } catch (error) {}
    }
  };

  const startBingo = async () => {
    const turnPlayerId = sort[0];
    if (!turnPlayerId) return false;

    setSortModalVisible(true);

    setGameTypeF(gameRoomId, GameType.Penalty);
    startGamePenalty(gameRoomId);

    try {
      setGameRoomOpen(gameRoomId, false);
      dispatch(setPenaltyGameType(GameType.Bingo));
      navigator.navigate("penaltyAB");
    } catch (error) {
      console.log(error);
    }
  };

  const startBingo_ = async () => {
    const turnPlayerId = sort[0];
    if (!turnPlayerId) return false;

    dispatch(setBingoInitial(null));

    await startGameBingo(gameRoomId, turnPlayerId);
  };

  const startTictactoe = () => {
    try {
      setGameTypeF(gameRoomId, GameType.Penalty);
      startGamePenalty(gameRoomId);
      setGameRoomOpen(gameRoomId, false);
      dispatch(setPenaltyGameType(GameType.Tictactoe));
      navigator.navigate("penaltyAB");
    } catch (error) {}
  };

  const startTictactoe_ = async () => {
    await startGameTictactoe(gameRoomId);
  };

  const startHighLow = () => {
    try {
      setGameTypeF(gameRoomId, GameType.Penalty);
      startGamePenalty(gameRoomId);
      setGameRoomOpen(gameRoomId, false);
      dispatch(setPenaltyGameType(GameType.HighLow));
      navigator.navigate("penaltyAB");
    } catch (error) {}
  };
  const startHighLow_ = async () => {
    await startGameHighLow(gameRoomId);
  };

  const setGameRoomOpen_ = async () => {
    setGameRoomOpen(gameRoomId, !gameRoomOpened);
  };

  const exitRoom = () => {
    if (authUser.uid) {
      dispatch(setGameRoomInitial(null));
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
    const subscribersPlayers = currentGameRoom?.subscribersPlayers;
    const uids =
      subscribersPlayers?.map((player) => {
        return player.uid;
      }) || [];

    if (uids.length > 1) {
      while (JSON.stringify(sort) == JSON.stringify(uids)) {
        const randomSort = () => Math.random() - 0.5;
        uids?.sort(randomSort);
      }
    }

    await setPlayerGameSort(gameRoomId, uids);
    // handleGameStart();
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

      <View style={{ marginLeft: "20%" }}>
        <Text style={[styles.nameTitle, { opacity: 0.5, fontSize: 15 }]}>
          ユーザー名
        </Text>
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

  const renderSortPlayerItem = ({ item }: { item: Player }) => (
    <TouchableOpacity
      style={[styles.playerItem, { padding: 8 }]}
      activeOpacity={0.5}
    >
      <Avatar
        rounded
        size="small"
        source={
          item.photoURL
            ? {
                uri: item.photoURL,
              }
            : defaultAvatar
        }
      />

      <View style={{ alignItems: "center" }}>
        <Text style={styles.nameTitle}>{item.displayName}</Text>
      </View>
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
            <Text
              style={[
                styles.modalText,
                {
                  position: "absolute",
                  top: -30,
                  justifyContent: "center",
                  padding: 10,
                  paddingHorizontal: 20,
                  borderWidth: 2,
                  borderColor: customColors.blackGrey,
                  borderRadius: 10,
                  backgroundColor: customColors.modalContainerBackgroundColor,
                },
              ]}
            >
              ゲームを選択してください
            </Text>
            {/* <Text style={styles.modalText}>ゲームを選択してください。</Text> */}
            <View style={styles.modalGameListContainer}>
              <EffectBorder style={{ width: "80%" }}>
                <TouchableOpacity
                  style={styles.modalGameListButton}
                  onPress={() => {
                    setPressedGameType(GameType.Bingo),
                      setGameListModalVisible(false),
                      setSortModalVisible(true);
                  }}
                >
                  <Text style={styles.textTitle}>ビンゴ</Text>
                </TouchableOpacity>
              </EffectBorder>

              <EffectBorder style={{ width: "80%", marginTop: 10 }}>
                <TouchableOpacity style={styles.modalGameListButton}>
                  <Text style={styles.textTitle}>神経衰弱</Text>
                </TouchableOpacity>
              </EffectBorder>

              <EffectBorder style={{ width: "80%", marginTop: 10 }}>
                <TouchableOpacity style={styles.modalGameListButton}>
                  <Text style={styles.textTitle}>足し算引き算</Text>
                </TouchableOpacity>
              </EffectBorder>

              <EffectBorder style={{ width: "80%", marginTop: 10 }}>
                <TouchableOpacity
                  style={styles.modalGameListButton}
                  onPress={() => {
                    setPressedGameType(GameType.HighLow),
                      setSortModalVisible(true);
                  }}
                >
                  <Text style={styles.textTitle}>High & Low</Text>
                </TouchableOpacity>
              </EffectBorder>

              <EffectBorder style={{ width: "80%", marginTop: 10 }}>
                <TouchableOpacity
                  style={styles.modalGameListButton}
                  onPress={() => {
                    setPressedGameType(GameType.Tictactoe),
                      setSortModalVisible(true);
                  }}
                >
                  <Text style={styles.textTitle}>〇☓ゲーム</Text>
                </TouchableOpacity>
              </EffectBorder>
            </View>
          </View>
        </View>
      </Modal>

      {sortModalVisible && (
        <View
          // animationType="fade"
          // transparent={true}
          // visible={sortModalVisible}
          // onRequestClose={() => {setSortModalVisible(false)}}
          style={{
            position: "absolute",
            flex: 1,
            width: "100%",
            height: "110%",
            zIndex: 1000,
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
            <View
              style={[
                styles.modalBody,
                {
                  flex: 1,
                  width: "100%",
                  borderWidth: 0,
                  borderRadius: 0,
                  paddingTop: 0,
                  paddingBottom: 0,
                },
              ]}
            >
              <View
                style={[
                  styles.modalGameListContainer,
                  {
                    width: "100%",
                    flex: 1,
                    paddingHorizontal: 0,
                    alignItems: "center",
                    borderWidth: 0,
                    borderColor: "white",
                  },
                ]}
              >
                {/* <View
                style={[
                  styles.topHeader,
                  {
                    justifyContent: "center",
                    // alignSelf: 'flex-start',
                    width: '100%',
                    alignItems: 'center',

                  },
                ]}
              >
                <TouchableOpacity
                  style={{
                    width: 40,
                    height: 40,
                    padding: 10,
                    borderWidth: 1,
                    borderColor: customColors.blackGrey,
                    borderRadius: 25,
                    alignItems: "center",
                    justifyContent: "center",
                    position: 'absolute',
                    left:0,
                    display: isHost? 'flex' : 'none'
                  }}
                  onPress={() => (setSortModalVisible(false))}
                >
                  <Icon
                    name="arrow-left"
                    size={16}
                    color={"white"}
                    style={{ opacity: 0.8 }}
                  />
                </TouchableOpacity>
                <Text style={[styles.title, {textAlign: 'center', marginLeft: 0}]}>順序決定</Text>
              </View> */}
                {isHost && (
                  <View
                    style={{
                      borderWidth: 0,
                      borderColor: customColors.customLightBlue,
                      borderRadius: 20,
                      width: "100%",
                      padding: 10,
                      alignItems: "center",
                      zIndex: 100,
                      paddingTop: 30
                    }}
                  >
                    <TouchableOpacity
                      style={[
                        styles.successButton,
                        {
                          backgroundColor: "#133a4edb",
                          borderWidth: 1,
                          borderColor: "grey",
                          flexDirection: "row",
                          paddingHorizontal: 10,
                        },
                      ]}
                      onPress={() => {
                        handleRandomSort(); 
                        setTimeout(() => {
                        handleGameStart();
                      }, 3000);}}
                    >
                      <Text
                        style={{
                          color: "white",
                          fontSize: 20,
                          textAlign: "center",
                          letterSpacing: 5,
                        }}
                      >
                        順番を決める
                      </Text>
                    </TouchableOpacity>

                    {/* <View style={{ zIndex: 100 }}>
                      <Roulette
                        enableUserRotate={true}
                        background={require("../assets/images/wheel.png")}
                        marker={require("../assets/images/marker.png")}
                        options={options}
                        markerWidth={60}
                        radius={250}
                        distance={100}
                        rotateEachElement={(index: number) => index * 30}
                        centerTop={10}
                        centerWidth={20}
                        onRotate={(rotate: any) => {
                          console.log("onRotate", rotate?.index);
                        }}
                        onRotateChange={(rotate: any) => {
                          console.log("onRotateChange", rotate);
                          handleRandomSort();
                        }}
                        onSpin={handleSpin}
                        renderOption={(
                          option:
                            | string
                            | number
                            | boolean
                            | React.ReactElement<
                                any,
                                string | React.JSXElementConstructor<any>
                              >
                            | Iterable<React.ReactNode>
                            | React.ReactPortal
                            | null
                            | undefined,
                          index: React.Key | null | undefined
                        ) => (
                          <View key={index} style={styles.numberContainer}>
                            <Text style={styles.numberText}>{option}</Text>
                          </View>
                        )}
                      />
                    </View> */}
                  </View>
                )}
                {/* <View
                  style={[
                    styles.FlatListStyle,
                    {
                      borderWidth: 1,
                      borderColor: "grey",
                      paddingTop: 20,
                      borderRadius: 20,
                      marginTop: 20,
                    },
                  ]}
                >
                  <FlatList
                    data={
                      sortedPlayers &&
                      sortedPlayers.length == subscribers.length
                        ? sortedPlayers
                        : subscribers
                    }
                    renderItem={renderSortPlayerItem}
                    keyExtractor={(item, index) => index.toString()}
                  />
                </View>
                {isHost && (
                  <View
                    style={{
                      borderWidth: 0,
                      borderColor: customColors.customLightBlue,
                      borderRadius: 20,
                      width: "100%",
                      padding: 10,
                      alignItems: "center",
                    }}
                  >
                    <TouchableOpacity
                      style={[
                        styles.successButton,
                        { paddingHorizontal: 30, paddingVertical: 15 },
                      ]}
                      onPress={() => handleGameStart()}
                    >
                      <Text
                        style={{
                          color: "white",
                          fontSize: 16,
                          textAlign: "center",
                        }}
                      >
                        ゲーム開始
                      </Text>
                    </TouchableOpacity>
                  </View>
                )} */}
              </View>
            </View>
          </View>
        </View>
      )}

      <View
        style={{
          width: "97%",
          padding: 10,
          borderRadius: 20,
          backgroundColor: customColors.customDarkBlueBackground,
          alignItems: "center",
          flexDirection: "row",
          justifyContent: "space-evenly",
        }}
      >
        <View
          style={{
            backgroundColor: "black",
            width: "60%",
            padding: 15,
            borderWidth: 1,
            borderRadius: 20,
            borderColor: customColors.customLightBlue1,
            alignItems: "center",
          }}
        >
          {/* closed icon */}
          {/* <Icon
            name={gameRoomOpened ? "unlock" : "lock"}
            size={20}
            color={"white"}
            style={{ position: "absolute", top: 10, left: 10 }}
          /> */}

          <Text style={{ fontSize: 20, color: "grey" }}>ルーム名：</Text>
          <Text style={{ fontSize: 30, color: "white" }}>
            {gameRoomDisplayName}
          </Text>
        </View>
        {/* {isHost && (
          <TouchableOpacity
            style={{
              padding: 10,
              borderWidth: 1,
              borderColor: customColors.customLightBlue1,
              borderRadius: 20,
              flexDirection: "row",
            }}
            onPress={setGameRoomOpen_}
          >
            <Text style={{ fontSize: 15, color: "white", letterSpacing: 10 }}>
              {gameRoomOpened ? "締切" : "募集中"}
            </Text>
          </TouchableOpacity>
        )} */}
      </View>

      <View style={styles.FlatListStyle}>
        <View
          style={{
            position: "absolute",
            top: -20,
            borderRadius: 10,
            borderColor: customColors.blackGrey,
            borderWidth: 0,
            backgroundColor: customColors.black,
            padding: 5,
            paddingHorizontal: 15,
          }}
        >
          <Text style={styles.listTitle}>ゲームメンバー</Text>
        </View>
        {isHost && false && (
          <TouchableOpacity
            style={{
              position: "absolute",
              top: -25,
              right: 10,
              width: 50,
              height: 50,
              borderColor: customColors.customLightBlue,
              borderWidth: 1,
              borderRadius: 25,
              alignItems: "center",
              flexDirection: "row",
              justifyContent: "space-around",
            }}
            onPress={() => handleRandomSort()}
          >
            <View style={{ padding: 5 }}>
              <Icon name="sort" size={30} color={"white"} />
            </View>
            {/* <Text style={[styles.listTitle, {fontSize: 20}]}>ソート</Text> */}
          </TouchableOpacity>
        )}

        {listLoading ? (
          <ActivityIndicator
            style={{ position: "absolute", top: "50%" }}
            size="large"
            color="#007AFF"
          />
        ) : (
          ""
        )}

        <FlatList
          data={
            sortedPlayers && sortedPlayers.length == subscribers.length
              ? sortedPlayers
              : subscribers
          }
          renderItem={renderPlayerItem}
          keyExtractor={(item, index) => index.toString()}
        />
      </View>
      <View style={[styles.btnList]}>
        <TouchableOpacity
          style={styles.dangeButton}
          onPress={() => exitRoomModal()}
        >
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
    paddingTop: 25,
    width: "100%",
    paddingBottom: 5,
  },

  profile: {
    flexDirection: "row",
    justifyContent: "center",
    width: "100%",
    textAlign: "center",
    alignItems: "center",
  },

  btnList: {
    width: "100%",
    flexDirection: "row",
    display: "flex",
    justifyContent: "space-around",
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
    borderRadius: 30,
    justifyContent: "center",
    minWidth: "30%",
    maxWidth: "50%",
  },

  dangeButton: {
    backgroundColor: customColors.blackRed,
    paddingVertical: 8,
    paddingHorizontal: 6,
    marginHorizontal: 4,
    borderRadius: 30,
    justifyContent: "center",
    minWidth: "30%",
    maxWidth: "50%",
  },

  textTitle: {
    fontSize: 20,
    color: "white",
    fontFamily: "serif",
    fontWeight: "700",
    textAlign: "center",
  },

  playerItem: {
    display: "flex",
    justifyContent: "space-between",
    flexDirection: "row",
    padding: 10,
    width: "100%",
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
    alignItems: "center",
    alignSelf: "center",
    // right: 5,
    // position: 'absolute'
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
    borderRadius: 30,
    backgroundColor: customColors.customDarkBlueBackground,
    width: "97%",
    alignItems: "center",
    paddingTop: 40,
    paddingHorizontal: 6,
    marginTop: 30,
    marginBottom: 5,
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
    borderColor: "red",
    borderWidth: 2,
  },

  topHeader: {
    flexDirection: "row",
    justifyContent: "flex-start",
    alignItems: "center",
    marginBottom: 8,
    marginTop: 10,
    marginLeft: 10,
  },
  title: {
    color: customColors.white,
    fontSize: 30,
    fontWeight: "700",
    marginLeft: 20,
  },
  numberContainer: {
    width: 50,
    height: 50,
    backgroundColor: "blue",
    borderRadius: 25,
    justifyContent: "center",
    alignItems: "center",
  },
  numberText: {
    fontSize: 20,
    fontWeight: "bold",
    color: "white",
  },
});

export default GameWaitingScreen;
