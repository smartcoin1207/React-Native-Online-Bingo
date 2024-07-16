import * as React from 'react';
import { createNativeStackNavigator  } from '@react-navigation/native-stack';
import { NavigationContainer, DefaultTheme, DarkTheme } from '@react-navigation/native';
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
import PlusMinusScreen from '../screens/plusminus.screen';
import TestScreen from '../screens/testscreen';

// Define the types for the route paramete

const Stack = createNativeStackNavigator<RootStackParamList>();

const AppNavigator = () => {
  return (
      <Stack.Navigator initialRouteName='Splash'>
        <Stack.Screen name='Splash' component={SplashScreen} options={{ headerShown: false }}/>
        <Stack.Screen name='Home' component={Home} options={{ headerShown: true, title: '', headerTitle:'' }}/>
        <Stack.Screen name='register' component={Register} options={{ 
            headerShown: true,
            title: ''
          }}/>
        <Stack.Screen name='login' component={Login} options={{
            headerShown: true,
            title: '',
            headerLargeStyle: {
             
            }
          }}/>
        <Stack.Screen name='GameList' component={GameList} options={{ headerShown: true, title: '' }}/>
        <Stack.Screen name='gameRoomList' component={GameRoom} options={{
          headerShown: true, 
          title: 'プレイルーム',
          headerTitleStyle: {
            fontSize: 20,
            fontWeight: 'bold',
            fontFamily: 'NotoSansJP_400Regular'
          },
          headerTintColor: 'white',
          }}/>
        <Stack.Screen name='currentRoom' component={GameWaitingScreen} options={{
            headerShown: true,
            headerTitle: 'プレイルームのメンバー',
            headerTitleAlign: 'center',
            headerTitleStyle: {
              fontSize: 20,
              fontWeight: 'bold',
              fontFamily: 'NotoSansJP_400Regular'
            }
          }}/>
        <Stack.Screen name='penaltyAB' component={PenaltyAB} options={{headerShown: true, title: '罰ゲームの決め方'}}/>
        <Stack.Screen name='penalty' component={PenaltyScreen} options={{
          headerShown: true, 
          title: '罰ゲーム', 
          headerTitleAlign: 'center',
          headerTitleStyle: {
            fontWeight: 'bold', // Header title font weight
            fontSize: 20, // Header title font size
          },
        }} />
        <Stack.Screen name='penaltyEdit' component={PenaltyEditList} options={{ 
          headerShown: true, 
          title: '罰ゲームリスト',
          headerTitleStyle: {
            fontSize: 20,
            fontWeight: 'bold',
            fontFamily: 'NotoSansJP_400Regular'
          }
        }}/>
        <Stack.Screen name='bingo' component={PlayBoard} options={{ 
          headerShown: false, 
          // title: '',
          // // headerTransparent: true,
          // headerTitleAlign: 'center',
          // headerTitleStyle: {
          //   fontSize: 80,
          //   fontWeight: 'bold',
          // },

        }}/>
        <Stack.Screen name='highlow' component={HighLowScreen} options={{ headerShown: false }}/>
        <Stack.Screen name='tictactoe' component={TictactoeScreen} options={{ headerShown: false }}/>
        <Stack.Screen name='plusminus' component={PlusMinusScreen} options={{ 
          headerShown: true, 
          headerTitle: '足し算引き算', 
          headerTitleAlign: 'center',
          headerTitleStyle: {
            fontSize: 30, 
          }
         }}/>
        <Stack.Screen name='testscreen' component={TestScreen} options={{ headerShown: false }}/>
      </Stack.Navigator>
  );
};

export default AppNavigator;