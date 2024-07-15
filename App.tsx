import React from 'react';
import { Provider } from 'react-redux';

import { store } from './store/';
import RootNavigator from './routes';

import { DefaultTheme, Provider as PaperProvider } from 'react-native-paper';
import { Platform, StatusBar } from 'react-native';

StatusBar.setBarStyle('light-content');
StatusBar.setTranslucent(true);
StatusBar.setBackgroundColor('transparent');

function App(): JSX.Element {
  return (
    <Provider store={store}>
        <RootNavigator />
    </Provider>
  );
}

export default App;
