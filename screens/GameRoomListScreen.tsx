import { useEffect, useState } from "react";
import { useNavigation } from "@react-navigation/native";
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  Dimensions,
  TouchableOpacity,
  Button,
  FlatList,
  ActivityIndicator,
  Modal,
  TextInput,
} from "react-native";

import { Avatar, Image } from "react-native-elements";

import { createBingoRoom, getWaitingBingoRooms, joinBingoRoom } from "../utils/firebase/FirebaseUtil";
import { BingoRoom, User, NavigatorType } from "../utils/Types";
import { useDispatch, useSelector } from "react-redux";
import { RootState } from "../store";
import { setBingoRooms } from "../store/reducers/bingo/bingoRoomSlice";
import { modalBackgroundColor, modalContainerBackgroundColor } from "../utils/ValidationString";

const screenHeight = Dimensions.get("window").height;
const cellSize = screenHeight / 5;

const GameRoomScreen = () => {
  const navigator: NavigatorType = useNavigation();
  const authUser = useSelector((state: RootState) => state.auth.authUser);
  const isLoggedIn = useSelector((state: RootState) => state.auth.isLoggedIn);
  const [listLoading, setListLoading] = useState<boolean>(false);
  const [createRoomLoading, setCreateRoomLoading] = useState<boolean>(false);
  const [modalPasswordText, setModalPasswordText] = useState<string>('');
  const [modalVisible, setModalVisible] = useState<boolean>(false);
  const [password, setPassword] = useState<string>('');
  const [currentJoinBingoRoom, setCurrentJoinBingoRoom] = useState<BingoRoom>();
  const [isCreateModal, setIsCreateModal] = useState(true);
  const bingoRooms = useSelector((state: RootState) => state.bingoRoom.bingoRooms);
  const dispatch = useDispatch();

  useEffect(() => {
    setListLoading(true);
    getWaitingBingoRooms((bingoRooms: BingoRoom[]) => {
      dispatch(setBingoRooms(bingoRooms));
      setListLoading(false);
    });
  }, []);

  const createRoom = async () => {
    if(createRoomLoading) return false;
    
    if(authUser.uid) {
        setCreateRoomLoading(true);
        const newBingoId = await createBingoRoom(authUser.uid, password);
        setCreateRoomLoading(false);
        navigator.navigate("prepare", { isHost: true, bingoId: newBingoId });
    }

    setModalVisible(false)
  };

  const createRoomModal = () => {
    setModalVisible(true);
    setIsCreateModal(true);

    setModalPasswordText("パスワードを設定してください。 ")
  }
  
  const joinRoom = async (bingoRoomItem: BingoRoom) => {
    if(createRoomLoading) return false;

    if(password != bingoRoomItem.password) {
      setModalVisible(false)
      return false;
    }

    if(authUser.uid) {
      setCreateRoomLoading(true);
        const x = await joinBingoRoom(authUser.uid, bingoRoomItem.bingoId);
        setCreateRoomLoading(false);
        navigator.navigate("prepare", { isHost: false, bingoId: bingoRoomItem.bingoId })
    }
    setModalVisible(false)
  }

  const joinRoomModal = (item: BingoRoom) => {
    setCurrentJoinBingoRoom(item);
    setModalPasswordText("パスワードを入力してください。");
    setIsCreateModal(false)
    setModalVisible(true);
  }

  const renderPlayerItem = ({ item }: { item: BingoRoom }) => (
    <View style={styles.playerItem}>
      <Avatar
        rounded
        size="medium"
        source={{
          uri: item.photoURL,
        }}
      />
      <Text style={styles.nameTitle}>{item.displayName}</Text>
      <Text style={styles.nameTitle}>{item.subscriberNum}</Text>
      <Pressable
        style={styles.joinBtn}
        onPress={() => joinRoomModal (item)}
        >
        <Text style={styles.joinBtnText}>参加する</Text>
      </Pressable>
    </View>
  );

  const ProfileAvatar = (
    photoURL: string | undefined | null,
    displayName: string | null | undefined
  ): JSX.Element => {
    return (
      <View style={styles.profile}>
        <Avatar
          rounded
          size="large"
          source={{
            uri: photoURL,
          }}
        />
        <Text style={styles.textTitle}>{displayName}</Text>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      {ProfileAvatar(authUser?.photoURL, authUser?.displayName)}
      <Modal
        animationType="fade"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => {
        setModalVisible(false);
        }}
      >
          <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: modalBackgroundColor }}>
            
            <View style={styles.modalBody}>
              <Text style={styles.modalText}>
                {modalPasswordText}
              </Text>
              <TextInput
                style={styles.input}
                placeholder="パスワード"
                autoCapitalize="none"
                placeholderTextColor="grey"
                value={password}
                onChangeText={(text) => {
                  // Allow only English letters (both lowercase and uppercase) and numbers
                  setPassword(text);
                }}
              />
              {createRoomLoading ? <ActivityIndicator size="large" color="#007AFF" /> : 
              ''
              }
              <View style={styles.roomModalBtns}>
                <Pressable 
                        style={styles.modalCancelBtn}
                        onPress={() => setModalVisible(false)}
                    >
                    <Text style={styles.modalOkText}>   キャンセル   </Text>
                </Pressable>
                {isCreateModal 
                ? <Pressable
                        style={styles.modalOkBtn}
                        onPress={createRoom}
                    >
                    <Text style={styles.modalOkText}>　 設定 　</Text>
                  </Pressable> 
                : <Pressable
                        style={styles.modalOkBtn}
                        onPress={() => joinRoom(currentJoinBingoRoom)}
                    >
                    <Text style={styles.modalOkText}>   近   い   </Text>
                  </Pressable>
              }
                
              </View>
            </View>
          </View>
      </Modal>
      <View style={styles.btnList}>
        <Pressable
          style={styles.button}
          onPress={createRoomModal}
        >
          <Text style={styles.textTitle}>プレイルームを作成</Text>
        </Pressable>
      </View>
      <View style={styles.divider} />
      <Text style={styles.listTitle}>プレイルーム一覧</Text>
      
      {listLoading ? <ActivityIndicator size="large" color="#007AFF" /> : ''} 
        
      <View style={styles.FlatListStyle}>
        <FlatList
          data={bingoRooms}
          renderItem={renderPlayerItem}
          keyExtractor={(item, index) => index.toString()}
        />
      </View>
      
    </View>
  );
};

const styles = StyleSheet.create({
  profile: {
    // flexDirection: "row",
    justifyContent: "center",
    width: "100%",
    textAlign: "center",
    alignItems: "center",
  },
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "black",
    paddingHorizontal: 15,
    paddingVertical: 50,
    width: "100%",
  },
  btnList: {
    flexDirection: "row",
  },
  button: {
    backgroundColor: "#ff0000",
    paddingVertical: 8,
    paddingHorizontal: 6,
    marginHorizontal: 4,
    marginVertical: 4,
    marginTop: 10,
    borderRadius: 6,
  },
  textTitle: {
    fontSize: 20,
    color: "white",
    fontFamily: "serif",
    fontWeight: "700",
    textAlign: "center",
  },
  playerItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 10,
    borderBottomWidth: 1,
    borderBottomColor: "#ccc",
    width: "100%",
  },
  nameTitle: {
    color: "#ffffff",
    fontSize: 18,
  },
  ItemStatus: {
    fontSize: 15,
    color: "#ffffff",
  },
  joinBtn: {
    backgroundColor: "#ff0000",
    // paddingVertical: 8,
    // paddingHorizontal: 6,
    padding: 4,
    marginHorizontal: 4,
    marginVertical: 4,
    borderRadius: 6,
  },
  joinBtnText: {
    fontSize: 16,
    color: "white",
    fontFamily: "serif",
    fontWeight: "700",
    textAlign: "center",
  },
  listTitle: {
    fontSize: 20,
    color: "white",
    fontFamily: "serif",
    fontWeight: "700",
    textAlign: "center",
    marginTop: 30,
  },
  FlatListStyle: {
    flex: 1,
    borderWidth: 1,
    borderColor: "gray",
    borderRadius: 8,
    margin: 5,
  },
  divider: {
    borderBottomColor: 'grey',
    borderBottomWidth: 1,
    marginVertical: 10,
    width: '100%'
  },
  modalBody: {
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: modalContainerBackgroundColor,
    paddingHorizontal: 15,
    paddingVertical: 50,
    borderWidth: 1,
    borderColor: 'grey',
    borderRadius: 20,
    width: "80%",
  },
  modalOkBtn: {
    backgroundColor: '#ff0000',
    paddingVertical: 8,
    paddingHorizontal: 6,
    padding: 4,
    marginHorizontal: 4,
    marginVertical: 4,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: 'white'
  },
  modalCancelBtn: {
    backgroundColor: 'grey',
    paddingVertical: 8,
    paddingHorizontal: 6,
    padding: 4,
    marginHorizontal: 4,
    marginVertical: 4,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: 'white'
  },
  modalOkText: {
      fontSize: 16,
      color: 'white',
      fontFamily:'serif',
      fontWeight: '700',
      textAlign: 'center',
  },

  completedText: {
      fontSize: 30,
      color: 'white',
      width: '90%',
      fontFamily:'serif',
      fontWeight: '700',
      textAlign: 'center',
  },
  roomModalBtns: {
    flexDirection: 'row'
  },
  input: {
    // backgroundColor: '#ff000066',
    width: '80%',
    fontSize: 15,
    color: 'white',
    padding: 5,
    paddingHorizontal: 20,
    borderRadius: 25,
    borderWidth: 1,
    borderColor: 'grey',
    marginBottom: 20
  },
  modalText: {
    fontSize: 16,
    color: "white",
    fontFamily: "serif",
    fontWeight: "700",
    textAlign: "center",
    marginBottom: 20
  }

});

export default GameRoomScreen;
