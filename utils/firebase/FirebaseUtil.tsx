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
  deleteField,
} from "firebase/firestore";
import {
  getStorage,
  ref,
  uploadBytesResumable,
  getDownloadURL,
  listAll,
  deleteObject,
} from "firebase/storage";
import { db, auth, storage } from "./FirebaseInitialize";
import {
  GameRoomsCallBackFunction,
  GameType,
  Player,
  User,
  setBingoCompletedPlayerParams,
} from "../Types";
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  updateProfile,
  signOut,
} from "firebase/auth";
import { isArray } from "lodash";

const userTable = "users";
const gameTable = "games";
const bingoTable = "bingos";
const penaltyTable = "penalty";
const gamePenaltyTable = "gamepenalty";

//SignIn to Firebase
export const signInAuthUser = (email: string, password: string) => {
  return signInWithEmailAndPassword(auth, email, password)
    .then(async (userCredential) => {
      const user = userCredential.user;

      // Additional user data
      const displayName = user.displayName;
      const email = user.email;
      const photoURL = user.photoURL;
      const uid = user.uid;

      const userInfo: User = {
        uid: uid,
        email: email,
        displayName: displayName,
        photoURL: photoURL,
      };

      return userInfo;
    })
    .catch((error) => {
      console.log(error);
      return false;
    });
};

//SignUp to Firebase
export const signUpAuthUser = (
  email: string,
  password: string,
  displayName: string,
  photoURL: string
) => {
  return createUserWithEmailAndPassword(auth, email, password)
    .then((userCredential) => {
      // User creation successful
      const user = userCredential.user;
      const uid = userCredential.user.uid;

      // Update user profile with additional data
      updateProfile(user, {
        displayName: displayName,
        photoURL: photoURL,
      })
        .then(async () => {
          // Additional user data updated successfully
          await setDoc(doc(collection(db, userTable), uid), {
            displayName: displayName,
            photoURL: photoURL,
          });
          // console.log("User created with additional data:", user);
        })
        .catch((error) => {
          console.error("Error updating profile:", error);
        });
    })
    .catch((error) => {
      // User creation failed
      console.error("Error creating user:", error);
    });
};

//Signout from Firebase
export const signOutAuthUser = () => {
  return signOut(auth)
    .then(() => {
      console.log("log out");
    })
    .catch((error) => {
      console.log("logout failed");
    });
};

/**
 * This is function that gets all the created game rooms that can be entered.
 *
 * @param {GameRoomsCallBackFunction} callback - callback function to handle data from firestore
 * @returns {void}
 */
export const getWaitingGameRooms = (callback: GameRoomsCallBackFunction) => {
  try {
    const q = query(
      collection(db, gameTable),
      where("gameRoomOpened", "==", true)
    );

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
        const subscriberNum = isArray(subscriberRefs)
          ? subscriberRefs.length
          : "0";

        return {
          gameRoomId: gameRoomId,
          displayRoomName: displayRoomName,
          password: roomPassword,
          uid: uid,
          displayName: hostUserInfo?.displayName,
          photoURL: hostUserInfo?.photoURL,
          subscriberNum: subscriberNum,
        };
      });

      const gameRooms: any[] = await Promise.all(promises);
      callback(gameRooms);
    });
  } catch (error) {
    console.log("waiting gamerooms error: ", error);
  }
};

/**
 * This function creates a new playroom.
 *
 * @param uid user id of playing room host
 * @param displayRoomName display name of playing room
 * @param password password of playing room
 * @returns {Promise<void>}
 */
export const createGameRoom = async (
  uid: string,
  displayRoomName: string,
  password: string
) => {
  try {
    const subscribers = [uid];
    const subscriberPromises = subscribers.map((subscriberId) =>
      doc(collection(db, userTable), subscriberId)
    );
    const subscribersRef = await Promise.all(subscriberPromises);

    // Add a new bingo room document with uid and subscribers
    const docRef = await addDoc(collection(db, gameTable), {
      uid: uid,
      displayRoomName: displayRoomName,
      password: password,
      subscribers: subscribersRef,
      gameRoomOpened: true,
      gameStarted: false,
      gameStopped: false,
    });

    return docRef.id;
  } catch (error) {
    // Handle the error here
    console.error(" CreateGameRoom An error occurred:", error);
    return false;
    // You can also throw the error to propagate it to the calling function
  }
};

/**
 * Enter a playroom created by another player
 *
 * @param uid player user id
 * @param gameRoomId gameRoomId where bingo game is being played
 * @returns {Promise<void>}
 */
export const joinGameRoom = async (uid: string, gameRoomId: string) => {
  const userReference = doc(collection(db, userTable), uid);
  const docRef = doc(collection(db, gameTable), gameRoomId);

  try {
    const docSnap = await getDoc(docRef);
    const data = docSnap.data();

    if (!data?.gameRoomOpened) {
      return false;
    }

    if (data?.subscribers.length < 10) {
      await updateDoc(docRef, {
        subscribers: arrayUnion(userReference),
      });
      console.log("New subscriber added successfully");
      return true;
    } else {
      console.log("Subscriber limit reached. Cannot add new subscriber.");
      return false;
    }
  } catch (error) {
    console.error("Error adding new subscriber:", error);
    return false;
  }
};

/**
 * this function causes the player to out from the playroom
 *
 * @param uid player user id
 * @param gameRoomId game room id
 * @param isHost if host or player
 * @returns {Promise<void>}
 */
export const exitGameRoom = async (
  uid: string,
  gameRoomId: string,
  isHost: boolean
) => {
  if (!gameRoomId) return false;

  const docRef = doc(collection(db, gameTable), gameRoomId);

  if (!isHost) {
    const userReference = doc(collection(db, userTable), uid);
    try {
      await updateDoc(docRef, {
        subscribers: arrayRemove(userReference),
        sort: arrayRemove(uid),
      });
    } catch (error) {
      console.error("Error removing user from subscribers:", error);
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
};

//
export const getGameRoom = (gameRoomId: string, callback: any) => {
  if (!gameRoomId) return false;

  const docRef = doc(db, gameTable, gameRoomId);

  return onSnapshot(docRef, async (document) => {
    if (document.exists()) {
      // subscribers of created bingo game
      const subscriberRefs = document.data()?.subscribers;

      const subscribersData = [];
      let subscribersNum = 0;

      // Fetch full user data for each subscriber reference
      for (const subscriberRef of subscriberRefs) {
        const subscriberDoc = await getDoc(subscriberRef);
        if (subscriberDoc.exists()) {
          const subscriberDocData: any = subscriberDoc.data();
          const p: Player = {
            uid: subscriberDoc.id,
            displayName: subscriberDocData?.displayName,
            photoURL: subscriberDocData?.photoURL,
          };
          subscribersData.push(p);
          subscribersNum++;
        }
      }

      if (subscribersData) {
        callback({ subscribersPlayers: subscribersData, ...document.data() });
      } else {
        callback({ ...document.data() });
      }
    } else {
      console.log("error");
      callback(false);
    }
  });
};

export const setGameRoomOpen = async (gameRoomId: string, open: boolean) => {
  if (!gameRoomId) return false;

  try {
    const docRef = doc(db, gameTable, gameRoomId);
    await updateDoc(docRef, {
      gameRoomOpened: open,
    });
  } catch (error) {
    console.log(error);
  }
};

export const setGameTypeF = async (gameRoomId: string, gameType: GameType) => {
  if (!gameRoomId) return false;

  try {
    const docRef = doc(db, gameTable, gameRoomId);
    await updateDoc(docRef, {
      gameType: gameType,
    });
  } catch (error) {}
};

//
export const startGameBingo = async (
  gameRoomId: string,
  turnPlayerId: string
) => {
  if (!gameRoomId) return false;
  console.log("startGame");

  const docRef = doc(db, gameTable, gameRoomId);
  try {
    await updateDoc(docRef, {
      gameStarted: true,
      gameType: GameType.Bingo,
      gameRoomOpened: false,
    });

    // Add a new document to the "bingos" collection
    const bingosCollectionRef = collection(db, bingoTable);
    const newBingoDocRef = doc(bingosCollectionRef, gameRoomId);
    await setDoc(newBingoDocRef, {
      turnPlayerId: turnPlayerId,
      turnNumber: 1,
      bingoCompleted: [],
    });

    console.log(
      'New document added to "bingos" collection with ID:',
      newBingoDocRef.id
    );
  } catch (error) {
    console.log("game error");
  }
};

export const setPlayerGameSort = async (gameRoomId: string, uids: string[]) => {
  console.log("setPlayerGameSort");
  if (!gameRoomId) {
    return false;
  }

  try {
    const docRef = doc(collection(db, gameTable), gameRoomId);
    await updateDoc(docRef, {
      sort: uids,
    });
  } catch (error) {
    console.log("game error");
  }
};

export const getBingo = (gameRoomId: string, callback: any) => {
  if (!gameRoomId) {
    return false;
  }
  const docRef = doc(db, bingoTable, gameRoomId);

  return onSnapshot(docRef, {
    next: (document) => {
      if (document.exists()) {
        const bingo = document.data();
        callback(bingo);
      } else {
        console.log("in getBingo Function() Document does not exist");
        callback(false);
      }
    },
    error: (error) => {
      console.error("In getBingo() Function, Error fetching bingo:", error);
      callback(null, error); // Pass the error to the callback function
    },
  });
};

/**
 * The number chosen by the player on that turn is displayed to all players.
 * @param uid - user id
 * @param gameRoomId  - gameRoomId where bingo game is being played
 * @param bingoNextNumber - Number chosen by player
 *
 * @returns {Promise<void>}
 */
export const setBingoNextNumberUpdate = async (
  uid: string,
  gameRoomId: string,
  bingoNextNumber: string
) => {
  console.log("setBingoNextNumberUpdate");
  const docRef = doc(db, bingoTable, gameRoomId);

  try {
    await updateDoc(docRef, {
      bingoNextNumber: bingoNextNumber,
    });
  } catch (error) {
    console.log("bingo error");
  }
};

/**
 * Desicde who the next player will be
 * @param newTurnPlayerId - next player user id
 * @param gameRoomId - gameRooomId where bingo game is being played
 * @param newTurnNumber - next turn number
 *
 * @returns {Promise<void>}
 */
export const setNextTurnPlayer = async (
  newTurnPlayerId: string,
  gameRoomId: string,
  newTurnNumber: number
) => {
  console.log("setNextTurnPlayer");
  const docRef = doc(db, bingoTable, gameRoomId);
  try {
    await updateDoc(docRef, {
      turnPlayerId: newTurnPlayerId,
      turnNumber: newTurnNumber,
      bingoNextNumber: "",
    });
  } catch (error) {
    console.log("bingo error");
  }
};

/**
 * Sets to firestore the bingo completion status for a player in a bingo game.
 * @param {setBingoCompletedPlayerParams} params - The parameters for setting bingo completion status.
 * @returns {Promise<void>} A promise that resolves when the firestore operation was successed
 */
export const setBingoCompletedPlayer = async ({
  uid,
  gameRoomId,
  cellStatus,
  cellValue,
}: setBingoCompletedPlayerParams) => {
  console.log("setBingoCompletedPlayer");
  const docRef = doc(db, bingoTable, gameRoomId);
  const newCompletedObj = {
    uid: uid,
    cellstatus: cellStatus,
    cellValue: cellValue,
  };

  try {
    await updateDoc(docRef, {
      bingoCompleted: arrayUnion(uid),
      bingoCompletedObj: arrayUnion(newCompletedObj),
      sort: arrayRemove(uid),
    });
  } catch (error) {
    console.log("bingo error");
  }
};

/**
 * Image upload function to firestore storage
 * @param uri - image file uri
 * @param name - image file name
 * @param onProgress - represents progress upload to firebase storage
 * @returns {Promise<{downloadUrl, metadata}>} - return download url and metadata for uploaded image
 */
export const uploadToFirebase = async (
  uri: string,
  name: string,
  onProgress: ((progress: number) => void) | undefined
) => {
  const fetchResponse = await fetch(uri);
  const theBlob = await fetchResponse.blob();

  const imageRef = ref(storage, `images1/${name}`);

  const uploadTask = uploadBytesResumable(imageRef, theBlob);

  return new Promise<{ downloadUrl: string; metadata: any }>(
    (resolve, reject) => {
      uploadTask.on(
        "state_changed",
        (snapshot) => {
          const progress =
            (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
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
    }
  );
};

export const delectDirectory = async () => {
  const imageDirectoryRef = ref(storage, "images1/1710757871941");

  try {
    await deleteObject(imageDirectoryRef);
    console.log("images1 directory deleted successfully");
  } catch (error) {
    console.error("Error deleting images1 directory:", error);
  }
};

export const deleteBingoCollection = async () => {
  console.log("deleteBingoCollection");
  const collectionRef = collection(db, bingoTable); // Replace 'bingo' with the name of the collection to delete

  const querySnapshot = await getDocs(collectionRef);

  querySnapshot.forEach(async (doc) => {
    await deleteDoc(doc.ref);
    console.log("xxx");
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

// Penalty Firebase API

export const getAllPenalty = async () => {
  const querySnapshot = await getDocs(collection(db, penaltyTable));
  const documents: any[] = [];
  querySnapshot.forEach((doc) => {
    documents.push({ id: doc.id, ...doc.data() });
  });
  return documents;
};

export const addPenalty = async (penaltyTitle: string) => {
  const docRef = await addDoc(collection(db, penaltyTable), {
    title: penaltyTitle,
  });

  return docRef.id;
};

export const updatePenalty = async (id: string, penaltyTitle: string) => {
  const docRef = doc(collection(db, penaltyTable), id);

  await updateDoc(docRef, {
    title: penaltyTitle,
  });
};

export const deletePenalty = async (id: string) => {
  const docRef = doc(collection(db, penaltyTable), id);

  await deleteDoc(docRef);
};

export const addPenaltyPatternA = async (
  gameRoomId: string,
  uid: string,
  penaltyId: string
) => {
  if (!gameRoomId) {
    return false;
  }

  try {
    const docRef = doc(collection(db, gamePenaltyTable), gameRoomId);
    const newPenaltyA = {
      uid: uid,
      penaltyId: penaltyId,
    };

    await updateDoc(docRef, {
      patternAList: arrayUnion(newPenaltyA),
    });
  } catch (error) {}
};

export const startGamePenalty = async (gameRoomId: string) => {
  if (!gameRoomId) return false;

  try {
    const newGamePenaltyDocRef = doc(
      collection(db, gamePenaltyTable),
      gameRoomId
    );

    await setDoc(newGamePenaltyDocRef, {
      patternASet: false,
      patternAList: [],
      patternB: "",
      patternC: 1,
    });
  } catch (error) {
    console.log(error);
  }
};

export const setPatternASet = async (gameRoomId: string) => {
  if (!gameRoomId) return false;

  try {
    const docRef = doc(collection(db, gamePenaltyTable), gameRoomId);
    await updateDoc(docRef, {
      patternASet: true,
    });
  } catch (error) {
    console.log(error);
  }
};

//
export const getGamePenalty = (gameRoomId: string, callback: any) => {
  if (!gameRoomId) return false;

  try {
    const docRef = doc(collection(db, gamePenaltyTable), gameRoomId);

    return onSnapshot(docRef, async (document) => {
      if (document.exists()) {
        callback({ ...document.data() });
      } else {
        console.log("error");
        callback(false);
      }
    });
  } catch (error) {
    console.log(error);
  }
};

// export const addPenaltyPatternA = async

// export const getPenaltyPatternA = async (gameRoomId:string) => {
//     if(!gameRoomId) return false;

//     try {

//     } catch (error) {

//     }
// }
