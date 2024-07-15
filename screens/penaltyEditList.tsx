import * as React from "react";
import { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  Dimensions,
  FlatList,
  Modal,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { customColors } from "../utils/Color";
import { MaterialCommunityIcons } from "@expo/vector-icons";

import { Penalty } from "../utils/Types";
import { RootState } from "../store";
import {
  addPenalty,
  deletePenalty,
  getAllPenalty,
  updatePenalty,
} from "../utils/firebase/FirebaseUtil";
import {
  addPenaltyList,
  setPenaltyList,
} from "../store/reducers/bingo/penaltySlice";
import Language from "../utils/Variables";
import ConfirmModal from "../components/ConfirmModal";
const { width: viewportWidth, height: viewportHeight } =
  Dimensions.get("window");

const jpLanguage = Language.jp;

const PenaltyEditList = () => {
  const dispatch = useDispatch();
  const [modalVisible, setModalVisible] = useState<boolean>(false);
  const [confirmDeleteModalVisible, setConfirmDeleteModalVisible] = useState<boolean>(false);
  const [isCreateModal, setIsCreateModal] = useState(true);
  const [inputText, setInputText] = useState("");
  const [editPenaltyId, setEditPenaltyId] = useState("");
  const [deleteId, setDeleteId]= useState<string>("");

  const penaltyList = useSelector(
    (state: RootState) => state.penalty.penaltyList
  );
  const [selectedItem, setSelectedItem] = useState<number | null>(null);

  const handlePressIn = (index: number) => {
    setSelectedItem(index);
  };

  const handlePressOut = () => {
    // setSelectedItem(null);
  };

  useEffect(() => {
    const fetchData = async () => {
      console.log(penaltyList);
      const penaltyInitialList = await getAllPenalty();
      dispatch(setPenaltyList(penaltyInitialList));
    };

    fetchData();
  }, []);

  const addPenaltyHandle = async () => {
    setModalVisible(false);
    const title = inputText;
    const temp = {
      id: "",
      title: title,
    };

    dispatch(addPenaltyList(temp));

    await addPenalty(title);
    const penaltyList = await getAllPenalty();
    dispatch(setPenaltyList(penaltyList));
  };

  const updatePenaltyHandle = async () => {
    await updatePenalty(editPenaltyId, inputText);
    setModalVisible(false);

    const penaltyList = await getAllPenalty();
    dispatch(setPenaltyList(penaltyList));
  };

  const deletePenaltyPress = async (id: string) => {
    setConfirmDeleteModalVisible(true);
    setDeleteId(id);
  };

  const deleteConfirmPress =async (id:string) => {
    await deletePenalty(id);

    const penaltyList = await getAllPenalty();
    dispatch(setPenaltyList(penaltyList));
    setConfirmDeleteModalVisible(false);
  }

  const handleConfirmDeleteModalVisible = (isVisible: boolean) => {
    setConfirmDeleteModalVisible(isVisible);
  }

  const handleEditModalVisible = (isVisible: boolean) => {
    setModalVisible(isVisible);
  }

  const renderPenaltyItem = ({
    item,
    index,
  }: {
    item: Penalty;
    index: number;
  }) => {
    return (
      <TouchableOpacity
        style={[
          styles.penaltyItemRow,
          selectedItem === index && styles.pressedStyle,
        ]}
        activeOpacity={0.5}
        onPressIn={() => handlePressIn(index)}
        onPressOut={handlePressOut}
      >
        <View style={styles.penaltyItemTitle}>
          <Text style={{ fontSize: 20, color: "white", width: "18%" }}>
            {index + 1}
          </Text>
          <Text style={{ fontSize: 20, color: "white", display: "flex" }}>
            {" "}
            {item.title}{" "}
          </Text>
        </View>

        <View
          style={[
            styles.iconContainer,
            selectedItem === index && styles.pressedIconContainer,
          ]}
        >
          <TouchableOpacity
            style={styles.editIconBtn}
            onPress={() => {
              setModalVisible(true);
              setEditPenaltyId(item.id);
              setInputText(item.title), setIsCreateModal(false);
            }}
          >
            <MaterialCommunityIcons
              name="book-edit"
              size={24}
              color="#00c0ff"
            />
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.deleteIconBtn}
            onPress={() => deletePenaltyPress(item.id)}
          >
            <MaterialCommunityIcons
              name="delete-forever"
              size={24}
              color="red"
            />
          </TouchableOpacity>
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.container}>
      <View
        style={{
            flex: 1, 
            borderWidth: 1,
            borderColor: customColors.customLightBlue,
            borderRadius: 20,
            padding: 6,
            backgroundColor: customColors.customDarkBlueBackground
        }}
      >
        <FlatList
          data={penaltyList}
          renderItem={renderPenaltyItem}
          keyExtractor={(item, index) => index.toString()}
        />
      </View>

      <View style={styles.orderBtnGroup}>
        <View style={{ flexDirection: "row" }}>
          <TouchableOpacity
            style={styles.penaltyAddBtn}
            onPress={() => {
              setModalVisible(true);
              setInputText("");
              setIsCreateModal(true);
            }}
          >
            <Text style={styles.penaltyAddBtnText}> {jpLanguage.addString} </Text>
          </TouchableOpacity>
        </View>
      </View>

      <ConfirmModal 
        isVisible={modalVisible}
        setVisible={handleEditModalVisible}
        messageText="罰ゲームを入力してください。"
        confirmText={jpLanguage.addString}
        cancelText={jpLanguage.cancelString}
        onConfirm={() => isCreateModal ? addPenaltyHandle() : updatePenaltyHandle()}
        onCancel={() => {}}
        
        middleElement={
          <TextInput
                style={styles.input}
                placeholder={jpLanguage.penaltyTitleString}
                autoCapitalize="none"
                placeholderTextColor={customColors.blackGrey}
                value={inputText}                
                onChangeText={(text) => {
                  setInputText(text);
                }}
              />
        }
      />

      <ConfirmModal 
        isVisible={confirmDeleteModalVisible}
        setVisible={handleConfirmDeleteModalVisible}
        messageText="選択した罰ゲームを削除してもよろしいですか？"
        confirmText={jpLanguage.addString}
        cancelText={jpLanguage.cancelString}
        onConfirm={()=>deleteConfirmPress(deleteId)}
        onCancel={() => {}}
      />

    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 5,
    backgroundColor: customColors.black,
  },
  title: {
    color: customColors.white,
    fontSize: 30,
    fontWeight: "700",
  },

  penaltyAddBtnText: {
    fontSize: 20,
    fontWeight: "700",
    fontFamily: "serif",
    letterSpacing: 5,
    color: "white",
    textAlign: "center",
  },

  topHeader: {
    marginTop: 5,
    marginBottom: 5,
    borderRadius: 20,
    borderColor: customColors.customLightBlue,
    padding: 15
  },

  penaltyItemRow: {
    paddingHorizontal: 10,
    marginVertical: 3,
    paddingVertical: 0,
    borderWidth: 1,
    borderColor: customColors.customDarkGreen1,
    backgroundColor: '#19212e',
    borderRadius: 15,
  },

  penaltyItemTitle: {
    flexDirection: "row",
    justifyContent: "flex-start",
    alignItems: "center",
    paddingVertical: 10,
  },

  penaltyAddBtn: {
    backgroundColor: customColors.customLightBlue,
    borderColor: customColors.customDarkBlue,
    borderRadius: 50,
    borderWidth: 1,
    height: 70,
    width: 70,
    justifyContent: 'center',
    alignItems: 'center',
  },

  orderBtnGroup: {
    display: "flex",
    alignItems: "center",
    position: "relative",
    paddingTop: 10,
  },
  

  input: {
    width: "80%",
    fontSize: 20,
    color: customColors.white,
    padding: 6,
    paddingHorizontal: 20,
    borderRadius: 15,
    borderWidth: 1,
    borderColor: customColors.blackGrey,
  },
  

  editIconBtn: {
    // position: 'absolute',
    // right: 50,
    paddingVertical: 2,
    marginHorizontal: 10,
    borderRadius: 4,
    borderWidth: 1,
    borderColor: customColors.customDarkGreen1,
  },

  deleteIconBtn: {
    // position: 'absolute',
    // right: 10,
    marginHorizontal: 4,

    paddingVertical: 2,
    borderRadius: 4,
    borderWidth: 1,
    borderColor: customColors.blackGrey,
  },
  pressedStyle: {
    backgroundColor: customColors.black,
  },

  iconContainer: {
    display: "none",
  },

  pressedIconContainer: {
    display: "flex",

    paddingVertical: 5,
    borderTopWidth: 1,
    borderTopColor: customColors.customDarkGreen1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "flex-end",
  },
});

export default PenaltyEditList;
