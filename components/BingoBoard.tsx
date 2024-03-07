import * as React from 'react';
import { StyleSheet, Text, View, Dimensions, TouchableWithoutFeedback } from 'react-native';
import { createBingoCard, bingoCellStatusInit, bingoCellValues, bingoCheck } from './BingoEngine';
import { getDatabase, ref, set, get, update, remove } from "firebase/database";

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
    const screenWidth = Dimensions.get('window').width;
    const cellSize = screenWidth / 5; 
    
    const [bingoCellValue, setBingoCellValues] = React.useState<Array<Array<any>>>(bingoCellValues());
    const [cellStatus, setCellStatus] = React.useState<number[][]>(bingoCellStatusInit());
    const [rerender, setRerender] = React.useState<number>(0);
  
    const performRerender = (): void => {
        setRerender(rerender === 1 ? 0 : 1);
    };
  
    const initBingo = (): void => {
        setBingoCellValues(bingoCellValues());
        setCellStatus(bingoCellStatusInit());
    };
    const db = getDatabase();

    const addDataToRealtimeDatabase = (rowNum:number, columnNum:number, cellValue:string) => {
        set(ref(db, 'users/' + cellValue), {
            username: columnNum,
            email: rowNum,
            profile_picture : 'imageUrl'
        });
    };

    const deleteDataRealtimeDatabase = (rowNum:number, columnNum:number, cellValue:string) => {
        remove(ref(db, 'users/' + cellValue));
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
        const dynamicStyle = cellStatusValue === 1 ? styles.pressed : styles.normal;
  
        if (cellStatusValue === -1) {
            return (
                <View key={cellValue}>
                    {renderCell(dynamicStyle, cellValue)}
                </View>
            );
        }

        return (
            <TouchableWithoutFeedback key={cellValue} onPress={() => deleteDataRealtimeDatabase(rowNum, columnNum, cellValue)}>
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
  
    return (
        <View style={styles.container}>
            {bingoCardLayout}
        </View>
    );
};
  
const styles = StyleSheet.create({
    pressed: {
        padding: 8,
        borderWidth: 3,
        textAlign: 'center',
        fontSize: 25,
        fontWeight: '700',
        color: 'red',
        borderColor: 'white',
        textAlignVertical: 'center'
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
    container: {
        flex: 1
    },
    row: {
        flexDirection: 'row',
    },
});
  
export default BingoBoard;