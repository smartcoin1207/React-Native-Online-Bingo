import React, { useEffect, useState } from "react";
import { useSelector, useDispatch } from 'react-redux';

import { View, Text, StyleSheet,  Dimensions, TouchableOpacity } from "react-native";
import { useNavigation } from '@react-navigation/native';
import { RootState } from "../store";
import { SignOut } from "../store/reducers/bingo/userSlice";
import { customColors } from "../utils/Color";
import { deleteBingoCollection, deleteGameCollection } from "../utils/firebase/FirebaseUtil";
import Language from "../utils/Variables";
import EffectBorder from "../components/EffectBorder";
import AsyncStorage from '@react-native-async-storage/async-storage';

const jpLanguage = Language.jp;

interface GameListScreen { }

const { width: viewportWidth, height: viewportHeight } = Dimensions.get('window');

interface LoginInfo {
    username: string;
    accessToken: string;
  }

const GameRoom: React.FC<GameListScreen> = () => {
    const navigation = useNavigation();
    const authUser = useSelector((state: RootState) => state.auth.authUser);
    const isLoggedIn = useSelector((state: RootState) => state.auth.isLoggedIn);
    const dispatch  = useDispatch();

    const [loginInfo, setLoginInfo] = useState<LoginInfo | null>(null);

    useEffect(() => {
        if(!isLoggedIn) {
            navigation.navigate('Splash');
        }

        console.log("hello world");
    }, [isLoggedIn])

    const handleSignOut = async () => {
        dispatch(SignOut());
        await AsyncStorage.removeItem('username');
        await AsyncStorage.removeItem('accessToken');
    }

    useEffect(() => {
        const loadLoginInfo = async () => {
          try {
            const username = await AsyncStorage.getItem('username');
            const accessToken = await AsyncStorage.getItem('accessToken');
            console.log(username);
            console.log(accessToken);
            if (username && accessToken) {
              setLoginInfo({ username, accessToken });
            } else {
              setLoginInfo(null);
            }
          } catch (error) {
            console.error('Error retrieving login information from AsyncStorage:', error);
            setLoginInfo(null);
          }
        };
        loadLoginInfo();
      }, []);
    
    const handleDeleteBingo = async () => {
        await deleteBingoCollection()
    }

    const handleDeleteGame = async () => {
        await deleteGameCollection()
    }

    const handleMovePenalty = () => {
    }

    return (
        <View style={styles.container}>
                <EffectBorder style={{width: '80%', marginVertical: 10}}>
                    <TouchableOpacity 
                        style={styles.gameBtn}
                        onPress={() => navigation.navigate("gameRoomList")}
                    >
                        <Text style={styles.textTitle}>ゲームルーム</Text>
                    </TouchableOpacity>
                </EffectBorder>
                
                {
                    authUser.email == 'hayate@gmail.com' && (
                        <EffectBorder style={{width: '80%', marginVertical: 10}}>
                            <TouchableOpacity style={styles.gameBtn} onPress={() => {navigation.navigate('penaltyEdit')}}>
                                <Text style={styles.textTitle}>{jpLanguage.penaltyListTitleString}</Text>
                            </TouchableOpacity>
                        </EffectBorder>
                    )
                }
                <EffectBorder style={{width : '80%', marginVertical: 10}}>
                    <TouchableOpacity style={styles.signBtn} onPress={handleSignOut}>
                        <Text style={styles.textTitle}>サインアウト</Text>
                    </TouchableOpacity>
                </EffectBorder>
            </View>
    )
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
        padding: viewportWidth*0.1,
        backgroundColor: "#000000",
        width: '100%'
      },
    button: {
        width: '100%',
        backgroundColor: customColors.blackRed,
        paddingVertical: 8,
        marginVertical: 4,
        borderRadius: 6,
    },
    gameBtn: {
        width: '100%',
        backgroundColor: customColors.customDarkBlue,
        borderWidth: 1,
        borderColor: customColors.customLightBlue,
        paddingVertical: 8,
        borderRadius: 100,
    },
    signBtn: {
        width: '100%',
        backgroundColor: '#69103d9e',
        paddingVertical: 8,
        borderRadius: 100,
        borderWidth: 1,
        borderColor: customColors.customLightBlue,
    },
    textTitle: {
        fontSize: 20,
        color: 'white',
        fontFamily: 'serif',
        fontWeight: '700',
        textAlign: 'center',
    }
});
export default GameRoom;