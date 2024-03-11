import React, { useEffect, useState } from 'react';
import { UseSelector, useDispatch, useSelector } from 'react-redux';
import { StyleSheet, Text, View, TextInput, TouchableOpacity } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { validateEmail, validatePassword } from '../utils/ValidtionUtils';
import { RootState } from '../store';
import { signInAuthUser } from '../utils/firebase/FirebaseUtil';
import { SignIn } from '../store/reducers/bingo/userSlice';
import { User } from '../utils/Types';
interface LoginScreenProps {}

const Login: React.FC<LoginScreenProps> = () => {
  const [email, setEmail] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [emailError, setEmailError] = useState<string>('');
  const [passwordError, setPasswordError] = useState<string>('');
  const navigation = useNavigation();
  const isLoggedIn = useSelector((state: RootState) => state.auth.isLoggedIn);
  const authUser = useSelector((state: RootState) => state.auth.authUser);

  const dispatch = useDispatch();

  useEffect(() => {
    if(isLoggedIn) {
      navigation.navigate('GameList');
    }
    setEmail('potter@gmail.com');
    setPassword('12345678')
  }, [isLoggedIn])

  const handleLogin = () => {
    // Validation
    const emailErr = validateEmail(email);
    const passwordErr = validatePassword(password);

    setEmailError(emailErr || "");
    setPasswordError(passwordErr || "");

    if (!emailErr && !passwordErr) {
      signInAuthUser(email, password)
      .then((userData) => {
        if(userData) {
          dispatch(SignIn(userData));
        }
      })
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.subContainer}>

        <Text style={styles.title}>会員ログイン
        </Text>
        <TextInput
          style={styles.input}
          placeholder="メールアドレス"
          keyboardType="email-address"
          autoCapitalize="none"
          value={email}
          onChangeText={(text) => setEmail(text)}
        />
        {
          emailError !== '' &&
          (
            <Text style={styles.errText}>{emailError}</Text>
          )
        }
        <TextInput
          style={styles.input}
          placeholder="パスワード"
          secureTextEntry
          value={password}
          onChangeText={(text) => setPassword(text)}
        />
        {
          passwordError !== '' &&
          (
            <Text style={styles.errText}>{passwordError}</Text>
          )
        }
        <TouchableOpacity
          style={styles.button}
          onPress={handleLogin}
        >
          <Text style={styles.buttonText}>ログイン</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 10,
    backgroundColor: '#000000',
  },
  subContainer: {
    flex: 0,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 30,
    backgroundColor: 'hsla(0,0%,100%,.5)',
    borderRadius: 20,
    width: '100%',
  },
  title: {
    fontSize: 24,
    marginBottom: 50,
    color: '#ffffff',
    fontWeight: '900',
    // marginVertical: 60,


  },
  input: {
    height: 40,
    width: '100%',
    borderColor: 'gray',
    borderWidth: 1,
    marginBottom: 12,
    paddingHorizontal: 10,
    paddingVertical: 2,
    backgroundColor: '#ffffff',
    borderRadius: 4,
    fontSize: 16
  },
  button: {
    backgroundColor: 'red',
    width: '100%',
    padding: 15,
    borderRadius: 5,
    marginTop: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  buttonText: {
    color: '#ffffff',
    textAlign: 'center',
    fontWeight: 'bold',
    fontSize: 16,
  },
  errText: {
    color: 'red',
    marginBottom: 20,
    fontSize: 16,
  },
});

export default Login;


