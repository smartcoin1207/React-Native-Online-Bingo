// Import Firebase
import 'firebase/firestore';
import { initializeApp, getApps } from 'firebase/app';
import { getAuth } from 'firebase/auth'; // Import Firebase Authentication module
import { getFirestore } from "firebase/firestore";
import { getStorage } from 'firebase/storage';

const firebaseConfig = {
    apiKey: "AIzaSyDed59tOofXTdNWbrJQ1luN25Ik-JZ69Ak",
    authDomain: "mimi-base.firebaseapp.com",
    databaseURL: "https://mimi-base-default-rtdb.firebaseio.com/",
    projectId: "mimi-base",
    storageBucket: "mimi-base.appspot.com",
    appId: "1:960958133531:android:a100ce786673cdc5934fbe"
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


  export default app;
  export {auth};
  export {db};
  export {storage};
