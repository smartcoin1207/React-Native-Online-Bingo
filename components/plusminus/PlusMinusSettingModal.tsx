import React, { useEffect, useState } from "react";
import { Modal, Platform, StatusBar, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import Slider from '@react-native-community/slider';
import {
    PureRoundedCheckbox,
  } from "react-native-rounded-checkbox";

import { styles } from "../../utils/Styles";
import { customColors } from "../../utils/Color";
import Icon from "react-native-vector-icons/Ionicons";
import { useSafeAreaInsets } from "react-native-safe-area-context";

interface PlusMinusSettingModalProps {
    isHost: boolean;
    isVisible: boolean;
    setVisible: (isVisible: boolean) => void;
    setExitVisible: (isVisible: boolean) => void;
    handleGameStart: (timingNumber: number, isAllSameProblem: boolean, problemTypeInputOptionActive: boolean, problemTypeSelectOptionActive: boolean) => void;
}

const PlusMinusSettingModal: React.FC<PlusMinusSettingModalProps> = ({ isHost, isVisible, setVisible, setExitVisible, handleGameStart }) => {
    const [timing, setTiming] = useState<number>(10);
    const [timingNumber, setTimingNumber] = useState<number>(0);
    const [isAllSameProblem, setIsAllSameProblem] = useState<boolean>(false);
    const [problemTypeInputOptionActive, setProblemTypeInputOptionActive] = useState<boolean>(false);
    const [problemTypeSelectOptionActive, setProblemTypeSelectOptionActive] = useState<boolean>(true);

    const inset = useSafeAreaInsets();

    const statusBarHeight = (Platform.OS === 'ios' ? 20 : StatusBar.currentHeight) || 0; // On iOS, StatusBar.currentHeight is undefined, typically use 20

    useEffect(() => {
        console.log(timing);
        setTimingNumber(Math.floor(timing))
    }, [timing])

    useEffect(() => {
        if(problemTypeInputOptionActive) {
            setProblemTypeSelectOptionActive(false)
        }
    }, [problemTypeInputOptionActive])

    useEffect(() => {
        if(problemTypeSelectOptionActive) {
            setProblemTypeInputOptionActive(false);
        }
    }, [problemTypeSelectOptionActive])

    return (
        <Modal
            animationType="fade"
            transparent={true}
            visible={isVisible}
            onRequestClose={() => {
                setVisible(false);
            }}
        >
            <View
                style={{
                    flex: 1,
                    width: '100%',
                    justifyContent: "center",
                    alignItems: "center",
                    backgroundColor: customColors.modalBackgroundColor,
                }}
            >
                <View
                    style={[
                        styles.modalBody,
                        {
                            flex: 1,
                            width: "100%",
                            borderWidth: 0,
                            borderRadius: 0,
                            paddingTop: 0,
                            paddingBottom: 0,
                            paddingHorizontal: 0
                        },
                    ]}
                >
                    <Icon name="chevron-back-sharp" size={30} color="white" style={{position: 'absolute', left: 10, top: (Platform.OS === 'ios' ? (inset.top) : statusBarHeight ),  zIndex: 1}} onPress={() => {
                        setVisible(false)
                    }}  />
                    <View
                        style={[
                            styles.container,
                            {
                                width: "100%",
                                flex: 1,
                                paddingHorizontal: 0,
                                alignItems: "center",
                                borderWidth: 0,
                                borderColor: "white",
                            },
                        ]}
                    >

                        {isHost && (
                            <>
                                <View
                                    style={[innerStyles.boxContainer]}
                                >
                                    <View
                                        style={{
                                            width: '100%'
                                        }}
                                    >
                                        <View style={{
                                            display: 'flex',
                                            flexDirection: 'row',
                                            paddingHorizontal: 15
                                        }}>
                                            <Text style={{ color: 'white', fontSize: 15 }}>問題現時点:</Text>
                                            <Text style={{ color: 'white', fontWeight: '600', fontSize: 18, paddingLeft: 10 }}>{timingNumber}秒</Text>
                                        </View>

                                        <Slider
                                            style={{ width: '100%', height: 40 }}
                                            minimumValue={0}
                                            maximumValue={20}
                                            value={timing}
                                            onValueChange={(value) => { setTiming(value) }}
                                            minimumTrackTintColor="#FFFFFF"
                                            maximumTrackTintColor="white"
                                        />
                                    </View>
                                    <Divider />
                                    <View style={{display: 'flex', width: '100%', flexDirection: 'row', justifyContent: 'space-between', paddingHorizontal: 15, alignItems: 'center'}}>
                                        <Text style={{fontSize: 15, color: 'white'}}>全員に同じ問題出題</Text>
                                        <PureRoundedCheckbox onPress={(checked) => setIsAllSameProblem(checked)}  textStyle={{fontSize: 17}} innerStyle={{width: 30, height:30}} outerStyle={{borderColor: 'black', borderWidth: 0, width: 35, height:35}} text="✔" uncheckedColor="grey"  />
                                    </View>

                                    <Divider />
                                    <View style={{display: 'flex', width: '100%', flexDirection: 'row', justifyContent: 'space-between', paddingHorizontal: 15, alignItems: 'center'}}>
                                        <Text style={{fontSize: 15, color: 'white'}}>入力方式</Text>
                                        <PureRoundedCheckbox onPress={(checked) => setProblemTypeInputOptionActive(checked)}  textStyle={{fontSize: 17}} innerStyle={{width: 30, height:30}} outerStyle={{borderColor: 'black', borderWidth: 0,  width: 35, height:35}} text="✔" uncheckedColor="grey"  />
                                    </View>

                                    <Divider />
                                    <View style={{display: 'flex', width: '100%', flexDirection: 'row', justifyContent: 'space-between', paddingHorizontal: 15, alignItems: 'center'}}>
                                        <Text style={{fontSize: 15, color: 'white'}}>選択方式</Text>
                                        <PureRoundedCheckbox onPress={(checked) => setProblemTypeSelectOptionActive(checked)}  textStyle={{fontSize: 17}} innerStyle={{width: 30, height:30}} outerStyle={{borderColor: 'black', borderWidth: 0,  width: 35, height:35}} text="✔" uncheckedColor="grey"  />
                                    </View>
                                </View>

                                <TouchableOpacity
                                    style={[
                                        styles.button,
                                        { paddingHorizontal: 30, paddingVertical: 15, marginTop: 100 },
                                    ]}
                                    onPress={() => handleGameStart(timingNumber, isAllSameProblem, problemTypeInputOptionActive, problemTypeSelectOptionActive)}
                                >
                                    <Text
                                        style={{
                                            color: "white",
                                            fontSize: 16,
                                            textAlign: "center",
                                        }}
                                    >
                                        スタート
                                    </Text>
                                </TouchableOpacity>
                            </>
                        )}
                    </View>
                </View>
            </View>
        </Modal>
    )
}

const Divider:React.FC = () => {
    return (
        <View style={innerStyles.divider}>

        </View>
    )
}

const innerStyles = StyleSheet.create({
    boxContainer: {
        borderWidth: 1,
        borderColor: customColors.customLightBlue,
        backgroundColor: customColors.customDarkBlueBackground,
        borderRadius: 20,
        width: "100%",
        paddingVertical: 15,
        alignItems: "center"
    },
    divider: {
        borderBottomColor: customColors.blackGrey,
        borderBottomWidth: 1,
        marginVertical: 15,
        width: "100%",
      },
});

export default PlusMinusSettingModal;