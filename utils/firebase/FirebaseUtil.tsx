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
  deleteField
} from "firebase/firestore";
import {
    getStorage,
    ref,
    uploadBytesResumable,
    getDownloadURL,
    listAll,
    deleteObject
  } from "firebase/storage";
import { db, auth, storage } from "./FirebaseInitialize";
import { GameRoomsCallBackFunction, Player, User } from "../Types";
import { createUserWithEmailAndPassword, signInWithEmailAndPassword, updateProfile, signOut } from "firebase/auth";
import { isArray } from "lodash";

const userTable = "users";
const gameTable = "games";
const bingoTable = "bingos";

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
        await setDoc(doc(collection(db, userTable), uid), {
            displayName: displayName,
            photoURL: photoURL
        });
        // console.log("User created with additional data:", user);
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
export const getWaitingGameRooms = (callback: GameRoomsCallBackFunction) => {
    const q = query(collection(db, gameTable));
    
    return onSnapshot(q, async (snapshot) => {
        const promises = snapshot.docs.map(async (document) => {
            // document id of bingo collection
            const gameRoomId = document.id;

            // user id of the bingo game host
            const uid = document.data().uid;

            const hostRef = doc(collection(db, userTable), uid);
            const hostUser = await getDoc(hostRef);
            const hostUserInfo = hostUser.data();
            const displayRoomName = document.data().displayRoomName;
            const roomPassword = document.data().password;

            // subscribers of created bingo game
            const subscriberRefs = document.data()?.subscribers;
            const subscriberNum = isArray(subscriberRefs)? subscriberRefs.length: '0'; 
            
            return {
                gameRoomId: gameRoomId,
                displayRoomName: displayRoomName,
                password: roomPassword,
                uid: uid,
                displayName: hostUserInfo?.displayName,
                photoURL: hostUserInfo?.photoURL,
                subscriberNum: subscriberNum
            };            
        });

        const gameRooms : any[] = await Promise.all(promises);
        callback(gameRooms);
    });
};

export const createGameRoom = async (uid: string, displayRoomName: string,  password: string) => {
    const subscribers = [uid];
    const subscriberPromises = subscribers.map(subscriberId => doc(collection(db, userTable), subscriberId));
    const subscribersRef = await Promise.all(subscriberPromises);
    //Add a new bingo room document with uid and subscribers
    const docRef = await addDoc(collection(db, gameTable), {
        uid: uid,
        displayRoomName: displayRoomName,
        password: password,
        subscribers: subscribersRef,
        gameStarted: false,
        gameStopped: false
    });

    return docRef.id;
}

export const joinGameRoom = async (uid: string, gameRoomId: string) => {

    const userReference = doc(collection(db, userTable), uid);
    const docRef = doc(collection(db, gameTable), gameRoomId);

    try {
        const docSnap = await getDoc(docRef);
        const data = docSnap.data();

        if(data?.gameStarted || data?.gameStopped) {
            return false;
        }

        if (data?.subscribers.length < 10) {
            await updateDoc(docRef, {
                subscribers: arrayUnion(userReference)
            });
            console.log('New subscriber added successfully');
            return true;
        } else {
            console.log('Subscriber limit reached. Cannot add new subscriber.');
            return false;
        }
    } catch (error) {
        console.error('Error adding new subscriber:', error);
        return false;
    }
}

export const exitGameRoom = async (uid: string, gameRoomId:string, isHost: boolean) => {
    const docRef = doc(collection(db, gameTable), gameRoomId);

    if(!isHost) {
        const userReference = doc(collection(db, userTable), uid);
        try {
            await updateDoc(docRef, {
                subscribers: arrayRemove(userReference)
            });
        } catch (error) {
            console.error('Error removing user from subscribers:', error);
        }
    } else {
        deleteDoc(docRef)
        .then(() => {
            console.log("Document successfully deleted!");
        })
        .catch((error) => {
            console.error("Error removing document: ", error);
        });
    }
}


//
export const getGameRoom = (gameRoomId: string, callback: any ) => {
    const docRef = doc(db, gameTable, gameRoomId);

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
                    const subscriberDocData: any = subscriberDoc.data();
                    const p:Player = {
                        uid: subscriberDoc.id,
                        displayName: subscriberDocData?.displayName,
                        photoURL: subscriberDocData?.photoURL
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

//
export const startGameRoom = async (gameRoomId: string) => {
    const docRef = doc(db, gameTable, gameRoomId);
    try {
        await updateDoc(docRef, {
            gameStarted: true
        });

        // Add a new document to the "bingos" collection
        const bingosCollectionRef = collection(db, bingoTable);
        const newBingoDocRef = doc(bingosCollectionRef, gameRoomId);
        await setDoc(newBingoDocRef, {
        });

        console.log('New document added to "bingos" collection with ID:', newBingoDocRef.id);
    } catch (error) {
        console.log("game error");
    }
}

export const setPlayerGameSort  = async (gameRoomId: string, uids: string[]) => {
    const turnPlayerId = uids[0];
    try {
        const docRef = doc(collection(db, bingoTable), gameRoomId);
        await updateDoc(docRef, {
            sort: uids,
            turnPlayerId: turnPlayerId,
            turnNumber: 1,
            bingoCompleted: []
        });
    } catch (error) {
        console.log("bingo error")
    }
}

export const getBingo = (gameRoomId: string, callback : any ) => {
    const docRef = doc(db, bingoTable, gameRoomId);

    return  onSnapshot(docRef, async (document) => {
        if(document.exists()) {
            const bingo = document.data();
            callback(bingo)
        } else {
            console.log('error');
            callback(false);
        }
    });
}

export const setBingoNextNumberUpdate = async (uid: string, gameRoomId: string, bingoNextNumber: string) => {
    const docRef = doc(db, bingoTable, gameRoomId);
    
    try {
        await updateDoc(docRef, {
            bingoNextNumber: bingoNextNumber
        })
    } catch (error) {
        console.log("bingo error")
    }
}

export const setNextTurnPlayer = async (newTurnPlayerId:string, gameRoomId: string, newTurnNumber: number) => {
    const docRef = doc(db, bingoTable, gameRoomId);
    try {
        await updateDoc(docRef, {
            turnPlayerId: newTurnPlayerId,
            turnNumber: newTurnNumber,
            bingoNextNumber: ''
        })
    } catch (error) {
        console.log("bingo error")
    }
}

export const setBingoCompletedPlayer = async (uid: string, gameRoomId: string) => {
    const docRef = doc(db, bingoTable, gameRoomId);
    
    try {
        await updateDoc(docRef, {
            bingoCompleted: arrayUnion(uid),
            sort: arrayRemove(uid)
        })
    } catch (error) {
        console.log("bingo error")
    }
}
// upload image to firebase storage /images1 directory
export const uploadToFirebase = async (uri: string, name: string, onProgress: ((progress: number) => void) | undefined) => {
    const fetchResponse = await fetch(uri);
    const theBlob = await fetchResponse.blob();
  
    const imageRef = ref(storage, `images1/${name}`);
  
    const uploadTask = uploadBytesResumable(imageRef, theBlob);
  
    return new Promise<{ downloadUrl: string, metadata: any }>((resolve, reject) => {
      uploadTask.on(
        "state_changed",
        (snapshot) => {
          const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
          onProgress && onProgress(progress);
        },
        (error) => {
          // Handle unsuccessful uploads
          console.log(error);
          reject(error);
        },
        async () => {
          const downloadUrl = await getDownloadURL(uploadTask.snapshot.ref);
          
          resolve({
            downloadUrl,
            metadata: uploadTask.snapshot.metadata,
          });
        }
      );
    });
  };

  export const delectDirectory = async () => {
    const imageDirectoryRef = ref(storage, 'images1/1710757871941');

    try {
        await deleteObject(imageDirectoryRef);
        console.log('images1 directory deleted successfully');
      } catch (error) {
        console.error('Error deleting images1 directory:', error);
      }
  }

  export const deleteBingoCollection = async () => {
    const collectionRef = collection(db, bingoTable); // Replace 'bingo' with the name of the collection to delete
  
    const querySnapshot = await getDocs(collectionRef);
  
    querySnapshot.forEach(async (doc) => {
      await deleteDoc(doc.ref);
      console.log('xxx')
    });
  
    console.log('Collection "bingo" deleted successfully');
  };
  
  export const deleteGameCollection = async () => {
    const collectionRef = collection(db, gameTable); // Replace 'bingo' with the name of the collection to delete
  
    const querySnapshot = await getDocs(collectionRef);
  
    querySnapshot.forEach(async (doc) => {
      await deleteDoc(doc.ref);
    });
  
    console.log('Collection "game" deleted successfully');
  };
  