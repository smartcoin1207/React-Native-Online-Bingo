import React, { useEffect, useState } from "react";
import { useSelector, useDispatch } from 'react-redux';

import { View, Text, StyleSheet, Pressable, Dimensions } from "react-native";
import { useNavigation } from '@react-navigation/native';
import { RootState } from "../store";
import { SignOut } from "../store/reducers/bingo/userSlice";
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
        // signOutAuthUser()
        // .then(() => {
            dispatch(SignOut());
        // });
    }

    return (
        <View style={styles.container}>
                <Pressable 
                    style={styles.button}
                    onPress={() => navigation.navigate("gameRoomList")}
                >
                    <Text style={styles.textTitle}>ゲームルーム</Text>
                </Pressable>
                {/* <Pressable style={styles.button}>
                    <Text style={styles.textTitle}>B I N G O 2</Text>
                </Pressable>
                <Pressable style={styles.button}>
                    <Text style={styles.textTitle}>B I N G O 3</Text>
                </Pressable>
                <Pressable style={styles.button}>
                    <Text style={styles.textTitle}>B I N G O 4</Text>
                </Pressable>
                <Pressable style={styles.button}>
                    <Text style={styles.textTitle}>B I N G O 5</Text>
                </Pressable> */}

                <Pressable style={styles.signBtn} onPress={handleSignOut}>
                    <Text style={styles.textTitle}>サインアウト</Text>
                </Pressable>
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
        backgroundColor: '#ff0000',
        paddingVertical: 8,
        marginVertical: 4,
        borderRadius: 6,
    },
    signBtn: {
        width: '100%',
        backgroundColor: '#ff0000',
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