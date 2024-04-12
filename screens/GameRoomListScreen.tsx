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

const defaultAvatar = require('../assets/images/default1.png');
const { width: viewportWidth, height: viewportHeight } = Dimensions.get('window');


const GameRoomScreen = () => {
  const navigator: NavigatorType = useNavigation();

  const [listLoading, setListLoading] = useState<boolean>(false);
  const [createRoomLoading, setCreateRoomLoading] = useState<boolean>(false);
  const [roomModalVisible, setRoomModalVisible] = useState<boolean>(false);
  
  const [isCreateModal, setIsCreateModal] = useState(true);
  const [gameRoomDisplayName, setGameRoomDisplayName] = useState<string>("");
  const [gameRoomPasswordDescription, setGameRoomPasswordDescription] = useState<string>("");
  const [password, setPassword] = useState<string>("");

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
      
      dispatch(setGameRooms(gameRooms));
      setListLoading(false);
    });
  }, []);


  const createRoomModal = () => {
    setRoomModalVisible(true);
    setIsCreateModal(true);

    setGameRoomPasswordDescription("パスワードを設定してください。 ");
  };

  //新しいゲームルームを創造する。 Create new game room.
  const createRoom = async () => {
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
      setCurrentJoinGameRoom(item);
      setGameRoomPasswordDescription("パスワードを入力してください。");
      setIsCreateModal(false);
      setRoomModalVisible(true);
    }
  };

  const joinRoom = async () => {
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
        <Text style={[styles.nameTitle, { opacity: 0.5, fontSize: 15} ]}>ユーザー名</Text>
        <Text style={styles.nameTitle}>{item.displayName}</Text>
      </View>
      <View>
        <Text style={[styles.nameTitle, { opacity: 0.5, fontSize: 15} ]}>部屋のタイトル</Text>
        <Text style={styles.nameTitle}>{item.displayRoomName}</Text>
      </View>
      <Text style={{position: 'absolute', top: 5, left: 5, fontSize: 18, fontWeight: '500', color: 'white'}}>{item.subscriberNum}</Text>
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
      <View style={[styles.profile, {flexDirection: 'row'}]}>
        <Avatar
          rounded
          size="large"
          source={ photoURL ?  {
            uri: photoURL,
          }: defaultAvatar}
        />
        <Text style={[styles.textTitle, {marginLeft: 15}]}>{displayName}</Text>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      {ProfileAvatar(authUser?.photoURL, authUser?.displayName)}
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

            {isCreateModal ? (
              <>
                <Text style={styles.modalRoomTitleText}>プレイルーム作成</Text>
                
                <TextInput
                  style={styles.input}
                  placeholder="プレイルーム名"
                  autoCapitalize="none"
                  placeholderTextColor={customColors.blackGrey}
                  value={gameRoomDisplayName}
                  onChangeText={(text) => {
                    // Allow only English letters (both lowercase and uppercase) and numbers
                    setGameRoomDisplayName(text);
                  }}
                />
              </>
            ) : 
            <Text style={styles.modalRoomTitleText}>プレイルームに参加</Text>
            }
            
            <Text style={styles.modalText}>{gameRoomPasswordDescription}</Text>
            <TextInput
              style={styles.input}
              placeholder="パスワード"
              autoCapitalize="none"
              placeholderTextColor = {customColors.blackGrey}
              value={password}
              onChangeText={(text) => {
                // Allow only English letters (both lowercase and uppercase) and numbers
                setPassword(text);
              }}
            />
            {createRoomLoading ? (
              <ActivityIndicator size="large" color="#007AFF" />
            ) : (
              ""
            )}
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
                  <Text style={styles.roomModalButtonText}> 参加 </Text>
                </TouchableOpacity>
              )}
            </View>
          </View>
        </View>
      </Modal>
      <View style={styles.btnList}>
        <TouchableOpacity style={styles.button} onPress={createRoomModal}>
          <Text style={styles.textTitle}>プレイルームを作成</Text>
        </TouchableOpacity>
      </View>
      <View style={styles.divider} />
      <Text style={styles.listTitle}>プレイルーム一覧</Text>

      {listLoading ? <ActivityIndicator size="large" color="#007AFF" /> : ""}

      <View style={styles.FlatListStyle}>
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
  profile: {
    justifyContent: "center",
    width: "100%",
    textAlign: "center",
    alignItems: "center",
  },
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: customColors.black,
    paddingHorizontal: viewportWidth*0.03,
    paddingVertical: 50,
    width: "100%",
  },
  btnList: {
    flexDirection: "row",
  },
  button: {
    backgroundColor: customColors.blackGreen,
    paddingVertical: 8,
    paddingHorizontal: 6,
    marginHorizontal: 4,
    marginVertical: 4,
    marginTop: 10,
    borderRadius: 6,
  },
  textTitle: {
    fontSize: 20,
    color: customColors.white,
    fontFamily: "serif",
    fontWeight: "700",
    textAlign: "center",
  },
  playerItem: {
    position: 'relative',
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    width: "100%",
    marginVertical: 5,
    padding: 10,
    paddingHorizontal: 20,
    backgroundColor: '#2f3835b8',
    borderWidth: 1,
    borderColor: customColors.blackGrey,
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
    backgroundColor: customColors.blackGreen,
    padding: 4,
    marginHorizontal: 4,
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
    fontSize: 30,
    color: customColors.white,
    fontFamily: "serif",
    fontWeight: "700",
    textAlign: "center",
    marginTop: 30,
  },
  FlatListStyle: {
    flex: 1,
    // borderWidth: 1,
    // borderColor: customColors.blackGrey,
    // borderRadius: 8,
    margin: 5,
    width: '95%'
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
    backgroundColor: customColors.blackGreen,
    paddingVertical: 8,
    paddingHorizontal: 6,
    padding: 4,
    marginHorizontal: 4,
    marginVertical: 4,
    borderRadius: 6,
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
    borderRadius: 6,
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
  },
  input: {
    width: "80%",
    fontSize: 15,
    color: customColors.white,
    padding: 5,
    paddingHorizontal: 20,
    borderRadius: 25,
    borderWidth: 1,
    borderColor: customColors.blackGrey,
    marginBottom: 20,
  },
  modalText: {
    fontSize: 16,
    color: customColors.white,
    fontFamily: "serif",
    alignItems: 'flex-start',
    marginBottom: 5,
  },
});

export default GameRoomScreen;
