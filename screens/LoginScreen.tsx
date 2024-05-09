import React, { useEffect, useState } from "react";
import { UseSelector, useDispatch, useSelector } from "react-redux";
import {
  StyleSheet,
  Text,
  View,
  TextInput,
  TouchableOpacity,
  Dimensions,
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import { validateEmail, validatePassword } from "../utils/ValidtionUtils";
import { RootState } from "../store";
import { signInAuthUser } from "../utils/firebase/FirebaseUtil";
import { SignIn } from "../store/reducers/bingo/userSlice";
import { customColors } from "../utils/Color";
import { inCorrectUserInfoRequired } from "../utils/ValidationString";
import AsyncStorage from '@react-native-async-storage/async-storage';

interface LoginScreenProps {}

const { width: viewportWidth, height: viewportHeight } = Dimensions.get('window');

const Login: React.FC<LoginScreenProps> = () => {
  const [email, setEmail] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const [emailError, setEmailError] = useState<string>("");
  const [passwordError, setPasswordError] = useState<string>("");
  const [inCorrectUserInfo, setInCorrectUserInfo] = useState<string>("");
  const navigation = useNavigation();
  const isLoggedIn = useSelector((state: RootState) => state.auth.isLoggedIn);
  const authUser = useSelector((state: RootState) => state.auth.authUser);

  const dispatch = useDispatch();

  useEffect(() => {
    if (isLoggedIn) {
      navigation.navigate("GameList");
    }
  }, [isLoggedIn]);

  const handleLogin = async () => {
    const emailErr = validateEmail(email);
    const passwordErr = validatePassword(password);
  
    setEmailError(emailErr || "");
    setPasswordError(passwordErr || "");
  
    if (!emailErr && !passwordErr) {
      try {
        const userData = await signInAuthUser(email, password);
        if (userData) {
          dispatch(SignIn(userData));
          setInCorrectUserInfo("");

          const expirationDate = new Date(new Date().getTime() + 30 * 24 * 60 * 60 * 1000);

          // Save user's login information to AsyncStorage
          await AsyncStorage.setItem('username', email);
          await AsyncStorage.setItem('accessToken', password);
          await AsyncStorage.setItem('expirationDate', expirationDate.toISOString());
        } else {
          setInCorrectUserInfo(inCorrectUserInfoRequired);
        }
      } catch (error) {
        console.error('Error signing in user:', error);
        setInCorrectUserInfo(inCorrectUserInfoRequired);
      }
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.subContainer}>
        <Text style={styles.title}>会員ログイン</Text>
        <TextInput
          style={styles.input}
          placeholder="メールアドレス"
          placeholderTextColor="grey"
          keyboardType="email-address"
          autoCapitalize="none"
          value={email}
          onChangeText={(text) => setEmail(text)}
        />
        {emailError !== "" && <Text style={styles.errText}>{emailError}</Text>}
        <TextInput
          style={styles.input}
          placeholder="パスワード"
          placeholderTextColor="grey"
          secureTextEntry
          value={password}
          onChangeText={(text) => setPassword(text)}
        />
        {passwordError !== "" && (
          <Text style={styles.errText}>{passwordError}</Text>
        )}
        {inCorrectUserInfo !== "" && (
          <Text style={styles.errText}>{inCorrectUserInfo}</Text>
        )}
        <TouchableOpacity style={styles.button} onPress={handleLogin}>
          <Text style={styles.buttonText}>ログイン</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: viewportWidth*0.05,
    backgroundColor: customColors.black,
  },
  subContainer: {
    justifyContent: "center",
    alignItems: "center",
    padding: viewportWidth*0.1,
    backgroundColor: customColors.modalContainerBackgroundColor,
    borderRadius: viewportWidth*0.05,
    borderWidth: 1,
    borderColor: customColors.blackGrey,
    width: "90%",
  },
  title: {
    fontSize: 24,
    marginBottom: 50,
    color: "#ffffff",
    fontWeight: "900",
  },
  input: {
    width: "100%",
    fontSize: 16,
    marginVertical: viewportHeight*0.01,
    paddingHorizontal: 10,
    paddingVertical: 5,
    backgroundColor: customColors.modalContainerBackgroundColor,
    color: customColors.white,
    borderRadius: 20,
    borderColor: customColors.blackGrey,
    borderWidth: 1,
  },
  button: {
    backgroundColor: customColors.customDarkBlue,
    width: "100%",
    padding: 10,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: customColors.customLightBlue,
    marginTop: 10,
    justifyContent: "center",
    alignItems: "center",
  },
  buttonText: {
    color: customColors.white,
    textAlign: "center",
    fontWeight: "bold",
    fontSize: 16,
  },
  errText: {
    color: customColors.blackRed,
    marginBottom: 20,
    fontSize: 16,
  },
});

export default Login;
