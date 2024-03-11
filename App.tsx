import React from 'react';
import { Provider } from 'react-redux';
import { store } from './store/';
import RootNavigator from './routes';
import app, {auth} from './utils/firebase/FirebaseInitialize';
import { Auth } from "firebase/auth";

// const firebaseApp = app;

function App(): JSX.Element {
  return (
    <Provider store={store}>
      <RootNavigator />
    </Provider>
  );
}

export default App;
