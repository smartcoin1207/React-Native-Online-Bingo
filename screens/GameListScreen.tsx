import React, { SetStateAction, useEffect, useState, useRef, useLayoutEffect } from "react";
import { useSelector, useDispatch } from 'react-redux';

import { View, Text, StyleSheet,  Dimensions, TouchableOpacity } from "react-native";
import { useNavigation } from '@react-navigation/native';
// import Roulette from 'react-native-roulette';
// import WheelOfFortune, { WheelOfFortuneProps } from 'react-native-casino-roulette';

import { RootState } from "../store";
import { SignOut } from "../store/reducers/bingo/userSlice";
import { customColors } from "../utils/Color";
import { deleteBingoCollection, deleteGameCollection } from "../utils/firebase/FirebaseUtil";
import Language from "../utils/Variables";
import EffectBorder from "../components/EffectBorder";
import AsyncStorage from '@react-native-async-storage/async-storage';
import Icon from 'react-native-vector-icons/Ionicons';

const jpLanguage = Language.jp;

interface GameListScreen { }

const { width: viewportWidth, height: viewportHeight } = Dimensions.get('window');
const numbers = [0,32,15,19,4,21,2,25,17,34,6,27,13,36,11,30,8,23,10,5,24,16,33,1,20,14,31,9,22,18,29,7,28,12,35,3,26]
const options  = numbers.map((o)=>({index:o}));  
const { width, height } = Dimensions.get('window');

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

    const [selectedOption, setSelectedOption] = useState(null);

    const handleSpin = (option: React.SetStateAction<null>) => {
      setSelectedOption(option);
    };
  
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

    useLayoutEffect(() => {
      navigation.setOptions({
        headerLeft: () => (
          <Icon name="chevron-back-sharp" size={30} color="white" style={{marginRight: 20, marginLeft: -10 }} onPress={() => {navigation.goBack()}} />
        ),
        
      })
    }, [navigation])
    
        
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
                    {/* <Roulette
                        enableUserRotate={true}
                        background={require('../assets/images/wheel.png')}
                        marker={require('../assets/images/marker.png')}
                        options={options}
                        markerWidth={60}
                        radius={300}
                        distance={100}
                        rotateEachElement={30}
                        centerTop={10}
                        centerWidth={20} // Center width
                        onRotate = {(rotate: any) => {console.log(rotate)}}
                        onRotateChange ={(rotate: any) => {console.log(rotate)}}
                        onSpin={handleSpin}

                        renderOption={(option: string | number | boolean | React.ReactElement<any, string | React.JSXElementConstructor<any>> | Iterable<React.ReactNode> | React.ReactPortal | null | undefined, index: React.Key | null | undefined) => (
                            <View key={index} style={styles.numberContainer}>
                              <Text style={styles.numberText}>44{option}</Text>
                            </View>
                          )}
                    /> */}
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
    },
    selectedOptionContainer: {
        position: 'absolute',
        top: height * 0.1,
        // backgroundColor: customColors,
        paddingVertical: 8,
        paddingHorizontal: 16,
        borderRadius: 8,
      },
      selectedOptionText: {
        fontSize: 18,
        fontWeight: 'bold',
        color: 'white'
      },
      numberContainer: {
        width: 50,
        height: 50,
        backgroundColor: 'blue',
        borderRadius: 25,
        justifyContent: 'center',
        alignItems: 'center',
      },
      numberText: {
        fontSize: 20,
        fontWeight: 'bold',
        color: 'white',
      },
});
export default GameRoom;