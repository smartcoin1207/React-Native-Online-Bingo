import * as React from 'react';
import { createNativeStackNavigator  } from '@react-navigation/native-stack';

import PlayBoard from '../screens/BingoScreen';
import Register from '../screens/RegisterScreen';
import Login from '../screens/LoginScreen';
import SplashScreen from '../screens/SplashScreen';
import Home from '../screens/HomeScreen';
import GameList from '../screens/GameListScreen';
import GameRoom from '../screens/GameRoomListScreen';
import GameWaitingScreen  from '../screens/GameWaitingScreen';
import PenaltyScreen from '../screens/penaltyScreen';
import PenaltyEditList from '../screens/penaltyEditList';
import { RootStackParamList } from '../constants/navigate';
import HighLowScreen from '../screens/HighLowScreen';
import TictactoeScreen from '../screens/TictactoeScreen';
import PenaltyAB from '../screens/penalty/penaltyAB';

// Define the types for the route paramete

const Stack = createNativeStackNavigator<RootStackParamList>();

const AppNavigator = () => {
  return (
    <Stack.Navigator initialRouteName='Splash'>
      <Stack.Screen name='Splash' component={SplashScreen} options={{ headerShown: false }}/>
      <Stack.Screen name='Home' component={Home} options={{ headerShown: false }}/>
      <Stack.Screen name='register' component={Register} options={{ headerShown: false }}/>
      <Stack.Screen name='login' component={Login} options={{ headerShown: false}}/>
      <Stack.Screen name='GameList' component={GameList} options={{ headerShown: false }}/>
      <Stack.Screen name='gameRoomList' component={GameRoom} options={{ headerShown: false }}/>
      <Stack.Screen name='currentRoom' component={GameWaitingScreen} options={{ headerShown: false }}/>
      <Stack.Screen name='penaltyAB' component={PenaltyAB} options={{headerShown: false}}/>
      <Stack.Screen name='penalty' component={PenaltyScreen} options={{headerShown: false}}/>
      <Stack.Screen name='penaltyEdit' component={PenaltyEditList} options={{ headerShown: false }}/>
      <Stack.Screen name='bingo' component={PlayBoard} options={{ headerShown: false }}/>
      <Stack.Screen name='highlow' component={HighLowScreen} options={{ headerShown: false }}/>
      <Stack.Screen name='tictactoe' component={TictactoeScreen} options={{ headerShown: false }}/>

    </Stack.Navigator>
  );
};

export default AppNavigator;