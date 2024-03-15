import * as React from 'react';
import { createNativeStackNavigator  } from '@react-navigation/native-stack';

import PlayBoard from '../screens/PlayScreen';
import Register from '../screens/RegisterScreen';
import Login from '../screens/LoginScreen';
import SplashScreen from '../screens/SplashScreen';
import Home from '../screens/HomeScreen';
import GameList from '../screens/GameListScreen';
import GameRoom from '../screens/GameRoomListScreen';
import GameWaitingScreen  from '../screens/GameWaitingScreen';

const Stack = createNativeStackNavigator();

const AppNavigator = () => {
  return (
    <Stack.Navigator initialRouteName='Splash'>
      <Stack.Screen name="Splash" component={SplashScreen} options={{ headerShown: false }}/>
      <Stack.Screen name="bingo" component={PlayBoard} options={{ headerShown: false }}/>
      <Stack.Screen name="Home" component={Home} options={{ headerShown: false }}/>
      <Stack.Screen name="register" component={Register} options={{ headerShown: false }}/>
      <Stack.Screen name="login" component={Login} options={{ headerShown: false }}/>
      <Stack.Screen name="GameList" component={GameList} options={{ headerShown: false }}/>
      <Stack.Screen name="gameRoomList" component={GameRoom} options={{ headerShown: false }}/>
      <Stack.Screen name="currentRoom" component={GameWaitingScreen} options={{ headerShown: false }}/>
    </Stack.Navigator>
  );
};

export default AppNavigator;