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
  publicPatternAFirestore,
  deleteGamePenalty,
  deletePenaltyAListItem,
  exitGameRoom,
  getAllPenalty,
  getGamePenaltyRealtime,
  getGameRoom,
  setGameTypeF,
  setPatternASetFirestore,
  setPenaltyAInitialFirestore,
  setPenaltyAllFirestore,
  setPenaltyBInitialFirestore,
  setPenaltyPatternB,
  setPenaltyPatternC,
  setPenaltySkip,
} from "../utils/firebase/FirebaseUtil";
import {
  GameType,
  PenaltyAType,
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
import { size } from "lodash";

enum PatternType {
  PatternA = "PatternA",
  PatternB = "PatternB",
}

type PenaltyScreenRouteProp = RouteProp<RootStackParamList, "penalty">;

type PenaltyScreenProps = {
  route: PenaltyScreenRouteProp;
};

const PenaltyScreen: React.FC<PenaltyScreenProps> = ({ route }) => {
  const { startGame } = route.params;
  const navigation = useNavigation();
  const dispatch = useDispatch();

  //-------------------------------- Redux Data Start--------------------------------------
  const authUser = useSelector((state: RootState) => state.auth.authUser);
  const isHost = useSelector((state: RootState) => state.gameRoom.isHost);
  const gameRoomId = useSelector(
    (state: RootState) => state.gameRoom.gameRoomId
  );
  const currentGameRoom = useSelector(
    (state: RootState) => state.gameRoom.currentGameRoom
  );
  // ---------------------------------Redux Data End----------------------------------------

  //Pattern A
  const [isPatternASelected, setIsPatternASelected] = React.useState(false);
  const [isPatternASet, setIsPatternASet] = useState<boolean>(false);
  const [penaltyA, setPenaltyA] = useState<Penalty>();
  const [penaltyASelected, setPenaltyASelected] = useState<boolean>(false);
  const [penaltyAList, setPenaltyAList] = useState<PenaltyAType[]>([]);
  const [penaltyASetAvailable, setPenaltyASetAvailable] =
    useState<boolean>(false);

  //Pattern B
  const [isPatternBSelected, setIsPatternBSelected] = React.useState(false);
  const [isPatternBSet, setIsPatternBSet] = useState<boolean>(false);
  const [patternBError, setPatternBError] = useState<string>("");
  const [penaltyB, setPenaltyB] = useState<Penalty>();

  //Pattern A & Pattern B
  const [patternType, setPatternType] = useState<PatternType>(
    PatternType.PatternA
  );
  const [isSubPattern1, setIsSubPattern1] = useState<boolean>(false);
  const [isSubPattern2, setIsSubPattern2] = useState<boolean>(false);
  const [isSubPattern3, setIsSubPattern3] = useState<boolean>(false);
  const [penaltyRunCount, setPenaltyRunCount] = useState<number>(0);

  //common data
  const [subscribers, setSubscribers] = useState<Player[]>([]);
  const [allPenalties, setAllPenalties] = useState<Penalty[]>([]);

  //Modal
  const [penaltyListModalVisible, setPenaltyListModalVisible] =
    React.useState<boolean>(false);
  const [penaltyPublicModalVisible, setPenaltyPublicModalVisible] =
    useState<boolean>(false);
  const [exitModalVisible, setExitModalVisible] = useState<boolean>(false);
  const [exitModalAlertText, setExitModalAlertText] = useState("");

  /* ============================================== Use Effect Functions ============================================== */
  // get penalty by gameRoomId
  useFocusEffect(
    useCallback(() => {
      const unsubscribe: UnsubscribeOnsnapCallbackFunction =
        getGamePenaltyRealtime(gameRoomId, (penalty: any) => {
          if (penalty?.patternASet) {
            setPenaltyASetAvailable(true);
          } else {
            setPenaltyASetAvailable(false);
            setPenaltyA(undefined);
            setPenaltyASelected(false);
          }

          const patternAList1: PenaltyAType[] = penalty?.patternAList || [];
          if (
            patternAList1.length == subscribers.length &&
            patternAList1.length > 0 &&
            penalty?.patternASet
          ) {
            setPenaltyAList(patternAList1);
            setPenaltyPublicModalVisible(true);
          } else {
            setPenaltyAList([]);
          }
          // console.log()
          const penaltyB1 = penalty?.penaltyB;
          console.log(penaltyB1);
          if (
            penaltyB1 &&
            (penalty?.patternC || penalty?.patternD || penalty?.patternE)
          ) {
            setPatternBSet(true);
            if (!isHost) {
              setPenaltyB({
                id: penaltyB1?.penaltyId,
                title: penaltyB1?.penaltyTitle,
              });
              setPenaltyRunCount(penalty?.patternC);
              // setIsPatternB3SwitchEnabled(penalty?.patternE);
            }

            console.log("xxxx");

            setPenaltyPublicModalVisible(true);
          } else {
            // setPenaltyPublicModalVisible(false);
            setPatternBSet(false);
          }
        });

      return () => unsubscribe();
    }, [subscribers])
  );

  useFocusEffect(
    useCallback(() => {
      const unsubscribe: UnsubscribeOnsnapCallbackFunction = getGameRoom(
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

      return unsubscribe;
    }, [])
  );

  useEffect(() => {
    if(isHost) {
      if (!isPatternASelected) {
        setPenaltyAInitialFirestore(gameRoomId);
      } else {
        setPatternASetFirestore(gameRoomId, isPatternASelected);
      }
    }
  }, [isPatternASelected]);

  useEffect(() => {
    if(isHost) {
      if (!isPatternBSelected) {
        setPenaltyBInitialFirestore(gameRoomId);
      }
    }
  }, [isPatternBSelected]);

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
    if (penaltyAList.length > 0 && isPatternASelected) {
      return false;
    }

    try {
      startGame();
    } catch (error) {}
  };

  const handlePublicPatternA = () => {
    setPenaltyASelected(true);

    if (gameRoomId && authUser?.uid && penaltyA?.id) {
      publicPatternAFirestore(gameRoomId, authUser.uid, penaltyA);
    }
  };

  const handlePublicPatternB = () => {
    
  }



  // const setPatternB = () => {
  //   if (gameRoomId && penaltyB?.id) {
  //     let patternC = 0;
  //     let patternD = 0;
  //     let patternE = false;
  //     let anyChecked: boolean = false;
  //     // if (isPatternB1SwitchEnabled && penaltyCNumber) {
  //     //   patternC = penaltyCNumber;
  //     //   anyChecked = true;
  //     // } else if (isPatternB3SwitchEnabled) {
  //     //   patternE = true;
  //     //   anyChecked = true;
  //     // }

  //     if (anyChecked) {
  //       // setPenaltyPatternB(
  //       //   gameRoomId,
  //       //   patternC,
  //       //   patternD,
  //       //   patternE
  //       // );
  //     } else {
  //       setPatternBError("正確に入力してください...");
  //     }
  //   } else {
  //     setPatternBError("正確に入力してください...");
  //   }
  // };

  const toggleLightBlueSwitch = () => {
    setIsPatternASelected((previousState) => {
      if (!previousState) {
        setIsPatternBSelected(false);
        setPenaltyB(undefined);
        setPenaltyRunCount(0);
      }

      return !previousState;
    });
    setPenaltyA(undefined);

  };

  const toggleLightCyanSwitch = () => {
    setIsPatternBSelected((previousState) => {
      if (!previousState) {
        setIsPatternASelected(false);
        setPenaltyA(undefined);
        setPatternASetFirestore(gameRoomId, false);
      }

      return !previousState;
    });
    setPenaltyB(undefined);
  };

  const togglePatternASwitch = () => {
    setIsPatternASelected((previousState) => {
      if(!previousState) {
        setIsPatternBSelected(false);
        setPenaltyB(undefined);
      }

      return !previousState
    })
  }

  const togglePatternBSwitch = () => {
    setIsPatternBSelected((previousState) => {
      if(!previousState) {
        setIsPatternASelected(false);
        setPenaltyA(undefined);
      }

      return !previousState
    })
  }

  //subpatterns switch
  const toggleSubPattern1Switch = () => {
    setIsSubPattern1((previousState) => {
      if (!previousState) {
        setIsSubPattern2(false);
        setIsSubPattern3(false);
        setPenaltyRunCount(0);
      }

      return !previousState;
    });
  };

  const toggleSubPattern2Switch = () => {
    setIsSubPattern2((previousState) => {
      if (!previousState) {
        setIsSubPattern1(false);
        setIsSubPattern3(false);
        setPenaltyRunCount(0);
      }

      return !previousState;
    });
  };

  const toggleSubPattern3Switch = () => {
    setIsSubPattern3((previousState) => {
      if (!previousState) {
        setIsSubPattern1(false);
        setIsSubPattern2(false);
      }

      return !previousState;
    });
  };

  const handlePatternAPlusBtnClick = () => {
    setPatternType(PatternType.PatternA);
    setPenaltyListModalVisible(true);
  };

  const handlePatternBPlusBtnClick = () => {
    setPatternType(PatternType.PatternB);
    setPenaltyListModalVisible(true);
  };

  const handlePenaltyListItemClick = (penalty: Penalty) => {
    if (patternType == PatternType.PatternA) {
      setPenaltyA(penalty);
    } else if (patternType == PatternType.PatternB) {
      setPenaltyB(penalty);
    }

    setPenaltyListModalVisible(false);
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
        onPress={() => handlePenaltyListItemClick(item)}
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
    item: PenaltyAType;
    index: number;
  }) => {
    return (
      <TouchableOpacity
        style={[
          styles.penaltyItemRow,
          { flexDirection: "row", marginVertical: 5 },
        ]}
        key={index + "publicA"}
      >
        <View style={styles.penaltyItemTitle}>
          <Text style={{ fontSize: 18, color: "white", display: "flex" }}>
            {getPlayerDisplayName(item.uid)}:
          </Text>
        </View>

        <View style={styles.penaltyItemTitle}>
          <Text
            style={{
              fontSize: 15,
              color: "white",
              display: "flex",
              paddingHorizontal: 10,
            }}
          >
            {item.penaltyTitle}
          </Text>
        </View>
      </TouchableOpacity>
    );
  };

  type customSwitchToogleProps = {
    title: string,
    mainColor: string,
    toggleBackgroundColor: string,
    isBig: boolean, 
    isToggle: boolean,
    switchToggle: () => void
  }

  const CustomSwitchToogle: React.FC<customSwitchToogleProps> = ({
    title, mainColor, toggleBackgroundColor,isBig, isToggle, switchToggle
  }) => {
    return (
      <View style={[styles.switchToggleStyle]}>
        <View style={{ maxWidth: "80%", flexDirection: "row" }}>
          <Text
            style={{
              fontSize: isBig ? 18 : 16,
              color: customColors.white,
            }}
          >
            {title}
          </Text>
        </View>
        <SwitchToggle
          switchOn={isToggle}
          onPress={switchToggle}
          circleColorOff="grey"
          circleColorOn="white"
          backgroundColorOn={mainColor}
          backgroundColorOff={toggleBackgroundColor}
          containerStyle={{
            marginTop: isBig ? 16 : 6,
            width: isBig ? 50 : 30,
            height: isBig ? 24 : 16,
            borderRadius: 25,
            padding: 3,
            borderWidth: 1,
            borderColor: mainColor,
          }}
          circleStyle={{
            width: isBig ? 18 : 12,
            height: isBig ? 18 : 12,
            borderRadius: isBig ? 18 : 12,
          }}
          duration={100}
        />
      </View>
    )
  }

  type CustomSubPatternGroupProps = {
    mainColor: string,
    toggleBackgroundColor: string,
    isActive: boolean
  }

  const CustomSubPatternSwitchGroup:React.FC<CustomSubPatternGroupProps> = ({
    mainColor, toggleBackgroundColor, isActive
  }) => {
    return (
      <View>
        <View
          style={{
            borderWidth: 1,
            borderColor: mainColor,
            borderRadius: 10,
            marginVertical: 5,
            width: "100%",
            paddingVertical: 10,
          }}
        >
          <CustomSwitchToogle
            title="負けるたびに罰ゲームを実行する"
            mainColor={mainColor}
            toggleBackgroundColor={toggleBackgroundColor}
            isBig={false}
            isToggle={isSubPattern1 && isActive}
            switchToggle={toggleSubPattern1Switch}
          />
        </View>

        <View
          style={{
            borderWidth: 1,
            borderColor: mainColor,
            borderRadius: 10,
            marginVertical: 5,
            width: "100%",
            paddingVertical: 10,
          }}
        >
          <CustomSwitchToogle
            title="１ゲームが終了するごとに実行する"
            mainColor={mainColor}
            toggleBackgroundColor={toggleBackgroundColor}
            isBig={false}
            isToggle={isSubPattern2 && isActive}
            switchToggle={toggleSubPattern2Switch}
          />
        </View>

        <View
          style={{
            borderWidth: 1,
            borderColor: mainColor,
            borderRadius: 10,
            marginVertical: 5,
            width: "100%",
            paddingVertical: 10,
          }}
        >
          <CustomSwitchToogle
            title="ゲーム数を決めて負けが多い人が実行する"
            mainColor={mainColor}
            toggleBackgroundColor={toggleBackgroundColor}
            isBig={false}
            isToggle={isSubPattern3 && isActive}
            switchToggle={toggleSubPattern3Switch}
          />
          <View
            style={{
              opacity: isSubPattern3 && isActive ? 1 : 0.4,
            }}
          >
            <View
              style={{
                display: isSubPattern3 && isActive ? "none" : "flex",
                position: "absolute",
                top: 0,
                bottom: 0,
                left: 0,
                right: 0,
                zIndex: 10,
              }}
            ></View>
            <View style={{ padding: 10, width: "100%" }}>
              <DropdownComponent
                setNumber={(number: number) => {
                  setPenaltyRunCount(number);
                }}
                number={penaltyRunCount}
              />
            </View>
          </View>
        </View>
      </View>
    );
  };

  type PatternItemProps = {
    mainTitle: string,
    mainColor: string, 
    toggleBackgroundColor: string, 
    isActive: boolean,
    patternSwitchToggle: () => void,
    handlePenaltyPlusBtnClick: () => void,
    setPatternPublic: () => void
  }

  const PatternItem: React.FC<PatternItemProps> = ({
    mainTitle, mainColor, toggleBackgroundColor, isActive, patternSwitchToggle, handlePenaltyPlusBtnClick, setPatternPublic
  }) => {
    return (
      <View style={[styles.patternComponentStyle, {borderColor: mainColor}]}>
        <CustomSwitchToogle
            title={mainTitle}
            mainColor={mainColor}
            toggleBackgroundColor={toggleBackgroundColor}
            isBig={true}
            isToggle={isActive}
            switchToggle={patternSwitchToggle}
          />

        <View
          style={{
            opacity: isActive ? 1 : 0.3,
            justifyContent: "center",
            alignItems: "center",
          }}
        >
          <View
            style={{
              display: isActive ? "none" : "flex",
              position: "absolute",
              top: 0,
              bottom: 0,
              left: 0,
              right: 0,
              zIndex: 10,
            }}
          ></View>

          {!penaltyB?.id ? (
            <TouchableOpacity
              style={{
                width: 50,
                height: 50,
                borderRadius: 50,
                borderWidth: 1,
                borderColor: mainColor,
                padding: 10,
                margin: 10,
                paddingHorizontal: 12,
                alignItems: "center",
                justifyContent: "center",
              }}
              onPress={handlePenaltyPlusBtnClick}
            >
              <Icon name="plus" size={25} color={mainColor} />
            </TouchableOpacity>
          ) : (
            <View
              style={{
                width: "90%",
                justifyContent: "center",
                alignItems: "center",
                margin: 10,
              }}
            >
              <View
                style={{
                  justifyContent: "center",
                  borderWidth: 1,
                  borderColor: mainColor,
                  borderRadius: 20,
                  padding: 10,
                  width: "100%",
                  backgroundColor: "#0f203e",
                }}
              >
                <TouchableOpacity
                  style={[styles.penaltyItemRow]}
                  onPress={handlePenaltyPlusBtnClick}
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

          <CustomSubPatternSwitchGroup
            mainColor={mainColor}
            toggleBackgroundColor={toggleBackgroundColor}
            isActive={isActive}
          />

          <TouchableOpacity
            style={{
              padding: 10,
              paddingHorizontal: 20,
              borderWidth: 1,
              marginTop: 30,
              borderColor: mainColor,
              backgroundColor: "#19212e",
              borderRadius: 30,
            }}
            onPress={setPatternPublic}
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
    )
  }

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
            <PatternItem 
              mainTitle="PatternA"
              mainColor="#5a6fff"
              toggleBackgroundColor="#25307cde"
              isActive={isPatternASelected}
              patternSwitchToggle={() => {togglePatternASwitch()}}
              handlePenaltyPlusBtnClick={() => {handlePatternAPlusBtnClick()}}
              setPatternPublic={() => handlePublicPatternA}
            />

            <PatternItem 
              mainTitle="PatternB"
              mainColor="#29ccdc"
              toggleBackgroundColor="#1c5e65c9"
              isActive={isPatternBSelected}
              patternSwitchToggle={() => {togglePatternBSwitch()}}
              handlePenaltyPlusBtnClick={() => {handlePatternBPlusBtnClick()}}
              setPatternPublic={() => handlePublicPatternB}
            />
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
          {/* <TouchableOpacity
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
          </TouchableOpacity> */}

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
          {!penaltyASetAvailable && (
            <View>
              <Text style={{ color: "white", fontSize: 15 }}>
                ホストが罰ゲームを設定しています ...
              </Text>
              <View>
                {!penaltyASetAvailable
                  ? // <ActivityIndicator size="large" color="#007AFF" />
                    ""
                  : ""}
              </View>
            </View>
          )}

          {penaltyASetAvailable && (
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
              {!penaltyA?.id ? (
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
                      display: penaltyASelected ? "flex" : "none",
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
                      opacity: penaltyASelected ? 0.3 : 1,
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
                      opacity: penaltyASelected ? 0.3 : 1,
                    }}
                    onPress={handlePublicPatternA}
                  >
                    <Text
                      style={{ fontSize: 20, color: "white", display: "flex" }}
                    >
                      確認
                    </Text>
                  </TouchableOpacity>

                  {penaltyASelected && (
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
                        {true
                          ? // <ActivityIndicator size="large" color="#007AFF" />
                            ""
                          : ""}
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
              flex: 1,
            }}
          >
            {allPenaltyASelected && (
              <>
                <View
                  style={{
                    alignItems: "center",
                    padding: 10,
                    marginBottom: 10,
                  }}
                >
                  <Text style={{ fontSize: 24, color: "white" }}>
                    パターンAの罰ゲームリスト
                  </Text>
                </View>
                <FlatList
                  data={penaltyAList}
                  renderItem={renderPenaltyAPublicItem}
                  keyExtractor={(item, index) => index.toString()}
                />
              </>
            )}

            {patternBSet && (
              <View style={{ flex: 1 }}>
                <View
                  style={{
                    alignItems: "center",
                    padding: 10,
                    marginBottom: 10,
                  }}
                >
                  <Text style={{ fontSize: 24, color: "white" }}>
                    パターンBの罰ゲームリスト
                  </Text>
                </View>
                <View style={{}}>
                  <Text
                    style={{
                      color: "white",
                      fontSize: 20,
                      textDecorationLine: "underline",
                    }}
                  >
                    {" "}
                    - 罰ゲーム:{" "}
                  </Text>
                  <Text
                    style={{
                      color: "white",
                      fontSize: 16,
                      marginLeft: 15,
                      marginTop: 10,
                    }}
                  >
                    {penaltyB?.title}
                  </Text>
                </View>
                <View style={{ marginTop: 20, marginBottom: 10 }}>
                  <Text style={{ color: "white", fontSize: 20 }}>
                    罰ゲーム実施方法:
                  </Text>
                </View>
                {penaltyCNumber ? (
                  <View style={{ flexDirection: "row" }}>
                    <Text style={{ color: "white", fontSize: 16 }}>
                      ゲーム数の上限値の設定:
                    </Text>
                    <Text
                      style={{ color: "white", fontSize: 20, marginLeft: 10 }}
                    >
                      {penaltyCNumber || ""}
                    </Text>
                  </View>
                ) : (
                  ""
                )}

                {isPatternB3SwitchEnabled ? (
                  <View>
                    <Text style={{ fontSize: 16, color: "white" }}>
                      負けるごと」に、罰ゲームを実行する
                    </Text>
                  </View>
                ) : (
                  ""
                )}
              </View>
            )}
          </View>
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

  patternComponentStyle: {
    borderRadius: 20,
    borderWidth: 1,
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

  switchToggleStyle : {
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
