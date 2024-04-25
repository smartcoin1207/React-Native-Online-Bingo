import React from 'react';

import { View, SafeAreaView, Text, StyleSheet, TouchableOpacity, Dimensions, Linking, Animated, Easing  } from 'react-native';
import { UseSelector, useDispatch, useSelector } from 'react-redux';
import { useNavigation } from '@react-navigation/native';
import { useEffect } from 'react';
import { RootState } from '../store';
import { customColors } from '../utils/Color';
import { useRef } from 'react';
import { delectDirectory, deleteBingoCollection } from '../utils/firebase/FirebaseUtil';
import EffectBorder from '../components/EffectBorder';
const screenHeight = Dimensions.get('window').height;
import SoundPlayer from 'react-native-sound-player'

const openWebsite = () => {
    const url = 'https://newgate-llc.shop/listener/registration';
    Linking.openURL(url)
        .catch((err) => console.error('An error occurred', err));
};

const HomeScreen: React.FC = () => {
    const navigation = useNavigation();
    const isLoggedIn = useSelector((state: RootState) => state.auth.isLoggedIn);

    useEffect(() => {
        if(isLoggedIn) {
            navigation.navigate('GameList');
        }
    }, [isLoggedIn])

    useEffect(() => {
        // const playSound = async () => {
        //     try {    
        //         await SoundPlayer.playSoundFile('../assets/media/music/penalty.mp3', 'mp3');
        //     } catch (e) {
        //         console.log('Cannot play the sound file', e);
        //     }
        // };
    
        // playSound();
    }, []);

    return (
        <SafeAreaView style={styles.container}>
            <EffectBorder style={{ width: '70%', marginVertical: 20}}>
                <TouchableOpacity style={styles.gameBtn} onPress={openWebsite}>
                    <Text style={styles.textTitle}>アカウント登録</Text>
                </TouchableOpacity>
            </EffectBorder>

            <EffectBorder style={{ width: '70%', marginVertical: 20}}>
                <TouchableOpacity style={styles.gameBtn} onPress={() => navigation.navigate('register')}>
                    <Text style={styles.textTitle}>　登録　</Text>
                </TouchableOpacity>
            </EffectBorder>

            <EffectBorder style={{ width: '70%', marginVertical: 20}}>
                <TouchableOpacity style={styles.gameBtn} onPress={() => navigation.navigate('login')}>
                    <Text style={styles.textTitle}>　ログイン　</Text>
                </TouchableOpacity>
            </EffectBorder>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        alignItems: 'center',
        backgroundColor: customColors.black,
        justifyContent: 'center'
    },

    container1: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#ffffff',
      },
    text: {
        fontSize: 24,
        fontWeight: 'bold',
        color: customColors.white,
    },
    button1: {
        backgroundColor: customColors.customDarkBlue,
        paddingVertical: 10,
        paddingHorizontal: 15,
        borderColor: '#5e95f7b0',
        borderWidth: 1.5,
        borderRadius: 75,
        width:140,
        height: 140,
        justifyContent: 'center',
        marginVertical: 10
    },
    textTitle: {
        fontSize: 18,
        color: customColors.white,
        fontFamily: 'serif',
        fontWeight: '700',
        textAlign: 'center'
    },
    gameBtn: {
        width: '100%',
        backgroundColor: customColors.customDarkBlue,
        borderWidth: 1,
        borderColor: customColors.customLightBlue,
        paddingVertical: 8,
        borderRadius: 100,
    },
});

export default HomeScreen;

