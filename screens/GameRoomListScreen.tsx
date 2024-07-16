import { useCallback, useEffect, useLayoutEffect, useState } from "react";
import React from "react";

import { useFocusEffect, useNavigation } from "@react-navigation/native";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  FlatList,
  ActivityIndicator,
  Modal,
  TextInput,
  Dimensions,
} from "react-native";
import { Avatar } from "react-native-elements";
import {
  createGameRoom,
  getWaitingGameRooms,
  joinGameRoom,
} from "../utils/firebase/FirebaseUtil";
import {
  GameRoom,
  NavigatorType,
  UnsubscribeOnsnapCallbackFunction,
} from "../utils/Types";
import { useDispatch, useSelector } from "react-redux";
import { RootState } from "../store";
import { setGameRooms } from "../store/reducers/bingo/gameRoomSlice";

import { customColors } from "../utils/Color";
import {
  validateRoomPassword,
  validateRoomTitle,
} from "../utils/ValidtionUtils";
import Icon from "react-native-vector-icons/Ionicons";
import { Tooltip } from "react-native-elements";
import ConfirmModal from "../components/ConfirmModal";
import { useSafeAreaInsets } from "react-native-safe-area-context";

const defaultAvatar = require("../assets/images/default1.png");
const { width: viewportWidth, height: viewportHeight } = Dimensions.get("window");

const GameRoomScreen = () => {
  const navigation = useNavigation();

  const [listLoading, setListLoading] = useState<boolean>(false);
  const [createRoomLoading, setCreateRoomLoading] = useState<boolean>(false);
  const [roomModalVisible, setRoomModalVisible] = useState<boolean>(false);
  const [passwordSetModalVisible, setPasswordSetModalVisible] = useState<boolean>(false);
  const [isCreateModal, setIsCreateModal] = useState(true);
  const [isPasswordSet, setIsPasswordSet] = useState<boolean>(false);
  const [password, setPassword] = useState<string>("");
  const [gameRoomDisplayName, setGameRoomDisplayName] = useState<string>("");
  const [passwordError, setPasswordError] = useState<string>("");
  const [titleError, setTitleError] = useState<string>("");
  const [searchInputText, setSearchInputText] = useState<string>("");
  const [searchQuery, setSearchQuery] = useState<string>("");

  const authUser = useSelector((state: RootState) => state.auth.authUser);
  const [currentJoinGameRoom, setCurrentJoinGameRoom] = useState<
    GameRoom | undefined
  >(undefined);

  const gameRooms = useSelector((state: RootState) => state.gameRoom.gameRooms);

  const dispatch = useDispatch();
  const insets = useSafeAreaInsets();
  console.log(insets.bottom, "333")

  useFocusEffect(
    useCallback(() => {
      const uid = authUser.uid;
      if(!uid) {
        return () => {}
      };
      setListLoading(true);

      const unsubscribe: UnsubscribeOnsnapCallbackFunction =
        getWaitingGameRooms( uid ,searchQuery,  (gameRooms: GameRoom[]) => {
          dispatch(setGameRooms(gameRooms || []));
          setListLoading(false);
        });

      return () => unsubscribe();
    }, [searchQuery])
  );

  useEffect(() => {
    if(!roomModalVisible) {
      setGameRoomDisplayName('');
      setPassword('')
    }
  }, [roomModalVisible])

  useLayoutEffect(() => {
    navigation.setOptions({
      headerLeft: () => (
        <Icon name="chevron-back-sharp" size={30} color="white" style={{marginRight: 20, marginLeft: -10 }} onPress={() => {navigation.goBack()}} />
      ),
    })
  }, [navigation])

  const createRoomPasswordSet = () => {
    setPasswordSetModalVisible(true);
  };

  const handleCreateModalWithPassword = (isPassword: boolean) => {
    setIsPasswordSet(isPassword);
    setPasswordSetModalVisible(false);
    createRoomModal();
  }

  const createRoomModal = () => {
    setRoomModalVisible(true);
    setIsCreateModal(true);
    setTitleError("");
    setPasswordError("");
  }

  //新しいゲームルームを創造する。 Create new game room.
  const createRoom = async () => {
    const titleErr = validateRoomTitle(gameRoomDisplayName);

    const passwordErr = isPasswordSet ? validateRoomPassword(password) : '';

    setTitleError(titleErr || "");

    if(isPasswordSet) {
      setPasswordError(passwordErr || "");
    }

    if (titleErr || passwordErr) return false;

    if (createRoomLoading) return false;

    if (authUser.uid) {
      setCreateRoomLoading(true);

      //firebaseに新しいroomが作成されるまで待ちます。
      const newGameRoomId = await createGameRoom(
        authUser.uid,
        gameRoomDisplayName,
        password
      );

      setCreateRoomLoading(false);
      navigation.navigate("currentRoom", {
        isHostParam: true,
        gameRoomIdParam: newGameRoomId as string,
      });
    }

    setRoomModalVisible(false);
  };

  const joinRoomModal = async (item: GameRoom) => {
    console.log(item, "----------------------")
    if(item.password == '') {
      console.log("without password");
      setCurrentJoinGameRoom(item);
      if(item) {
        await joinRoom(item);
      }
    } else {
      if (item) {
        setCurrentJoinGameRoom(item);
        setPasswordError("");
        setIsCreateModal(false);
        setRoomModalVisible(true);
      }
    }
  };

  const joinRoom = async (gameRoomItem: GameRoom | undefined) => {
    console.log("--0")

    if(gameRoomItem?.password) {
      const passwordErr = validateRoomPassword(password);
      setPasswordError(passwordErr || "");
      if (passwordErr) {
        return false;
      }
    }
    console.log("--1");

    if (!gameRoomItem) return false;
    console.log("--2")

    if (createRoomLoading) return false;
    console.log("--3")

    if (password != gameRoomItem.password) {
      setRoomModalVisible(false);
      return false;
    }
    console.log("--4")

    if (authUser.uid) {
      setCreateRoomLoading(true);
      await joinGameRoom(authUser.uid, gameRoomItem.gameRoomId);
      setCreateRoomLoading(false);

      navigation.navigate("currentRoom", {
        isHostParam: false,
        gameRoomIdParam: gameRoomItem.gameRoomId,
      });
    }

    setRoomModalVisible(false);
  };

  const handleSearchQuery = async () => {
    setSearchQuery(searchInputText);
  };

  const handlePasswordSetModalVisible = (isVisible:  boolean) => {
    setPasswordSetModalVisible(isVisible);
  }

  const handleRoomModalVisible = (isVisible: boolean) => {
    setRoomModalVisible(isVisible);
  }

  const renderGameRoomItem = ({ item }: { item: GameRoom }) => (
    <TouchableOpacity activeOpacity={0.7} style={styles.playerItem}>
      <Avatar
        rounded
        size="medium"
        avatarStyle={{ height: "100%", width: "100%" }}
        source={
          item.photoURL
            ? {
                uri: item.photoURL,
              }
            : defaultAvatar
        }
      />
      <View>
        <Text style={[styles.nameTitle, { opacity: 0.5, fontSize: 12 }]}>
          ユーザー名
        </Text>
        <Text style={styles.nameTitle}>{item.displayName}</Text>
      </View>
      <View style={{alignItems: 'center'}}>
        <Text
          style={[
            styles.nameTitle,
            { opacity: 0.5, fontSize: 12, textAlign: "center" },
          ]}
        >
          ルーム名
        </Text>

        <Tooltip
          popover={
            <Text style={styles.tooltipText}>
              {item.displayRoomName}
            </Text>
          }
          backgroundColor="#333"
          withOverlay={false}
          highlightColor="#000"
        >
          <Text style={[styles.nameTitle, {maxWidth: viewportWidth - 280, textAlign: 'center'}]} numberOfLines={1}>{item.displayRoomName}</Text>
        </Tooltip>

      </View>

      <View>
        <Text
          style={[
            styles.nameTitle,
            { opacity: 0.5, fontSize: 12, textAlign: "center" },
          ]}
        >
          人数
        </Text>
        <Text style={[styles.nameTitle, { opacity: 1, textAlign: 'center' }]}>
          {item.subscriberNum}
        </Text>
      </View>

      <TouchableOpacity
        style={styles.joinBtn}
        onPress={() => joinRoomModal(item)}
      >
        <Text style={styles.joinBtnText}>参加する</Text>
        {createRoomLoading && currentJoinGameRoom?.gameRoomId == item.gameRoomId && (
          <View style={{position: 'absolute', left: '30%'}}>
            <ActivityIndicator size="large" color="#007AFF" />
          </View>
        )}
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
          source={
            photoURL
              ? {
                  uri: photoURL,
                }
              : defaultAvatar
          }
        />
        <Text style={[styles.textTitle, { fontSize: 20, marginTop: 5 }]}>
          {displayName}
        </Text>
      </View>
    );
  };

  return (
    <View style={[styles.container, { paddingBottom: insets.bottom }]}>

      <ConfirmModal
        isVisible={passwordSetModalVisible}
        setVisible={handlePasswordSetModalVisible}
        messageText="パスワードを設定しますか？"
        onConfirm={() => handleCreateModalWithPassword(true)}
        onCancel={() => handleCreateModalWithPassword(false)}
      />

      <ConfirmModal
        isVisible={roomModalVisible}
        setVisible={handleRoomModalVisible}
        messageText={isCreateModal ? "プレイルーム作成" : "プレイルームに参加"}
        confirmText={isCreateModal ? '作成' : '参加'}
        cancelText={"キャンセル"}
        onConfirm={() => isCreateModal ? createRoom() : joinRoom(currentJoinGameRoom)}
        onCancel={() => {}}

        middleElement={
          <>
            {isCreateModal && (
                <View
                  style={{
                    marginBottom: 10,
                    width: "100%",
                    alignItems: "center",
                  }}
                >
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
            )}

            {((isPasswordSet && isCreateModal) || (!isCreateModal && currentJoinGameRoom?.password !=  '')) && (
              <View
              style={{ marginBottom: 10, width: "100%", alignItems: "center" }}
            >
              <TextInput
                style={styles.input}
                placeholder="パスワード"
                autoCapitalize="none"
                placeholderTextColor={customColors.blackGrey}
                value={password}
                keyboardType="visible-password"
                autoCorrect={true}
                onChangeText={(text) => {
                  setPassword(text);
                }}
              />
              {passwordError !== "" && (
                <Text style={styles.errText}>{passwordError}</Text>
              )}
            </View>
            )}
          </>
        }
        bottomElement={
          <>
            {createRoomLoading ? (
              <ActivityIndicator size="large" color="#007AFF" />
            ) : (
              ""
            )}
          </>
        }
      />

      <View
        style={{
          marginHorizontal: 20, // This will set a horizontal margin of 20 units
          alignItems: "center",
          padding: 10,
          backgroundColor: customColors.customDarkBlueBackground,
          borderWidth: 1,
          borderColor: customColors.customLightBlue1,
          borderRadius: 20,
          flexDirection: "row",
          justifyContent: "space-between",
          width: "96%",
        }}
      >
        {ProfileAvatar(authUser?.photoURL, authUser?.displayName)}

        <TouchableOpacity
          style={[styles.button, { flexDirection: "row", alignSelf: "center" }]}
          onPress={createRoomPasswordSet}
        >
          <View style={{ padding: 5 }}>
            <Icon name="add-sharp" size={20} color="white" />
          </View>
          <Text style={styles.textTitle}> プレイルームを作成</Text>
        </TouchableOpacity>
      </View>

      <View style={{ padding: 10 }}>
        <View
          style={{
            width: "100%",
            flexDirection: "row",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <TextInput
            style={[styles.input, { marginTop: 0, width: "70%" }]}
            placeholder="プレイルーム検索"
            autoCapitalize="none"
            placeholderTextColor={customColors.blackGrey}
            value={searchInputText}
            onChangeText={(text) => {
              setSearchInputText(text);
            }}
          />

          <TouchableOpacity
            style={{
              width: "25%",
              padding: 10,
              paddingHorizontal: 20,
              borderWidth: 1,
              borderColor: customColors.customLightBlue1,
              borderRadius: 20,
              backgroundColor: customColors.customDarkBlue1,
            }}

            onPress={handleSearchQuery}
          >
            <Text style={styles.joinBtnText}>検索</Text>
          </TouchableOpacity>
        </View>
      </View>

      <View style={styles.FlatListStyle}>
        <View
          style={{
            position: "absolute",
            top: -20,
            borderRadius: 10,
            borderColor: customColors.customLightBlue1,
            borderWidth: 0,
            backgroundColor: customColors.black,
            paddingVertical: 5,
            paddingHorizontal: 15,
          }}
        >
          <Text style={styles.listTitle}>プレイルーム一覧</Text>
        </View>

        {listLoading ? (
          <ActivityIndicator
            style={{ position: "absolute", top: "50%" }}
            size="large"
            color="#007AFF"
          />
        ) : (
          ""
        )}

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
    // backgroundColor: customColors.black,
    // paddingTop: 35,
    width: "100%",
  },

  profile: {
    justifyContent: "center",
    textAlign: "center",
    alignItems: "center",
    backgroundColor: "black",
    borderRadius: 20,
    padding: 10,
    paddingHorizontal: 20,
  },

  button: {
    backgroundColor: customColors.customDarkBlue1,
    paddingVertical: 6,
    paddingHorizontal: 12,
    marginHorizontal: 4,
    borderRadius: 30,
    borderWidth: 0.8,
    borderColor: customColors.customLightBlue1,
  },

  textTitle: {
    fontSize: 16,
    color: customColors.white,
    fontFamily: "NotoSansJP_400Regular",
    fontWeight: "700",
    textAlign: "center",
  },

  playerItem: {
    display: "flex",
    position: "relative",
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
    display: "flex",
    backgroundColor: customColors.customLightBlue,
    padding: 6,
    marginVertical: 4,
    borderRadius: 6,
  },

  joinBtnText: {
    fontSize: 16,
    color: customColors.white,
    fontFamily: "NotoSansJP_400Regular",
    fontWeight: "700",
    textAlign: "center",
  },

  listTitle: {
    fontSize: 25,
    color: "white",
    fontFamily: "NotoSansJP_400Regular",
    fontWeight: "700",
    textAlign: "center",
  },

  FlatListStyle: {
    flex: 1,
    borderWidth: 1,
    borderColor: customColors.customLightBlue1,
    borderRadius: 20,
    backgroundColor: customColors.customDarkBlueBackground,
    alignItems: "center",
    paddingTop: 30,
    paddingBottom: 5,
    paddingHorizontal: 6,
    marginTop: 30,
    width: "96%",
  },

  divider: {
    borderBottomColor: customColors.blackGrey,
    borderBottomWidth: 1,
    marginVertical: 10,
    width: "100%",
  },

  completedText: {
    fontSize: 30,
    color: customColors.white,
    width: "90%",
    fontFamily: "NotoSansJP_400Regular",
    fontWeight: "700",
    textAlign: "center",
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

  errText: {
    color: customColors.blackRed,
    fontSize: 16,
  },
  tooltipText: {
    fontSize: 14,
    color: 'white',
  },
});

export default GameRoomScreen;
