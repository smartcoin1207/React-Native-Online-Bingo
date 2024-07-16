import React, { SetStateAction, useEffect, useState, useRef, useCallback, useLayoutEffect } from "react";
import { useSelector, useDispatch } from 'react-redux';
import { View, Text, StyleSheet,  Dimensions, TouchableOpacity, BackHandler } from "react-native";
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import { RootState } from "../../store";
import EffectBorder from "../../components/EffectBorder";
import { customColors } from "../../utils/Color";
import { setPenaltyAorB } from "../../store/reducers/bingo/gameRoomSlice";
import { setMoveGameRoom, setPatternASetFirestore, setpatternBSetFirestore } from "../../utils/firebase/FirebaseUtil";
import { current } from "@reduxjs/toolkit";
import { GameType } from "../../utils/Types";
import Icon from "react-native-vector-icons/Ionicons";

interface PenaltyABPros { }

const { width: viewportWidth, height: viewportHeight } = Dimensions.get('window');

const PenaltyAB: React.FC<PenaltyABPros> = () => {
    const navigation = useNavigation();
    const authUser = useSelector((state: RootState) => state.auth.authUser);
    const isLoggedIn = useSelector((state: RootState) => state.auth.isLoggedIn);
    const currentGameRoom = useSelector((state: RootState) => state.gameRoom.currentGameRoom);
    const dispatch  = useDispatch();

    useEffect(() => {
        if(!isLoggedIn) {
            navigation.navigate('Splash');
        }

        console.log("hello world");
    }, [isLoggedIn])

    useFocusEffect(
        useCallback(() => {
          const onBackPress = () => {
            if(currentGameRoom?.gameRoomId)
            setMoveGameRoom(currentGameRoom?.gameRoomId, GameType.Room);

            return false; // Indicate that the back press is handled
          };

          BackHandler.addEventListener("hardwareBackPress", onBackPress);

          return () => {
            BackHandler.removeEventListener("hardwareBackPress", onBackPress);
          };
        }, [navigator])
      );

      useLayoutEffect(() => {
        navigation.setOptions({
          headerLeft: () => (
            <Icon name="chevron-back-sharp" size={30} color="white" style={{marginRight: 20, marginLeft: -10 }} onPress={() => {navigation.goBack()}} />
          ),
        })
      }, [navigation])

    const handlePenaltyA = async () => {
        if(currentGameRoom?.gameRoomId) {
            await setPatternASetFirestore(currentGameRoom?.gameRoomId, true);
        }
        navigation.navigate('penalty');
        dispatch(setPenaltyAorB(true));
    }

    const handlePenaltyB = async () => {
        if(currentGameRoom?.gameRoomId) {
            await setpatternBSetFirestore(currentGameRoom.gameRoomId, true);
        }
        navigation.navigate('penalty');
        dispatch(setPenaltyAorB(false));
    }

    return (
        <View style={styles.container}>
                {/* <View style={{alignItems:"center", marginBottom: 50}}>
                    <Text style={{color: 'white', fontSize: 30, textAlign: 'center'}}>
                        罰ゲームの決め方
                    </Text>
                </View> */}
                <EffectBorder style={{width: '80%', marginVertical: 10}}>
                    <TouchableOpacity
                        style={styles.gameBtn}
                        onPress={handlePenaltyA}
                    >
                        <Text style={styles.textTitle}>全員で決める</Text>
                    </TouchableOpacity>
                </EffectBorder>

                <EffectBorder style={{width : '80%', marginVertical: 10}}>
                    <TouchableOpacity style={[styles.gameBtn, {backgroundColor: customColors.customDarkGreen1}]} onPress={handlePenaltyB}>
                        <Text style={styles.textTitle}>ホストが決める</Text>
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
        paddingHorizontal: viewportWidth*0.1,
        // backgroundColor: "black",
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
        fontFamily: 'NotoSansJP_400Regular',
        fontWeight: '700',
        textAlign: 'center',
    },
});
export default PenaltyAB;