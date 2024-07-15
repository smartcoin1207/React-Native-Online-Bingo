import * as React from 'react';
import { NavigationContainer, DefaultTheme, DarkTheme } from '@react-navigation/native';
import AppNavigator from './AppStack';

const MyDarkTheme = {
  ...DarkTheme,
  colors: {
    ...DarkTheme.colors,
    background: 'black',
    card: 'black',
    text: 'white',
    border: 'gray',
  },
};

const RootNavigator = () => {
  return (
    <NavigationContainer theme={MyDarkTheme}>
      <AppNavigator />
    </NavigationContainer>
  );
};

export default RootNavigator;