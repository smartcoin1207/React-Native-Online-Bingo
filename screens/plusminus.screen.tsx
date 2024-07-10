import React, { useCallback, useEffect, useRef, useState } from "react";
import { BackHandler, Dimensions, Modal, StyleSheet, TextInput, TouchableOpacity, View } from "react-native";
import { Text } from "react-native-elements";
import { useDispatch, useSelector } from "react-redux";
import { RootState } from "../store";
import { useFocusEffect, useNavigation } from "@react-navigation/native";
import { exitGameRoom, getGamePenalty, getGameRoom, getPlusMinusFirestore, setMoveGameRoom, setPlusMinusNewProblemFirestore, setPlusMinusSubmitResultFirestore, startPlusMinusFirestore } from "../utils/firebase/FirebaseUtil";
import { setGameRoomInitial } from "../store/reducers/bingo/gameRoomSlice";
import { GameType, Player, PlusMinusResultType, UnsubscribeOnsnapCallbackFunction } from "../utils/Types";
import { generateRandomNumber, generateRandomNumber01 } from "../utils/Utils";
import { first, result } from "lodash";
import { customColors } from "../utils/Color";
import { setPenaltyInitial } from "../store/reducers/bingo/penaltySlice";
import * as Progress from 'react-native-progress';
import InputSpinner from "react-native-input-spinner";

const { width: viewportWidth, height: viewportHeight } = Dimensions.get("window");

enum Operator {
  plus = "+",
  minus = "-",
}

enum ResultPattern {
  input = 'input',
  option = 'option'
}

const PlusMinusScreen: React.FC = () => {
  const dispatch = useDispatch();
  const navigation = useNavigation();

  //selector from redux
  const authUser = useSelector((state: RootState) => state.auth.authUser);
  const isHost = useSelector((state: RootState) => state.gameRoom.isHost);
  const gameRoomId = useSelector(
    (state: RootState) => state.gameRoom.gameRoomId
  );
  const currentGameRoom = useSelector(
    (state: RootState) => state.gameRoom.currentGameRoom
  );

  //state variables by usestate
  const [firstNum, setFirstNum] = useState<number>(0);
  const [secondNum, setSecondNum] = useState<number>(0);
  const [operator, setOperator] = useState<Operator>(Operator.plus);
  const [resultPattern, setResultPattern] = useState<ResultPattern>(ResultPattern.input);
  const [totalProNum, setTotalProNum] = useState<number>(0);
  const [timing, setTiming] = useState<number>(5); // limit time by second
  const [proNum, setProNum] = useState<number>(0);
  const [currentProblemResult, setCurrentProblemResult] = useState<PlusMinusResultType[]>([]);
  const [submited, setSubmited] = useState<boolean>(false);
  const submitedRef = useRef(submited);

  const [calResult, setCalResult] = useState<string>('');

  const [sort, setSort] = useState<string[]>([]);
  const [subscribers, setSubscribers] = useState<Player[]>([]);

  const [exitModalVisible, setExitModalVisible] = useState<boolean>(false);
  const [progressRate, setProgressRate] = useState(0);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  const [penaltyAList, setPenaltyAList] = useState<any[]>([]);
  const [penaltyB, setPenaltyB] = useState<any>();
  const [isPatternASet, setIsPatternASet] = useState<boolean>(false);
  const [isPatternBSet, setIsPatternBSet] = useState<boolean>(false);
  const [isSubPattern1, setIsSubPattern1] = useState<boolean>(false);
  const [isSubPattern3, setIsSubPattern3] = useState<boolean>(false);
  const [penaltyRunCount, setPenaltyRunCount] = useState<number>(1);

  /** ------------------------------useEffect functions------------------------------------  */
  //gameRoom monitoring
  useFocusEffect(
    useCallback(() => {
      const unsubscribe: UnsubscribeOnsnapCallbackFunction = getGameRoom(gameRoomId, (gameRoom: any) => {
        if (!gameRoom) {
          dispatch(setGameRoomInitial(null));
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
            navigation.navigate('gameRoomList');
            return false;
          }
        }

        if (gameRoom?.gameType == GameType.Room && !isHost) {
          navigation.navigate("currentRoom", { isHostParam: isHost, gameRoomIdParam: gameRoomId });
        }
      })

      return unsubscribe;
    }, [])
  )

  //realtime monitoring for plusminus 
  useFocusEffect(
    useCallback(() => {
      const unsubscribe: UnsubscribeOnsnapCallbackFunction = getPlusMinusFirestore(gameRoomId, (plusMinus: any) => {
        const firstNum = plusMinus?.firstNum;
        const secondNum = plusMinus?.secondNum;
        const operator = plusMinus?.operator;
        const resultPattern = plusMinus?.resultPattern;
        const proNum1 = plusMinus?.proNum;
        const problemResult: PlusMinusResultType[] = plusMinus?.problemResult || [];

        setFirstNum(firstNum);
        setSecondNum(secondNum);
        setOperator(operator);
        setResultPattern(resultPattern);
        setProNum(proNum1);
        setCurrentProblemResult(problemResult);
        console.log("unsubscribe:", proNum1)

        if (isHost && subscribers.length == problemResult.length) {
          if (proNum1 >= penaltyRunCount) {
            handleFinishedGame();
          } else {
            handleNextProblem(proNum1);
          }
        }
      })

      return unsubscribe;
    }, [subscribers, penaltyRunCount])
  )

  //get penalty 
  useEffect(() => {
    const fetchGamePenaltyData = async () => {
      const gamePenaltyData = await getGamePenalty(gameRoomId);

      if (gamePenaltyData) {
        setPenaltyRunCount(gamePenaltyData?.penaltyRunCount as number || 1);
        setPenaltyAList(gamePenaltyData?.patternAList || []);
        setPenaltyB(gamePenaltyData?.penaltyB);
        setIsPatternASet(gamePenaltyData?.patternASet);
        setIsPatternBSet(gamePenaltyData?.patternBSet);
        setIsSubPattern1(gamePenaltyData?.subPattern1);
        setIsSubPattern3(gamePenaltyData?.subPattern3);
      }

      // Handle the game penalty data as needed
    };

    fetchGamePenaltyData();
  }, [gameRoomId]);

  useEffect(() => {
    const sort: string[] = currentGameRoom?.sort || [];
    setSort(sort);

    const subscribers: Player[] = currentGameRoom?.subscribersPlayers || [];
    setSubscribers(subscribers);
  }, [JSON.stringify(currentGameRoom)]);

  useEffect(() => {
    if (isHost) {
      startPlusMinusFirestore(gameRoomId);
      handleNextProblem(0);
    }
  }, [])

  useEffect(() => {
    submitedRef.current = submited;
  }, [submited]);

  useEffect(() => {
    if (proNum > 0) {
      setSubmited(false);
      setCalResult('');
      progressInterval();

      // Set new timer
      const newTimerId = setTimeout(() => {
        handleSubmitResult(true);
      }, timing * 1000);

      return () => {
        clearTimeout(newTimerId); // Clear timer when component unmounts or effect reruns
      };
    }
  }, [proNum])

  useFocusEffect(
    useCallback(() => {
      const onBackPress = () => {
        setExitModalVisible(true);
        return true; // Indicate that the back press is handled
      };

      BackHandler.addEventListener('hardwareBackPress', onBackPress);

      return () => {
        BackHandler.removeEventListener('hardwareBackPress', onBackPress);
      };
    }, [navigation])
  )

  /** ----------------------------- Functions ------------------------------ */
  // const 
  const generateResultOptionValues = (num1: number, num2: number, operator: Operator) => {
    // Calculate the correct result
    let correctResult;
    if (operator === '+') {
      correctResult = num1 + num2;
    } else {
      correctResult = num1 - num2;
    }

    // Generate two similar incorrect results
    const incorrectResult1_temp = correctResult + Math.floor(Math.random() * 10) - 5; // Close to correct result
    const incorrectResult1 = incorrectResult1_temp == correctResult ? correctResult + 1 : incorrectResult1_temp;

    const incorrectResult2_temp = correctResult + Math.floor(Math.random() * 10) - 5; // Close to correct result
    const incorrectResult2 = (incorrectResult2_temp == correctResult || incorrectResult2_temp == incorrectResult1) ? correctResult + 1 : incorrectResult2_temp;

    // Shuffle the result values
    const resultValues = [correctResult, incorrectResult1, incorrectResult2].sort(() => Math.random() - 0.5);

    return resultValues;
  };

  //only host
  const createNewProblemByRandom = (proNum_: number) => {
    const num1 = generateRandomNumber();
    const num2 = generateRandomNumber();
    const number01 = generateRandomNumber01();
    const operator = number01 == 1 ? Operator.plus : Operator.minus;

    const number_01_1 = generateRandomNumber01();
    const resultPattern = number_01_1 == 1 ? ResultPattern.input : ResultPattern.option;
    const resultOptions = resultPattern == 'input' ? [] : generateResultOptionValues(num1, num2, operator);
    console.log("-----> :", gameRoomId, num1, num2, operator, resultPattern, proNum_ + 1, resultOptions);
    setPlusMinusNewProblemFirestore(gameRoomId, num1, num2, operator, resultPattern, proNum_ + 1, resultOptions);
  }

  //only host
  const handleNextProblem = (proNum_: number) => {
    createNewProblemByRandom(proNum_);
  }

  //will be called by all user
  const handleSubmitResult = (auto: boolean) => {
    const currentDate = new Date();
    const hours = currentDate.getHours();
    const minutes = currentDate.getMinutes();
    const seconds = currentDate.getSeconds();
    const formattedTime = `${hours}:${minutes}:${seconds}`;

    if (!submitedRef.current) {
      let x = 0;
      let resultValue = 0;

      if (!auto) {
        if (operator == Operator.plus) {
          x = firstNum + secondNum
        } else {
          x = firstNum - secondNum
        }

        if (parseInt(calResult, 10) == x) {
          resultValue = 1
        }
      }

      const uid = authUser.uid;
      if (uid) {
        setPlusMinusSubmitResultFirestore(gameRoomId, uid, resultValue);
      }
      setSubmited(true);
    }
  }

  const handleFinishedGame = () => {

  }

  const progressInterval = () => {
    setProgressRate(0);

    if(intervalRef.current) {
      clearInterval(intervalRef.current);
    }

    intervalRef.current = setInterval(() => {
      setProgressRate((prevProgress) => {
        const newProgress = prevProgress + (0.2 / timing);
        if (newProgress >= 1) {
          if(intervalRef.current) {
            clearInterval(intervalRef.current);
          }

          return 1;
        }
        return newProgress;
      });
    }, 200);

    return () => {
      if(intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    }
  }

  const exitGame = () => {
    if (isHost) {
      setMoveGameRoom(gameRoomId, GameType.Room);
      dispatch(setPenaltyInitial(null));
      navigation.navigate("currentRoom", { isHostParam: isHost, gameRoomIdParam: gameRoomId });
    } else {
      dispatch(setGameRoomInitial(null));
      if (authUser.uid) {
        exitGameRoom(authUser.uid, gameRoomId, false);
      }

      navigation.navigate("gameRoomList");
    }
  }

  return (
    <View style={[styles.container]}>
      <View
        style={{
          backgroundColor: "black",
          width: "60%",
          padding: 15,
          borderRadius: 20,
          alignItems: "center",
        }}
      >
        <Text style={{ fontSize: 30, color: "white" }} numberOfLines={1}>
          足し算引き算
        </Text>
      </View>
      <View
        style={{
          width: "97%",
          padding: 10,
          borderRadius: 20,
          backgroundColor: customColors.customDarkBlueBackground,
          alignItems: "center",
          justifyContent: "space-evenly",
          flex: 1,
        }}
      >
        <Progress.Bar progress={progressRate} width={viewportWidth - 20} style={{ position: 'absolute', top: 10 }} />
        <View>
          <View style={{ flexDirection: "row", justifyContent: 'space-around', width: '100%' }}>
            <View
              style={{
                borderColor: "white",
                borderWidth: 1,
                borderRadius: 40,
                width: 80,
                height: 80,
                justifyContent: 'center'
              }}
            >
              <Text style={[styles.numberText]}>{firstNum}</Text>
            </View>
            <View
              style={{
                justifyContent: 'center'
              }}
            >
              <Text style={[styles.numberText, { fontSize: 40 }]}>{operator}</Text>
            </View>
            <View
              style={{
                borderColor: "white",
                borderWidth: 1,
                borderRadius: 40,
                width: 80,
                height: 80,
                justifyContent: 'center'
              }}
            >
              <Text style={styles.numberText}>{secondNum}</Text>
            </View>
            <View
              style={{
                justifyContent: 'center'
              }}
            >
              <Text style={[styles.numberText, { fontSize: 40 }]}>=</Text>
            </View>
            <View
              style={{
                borderColor: "white",
                borderWidth: 1,
                borderRadius: 40,
                width: 80,
                height: 80,
                justifyContent: 'center'
              }}
            >
              <TextInput
                style={styles.input}
                placeholderTextColor={customColors.blackGrey}
                value={calResult}
                onChangeText={(text) => {
                  setCalResult(text);
                }}
                keyboardType="numeric"
              />
            </View>
          </View>
        </View>

        <View>
          <TouchableOpacity
            style={styles.button}
            onPress={() => handleSubmitResult(false)}
          >
            <Text style={styles.textTitle}>決定</Text>
          </TouchableOpacity>
        </View>
      </View>

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
            <Text style={styles.modalText}>
              {isHost
                ? "足し算引き算ゲームをやめますか?"
                : "プレイルームから脱退しますか？"}
            </Text>

            <View style={styles.roomModalBtns}>
              <TouchableOpacity
                style={styles.modalCancelBtn}
                onPress={() => setExitModalVisible(false)}
              >
                <Text style={styles.modalOkText}> キャンセル </Text>
              </TouchableOpacity>

              <TouchableOpacity style={styles.modalOkBtn} onPress={exitGame}>
                <Text style={styles.modalOkText}> は い </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: customColors.black,
    paddingTop: 35,
    width: "100%",
  },

  profile: {
    justifyContent: "center",
    textAlign: "center",
    alignItems: "center",
    backgroundColor: "black",
    borderRadius: 20,
    padding: 10,
    paddingHorizontal: 20,
  },

  button: {
    backgroundColor: customColors.customDarkBlue1,
    paddingVertical: 10,
    paddingHorizontal: 20,
    marginHorizontal: 4,
    borderRadius: 30,
    borderWidth: 0.8,
    borderColor: customColors.customLightBlue1,
  },

  textTitle: {
    fontSize: 25,
    color: customColors.white,
    fontFamily: "serif",
    fontWeight: "700",
    textAlign: "center",
    letterSpacing: 10
  },

  playerItem: {
    display: "flex",
    position: "relative",
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    width: "100%",
    marginVertical: 3,
    padding: 10,
    paddingHorizontal: 10,
    backgroundColor: customColors.customDarkBlue,
    borderWidth: 0.8,
    borderColor: customColors.customDarkGreen1,
    borderRadius: 10,
  },

  nameTitle: {
    color: customColors.white,
    fontSize: 20,
  },

  ItemStatus: {
    fontSize: 15,
    color: customColors.white,
  },

  joinBtn: {
    display: "flex",
    backgroundColor: customColors.customLightBlue,
    padding: 6,
    marginVertical: 4,
    borderRadius: 6,
  },

  joinBtnText: {
    fontSize: 16,
    color: customColors.white,
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
    borderColor: customColors.customLightBlue1,
    borderRadius: 20,
    backgroundColor: customColors.customDarkBlueBackground,
    alignItems: "center",
    paddingTop: 30,
    paddingBottom: 5,
    paddingHorizontal: 6,
    marginTop: 30,
    width: "96%",
  },

  divider: {
    borderBottomColor: customColors.blackGrey,
    borderBottomWidth: 1,
    marginVertical: 10,
    width: "100%",
  },
  modalBody: {
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: customColors.modalContainerBackgroundColor,
    paddingHorizontal: 15,
    paddingVertical: 50,
    borderWidth: 1,
    borderColor: customColors.blackGrey,
    borderRadius: 20,
    width: "80%",
  },
  modalRoomTitleText: {
    fontSize: 22,
    color: customColors.white,
    fontFamily: "serif",
    fontWeight: "700",
    textAlign: "center",
    marginBottom: 20,
  },
  modalOkBtn: {
    backgroundColor: customColors.customLightBlue,
    paddingVertical: 8,
    paddingHorizontal: 6,
    padding: 4,
    marginHorizontal: 4,
    marginVertical: 4,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: customColors.white,
  },
  modalCancelBtn: {
    backgroundColor: customColors.blackGrey,
    paddingVertical: 8,
    paddingHorizontal: 6,
    padding: 4,
    marginHorizontal: 4,
    marginVertical: 4,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: customColors.white,
  },
  roomModalButtonText: {
    fontSize: 16,
    color: customColors.white,
    fontFamily: "serif",
    fontWeight: "700",
    textAlign: "center",
  },
  completedText: {
    fontSize: 30,
    color: customColors.white,
    width: "90%",
    fontFamily: "serif",
    fontWeight: "700",
    textAlign: "center",
  },
  roomModalBtns: {
    flexDirection: "row",
    width: "80%",
    justifyContent: "space-between",
  },
  input: {
    fontSize: 30,
    color: customColors.white,
    fontWeight: '700',
    width: 80,
    height: 80,
    textAlign: 'center'
  },
  modalText: {
    fontSize: 16,
    color: customColors.white,
    fontFamily: "serif",
    alignItems: "flex-start",
    marginBottom: 5,
  },
  errText: {
    color: customColors.blackRed,
    fontSize: 16,
  },
  tooltipText: {
    fontSize: 14,
    color: 'white',
  },

  modalOkText: {
    fontSize: 16,
    color: "white",
    fontFamily: "serif",
    fontWeight: "700",
    textAlign: "center",
  },
  numberText: {
    fontSize: 30,
    color: 'white',
    textAlign: 'center',
    fontWeight: '700'
  }
});

export default PlusMinusScreen;