import React, { useEffect, useState } from "react";
import {
  StyleSheet,
  Text,
  View,
  BackHandler,
  Modal,
  ActivityIndicator,
  TouchableWithoutFeedback,
  Dimensions,
  TouchableOpacity,
  Image
} from "react-native";
import Icon from 'react-native-vector-icons/FontAwesome';

import { useDispatch, useSelector } from "react-redux";
import {
  setBingoCellStatus,
  setBingoInfo,
  setBingoInitial,
  setBingoNextNumber,
} from "../store/reducers/bingo/bingoSlice";
import {
  bingoCellStatusInit,
  bingoCheck,
  createBingoCard,
} from "../components/BingoEngine";
import _ from "lodash";
import { RootState } from "../store";

import {
  getBingo,
  setNextTurnPlayer,
  setBingoNextNumberUpdate,
  setPlayerGameSort,
  setBingoCompletedPlayer,
} from "../utils/firebase/FirebaseUtil";
import { Player } from "../utils/Types";
import { useNavigation } from "@react-navigation/native";
import { customColors } from "../utils/Color";
// import { AnimatedCell } from "./AnimatedCell";

const { width: viewportWidth, height: viewportHeight } =
  Dimensions.get("window");

const PlayBoard: React.FC = () => {
  const screenWidth = Dimensions.get("window").width;
  const cellSize = (screenWidth * 0.9) / 5;

  const [modalSortVisible, setModalSortVisible] = useState(false);
  const [modalCompletedVisible, setModalCompletedVisible] = useState(false);

  const [modalAlertText, setModalAlertText] = useState("");
  const [turnText, setTurnText] = useState<string>("");
  const [cellStatus, setCellStatus] = React.useState<number[][]>(
    bingoCellStatusInit()
  );
  const [completed, setCompleted] = useState<boolean>(false);
  const [turnPlayerId, setTurnPlayerId] = useState<string>("");
  const [bingoCompleted, setBingoCompleted] = useState<string[]>([]);
  const [bingoCompletedNumber, setBingoCompletedNumber] = useState<string>('');
  const [bingoNewCompleted, setBingoNewCompleted] = useState<string[]>([]);
  const [bingoCompletedMessages, setBingoCompletedMessages] = useState<string[]>([]);
  
  //bingo selected
  const [selectedCellRow, setSelectedCellRow] = useState<number>(0);
  const [selectedCellColumn, setSelectedCellColumn] = useState<number>(0);
  const [selectedCellValue, setSelectedCellValue] = useState<string>("");

  const authUser = useSelector((state: RootState) => state.auth.authUser);
  const gameRoomId = useSelector((state: RootState) => state.bingo.gameRoomId);
  const isHost = useSelector((state: RootState) => state.bingo.isHost);
  const bingoCellValue = useSelector(
    (state: RootState) => state.bingo.bingoCellValue
  );
  const bingoCellStatus = useSelector(
    (state: RootState) => state.bingo.bingoCellStatus
  );
  const sort = useSelector((state: RootState) => state.bingo.sort);

  const bingoNextNumber = useSelector(
    (state: RootState) => state.bingo.bingoNextNumber
  );
  const bingoPrevNumber = useSelector(
    (state: RootState) => state.bingo.bingoPrevNumber
  );

  const currentGameRoom = useSelector(
    (state: RootState) => state.gameRoom.currentGameRoom
  );
  const turnNumber = useSelector((state: RootState) => state.bingo.turnNumber);

  const bingoMyTurn = useSelector(
    (state: RootState) => state.bingo.bingoMyTurn
  );
  const dispatch = useDispatch();

  //退会時にビンゴゲームを初期化...
  useEffect(() => {
    const backAction = () => {
      dispatch(setBingoInitial({}));
      return false;
    };
    const backHandler = BackHandler.addEventListener(
      "hardwareBackPress",
      backAction
    );

    return () => backHandler.remove(); // Clean up the event listener
  }, []);

  //ゲーム開始時にプレイヤーの順番を決める...
  useEffect(() => {
    if (isHost) {
      setModalAlertText("順番を決めてください。");
    } else {
      setModalAlertText("順番を決めています。");
    }
    setModalSortVisible(true);
  }, []);

  //
  useEffect(() => {
    setCellStatus(bingoCellStatus);
  }, [bingoCellStatus]);

  useEffect(() => {
    if (!bingoMyTurn) {
      clickCellByOther(bingoNextNumber);
    }
  }, [bingoNextNumber]);

  useEffect(() => {
    console.log(bingoCompleted);
    if(bingoCompleted.length != bingoNewCompleted.length) {
      setBingoNewCompleted(bingoCompleted);
      const completedPlayerId = bingoCompleted[bingoCompleted.length-1];
      console.log("bingocompleted last new: ", bingoCompleted[bingoCompleted.length-1]);
      
      if(authUser.uid != completedPlayerId) {
        const subscribersPlayers: Player[] | undefined =
        currentGameRoom?.subscribersPlayers;
        
        if(subscribersPlayers) {
          const completedPlayer = subscribersPlayers.find(
            (player) => player.uid === completedPlayerId
          );
  
          if(completedPlayer) {
            const newBiongoMessage =  completedPlayer['displayName']  + "さんがビンゴしました。";
            const messages = bingoCompletedMessages;
            messages.push(newBiongoMessage);
            setBingoCompletedMessages(messages);
          }
          
        }
      }      
    }
  }, [bingoCompleted]);

  //リアルタイムfirestoreから該当するビンゴゲームデータを取得する
  useEffect(() => {
    getBingo(gameRoomId, (bingo: any) => {
      const sort: string[] = bingo?.sort;

      if (bingo?.sort) {
        setModalSortVisible(false);

        const sort: string[] = bingo?.sort;
        const turnPlayerId: string = bingo?.turnPlayerId;
        const bingoMyTurn: boolean = turnPlayerId == authUser.uid;
        const subscribersPlayers: Player[] | undefined =
          currentGameRoom?.subscribersPlayers;
        const bingoCompletedFirestore: string[] = bingo?.bingoCompleted;
        const bingoInfo = {
          bingoMyTurn: bingoMyTurn,
          sort: sort,
          bingoNextNumber: bingo?.bingoNextNumber || "",
          turnNumber: bingo?.turnNumber,
        };

        setBingoCompleted(bingoCompletedFirestore);
        setTurnPlayerId(bingo?.turnPlayerId);
        dispatch(setBingoInfo(bingoInfo));

        if (bingoMyTurn) {
          setTurnText("あなたの番です。");
        } else {
          if (subscribersPlayers) {
            const turnPlayer = subscribersPlayers.find(
              (player) => player.uid === turnPlayerId
            );
            if (turnPlayer) {
              setTurnText(turnPlayer?.displayName + " さんの番です。");
            } else {
              setTurnText("");
            }
          }
        }
      }
    });
  }, []);

  interface CustomNotifierProps {
    title: string;
    description: string;
    onPress: () => void;
  }

  const CustomNotifier: React.FC<CustomNotifierProps> = ({ title, description, onPress }) => {
    return (
      <View style={styles.notifierContainer}>
        <Text style={styles.notifierDescription}>{description}</Text>
        <TouchableOpacity onPress={onPress} style={styles.notifierButton}>
          <Text style={styles.notifierButtonText}>X</Text>
        </TouchableOpacity>
      </View>
    );
  };

  const closeNotification = (text: string) => {
    const messages = bingoCompletedMessages;
    const updatedItems = messages.filter(item => item !== text);
    setBingoCompletedMessages(updatedItems);
  }
  
  const setNextTurnPlayerId = (
    sort: string[],
    turnPlayerId: string,
    turnNumber: number
  ) => {
    try {
      if (sort) {
        const currentIndex = sort.indexOf(turnPlayerId);
        const nextIndex = (currentIndex + 1) % sort.length;
        const nextValue = sort[nextIndex];
        const newTurnPlayerId = nextValue;
        const newTurnNumber = turnNumber + 1;
        setNextTurnPlayer(newTurnPlayerId, gameRoomId, newTurnNumber);
      }
    } catch (error) {
      console.log("xxxx");
    }
  };

  const handleRandomSort = async () => {
    const subscribersPlayers = currentGameRoom?.subscribersPlayers;
    const uids = subscribersPlayers?.map((player) => {
      return player.uid;
    });

    const randomSort = () => Math.random() - 0.5;
    uids?.sort(randomSort);

    const uids1 = uids ? uids : [];
    await setPlayerGameSort(gameRoomId, uids1);
    setModalSortVisible(false);
  };

  const handleCellClick = (
    rowNum: number,
    columnNum: number,
    cellValue: string,
    cellStatusValue: number
  ) => {
    if (cellStatusValue == 1 || completed || !bingoMyTurn) {
      return false;
    }
    setSelectedCellRow(rowNum);
    setSelectedCellColumn(columnNum);
    setSelectedCellValue(cellValue);
    dispatch(setBingoNextNumber(cellValue));
  };
  
  const clickCellByOther = (bingoNextNumber: string) => {
    let isValueIncluded = false;
    const value: any[][] = bingoCellValue;
    let row = -1;
    let column = -1;

    for (let i = 0; i < value.length; i++) {
      for (let j = 0; j < value[i].length; j++) {
        if (value[i][j] == bingoNextNumber) {
          isValueIncluded = true;
          row = i;
          column = j;
          break;
        }
      }
    }
    if (isValueIncluded) {
      bingoBoardCellClick(row, column);
    }
    return isValueIncluded;
  };

  const bingoBoardCellClick = (rowNum: number, columnNum: number) => {
    const cellStatusValue = cellStatus[rowNum][columnNum];
    if (cellStatusValue == 1 || completed) {
      return false;
    }
    const cellStatusValues = cellStatus;
    const rowIndex = rowNum;
    const colIndex = columnNum;
    let newCellStatusValues = cellStatusValues.map((row, i) => {
      if (i === rowIndex) {
        return row.map((col, j) => (j === colIndex ? 1 : col)); // Change the value at the specific index
      } else {
        return row;
      }
    });

    dispatch(setBingoCellStatus(newCellStatusValues));

    const isCompleted = bingoCheck(
      bingoCellValue,
      newCellStatusValues,
      rowNum,
      columnNum
    );
    if (isCompleted) {
      setCompleted(true);

      if (authUser.uid) {
        setBingoCompletedPlayer(authUser.uid, gameRoomId);
      }

      const myBingoCompletedLength = bingoCompleted.length + 1;
      setBingoCompletedNumber(myBingoCompletedLength.toString());
      
      setModalCompletedVisible(true);
    }
  };

  const handleSetNumberClick = () => {
    dispatch(setBingoNextNumber(selectedCellValue));

    const cellStatusValues = cellStatus;
    const rowIndex = selectedCellRow;
    const colIndex = selectedCellColumn;
    let newCellStatusValues = cellStatusValues.map((row, i) => {
      if (i === rowIndex) {
        return row.map((col, j) => (j === colIndex ? 1 : col)); // Change the value at the specific index
      } else {
        return row;
      }
    });

    setSelectedCellValue("");
    if (authUser.uid) {
      setBingoNextNumberUpdate(authUser.uid, gameRoomId, selectedCellValue);
      setNextTurnPlayerId(sort, turnPlayerId, turnNumber);
    }

    dispatch(setBingoCellStatus(newCellStatusValues));
    const isCompleted = bingoCheck(
      bingoCellValue,
      newCellStatusValues,
      selectedCellRow,
      selectedCellColumn
    );
    if (isCompleted) {
      setCompleted(true);
      if (authUser.uid) {
        setBingoCompletedPlayer(authUser.uid, gameRoomId);
      }

      
      const myBingoCompletedLength = bingoCompleted.length + 1;
      setBingoCompletedNumber(myBingoCompletedLength.toString());

      setModalCompletedVisible(true);
    }
  };

  const renderRow = (rowNum: any, columnValue: any): JSX.Element => {
    return (
      <View key={rowNum} style={styles.row}>
        {columnValue}
      </View>
    );
  };

  const renderColumn = (rowNum: number, columnNum: number): JSX.Element => {
    const cellValue = bingoCellValue[rowNum][columnNum];
    const cellStatusValue = cellStatus[rowNum][columnNum];

    let dynamicStyle = styles.normal;
    if (cellStatusValue === 1) {
      dynamicStyle = styles.pressed;
    } else if (selectedCellValue == cellValue) {
      dynamicStyle = styles.selectedCell;
    } else {
      dynamicStyle = styles.normal;
    }

    if (cellStatusValue === -1) {
      return <View key={cellValue}>{renderCell(dynamicStyle, cellValue)}</View>;
    }

    return (
      <TouchableWithoutFeedback
        key={cellValue}
        onPress={() =>
          handleCellClick(rowNum, columnNum, cellValue, cellStatusValue)
        }
      >
        {/* {animatedCell(dynamicStyle, cellValue)} */}
        {renderCell(dynamicStyle, cellValue)}
      </TouchableWithoutFeedback>
    );
  };

  const renderCell = (dynamicStyle: any, cellValue: number): JSX.Element => {
    return (
      <View>
        <Text style={[dynamicStyle, { width: cellSize, height: cellSize }]}>
          {cellValue}
        </Text>
      </View>
    );
  };

  // const animatedCell = (dynamicStyle: any, cellValue: number): JSX.Element => {
  //   return (
  //     <View>
  //        <AnimatedCell cellSize={cellSize} cellValue={cellValue} dynamicStyle={dynamicStyle} />
  //     </View>
  //   );
  // };

  const bingoCardLayout = createBingoCard(
    bingoCellValue,
    renderRow,
    renderColumn
  );

  const BingoBoard = (): JSX.Element => {
    return <View style={styles.container}>{bingoCardLayout}</View>;
  };

  return (
    <View style={styles.container}>

    <View style={{ padding: 0, margin: 0, alignItems: 'center', width: '100%', position: 'absolute', top: 0, zIndex: 100 }}>
      {
        bingoCompletedMessages.map((item, index) => (
          <>
          <CustomNotifier
            title=""
            description={item}
            onPress={() => closeNotification(item)}
          />
      
          </>
    
        ))
      }
    </View>

      <Modal
        animationType="fade"
        transparent={true}
        visible={modalSortVisible}
        onRequestClose={() => {
          setModalSortVisible(false);
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
            {isHost ? (
              <View style={styles.roomModalBtns}>
                <TouchableOpacity style={styles.modalOkBtn} onPress={handleRandomSort}>
                  <Text style={styles.modalOkText}> ランダム </Text>
                </TouchableOpacity>
              </View>
            ) : (
              <ActivityIndicator size="large" color="#007AFF" />
            )}
          </View>
        </View>
      </Modal>

      <Modal
        animationType="fade"
        transparent={true}
        visible={modalCompletedVisible}
        onRequestClose={() => {
          setModalCompletedVisible(false);
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
            <Image
                source={require('../assets/images/bingo-win.gif')}
                style={styles.backgroundImage}
            />

            <View style={{flexDirection: 'row', alignSelf: 'center', alignContent: 'center', alignItems: 'center' }}>
              <Text style={styles.completedTextNumber}>{bingoCompletedNumber}</Text>
              <Text style={styles.completedText}>位</Text>
            </View>

            <TouchableOpacity style={styles.closeTouchableButton} onPress={() => setModalCompletedVisible(false)}>
              <View style={styles.buttonContainer}>
                <Icon name="times" size={20} color="white" />
              </View>
            </TouchableOpacity>
            {/* <TouchableOpacity
              style={styles.modalOkBtn}
              onPress={() => setModalCompletedVisible(false)}
            >
              <Text style={styles.modalOkText}> X </Text>
            </TouchableOpacity> */}
          </View>
        </View>
      </Modal>

      <Text style={styles.title}>BINGO</Text>
      <View style={styles.container}>
        <View style={styles.row}>
          <View style={styles.randomContainer}>
            <Text style={styles.selected}>{bingoPrevNumber}</Text>
          </View>
          {bingoNextNumber ? (
            <View style={styles.randomContainer}>
              <Text style={styles.selected}>{bingoNextNumber}</Text>
            </View>
          ) : (
            <View style={styles.randomContainer}>
              {/* <ActivityIndicator
                size="large"
                style={styles.selected}
                color="#007AFF"
              /> */}
            </View>
          )}
        </View>

        <Text style={styles.turnText}>{turnText}</Text>
        <View style={styles.numberBtnContainer}>
          {bingoMyTurn && selectedCellValue ? (
            <TouchableOpacity style={styles.passBtn} onPress={handleSetNumberClick}>
              <Text style={styles.passBtnText}> 決定 </Text>
            </TouchableOpacity>
          ) : (
            ""
          )}
        </View>

        <View style={styles.boardContainer}>{BingoBoard()}</View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: "5%",
    flexDirection: "column",
    backgroundColor: "black",
    alignItems: "center",
    // position: 'relative'
  },
  title: {
    color: customColors.white,
    fontSize: viewportWidth * 0.2,
    fontWeight: "700",
  },
  modalBtn: {
    display: "flex",
    flexDirection: "row",
  },
  modalStyle: {
    backgroundColor: "black",
    paddingTop: 10,
    borderWidth: 3,
    borderColor: customColors.white,
  },
  randomContainer: {
    flexDirection: "column",
    backgroundColor: "black",
    alignItems: "center",
    borderColor: "grey",
    width: viewportHeight * 0.1,
    height: viewportHeight * 0.1,
    borderWidth: 1,
    borderRadius: 6,
    marginHorizontal: 5,
    marginBottom: 20,
    paddingVertical: 10,
    paddingHorizontal: 10,
  },
  selected: {
    color: customColors.white,
    fontSize: viewportWidth * 0.1,
    borderColor: customColors.white,
    alignItems: "center",
    verticalAlign: "middle",
  },
  randomBtn: {
    backgroundColor: customColors.blackGreen,
    paddingVertical: 8,
    paddingHorizontal: 6,
    padding: 4,
    marginHorizontal: 4,
    marginVertical: 4,
    borderRadius: 6,
  },
  randomText: {
    fontSize: 16,
    color: customColors.white,
    fontFamily: "serif",
    fontWeight: "700",
    textAlign: "center",
  },
  turnText: {
    fontSize: 16,
    color: customColors.white,
    fontFamily: "serif",
    fontWeight: "700",
    textAlign: "center",
    marginBottom: 20,
  },
  modalBody: {
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: customColors.modalContainerBackgroundColor,
    paddingHorizontal: 5,
    paddingVertical: 5,
    borderWidth: 1,
    borderColor: "grey",
    borderRadius: 20,
    width: "80%",
    height: '60%'
  },
  modalOkBtn: {
    backgroundColor: customColors.blackGreen,
 
    paddingVertical: 8,
    paddingHorizontal: 6,
    padding: 4,
    marginHorizontal: 4,
    marginVertical: 4,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: customColors.white,
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
    borderColor: customColors.white,
  },
  modalOkText: {
    fontSize: 16,
    color: customColors.white,
    fontFamily: "serif",
    fontWeight: "700",
    textAlign: "center",
  },
  completedText: {
    fontSize: viewportWidth*0.15,
    color: customColors.white,
    fontFamily: "serif",
    fontWeight: "900",
    textAlign: "center",
  },
  completedTextNumber: {
    fontSize: viewportWidth*0.25,
    color: customColors.white,
    fontFamily: "serif",
    fontWeight: "900",
    textAlign: "center",
  },
  roomModalBtns: {
    flexDirection: "row",
  },
  modalText: {
    fontSize: 16,
    color: customColors.white,
    fontFamily: "serif",
    fontWeight: "700",
    textAlign: "center",
    marginBottom: 20,
  },
  numberBtnContainer: {
    height: "10%",
    width: "20%",
  },
  passBtn: {
    backgroundColor: customColors.blackGreen,
    paddingVertical: 8,
    paddingHorizontal: 6,
    padding: 4,
    marginHorizontal: 4,
    marginVertical: 4,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: customColors.white,
  },
  passBtnText: {
    fontSize: 16,
    color: customColors.white,
    fontFamily: "serif",
    fontWeight: "700",
    textAlign: "center",
  },
  boardContainer: {
    position: "absolute",
    bottom: viewportHeight * 0.05,
    borderColor: "grey",
    flexDirection: "row",
    flexWrap: "wrap",
    alignItems: "center",
    justifyContent: "center",
  },
  pressed: {
    padding: 8,
    borderWidth: 1,
    borderRadius: 5,
    textAlign: "center",
    fontSize: viewportWidth * 0.09,
    fontWeight: "700",
    color: "#c45600",
    borderColor: customColors.white,
    textAlignVertical: "center",
    backgroundColor: "#d8d2cdeb",
  },
  normal: {
    padding: 8,
    borderWidth: 1,
    borderRadius: 5,
    textAlign: "center",
    fontSize: viewportWidth * 0.06,
    fontWeight: "700",
    color: customColors.white,
    borderColor: customColors.white,
    textAlignVertical: "center",
  },
  TouchableOpacity: {
    padding: 8,
    borderWidth: 1,
    borderRadius: 5,
    textAlign: "center",
    fontSize: viewportWidth * 0.09,
    fontWeight: "700",
    color: "#04AA6D",
    backgroundColor: customColors.blackGreen,
    borderColor: customColors.white,
    textAlignVertical: "center",
  },
  selectedCell: {
    padding: 8,
    borderWidth: 2,
    borderRadius: 5,
    textAlign: "center",
    fontSize: viewportWidth * 0.09,
    fontWeight: "700",
    color: "#04AA6D",
    borderColor: customColors.blackGreen,
    textAlignVertical: "center",
  },

  row: {
    flexDirection: "row",
  },

  backgroundImage: {
    flex: 1,
    resizeMode: "cover",
    height: "100%",
    width: "100%",
    position: "absolute",
    borderRadius: 10,
    borderWidth:  1,
    borderColor: 'white',
    opacity: 0.9,
  },

  notifiersContainer: {
    flex: 1,
    position: 'absolute'
  },

  notifierContainer: {
    backgroundColor: customColors.modalBackgroundColor,
    padding: 20,
    borderRadius: 10,
    elevation: 5,
    width: '90%',
    alignItems: 'center',
    marginBottom: 5,
    borderWidth: 1,
    borderColor: customColors.blackGrey
  },
  notifierTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  notifierDescription: {
    fontSize: 20,
    marginBottom: 20,
    color: customColors.white
  },
  notifierButton: {
    // backgroundColor: customColors.blackGreen,
    padding: 10,
    // borderRadius: 20,
    // borderWidth: 1,
    borderColor: customColors.white,
    alignItems: 'center',
    position: 'absolute',
    top: 0,
    right: 0
  },
  notifierButtonText: {
    color: 'white',
    fontWeight: 'bold',
  },

  buttonContainer: {
    width: 30,
    height: 30,
    borderRadius: 15,
    // backgroundColor: 'white',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'white',
  },

  closeTouchableButton: {
    position: 'absolute',
    top: -12,
    right: -12
  }
});

export default PlayBoard;
