import React, { useState } from 'react';
import { StatusBar } from 'expo-status-bar';
import { StyleSheet, Text, View, TextInput, TouchableOpacity } from 'react-native';
import { useNavigation } from '@react-navigation/native';

interface LoginScreenProps {}

const Login: React.FC<LoginScreenProps> = () => {
  const [email, setEmail] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [emailError, setEmailError] = useState<string>('');
  const [passwordError, setPasswordError] = useState<string>('');
  const navigation = useNavigation();

  const handleLogin = () => {
    navigation.navigate('GameList');
    return;
    //validation
    let emailErr = '';
    let passwordErr = '';
    if (!email) {
      emailErr = 'Email is required';
    } else if (!/^\S+@\S+\.\S+$/.test(email)) {
      emailErr = 'Invalid email format';
    }

    if (!password) {
      passwordErr = "Password is required";
    } else if (password.length < 6) {
      passwordErr = "Password must be at least 6 characters";
    } else if (!/^[a-zA-Z0-9]+$/.test(password)) {
      passwordErr = 'Password can only contain letters and numbers';
    }

    setEmailError(emailErr);
    setPasswordError(passwordErr);

    if (!emailErr && !passwordErr) {
      // Perform login logic
      console.log('Email:', email);
      console.log('Password:', password);
      navigation.navigate('gameListScreen');
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.subContainer}>

        <Text style={styles.title}>会員ログイン(視聴者向け)
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
          placeholder="英数字6文字以上"
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


