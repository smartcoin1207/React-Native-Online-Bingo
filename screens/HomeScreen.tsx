import { View, Text, StyleSheet, TouchableOpacity, Dimensions, Linking, Animated, Easing  } from 'react-native';
import { UseSelector, useDispatch, useSelector } from 'react-redux';
import { useNavigation } from '@react-navigation/native';
import { useEffect } from 'react';
import { RootState } from '../store';
import { customColors } from '../utils/Color';
const screenHeight = Dimensions.get('window').height;
const cellSize = screenHeight / 5;

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
        <View style={styles.container}>
            <TouchableOpacity style={styles.button1} onPress={() => openWebsite()}>
                <Text style={styles.textTitle}>アカウント登録</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.button2} onPress={() => navigation.navigate('register')}>
                <Text style={styles.textTitle}>    登録    </Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.button2} onPress={() => navigation.navigate('login')}>
                <Text style={styles.textTitle}>  　ログイン　  </Text>
            </TouchableOpacity>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        paddingTop: cellSize * 1,
        alignItems: 'center',
        backgroundColor: customColors.black
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
        backgroundColor: customColors.blackGreen,
        paddingVertical: 10,
        paddingHorizontal: 25,
        borderColor: customColors.black,
        borderWidth: 1,
        borderRadius: 15
    },
    button2: {
        backgroundColor: customColors.blackGreen,
        paddingVertical: 10,
        paddingHorizontal: 25,
        borderColor: 'black',
        borderWidth: 1,
        borderRadius: 15,
        marginTop: cellSize * 0.65
    },
    textTitle: {
        fontSize: 20,
        color: customColors.white,
        fontFamily: 'serif',
        fontWeight: '700',
    }
});

export default HomeScreen;

