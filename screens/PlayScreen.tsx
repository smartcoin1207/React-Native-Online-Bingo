import  React, {useEffect, useState} from 'react';
import { StyleSheet, Button, Text, View, BackHandler, Modal, Pressable, ActivityIndicator, TouchableWithoutFeedback, Dimensions} from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import { setBingoCellStatus, setBingoInfo, setBingoInitial, setBingoNextNumber } from '../store/reducers/bingo/bingoSlice';
import { bingoCellStatusInit, bingoCheck, createBingoCard } from '../components/BingoEngine';
import _ from "lodash";
import { RootState } from '../store';
import { modalBackgroundColor, modalContainerBackgroundColor } from '../utils/ValidationString';
import { getBingo, setBingoTurn, setFirestoreBingoNextNumber, setOrder } from '../utils/firebase/FirebaseUtil';
import { Player } from '../utils/Types';

const PlayBoard: React.FC = () => {
    const screenWidth = Dimensions.get('window').width*0.9 ;
    const cellSize = screenWidth / 5;

    const [modalSortVisible, setModalSortVisible] = useState(false);
    const [modalCompletedVisible, setModalCompletedVisible] = useState(false);

    const [modalAlertText, setModalAlertText] = useState('');
    const [turnText, setTurnText] = useState<string>("");
    const [cellStatus, setCellStatus] = React.useState<number[][]>(bingoCellStatusInit());
    const [completed, setCompleted] = useState<boolean>(false);
    const [turnPlayerId, setTurnPlayerId] = useState<string>('');
    
    //bingo selected
    const [selectedCellRow, setSelectedCellRow] = useState<number>(0);
    const [selectedCellColumn, setSelectedCellColumn] = useState<number>(0);
    const [selectedCellValue, setSelectedCellValue] = useState<string>('');

    const authUser = useSelector((state: RootState) => state.auth.authUser);
    const bingoId = useSelector((state: RootState) => state.bingo.bingoId);
    const isHost = useSelector((state: RootState) => state.bingo.isHost);
    const bingoCellValue = useSelector((state: RootState) => state.bingo.bingoCellValue);
    const bingoCellStatus = useSelector((state: RootState) => state.bingo.bingoCellStatus);
    const sort = useSelector((state: RootState) => state.bingo.sort);

    const bingoNextNumber = useSelector((state: RootState) => state.bingo.bingoNextNumber);
    const bingoPrevNumber = useSelector((state: RootState) => state.bingo.bingoPrevNumber);

    const currentBingoRoom = useSelector((state: RootState) => state.bingoRoom.currentBingoRoom);
    const turnCount = useSelector((state: RootState) => state.bingo.turnCount);

    const bingoMyTurn = useSelector((state: RootState) => state.bingo.bingoMyTurn);

    const dispatch = useDispatch();
    
    //退会時にビンゴゲームを初期化...
    useEffect(() => {
        const backAction = () => {
            dispatch(setBingoInitial({}))
          return false;
        };
        const backHandler = BackHandler.addEventListener('hardwareBackPress', backAction);
        
        return () => backHandler.remove(); // Clean up the event listener
      }, []);

    //ゲーム開始時にプレイヤーの順番を決める...
    useEffect(() => {
        if(isHost) {
            setModalAlertText("順番を決めてください。");
        } else {
            setModalAlertText("順番を決めています。");
        }
        setModalSortVisible(true)
    }, []);

    //
    useEffect(() => {
        setCellStatus(bingoCellStatus);
    }, [bingoCellStatus]);

    useEffect(() => {
        if(!bingoMyTurn) {
            clickCellByOther(bingoNextNumber);
        }
    }, [bingoNextNumber])

    //リアルタイムfirestoreから該当するビンゴゲームデータを取得する
    useEffect(() => {
        getBingo(bingoId, (bingo: any) => {
            if(bingo?.sort) {
                setModalSortVisible(false);
                const sort: string[]  = bingo?.sort;
                const turnPlayerId: string = bingo?.turnPlayerId;
                const bingoMyTurn: boolean = turnPlayerId == authUser.uid;
                const subscribersPlayers: Player[]| undefined = currentBingoRoom?.subscribersPlayers;

                const bingoInfo = {
                    bingoMyTurn: bingoMyTurn,
                    sort: sort,
                    bingoNextNumber: bingo?.bingoNextNumber || "",
                    turnCount: bingo?.turnCount
                };
                setTurnPlayerId(bingo?.turnPlayerId);

                dispatch(setBingoInfo(bingoInfo));

                if(bingoMyTurn) {
                    setTurnText("あなたの番です。");
                } else {
                    if(subscribersPlayers) {
                        const turnPlayer = subscribersPlayers.find(player => player.uid === turnPlayerId);
                        if(turnPlayer) {
                            setTurnText(turnPlayer?.displayName + " の番です。");
                        } else {
                            setTurnText("")
                        }
                    }
                }
            }
        });
    }, []);

    const setNextTurnPlayerId = (sort: string[], turnPlayerId: string, turnCount: number) => {
        console.log(sort)
        try {
            if(sort) {
                console.log("---------------------------------------------------")
                const currentIndex = sort.indexOf(turnPlayerId);
                const nextIndex = (currentIndex + 1) % sort.length;
                const nextValue = sort[nextIndex];
                const newTurnPlayerId = nextValue;
                const newTurnCount = turnCount + 1;
                setBingoTurn(newTurnPlayerId, bingoId, newTurnCount);        
            }  
        } catch (error) {
            console.log('xxxx');
        }
    }

    const handleRandomSort = async () => {
        const subscribersPlayers = currentBingoRoom?.subscribersPlayers;
        const uids = subscribersPlayers?.map((player) => {
            return player.uid;
        });

        const randomSort = () => Math.random() - 0.5;
        uids?.sort(randomSort);

        const uids1 = uids ? uids : [];
        await setOrder(bingoId, uids1);
        setModalSortVisible(false)
    }
    
    const handleCellClick = (rowNum:number, columnNum:number, cellValue:string, cellStatusValue:number) => {
        if(cellStatusValue == 1 || completed || !bingoMyTurn) {
            return false;
        }

        console.log(rowNum, columnNum)

        setSelectedCellRow(rowNum);
        setSelectedCellColumn(columnNum);
        setSelectedCellValue(cellValue);
        dispatch(setBingoNextNumber(cellValue));
    }

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
        if(isValueIncluded) {
            bingoBoardCellClick(row, column);
        }
        return isValueIncluded;
    }

    const bingoBoardCellClick = (rowNum:number, columnNum:number) => {
        const cellStatusValue = cellStatus[rowNum][columnNum];
        if(cellStatusValue == 1 || completed) {
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

        const isCompleted = bingoCheck(bingoCellValue, newCellStatusValues, rowNum, columnNum);
        if(isCompleted) {
            setCompleted(true);
            setModalCompletedVisible(true)
        }
    }

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
        if(authUser.uid) {
            setFirestoreBingoNextNumber(authUser.uid, bingoId, selectedCellValue);
            setNextTurnPlayerId(sort, turnPlayerId, turnCount);

        }
        
        dispatch(setBingoCellStatus(newCellStatusValues));
        const isCompleted = bingoCheck(bingoCellValue, newCellStatusValues, selectedCellRow, selectedCellColumn);
        if(isCompleted) {
            setCompleted(true);
            setModalCompletedVisible(true)
        }
    }

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
        if(cellStatusValue === 1) {
            dynamicStyle = styles.pressed;
        } else if(selectedCellValue == cellValue) {
            dynamicStyle = styles.selectedCell;
        } else {
            dynamicStyle = styles.normal;
        }

        if (cellStatusValue === -1) {
            return (
                <View key={cellValue}>
                    {renderCell(dynamicStyle, cellValue)}
                </View>
            );
        }
        
        return (
            <TouchableWithoutFeedback key={cellValue} onPress={() => handleCellClick(rowNum, columnNum, cellValue, cellStatusValue)}>
                {renderCell(dynamicStyle, cellValue)}
            </TouchableWithoutFeedback>
        );
    };
    
    const renderCell = (dynamicStyle: any, cellValue: number): JSX.Element => {
        return (
            <View>
                <Text style={[dynamicStyle, { width: cellSize, height: cellSize }]}>{cellValue}</Text>
            </View>
        );
    };

    const bingoCardLayout = createBingoCard(bingoCellValue, renderRow, renderColumn);

    const BingoBoard = ():JSX.Element => {
        return (
            <View style={styles.container}>
                {bingoCardLayout}
            </View>
        );
    }
   
    return (
        <View style={styles.container}>
            <Modal
                animationType="fade"
                transparent={true}
                visible={modalSortVisible}
                onRequestClose={() => {
                setModalSortVisible(false);
                }}
            >
                <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: modalBackgroundColor }}>
                    <View style={styles.modalBody}>
                        <Text style={styles.modalText}>
                            {modalAlertText}
                        </Text>
                        {isHost ? <View style={styles.roomModalBtns}>
                            <Pressable 
                                    style={styles.modalOkBtn}
                                    onPress={handleRandomSort}
                                >
                                <Text style={styles.modalOkText}>   ランダム   </Text>
                            </Pressable>
                        </View> : <ActivityIndicator size="large" color="#007AFF" />}
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
                <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: modalBackgroundColor }}>
                    <View style={styles.modalBody}>
                            {/* <Image
                                source={require('../assets/images/bingo.png')}
                                style={styles.backgroundImage}
                            /> */}
                            <Text style={styles.completedText}>BINGO！ おめでとう！</Text>

                            <Pressable 
                                    style={styles.modalOkBtn}
                                    onPress={() => setModalCompletedVisible(false)}
                                >
                                <Text style={styles.modalOkText}>   閉じる   </Text>
                            </Pressable>
                    </View>
                    
                </View>
            </Modal>

            <Text style={styles.title}>BINGO</Text>
            <View style={styles.container}>
                {bingoNextNumber ? 
                    <View style={styles.randomContainer}>
                        <Text style={styles.selected}>{bingoNextNumber}</Text>
                    </View>
                :
                    <View style={styles.randomContainer}>
                        <ActivityIndicator size="large" color="#007AFF" />
                    </View>
                }

                <Text style={styles.turnText}>{turnText}</Text>
                <View style={styles.numberBtnContainer}>
                    { bingoMyTurn && selectedCellValue ? 
                        <Pressable 
                            style={styles.passBtn}
                            onPress={handleSetNumberClick}
                        >
                            <Text style={styles.passBtnText}>   決定   </Text>
                        </Pressable> : ''
                    }
                </View>
                
                {BingoBoard()}
                {/* <View style={styles.randomContainer}>
                    <Text style={styles.selected}>{bingoPrevNumber}</Text>
                </View> */}
            </View>
            
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        paddingTop: '5%',
        flexDirection: 'column',
        backgroundColor: 'black',
        alignItems: 'center',
    },
    title: {
        color: 'white',
        fontSize: 90,
        fontWeight: "700",
    },

    modalBtn: {
        display: 'flex',
        flexDirection: 'row'
    },
    modalStyle: {
        backgroundColor: 'black',
        paddingTop: 10,
        borderWidth: 3,
        borderColor: 'white',
    },
    randomContainer: {
        flexDirection: 'column',
        backgroundColor: 'black',
        alignItems: 'center',
        borderColor: 'grey',
        width: 80,
        height: 80,
        borderWidth: 1,
        borderRadius: 6,
        marginBottom: 20,
        paddingVertical: 10,
        paddingHorizontal: 20
    },
    selected: {
        color: 'white',
        fontSize: 30,
        borderColor: 'white',
    },
    randomBtn: {
        backgroundColor: '#ff0000',
        paddingVertical: 8,
        paddingHorizontal: 6,
        padding: 4,
        marginHorizontal: 4,
        marginVertical: 4,
        borderRadius: 6,
    },
    randomText: {
        fontSize: 16,
        color: 'white',
        fontFamily:'serif',
        fontWeight: '700',
        textAlign: 'center',
    },

    turnText: {
        fontSize: 16,
        color: 'white',
        fontFamily:'serif',
        fontWeight: '700',
        textAlign: 'center',
        marginBottom: 20
    },

    modalBody: {
        justifyContent: "center",
        alignItems: "center",
        backgroundColor: modalContainerBackgroundColor,
        paddingHorizontal: 15,
        paddingVertical: 50,
        borderWidth: 1,
        borderColor: 'grey',
        borderRadius: 20,
        width: "80%",
        // height: '60%'
      },
      modalOkBtn: {
        backgroundColor: '#ff0000',
        paddingVertical: 8,
        paddingHorizontal: 6,
        padding: 4,
        marginHorizontal: 4,
        marginVertical: 4,
        borderRadius: 6,
        borderWidth: 1,
        borderColor: 'white'
      },
      modalCancelBtn: {
        backgroundColor: 'grey',
        paddingVertical: 8,
        paddingHorizontal: 6,
        padding: 4,
        marginHorizontal: 4,
        marginVertical: 4,
        borderRadius: 6,
        borderWidth: 1,
        borderColor: 'white'
      },
      modalOkText: {
          fontSize: 16,
          color: 'white',
          fontFamily:'serif',
          fontWeight: '700',
          textAlign: 'center',
      },
    
      completedText: {
          fontSize: 30,
          color: 'white',
          width: '90%',
          fontFamily:'serif',
          fontWeight: '700',
          textAlign: 'center',
      },
      roomModalBtns: {
        flexDirection: 'row'
      },
      modalText: {
        fontSize: 16,
        color: "white",
        fontFamily: "serif",
        fontWeight: "700",
        textAlign: "center",
        marginBottom: 20
      },
      numberBtnContainer: {
        height: '10%',
        width: '20%',
      },
      passBtn: {
        backgroundColor: 'red',
        paddingVertical: 8,
        paddingHorizontal: 6,
        padding: 4,
        marginHorizontal: 4,
        marginVertical: 4,
        borderRadius: 6,
        borderWidth: 1,
        borderColor: 'white'
      },
      passBtnText: {
        fontSize: 16,
        color: "white",
        fontFamily: "serif",
        fontWeight: "700",
        textAlign: "center",
      },

      pressed: {
        padding: 8,
        borderWidth: 3,
        textAlign: 'center',
        fontSize: 35,
        fontWeight: '700',
        color: 'red',
        borderColor: 'white',
        textAlignVertical: 'center',
        backgroundColor: '#ffa725'
    },
    normal: {
        padding: 8,
        borderWidth: 3,
        textAlign: 'center',
        fontSize: 25,
        fontWeight: '700',
        color: 'white',
        borderColor: 'white',
        textAlignVertical: 'center'
    },
    pressable: {
        padding: 8,
        borderWidth: 3,
        textAlign: 'center',
        fontSize: 25,
        fontWeight: '700',
        color: '#04AA6D',
        backgroundColor: 'red',
        borderColor: 'white',
        textAlignVertical: 'center'
    },
    selectedCell: {
        padding: 8,
        borderWidth: 3,
        textAlign: 'center',
        fontSize: 35,
        fontWeight: '700',
        color: '#04AA6D',
        borderColor: 'red',
        textAlignVertical: 'center'
    },

    row: {
        flexDirection: 'row',
    },

    backgroundImage: {
        flex: 1,
        resizeMode: 'cover',
        height: '40%',
        width: '90%',
        position: 'absolute',
        borderRadius: 30,
        opacity: 0.9
      },

    
});

export default PlayBoard;