// Import Firebase
import 'firebase/firestore';
import { initializeApp, getApps } from 'firebase/app';
import { getAuth } from 'firebase/auth'; // Import Firebase Authentication module
import { getFirestore } from "firebase/firestore";
import { getStorage } from 'firebase/storage';
import { ReactNativeAsyncStorage } from 'firebase/auth';

const firebaseConfig = {
    apiKey: "AIzaSyDed59tOofXTdNWbrJQ1luN25Ik-JZ69Ak",
    authDomain: "mimi-base.firebaseapp.com",
    databaseURL: "https://mimi-base-default-rtdb.firebaseio.com/",
    projectId: "mimi-base",
    storageBucket: "mimi-base.appspot.com",
    appId: "1:960958133531:android:a100ce786673cdc5934fbe",

     // Add iOS config
    ios: {
      apiKey: "AIzaSyDgVfU23e5zJ257Ty_zAfr0qGLCu_GB6wg",
      authDomain: "mimi-base.firebaseapp.com",
      databaseURL: "https://mimi-base-default-rtdb.firebaseio.com",
      projectId: "mimi-base",
      storageBucket: "mimi-base.appspot.com",
      messagingSenderId: "960958133531",
      appId: "1:960958133531:ios:fdad022ecf5703de934fbe",
      measurementId: "YOUR_MEASUREMENT_ID" // You can include this if you are using Firebase Analytics
    }
  };
  // Initialize Firebase
  let app_tmp;
  if (getApps().length === 0) {
    console.log("FireBase start!");
    app_tmp = initializeApp(firebaseConfig);
  }

  const app = app_tmp;
  const auth = getAuth(app);
  const db = getFirestore();
  const storage = getStorage(app);

  export {ReactNativeAsyncStorage};
  export default app;
  export {auth};
  export {db};
  export {storage};
