import React, { useCallback, useEffect, useState } from "react";

import {
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  Text,
  View,
  TextInput,
  Modal,
  FlatList,
  Keyboard,
  Platform,
  ActivityIndicator,
  BackHandler,
} from "react-native";
import { customColors } from "../utils/Color";
import SwitchToggle from "react-native-switch-toggle";
import { RouteProp, useFocusEffect } from "@react-navigation/native";
import Icon from "react-native-vector-icons/FontAwesome";
import {
  addPenaltyPatternA,
  deleteGamePenalty,
  deletePenaltyAListItem,
  exitGameRoom,
  getAllPenalty,
  getGamePenaltyRealtime,
  getGameRoom,
  setGameTypeF,
  setPatternASet,
  setPenaltyAInitial,
  setPenaltyAInitialFirestore,
  setPenaltyAllFirestore,
  setPenaltyPatternB,
  setPenaltyPatternC,
  setPenaltySkip,
} from "../utils/firebase/FirebaseUtil";
import {
  GameType,
  PatternAType,
  Penalty,
  Player,
  UnsubscribeOnsnapCallbackFunction,
} from "../utils/Types";
import { Dropdown } from "react-native-element-dropdown";

import { useNavigation } from "@react-navigation/native";
import { useDispatch, useSelector } from "react-redux";
import { RootState } from "../store";
import { RootStackParamList } from "../constants/navigate";
import { setGameRoomInitial } from "../store/reducers/bingo/gameRoomSlice";
import { setBingoInitial } from "../store/reducers/bingo/bingoSlice";
import { setPenaltyInitial } from "../store/reducers/bingo/penaltySlice";

enum PatternType {
  PatternA = "PatternA",
  PatternB = "PatternB",
}

type PenaltyScreenRouteProp = RouteProp<RootStackParamList, "penalty">;

type PenaltyScreenProps = {
  route: PenaltyScreenRouteProp;
};

type dropdownProps = {
  setNumber: (param: number) => void;
  number: number;
};

let data: any[] = [];

// Use a loop to generate the items
for (let i = 1; i <= 10; i++) {
  data.push({ label: "" + i, value: i });
}

const DropdownComponent: React.FC<dropdownProps> = ({ setNumber, number }) => {
  const [isFocus, setIsFocus] = useState(false);

  return (
    <View style={{ width: "100%" }}>
      <Dropdown
        style={[styles.dropdown, isFocus && { borderColor: "blue" }]}
        placeholderStyle={styles.placeholderStyle}
        selectedTextStyle={styles.selectedTextStyle}
        inputSearchStyle={styles.inputSearchStyle}
        iconStyle={styles.iconStyle}
        containerStyle={{ backgroundColor: "#0b1016", borderRadius: 10 }}
        itemTextStyle={{ color: "white" }}
        itemContainerStyle={{
          padding: 0,
          borderBottomWidth: 1,
          borderBottomColor: "grey",
        }}
        activeColor="black"
        data={data}
        search
        maxHeight={300}
        dropdownPosition="bottom"
        labelField="label"
        valueField="value"
        placeholder={!isFocus ? "プレイルーム名" : "..."}
        value={number}
        onFocus={() => setIsFocus(true)}
        onBlur={() => setIsFocus(false)}
        onChange={(item: any) => {
          setNumber(item.value as number);
          setIsFocus(false);
        }}
      />
    </View>
  );
};

const PenaltyScreen: React.FC<PenaltyScreenProps> = ({ route }) => {
  const { startGame } = route.params;
  const navigation = useNavigation();
  const dispatch = useDispatch();
  const isHost = useSelector((state: RootState) => state.gameRoom.isHost);
  const gameRoomId = useSelector(
    (state: RootState) => state.gameRoom.gameRoomId
  );
  const authUser = useSelector((state: RootState) => state.auth.authUser);
  const currentGameRoom = useSelector(
    (state: RootState) => state.gameRoom.currentGameRoom
  );

  const [isLightBlueEnabled, setIsLightBlueEnabled] = React.useState(false);
  const [isLightCyanEnabled, setIsLightCyanEnabled] = React.useState(false);
  const [isLightGreenEnabled, setIsLightGreenEnabled] = React.useState(false);

  const [isPatternB1SwitchEnabled, setIsPatternB1SwitchEnabled] =
    useState<boolean>(false);
  const [isPatternB2SwitchEnabled, setIsPatternB2SwitchEnabled] =
    useState<boolean>(false);
  const [isPatternB3SwitchEnabled, setIsPatternB3SwitchEnabled] =
    useState<boolean>(false);

  const [number, setNumber] = React.useState("");
  const [penaltyListModalVisible, setPenaltyListModalVisible] =
    React.useState<boolean>(false);

  const [allPenalties, setAllPenalties] = useState<Penalty[]>([]);
  const [penaltyAId, setPenaltyAId] = useState<string>("");
  const [penaltyATitle, setPenaltyATitle] = useState<string>("");
  const [penaltyBId, setPenaltyBId] = useState<string>("");
  const [penaltyBTitle, setPenaltyBTitle] = useState<string>("");
  const [penaltyA, setPenaltyA] = useState<Penalty>();
  const [penaltyB, setPenaltyB] = useState<Penalty>();
  const [penaltyCNumber, setPenaltyCNumber] = useState<number>(0);
  const [penaltyDNumber, setPenaltyDNumber] = useState<number>(0);
  const [patternType, setPatternType] = useState<PatternType>(
    PatternType.PatternA
  );

  const [patternASelected, setPatternASelected] = useState<boolean>(false);
  const [allSelectedPatternA, setAllSelectedPatternA] =
    useState<boolean>(false);
  const [patternASetAvailable, setPatternASetAvailable] =
    useState<boolean>(false);
  const [patternAList, setPatternAList] = useState<PatternAType[]>([]);
  const [patternBError, setPatternBError] = useState<string>("");
  const [keyboardShow, setKeyBoardShow] = useState<boolean>(false);
  const [subscribers, setSubscribers] = useState<Player[]>([]);
  const [exitModalVisible, setExitModalVisible] = useState<boolean>(false);
  const [exitModalAlertText, setExitModalAlertText] = useState("");

  const [penaltyPublicModalVisible, setPenaltyPublicModalVisible] =
    useState<boolean>(false);

  // get penalty by gameRoomId
  useFocusEffect(
    useCallback(() => {
      const unsubscribe: UnsubscribeOnsnapCallbackFunction =
        getGamePenaltyRealtime(gameRoomId, (penalty: any) => {
          if (penalty?.patternASet) {
            setPatternASetAvailable(true);
          } else {
            setPatternASetAvailable(false);
            setAllSelectedPatternA(false);
            setPenaltyA(undefined);
            setPenaltyAId("");
            setPenaltyATitle("");
            setPatternASelected(false);
          }

          const patternAList1: PatternAType[] = penalty?.patternAList;

          if (patternAList1.length == subscribers.length && patternAList1.length > 0 && penalty?.patternASet) {
            console.log("XXXXX")
            setPatternAList(patternAList1);
            setAllSelectedPatternA(true);
          } else {
            setAllSelectedPatternA(false);
          }
        });

      return () => unsubscribe();
    }, [])
  );

  useFocusEffect(
    useCallback(() => {
      const unsubscribe1: UnsubscribeOnsnapCallbackFunction = getGameRoom(
        gameRoomId,
        (gameRoom: any) => {
          if (!gameRoom) {
            dispatch(setGameRoomInitial(null));
            console.log("game roome was no exitst");
            navigation.navigate("gameRoomList");
            return false;
          }

          if (gameRoom?.subscribersPlayers) {
            if (
              !gameRoom?.subscribersPlayers.some(
                (player: any) => player.uid === authUser.uid
              )
            ) {
              dispatch(setGameRoomInitial(null));
              navigation.navigate("gameRoomList");
              return false;
            }
          }

          if (
            gameRoom?.gameStarted == true &&
            gameRoom?.gameType == GameType.Bingo
          ) {
            dispatch(setBingoInitial(null));
            navigation.navigate("bingo");
          }

          if (
            gameRoom?.gameStarted == true &&
            gameRoom?.gameType == GameType.Tictactoe
          ) {
            // dispatch(setBingoInitial(null));
            navigation.navigate("tictactoe");
          }

          if (
            gameRoom?.gameStarted == true &&
            gameRoom?.gameType == GameType.HighLow
          ) {
            // dispatch(setBingoInitial(null));
            navigation.navigate("highlow");
          }

          if (gameRoom?.gameType == GameType.Room && !isHost) {
            console.log("penalty exit");
            dispatch(setPenaltyInitial(null));
            navigation.navigate("currentRoom", {
              isHostParam: isHost,
              gameRoomIdParam: gameRoomId,
            });
          }
        }
      );

      return unsubscribe1;
    }, [])
  );

  useEffect(() => {
    if (allSelectedPatternA) {
      setPenaltyPublicModalVisible(true);
    }
  }, [allSelectedPatternA]);

  useEffect(() => {
    if(!isLightBlueEnabled) {
      setPenaltyAInitialFirestore(gameRoomId);
    }
  }, [isLightBlueEnabled])

  useEffect(() => {
    const subscribers_ = currentGameRoom?.subscribersPlayers || [];
    setSubscribers(subscribers_);
  }, []);

  useEffect(() => {
    const fetchPenalties = async () => {
      try {
        const penalties = await getAllPenalty();
        setAllPenalties(penalties || []);
      } catch (error) {}
    };

    fetchPenalties();
  }, []);

  useEffect(() => {
    if (penaltyAId) {
      const penalty = allPenalties.find((penalty) => penalty.id == penaltyAId);
      setPenaltyA(penalty);
    }
  }, [penaltyAId]);

  useEffect(() => {
    if (penaltyBId) {
      const penalty = allPenalties.find((penalty) => penalty.id == penaltyBId);
      setPenaltyB(penalty);
    }
  }, [penaltyBId]);

  useFocusEffect(
    useCallback(() => {
      if (patternBError) {
        const timeout = setTimeout(() => {
          setPatternBError("");
        }, 5000);

        return () => clearTimeout(timeout);
      }
    }, [patternBError])
  );

  useEffect(() => {
    const keyboardDidShowListener = Keyboard.addListener(
      Platform.OS === "ios" ? "keyboardWillShow" : "keyboardDidShow",
      _keyboardDidShow
    );
    const keyboardDidHideListener = Keyboard.addListener(
      Platform.OS === "ios" ? "keyboardWillHide" : "keyboardDidHide",
      _keyboardDidHide
    );

    return () => {
      keyboardDidShowListener.remove();
      keyboardDidHideListener.remove();
    };
  }, []);

  useFocusEffect(
    useCallback(() => {
      const onBackPress = () => {
        if (!isHost) {
          setExitModalAlertText("プレイルームから脱退しますか？");
        } else {
          setExitModalAlertText("罰ゲームから退会しますか？");
        }
        setExitModalVisible(true);
        return true; // Indicate that the back press is handled
      };

      BackHandler.addEventListener("hardwareBackPress", onBackPress);

      return () => {
        BackHandler.removeEventListener("hardwareBackPress", onBackPress);
      };
    }, [navigator])
  );

  const getPlayerDisplayName = (uid: string) => {
    const player = subscribers.find((item: Player) => item.uid == uid);
    return player?.displayName;
  };

  const backBtnPress = () => {
    if (!isHost) {
      setExitModalAlertText("プレイルームから脱退しますか？");
    } else {
      setExitModalAlertText("罰ゲームから退会しますか？");
    }
    setExitModalVisible(true);
  };

  const startGamPenalty = (isPenalty: boolean) => {
    if (isPenalty) {
      if (!allSelectedPatternA) {
        return false;
      }
      console.log(isPenalty);
    } else {
      setPenaltySkip(gameRoomId);
      console.log(isPenalty);
    }
    try {
      startGame();
    } catch (error) {}
  };

  const setPatternA = () => {
    setPatternASelected(true);

    if (gameRoomId && authUser?.uid && penaltyAId) {
      addPenaltyPatternA(gameRoomId, authUser.uid, penaltyAId, penaltyATitle);
    }
  };

  const setPatternB = () => {
    if (gameRoomId && penaltyBId) {
      let patternC = 0;
      let patternD = 0;
      let patternE = false;
      let anyChecked: boolean = false;
      if (isPatternB1SwitchEnabled) {
        patternC = penaltyCNumber;
        anyChecked = true;
      } else if (isPatternB2SwitchEnabled) {
        patternD = penaltyDNumber;
        anyChecked = true;
      } else if (isPatternB3SwitchEnabled) {
        patternE = true;
        anyChecked = true;
      }

      if (anyChecked) {
        setPenaltyPatternB(
          gameRoomId,
          penaltyBId,
          penaltyBTitle,
          patternC,
          patternD,
          patternE
        );
      } else {
        setPatternBError("正確に入力してください...");

      }

    } else {
      setPatternBError("正確に入力してください...");
    }
  };

  const setPenaltyAll = () => {
    const patternB = {
      penaltyId: penaltyBId,
      penaltyTitle: penaltyBTitle,
    };

    let patternCNumber = 1;
    if (!number) {
      patternCNumber = 1;
    } else {
      patternCNumber = parseInt(number);
    }

    setPenaltyAllFirestore(gameRoomId, patternB, patternCNumber);
  };

  const _keyboardDidShow = () => {
    console.log("Keyboard shown");
    setKeyBoardShow(true);
  };

  const _keyboardDidHide = () => {
    console.log("Keyboard hidden");
    setKeyBoardShow(false);
  };

  const toggleLightBlueSwitch = () => {
    setIsLightBlueEnabled((previousState) => {
      if (!previousState) {
        setIsLightCyanEnabled(false);
        setPenaltyBId("");
        setPenaltyB(undefined);
        setPenaltyCNumber(0);
        setPenaltyDNumber(0);
        setIsPatternB1SwitchEnabled(false);
        setIsPatternB2SwitchEnabled(false);
        setIsPatternB3SwitchEnabled(false);
      }

      return !previousState;
    });
    setPenaltyAId("");
    setPenaltyA(undefined);

    setPatternASet(gameRoomId, !isLightBlueEnabled);
  };

  const toggleLightCyanSwitch = () => {
    setIsLightCyanEnabled((previousState) => {
      if (!previousState) {
        setIsLightBlueEnabled(false);
        setPenaltyAId("");
        setPenaltyA(undefined);
        setPatternASet(gameRoomId, false);
      }

      return !previousState;
    });
    setPenaltyBId("");
    setPenaltyB(undefined);
  };

  const togglePatternB1Switch = () => {
    setIsPatternB1SwitchEnabled((previousState) => {
      if (!previousState) {
        setIsPatternB2SwitchEnabled(false);
        setIsPatternB3SwitchEnabled(false);
        setPenaltyDNumber(0);
      }

      return !previousState;
    });
  };

  const togglePatternB2Switch = () => {
    setIsPatternB2SwitchEnabled((previousState) => {
      if (!previousState) {
        setIsPatternB1SwitchEnabled(false);
        setIsPatternB3SwitchEnabled(false);
        setPenaltyCNumber(0);
      }

      return !previousState;
    });
  };

  const togglePatternB3Switch = () => {
    setIsPatternB3SwitchEnabled((previousState) => {
      if (!previousState) {
        setIsPatternB1SwitchEnabled(false);
        setIsPatternB2SwitchEnabled(false);
        setPenaltyCNumber(0);
        setPenaltyDNumber(0);
      }

      return !previousState;
    });
  };

  const toggleLightGreenSwitch = () => {
    setIsLightGreenEnabled((previousState) => !previousState);
    if (isLightGreenEnabled) {
      setNumber("");
    }
  };

  const handlePatternAPlusBtnClick = () => {
    setPatternType(PatternType.PatternA);
    setPenaltyListModalVisible(true);
    console.log(PatternType.PatternA);
  };

  const handlePatternBPlusBtnClick = () => {
    setPatternType(PatternType.PatternB);
    setPenaltyListModalVisible(true);
    console.log(PatternType.PatternB);
  };

  const handlePenaltyListItemClick = (
    penaltyId: string,
    penaltyTitle: string
  ) => {
    if (patternType == PatternType.PatternA) {
      setPenaltyAId(penaltyId);
      setPenaltyATitle(penaltyTitle);
    } else if (patternType == PatternType.PatternB) {
      setPenaltyBId(penaltyId);
      setPenaltyBTitle(penaltyTitle);
    }

    setPenaltyListModalVisible(false);
  };

  const handleNumberChange = (text: string) => {
    // Remove non-numeric characters from the input
    const formattedText = text.replace(/[^0-9]/g, "");
    setNumber(formattedText);
  };

  const exitScreen = () => {
    if (isHost) {
      setGameTypeF(gameRoomId, GameType.Room);
      dispatch(setPenaltyInitial(null));
      deleteGamePenalty(gameRoomId);
      navigation.navigate("currentRoom", {
        isHostParam: isHost,
        gameRoomIdParam: gameRoomId,
      });
    } else {
      dispatch(setGameRoomInitial(null));
      dispatch(setPenaltyInitial(null));

      if (authUser.uid) {
        exitGameRoom(authUser.uid, gameRoomId, isHost);
        deletePenaltyAListItem(gameRoomId, authUser.uid);
      }
    }
  };

  const renderPenaltyItem = ({
    item,
    index,
  }: {
    item: Penalty;
    index: number;
  }) => {
    return (
      <TouchableOpacity
        style={[styles.penaltyItemRow]}
        key={index}
        onPress={() => handlePenaltyListItemClick(item.id, item.title)}
      >
        <View style={styles.penaltyItemTitle}>
          <Text style={{ fontSize: 20, color: "white", display: "flex" }}>
            {item.title}
          </Text>
        </View>
      </TouchableOpacity>
    );
  };

  const renderPenaltyAPublicItem = ({
    item,
    index,
  }: {
    item: PatternAType;
    index: number;
  }) => {
    return (
      <TouchableOpacity style={[styles.penaltyItemRow, {flexDirection: 'row', marginVertical: 5}]} key={index + "publicA"}>
        <View style={styles.penaltyItemTitle}>
          <Text style={{ fontSize: 18, color: "white", display: "flex" }}>
            {getPlayerDisplayName(item.uid)}:
          </Text>
        </View>

        <View style={styles.penaltyItemTitle}>
          <Text style={{ fontSize: 15, color: "white", display: "flex", paddingHorizontal: 10 }}>
            {item.penaltyTitle}
          </Text>
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.container}>
      <View style={styles.topHeader}>
        <TouchableOpacity
          style={{
            width: 44,
            height: 44,
            padding: 10,
            borderWidth: 1,
            borderColor: customColors.blackGrey,
            borderRadius: 25,
            alignItems: "center",
            justifyContent: "center",
          }}
          onPress={backBtnPress}
        >
          <Icon
            name="arrow-left"
            size={18}
            color={"white"}
            style={{ opacity: 0.8 }}
          />
        </TouchableOpacity>
        <Text style={styles.title}>罰ゲーム</Text>
      </View>
      {isHost && (
        <ScrollView
          style={{
            flexGrow: 1,
          }}
        >
          <View
            style={{
              justifyContent: "center",
              marginVertical: "auto",
              zIndex: 2,
            }}
          >
            <View style={styles.lightBlueComponent}>
              <View style={styles.lightBlueToggle}>
                <View style={{ maxWidth: "80%", flexDirection: "row" }}>
                  <Text style={{ fontSize: 18, color: customColors.white }}>
                    パターンA
                  </Text>
                  <Text
                    style={{
                      fontSize: 16,
                      color: customColors.white,
                      opacity: 0.7,
                    }}
                  >
                    (すべてのプレイヤー)
                  </Text>
                </View>
                <SwitchToggle
                  switchOn={isLightBlueEnabled}
                  onPress={() => {
                    toggleLightBlueSwitch();
                  }}
                  circleColorOff="grey"
                  circleColorOn="white"
                  backgroundColorOn="#5a6fff"
                  backgroundColorOff="#5971ff5e"
                  containerStyle={{
                    marginTop: 16,
                    width: 50,
                    height: 24,
                    borderRadius: 25,
                    padding: 3,
                    borderWidth: 1,
                    borderColor: "#556ff499",
                  }}
                  circleStyle={{
                    width: 18,
                    height: 18,
                    borderRadius: 18,
                  }}
                  duration={200}
                />
              </View>

              <View
                style={{
                  opacity: isLightBlueEnabled ? 1 : 0.3,
                  justifyContent: "center",
                  alignItems: "center",
                  padding: 15,
                }}
              >
                <View
                  style={{
                    display: isLightBlueEnabled ? "none" : "flex",
                    position: "absolute",
                    top: 0,
                    bottom: 0,
                    left: 0,
                    right: 0,
                    zIndex: 10,
                  }}
                ></View>

                {!penaltyAId ? (
                  <TouchableOpacity
                    style={{
                      width: 50,
                      height: 50,
                      borderRadius: 50,
                      borderWidth: 1,
                      borderColor: "#5a6fff",
                      padding: 10,
                      margin: 10,
                      paddingHorizontal: 12,
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                    onPress={() => {
                      handlePatternAPlusBtnClick();
                    }}
                  >
                    <Icon name="plus" size={25} color={"#5a6fff"} />
                  </TouchableOpacity>
                ) : (
                  <View
                    style={{
                      width: "90%",
                      justifyContent: "center",
                      alignItems: "center",
                      margin: 10,
                      opacity: patternASelected ? 0.3 : 1,
                    }}
                  >
                    <View
                      style={{
                        display: patternASelected ? "flex" : "none",
                        position: "absolute",
                        top: 0,
                        bottom: 0,
                        left: 0,
                        right: 0,
                        zIndex: 10,
                      }}
                    ></View>
                    <View
                      style={{
                        justifyContent: "center",
                        borderWidth: 1,
                        borderColor: "#5a6fff",
                        borderRadius: 20,
                        padding: 10,
                        width: "100%",
                        backgroundColor: "#0f203e",
                      }}
                    >
                      <TouchableOpacity
                        style={[styles.penaltyItemRow]}
                        onPress={() => handlePatternAPlusBtnClick()}
                      >
                        <View style={styles.penaltyItemTitle}>
                          <Text
                            style={{
                              fontSize: 20,
                              color: "white",
                              display: "flex",
                            }}
                          >
                            {penaltyA?.title}
                          </Text>
                        </View>
                      </TouchableOpacity>
                    </View>

                    <TouchableOpacity
                      style={{
                        padding: 10,
                        paddingHorizontal: 20,
                        borderWidth: 1,
                        marginTop: 30,
                        borderColor: "#5a6fff",
                        backgroundColor: "#19212e",
                        borderRadius: 30,
                        // width: "40%",
                      }}
                      onPress={() => setPatternA()}
                    >
                      <Text
                        style={{
                          fontSize: 20,
                          color: "white",
                          display: "flex",
                          textAlign: "center",
                        }}
                      >
                        決定／公開
                      </Text>
                    </TouchableOpacity>
                  </View>
                )}
              </View>
            </View>

            <View style={styles.lightCyanComponent}>
              <View style={styles.lightCyanToggle}>
                <View style={{ maxWidth: "80%", flexDirection: "row" }}>
                  <Text style={{ fontSize: 18, color: customColors.white }}>
                    パターンB
                  </Text>
                  <Text
                    style={{
                      fontSize: 16,
                      color: customColors.white,
                      opacity: 0.7,
                    }}
                  >
                    (共通罰ゲームの設定)
                  </Text>
                </View>
                <SwitchToggle
                  switchOn={isLightCyanEnabled}
                  onPress={toggleLightCyanSwitch}
                  circleColorOff="grey"
                  circleColorOn="white"
                  backgroundColorOn="#29ccdc"
                  backgroundColorOff="#1c6c74a3"
                  containerStyle={{
                    marginTop: 16,
                    width: 50,
                    height: 24,
                    borderRadius: 25,
                    padding: 3,
                    borderWidth: 1,
                    borderColor: "#556ff499",
                  }}
                  circleStyle={{
                    width: 18,
                    height: 18,
                    borderRadius: 18,
                  }}
                  duration={200}
                />
              </View>

              <View
                style={{
                  opacity: isLightCyanEnabled ? 1 : 0.3,
                  justifyContent: "center",
                  alignItems: "center",
                  // padding: 15,
                }}
              >
                <View
                  style={{
                    display: isLightCyanEnabled ? "none" : "flex",
                    position: "absolute",
                    top: 0,
                    bottom: 0,
                    left: 0,
                    right: 0,
                    zIndex: 10,
                  }}
                ></View>

                {!penaltyBId ? (
                  <TouchableOpacity
                    style={{
                      width: 50,
                      height: 50,
                      borderRadius: 50,
                      borderWidth: 1,
                      borderColor: "#29ccdc",
                      padding: 10,
                      margin: 10,
                      paddingHorizontal: 12,
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                    onPress={() => {
                      handlePatternBPlusBtnClick();
                    }}
                  >
                    <Icon name="plus" size={25} color={"#29ccdc"} />
                  </TouchableOpacity>
                ) : (
                  <View
                    style={{
                      width: "90%",
                      justifyContent: "center",
                      alignItems: "center",
                      margin: 10,
                      // opacity: patternASelected ? 0.3 : 1,
                    }}
                  >
                    <View
                      style={{
                        justifyContent: "center",
                        borderWidth: 1,
                        borderColor: "#29ccdc",
                        borderRadius: 20,
                        padding: 10,
                        width: "100%",
                        backgroundColor: "#0f203e",
                      }}
                    >
                      <TouchableOpacity
                        style={[styles.penaltyItemRow]}
                        onPress={() => handlePatternBPlusBtnClick()}
                      >
                        <View style={styles.penaltyItemTitle}>
                          <Text
                            style={{
                              fontSize: 20,
                              color: "white",
                              display: "flex",
                            }}
                          >
                            {penaltyB?.title}
                          </Text>
                        </View>
                      </TouchableOpacity>
                    </View>
                  </View>
                )}

                <View
                  style={{
                    borderWidth: 1,
                    borderColor: "#296d72db",
                    borderRadius: 10,
                    marginVertical: 5,
                    width: "100%",
                  }}
                >
                  <View style={[styles.lightCyanSubToggle]}>
                    <View style={{ maxWidth: "80%", flexDirection: "row" }}>
                      {/* <Text style={{ fontSize: 18, color: customColors.white }}>
                        パターンC
                      </Text> */}
                      <Text
                        style={{
                          fontSize: 16,
                          color: customColors.white,
                          // opacity: 0.7,
                        }}
                      >
                        ゲーム数の上限値の設定
                      </Text>
                    </View>
                    <SwitchToggle
                      switchOn={isPatternB1SwitchEnabled}
                      onPress={togglePatternB1Switch}
                      circleColorOff="grey"
                      circleColorOn="white"
                      backgroundColorOn="#29ccdc"
                      backgroundColorOff="#1c6c74a3"
                      containerStyle={{
                        marginTop: 6,
                        width: 30,
                        height: 16,
                        borderRadius: 25,
                        padding: 3,
                        borderWidth: 1,
                        borderColor: "#556ff499",
                      }}
                      circleStyle={{
                        width: 12,
                        height: 12,
                        borderRadius: 12,
                      }}
                      duration={100}
                    />
                  </View>

                  <View
                    style={{
                      opacity: isPatternB1SwitchEnabled ? 1 : 0.4,
                    }}
                  >
                    <View
                      style={{
                        display: isPatternB1SwitchEnabled ? "none" : "flex",
                        position: "absolute",
                        top: 0,
                        bottom: 0,
                        left: 0,
                        right: 0,
                        zIndex: 10,
                      }}
                    ></View>

                    {/* <TextInput
                      style={styles.input}
                      placeholder="プレイルーム名"
                      autoCapitalize="none"
                      placeholderTextColor={customColors.blackGrey}
                      // value={gameRoomDisplayName}
                      onChangeText={(text) => {
                        // setGameRoomDisplayName(text);
                      }}
                    /> */}

                    <View style={{ padding: 10, width: "100%" }}>
                      <DropdownComponent
                        setNumber={(number: number) => {
                          setPenaltyCNumber(number);
                        }}
                        number={penaltyCNumber}
                      />
                    </View>
                  </View>
                </View>

                <View
                  style={{
                    borderWidth: 1,
                    borderColor: "#296d72db",
                    borderRadius: 10,
                    marginVertical: 5,
                    width: "100%",
                  }}
                >
                  <View style={[styles.lightCyanSubToggle]}>
                    <View style={{ flexDirection: "row", width: "80%" }}>
                      {/* <Text style={{ fontSize: 15, color: customColors.white }}>
                        パターンD
                      </Text> */}
                      <Text
                        style={{
                          fontSize: 15,
                          color: customColors.white,
                          // opacity: 0.7,
                        }}
                      >
                        最下位の回数の上限値の設定
                      </Text>
                    </View>
                    <SwitchToggle
                      switchOn={isPatternB2SwitchEnabled}
                      onPress={togglePatternB2Switch}
                      circleColorOff="grey"
                      circleColorOn="white"
                      backgroundColorOn="#29ccdc"
                      backgroundColorOff="#1c6c74a3"
                      containerStyle={{
                        marginTop: 6,
                        width: 30,
                        height: 16,
                        borderRadius: 25,
                        padding: 3,
                        borderWidth: 1,
                        borderColor: "#556ff499",
                      }}
                      circleStyle={{
                        width: 12,
                        height: 12,
                        borderRadius: 12,
                      }}
                      duration={100}
                    />
                  </View>

                  <View
                    style={{
                      opacity: isPatternB2SwitchEnabled ? 1 : 0.4,
                    }}
                  >
                    <View
                      style={{
                        display: isPatternB2SwitchEnabled ? "none" : "flex",
                        position: "absolute",
                        top: 0,
                        bottom: 0,
                        left: 0,
                        right: 0,
                        zIndex: 10,
                      }}
                    ></View>
                    {/* <TextInput
                      style={styles.input}
                      placeholder="プレイルーム名"
                      autoCapitalize="none"
                      placeholderTextColor={customColors.blackGrey}
                      // value={gameRoomDisplayName}
                      onChangeText={(text) => {
                        // setGameRoomDisplayName(text);
                      }}
                    /> */}
                    <View style={{ padding: 10, width: "100%" }}>
                      <DropdownComponent
                        setNumber={(number: number) => {
                          setPenaltyDNumber(number);
                        }}
                        number={penaltyDNumber}
                      />
                    </View>
                  </View>
                </View>

                <View
                  style={{
                    borderWidth: 1,
                    borderColor: "#296d72db",
                    borderRadius: 10,
                    marginVertical: 5,
                    width: "100%",
                    paddingVertical: 10,
                  }}
                >
                  <View style={[styles.lightCyanSubToggle]}>
                    <View style={{ maxWidth: "80%", flexDirection: "row" }}>
                      {/* <Text style={{ fontSize: 18, color: customColors.white }}>
                        パターンE
                      </Text> */}
                      <Text
                        style={{
                          fontSize: 15,
                          color: customColors.white,
                          // opacity: 0.7,
                        }}
                      >
                        負けるごと罰ゲームを実行する
                      </Text>
                    </View>
                    <SwitchToggle
                      switchOn={isPatternB3SwitchEnabled}
                      onPress={togglePatternB3Switch}
                      circleColorOff="grey"
                      circleColorOn="white"
                      backgroundColorOn="#29ccdc"
                      backgroundColorOff="#1c6c74a3"
                      containerStyle={{
                        marginTop: 6,
                        width: 30,
                        height: 16,
                        borderRadius: 25,
                        padding: 3,
                        borderWidth: 1,
                        borderColor: "#556ff499",
                      }}
                      circleStyle={{
                        width: 12,
                        height: 12,
                        borderRadius: 12,
                      }}
                      duration={100}
                    />
                  </View>
                </View>

                <View>
                  <Text style={{ color: "red", fontSize: 15 }}>
                    {patternBError}
                  </Text>
                </View>

                <TouchableOpacity
                  style={{
                    padding: 10,
                    paddingHorizontal: 20,
                    borderWidth: 1,
                    marginTop: 30,
                    borderColor: "#29ccdc",
                    backgroundColor: "#19212e",
                    borderRadius: 30,
                    // width: "40%",
                  }}
                  onPress={() => setPatternB()}
                >
                  <Text
                    style={{
                      fontSize: 20,
                      color: "white",
                      display: "flex",
                      textAlign: "center",
                    }}
                  >
                    決定／公開
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </ScrollView>
      )}

      {isHost && (
        <View
          style={{
            bottom: 0,
            width: "100%",
            flexDirection: "row",
            justifyContent: "space-around",
            paddingHorizontal: 10,
            paddingTop: 5,
          }}
        >
          <TouchableOpacity
            style={{
              width: "45%",
              padding: 10,
              backgroundColor: "#250e44",
              borderWidth: 1,
              borderColor: "#8e44ad",
              borderRadius: 30,
              alignItems: "center",
              justifyContent: "center",
            }}
            onPress={() => startGamPenalty(false)}
          >
            <Text style={{ color: "white", fontSize: 18 }}>スキップ</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={{
              width: "45%",
              padding: 10,
              backgroundColor: "#0f203e",
              borderWidth: 1,
              borderColor: "#29ccdc",
              borderRadius: 30,
              alignItems: "center",
              justifyContent: "center",
              opacity: allSelectedPatternA ? 1 : 0.3,
            }}
            onPress={() => startGamPenalty(true)}
          >
            <Text style={{ color: "white", fontSize: 18 }}>ゲーム開始</Text>
          </TouchableOpacity>
        </View>
      )}

      {!isHost && (
        <View
          style={{
            flex: 1,
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          {!patternASetAvailable && (
            <View>
              <Text style={{ color: "white", fontSize: 15 }}>
                ホストが罰ゲームを設定しています ...
              </Text>
              <View>
                {!patternASetAvailable ? (
                  <ActivityIndicator size="large" color="#007AFF" />
                ) : (
                  ""
                )}
              </View>
            </View>
          )}

          {patternASetAvailable && (
            <View
              style={{
                flex: 1,
                borderWidth: 1,
                borderColor: "#5a6fff",
                borderRadius: 30,
                justifyContent: "center",
                margin: 10,
                width: "100%",
                backgroundColor: customColors.customDarkBlueBackground,
                alignItems: "center",
              }}
            >
              {!penaltyAId ? (
                <>
                  <View
                    style={{
                      alignItems: "center",
                    }}
                  >
                    <Text
                      style={{
                        color: "white",
                        fontSize: 18,
                      }}
                    >
                      パターンAを設定してください。
                    </Text>
                  </View>
                  <TouchableOpacity
                    style={{
                      width: 50,
                      height: 50,
                      borderRadius: 50,
                      borderWidth: 1,
                      borderColor: "#5a6fff",
                      padding: 10,
                      margin: 10,
                      paddingHorizontal: 12,
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                    onPress={() => {
                      handlePatternAPlusBtnClick();
                    }}
                  >
                    <Icon name="plus" size={25} color={"#5a6fff"} />
                  </TouchableOpacity>
                </>
              ) : (
                <View
                  style={{
                    alignItems: "center",
                    justifyContent: "center",
                    width: "100%",
                  }}
                >
                  <View
                    style={{
                      display: patternASelected ? "flex" : "none",
                      position: "absolute",
                      top: 0,
                      bottom: 0,
                      left: 0,
                      right: 0,
                      zIndex: 10,
                    }}
                  ></View>
                  <View
                    style={{
                      margin: 10,
                      justifyContent: "center",
                      borderWidth: 1,
                      borderColor: "#5a6fff",
                      borderRadius: 20,
                      width: "90%",
                      padding: 10,
                      backgroundColor: "#0f203e",
                      opacity: patternASelected ? 0.3 : 1,
                    }}
                  >
                    <TouchableOpacity
                      style={[styles.penaltyItemRow]}
                      onPress={() => handlePatternAPlusBtnClick()}
                    >
                      <View style={styles.penaltyItemTitle}>
                        <Text
                          style={{
                            fontSize: 20,
                            color: "white",
                            display: "flex",
                          }}
                        >
                          {penaltyA?.title}
                        </Text>
                      </View>
                    </TouchableOpacity>
                  </View>

                  <TouchableOpacity
                    style={{
                      padding: 10,
                      paddingHorizontal: 20,
                      borderWidth: 1,
                      marginTop: 30,
                      borderColor: "#5a6fff",
                      backgroundColor: "#19212e",
                      borderRadius: 30,
                      opacity: patternASelected ? 0.3 : 1,
                    }}
                    onPress={() => setPatternA()}
                  >
                    <Text
                      style={{ fontSize: 20, color: "white", display: "flex" }}
                    >
                      確認
                    </Text>
                  </TouchableOpacity>

                  {patternASelected && (
                    <View
                      style={{
                        marginTop: 100,
                      }}
                    >
                      <Text style={{ color: "white", fontSize: 15 }}>
                        ホストがゲームを開始するまで待機します ...
                      </Text>
                      <View
                        style={{
                          marginTop: 20,
                        }}
                      >
                        {true ? (
                          <ActivityIndicator size="large" color="#007AFF" />
                        ) : (
                          ""
                        )}
                      </View>
                    </View>
                  )}
                </View>
              )}
            </View>
          )}
        </View>
      )}

      <Modal
        animationType="fade"
        transparent={true}
        visible={penaltyListModalVisible}
        onRequestClose={() => {
          setPenaltyListModalVisible(false);
        }}
      >
        <View
          style={{
            flex: 1,
            justifyContent: "center",
            alignItems: "center",
            backgroundColor: "#000000e0",
          }}
        >
          <View
            style={{
              margin: 10,
              justifyContent: "center",
              borderWidth: 1,
              borderColor: "white",
              borderRadius: 20,
              width: "90%",
              padding: 10,
              backgroundColor: "#0f203e",
            }}
          >
            <FlatList
              data={allPenalties}
              renderItem={renderPenaltyItem}
              keyExtractor={(item, index) => index.toString()}
            />
            <View
              style={{
                padding: 10,
                alignItems: "center",
              }}
            >
              <TouchableOpacity
                style={{
                  padding: 10,
                  justifyContent: "center",
                  backgroundColor: "#2d1d2a",
                  borderRadius: 20,
                  borderWidth: 1,
                  borderColor: "#623c34",
                  width: "40%",
                }}
                onPress={() => {
                  setPenaltyListModalVisible(false);
                }}
              >
                <Text
                  style={{
                    color: "white",
                    fontSize: 16,
                    textAlign: "center",
                  }}
                >
                  キャンセル
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      <Modal
        animationType="fade"
        transparent={true}
        visible={penaltyPublicModalVisible}
        onRequestClose={() => {
          setPenaltyPublicModalVisible(false);
        }}
      >
        <View
          style={{
            flex: 1,
            justifyContent: "center",
            alignItems: "center",
            backgroundColor: "#000000e0",
          }}
        >
          {/* Pattern A */}
          <View
            style={{
              margin: 10,
              justifyContent: "center",
              borderWidth: 1,
              borderColor: "white",
              borderRadius: 20,
              width: "90%",
              padding: 10,
              backgroundColor: "#0f203e",
              flex: 1
            }}
          >
            <View style={{alignItems: 'center', padding: 10, marginBottom: 10}}>
              <Text style={{fontSize: 20, color: 'white'}}>パターンAの罰ゲームリスト</Text>
            </View>
            <FlatList
              data={patternAList}
              renderItem={renderPenaltyAPublicItem}
              keyExtractor={(item, index) => index.toString()}
            />
          </View>

          {/* Pattern B */}
          <View
            style={{
              padding: 10,
              alignItems: "center",
            }}
          >
            <TouchableOpacity
              style={{
                padding: 10,
                justifyContent: "center",
                backgroundColor: "#2d1d2a",
                borderRadius: 20,
                borderWidth: 1,
                borderColor: "#623c34",
                width: "40%",
              }}
              onPress={() => {
                setPenaltyPublicModalVisible(false);
              }}
            >
              <Text
                style={{
                  color: "white",
                  fontSize: 16,
                  textAlign: "center",
                }}
              >
                閉じる
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

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
          <View
            style={{
              justifyContent: "center",
              alignItems: "center",
              backgroundColor: customColors.modalContainerBackgroundColor,
              paddingHorizontal: 15,
              paddingVertical: 50,
              borderWidth: 1,
              borderColor: "grey",
              borderRadius: 20,
              width: "80%",
            }}
          >
            <Text style={{ fontSize: 20, color: "white", textAlign: "center" }}>
              {exitModalAlertText}
            </Text>

            <View
              style={{
                flexDirection: "row",
                marginTop: 20,
                justifyContent: "space-evenly",
                width: "100%",
              }}
            >
              <TouchableOpacity
                style={{
                  padding: 10,
                  justifyContent: "center",
                  alignItems: "center",
                  borderWidth: 1,
                  borderRadius: 10,
                  borderColor: customColors.blackGrey,
                  backgroundColor: customColors.blackGrey,
                }}
                onPress={() => setExitModalVisible(false)}
              >
                <Text style={{ color: "white", fontSize: 16 }}>
                  {" "}
                  キャンセル{" "}
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={{
                  padding: 10,
                  justifyContent: "center",
                  alignItems: "center",
                  borderWidth: 1,
                  borderRadius: 10,
                  borderColor: customColors.blackGrey,
                  backgroundColor: customColors.blackRed,
                }}
                onPress={exitScreen}
              >
                <Text style={{ color: "white", fontSize: 16 }}> は い </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 5,
    paddingTop: 30,
    backgroundColor: "#000000",
  },

  title: {
    color: customColors.white,
    fontSize: 30,
    fontWeight: "700",
    marginLeft: 20,
  },

  pressBtn: {
    // backgroundColor: customColors.blackRed,
    paddingVertical: 5,
    marginVertical: 4,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: customColors.blackGrey,
  },

  pressBtnText: {
    fontSize: 16,
    color: "white",
    fontFamily: "serif",
    fontWeight: "700",
    textAlign: "center",
  },

  topHeader: {
    flexDirection: "row",
    justifyContent: "flex-start",
    alignItems: "center",
    marginBottom: 8,
    marginTop: 10,
    marginLeft: 10,
  },

  penaltyItemRow: {
    paddingHorizontal: 10,
    borderWidth: 1,
    marginTop: 1,
    borderColor: customColors.customDarkGreen1,
    backgroundColor: "#19212e",
    borderRadius: 8,
  },

  penaltyAddBtn: {
    backgroundColor: customColors.blackGreen,
    paddingVertical: 8,
    paddingHorizontal: 20,
    marginVertical: 4,
    borderRadius: 6,
    borderWidth: 1,
    marginHorizontal: 5,
    marginBottom: 15,
    borderColor: customColors.white,
  },

  orderBtnGroup: {
    display: "flex",
    alignItems: "flex-end",
    position: "relative",
    marginHorizontal: 5,
    marginTop: 10,
    paddingTop: 10,
    borderTopColor: customColors.white,
    borderTopWidth: 1,
  },

  penaltyItemTitle: {
    flexDirection: "row",
    justifyContent: "flex-start",
    alignItems: "center",
    paddingVertical: 10,
  },

  lightBlueComponent: {
    borderRadius: 20,
    borderWidth: 1,
    borderColor: "#5a6fff",
    padding: 10,
    margin: 10,
    backgroundColor: customColors.customDarkBlueBackground,
  },

  lightBlueToggle: {
    alignItems: "center",
    display: "flex",
    justifyContent: "space-between",
    flexDirection: "row",
    marginHorizontal: 10,
    borderBottomColor: "#5a6fff",
    borderBottomWidth: 2,
    paddingBottom: 10,
  },

  lightCyanComponent: {
    borderRadius: 20,
    borderWidth: 1,
    borderColor: "#29ccdc",
    padding: 10,
    margin: 10,
    backgroundColor: customColors.customDarkBlueBackground,
  },

  lightCyanToggle: {
    alignItems: "center",
    display: "flex",
    justifyContent: "space-between",
    flexDirection: "row",
    // marginHorizontal: 10,
    paddingHorizontal: 5,
    borderBottomColor: "#29ccdc",
    borderBottomWidth: 2,
    paddingBottom: 10,
  },

  lightCyanSubToggle: {
    alignItems: "center",
    display: "flex",
    justifyContent: "space-between",
    flexDirection: "row",
    paddingHorizontal: 5,
    paddingBottom: 10,
    borderRadius: 10,
  },

  lightGreenComponent: {
    borderRadius: 20,
    borderWidth: 1,
    borderColor: "#6ebf40",
    padding: 10,
    margin: 10,
    backgroundColor: customColors.customDarkBlueBackground,
  },

  lightGreenToggle: {
    alignItems: "center",
    display: "flex",
    justifyContent: "space-between",
    flexDirection: "row",
    marginHorizontal: 10,
    borderBottomColor: "#6ebf40",
    borderBottomWidth: 2,
    paddingBottom: 10,
  },

  input: {
    fontSize: 18,
    color: customColors.white,
    backgroundColor: "#102d3475",
    padding: 5,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderBottomWidth: 1,
    borderBottomColor: "#52b9ca",
    margin: 10,
  },

  dropdown: {
    height: 50,
    borderColor: "#52b9ca",
    // backgroundColor: 'green',
    borderBottomWidth: 0.5,
    borderRadius: 8,
    paddingHorizontal: 8,
  },
  icon: {
    marginRight: 5,
  },
  // label: {
  //   position: 'absolute',
  //   backgroundColor: 'black',
  //   left: 22,
  //   top: 0,
  //   // zIndex: 999,
  //   paddingHorizontal: 8,
  //   fontSize: 14,
  // },
  placeholderStyle: {
    fontSize: 16,
    color: "grey",
  },
  selectedTextStyle: {
    fontSize: 16,
    color: "white",
    // backgroundColor: 'black'
  },
  iconStyle: {
    width: 20,
    height: 20,
  },
  inputSearchStyle: {
    height: 40,
    fontSize: 18,
    color: "white",
  },
});

export default PenaltyScreen;
