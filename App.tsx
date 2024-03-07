import React from 'react';
import { Provider } from 'react-redux';
import { store } from './store/';
import RootNavigator from './routes';

// Import Firebase
import 'firebase/firestore';
import { initializeApp, getApps } from 'firebase/app';

const firebaseConfig = {
  apiKey: "AIzaSyD88NOgTNLOc0UAb1kOvUKSVGasw5DHpLk",
  authDomain: "mimi-base.firebaseapp.com",
  databaseURL: "https://mimi-base-default-rtdb.firebaseio.com/",
  projectId: "mimi-base",
  storageBucket: "mimi-base.appspot.com",
  appId: "1:960958133531:android:a100ce786673cdc5934fbe"
};
// Initialize Firebase
if (getApps().length === 0) {
  console.log("FireBase start!");
  initializeApp(firebaseConfig);
}

function App(): JSX.Element {
  return (
    <Provider store={store}>
      <RootNavigator />
    </Provider>
  );
}

export default App;
