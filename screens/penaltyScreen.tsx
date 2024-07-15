import React, { useCallback, useEffect, useLayoutEffect, useState } from "react";
import {
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  Text,
  View,
  Modal,
  FlatList,
  BackHandler,
  ActivityIndicator,
  TouchableWithoutFeedback
} from "react-native";
import { customColors } from "../utils/Color";
import SwitchToggle from "react-native-switch-toggle";
import { RouteProp, useFocusEffect } from "@react-navigation/native";
import Icon from "react-native-vector-icons/Ionicons";
import {
  publicPatternFirestore,
  deleteGamePenalty,
  deletePenaltyAListItem,
  exitGameRoom,
  getAllPenalty,
  getGamePenaltyRealtime,
  getGameRoom,
  setMoveGameRoom,
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
import InputSpinner from "react-native-input-spinner";
import { RootState } from "../store";
import { RootStackParamList } from "../constants/navigate";
import { setGameRoomInitial, setMainGameStart } from "../store/reducers/bingo/gameRoomSlice";
import { setBingoInitial } from "../store/reducers/bingo/bingoSlice";
import { setPenaltyInitial } from "../store/reducers/bingo/penaltySlice";
import ConfirmModal from "../components/ConfirmModal";

enum PatternType {
  PatternA = "PatternA",
  PatternB = "PatternB",
}

type PenaltyScreenRouteProp = RouteProp<RootStackParamList, "penalty">;

type PenaltyScreenProps = {
  route: PenaltyScreenRouteProp;
};

const PenaltyScreen: React.FC<PenaltyScreenProps> = ({ route }) => {
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
  const isPenaltyAorBFromRedux = useSelector((state: RootState) => state.gameRoom.isPenaltyAorB);

  // ---------------------------------Redux Data End----------------------------------------

  //Pattern A
  const [isPatternASet, setIsPatternASet] = useState<boolean>(false);
  const [penalty, setPenalty] = useState<Penalty>();
  const [penaltySelected, setPenaltySelected] = useState<boolean>(false);
  const [penaltyList, setPenaltyList] = useState<PenaltyAType[]>([]);
  const [penaltySetAvailable, setPenaltySetAvailable] =
    useState<boolean>(false);

  //Pattern A & Pattern B
  const [isSubPattern1, setIsSubPattern1] = useState<boolean>(false);
  const [isSubPattern2, setIsSubPattern2] = useState<boolean>(false);
  const [isSubPattern3, setIsSubPattern3] = useState<boolean>(false);
  const [penaltyRunCount, setPenaltyRunCount] = useState<number>(1);
  const [isPenaltyAorB, setIsPenaltyAorB] = useState<boolean>(true);

  //common datasetPenaltyA
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
            setIsPenaltyAorB(true)
            setPenaltySetAvailable(true);
            setIsPatternASet(true);
          } else {
            if (penalty?.penaltyBSet) {
              setIsPenaltyAorB(false);
            }
            setPenaltySetAvailable(false);
            setPenalty(undefined);
            setPenaltySelected(false);
            setIsPatternASet(false);
          }

          const penaltyList1: PenaltyAType[] = penalty?.patternAList || [];

          setPenaltyList(penaltyList1);

          if (
            penaltyList1.length == subscribers.length &&
            penaltyList1.length > 0 &&
            penalty?.patternASet
          ) {
            setPenaltyPublicModalVisible(true);
          }
          const penaltyB1 = penalty?.penaltyB || null;
          if (penaltyB1 && penalty?.patternBSet) {
            if (!isHost) {
              console.log("xxx", penaltyB1)
            }
            const p: Penalty = { id: penaltyB1?.penaltyId, title: penaltyB1?.penaltyTitle };
            setPenalty(p);
            setPenaltyPublicModalVisible(true);
          }

          if (
            !(
              (penaltyList1.length == subscribers.length &&
                penaltyList1.length > 0 &&
                penalty?.patternASet) ||
              (penaltyB1 && penalty?.patternBSet)
            )
          ) {
            setPenaltyPublicModalVisible(false);
          }

          if ((penalty?.patternASet || penalty?.patternBSet) && !isHost) {
            setIsSubPattern1(penalty?.subPattern1);
            setIsSubPattern2(penalty?.subPattern2);
            setIsSubPattern3(penalty?.subPattern3);
            setPenaltyRunCount(penalty?.penaltyRunCount);
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
            setPenaltyPublicModalVisible(false);
            navigation.navigate("bingo");
          }

          if (
            gameRoom?.gameStarted == true &&
            gameRoom?.gameType == GameType.Tictactoe
          ) {
            setPenaltyPublicModalVisible(false);
            navigation.navigate("tictactoe");
          }

          if (
            gameRoom?.gameStarted == true &&
            gameRoom?.gameType == GameType.HighLow
          ) {
            setPenaltyPublicModalVisible(false);
            navigation.navigate("highlow");
          }

          if (
            gameRoom?.gameStarted == true &&
            gameRoom?.gameType == GameType.PlusMinus
          ) {
            setPenaltyPublicModalVisible(false);
            navigation.navigate("plusminus");
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
    const subscribers_ = currentGameRoom?.subscribersPlayers || [];
    setSubscribers(subscribers_);
  }, []);

  useEffect(() => {
    setIsPenaltyAorB(isPenaltyAorBFromRedux);
  }, [isPenaltyAorBFromRedux])

  useFocusEffect(
    useCallback(() => {
      dispatch(setMainGameStart(false));
    }, [])
  )

  useEffect(() => {
    const fetchPenalties = async () => {
      try {
        const penalties = await getAllPenalty();
        setAllPenalties(penalties || []);
      } catch (error) { }
    };

    fetchPenalties();
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

  useLayoutEffect(() => {
    navigation.setOptions({
      headerLeft: () => (
        <Icon name="chevron-back-sharp" size={30} color="white" style={{ marginRight: 20, marginLeft: -10 }} onPress={() => {
          if (!isHost) {
            setExitModalAlertText("プレイルームから脱退しますか？");
          } else {
            setExitModalAlertText("罰ゲームから退会しますか？");
          }

          setExitModalVisible(true);
        }} />
      ),
    })
  }, [navigation])

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

  const startGamPenalty = async (isPenalty: boolean) => {
    console.log(penaltyList.length)
    if (isPenaltyAorB && penaltyList.length < subscribers.length - 1) {
      return false;
    }

    if (!penalty || !(isSubPattern1 || isSubPattern2 || isSubPattern3) || (isSubPattern3 && !penaltyRunCount)) {
      return false;
    }

    await handlePublicPattern();
    setTimeout(() => {
      dispatch(setMainGameStart(true));
      console.log("xxxx")
    }, 3000);
  };

  const handlePublicPattern = async () => {
    if (gameRoomId && authUser?.uid && penalty?.id) {
      if (isHost) {
        const subPattern1 = isSubPattern1;
        const subPattern2 = isSubPattern2;
        const subPattern3 = isSubPattern3;

        console.log(subPattern1, subPattern2, subPattern3, penaltyRunCount)

        if (subPattern1 || subPattern2 || subPattern3) {
          if (subPattern3 && !penaltyRunCount) {
            return false;
          }
          await publicPatternFirestore(
            gameRoomId,
            authUser.uid,
            penalty,
            subPattern1,
            subPattern2,
            subPattern3,
            penaltyRunCount,
            isHost,
            isPenaltyAorB ? true : false
          );
        }
      } else {
        setPenaltySelected(true);

        await publicPatternFirestore(
          gameRoomId,
          authUser.uid,
          penalty,
          false,
          false,
          false,
          0,
          false,
          isPenaltyAorB ? true : false
        );
      }
    }
  };

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

  const handlePatternPlusBtnClick = () => {
    setPenaltyListModalVisible(true);
  };

  const handlePenaltyListItemClick = (penalty: Penalty) => {
    setPenalty(penalty)
    setPenaltyListModalVisible(false);
  };

  const exitScreen = () => {
    if (isHost) {
      setMoveGameRoom(gameRoomId, GameType.Room);
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

  const handleExitModalVisible = (isVisible: boolean) => {
    setExitModalVisible(isVisible)
  }

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

  const renderPenaltyPublicItem = ({
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
          { flexDirection: "row", marginVertical: 5, width: '100%', justifyContent: 'space-between' },
        ]}
        key={index + "public"}
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
    title: string;
    mainColor: string;
    toggleBackgroundColor: string;
    isBig: boolean;
    isToggle: boolean;
    switchToggle: () => void;
  };

  const CustomSwitchToogle: React.FC<customSwitchToogleProps> = ({
    title,
    mainColor,
    toggleBackgroundColor,
    isBig,
    isToggle,
    switchToggle,
  }) => {
    return (
      <View style={[styles.switchToggleStyle, { width: "100%" }]}>
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
    );
  };

  type CustomSubPatternGroupProps = {
    mainColor: string;
    toggleBackgroundColor: string;
  };

  const CustomSubPatternSwitchGroup: React.FC<CustomSubPatternGroupProps> = ({
    mainColor,
    toggleBackgroundColor,
  }) => {
    return (
      <View>
        <View
          style={{
            borderRadius: 10,
            marginVertical: 15,
            width: "100%",
            paddingVertical: 10,
            backgroundColor: (isSubPattern1) ? '#0f203e' : 'black'
          }}
        >
          <CustomSwitchToogle
            title="負けるたびに罰ゲームを実行する"
            mainColor={mainColor}
            toggleBackgroundColor={toggleBackgroundColor}
            isBig={true}
            isToggle={isSubPattern1}
            switchToggle={toggleSubPattern1Switch}
          />
        </View>

        {/* <View
          style={{
            borderWidth: 1,
            // borderColor: mainColor,
            borderRadius: 10,
            marginVertical: 15,
            width: "100%",
            paddingVertical: 10,
            backgroundColor: (isSubPattern2 ) ? '#0f203e' : 'black'
          }}
        >
          <CustomSwitchToogle
            title="１ゲームが終了するごとに実行する"
            mainColor={mainColor}
            toggleBackgroundColor={toggleBackgroundColor}
            isBig={true}
            isToggle={isSubPattern2 }
            switchToggle={toggleSubPattern2Switch}
          />
        </View> */}

        <View
          style={{
            borderWidth: 1,
            // borderColor: mainColor,
            borderRadius: 10,
            marginVertical: 15,
            width: "100%",
            paddingVertical: 10,
            backgroundColor: (isSubPattern3) ? '#0f203e' : 'black'
          }}
        >
          <CustomSwitchToogle
            title="ゲーム数を決めて負けが多い人が実行する"
            mainColor={mainColor}
            toggleBackgroundColor={toggleBackgroundColor}
            isBig={true}
            isToggle={isSubPattern3}
            switchToggle={toggleSubPattern3Switch}
          />
          <View
            style={{
              opacity: isSubPattern3 ? 1 : 0.4,
            }}
          >
            <View
              style={{
                display: isSubPattern3 ? "none" : "flex",
                position: "absolute",
                top: 0,
                bottom: 0,
                left: 0,
                right: 0,
                zIndex: 10,
              }}
            ></View>
            <View style={{ padding: 10, width: "100%", borderTopColor: 'black', borderTopWidth: 1 }}>
              <InputSpinner
                max={100}
                min={1}
                step={1}
                colorMax={"#f04048"}
                colorMin={"#40c5f4"}
                textColor="white"
                value={penaltyRunCount}
                fontSize={25}
                onChange={(num: number) => {
                  setPenaltyRunCount(num)
                }}
              />
              {/* <DropdownComponent
                setNumber={(number: number) => {
                  setPenaltyRunCount(number);
                }}
                number={isSubPattern3  ? penaltyRunCount : 0}
              /> */}
            </View>
          </View>
        </View>
      </View>
    );
  };

  type PatternItemProps = {
    mainTitle: string;
    mainColor: string;
    toggleBackgroundColor: string;
    patternType: PatternType;
    patternSwitchToggle: () => void;
    handlePenaltyPlusBtnClick: () => void;
  };

  const PatternItem: React.FC<PatternItemProps> = ({
    mainTitle,
    mainColor,
    toggleBackgroundColor,
    patternType,
    patternSwitchToggle,
    handlePenaltyPlusBtnClick,
  }) => {
    return (
      <View
        style={[styles.patternComponentStyle, { borderColor: '' }]}>
        <View
          style={{
            justifyContent: "center",
            alignItems: "center",
          }}
        >
          {/* <View
            style={{
              position: "absolute",
              top: 0,
              bottom: 0,
              left: 0,
              right: 0,
              zIndex: 10,
            }}
          ></View> */}

          {(
            !penalty
          ) ? (
            <View style={{ alignItems: 'center', marginTop: 10 }}>
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
                  好きな罰ゲームを設定してください。
                </Text>
              </View>
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
                <Icon name="add-sharp" size={25} color={mainColor} />
              </TouchableOpacity>
            </View>
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
                      {penalty?.title}
                    </Text>
                  </View>
                </TouchableOpacity>
              </View>
            </View>
          )}

          <CustomSubPatternSwitchGroup
            mainColor={mainColor}
            toggleBackgroundColor={toggleBackgroundColor}
          />
        </View>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      {/* <View style={styles.topHeader}>
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
      </View> */}
      {isHost && (
        <View
          style={{
            justifyContent: "center",
            marginVertical: "auto",
            flex: 1
          }}
        >
          <PatternItem
            mainTitle="「全員が罰ゲームを選ぶ」"
            mainColor="#5a6fff"
            toggleBackgroundColor="#25307cde"
            patternType={PatternType.PatternA}
            patternSwitchToggle={() => {
              // togglePatternASwitch();
            }}
            handlePenaltyPlusBtnClick={() => {
              handlePatternPlusBtnClick();
            }}
          />
        </View>
      )}

      {isHost && (
        <View
          style={{
            bottom: 0,
            width: "100%",
            flexDirection: "row",
            justifyContent: "center",
            paddingHorizontal: 10,
            paddingTop: 5,
            marginVertical: 15,
          }}
        >
          <View
            style={{
              width: "100%",
              justifyContent: 'center',
              alignItems: 'center'
            }}
          >
            {/* { isPenaltyAorB && subscribers.length >1 && 
              <View style={{flexDirection:'row', marginBottom: 35}}>
                {subscribers.map((player,  index) => (
                  <View key={index} style={{width: 12, height:12, backgroundColor: (penaltyList.length > index) ? 'white' : '#413c3c', borderRadius: 12, marginHorizontal: 10}}></View>
                ))}
              </View>
            } */}
            <TouchableOpacity
              activeOpacity={0.2}
              style={{
                width: "45%",
                padding: 10,
                backgroundColor: "#0f203e",
                borderWidth: 1,
                borderColor: "#29ccdc",
                borderRadius: 30,
                alignItems: "center",
                justifyContent: "center",
                opacity: ((isPenaltyAorB && penaltyList.length >= (subscribers.length - 1)) || !isPenaltyAorB) ? 1 : 0.2
              }}
              onPress={() => { startGamPenalty(true); }}
            >
              <Text style={{ color: "white", fontSize: 18 }}>ゲーム開始</Text>
            </TouchableOpacity>
          </View>
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
          {!penaltySetAvailable && (
            <View>
              <Text style={{ color: "white", fontSize: 15 }}>
                ホストが罰ゲームを設定しています ...
              </Text>
              <View>
                {!penaltySetAvailable
                  ? <ActivityIndicator size="large" color="#007AFF" />
                  : ""}
              </View>
            </View>
          )}

          {penaltySetAvailable && (
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
              {!penalty?.id ? (
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
                      好きな罰ゲームを設定してください。
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
                      handlePatternPlusBtnClick();
                    }}
                  >
                    <Icon name="add-sharp" size={25} color={"#5a6fff"} />
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
                      display: penaltySelected ? "flex" : "none",
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
                      opacity: penaltySelected ? 0.3 : 1,
                    }}
                  >
                    <TouchableOpacity
                      style={[styles.penaltyItemRow]}
                      onPress={() => handlePatternPlusBtnClick()}
                    >
                      <View style={styles.penaltyItemTitle}>
                        <Text
                          style={{
                            fontSize: 20,
                            color: "white",
                            display: "flex",
                          }}
                        >
                          {penalty?.title}
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
                      opacity: penaltySelected ? 0.3 : 1,
                    }}
                    onPress={handlePublicPattern}
                  >
                    <Text
                      style={{ fontSize: 20, color: "white", display: "flex" }}
                    >
                      決定
                    </Text>
                  </TouchableOpacity>

                  {penaltySelected && (
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
                          ? <ActivityIndicator size="large" color="#007AFF" />
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
        <TouchableWithoutFeedback onPress={() => setPenaltyPublicModalVisible(false)}>
          <View
            style={{
              flex: 1,
              justifyContent: "center",
              alignItems: "center",
              backgroundColor: "#000000e0",
            }}
          >
            <TouchableWithoutFeedback onPress={() => { }}>
              <View
                style={{
                  margin: 10,
                  justifyContent: "flex-start",
                  borderWidth: 1,
                  borderColor: isPatternASet ? "#5a6fff" : "#29ccdc",
                  borderRadius: 20,
                  width: "90%",
                  padding: 10,
                  backgroundColor: customColors.customDarkBlueBackground,
                  flex: 1,
                }}
              >
                <View
                  style={{
                    alignItems: "center",
                    padding: 10,
                  }}
                >
                  <Text
                    style={{ fontSize: 24, color: "white", textAlign: "center" }}
                  >
                    {isPatternASet
                      ? "「全員が罰ゲームを選ぶ」"
                      : "「共通の罰ゲームを選ぶ」"}
                  </Text>
                </View>
                <View
                  style={{
                    padding: isPatternASet ? 5 : 20,
                    paddingVertical: 20,
                    marginTop: 40,
                    borderWidth: 1,
                    borderRadius: 10,
                    borderColor: customColors.customLightBlue,
                    alignItems: "center",
                    backgroundColor: customColors.customDarkBlue,
                  }}
                >
                  <View
                    style={{
                      position: "absolute",
                      top: -18,
                      borderWidth: 0,
                      borderColor: customColors.customLightBlue,
                      borderRadius: 10,
                      backgroundColor: customColors.customDarkBlue,
                    }}
                  >
                    <Text
                      style={{
                        color: "white",
                        fontSize: 20,
                      }}
                    >
                      罰ゲーム
                    </Text>
                  </View>

                  {isPatternASet ? (
                    <FlatList
                      data={penaltyList}
                      renderItem={renderPenaltyPublicItem}
                      keyExtractor={(item, index) => index.toString()}
                    />
                  ) : (
                    <View
                      style={[
                        styles.penaltyItemRow,
                        { flexDirection: "row", marginVertical: 5, width: '100%', justifyContent: 'center' },
                      ]}
                    >
                      <View style={[styles.penaltyItemTitle, { alignItems: 'center', justifyContent: 'space-between' }]}>
                        <Text
                          style={{
                            fontSize: 20,
                            textAlign: 'center',
                            color: "white",
                            display: "flex",
                            paddingHorizontal: 10,
                          }}
                        >
                          {penalty?.title}
                        </Text>
                      </View>
                    </View>
                  )}
                </View>

                <View
                  style={{
                    padding: 20,
                    marginTop: 40,
                    borderWidth: 1,
                    borderRadius: 10,
                    borderColor: customColors.customLightBlue,
                    alignItems: "center",
                    backgroundColor: customColors.customDarkBlue,
                  }}
                >
                  <View
                    style={{
                      position: "absolute",
                      top: -18,
                      borderWidth: 0,
                      borderColor: customColors.customLightBlue,
                      borderRadius: 10,
                      backgroundColor: customColors.customDarkBlue,
                    }}
                  >
                    <Text
                      style={{
                        color: "white",
                        fontSize: 20,
                      }}
                    >
                      ゲーム方式
                    </Text>
                  </View>
                  {isSubPattern1 ? (
                    <View>
                      <Text style={{ color: "white", fontSize: 16 }}>
                        負けるたびに罰ゲームを実行する
                      </Text>
                    </View>
                  ) : (
                    ""
                  )}

                  {isSubPattern2 ? (
                    <View>
                      <Text style={{ color: "white", fontSize: 16 }}>
                        １ゲームが終了するごとに実行する
                      </Text>
                    </View>
                  ) : (
                    ""
                  )}

                  {isSubPattern3 && penaltyRunCount ? (
                    <View style={{}}>
                      <Text style={{ color: "white", fontSize: 16 }}>
                        ゲーム数を決めて負けが多い人が実行する
                      </Text>
                      <Text
                        style={{ padding: 10, color: "white", fontSize: 20, marginLeft: 10, textAlign: 'center' }}
                      >
                        {penaltyRunCount || ""} 回
                      </Text>
                    </View>
                  ) : (
                    ""
                  )}
                </View>
              </View>
            </TouchableWithoutFeedback>
          </View>
        </TouchableWithoutFeedback>
      </Modal>

      <ConfirmModal
        isVisible={exitModalVisible}
        setVisible={handleExitModalVisible}
        messageText={exitModalAlertText}
        confirmText="は い"
        cancelText="キャンセル"
        confirmBackgroundColor={customColors.blackRed}
        onConfirm={exitScreen}
        onCancel={() => { }}
      />
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
    fontFamily: "NotoSansJP_400Regular",
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

  penaltyddBtn: {
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

  switchToggleStyle: {
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
