import React from 'react';
import { Provider } from 'react-redux';

import { store } from './store/';
import RootNavigator from './routes';

import { DefaultTheme, Provider as PaperProvider } from 'react-native-paper';

const theme = {
  ...DefaultTheme,
  roundness: 2,
  colors: {
    ...DefaultTheme.colors,
    onSurfaceVariant: 'white',
    onSurface: 'blue',
    background: 'black',
    primary: 'white',
    accent: 'white',
  },
};

function App(): JSX.Element {
  return (
    <Provider store={store}>
      <PaperProvider theme={theme}>
        <RootNavigator />
      </PaperProvider>
    </Provider>
  );
}

export default App;
