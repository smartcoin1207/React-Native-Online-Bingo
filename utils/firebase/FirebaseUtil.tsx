import {
  collection,
  addDoc,
  setDoc,
  getDoc,
  getDocs,
  onSnapshot,
  query,
  where,
  doc,
  updateDoc,
  arrayUnion,
  deleteDoc,
  arrayRemove,
} from "firebase/firestore";
import { db, auth } from "./FirebaseInitialize";
import { AuthUserCallBackFunction, BingoRoom, BingoRoomsCallBackFunction, Player, User } from "../Types";
import { createUserWithEmailAndPassword, signInWithEmailAndPassword, onAuthStateChanged, updateProfile, signOut } from "firebase/auth";
import { isArray } from "lodash";

// export const getAuthUser = (callback:AuthUserCallBackFunction) => {
//     return onAuthStateChanged(auth, async (user) => {
//         if (user) {
//           const userinfo = await getUserInfoByUserId(user.uid);
//           callback(userinfo);
//         } else {
//           console.log("user is not logged in");
//         }
//       });
// }


//SignIn to Firebase
export const signInAuthUser = (email:string, password:string) =>  {
    return signInWithEmailAndPassword(auth, email, password)
    .then(async (userCredential) => {
      const user = userCredential.user;
      // Additional user data
      const displayName = user.displayName;
      const email = user.email;
      const photoURL = user.photoURL;
      const uid = user.uid;

      const userInfo: User = {uid: uid, email: email, displayName: displayName, photoURL: photoURL};

      return userInfo;
    })
    .catch((error) => {
      console.log(error)
      throw error;
    });
  }

//SignUp to Firebase
export const signUpAuthUser = (email:string, password:string, displayName: string, photoURL: string) =>  {
    return createUserWithEmailAndPassword(auth, email, password)
    .then((userCredential) => {
      // User creation successful
      const user = userCredential.user;
      const uid = userCredential.user.uid;
    
      // Update user profile with additional data
      updateProfile(user, {
        displayName: displayName,
        photoURL: photoURL
      }).then( async () => {
        // Additional user data updated successfully
        await setDoc(doc(collection(db, "users"), uid), {
            displayName: displayName,
            photoURL: photoURL
        });
        console.log("User created with additional data:", user);
      }).catch((error) => {
        console.error("Error updating profile:", error);
      });
    })
    .catch((error) => {
      // User creation failed
      console.error("Error creating user:", error);
    });
}

//Signout from Firebase
export const signOutAuthUser = () => {
    return signOut(auth).then(() => {
        console.log('log out')
    }).catch((error) => {
        console.log('logout failed')
    });
}

/**
 * get all waiting bingorooms
 */
export const getWaitingBingoRooms = (callback: BingoRoomsCallBackFunction) => {
    const q = query(collection(db, "bingos"));
    
    return onSnapshot(q, async (snapshot) => {
        const promises = snapshot.docs.map(async (document) => {
            // document id of bingo collection
            const bingoId = document.id;

            // user id of the bingo game host
            const uid = document.data().uid;

            const hostRef = doc(collection(db, "users"), uid);
            const hostUser = await getDoc(hostRef);
            const hostUserInfo = hostUser.data();

            // bingo game host userinfo
            
            // subscribers of created bingo game
            const subscriberRefs = document.data()?.subscribers;

            const subscriberNum = isArray(subscriberRefs)? subscriberRefs.length: '0';
            // const subscribersData = [];
            // let subscribersNum = 0;
            
            // Fetch full user data for each subscriber reference
            // for (const subscriberRef of subscriberRefs) {
            //     const subscriberDoc = await getDoc(subscriberRef);
            //     if (subscriberDoc.exists()) {
            //         subscribersData.push(subscriberDoc.data());
            //         subscribersNum++;
            //     }
            // }

            return {
                bingoId: bingoId,
                uid: uid,
                displayName: hostUserInfo?.displayName,
                photoURL: hostUserInfo?.photoURL,
                subscriberNum: subscriberNum,
            };            
        });

        const bingoRooms = await Promise.all(promises);
        callback(bingoRooms);
    });
};

export const createBingoRoom = async (uid: string) => {
    //Add your uid to the subscribers array
    const subscribers = [uid];
    const subscriberPromises = subscribers.map(subscriberId => doc(collection(db, "users"), subscriberId));
    const subscribersRef = await Promise.all(subscriberPromises);
    //Add a new bingo room document with uid and subscribers
    const docRef = await addDoc(collection(db, "bingos"), {
        uid: uid,
        subscribers: subscribersRef
    });

    return docRef.id;
}

export const joinBingoRoom = async (uid: string, bingoId: string) => {

    const userReference = doc(collection(db, "users"), uid);
    const docRef = doc(collection(db, "bingos"), bingoId);

    try {
        await updateDoc(docRef, {
            subscribers: arrayUnion(userReference)
        });

        console.log('New subscriber added successfully');
        return true;
    } catch (error) {
        console.error('Error adding new subscriber:', error);
        return false;
    }
}

export const exitBingoRoom = async (uid: string, bingoId:string) => {
    const docRef = doc(collection(db, "bingos"), bingoId);
    const userReference = doc(collection(db, "users"), uid);

    try {
        await updateDoc(docRef, {
            subscribers: arrayRemove(userReference)
        });
    } catch (error) {
        console.error('Error removing user from subscribers:', error);
    }
}

export const removeUserFromBingoRoom = async (uid: string, bingoId: string) => {
    const docRef = doc(collection(db, "bingos"), bingoId);
    const userReference = doc(collection(db, "users"), uid);

    try {
        await updateDoc(docRef, {
            subscribers: arrayRemove(userReference)
        });
    } catch (error) {
        console.error('Error removing user from subscribers:', error);
    }
}

export const getBingoRoomById = (bingoId: string, callback ) => {
    const docRef = doc(db, 'bingos', bingoId);

    return  onSnapshot(docRef, async (document) => {
        if(document.exists()) {
            // subscribers of created bingo game
            const subscriberRefs = document.data()?.subscribers;

            const subscribersData = [];
            let subscribersNum = 0;
            
            // Fetch full user data for each subscriber reference
            for (const subscriberRef of subscriberRefs) {
                const subscriberDoc = await getDoc(subscriberRef);
                if (subscriberDoc.exists()) {
                    const p:Player = {
                        uid: subscriberDoc.id,
                        displayName: subscriberDoc.data()?.displayName,
                        photoURL: subscriberDoc.data()?.photoURL
                    }

                    subscribersData.push(p);
                    subscribersNum++;
                }
            }

            if(subscribersData) {
                callback({ subscribersPlayers:subscribersData, ...document.data() });
            } else {
                callback({ ...document.data()});
            }
        } else {
            console.log('error');
            callback(false);
        }
    });
}

// export const exitBing