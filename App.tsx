import React, { useEffect } from 'react';
import { Provider } from 'react-redux';

import { store } from './store/';
import RootNavigator from './routes';

import { DefaultTheme, Provider as PaperProvider } from 'react-native-paper';
import { Platform, StatusBar } from 'react-native';

import * as SplashScreen from 'expo-splash-screen';
import {
  useFonts,
  NotoSansJP_100Thin,
  NotoSansJP_300Light,
  NotoSansJP_400Regular,
  NotoSansJP_500Medium,
  NotoSansJP_700Bold,
  NotoSansJP_900Black,
} from '@expo-google-fonts/noto-sans-jp';

if (Platform.OS === 'ios') {
  StatusBar.setBarStyle('light-content');
} else if (Platform.OS === 'android') {
  StatusBar.setBarStyle('light-content');
  StatusBar.setTranslucent(true);
  StatusBar.setBackgroundColor('transparent');
}

SplashScreen.preventAutoHideAsync();


function App(): JSX.Element {
  const [fontsLoaded] = useFonts({
    NotoSansJP_100Thin,
    NotoSansJP_300Light,
    NotoSansJP_400Regular,
    NotoSansJP_500Medium,
    NotoSansJP_700Bold,
    NotoSansJP_900Black,
  });

  // Hide the splash screen once the fonts are loaded
  useEffect(() => {
    if (fontsLoaded) {
      SplashScreen.hideAsync();
    }
  }, [fontsLoaded]);

   // Render nothing while the fonts are loading
   if (!fontsLoaded) {
      return <></>;
    }

  return (
    <Provider store={store}>
        <RootNavigator />
    </Provider>
  );
}

export default App;
