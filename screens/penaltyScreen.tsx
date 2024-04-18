import React, { useEffect, useState } from "react";

import {
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  Text,
  View,
  TextInput,
  Modal,
  FlatList,
  Keyboard,
  Platform,
  ActivityIndicator
} from "react-native";
import { customColors } from "../utils/Color";
import SwitchToggle from "react-native-switch-toggle";
import { List } from "react-native-paper";
import { RouteProp } from '@react-navigation/native';

import Icon from "react-native-vector-icons/FontAwesome";
import { addPenaltyPatternA, getAllPenalty, getGamePenalty, setPatternASet } from "../utils/firebase/FirebaseUtil";
import { GameType, Penalty } from "../utils/Types";
import { useNavigation, useRoute } from "@react-navigation/native";
import { useSelector } from "react-redux";
import { RootState } from "../store";
import { RootStackParamList } from "../constants/navigate";

enum PatternType {
  PatternA = "PatternA",
  PatternB = "PatternB",
}
type PenaltyScreenRouteProp = RouteProp<RootStackParamList, 'penalty'>;

const PenaltyScreen = () => {
  const route = useRoute();

  const navigation = useNavigation();
  const isHost = useSelector((state: RootState) => state.gameRoom.isHost);
  const gameRoomId = useSelector((state: RootState) => state.gameRoom.gameRoomId);

  const [isLightBlueEnabled, setIsLightBlueEnabled] = React.useState(false);
  const [isLightCyanEnabled, setIsLightCyanEnabled] = React.useState(false);
  const [isLightGreenEnabled, setIsLightGreenEnabled] = React.useState(false);
  const [number, setNumber] = React.useState("");
  const [penaltyListModalVisible, setPenaltyListModalVisible] =
    React.useState<boolean>(false);

  const [allPenalties, setAllPenalties] = useState<Penalty[]>([]);
  const [penaltyAId, setPenaltyAId] = useState<string>("");
  const [penaltyBId, setPenaltyBId] = useState<string>("");
  const [penaltyA, setPenaltyA] = useState<Penalty>();
  const [penaltyB, setPenaltyB] = useState<Penalty>();
  const [patternType, setPatternType] = useState<PatternType>(
    PatternType.PatternA
  );
  const [keyboardShow, setKeyBoardShow] = useState<boolean>(false);
  const [patternASetAvailable, setPatternASetAvailable] = useState<boolean>(false);
  const [patternASelected, setPatternASelected] = useState<boolean>(false);
  const { startGame } = route.params;
  
  // get penalty by gameRoomId
  useEffect(() => {
    getGamePenalty(gameRoomId, (penalty: any) => {
      // console.log(penalty?.PatternASet);
      if(penalty?.patternASet) {
        setPatternASetAvailable(true)
      } else {
        setPatternASetAvailable(false);
      }
    })
  }, [])

  useEffect(() => {
    const fetchPenalties = async () => {
      try {
        const penalties = await getAllPenalty();
        setAllPenalties(penalties);
      } catch (error) {}
    };

    fetchPenalties();
  }, []);

  // useEffect(() => {
  //   setPatternASetAvailable(penaltyPatternASet);
  // }, [penaltyPatternASet])

  useEffect(() => {
    if (penaltyAId) {
      const penalty = allPenalties.find((penalty) => penalty.id == penaltyAId);
      setPenaltyA(penalty);
    }
  }, [penaltyAId]);

  useEffect(() => {
    if (penaltyBId) {
      const penalty = allPenalties.find((penalty) => penalty.id == penaltyBId);
      setPenaltyB(penalty);
    }
  }, [penaltyBId]);

  useEffect(() => {
    const keyboardDidShowListener = Keyboard.addListener(
      Platform.OS === 'ios' ? 'keyboardWillShow' : 'keyboardDidShow',
      _keyboardDidShow,
    );
    const keyboardDidHideListener = Keyboard.addListener(
      Platform.OS === 'ios' ? 'keyboardWillHide' : 'keyboardDidHide',
      _keyboardDidHide,
    );

    return () => {
      keyboardDidShowListener.remove();
      keyboardDidHideListener.remove();
    };
  }, []);

  const startGamPenalty = (isPenalty: boolean) => {
    if(isPenalty) {
      console.log(isPenalty);
    } else {
      console.log(isPenalty);
    }
    try {
      startGame();
    } catch (error) {
    }
  }

  const setPatternA = () => {
    const penaltyAId1 = penaltyAId;
    setPatternASelected(true);
  }

  const _keyboardDidShow = () => {
    console.log('Keyboard shown');
    setKeyBoardShow(true)
  };

  const _keyboardDidHide = () => {
    console.log('Keyboard hidden');
    setKeyBoardShow(false);
  };

  const toggleLightBlueSwitch = () => {
    setIsLightBlueEnabled((previousState) => !previousState);
    setPenaltyAId('');
    setPenaltyA(undefined);
    
    setPatternASet(gameRoomId);
  };
  
  const toggleLightCyanSwitch = () => {
    setIsLightCyanEnabled((previousState) => !previousState);
    setPenaltyBId('');
    setPenaltyB(undefined);
  };

  const toggleLightGreenSwitch = () => {
    setIsLightGreenEnabled((previousState) => !previousState);
    if (isLightGreenEnabled) {
      setNumber("");
    }
  };

  const handlePatternAPlusBtnClick = () => {
    setPatternType(PatternType.PatternA);
    setPenaltyListModalVisible(true);
    console.log(PatternType.PatternA)
  };

  const handlePatternBPlusBtnClick = () => {
    setPatternType(PatternType.PatternB);
    setPenaltyListModalVisible(true);
    console.log(PatternType.PatternB)
  };

  const handlePenaltyListItemClick = (penaltyId: string) => {
    if (patternType ==  PatternType.PatternA) {
      setPenaltyAId(penaltyId);
    } else if (patternType ==  PatternType.PatternB) {
      setPenaltyBId(penaltyId);
    }

    setPenaltyListModalVisible(false);
  };

  const handleNumberChange = (text: string) => {
    // Remove non-numeric characters from the input
    const formattedText = text.replace(/[^0-9]/g, "");
    setNumber(formattedText);
  };

  const renderPenaltyItem = ({
    item,
    index,
  }: {
    item: Penalty;
    index: number;
  }) => {
    return (
      <TouchableOpacity
        style={[styles.penaltyItemRow]}
        key={index}
        onPress={() => handlePenaltyListItemClick(item.id)}
      >
        <View style={styles.penaltyItemTitle}>
          <Text style={{ fontSize: 20, color: "white", display: "flex" }}>
            {item.title}
          </Text>
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.container}>
      <View style={styles.topHeader}>
        <TouchableOpacity
          style={{ width: 44, height: 44, padding:10, borderWidth:1, borderColor: customColors.blackGrey, borderRadius: 25, alignItems:'center',justifyContent: 'center'}}
          onPress={() => navigation.goBack()}
        >
          <Icon name="arrow-left" size={18} color={'white'} style={{opacity: 0.8}} />
        </TouchableOpacity>
        <Text style={styles.title}>罰ゲーム</Text>
      </View>
      {isHost &&
        <View
          style={{
            flex: 1,
            display: "flex",
            justifyContent: "center",
            marginVertical: "auto",
            zIndex: 2,
          }}
        >
          <View style={styles.lightBlueComponent}>
            <View style={styles.lightBlueToggle}>
              <View style={{ maxWidth: "80%", flexDirection: "row" }}>
                <Text style={{ fontSize: 18, color: customColors.white }}>
                  パターンA
                </Text>
                <Text
                  style={{
                    fontSize: 16,
                    color: customColors.white,
                    opacity: 0.7,
                  }}
                >
                  (すべてのプレイヤー)
                </Text>
              </View>
              <SwitchToggle
                switchOn={isLightBlueEnabled}
                onPress={()=>{ if(!isLightBlueEnabled) toggleLightBlueSwitch()}}
                circleColorOff="grey"
                circleColorOn="white"
                backgroundColorOn="#5a6fff"
                backgroundColorOff="#5971ff5e"
                containerStyle={{
                  marginTop: 16,
                  width: 50,
                  height: 24,
                  borderRadius: 25,
                  padding: 3,
                  borderWidth: 1,
                  borderColor: "#556ff499",
                }}
                circleStyle={{
                  width: 18,
                  height: 18,
                  borderRadius: 18,
                }}
                duration={200}
              />
            </View>

            <View
              style={{
                opacity: isLightBlueEnabled ? 1 : 0.3,
                justifyContent: "center",
                alignItems: "center",
                padding: 15,
              }}
            >
              <View
                style={{
                  display: isLightBlueEnabled ? "none" : "flex",
                  position: "absolute",
                  top: 0,
                  bottom: 0,
                  left: 0,
                  right: 0,
                  zIndex: 10,
                }}
              ></View>

              {!penaltyAId ? (
                <TouchableOpacity
                  style={{
                    width: 50,
                    height: 50,
                    borderRadius: 50,
                    borderWidth: 1,
                    borderColor: "#5a6fff",
                    padding: 10,
                    margin: 10,
                    paddingHorizontal: 12,
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                  onPress={() => {
                    handlePatternAPlusBtnClick();
                  }}
                >
                  <Icon name="plus" size={25} color={"#5a6fff"} />
                </TouchableOpacity>
              ) : (
                <View
                  style={{
                    margin: 10,
                    justifyContent: "center",
                    borderWidth: 1,
                    borderColor: "#5a6fff",
                    borderRadius: 20,
                    width: "90%",
                    padding: 10,
                    backgroundColor: "#0f203e",
                  }}
                >
                  <TouchableOpacity
                    style={[styles.penaltyItemRow]}
                    onPress={() => handlePatternAPlusBtnClick()}
                  >
                    <View style={styles.penaltyItemTitle}>
                      <Text
                        style={{ fontSize: 20, color: "white", display: "flex" }}
                      >
                        {penaltyA?.title}
                      </Text>
                    </View>
                  </TouchableOpacity>
                </View>
              )}
            </View>
          </View>

          <View style={styles.lightCyanComponent}>
            <View style={styles.lightCyanToggle}>
              <View style={{ maxWidth: "80%", flexDirection: "row" }}>
                <Text style={{ fontSize: 18, color: customColors.white }}>
                  パターンB
                </Text>
                <Text
                  style={{
                    fontSize: 16,
                    color: customColors.white,
                    opacity: 0.7,
                  }}
                >
                  (共通罰ゲームの設定)
                </Text>
              </View>
              <SwitchToggle
                switchOn={isLightCyanEnabled}
                onPress={toggleLightCyanSwitch}
                circleColorOff="grey"
                circleColorOn="white"
                backgroundColorOn="#29ccdc"
                backgroundColorOff="#1c6c74a3"
                containerStyle={{
                  marginTop: 16,
                  width: 50,
                  height: 24,
                  borderRadius: 25,
                  padding: 3,
                  borderWidth: 1,
                  borderColor: "#556ff499",
                }}
                circleStyle={{
                  width: 18,
                  height: 18,
                  borderRadius: 18,
                }}
                duration={200}
              />
            </View>

            <View
              style={{
                opacity: isLightCyanEnabled ? 1 : 0.3,
                justifyContent: "center",
                alignItems: "center",
                padding: 15,
              }}
            >
              <View
                style={{
                  display: isLightCyanEnabled ? "none" : "flex",
                  position: "absolute",
                  top: 0,
                  bottom: 0,
                  left: 0,
                  right: 0,
                  zIndex: 10,
                }}
              ></View>

              {!penaltyBId ? (
                <TouchableOpacity
                  style={{
                    width: 50,
                    height: 50,
                    borderRadius: 50,
                    borderWidth: 1,
                    borderColor: "#29ccdc",
                    padding: 10,
                    margin: 10,
                    paddingHorizontal: 12,
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                  onPress={() => {
                    handlePatternBPlusBtnClick();
                  }}
                >
                  <Icon name="plus" size={25} color={"#29ccdc"} />
                </TouchableOpacity>
              ) : (
                <View
                  style={{
                    margin: 10,
                    justifyContent: "center",
                    borderWidth: 1,
                    borderColor: "#29ccdc",
                    borderRadius: 20,
                    width: "90%",
                    padding: 10,
                    backgroundColor: "#0f203e",
                  }}
                >
                  <TouchableOpacity
                    style={[styles.penaltyItemRow]}
                    onPress={() => handlePatternBPlusBtnClick()}
                  >
                    <View style={styles.penaltyItemTitle}>
                      <Text
                        style={{ fontSize: 20, color: "white", display: "flex" }}
                      >
                        {penaltyB?.title}
                      </Text>
                    </View>
                  </TouchableOpacity>
                </View>
              )}
            </View>
          </View>

          <View style={styles.lightGreenComponent}>
            <View style={styles.lightGreenToggle}>
              <View style={{ maxWidth: "80%", flexDirection: "row" }}>
                <Text style={{ fontSize: 18, color: customColors.white }}>
                  パターンC
                </Text>
                <Text
                  style={{
                    fontSize: 16,
                    color: customColors.white,
                    opacity: 0.7,
                  }}
                >
                  (罰ゲームの回収設定)
                </Text>
              </View>
              <SwitchToggle
                switchOn={isLightGreenEnabled}
                onPress={toggleLightGreenSwitch}
                circleColorOff="grey"
                circleColorOn="white"
                backgroundColorOn="#6ebf40"
                backgroundColorOff="#6ebf4069"
                containerStyle={{
                  marginTop: 16,
                  width: 50,
                  height: 24,
                  borderRadius: 25,
                  padding: 3,
                  borderWidth: 1,
                  borderColor: "#556ff499",
                }}
                circleStyle={{
                  width: 18,
                  height: 18,
                  borderRadius: 18,
                }}
                duration={200}
              />
            </View>
            <View style={{ opacity: isLightGreenEnabled ? 1 : 0.3 }}>
              <View
                style={{
                  display: isLightGreenEnabled ? "none" : "flex",
                  position: "absolute",
                  top: 0,
                  bottom: 0,
                  left: 0,
                  right: 0,
                  zIndex: 10,
                }}
              ></View>
              <TextInput
                value={number}
                onChangeText={handleNumberChange}
                keyboardType="numeric"
                placeholder="罰ゲームの回転数"
                placeholderTextColor={customColors.blackGrey}
                style={{ padding: 10, color: "white", fontSize: 20 }}
              />
            </View>
          </View>
        </View>
      }

      {isHost && 
        <View
          style={{
            bottom: 0,
            width: "100%",
            flexDirection: "row",
            display: keyboardShow ?  "none" : "flex",
            justifyContent: "space-around",
            paddingHorizontal: 10,
          }}
        >
          <TouchableOpacity
            style={{
              width: "45%",
              padding: 10,
              backgroundColor: "#250e44",
              borderWidth: 1,
              borderColor: "#8e44ad",
              borderRadius: 30,
              alignItems: "center",
              justifyContent: "center",
            }}
            onPress={() => startGamPenalty(false)}
          >
            <Text style={{ color: "white", fontSize: 18 }}>スキップ</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={{
              width: "45%",
              padding: 10,
              backgroundColor: "#0f203e",
              borderWidth: 1,
              borderColor: "#29ccdc",
              borderRadius: 30,
              alignItems: "center",
              justifyContent: "center",
            }}
            onPress={() => startGamPenalty(true)}
          >
            <Text style={{ color: "white", fontSize: 18 }}>ゲーム開始</Text>
          </TouchableOpacity>
        </View>
      }

      {!isHost && (
        <View style={{
          flex:1,
          alignItems:'center',
          justifyContent: 'center'
        }}>
          {!patternASetAvailable && (
            <View>
              <Text style={{ color: 'white', fontSize: 15}}>ホストが罰ゲームを設定しています ...</Text>
              <View>
                {!patternASetAvailable ? <ActivityIndicator size="large" color="#007AFF" /> : ""}
              </View>
            </View>
          )}

          {patternASetAvailable && (
            <View 
              style={{
                flex:1, 
                borderWidth:1,
                borderColor: "#5a6fff",
                borderRadius: 30,
                justifyContent: 'center',
                margin: 10,
                width: '100%',
                backgroundColor: customColors.customDarkBlueBackground,
                alignItems: 'center'
              }}
            >
              {!penaltyAId ? (
                <>
                  <View style={{
                    alignItems: 'center'
                  }}>
                    <Text
                      style={{
                        color:'white',
                        fontSize: 18
                      }}
                    >
                      パターンAを設定してください。
                    </Text>
                  </View>
                  <TouchableOpacity
                    style={{
                      width: 50,
                      height: 50,
                      borderRadius: 50,
                      borderWidth: 1,
                      borderColor: "#5a6fff",
                      padding: 10,
                      margin: 10,
                      paddingHorizontal: 12,
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                    onPress={() => {
                      handlePatternAPlusBtnClick();
                    }}
                  >
                    <Icon name="plus" size={25} color={"#5a6fff"} />
                  </TouchableOpacity>
                </>
              ) : (
                <View style={{
                  alignItems: 'center',
                  justifyContent: 'center',
                  width: "100%",
                }}>

                <View
                  style={{
                    display: patternASelected ? "flex" : "none",
                    position: "absolute",
                    top: 0,
                    bottom: 0,
                    left: 0,
                    right: 0,
                    zIndex: 10,
                  }}
                ></View>
                  <View
                    style={{
                      margin: 10,
                      justifyContent: "center",
                      borderWidth: 1,
                      borderColor: "#5a6fff",
                      borderRadius: 20,
                      width: "90%",
                      padding: 10,
                      backgroundColor: "#0f203e",
                      opacity: patternASelected ? 0.3: 1
                    }}
                  >
                    <TouchableOpacity
                      style={[styles.penaltyItemRow]}
                      onPress={() => handlePatternAPlusBtnClick()}
                    >
                      <View style={styles.penaltyItemTitle}>
                        <Text
                          style={{ fontSize: 20, color: "white", display: "flex" }}
                        >
                          {penaltyA?.title}
                        </Text>
                      </View>
                    </TouchableOpacity>
                  </View>

                  <TouchableOpacity
                      style={{
                        padding: 10,
                        paddingHorizontal: 20,
                        borderWidth: 1,
                        marginTop: 30,
                        borderColor: '#5a6fff',
                        backgroundColor: "#19212e",
                        borderRadius: 30,
                        opacity: patternASelected ? 0.3: 1
                      }}
                      onPress={() => setPatternA()}
                    >
                      <Text
                        style={{ fontSize: 20, color: "white", display: "flex" }}
                      >
                        確認
                      </Text>
                  </TouchableOpacity>
                  
                  {patternASelected && (
                    <View style={{
                      marginTop: 100
                    }}>
                      <Text style={{ color: 'white', fontSize: 15}}>ホストがゲームを開始するまで待機します ...</Text>
                      <View style={{
                        marginTop: 20
                      }}>
                        {true ? <ActivityIndicator size="large" color="#007AFF" /> : ""}
                      </View>
                    </View>
                  )}
                  
                </View>
              )}
            </View>
          )}
        </View>
      )}

      <Modal
        animationType="fade"
        transparent={true}
        visible={penaltyListModalVisible}
        onRequestClose={() => {
          setPenaltyListModalVisible(false);
        }}
      >
        <View
          style={{
            flex: 1,
            justifyContent: "center",
            alignItems: "center",
            backgroundColor: "#000000e0",
          }}
        >
          <View
            style={{
              margin: 10,
              justifyContent: "center",
              borderWidth: 1,
              borderColor: "white",
              borderRadius: 20,
              width: "90%",
              padding: 10,
              backgroundColor: "#0f203e",
            }}
          >
            <FlatList
              data={allPenalties}
              renderItem={renderPenaltyItem}
              keyExtractor={(item, index) => index.toString()}
            />
            <View
              style={{
                padding: 10,
                alignItems: "center",
              }}
            >
              <TouchableOpacity
                style={{
                  padding: 10,
                  justifyContent: "center",
                  backgroundColor: "#2d1d2a",
                  borderRadius: 20,
                  borderWidth: 1,
                  borderColor: "#623c34",
                  width: "40%",
                }}
                onPress={() => {
                  setPenaltyListModalVisible(false);
                }}
              >
                <Text
                  style={{
                    color: "white",
                    fontSize: 16,
                    textAlign: "center",
                  }}
                >
                  キャンセル
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 5,
    paddingTop: 30,
    backgroundColor: "#000000",
  },

  title: {
    color: customColors.white,
    fontSize: 30,
    fontWeight: "700",
    marginLeft: 20
  },

  pressBtn: {
    // backgroundColor: customColors.blackRed,
    paddingVertical: 5,
    marginVertical: 4,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: customColors.blackGrey,
  },

  pressBtnText: {
    fontSize: 16,
    color: "white",
    fontFamily: "serif",
    fontWeight: "700",
    textAlign: "center",
  },

  topHeader: {
    flexDirection: "row",
    justifyContent: 'flex-start',
    alignItems: "center",
    marginBottom: 8,
    marginTop: 10,
    marginLeft: 10
  },

  penaltyItemRow: {
    paddingHorizontal: 10,
    borderWidth: 1,
    marginTop: 1,
    borderColor: customColors.customDarkGreen1,
    backgroundColor: "#19212e",
    borderRadius: 8,
  },

  penaltyAddBtn: {
    backgroundColor: customColors.blackGreen,
    paddingVertical: 8,
    paddingHorizontal: 20,
    marginVertical: 4,
    borderRadius: 6,
    borderWidth: 1,
    marginHorizontal: 5,
    marginBottom: 15,
    borderColor: customColors.white,
  },

  orderBtnGroup: {
    display: "flex",
    alignItems: "flex-end",
    position: "relative",
    marginHorizontal: 5,
    marginTop: 10,
    paddingTop: 10,
    borderTopColor: customColors.white,
    borderTopWidth: 1,
  },

  penaltyItemTitle: {
    flexDirection: "row",
    justifyContent: "flex-start",
    alignItems: "center",
    paddingVertical: 10,
  },

  lightBlueComponent: {
    borderRadius: 20,
    borderWidth: 1,
    borderColor: "#5a6fff",
    padding: 10,
    margin: 10,
    backgroundColor: customColors.customDarkBlueBackground,
  },

  lightBlueToggle: {
    alignItems: "center",
    display: "flex",
    justifyContent: "space-between",
    flexDirection: "row",
    marginHorizontal: 10,
    borderBottomColor: "#5a6fff",
    borderBottomWidth: 2,
    paddingBottom: 10,
  },

  lightCyanComponent: {
    borderRadius: 20,
    borderWidth: 1,
    borderColor: "#29ccdc",
    padding: 10,
    margin: 10,
    backgroundColor: customColors.customDarkBlueBackground,
  },

  lightCyanToggle: {
    alignItems: "center",
    display: "flex",
    justifyContent: "space-between",
    flexDirection: "row",
    marginHorizontal: 10,
    borderBottomColor: "#29ccdc",
    borderBottomWidth: 2,
    paddingBottom: 10,
  },

  lightGreenComponent: {
    borderRadius: 20,
    borderWidth: 1,
    borderColor: "#6ebf40",
    padding: 10,
    margin: 10,
    backgroundColor: customColors.customDarkBlueBackground,
  },

  lightGreenToggle: {
    alignItems: "center",
    display: "flex",
    justifyContent: "space-between",
    flexDirection: "row",
    marginHorizontal: 10,
    borderBottomColor: "#6ebf40",
    borderBottomWidth: 2,
    paddingBottom: 10,
  },
});

export default PenaltyScreen;
