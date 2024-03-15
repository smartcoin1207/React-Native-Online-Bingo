import React from 'react';
import { useSelector } from 'react-redux';
import { View, ImageBackground, Text, StyleSheet, Pressable, Dimensions } from 'react-native';
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { RootStackParamList } from '../constants/navigate';
import { RootState } from '../store';

const screenHeight = Dimensions.get('window').height;
const cellSize = screenHeight / 5; 

type Props = NativeStackScreenProps<RootStackParamList, "Splash">;

const SplashScreen: React.FC<Props> = ({navigation: {navigate}}) => {
    const isLoggedIn = useSelector((state: RootState) => state.auth.isLoggedIn);

    const handleStart = () => {
        if(isLoggedIn) {
            navigate('GameList');
        } else {
            navigate('Home');
        } 
    }
    
    return (
        <ImageBackground
            source={require('../assets/images/splash.png')}
            style={styles.backgroundImage}
        >
            <View style={styles.container}>
                <Pressable style={styles.button} onPress={handleStart}>
                    <Text style={styles.textTitle}>START</Text>
                </Pressable>
            </View>
        </ImageBackground>
    );
}

const { width: viewportWidth, height: viewportHeight } = Dimensions.get('window');
console.log(viewportWidth, viewportHeight)

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    backgroundImage: {
        flex: 1,
        position: 'absolute',
        resizeMode: 'cover',
        width: '100%',
        height: '100%',
        backgroundColor: 'transparent',
        justifyContent: 'center',
        alignItems: 'center'
    },
    text: {
        fontSize: 24,
        fontWeight: 'bold',
        color: 'white',
    },
    button: {
        backgroundColor: '#ff3131',
        paddingVertical: 10,
        paddingHorizontal: 25,
        borderColor: 'white',
        borderWidth: 1,
        borderRadius: 15,
        marginTop: cellSize * 3.5
    },
    textTitle: {
        fontSize: 20,
        color: 'black',
        fontFamily: 'serif',
        fontWeight: '700',

    }
});

export default SplashScreen;