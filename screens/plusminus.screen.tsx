import React, { useCallback, useEffect, useLayoutEffect, useRef, useState } from "react";
import { BackHandler, Dimensions, TextInput, TouchableOpacity, View } from "react-native";
import { Text } from "react-native-elements";
import { useDispatch, useSelector } from "react-redux";
import { RootState } from "../store";
import { useFocusEffect, useNavigation } from "@react-navigation/native";
import { deletePlusMinusFirestore, exitGameRoom, finishPlusMinusFirestore, getGamePenalty, getGameRoom, getPlusMinusFirestore, getPlusMinusScoresFirestore, setMoveGameRoom, setPlusMinusSubmitResultFirestore, setStartPlusMinusFirestore, startPlusMinusFirestore } from "../utils/firebase/FirebaseUtil";
import { setGameRoomInitial } from "../store/reducers/bingo/gameRoomSlice";
import { GameType, Player, PlusMinusResultType, UnsubscribeOnsnapCallbackFunction } from "../utils/Types";
import { generateRandomNumber, generateRandomNumber01, generateResultOptionValues } from "../utils/Utils";
import { customColors } from "../utils/Color";
import { setPenaltyInitial } from "../store/reducers/bingo/penaltySlice";
import * as Progress from 'react-native-progress';
import { styles } from "../utils/Styles";
import PlusMinusSettingModal from "../components/plusminus/PlusMinusSettingModal";
import PlusMinusValueButton from "../components/plusminus/PlusMinusValueButton";
import PlusMinusPenaltyTable from "../components/plusminus/PlusMinusPenaltyTable";
import ConfirmModal from "../components/ConfirmModal";
import Icon from "react-native-vector-icons/Ionicons";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Audio } from 'expo-av';

const { width: viewportWidth } = Dimensions.get("window");

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

  //host initial settings
  const [problemDelaySeconds, setProblemDelaySeconds] = useState<number>(10);
  const [isAllSameProblem, setIsAllSameProblem] = useState<boolean>(false);
  const [problemTypeInputOptionActive, setProblemTypeInputOptionActive] = useState<boolean>(false);
  const [problemTypeSelectOptionActive, setProblemTypeSelectOptionActive] = useState<boolean>(false); 

  //state variables by usestate
  const [started, setStarted] = useState<boolean>(false);
  const [finished, setFinished] = useState<boolean>(false);
  const [problemDelay, setProblemDelay] = useState<number>(10);
  const [clickDisable, setClickDisable] = useState<boolean>(false);
  const [allProblems, setAllProblems] = useState<any[]>([]);
  const [allProblemScoreResults, setAllProblemScoreResults] = useState<any[]>([]);
  const [scores, setScores] = useState<any[]>([]);
  const [penaltyResult, setPenaltyResult] = useState<any>(null);

  const [firstNum, setFirstNum] = useState<number>(0);
  const [secondNum, setSecondNum] = useState<number>(0);
  const [operator, setOperator] = useState<Operator>(Operator.plus);
  const [calResult, setCalResult] = useState<string>('');
  const [resultPattern, setResultPattern] = useState<ResultPattern>(ResultPattern.input);
  const [resultOptions, setResultOptions] = useState<number[]>([]);
  const [proNum, setProNum] = useState<number>(0);
  const [displayProNum, setDisplayProNum] = useState<number>(0);
  const [submited, setSubmited] = useState<boolean>(false);
  const submitedRef = useRef(submited);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const [progressRate, setProgressRate] = useState(0);

  const [subscribers, setSubscribers] = useState<Player[]>([]);

  const [exitModalVisible, setExitModalVisible] = useState<boolean>(false);
  const [waitModalVisible, setWaitModalVisible] = useState<boolean>(true);
  const [penaltyDisplayModalVisible, setPenaltyDisplayModalVisible] = useState<boolean>(false);
  const [penaltyButtonVisible, setPenaltyButtonVisible] = useState<boolean>(false);

  //pelanty variables
  const [penaltyAList, setPenaltyAList] = useState<any[]>([]);
  const [penaltyB, setPenaltyB] = useState<any>();
  const [isPatternASet, setIsPatternASet] = useState<boolean>(false);
  const [isPatternBSet, setIsPatternBSet] = useState<boolean>(false);
  const [isSubPattern1, setIsSubPattern1] = useState<boolean>(false);
  const [isSubPattern3, setIsSubPattern3] = useState<boolean>(false);
  const [penaltyRunCount, setPenaltyRunCount] = useState<number>(20);

  const insets = useSafeAreaInsets();

  const playSound = async () => {
      console.log('Loading Sound');

      try {
          const { sound } = await Audio.Sound.createAsync(require('../assets/media/music/penalty.mp3'));

          console.log('Playing Sound');
          await sound.playAsync();
      } catch (error) {
          console.log("this is failed.")
      }
  }

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
        const firestoreStarted: boolean = plusMinus?.started;
        console.log(firestoreStarted, "started");
        if (!firestoreStarted) {
          setStarted(false);
          return false;
        } else {
          console.log("modalvisible false")
          setWaitModalVisible(false);
          setStarted(true);
        }

        const firestoreFinished: boolean = plusMinus?.finished;
        if (firestoreFinished) {
          handleFinishedGame();
          return false;
        }

        if (!started) {
          // -- initial all state variables start --
          setClickDisable(false);
          setAllProblemScoreResults([]);
          setFirstNum(0);
          setSecondNum(0);
          setOperator(Operator.plus);
          setResultPattern(ResultPattern.input);
          setResultOptions([]);
          setScores([]);
          setPenaltyResult(null);
          setDisplayProNum(0);
          setSubmited(false);
          if(intervalRef.current) {
            clearInterval(intervalRef.current);
          }
          setProgressRate(0);
          setCalResult('');
          setExitModalVisible(false);
          setWaitModalVisible(false);
          setPenaltyDisplayModalVisible(false);
          setPenaltyButtonVisible(false);
          //-- end --

          const isAllSame: boolean = plusMinus?.isAllSame as boolean;
          const problemDelay: number = plusMinus?.problemDelay;
          const inputOption: boolean = plusMinus?.inputOption;
          const selectOption: boolean = plusMinus?.selectOption;

          let allProblems: any[] = [];
          if (isAllSame) {
            allProblems = plusMinus?.allProblems || [];
          } else {
            allProblems = generateAllProblems(penaltyRunCount, inputOption, selectOption);
          }

          setAllProblems(allProblems);
          setProblemDelay(problemDelay);
          setProNum(1);
        } else if (isHost) {
          const scores: any[] = plusMinus?.scores || [];
          if (scores.length == subscribers.length) {
            finishPlusMinusFirestore(gameRoomId);
          }
        }
      })

      return unsubscribe2;
    }, [subscribers, penaltyRunCount, started])
  )

  useEffect(() => {
    console.log(proNum, "useeffect"); 
    if (proNum > penaltyRunCount) {
      if (authUser.uid) {
        setPlusMinusSubmitResultFirestore(gameRoomId, authUser.uid, allProblemScoreResults);
      }

      return () => { };
    }

    if (proNum > 0 && proNum <= (allProblems.length)) {
      setClickDisable(false);

      displayNextProblem(proNum);
      setSubmited(false);
      setCalResult('');
      progressInterval();

      // Set new timer
      const newTimerId = setTimeout(() => {
        handleSubmitResult(true);
      }, problemDelay * 1000);


      return () => {
        clearTimeout(newTimerId); // Clear timer when component unmounts or effect reruns
      };
    }

  }, [proNum, allProblemScoreResults])

  const displayNextProblem = (proNum: number) => {
    const problem = allProblems[proNum - 1];

    if (problem) {
      const firstNum = problem?.firstNum;
      const secondNum = problem?.secondNum;
      const operator = problem?.operator;
      const resultPattern = problem?.resultPattern;
      const resultOptions = problem?.resultOptions;

      setFirstNum(firstNum);
      setSecondNum(secondNum);
      setOperator(operator);
      setResultPattern(resultPattern);
      setResultOptions(resultOptions);
      setDisplayProNum(proNum);
    }
  }

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
    };

    fetchGamePenaltyData();
  }, [gameRoomId]);

  useEffect(() => {
    const sort: string[] = currentGameRoom?.sort || [];
    const subscribers: Player[] = currentGameRoom?.subscribersPlayers || [];
    setSubscribers(subscribers);
  }, [JSON.stringify(currentGameRoom)]);

  useEffect(() => {
    submitedRef.current = submited;
  }, [submited]);

  const progressInterval = () => {
    setProgressRate(0);

    if (intervalRef.current) {
      clearInterval(intervalRef.current);
    }

    intervalRef.current = setInterval(() => {
      setProgressRate((prevProgress) => {
        const newProgress = prevProgress + (0.2 / problemDelay);
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

  useLayoutEffect(() => {
    navigation.setOptions({
      headerLeft: () => (
        <Icon name="chevron-back-sharp" size={30} color="white" style={{ marginRight: 20, marginLeft: -10 }} onPress={() => {
          setExitModalVisible(true);
        }} />
      ),
    })
  }, [navigation])

  /** ----------------------------- Functions ------------------------------ */
  const handleGameStart = (timingNumber: number, isAllSameProblem: boolean, problemTypeInputOptionActive: boolean, problemTypeSelectOptionActive: boolean) => {
    //initial settings
    setProblemDelay(timingNumber);
    setIsAllSameProblem(isAllSameProblem);
    setProblemTypeInputOptionActive(problemTypeInputOptionActive);
    setProblemTypeSelectOptionActive(problemTypeSelectOptionActive);

    let allProblems: any[] = [];
    if (isAllSameProblem) {
      allProblems = generateAllProblems(penaltyRunCount, problemTypeInputOptionActive, problemTypeSelectOptionActive);
    }

    startPlusMinusFirestore(gameRoomId, timingNumber, isAllSameProblem, problemTypeInputOptionActive, problemTypeSelectOptionActive, allProblems);
  }

  //Generate All Problems for problem count
  const generateAllProblems = (allProblemCount: number, inputOption: boolean, selectOption: boolean) => {
    const allProblems: any[] = [];
    for (let i = 0; i < allProblemCount; i++) {
      const problem = generateNewProblem(i + 1, inputOption, selectOption);
      allProblems.push(problem);
    }

    return allProblems;
  }

  //Generate One Problem
  const generateNewProblem = (proNum: number, inputOption: boolean, selectOption: boolean) => {
    const num1 = generateRandomNumber();
    const num2 = generateRandomNumber();
    const operator = generateRandomNumber01() == 1 ? Operator.plus : Operator.minus;

    const firstNum = (operator == Operator.minus) ? (num1 >= num2 ? num1 : num2) : num1;
    const secondNum = (operator == Operator.minus) ? (num1 >= num2 ? num2 : num1) : num2;

    let resultPattern = ResultPattern.input;

    if (inputOption && selectOption) {
      resultPattern = generateRandomNumber01() == 1 ? ResultPattern.input : ResultPattern.option;
    } else if (inputOption) {
      resultPattern = ResultPattern.input;
    } else if (selectOption) {
      resultPattern = ResultPattern.option;
    }

    const resultOptions = resultPattern == ResultPattern.input ? [] : generateResultOptionValues(firstNum, secondNum, operator);

    const newPro = {
      proNum: proNum,
      firstNum: firstNum,
      secondNum: secondNum,
      operator: operator,
      resultPattern: resultPattern,
      resultOptions: resultOptions,
    }

    return newPro;
  }

  //will be called by all user
  const handleSubmitResult = (auto: boolean, value?: number) => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
    }

    if (!submitedRef.current) {
      if (proNum > allProblems.length) {
        return false;
      }

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

      setClickDisable(true);

      const score = {
        proNum: proNum,
        score: resultValue
      }

      setProNum(prevProNum => prevProNum + 1);
      setAllProblemScoreResults(prevResults => [...prevResults, score]);
      setSubmited(true);
    }
  }

  const handleFinishedGame = async () => {
    console.log("all finished game.");
    const plusminusData = await getPlusMinusScoresFirestore(gameRoomId);
    const scores1: any[] = plusminusData?.scores || [];

    const sumScores: any[] = [];
    scores1.forEach((item, index) => {
      const uid = item?.uid || '';

      const player_score: any[] = item?.score || [];
      let sum_result = 0;
      let correctResult = 0;
      let wrongResult = 0;

      player_score.forEach(problem_score => {
        const result_value = problem_score?.score;
        if (result_value == 1) {
          sum_result++;
          correctResult++;
        } else {
          wrongResult++;
        }
      });

      const sumScoreOne = {
        index: index,
        uid: uid,
        sum_score: sum_result,
        correctResult: correctResult,
        wrongResult: wrongResult
      }

      sumScores.push(sumScoreOne);
    });

    console.log(sumScores);

    sumScores.sort((a, b) => {
      if (a.sum_score == b.sum_score) {
        return a.index - b.index;
      }
      return b.sum_score - a.sum_score;
    })

    const sortedScores = sumScores.map(({ index, ...item }) => item);

    const finalScores = sortedScores.map(score => {
      const subscriber = subscribers.find(sub => sub.uid === score.uid);
      return {
        uid: score.uid,
        displayName: subscriber?.displayName || '',
        score: score.sum_score,
        correctResult: score.correctResult + " 問",
        wrongResult: score.wrongResult + " 問"
      };
    });

    const firstUid = sortedScores[0]?.uid;
    const lastUid = sortedScores[sortedScores.length - 1]?.uid;
    const firstUser = subscribers.find(sub => sub.uid === firstUid);
    const lastUser = subscribers.find(sub => sub.uid === lastUid);

    let penaltyTitle = "";
    if (isPatternASet) {
      const penalty = penaltyAList.find(penaltyA => penaltyA.uid === firstUid);
      penaltyTitle = penalty?.penaltyTitle;
    } else if (isPatternBSet) {
      const penalty = penaltyB;
      penaltyTitle = penalty?.penaltyTitle;
    }

    const penaltyResult = {
      firstUser: firstUser,
      lastUser: lastUser,
      penaltyTitle: penaltyTitle
    }

    setPenaltyResult(penaltyResult);
    setScores(finalScores);
    setPenaltyDisplayModalVisible(true);
    setPenaltyButtonVisible(true);

    await playSound();
    await setStartPlusMinusFirestore(gameRoomId);
    setProNum(0);
  }

  //force quit even if the game is not over.
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

  //Control setting modal visible
  const handleWaitModalVisible = (isVisible: boolean) => {
    setWaitModalVisible(isVisible);
  }

  //control exit modal visible 
  const handleExitModalVisible = (isVisible: boolean) => {
    setExitModalVisible(isVisible);
  }

  const handlePenaltyDisplayModalVisible = (isVisible: boolean) => {
    setPenaltyDisplayModalVisible(isVisible);
  }

  const handleNextRound = () => {
    let allProblems: any[] = [];
    if (isAllSameProblem) {
      allProblems = generateAllProblems(penaltyRunCount, problemTypeInputOptionActive, problemTypeSelectOptionActive);
    }

    startPlusMinusFirestore(gameRoomId, problemDelay, isAllSameProblem, problemTypeInputOptionActive, problemTypeSelectOptionActive, allProblems);
  }

  return (
    <View style={[styles.container, { paddingBottom: insets.bottom }]}>
      <View
        style={{
          width: "97%",
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
        }}>
          <View
            style={{
              display: clickDisable ? "flex" : "none",
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

          <View
            style={{
              display: penaltyButtonVisible ? "flex" : "none",
              backgroundColor: '#000000a1',
              // flex: 1,
              justifyContent: 'center',
              alignItems: 'center', 
              position: "absolute",
              top: 0,
              bottom: 0,
              left: 0,
              right: 0,
              zIndex: 10,
            }}
          >
            <View>
              <TouchableOpacity
                activeOpacity={0.8}
                style={[styles.button, { alignItems: 'center'}]}
                onPress={() => setPenaltyDisplayModalVisible(true)}
              >
                <Text style={[styles.textTitle, { fontSize: 20 }]}>罰ゲーム現実</Text>
              </TouchableOpacity>
            </View>
          </View>

          <View>
            <Text style={{ color: 'white', fontSize: 20, fontWeight: '500' }}>
              {displayProNum}問目
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
      </View>

      <ConfirmModal
        isVisible={exitModalVisible}
        setVisible={handleExitModalVisible}
        messageText={isHost
          ? "足し算引き算ゲームをやめますか?"
          : "プレイルームから脱退しますか？"}
        confirmText="は い"
        cancelText="キャンセル"
        onConfirm={exitGame}
        onCancel={() => { }}
        confirmBackgroundColor={customColors.blackRed}
      />

      <PlusMinusSettingModal isHost={isHost} isVisible={waitModalVisible} setVisible={handleWaitModalVisible} setExitVisible={handleExitModalVisible} handleGameStart={handleGameStart} />

      <PlusMinusPenaltyTable isVisible={penaltyDisplayModalVisible} setVisible={handlePenaltyDisplayModalVisible} setExitVisible={handleExitModalVisible} scores={scores} penaltyResult={penaltyResult} handleNextRound={handleNextRound} />
    </View>
  );
}

export default PlusMinusScreen;