import { ReactNode, useCallback, useEffect, useLayoutEffect, useRef, useState } from "react";
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
  TouchableWithoutFeedback,
} from "react-native";
import { Avatar, Divider, Image, Tooltip } from "react-native-elements";
import { useRoute } from "@react-navigation/native";
import Icon from "react-native-vector-icons/Ionicons";
import {
  exitGameRoom,
  getGameRoom,
  setGameRoomOpen,
  setGameTypeF,
  setPlayerGameSort,
  startGameBingo,
  startGameHighLow,
  startGamePenalty,
  startGamePlusMinus,
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
import * as Progress from 'react-native-progress';
import ConfirmModal from "../components/ConfirmModal";

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
  const loadingBarDuration = 3;

  const [subscribers, setSubscribers] = useState<Player[]>([]);
  const [sortedPlayers, setSortedPlayers] = useState<Player[]>([]);
  const [sort, setSort] = useState<string[]>([]);
  const [sorted, setSorted] = useState<boolean>(false);
  const sortRef = useRef(sort);
  const [hostSortingLoading, setHostSortingLoading] = useState<boolean>(false);
  const [progressRate, setProgressRate] = useState(0);

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

            //sorted
            const sorted: boolean = gameRoom?.sorted || false;
            setSorted(sorted);

            if (sorted) {
              progressInterval();
            } else {
              setProgressRate(0)
            }

            if (gameRoom?.gameType == GameType.Penalty && !isHost) {
              setSortModalVisible(false);
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

  useFocusEffect(
    useCallback(() => {
      dispatch(setMainGameStart(false));
    }, [])
  )

  useEffect(() => {
    if (mainGameStart) {
      if (penaltyGameType == GameType.Bingo) {
        startBingo_();
      } else if (penaltyGameType == GameType.Tictactoe) {
        startTictactoe_();
      } else if (penaltyGameType == GameType.HighLow) {
        startHighLow_();
      } else if (penaltyGameType == GameType.PlusMinus) {
        startPlusMinus_();
      }
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

  useEffect(() => {
    if (sorted && !isHost) {
      setSortModalVisible(true);
    }
  }, [sorted]);

  useEffect(() => {
    sortRef.current = sort;
  }, [JSON.stringify(sort)])

  useLayoutEffect(() => {
    navigator.setOptions({
      headerLeft: () => (
        <Icon name="chevron-back-sharp" size={30} color="white" style={{marginRight: 20, marginLeft: -10 }} onPress={() => {
          setModalAlertText("プレイルームから脱退しますか？");
          setExitModalVisible(true);
        }} />
      ),
    })
  }, [navigator])

  const progressInterval = () => {
    const interval = setInterval(() => {
      setProgressRate((prevProgress) => {
        if (prevProgress >= 1) {
          clearInterval(interval);
          return 1;
        }
        return prevProgress + (isHost ? 0.05 : 0.05);
      });
    }, 100);

    return () => clearInterval(interval);
  }

  const handleGameStart = () => {
    console.log(sortRef.current)
    if(!sortRef.current) return false;

    setGameRoomOpen(gameRoomId, false);
    startGamePenalty(gameRoomId);
    setGameTypeF(gameRoomId, GameType.Penalty);
    
    setSortModalVisible(false)

    console.log(pressedGameType); 

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
      } catch (error) { }
    } else if (pressedGameType == GameType.HighLow) {
      try {
        dispatch(setPenaltyGameType(GameType.HighLow));
        navigator.navigate("penaltyAB");
      } catch (error) { }
    } else if (pressedGameType == GameType.PlusMinus) {
      try {
        dispatch(setPenaltyGameType(GameType.PlusMinus));
        navigator.navigate("penaltyAB");
      } catch (error) {
        console.log(error);
      }
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
    } catch (error) { }
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
    } catch (error) { }
  };
  const startHighLow_ = async () => {
    await startGameHighLow(gameRoomId);
  };

  const startPlusMinus_ = async () => {
    startGamePlusMinus(gameRoomId)
  }

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

  const handleExitModalVisible = (isVisible: boolean) => {
    setExitModalVisible(isVisible);
  }

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

    setHostSortingLoading(true);
    await setPlayerGameSort(gameRoomId, uids, true);
    setHostSortingLoading(false);

    setTimeout(() => {
      console.log(";333434343")
      handleGameStart();
    }, 2000);
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
      <ConfirmModal
        isVisible={exitModalVisible}
        setVisible={handleExitModalVisible}
        messageText={modalAlertText}
        confirmText="は い"
        cancelText="キャンセル"
        confirmBackgroundColor={customColors.blackRed}
        onConfirm={() => isExitModal ? exitRoom() : removeUser(currentRemoveUserId)}
        onCancel={() => { }}
      />

      <Modal
        animationType="fade"
        transparent={true}
        visible={gameListModalVisible}
        onRequestClose={() => {
          setGameListModalVisible(false);
        }}
      >
        <TouchableWithoutFeedback onPress={() => setGameListModalVisible(false)}>
          <View
            style={{
              flex: 1,
              justifyContent: "center",
              alignItems: "center",
              backgroundColor: customColors.modalBackgroundColor,
            }}
          >
            <TouchableWithoutFeedback onPress={() => { }}>
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
                  ゲームリスト
                </Text>
                {/* <Text style={styles.modalText}>ゲームを選択してください。</Text> */}
                <View style={styles.modalGameListContainer}>
                  <EffectBorder style={{ width: "80%" }}>
                    <TouchableOpacity
                      style={styles.modalGameListButton}
                      onPress={ async () => {
                        setPressedGameType(GameType.Bingo),
                          setGameListModalVisible(false),
                          await setPlayerGameSort(gameRoomId, [], false);
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
                    <TouchableOpacity style={styles.modalGameListButton}
                      onPress={ async () => {
                        setPressedGameType(GameType.PlusMinus);
                        setGameListModalVisible(false);
                        setSortModalVisible(true);

                        await setPlayerGameSort(gameRoomId, [], false);
                      }}
                    >
                      <Text style={styles.textTitle}>足し算引き算</Text>
                    </TouchableOpacity>
                  </EffectBorder>

                  <EffectBorder style={{ width: "80%", marginTop: 10 }}>
                    <TouchableOpacity
                      style={styles.modalGameListButton}
                      onPress={async () => {
                        setPressedGameType(GameType.HighLow),
                        await setPlayerGameSort(gameRoomId, [], false);
                        setSortModalVisible(true);
                      }}
                    >
                      <Text style={styles.textTitle}>High & Low</Text>
                    </TouchableOpacity>
                  </EffectBorder>

                  <EffectBorder style={{ width: "80%", marginTop: 10 }}>
                    <TouchableOpacity
                      style={styles.modalGameListButton}
                      onPress={ async () => {
                        setPressedGameType(GameType.Tictactoe),
                        await setPlayerGameSort(gameRoomId, [], false);
                        setSortModalVisible(true);
                      }}
                    >
                      <Text style={styles.textTitle}>〇☓ゲーム</Text>
                    </TouchableOpacity>
                  </EffectBorder>
                </View>
              </View>
            </TouchableWithoutFeedback>

          </View>
        </TouchableWithoutFeedback>

      </Modal>

      <Modal
        animationType="fade"
        transparent={true}
        visible={sortModalVisible}
        onRequestClose={() => {
          setSortModalVisible(false);
        }}
      >
        <TouchableWithoutFeedback onPress={() => setSortModalVisible(false)}>
          <View
            style={{
              flex: 1,
              width: '100%',
              justifyContent: "center",
              alignItems: "center",
              backgroundColor: customColors.modalBackgroundColor,
            }}
          >
            <TouchableWithoutFeedback onPress={() => { }}>
              <View
                style={[
                  styles.modalBody,
                  {
                    width: "90%",
                    height: '60%',
                    borderWidth: 0,
                    borderRadius: 15,
                    paddingTop: 0,
                    paddingBottom: 0,
                    paddingHorizontal: 0,
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
                      borderColor: "green",
                      
                    },
                  ]}
                >
                  
                  {isHost && !sorted && (
                    <View
                      style={{
                        borderWidth: 0,
                        borderColor: customColors.customLightBlue,
                        borderRadius: 20,
                        width: "100%",
                        padding: 10,
                        alignItems: "center",
                        zIndex: 100,

                      }}
                    >
                      <TouchableOpacity
                        style={[
                          styles.successButton,
                          {
                            // width: '100%',
                            maxWidth: '100%',
                            backgroundColor: "#133a4edb",
                            borderWidth: 1,
                            borderColor: "grey",
                            flexDirection: "row",
                            paddingHorizontal: 20,
                          },
                        ]}
                        onPress={() => {
                          handleRandomSort();
                        }}
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
                        {hostSortingLoading && (
                          <View style={{ position: 'absolute', }}>
                            <ActivityIndicator
                              size="large"
                              color="#007AFF"
                            />
                          </View>
                        )}
                      </TouchableOpacity>
                    </View>
                  )}

                  {sorted && (
                    <View
                      style={[
                        styles.FlatListStyle,
                        {
                          borderWidth: 1,
                          borderColor: "grey",
                          paddingTop: 20,
                          borderRadius: 20,
                          marginTop: 20,
                          marginHorizontal: 0,
                          marginLeft: 0
                        },
                      ]}
                    >
                      <View style={{ marginBottom: 20 }}>
                        <Text style={{ color: 'white', fontSize: 20 }}>
                          順番が決まりました。
                        </Text>
                      </View>
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
                      <Progress.Bar progress={progressRate} width={300} />
                    </View>
                  )}
                </View>
              </View>
            </TouchableWithoutFeedback>

          </View>
        </TouchableWithoutFeedback>

      </Modal>

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
          <Tooltip
            width={300}
            popover={
              <Text style={styles.tooltipText}>
                {gameRoomDisplayName}
              </Text>
            }
            backgroundColor="#333"
            withOverlay={false}
            highlightColor="#000"
          >
            <Text style={{ fontSize: 30, color: "white" }} numberOfLines={1}>
              {gameRoomDisplayName}
            </Text>
          </Tooltip>

        </View>
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
              <Icon name="swap-vertical-sharp" size={30} color={"white"} />
            </View>
            {/* <Text style={[styles.listTitle, {fontSize: 20}]}>ソート</Text> */}
          </TouchableOpacity>
        )}

        {(!isHost && !sortModalVisible) ? (
          <View
            style={{ position: "absolute", top: "50%" }}
          >
            <ActivityIndicator
              size="large"
              color="#007AFF"
            />
            <Text style={{ color: 'white' }}>ホストを待っています...</Text>
          </View>
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
              // navigator.navigate("plusminus");
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
    // paddingTop: 25,
    // width: "100%",
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
    fontFamily: "NotoSansJP_400Regular",
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
    fontFamily: "NotoSansJP_400Regular",
    fontWeight: "700",
    textAlign: "center",
  },
  listTitle: {
    fontSize: 25,
    color: "white",
    fontFamily: "NotoSansJP_400Regular",
    fontWeight: "700",
    textAlign: "center",
  },

  FlatListStyle: {
    flex: 1,
    borderWidth: 1,
    borderRadius: 30,
    backgroundColor: customColors.customDarkBlueBackground,
    width: "98%",
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
    fontFamily: "NotoSansJP_400Regular",
    fontWeight: "700",
    textAlign: "center",
  },

  completedText: {
    fontSize: 30,
    color: "white",
    width: "90%",
    fontFamily: "NotoSansJP_400Regular",
    fontWeight: "700",
    textAlign: "center",
  },
  roomModalBtns: {
    flexDirection: "row",
  },
  modalText: {
    fontSize: 20,
    color: "white",
    fontFamily: "NotoSansJP_400Regular",
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
  tooltipText: {
    fontSize: 14,
    color: 'white',
  },
});

export default GameWaitingScreen;