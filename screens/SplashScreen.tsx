import React, { useEffect, useState } from "react";
import { UseSelector, useDispatch, useSelector } from "react-redux";
import { View, ImageBackground, Text, StyleSheet, Pressable, Dimensions, Image, StatusBar } from 'react-native';
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { RootStackParamList } from '../constants/navigate';
import { RootState } from '../store';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { signInAuthUser } from "../utils/firebase/FirebaseUtil";
import { SignIn } from "../store/reducers/bingo/userSlice";
import { User } from "../utils/Types";

const screenHeight = Dimensions.get('window').height;
const cellSize = screenHeight / 5; 

type Props =  NativeStackScreenProps<RootStackParamList, 'Splash'>;

interface LoginInfo {
    username: string;
    accessToken: string;
  }

const SplashScreen: React.FC<Props> = ({navigation: {navigate}}) => {
    const isLoggedIn = useSelector((state: RootState) => state.auth.isLoggedIn);
    const authUser = useSelector((state:RootState) => state.auth.authUser);
    const [loginInfo, setLoginInfo] = useState<LoginInfo | null>(null);
    const dispatch = useDispatch();

    useEffect(() => {
        const loadLoginInfo = async () => {
            try {
                const username = await AsyncStorage.getItem('username');
                const accessToken = await AsyncStorage.getItem('accessToken');
                const expirationDateString = await AsyncStorage.getItem('expirationDate');

                console.log(username);
                console.log(accessToken);

                let isValidExpiration = false;
                if(expirationDateString) {
                    const expirationDate = new Date(expirationDateString);
                    isValidExpiration = expirationDate.getTime() > new Date().getTime();
                }

                if(!isLoggedIn  && !authUser.email) {
                    if (username && accessToken && isValidExpiration) {
                        setLoginInfo({ username, accessToken });

                        // const x:User = {
                        //     uid: '0A8l56KXI7UH7greZmtS3Fxwsm62',
                        //     email: 'hayate@gmail.com',
                        //     displayName: 'Hayate',
                        //     photoURL: ''
                        // }

                        // dispatch(SignIn(x));
                        await handleLogin(username, accessToken);
                    } else {
                        setLoginInfo(null);
                    }
                }
            } catch (error) {
                console.error('Error retrieving login information from AsyncStorage:', error);
                setLoginInfo(null);
            }
        };
        loadLoginInfo();
    }, []);

    const handleStart = () => {
        if(isLoggedIn) {
            navigate('GameList');
        } else {
            navigate('Home');
        }

        // navigate("testscreen");
    }

    const handleLogin = async (email: string, password: string) => {
        // Validation
          try {
            const userData = await signInAuthUser(email, password);
            if (userData) {
              dispatch(SignIn(userData));

              const expirationDate = new Date(new Date().getTime() + 30 * 24 * 60 * 60 * 1000);

              // Save user's login information to AsyncStorage
              await AsyncStorage.setItem('username', email);
              await AsyncStorage.setItem('accessToken', password);
              await AsyncStorage.setItem('expirationDate', expirationDate.toISOString());
            } else {
            }
          } catch (error) {
            }
      };
    
    return (
        <View style={{flex: 1}}>
            <Image
                source={require('../assets/images/splash.png')}
                style={styles.backgroundImage}
            />
            <View style={styles.container}>
                <Pressable style={styles.button} onPress={handleStart}>
                    <Text style={styles.textTitle}>START</Text>
                </Pressable>
            </View>
        </View>
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
        objectFit:'fill',
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