import React, { useCallback, useEffect, useRef, useState } from "react";
import { BackHandler, Dimensions, Modal, StyleSheet, TextInput, TouchableOpacity, View } from "react-native";
import { Text } from "react-native-elements";
import { useDispatch, useSelector } from "react-redux";
import { RootState } from "../store";
import { useFocusEffect, useNavigation } from "@react-navigation/native";
import { deletePlusMinusFirestore, exitGameRoom, getGamePenalty, getGameRoom, getPlusMinusFirestore, setMoveGameRoom, setPlusMinusNewProblemFirestore, setPlusMinusSubmitResultFirestore, startPlusMinusFirestore } from "../utils/firebase/FirebaseUtil";
import { setGameRoomInitial } from "../store/reducers/bingo/gameRoomSlice";
import { GameType, Player, PlusMinusCurrentProblem, PlusMinusResultType, UnsubscribeOnsnapCallbackFunction } from "../utils/Types";
import { generateRandomNumber, generateRandomNumber01, generateResultOptionValues } from "../utils/Utils";
import { first, result } from "lodash";
import { customColors } from "../utils/Color";
import { setPenaltyInitial } from "../store/reducers/bingo/penaltySlice";
import * as Progress from 'react-native-progress';
import InputSpinner from "react-native-input-spinner";
import { styles } from "../utils/Styles";
import PlusMinusSettingModal from "../components/plusminus/PlusMinusSettingModal";
import PlusMinusValueButton from "../components/plusminus/PlusMinusValueButton";

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
  const [resultOptions, setResultOptions] = useState<number[]>([]);

  const [timing, setTiming] = useState<number>(10);
  const [autoNextProblemActive, setAutoNextProblemActive] = useState<boolean>(false);
  const [problemTypeOptionActive, setProblemTypeOptionActive] = useState<boolean>(false);

  const [nextProblemButtonDisplay, setNextProblemButtonDisplay] = useState<boolean>(false);
  const [problemScoreStyle, setProblemScoreStyle] = useState<any>(null);

  const [proNum, setProNum] = useState<number>(0);
  const [currentProblemScores, setCurrentProblemScores] = useState<PlusMinusResultType[]>([]);
  const [submited, setSubmited] = useState<boolean>(false);
  const submitedRef = useRef(submited);

  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const [progressRate, setProgressRate] = useState(0);

  const [calResult, setCalResult] = useState<string>('');

  const [sort, setSort] = useState<string[]>([]);
  const [subscribers, setSubscribers] = useState<Player[]>([]);

  const [exitModalVisible, setExitModalVisible] = useState<boolean>(false);
  const [waitModalVisible, setWaitModalVisible] = useState<boolean>(true);

  //pelanty variables
  const [penaltyAList, setPenaltyAList] = useState<any[]>([]);
  const [penaltyB, setPenaltyB] = useState<any>();
  const [isPatternASet, setIsPatternASet] = useState<boolean>(false);
  const [isPatternBSet, setIsPatternBSet] = useState<boolean>(false);
  const [isSubPattern1, setIsSubPattern1] = useState<boolean>(false);
  const [isSubPattern3, setIsSubPattern3] = useState<boolean>(false);
  const [penaltyRunCount, setPenaltyRunCount] = useState<number>(20);

  /** ------------------------------useEffect functions------------------------------------  */
  //gameRoom monitoring
  useFocusEffect(
    useCallback(() => {
      const unsubscribe1: UnsubscribeOnsnapCallbackFunction = getGameRoom(gameRoomId, (gameRoom: any) => {
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

      return unsubscribe1;
    }, [])
  )

  //realtime monitoring for plusminus 
  useFocusEffect(
    useCallback(() => {
      const unsubscribe2: UnsubscribeOnsnapCallbackFunction = getPlusMinusFirestore(gameRoomId, (plusMinus: any) => {
        const proNum = plusMinus?.proNum as number;
        if (proNum) {
          setWaitModalVisible(false);
        }

        const currentProblem: PlusMinusCurrentProblem = plusMinus?.currentProblem || null;
        const firstNum = currentProblem?.firstNum;
        const secondNum = currentProblem?.secondNum;
        const operator: Operator = currentProblem?.operator;
        const resultPattern: ResultPattern = currentProblem?.resultPattern;
        const resultOptions: number[] = currentProblem?.resultOptions;
        const currentProblemScores: PlusMinusResultType[] = plusMinus?.currentProblemScores || [];

        setFirstNum(firstNum);
        setSecondNum(secondNum);
        setOperator(operator);
        setResultPattern(resultPattern);
        setResultOptions(resultOptions);
        setProNum(proNum);
        setCurrentProblemScores(currentProblemScores);
        console.log("unsubscribe:", proNum)

        if (isHost && subscribers.length == currentProblemScores.length) {
          if(isHost) {
            if (proNum >= penaltyRunCount) {
              handleFinishedGame();
            } else {
              if (autoNextProblemActive) {
                setNextProblemButtonDisplay(false);
                handleNextProblem(proNum);
              } else {
                setNextProblemButtonDisplay(true);
              }
            }
          } else {
            // setNextProblemButtonDisplay(true);
          }         
        }
      })

      return unsubscribe2;
    }, [subscribers, penaltyRunCount])
  )

  // //get penalty 
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
    // if (isHost) {
    //   startPlusMinusFirestore(gameRoomId);
    //   handleNextProblem(0);
    // }
  }, [])

  useEffect(() => {
    submitedRef.current = submited;
  }, [submited]);

  useEffect(() => {
    setProblemScoreStyle({ borderColor: '', borderWidth: 0 });

    if (proNum > 0) {
      setSubmited(false);
      setCalResult('');
      progressInterval();
      setNextProblemButtonDisplay(false);

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
  const handleGameStart = (timingNumber: number, autoNextProblemActive: boolean, problemTypeOptionActive: boolean) => {
    setTiming(timingNumber);
    setAutoNextProblemActive(autoNextProblemActive);
    setProblemTypeOptionActive(problemTypeOptionActive);

    console.log(timingNumber, autoNextProblemActive, problemTypeOptionActive);

    startPlusMinusFirestore(gameRoomId);
    handleNextProblem(0);
  }

  //only host
  const handleNextProblem = (proNum: number) => {
    createNewProblemByRandom(proNum);
  }

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

  //will be called by all user
  const handleSubmitResult = (auto: boolean, value?: number) => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
    }

    if (!submitedRef.current) {
      let x = 0;
      let resultValue = 0;

      if (operator == Operator.plus) {
        x = firstNum + secondNum
      } else {
        x = firstNum - secondNum
      }

      if (value) {
        if (value == x) {
          resultValue = 1;
        }
      } else if (!auto) {
        if (parseInt(calResult, 10) == x) {
          resultValue = 1;
        }
      }

      if (resultValue == 1) {
        const style = {
          borderColor: customColors.customLightBlue1,
          borderWidth: 2
        }

        setProblemScoreStyle(style);
      } else {
        const style = {
          borderColor: customColors.blackRed,
          borderWidth: 2
        }

        setProblemScoreStyle(style)
      }

      const uid = authUser.uid;
      if (uid) {
        setPlusMinusSubmitResultFirestore(gameRoomId, uid, resultValue);
      }
      setSubmited(true);
    }
  }

  const handleFinishedGame = () => {
    console.log("game finished")
  }

  const progressInterval = () => {
    setProgressRate(0);

    if (intervalRef.current) {
      clearInterval(intervalRef.current);
    }

    intervalRef.current = setInterval(() => {
      setProgressRate((prevProgress) => {
        const newProgress = prevProgress + (0.2 / timing);
        if (newProgress >= 1) {
          if (intervalRef.current) {
            clearInterval(intervalRef.current);
          }

          return 1;
        }
        return newProgress;
      });
    }, 200);

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    }
  }

  const exitGame = () => {
    if (isHost) {
      deletePlusMinusFirestore(gameRoomId);
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
          // padding: 10,
          borderRadius: 20,
          backgroundColor: customColors.customDarkBlueBackground,
          alignItems: "center",
          justifyContent: "space-evenly",
          flex: 1,
        }}
      >
        <View style={{
          width: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: "space-evenly",
          flex: 1,
          borderRadius: 10,
          borderColor: problemScoreStyle?.borderColor || '#00000000',
          borderWidth: problemScoreStyle?.borderWidth || 0
        }}>
          <View
            style={{
              display: problemScoreStyle?.borderWidth ? "flex" : "none",
              backgroundColor: '#0000004a',
              flex: 1,
              position: "absolute",
              top: 0,
              bottom: 0,
              left: 0,
              right: 0,
              zIndex: 10,
            }}
          ></View>
          <View>
            <Text style={{ color: 'white', fontSize: 20, fontWeight: '500' }}>
              問題番号{proNum}
            </Text>
          </View>
          <Progress.Bar progress={progressRate} width={viewportWidth - 25} height={5} style={{ position: 'absolute', top: 10 }} />
          <View>
            <View style={{ flexDirection: "row", justifyContent: 'space-between', width: '100%', paddingHorizontal: 10 }}>
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
          {resultPattern == ResultPattern.input ? (
            <View>
              <TouchableOpacity
                style={styles.button}
                onPress={() => handleSubmitResult(false)}
              >
                <Text style={styles.textTitle}>決定</Text>
              </TouchableOpacity>
            </View>
          ) : (
            <View style={{ display: 'flex', flexDirection: 'row', justifyContent: 'space-around', alignItems: 'center', width: '100%' }}>
              {
                resultOptions?.map((option, index) => {
                  return <PlusMinusValueButton key={index} value={option} onButtonClick={handleSubmitResult} />
                })
              }
            </View>
          )}
        </View>


        {(isHost && nextProblemButtonDisplay) && (
          <View style={{ marginVertical: 20 }}>
            <TouchableOpacity
              style={styles.button}
              onPress={() => { handleNextProblem(proNum);  }}
            >
              <Text style={styles.textTitle}>次の問題</Text>
            </TouchableOpacity>
          </View>
        )}

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

      <PlusMinusSettingModal isHost={isHost} visible={waitModalVisible} handleGameStart={handleGameStart} />
    </View>
  );
}

export default PlusMinusScreen;