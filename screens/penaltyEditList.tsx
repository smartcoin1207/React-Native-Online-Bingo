import * as React from 'react';
import { useState, useEffect } from 'react';
import { UseSelector, useDispatch, useSelector } from 'react-redux';
import { ActivityIndicator, Dimensions, FlatList, Modal, Pressable, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, TouchableWithoutFeedback, View, useWindowDimensions } from 'react-native';
import { TabView, SceneMap, TabBar } from 'react-native-tab-view';
import { customColors } from '../utils/Color';
import { Icon, List } from 'react-native-paper';
import { MaterialCommunityIcons } from '@expo/vector-icons';

import { Penalty } from '../utils/Types';
import { RootState } from '../store';
import { addPenalty, deletePenalty, getAllPenalty, updatePenalty } from '../utils/firebase/FirebaseUtil';
import { addPenaltyList, setPenaltyList } from '../store/reducers/bingo/penaltySlice';
import Language from '../utils/Variables';
const { width: viewportWidth, height: viewportHeight } =
  Dimensions.get("window");

const jpLanguage = Language.jp;

// penaltyList Tab start
const FirstRoute = () => {
    const dispatch = useDispatch();
    const  [modalVisible, setModalVisible] = useState<boolean>(false);
    const [isCreateModal, setIsCreateModal] = useState(true);
    const [inputText, setInputText] = useState("");
    const [editPenaltyId, setEditPenaltyId] = useState("");

    const penaltyList = useSelector((state: RootState) => state.penalty.penaltyList);
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
            id: '', 
            title: title
        }

        dispatch(addPenaltyList(temp));

        await addPenalty(title);
        const penaltyList = await getAllPenalty();
        dispatch(setPenaltyList(penaltyList));
    }

    const updatePenaltyHandle = async () => {
        await updatePenalty(editPenaltyId, inputText);
        setModalVisible(false);

        const penaltyList = await getAllPenalty();
        dispatch(setPenaltyList(penaltyList));
    }

    const deletePenaltyPress = async (id: string) => {
        await deletePenalty(id);

        const penaltyList = await getAllPenalty();
        dispatch(setPenaltyList(penaltyList));
    }

    const renderGameRoomItem = ({ item, index }: { item: Penalty, index: number }) => {

        return (
            <TouchableOpacity style={[styles.penaltyItemRow, selectedItem === index && styles.pressedStyle]} 
            activeOpacity={0.5}
            onPressIn={() => handlePressIn(index)}
            onPressOut={handlePressOut}
            >
                <View style={styles.penaltyItemTitle}>
                    <Text style={{ fontSize: 20, color: 'white', width: '18%' }}>{index + 1}</Text>
                    <Text style={{ fontSize: 15, color: 'white', display: 'flex'  }}> {item.title} </Text>
                </View>
            
                <View style={[styles.iconContainer, selectedItem === index && styles.pressedIconContainer]}>
                    <TouchableOpacity style={styles.editIconBtn} onPress={() => {setModalVisible(true); setEditPenaltyId(item.id); setInputText(item.title), setIsCreateModal(false);}}>
                        <MaterialCommunityIcons name="book-edit" size={24} color="#00c0ff" />
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.deleteIconBtn} onPress={() => deletePenaltyPress(item.id)}>
                        <MaterialCommunityIcons name="delete-forever" size={24} color="red" />
                    </TouchableOpacity>
                </View>
            </TouchableOpacity>
      );
    } 

    return (
        <View style={{ flex: 1, backgroundColor: customColors.black, marginTop: 10, position: 'relative' }}>
            <View style={{borderWidth: 1, borderColor: customColors.blackGrey, borderRadius: 10, padding:10, marginHorizontal: 5, display: 'flex', maxHeight: '86%'}}>
                <FlatList
                    data={penaltyList}
                    renderItem={renderGameRoomItem}
                    keyExtractor={(item, index) => index.toString()}
                />
            </View>

            <View style={styles.orderBtnGroup}>
                <View style={{ flexDirection: 'row' }} >
                    <TouchableOpacity style={styles.penaltyAddBtn} onPress={() => {setModalVisible(true); setInputText(''); setIsCreateModal(true);}}>
                        <Text style={styles.pressBtnText}> {jpLanguage.addString} </Text>
                    </TouchableOpacity>
                </View>
            </View>

            <Modal
                animationType="fade"
                transparent={true}
                visible={modalVisible}
                onRequestClose={() => {
                setModalVisible(false);
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

                    <>
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
                    </>
                 
                    <View style={styles.roomModalBtns}>
                        <TouchableOpacity
                            style={styles.modalCancelBtn}
                            onPress={() => setModalVisible(false)}
                        >
                            <Text style={styles.roomModalButtonText}> {jpLanguage.cancelString} </Text>
                        </TouchableOpacity>
                        {isCreateModal ? (
                            <TouchableOpacity style={styles.modalOkBtn} onPress={addPenaltyHandle}>
                                <Text style={styles.roomModalButtonText}>{jpLanguage.addString}</Text>
                            </TouchableOpacity>
                        ) : (
                            <TouchableOpacity
                            style={styles.modalOkBtn}
                            onPress={updatePenaltyHandle}
                            >
                                <Text style={styles.roomModalButtonText}> {jpLanguage.editString} </Text>
                            </TouchableOpacity>
                        )}
                    </View>
                </View>
                </View>
            </Modal>
        </View>
    )};

const PenaltyEditList = () => {
    return (
        <View style={styles.container}>
            <View style={styles.topHeader}>
                <Text style={styles.title}>{jpLanguage.penaltyListTitleString}</Text>
            </View>
        
            <FirstRoute />
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 5,
        paddingTop: viewportHeight*0.02,
        backgroundColor: "#000000"
    },

    title: {
        color: customColors.white,
        fontSize: viewportWidth * 0.1,
        fontWeight: "700",
    },

    pressBtn: {
        // backgroundColor: customColors.blackRed,
        paddingVertical: 5,
        marginVertical: 4,
        borderRadius: 6,
        borderWidth: 1,
        borderColor: customColors.blackGrey
    },

    pressBtnText: {
        fontSize: 16,
        color: 'white',
        fontFamily: 'serif',
        fontWeight: '700',
        textAlign: 'center',
        letterSpacing: 5
    },

    topHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 8,
        marginTop: 20
    },

    penaltyItemRow: {
        // flexDirection: "row",
        // justifyContent: "flex-start",
        // alignItems: "center",
        paddingHorizontal: 10,
        marginVertical: 3,
        paddingVertical: 0,
        borderWidth: 1,
        borderColor: customColors.blackGrey,
        backgroundColor: customColors.penaltyBackGrey,
        borderRadius: 8,
      },

    penaltyItemTitle: {
        flexDirection: "row",
        justifyContent: "flex-start",
        alignItems: "center",
        paddingVertical: 10
    },

    penaltyAddBtn: {
        backgroundColor: customColors.customLightBlue,
        paddingVertical: 8,
        paddingHorizontal: 20,
        marginVertical: 4,
        borderRadius: 6,
        borderWidth: 1,
        marginHorizontal: 5,
        borderColor: customColors.customDarkBlue
    },

    orderBtnGroup: {
        display: 'flex',
        alignItems: 'flex-end',
        position: 'relative',
        // height: '10%',
        // backgroundColor: customColors.blackGrey,
        marginHorizontal: 5,
        marginTop: 10,
        paddingTop: 10,
        // borderRadius: 10,
        borderTopColor: customColors.white, 
        borderTopWidth: 1
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
        fontSize: 20,
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
        letterSpacing: 5
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
        fontWeight: "700",
        textAlign: "center",
        marginBottom: 20,
      },

      roomModalBtns: {
        flexDirection: "row",
      },

      editIconBtn: {
        // position: 'absolute',
        // right: 50,
        paddingVertical: 2,
        marginHorizontal: 4,
        borderRadius: 4,
        borderWidth: 1,
        borderColor: customColors.blackGrey
      },

      deleteIconBtn: {
        // position: 'absolute',
        // right: 10,
        marginHorizontal: 4,

        paddingVertical: 2,
        borderRadius: 4,
        borderWidth: 1,
        borderColor: customColors.blackGrey
      },
      pressedStyle: {
        backgroundColor: customColors.black,
      },

      iconContainer: {
        display: 'none',
      },

      pressedIconContainer: {
        display: 'flex',
        
        paddingVertical: 5,
        borderTopWidth: 1,
        borderTopColor: customColors.blackGrey,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'flex-end',
      }
  })

export default PenaltyEditList;