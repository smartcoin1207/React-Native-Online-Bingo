import { useEffect, useState } from "react";
import { useNavigation } from "@react-navigation/native";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Dimensions,
  Button,
  FlatList,
  ActivityIndicator,
  Modal,
  TextInput,
} from "react-native";
import { Avatar } from "react-native-elements";
import {
  createGameRoom,
  getWaitingGameRooms,
  joinGameRoom,
} from "../utils/firebase/FirebaseUtil";
import { GameRoom, NavigatorType } from "../utils/Types";
import { useDispatch, useSelector } from "react-redux";
import { RootState } from "../store";
import { setGameRooms } from "../store/reducers/bingo/gameRoomSlice";

import { customColors } from "../utils/Color";
import { validateRoomPassword, validateRoomTitle } from "../utils/ValidtionUtils";
import Icon from "react-native-vector-icons/FontAwesome";

const defaultAvatar = require('../assets/images/default1.png');
const { width: viewportWidth, height: viewportHeight } = Dimensions.get('window');


const GameRoomScreen = () => {
  const navigator: NavigatorType = useNavigation();

  const [listLoading, setListLoading] = useState<boolean>(false);
  const [createRoomLoading, setCreateRoomLoading] = useState<boolean>(false);
  const [roomModalVisible, setRoomModalVisible] = useState<boolean>(false);
  
  const [isCreateModal, setIsCreateModal] = useState(true);
  const [password, setPassword] = useState<string>("");
  const [gameRoomDisplayName, setGameRoomDisplayName] = useState<string>("");
  const [passwordError, setPasswordError] = useState<string>("");
  const [titleError, setTitleError] = useState<string>("");

  const authUser = useSelector((state: RootState) => state.auth.authUser);
  const [currentJoinGameRoom, setCurrentJoinGameRoom] = useState<GameRoom>({});

  //data from redux
  const gameRooms = useSelector(
    (state: RootState) => state.gameRoom.gameRooms
  );

  const dispatch = useDispatch();

  useEffect(() => {
    setListLoading(true);
    getWaitingGameRooms((gameRooms: GameRoom[]) => {
      
      dispatch(setGameRooms(gameRooms || []));
      setListLoading(false);
    });
  }, []);

  const createRoomModal = () => {
    setRoomModalVisible(true);
    setIsCreateModal(true);
    setTitleError("");
    setPasswordError("");
  };

  //新しいゲームルームを創造する。 Create new game room.
  const createRoom = async () => {
    const titleErr = validateRoomTitle(gameRoomDisplayName);
    const passwordErr = validateRoomPassword(password);

    setTitleError(titleErr || "");
    setPasswordError(passwordErr || "");

    if(titleErr || passwordErr) return false;

    if (createRoomLoading) return false;

    if (authUser.uid) {
      setCreateRoomLoading(true);

      //firebaseに新しいroomが作成されるまで待ちます。
      const newGameRoomId = await createGameRoom(authUser.uid, gameRoomDisplayName, password);
      setCreateRoomLoading(false);
      navigator.navigate("currentRoom", {
        isHost: true,
        gameRoomId: newGameRoomId,
      });
    }

    setRoomModalVisible(false);
  };

  const joinRoomModal = (item: GameRoom) => {
    if(item) {
      setPasswordError("");
      setCurrentJoinGameRoom(item);
      setIsCreateModal(false);
      setRoomModalVisible(true);
    }
  };

  const joinRoom = async () => {
    const passwordErr = validateRoomPassword(password);
    setPasswordError(passwordErr || "");

    if(passwordErr) return false;

    const gameRoomItem: GameRoom = currentJoinGameRoom;
    if (createRoomLoading) return false;

    if (password != gameRoomItem.password) {
      setRoomModalVisible(false);
      return false;
    }

    if (authUser.uid) {
      setCreateRoomLoading(true);
      await joinGameRoom(authUser.uid, gameRoomItem.gameRoomId);
      setCreateRoomLoading(false);
      
      navigator.navigate("currentRoom", {
        isHost: false,
        gameRoomId: gameRoomItem.gameRoomId,
      });
    }
    setRoomModalVisible(false);
  };

  const renderGameRoomItem = ({ item }: { item: GameRoom }) => (
    <TouchableOpacity activeOpacity={0.7} style={styles.playerItem}>
      <Avatar
        rounded
        size="medium"
        avatarStyle={{ height: '100%', width: '100%' }}
        source={ item.photoURL ?  {
          uri: item.photoURL,
        } : defaultAvatar}
      />
      <View>
        <Text style={[styles.nameTitle, { opacity: 0.5, fontSize: 12} ]}>ユーザー名</Text>
        <Text style={styles.nameTitle}>{item.displayName}</Text>
      </View>
      <View>
        <Text style={[styles.nameTitle, { opacity: 0.5, fontSize: 12, textAlign: 'center'} ]}>タイトル</Text>
        <View style={{flexDirection: 'row'}}>
          <Text style={styles.nameTitle}>{item.displayRoomName}</Text>
          <Text style={[styles.nameTitle, {opacity: 0.5}]}> ({item.subscriberNum})</Text>
        </View>
      </View>
            
      <TouchableOpacity style={styles.joinBtn} onPress={() => joinRoomModal(item)}>
        <Text style={styles.joinBtnText}>参加する</Text>
      </TouchableOpacity>
    </TouchableOpacity>
  );

  const ProfileAvatar = (
    photoURL: string | undefined | null,
    displayName: string | null | undefined
  ): JSX.Element => {
    return (
      <View style={[styles.profile]}>
        <Avatar
          rounded
          size="large"
          source={ photoURL ?  {
            uri: photoURL,
          }: defaultAvatar}
        />
        <Text style={[styles.textTitle, {fontSize: 20, marginTop: 5}]}>{displayName}</Text>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <Modal
        animationType="fade"
        transparent={true}
        visible={roomModalVisible}
        onRequestClose={() => {
          setRoomModalVisible(false);
        }}
      >
        <View
          style={{
            flex: 1,
            justifyContent: "center",
            alignItems: "center",
            backgroundColor: customColors.modalBackgroundColor,
          }}
        >
          <View style={styles.modalBody}>
            <Text style={[styles.modalRoomTitleText, { position: 'absolute', top: -20, padding: 10, paddingHorizontal: 20, borderWidth: 1, borderColor: customColors.blackGrey, borderRadius: 10, backgroundColor: customColors.modalContainerBackgroundColor }]}>
              { isCreateModal ? 'プレイルーム作成' : 'プレイルームに参加' }
            </Text>

            {isCreateModal && (
              <View style={{marginBottom: 10, width: '100%', alignItems: 'center'}}>
                <TextInput
                  style={styles.input}
                  placeholder="プレイルーム名"
                  autoCapitalize="none"
                  placeholderTextColor={customColors.blackGrey}
                  value={gameRoomDisplayName}
                  onChangeText={(text) => {
                    setGameRoomDisplayName(text);
                  }}
                />
                {titleError !== "" && (
                    <Text style={styles.errText}>{titleError}</Text>
                )}
              </View>
              
              )
            } 
            
            {/* <Text style={styles.modalText}>{gameRoomPasswordDescription}</Text> */}
            <View style={{marginBottom: 10, width: '100%', alignItems: 'center'}}>
              <TextInput
                style={styles.input}
                placeholder="パスワード"
                autoCapitalize="none"
                placeholderTextColor = {customColors.blackGrey}
                value={password}
                onChangeText={(text) => {
                  setPassword(text);
                }}
              />
              {passwordError !== "" && (
                  <Text style={styles.errText}>{passwordError}</Text>
              )}
            </View>
            
            <View style={styles.roomModalBtns}>
              <TouchableOpacity
                style={styles.modalCancelBtn}
                onPress={() => setRoomModalVisible(false)}
              >
                <Text style={styles.roomModalButtonText}> キャンセル </Text>
              </TouchableOpacity>
              {isCreateModal ? (
                <TouchableOpacity style={styles.modalOkBtn} onPress={createRoom}>
                  <Text style={styles.roomModalButtonText}>　 作成 　</Text>
                </TouchableOpacity>
              ) : (
                <TouchableOpacity
                  style={styles.modalOkBtn}
                  onPress={joinRoom}
                >
                  <Text style={[styles.roomModalButtonText, { letterSpacing: 10, paddingHorizontal: 20 }]}>参加</Text>
                </TouchableOpacity>
              )}
            </View>
            {createRoomLoading ? (
              <ActivityIndicator size="large" color="#007AFF" />
            ) : (
              ""
            )}
          </View>
        </View>
      </Modal>

      <View style={{ 
        marginHorizontal: 20, // This will set a horizontal margin of 20 units
        alignItems: 'center', 
        padding: 10, 
        backgroundColor: customColors.customDarkBlueBackground,
        borderWidth: 1,
        borderColor: customColors.customLightBlue1,
        borderRadius: 20, 
        flexDirection: 'row', 
        justifyContent: 'space-between',
        width: '96%'
      }}>
        {ProfileAvatar(authUser?.photoURL, authUser?.displayName)}

        <TouchableOpacity style={[styles.button, {flexDirection: 'row', alignSelf: 'center'}]} onPress={createRoomModal}>
          <View style={{padding: 5}}><Icon name="plus" size={20} color="white" /></View>
          <Text style={styles.textTitle}> プレイルームを作成</Text>
        </TouchableOpacity>
      </View>
      
      <View style={styles.FlatListStyle}>
        <View style={{ position: 'absolute', top: -20, borderRadius: 10, borderColor: customColors.customLightBlue1, borderWidth: 0, backgroundColor: customColors.black, paddingVertical: 5, paddingHorizontal: 15 }}>
          <Text style={styles.listTitle}>プレイルーム一覧</Text>
        </View>

        {listLoading ? <ActivityIndicator style={{position: 'absolute', top: '50%'}} size="large" color="#007AFF" /> : ""}

        <FlatList
          data={gameRooms}
          renderItem={renderGameRoomItem}
          keyExtractor={(item, index) => index.toString()}
        />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: customColors.black,
    paddingTop: 35,
    width: "100%",
  },

  profile: {
    justifyContent: "center",
    textAlign: "center",
    alignItems: "center",
    backgroundColor: 'black',
    borderRadius: 20,
    padding: 10,
    paddingHorizontal: 20
  },
  
  button: {
    backgroundColor: customColors.customDarkBlue1,
    paddingVertical: 6,
    paddingHorizontal: 12,
    marginHorizontal: 4,
    borderRadius: 30,
    borderWidth: 0.8,
    borderColor: customColors.customLightBlue1
  },

  textTitle: {
    fontSize: 16,
    color: customColors.white,
    fontFamily: "serif",
    fontWeight: "700",
    textAlign: "center",
  },

  playerItem: {
    display:'flex',
    position: 'relative',
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    width: "100%",
    marginVertical: 3,
    padding: 10,
    paddingHorizontal: 10,
    backgroundColor: customColors.customDarkBlue,
    borderWidth: 0.8,
    borderColor: customColors.customDarkGreen1,
    borderRadius: 10,
  },

  nameTitle: {
    color: customColors.white,
    fontSize: 20,
  },
  
  ItemStatus: {
    fontSize: 15,
    color: customColors.white,
  },

  joinBtn: {
    display :'flex',
    backgroundColor: customColors.customLightBlue,
    padding: 6,
    marginVertical: 4,
    borderRadius: 6,
  },

  joinBtnText: {
    fontSize: 16,
    color: customColors.white,
    fontFamily: "serif",
    fontWeight: "700",
    textAlign: "center",
  },

  listTitle: {
    fontSize: 25,
    color: "white",
    fontFamily: "serif",
    fontWeight: "700",
    textAlign: "center",
  },

  FlatListStyle: {
    flex: 1,
    borderWidth: 1,
    borderColor: customColors.customLightBlue1,
    borderRadius: 20,
    backgroundColor: customColors.customDarkBlueBackground,
    alignItems: 'center',
    paddingTop: 30,
    paddingBottom:5,
    paddingHorizontal: 6,
    marginTop: 30,
    width: '96%'
  },

  divider: {
    borderBottomColor: customColors.blackGrey,
    borderBottomWidth: 1,
    marginVertical: 10,
    width: "100%",
  },
  modalBody: {
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: customColors.modalContainerBackgroundColor,
    paddingHorizontal: 15,
    paddingVertical: 50,
    borderWidth: 1,
    borderColor: customColors.blackGrey,
    borderRadius: 20,
    width: "80%",
  },
  modalRoomTitleText: {
    fontSize: 22,
    color: customColors.white,
    fontFamily: "serif",
    fontWeight: "700",
    textAlign: "center",
    marginBottom: 20
  },
  modalOkBtn: {
    backgroundColor: customColors.customLightBlue,
    paddingVertical: 8,
    paddingHorizontal: 6,
    padding: 4,
    marginHorizontal: 4,
    marginVertical: 4,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: customColors.white,
  },
  modalCancelBtn: {
    backgroundColor: customColors.blackGrey,
    paddingVertical: 8,
    paddingHorizontal: 6,
    padding: 4,
    marginHorizontal: 4,
    marginVertical: 4,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: customColors.white,
  },
  roomModalButtonText: {
    fontSize: 16,
    color: customColors.white,
    fontFamily: "serif",
    fontWeight: "700",
    textAlign: "center",
  },
  completedText: {
    fontSize: 30,
    color: customColors.white,
    width: "90%",
    fontFamily: "serif",
    fontWeight: "700",
    textAlign: "center",
  },
  roomModalBtns: {
    flexDirection: "row",
    width: '80%',
    justifyContent: 'space-between'
  },
  input: {
    width: "80%",
    fontSize: 15,
    color: customColors.white,
    padding: 5,
    paddingHorizontal: 15,
    paddingVertical: 7,
    borderRadius: 25,
    borderWidth: 1,
    borderColor: customColors.blackGrey,
    marginTop: 20,
  },
  modalText: {
    fontSize: 16,
    color: customColors.white,
    fontFamily: "serif",
    alignItems: 'flex-start',
    marginBottom: 5,
  },
  errText: {
    color: customColors.blackRed,
    fontSize: 16,
  },
});

export default GameRoomScreen;
