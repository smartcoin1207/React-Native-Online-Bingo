import React, { useState } from "react";
import { StatusBar } from "expo-status-bar";
import { View, Text, StyleSheet, Pressable } from "react-native";
import { useNavigation } from '@react-navigation/native';

interface GameListScreen { }

const GameRoom: React.FC<GameListScreen> = () => {
    const navigation = useNavigation();
    return (
        <View style={styles.container}>
                <Pressable 
                    style={styles.button}
                    onPress={() => navigation.navigate("gameRoom")}
                >
                    <Text style={styles.textTitle}>B I N G O 1</Text>
                </Pressable>
                <Pressable style={styles.button}>
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
                </Pressable>
            </View>
    )
}
const styles = StyleSheet.create({

    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'black',
        paddingHorizontal: 30,
        width: '100%',

    },
    button: {
        width: '100%',
        backgroundColor: '#ff0000',
        paddingVertical: 8,
        marginVertical: 4,
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