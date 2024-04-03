import * as React from 'react';
import { useEffect, useState } from 'react';

import { useSelector, useDispatch } from 'react-redux';
import { StyleSheet, Text, View, Dimensions, TouchableWithoutFeedback, Modal, Button, TouchableOpacity, Image } from 'react-native';
import { createBingoCard, bingoCellStatusInit, bingoCellValues, bingoCheck } from './BingoEngine';
import 'firebase/firestore';
import { RootState } from '../store';
import { setBingoCellStatus, setBingoNextNumber, setCanBoardCellClick } from '../store/reducers/bingo/bingoSlice';
import { setBingoNextNumberUpdate } from '../utils/firebase/FirebaseUtil';
import { customColors } from '../utils/Color';

interface Props {
    bingoTimerIntervalId: number;
    bingoGameHasStarted: boolean;
    bingoGameHasCompleted: boolean;
    bingoRestartInitiated: boolean;
    bingoBallsList: number[];
    bingoStop: () => void;
    bingoComplete: () => void;
    bingoRestart: () => void;
}

const BingoBoard: React.FC = () => {
    const screenWidth = Dimensions.get('window').width ;
    const cellSize = screenWidth / 5; 
    
    const [cellStatus, setCellStatus] = React.useState<number[][]>(bingoCellStatusInit());
    const [completed, setCompleted] = useState<boolean>(false);
    const [modalVisible, setModalVisible] = useState(false);
    
    const authUser = useSelector((state: RootState) => state.auth.authUser);
    const bingoCellStatus = useSelector((state: RootState) => state.bingo.bingoCellStatus);
    const bingoNextNumber = useSelector((state: RootState) => state.bingo.bingoNextNumber);
    const bingoMyTurn = useSelector((state: RootState) => state.bingo.bingoMyTurn);
    const gameRoomId = useSelector((state: RootState) => state.bingo.gameRoomId);
    const canBoardCellClick = useSelector((state: RootState) => state.bingo.canBorardCellClick);
    const bingoCellValue = useSelector((state: RootState) => state.bingo.bingoCellValue);

    const dispatch = useDispatch();
    
    useEffect(() => {
        setCellStatus(bingoCellStatus);
    }, [bingoCellStatus]);

    useEffect(() => {
        if(!bingoMyTurn) {
            clickCellByOther(bingoNextNumber);
        }
    }, [bingoNextNumber])

    const handleCellClick = (rowNum:number, columnNum:number, cellValue:string, cellStatusValue:number) => {
        if(cellStatusValue == 1 || completed || !canBoardCellClick || !bingoMyTurn) {
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
        
        dispatch(setCanBoardCellClick(false));

        if(bingoMyTurn) {
            dispatch(setBingoNextNumber(cellValue));
        }
        
        dispatch(setBingoCellStatus(newCellStatusValues));
        const isCompleted = bingoCheck(bingoCellValue, newCellStatusValues, rowNum, columnNum);
        if(isCompleted) {
            setCompleted(true);
            setModalVisible(true)
        }
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
        if(cellStatusValue == 1 || completed || !canBoardCellClick) {
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
        
        dispatch(setCanBoardCellClick(false));
        dispatch(setBingoCellStatus(newCellStatusValues));

        const isCompleted = bingoCheck(bingoCellValue, newCellStatusValues, rowNum, columnNum);
        if(isCompleted) {
            setCompleted(true);
            setModalVisible(true)
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
        } else if(bingoNextNumber == cellValue) {
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
            <TouchableOpacity key={cellValue} onPress={() => handleCellClick(rowNum, columnNum, cellValue, cellStatusValue)}>
                {renderCell(dynamicStyle, cellValue)}
            </TouchableOpacity>
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

    return (
        <View style={styles.container}>
            {bingoCardLayout}
            <Modal
                animationType="fade"
                transparent={true}
                visible={modalVisible}
                onRequestClose={() => {
                setModalVisible(false);
                }}
            >
                <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: modalBackgroundColor }}>
                       <View style={styles.modalBody}>
                            {/* <Image
                                source={require('../assets/images/bingo.png')}
                                style={styles.backgroundImage}
                            /> */}
                            <Text style={styles.completedText}>BINGO！ おめでとう！</Text>

                            <TouchableOpacity 
                                    style={styles.modalOkBtn}
                                    onPress={() => setModalVisible(false)}
                                >
                                <Text style={styles.modalOkText}>   閉じる   </Text>
                            </TouchableOpacity>
                       </View>
                </View>
            </Modal>
        </View>
    );
};
  
const styles = StyleSheet.create({
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
    container: {
        flex: 1
    },
    row: {
        flexDirection: 'row',
    },
    modalBody: {
        justifyContent: "center",
        alignItems: "center",
        backgroundColor: customColors.modalContainerBackgroundColor,
        paddingHorizontal: 15,
        paddingVertical: 50,
        borderWidth: 1,
        borderColor: 'grey',
        borderRadius: 20,
        width: "90%",
        height: "40%"
      },
    modalOkBtn: {
        backgroundColor: '#ff0000',
        paddingVertical: 8,
        paddingHorizontal: 6,
        padding: 4,
        marginHorizontal: 4,
        marginVertical: 10,
        marginTop: 20,
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
        width: 150
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

    completedText: {
        fontSize: 25,
        color: 'white',
        width: '90%',
        fontFamily:'serif',
        fontWeight: '700',
        textAlign: 'center',
    }

});
  
export default BingoBoard;