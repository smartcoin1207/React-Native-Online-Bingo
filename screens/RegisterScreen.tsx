import React, { useEffect, useState } from "react";
import { StatusBar } from "expo-status-bar";
import { useSelector, useDispatch } from 'react-redux';

import {
  StyleSheet,
  Text,
  View,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  Dimensions,
  Image
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import { validateEmail, validatePassword } from '../utils/ValidtionUtils';
import { signUpAuthUser, uploadToFirebase } from "../utils/firebase/FirebaseUtil";
import { RootState } from "../store";
import * as ImagePicker from 'expo-image-picker';
import { customColors } from "../utils/Color";

interface LoginScreenProps {}

const { width: viewportWidth, height: viewportHeight } = Dimensions.get('window');
console.log(viewportWidth, viewportHeight);
const defaultAvatar = require('../assets/images/default1.png');

const Register: React.FC<LoginScreenProps> = () => {

    const [email, setEmail] = useState<string>("");
    const [password, setPassword] = useState<string>("");
    const [username, setUsername] = useState<string>("");
    // const [avatarUrl, setAvatarUrl] = useState<string>("");
    const [selectedImage, setSelectedImage] = useState<string>('');
    const [emailError, setEmailError] = useState<string>("");
    const [passwordError, setPasswordError] = useState<string>("");
    const [listLoading, setListLoading] = useState<boolean>(false);

    const navigation = useNavigation();
    const authUser = useSelector((state: RootState) => state.auth.authUser);

     const pickImage = async() => {
          try{
              const result = await ImagePicker.launchImageLibraryAsync({
                  mediaTypes: ImagePicker.MediaTypeOptions.Images,
                  allowsEditing: true,
                  aspect: [4,4],
                  quality: 1,
                  allowsMultipleSelection: false,
              });
              setSelectedImage(result.canceled?'':result.assets[0].uri);
              return result.canceled?null:result.assets[0].uri;
          } catch(e){
            throw e;
          }
      }

    const handleRegister = async () => {
        const emailErr = validateEmail(email);
        const passwordErr = validatePassword(password);
    
        setEmailError(emailErr || "");
        setPasswordError(passwordErr || "");
        let avatarUrl = "";
        if (!emailErr && !passwordErr) {
            setListLoading(true);
            if(selectedImage) {
              const uploadResp = await uploadToFirebase(selectedImage, "" + Date.now(), (v) =>
                console.log(v)
              ).then((res) => {
                avatarUrl = res.downloadUrl;

              }).catch((err) => {
                console.log("upload error", err);
              })
            }

            signUpAuthUser(email, password, username, avatarUrl)
            .then(() => {
                navigation.navigate("login");
                setListLoading(false);
            });
        }
    };

    return (
        <View style={styles.container}>
            <View style={styles.subContainer}>
                <Text style={styles.title}>会員登録</Text>

                {selectedImage ? <Image source={{ uri: selectedImage }} style={{ width: viewportWidth*0.3, height: viewportWidth*0.3, borderRadius: viewportWidth*0.15 }} /> :
                <Image source={defaultAvatar} style={{ width: viewportWidth*0.3, height: viewportWidth*0.3, borderRadius: viewportWidth*0.15 }} />
                }
                <TouchableOpacity style={styles.imageButton} onPress={pickImage}>
                    <Text style={styles.buttonText}>画像のアップロード</Text>
                </TouchableOpacity>
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
                <TextInput
                    style={styles.input}
                    placeholder="アカウント名"
                    placeholderTextColor="grey"
                    value={username}
                    onChangeText={(text) => setUsername(text)}
                />

                <TouchableOpacity style={styles.button} onPress={handleRegister}>
                    <Text style={styles.buttonText}>登      録</Text>
                </TouchableOpacity>
            </View>
            {listLoading? <ActivityIndicator size="large" color="#007AFF" /> : ''}
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
    marginBottom: viewportHeight*0.03,
    color: customColors.white,
    fontWeight: "900"
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
  imageButton: {
    backgroundColor: customColors.blackGreen,
    padding: 10,
    borderRadius: 20,
    marginTop: 10,
    justifyContent: "center",
    alignItems: "center",
  },
  button: {
    backgroundColor: customColors.blackGreen,
    width: "100%",
    padding: 10,
    borderRadius: 20,
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
    marginBottom: viewportHeight*0.03,
    fontSize: 16,
  },
});

export default Register;
