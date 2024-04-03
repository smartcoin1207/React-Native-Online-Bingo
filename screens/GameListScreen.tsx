import React, { useEffect, useState } from "react";
import { useSelector, useDispatch } from 'react-redux';

import { View, Text, StyleSheet,  Dimensions, TouchableOpacity } from "react-native";
import { useNavigation } from '@react-navigation/native';
import { RootState } from "../store";
import { SignOut } from "../store/reducers/bingo/userSlice";
import { customColors } from "../utils/Color";
import { deleteBingoCollection, deleteGameCollection } from "../utils/firebase/FirebaseUtil";
interface GameListScreen { }

const { width: viewportWidth, height: viewportHeight } = Dimensions.get('window');

const GameRoom: React.FC<GameListScreen> = () => {
    const navigation = useNavigation();
    const authUser = useSelector((state: RootState) => state.auth.authUser);
    const isLoggedIn = useSelector((state: RootState) => state.auth.isLoggedIn);
    const dispatch  = useDispatch();

    useEffect(() => {
        if(!isLoggedIn) {
            navigation.navigate('Splash');
        }
    }, [isLoggedIn])

    const handleSignOut = () => {
        dispatch(SignOut());
    }

    const handleDeleteBingo = async () => {
        await deleteBingoCollection()
    }

    const handleDeleteGame = async () => {
        await deleteGameCollection()
    }

    const handleMovePenalty = () => {
        navigation.navigate("penalty");
    }

    return (
        <View style={styles.container}>
                <TouchableOpacity 
                    style={styles.gameBtn}
                    onPress={() => navigation.navigate("gameRoomList")}
                >
                    <Text style={styles.textTitle}>ゲームルーム</Text>
                </TouchableOpacity>

                <TouchableOpacity style={styles.signBtn} onPress={handleSignOut}>
                    <Text style={styles.textTitle}>サインアウト</Text>
                </TouchableOpacity>
                {
                    authUser.email == 'hayate@gmail.com' && (
                    <>
                        <TouchableOpacity style={styles.signBtn} onPress={handleDeleteGame}>
                            <Text style={styles.textTitle}>delete Game</Text>
                        </TouchableOpacity>

                        <TouchableOpacity style={styles.signBtn} onPress={handleDeleteBingo}>
                            <Text style={styles.textTitle}>delete Bingo</Text>
                        </TouchableOpacity>

                        <TouchableOpacity style={styles.signBtn} onPress={handleMovePenalty}>
                            <Text style={styles.textTitle}>tab example</Text>
                        </TouchableOpacity>

                        <TouchableOpacity style={styles.signBtn} onPress={() => {navigation.navigate('penaltyEdit')}}>
                            <Text style={styles.textTitle}>super admin penalty</Text>
                        </TouchableOpacity>
                    </>
                    )
                }
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
        backgroundColor: customColors.blackGreen,
        paddingVertical: 8,
        marginVertical: 4,
        marginTop: viewportHeight*0.05,
        borderRadius: 6,
    },
    signBtn: {
        width: '100%',
        backgroundColor: customColors.blackRed,
        paddingVertical: 8,
        marginVertical: 4,
        marginTop: viewportHeight*0.05,
        borderRadius: 6,
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