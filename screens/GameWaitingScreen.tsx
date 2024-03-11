import { useEffect, useState } from 'react';
import { useNavigation } from '@react-navigation/native';
import { View, Text, StyleSheet, Pressable, Dimensions, TouchableOpacity, Button, FlatList } from 'react-native';
import { Avatar, Image } from 'react-native-elements';
import { useRoute } from '@react-navigation/native';

import {exitBingoRoom, getBingoRoomById, removeUserFromBingoRoom} from '../utils/firebase/FirebaseUtil';
import {BingoWaitingRouteParams, Player, User} from '../utils/Types';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '../store';
import { setCurrentBingoRoom } from '../store/reducers/bingo/bingoRoomSlice';

const screenHeight = Dimensions.get('window').height;
    const cellSize = screenHeight / 5; 

const GameWaitingScreen = () => {
    const navigator = useNavigation();
    const [subscribers, setSubscribers] = useState<Player[]>([]);

    const route = useRoute();
    const { isCreator, bingoId }: BingoWaitingRouteParams = route.params as BingoWaitingRouteParams;
    const authUser = useSelector((state: RootState) => state.auth.authUser);
    const isLoggedIn = useSelector((state: RootState) => state.auth.isLoggedIn);
    const currentBingoRoom = useSelector((state: RootState) => state.bingoRoom.currentBingoRoom);
    const dispatch = useDispatch();
    
    useEffect(() => {
        if(currentBingoRoom) {
            setSubscribers(currentBingoRoom?.subscribersPlayers);
        } else {
            setSubscribers([]);
        }

    }, [currentBingoRoom]);
    //get bingo room from firebase 
    useEffect(() => {
        getBingoRoomById(bingoId, (bingoRoom:any) => {
            if(!bingoRoom) {
                navigator.navigate('gameRoom');
                dispatch(setCurrentBingoRoom(null));
            }
            if (!bingoRoom.subscribersPlayers.some(player => player.uid === authUser.uid)) {
                navigator.navigate('gameRoom');
            }

            if(!bingoRoom.subscribersPlayers || bingoRoom.subscribersPlayers.length === 0) {
            }

            const currentBingoRoom = {
                bingoId: bingoId,
                subscribersPlayers:  bingoRoom?.subscribersPlayers
            }
            dispatch(setCurrentBingoRoom(currentBingoRoom));
        });
    }, []);

    const exitRoom = () => {
        if(authUser.uid) {
            navigator.navigate('gameRoom');
            exitBingoRoom(authUser?.uid, bingoId, isCreator);
        }
    }

    const removeUser = (uid: string) => {
        if(uid) {
            removeUserFromBingoRoom(uid, bingoId);
        }
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

            {isCreator &&
                <Pressable 
                    style={styles.joinBtn}
                    onPress={() => removeUser(item.uid)}
                >
                    <Text style={styles.joinBtnText}>エクスポート</Text>
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
                {ProfileAvatar(authUser?.photoURL || '111', authUser?.displayName)}

                <View style={styles.btnList}>
                    {true && <Pressable 
                        style={styles.successButton}
                        onPress={() => navigator.navigate('Play')}
                    >
                        <Text style={styles.textTitle}>ゲーム開始</Text>
                    </Pressable>}
                    
                    <Pressable style={styles.button} onPress={() => exitRoom()}>
                        <Text style={styles.textTitle}>退出する</Text>
                    </Pressable>
                </View>

                <Text style={styles.listTitle}>ゲームメンバー</Text>

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
});


export default GameWaitingScreen;