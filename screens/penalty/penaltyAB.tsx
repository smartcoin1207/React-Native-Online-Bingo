import React, { SetStateAction, useEffect, useState, useRef } from "react";
import { useSelector, useDispatch } from 'react-redux';
import { View, Text, StyleSheet,  Dimensions, TouchableOpacity } from "react-native";
import { useNavigation } from '@react-navigation/native';
import { RootState } from "../../store";
import EffectBorder from "../../components/EffectBorder";
import { customColors } from "../../utils/Color";
import { setPenaltyAorB } from "../../store/reducers/bingo/gameRoomSlice";
import { setPatternASetFirestore, setpatternBSetFirestore } from "../../utils/firebase/FirebaseUtil";
import { current } from "@reduxjs/toolkit";

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
                <EffectBorder style={{width: '80%', marginVertical: 10}}>
                    <TouchableOpacity 
                        style={styles.gameBtn}
                        onPress={handlePenaltyA}
                    >
                        <Text style={styles.textTitle}>Pattern A</Text>
                    </TouchableOpacity>
                </EffectBorder>
                
                <EffectBorder style={{width : '80%', marginVertical: 10}}>
                    <TouchableOpacity style={styles.signBtn} onPress={handlePenaltyB}>
                        <Text style={styles.textTitle}>Pattern B</Text>
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
    },
});
export default PenaltyAB;