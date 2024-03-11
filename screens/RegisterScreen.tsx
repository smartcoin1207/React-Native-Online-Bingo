import React, { useEffect, useState } from "react";
import { StatusBar } from "expo-status-bar";
import { useSelector, useDispatch } from 'react-redux';

import {
  StyleSheet,
  Text,
  View,
  TextInput,
  TouchableOpacity,
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import { validateEmail, validatePassword } from '../utils/ValidtionUtils';
import { signUpAuthUser } from "../utils/firebase/FirebaseUtil";
import { RootState } from "../store";

interface LoginScreenProps {}

const Register: React.FC<LoginScreenProps> = () => {

    const [email, setEmail] = useState<string>("");
    const [password, setPassword] = useState<string>("");
    const [username, setUsername] = useState<string>("");
    const [avatarUrl, setAvatarUrl] = useState<string>("");

    const [emailError, setEmailError] = useState<string>("");
    const [passwordError, setPasswordError] = useState<string>("");
    const navigation = useNavigation();

    const authUser = useSelector((state: RootState) => state.auth.authUser);



    const handleRegister = async () => {
        const emailErr = validateEmail(email);
        const passwordErr = validatePassword(password);
    
        setEmailError(emailErr || "");
        setPasswordError(passwordErr || "");
    
        if (!emailErr && !passwordErr) {
            signUpAuthUser(email, password, username, avatarUrl)
            .then(() => {
                navigation.navigate("login");
            });
        }
    };

    return (
        <View style={styles.container}>
            <View style={styles.subContainer}>
                <Text style={styles.title}>会員登録</Text>
                <TextInput
                    style={styles.input}
                    placeholder="メールアドレス"
                    keyboardType="email-address"
                    autoCapitalize="none"
                    value={email}
                    onChangeText={(text) => setEmail(text)}
                />
                {emailError !== "" && <Text style={styles.errText}>{emailError}</Text>}
                <TextInput
                    style={styles.input}
                    placeholder="パスワード"
                    secureTextEntry
                    value={password}
                    onChangeText={(text) => setPassword(text)}
                />
                {passwordError !== "" && (
                    <Text style={styles.errText}>{passwordError}</Text>
                )}
                <TextInput
                    style={styles.input}
                    placeholder="アカウント名"
                    value={username}
                    onChangeText={(text) => setUsername(text)}
                />
                <TextInput
                    style={styles.input}
                    placeholder="AvatarUrl"
                    value={avatarUrl}
                    onChangeText={(text) => setAvatarUrl(text)}
                    keyboardType="numeric"
                />
                <TouchableOpacity style={styles.button} onPress={handleRegister}>
                    <Text style={styles.buttonText}>登      録</Text>
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
    padding: 10,
    backgroundColor: "#000000",
  },
  subContainer: {
    flex: 0,
    justifyContent: "center",
    alignItems: "center",
    padding: 30,
    backgroundColor: "hsla(0,0%,100%,.5)",
    borderRadius: 20,
    width: "100%",
  },
  title: {
    fontSize: 24,
    marginBottom: 50,
    color: "#ffffff",
    fontWeight: "900",
    // marginVertical: 60,
  },
  input: {
    height: 40,
    width: "100%",
    borderColor: "gray",
    borderWidth: 1,
    marginBottom: 12,
    paddingHorizontal: 10,
    paddingVertical: 2,
    backgroundColor: "#ffffff",
    borderRadius: 4,
    fontSize: 16,
  },
  button: {
    backgroundColor: "red",
    width: "100%",
    padding: 15,
    borderRadius: 5,
    marginTop: 10,
    justifyContent: "center",
    alignItems: "center",
  },
  buttonText: {
    color: "#ffffff",
    textAlign: "center",
    fontWeight: "bold",
    fontSize: 16,
  },
  errText: {
    color: "red",
    marginBottom: 20,
    fontSize: 16,
  },
});

export default Register;
