import { useEffect, useState } from 'react';
import { useNavigation } from '@react-navigation/native';
import { View, Text, StyleSheet, Pressable, Dimensions, TouchableOpacity, Button, FlatList, BackHandler, ActivityIndicator, Modal, TextInput } from 'react-native';
import { Avatar, Image } from 'react-native-elements';
import { useRoute } from '@react-navigation/native';

import {exitBingoRoom, getBingoRoomById, removeUserFromBingoRoom, startGameFirestore} from '../utils/firebase/FirebaseUtil';
import {BingoWaitingRouteParams, Player, User} from '../utils/Types';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '../store';
import { setCurrentBingoRoom } from '../store/reducers/bingo/bingoRoomSlice';
import { modalBackgroundColor, modalContainerBackgroundColor } from '../utils/ValidationString';
import { remove } from 'lodash';
import { setBingoInitial } from '../store/reducers/bingo/bingoSlice';

const screenHeight = Dimensions.get('window').height;
    const cellSize = screenHeight / 5; 

const GameWaitingScreen = () => {
    const navigator = useNavigation();
    const [subscribers, setSubscribers] = useState<Player[]>([]);

    const route = useRoute();
    const { isHost, bingoId }: BingoWaitingRouteParams = route.params as BingoWaitingRouteParams;
    const authUser = useSelector((state: RootState) => state.auth.authUser);
    const [listLoading, setListLoading] = useState<boolean>(false);
    const [exitModalVisible, setExitModalVisible] = useState<boolean>(false);
    const [modalAlertText, setModalAlertText] = useState("");
    const [isExitModal, setIsExitModal] = useState(true);
    const [currentRemoveUserId, setCurrentRemoveUserId] = useState("");
    const isLoggedIn = useSelector((state: RootState) => state.auth.isLoggedIn);
    const currentBingoRoom = useSelector((state: RootState) => state.bingoRoom.currentBingoRoom);
    const dispatch = useDispatch();
    
    useEffect(() => {
        dispatch(setBingoInitial({bingoId: bingoId, isHost: isHost}))
    }, []);

    useEffect(() => {
        if(currentBingoRoom) {
            setSubscribers(currentBingoRoom?.subscribersPlayers);
        } else {
            setSubscribers([]);
        }
    }, [currentBingoRoom]);
    //get bingo room from firebase 
    useEffect(() => {
        setListLoading(true);

        getBingoRoomById(bingoId, (bingoRoom:any) => {
            if(!bingoRoom) {
                navigator.navigate('gameRoom');
                dispatch(setCurrentBingoRoom(null));
            }
            if(bingoRoom.subscribersPlayers) {
                if (!bingoRoom.subscribersPlayers.some((player: any) => player.uid === authUser.uid)) {
                    navigator.navigate('gameRoom');
                }
            }
        
            if(bingoRoom?.bingoStarted == true) {
                navigator.navigate('Play');
            }

            const currentBingoRoom = {
                bingoId: bingoId,
                subscribersPlayers:  bingoRoom?.subscribersPlayers
            }
            dispatch(setCurrentBingoRoom(currentBingoRoom));
            setListLoading(false)
        });
    }, []);

    useEffect(() => {
        const backAction = () => {
            setModalAlertText("プレイルームを削除しますか？");
            setExitModalVisible(true);
          return true;
        };
    
        const backHandler = BackHandler.addEventListener('hardwareBackPress', backAction);
        return () => backHandler.remove(); // Clean up the event listener
      }, []);

    const startGame = async () => {
        await startGameFirestore(bingoId);
        navigator.navigate('Play');
    }

    const exitRoom = () => {
        console.log('xxxx')
        if(authUser.uid) {
            navigator.navigate('gameRoom');
            setExitModalVisible(false);
            exitBingoRoom(authUser?.uid, bingoId, isHost);
        }
    }

    const exitRoomModal = () => {
        setExitModalVisible(true);
        setIsExitModal(true)
    
        setModalAlertText("プレイルームを削除しますか？");
    }
    
    const removeUser = (uid: string) => {
        setExitModalVisible(false)
        if(uid) {
            removeUserFromBingoRoom(uid, bingoId);
        }
    }

    const removeUserModal = (uid: string) => {
        setExitModalVisible(true);
        setIsExitModal(false);
        setCurrentRemoveUserId(uid);
        setModalAlertText("このユーザーをエクスポートしますか？");
    }

    const renderPlayerItem = ({ item }: { item: Player }) => (
        <View style={styles.playerItem} >
            
            <Avatar
                rounded
                size="medium"
                source={{
                uri: item.photoURL,
                }}
            />
            <Text style={styles.nameTitle}>{item.displayName}</Text>
            {/* <Text style={styles.nameTitle}>{item.age}</Text> */}

            {isHost &&
                <Pressable 
                    style={styles.joinBtn}
                    onPress={() => removeUserModal(item.uid)}
                >
                    <Text style={styles.joinBtnText}>　退出　</Text>
                </Pressable>
            }
        </View>
    );

    const ProfileAvatar = (
        imageUrl: string,
        displayName: string | null | undefined
      ): JSX.Element => {
        return (
          <View style={styles.profile}>
            <Avatar
              rounded
              size="large"
              source={{
                uri: imageUrl,
              }}
            />
            {/* <Text style={styles.textTitle}>{displayName}</Text> */}
          </View>
        );
      };

    return (
        <View style={styles.container}>
            <Modal
                animationType="fade"
                transparent={true}
                visible={exitModalVisible}
                onRequestClose={() => {
                setExitModalVisible(false);
                }}
            >
                <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: modalBackgroundColor }}>
                    <View style={styles.modalBody}>
                        <Text style={styles.modalText}>
                            {modalAlertText}
                        </Text>

                        <View style={styles.roomModalBtns}>
                            <Pressable 
                                    style={styles.modalCancelBtn}
                                    onPress={() => setExitModalVisible(false)}
                                >
                                <Text style={styles.modalOkText}>   キャンセル   </Text>
                            </Pressable>
                            {isExitModal 
                            ?   <Pressable
                                        style={styles.modalOkBtn}
                                        onPress={exitRoom}
                                    >
                                    <Text style={styles.modalOkText}>   近   い   </Text>
                                </Pressable>
                            :   <Pressable
                                        style={styles.modalOkBtn}
                                        onPress={() => removeUser(currentRemoveUserId)}
                                    >
                                    <Text style={styles.modalOkText}>   近   い   </Text>
                                </Pressable>
                            }
                        </View>
                    </View>
                </View>
            </Modal>
            {ProfileAvatar(authUser?.photoURL || '111', authUser?.displayName)}

            <View style={styles.btnList}>
                {isHost && <Pressable 
                    style={styles.successButton}
                    onPress={startGame}
                >
                    <Text style={styles.textTitle}>ゲーム開始</Text>
                </Pressable>}
                
                <Pressable style={styles.button} onPress={() => exitRoomModal()}>
                    <Text style={styles.textTitle}>退出する</Text>
                </Pressable>
            </View>

            <Text style={styles.listTitle}>ゲームメンバー</Text>
            
            {listLoading ? <ActivityIndicator size="large" color="#007AFF" /> : ''} 
        
            <View style={styles.FlatListStyle}>
                <FlatList
                    data={subscribers}
                    renderItem={renderPlayerItem}
                    keyExtractor={(item, index) => index.toString()}
                />
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    profile: {
        flexDirection: 'row',
        justifyContent: 'center',
        width: '100%',
        textAlign: 'center',        
        alignItems:  'center'
    },
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'black',
        paddingHorizontal: 15,
        paddingVertical: 50,
        width: '100%',
    },
    btnList: {
        flexDirection: 'row'
    },
    button : {
        backgroundColor: '#ff0000',
        paddingVertical: 8,
        paddingHorizontal: 6,
        marginHorizontal: 4,
        marginVertical: 4,
        borderRadius: 6,
    },
    successButton: {
        backgroundColor: '#04AA6D',
        paddingVertical: 8,
        paddingHorizontal: 6,
        marginHorizontal: 4,
        marginVertical: 4,
        borderRadius: 6,
    },
    textTitle:{
        fontSize: 20,
        color: 'white',
        fontFamily:'serif',
        fontWeight: '700',
        textAlign: 'center',
    },
    playerItem: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        padding: 10,
        borderBottomWidth: 1,
        borderBottomColor: "#ccc",
        width: "100%",
      },
    nameTitle: {
        color: '#ffffff',
        fontSize: 18
    },
    ItemStatus: {
        fontSize: 15,
        color: '#ffffff'
    },
    joinBtn: {
        backgroundColor: '#ff0000',
        // paddingVertical: 8,
        // paddingHorizontal: 6,
        padding: 4,
        marginHorizontal: 4,
        marginVertical: 4,
        borderRadius: 6,
    },
    joinBtnText: {
        fontSize: 16,
        color: 'white',
        fontFamily:'serif',
        fontWeight: '700',
        textAlign: 'center',
    },
    listTitle: {
        fontSize: 20,
        color: 'white',
        fontFamily:'serif',
        fontWeight: '700',
        textAlign: 'center',
        marginTop: 30
    },
    FlatListStyle: {
        flex: 1,
        borderWidth: 1,
        borderColor: 'gray',
        borderRadius: 8,
        margin: 5,
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
      }
});


export default GameWaitingScreen;