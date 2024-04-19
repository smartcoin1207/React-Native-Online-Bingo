import { View, SafeAreaView, Text, StyleSheet, TouchableOpacity, Dimensions, Linking, Animated, Easing  } from 'react-native';
import { UseSelector, useDispatch, useSelector } from 'react-redux';
import { useNavigation } from '@react-navigation/native';
import { useEffect } from 'react';
import { RootState } from '../store';
import { customColors } from '../utils/Color';
const screenHeight = Dimensions.get('window').height;

import { useRef } from 'react';
import { delectDirectory, deleteBingoCollection } from '../utils/firebase/FirebaseUtil';

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

    return (
        <SafeAreaView style={styles.container}>
            <TouchableOpacity style={styles.button1} activeOpacity={0.6} onPress={() => openWebsite()}>
                <Text style={styles.textTitle}>アカウント登録</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.button1} activeOpacity={0.6} onPress={() => navigation.navigate('register')}>
                <Text style={[styles.textTitle, {letterSpacing: 12}]}>　登録　</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.button1} activeOpacity={0.6} onPress={() => navigation.navigate('login')}>
                <Text style={styles.textTitle}> 　ログイン　 </Text>
            </TouchableOpacity>
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
    }
});

export default HomeScreen;

