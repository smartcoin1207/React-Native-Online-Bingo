import  React, {useEffect, useState} from 'react';
import { StyleSheet, Button, Text, View, BackHandler, Alert, Modal, Pressable, ActivityIndicator} from 'react-native';
import BingoBoard from '../components/BingoBoard';
import { useDispatch, useSelector } from 'react-redux';
import { setBingoCellStatus, setBingoInfo, setBingoInitial, setBingoMyTurn, setCanBoardCellClick } from '../store/reducers/bingo/bingoSlice';
import { bingoCellStatusInit } from '../components/BingoEngine';
import _ from "lodash";
import { RootState } from '../store';
import { modalBackgroundColor, modalContainerBackgroundColor } from '../utils/ValidationString';
import { getBingo, setBingoPassed, setBingoTurn, setOrder } from '../utils/firebase/FirebaseUtil';
import { Player } from '../utils/Types';
import { auth } from '../utils/firebase/FirebaseInitialize';

const PlayBoard: React.FC = () => {
    const [modalVisible, setModalVisible] = useState(false);
    const [modalAlertText, setModalAlertText] = useState('');
    const [turnText, setTurnText] = useState<string>("");
    const [canClick, setCanClick] = useState<boolean>(false);
    const [passBtnDisplay, setPassBtnDisplay] = useState<boolean>(false);

    const bingoNextNumber = useSelector((state: RootState) => state.bingo.bingoNextNumber);
    const bingoId = useSelector((state: RootState) => state.bingo.bingoId);
    const isHost = useSelector((state: RootState) => state.bingo.isHost);
    const currentBingoRoom = useSelector((state: RootState) => state.bingoRoom.currentBingoRoom);
    const bingoSort = useSelector((state: RootState) => state.bingo.sort);
    const authUser = useSelector((state: RootState) => state.auth.authUser);
    // const bingoPassBtnDisplay = useSelector((state: RootState) => state.bingo.bingoPassBtnDisplay);
    const turnCount = useSelector((state: RootState) => state.bingo.turnCount);
    const bingoCellValue = useSelector((state: RootState) => state.bingo.bingoCellValue);

    const dispatch = useDispatch();

 
    useEffect(() => {
        const backAction = () => {
            dispatch(setBingoInitial({}))
          return false;
        };
    
        const backHandler = BackHandler.addEventListener('hardwareBackPress', backAction);
        
        return () => backHandler.remove(); // Clean up the event listener
      }, []);

    useEffect(() => {
        if(isHost) {
            setModalAlertText("順番を決めてください。");
        } else {
            setModalAlertText("順番を決めています。");
        }
        setModalVisible(true)
    }, []);

    useEffect(() => {
        getBingo(bingoId, (bingo: any) => {
            if(bingo?.sort) {
                setModalVisible(false);
                const sort: string[]  = bingo?.sort;
                const turnPlayerId: string = bingo?.turnPlayerId;
                const bingoMyTurn: boolean = turnPlayerId == authUser.uid;
                const playerPassed: string[] = bingo?.playerPassed;
                const subscribersPlayers: Player[]| undefined = currentBingoRoom?.subscribersPlayers;
                if(subscribersPlayers) {
                    const turnPlayer = subscribersPlayers.find(player => player.uid === turnPlayerId);

                    if(turnPlayer) {
                        setTurnText(turnPlayer?.displayName + " の番です。");
                    } else {
                        setTurnText("")
                    }
                }
                console.log(bingo?.bingoNextNumber, "bingoNextNumber1");

                if(playerPassed) {
                    if(authUser.uid) {
                        if(!playerPassed.includes(authUser.uid) && !bingoMyTurn && passButtonDisplay(bingo?.bingoNextNumber)) {
                            setPassBtnDisplay(true)
                        }
                    }
                    
                }

                const bingoInfo = {
                    bingoMyTurn: bingoMyTurn,
                    bingoTurn: turnPlayerId,
                    sort: sort,
                    bingoNextNumber: bingo?.bingoNextNumber || "",
                    turnCount: bingo?.turnCount
                };

                dispatch(setBingoInfo(bingoInfo));
                if(bingoMyTurn) {
                    setTurnText("あなたの番です。");
                    const playerPassedLength =  playerPassed ? playerPassed.length : 0;
                    const sortLength = sort ? sort.length : 0;

                    if(sortLength == playerPassedLength) {
                        setNextTurnPlayerId(sort, turnPlayerId, bingo?.turnCount);
                    }
                }
            }
        });
    }, []);

    useEffect(() => {
        if(turnCount) {
            console.log(turnCount, "can click true")
            dispatch(setCanBoardCellClick(true))
        }
    }, [turnCount])

    const passButtonDisplay = (bingoNextNumber: string) => {
        let isValueIncluded = false;
        const value: any[][] = bingoCellValue;
    
        for (let i = 0; i < value.length; i++) {
            for (let j = 0; j < value[i].length; j++) {
                if (value[i][j] === bingoNextNumber) {
                    isValueIncluded = true;
                    break;
                }
            }
        }
        return isValueIncluded;
    }

    const setNextTurnPlayerId = (sort: string[], turnPlayerId: string, turnCount: number) => {
        const currentIndex = sort.indexOf(turnPlayerId);
        const nextIndex = (currentIndex + 1) % sort.length;
        const nextValue = sort[nextIndex];
        const newTurnPlayerId = nextValue;
        const newTurnCount = turnCount + 1;

        console.log(newTurnCount)

        setBingoTurn(newTurnPlayerId, bingoId, newTurnCount);        
    }

    //
    const handlePassBtnClick = () => {
        if(authUser.uid){
            setBingoPassed(authUser.uid, bingoId);
        }
        
        setPassBtnDisplay(false);
    }

    const handleRandomOrder = async () => {
        const subscribersPlayers = currentBingoRoom?.subscribersPlayers;
        const uids = subscribersPlayers?.map((player) => {
            return player.uid;
        });

        const randomSort = () => Math.random() - 0.5;
        uids?.sort(randomSort);

        const uids1 = uids ? uids : [];
        await setOrder(bingoId, uids1);
        setModalVisible(false)
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
            >
                <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: modalBackgroundColor }}>
                    <View style={styles.modalBody}>
                        <Text style={styles.modalText}>
                            {modalAlertText}
                        </Text>
                        {isHost ? <View style={styles.roomModalBtns}>
                            <Pressable 
                                    style={styles.modalOkBtn}
                                    onPress={handleRandomOrder}
                                >
                                <Text style={styles.modalOkText}>   ランダム   </Text>
                            </Pressable>
                        </View> : <ActivityIndicator size="large" color="#007AFF" />}
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
                { passBtnDisplay ? 
                    <Pressable 
                        style={styles.passBtn}
                        onPress={handlePassBtnClick}
                    >
                        <Text style={styles.passBtnText}>   決定   </Text>
                    </Pressable> : ''
                }
                
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
});

export default PlayBoard;