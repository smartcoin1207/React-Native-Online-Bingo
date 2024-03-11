import  React, {useEffect, useState} from 'react';
import { StyleSheet, Button, Text, View, BackHandler, Alert, Modal, Pressable} from 'react-native';
import BingoBoard from '../components/BingoBoard';
import { useDispatch, useSelector } from 'react-redux';
import { setBingoCellStatus, setBingoMyTurn, setBingoNextNumber } from '../store/reducers/bingo/bingoSlice';
import { bingoCellStatusInit } from '../components/BingoEngine';
import _ from "lodash";
import { RootState } from '../store';

const PlayBoard: React.FC = () => {
    const [modalVisible, setModalVisible] = useState(false);
    const [randomNumber, setRandomNumber] = useState('');
    const bingoMyTurn = useSelector((state: RootState) => state.bingo.bingoMyTurn);
    const bingoNextNumber = useSelector((state: RootState) => state.bingo.bingoNextNumber);

    const dispatch = useDispatch();

    useEffect(() => {
        const backAction = () => {
        
            dispatch(setBingoCellStatus(bingoCellStatusInit()));
            dispatch(setBingoNextNumber(''));
            dispatch(setBingoMyTurn(true))
        //   setModalVisible(true);
          return false;
        };
    
        const backHandler = BackHandler.addEventListener('hardwareBackPress', backAction);
    
        return () => backHandler.remove(); // Clean up the event listener
    
      }, []);

    useEffect(() => {
        setRandomNumber(bingoNextNumber);
    }, [bingoNextNumber])

    const handleRandomBtnclick = () => {
        if(bingoMyTurn) {
            const aRandomNumber = _.random(1, 75);
            dispatch(setBingoNextNumber(aRandomNumber.toString()));
        }
    }

    return (
        <View style={styles.container}>
            <Modal
                animationType="fade"
                transparent={true}
                visible={modalVisible}
                onRequestClose={() => {
                setModalVisible(false);
                }}
                style={styles.modalStyle}
            >
                <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: 'rgba(0, 0, 0, 0.5)' }}>
                <View style={styles.modalStyle}>
                    <Text>ゲームを終了してもよろしいですか?</Text>
                    <View style={styles.modalBtn}>
                        <Button title="Close Modal" onPress={() => setModalVisible(false)} />
                        <Button title="Close Modal" onPress={() => setModalVisible(false)} />
                    </View>
                </View>
                </View>
            </Modal>
            <Text style={styles.title}>BINGO</Text>
            <View style={styles.container}>
                <View style={styles.randomContainer}>
                    <Text style={styles.selected}>{randomNumber}</Text>
                    {/* <Pressable 
                            style={styles.randomBtn}
                            onPress={handleRandomBtnclick}
                        >
                            <Text style={styles.randomText}>ランダム数の生成</Text>
                    </Pressable> */}
                </View>
                <Text style={styles.turnText}>あなたの番です。</Text>

                <BingoBoard />
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
        borderWidth: 1,
        borderRadius: 6,
        marginBottom: 20,
        paddingVertical: 10,
        paddingHorizontal: 20
    },
    selected: {
        color: 'white',
        fontSize: 45,
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
});

export default PlayBoard;