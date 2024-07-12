import React, { useEffect, useState } from "react";
import { Modal, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import Slider from '@react-native-community/slider';
import {
    RoundedCheckbox,
    PureRoundedCheckbox,
  } from "react-native-rounded-checkbox";

import { styles } from "../../utils/Styles";
import { customColors } from "../../utils/Color";

interface PlusMinusSettingModalProps {
    isHost: boolean;
    visible: boolean;
    handleGameStart: (timingNumber: number, autoNextProblemActive: boolean, problemTypeOptionActive: boolean) => void;
}

const PlusMinusSettingModal: React.FC<PlusMinusSettingModalProps> = ({ isHost, visible, handleGameStart }) => {
    const [waitModalVisible, setWaitModalVisible] = useState<boolean>(false);
    const [timing, setTiming] = useState<number>(10);
    const [timingNumber, setTimingNumber] = useState<number>(0);
    const [autoNextProblemActive, setAutoNextProblemActive] = useState<boolean>(false);
    const [problemTypeOptionActive, setProblemTypeOptionActive] = useState<boolean>(false);

    useEffect(() => {
        setWaitModalVisible(visible)
    }, [visible])

    useEffect(() => {
        console.log(timing);
        setTimingNumber(Math.floor(timing))
    }, [timing])

    return (
        <Modal
            animationType="fade"
            transparent={true}
            visible={waitModalVisible}
            onRequestClose={() => {
                setWaitModalVisible(false);
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
                        },
                    ]}
                >
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
                                            <Text style={{ color: 'white', fontWeight: '600', fontSize: 18, paddingLeft: 10 }}>{timingNumber}s</Text>
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
                                        <Text style={{fontSize: 15, color: 'white'}}>次の問題の自動リリース</Text>
                                        <PureRoundedCheckbox onPress={(checked) => setAutoNextProblemActive(checked)}  textStyle={{fontSize: 17}} innerStyle={{width: 30, height:30}} outerStyle={{borderColor: 'black', borderWidth: 0, width: 35, height:35}} text="✔" uncheckedColor="grey"  />
                                    </View>
                                    <Divider />
                                    <View style={{display: 'flex', width: '100%', flexDirection: 'row', justifyContent: 'space-between', paddingHorizontal: 15, alignItems: 'center'}}>
                                        <Text style={{fontSize: 15, color: 'white'}}>空白の塗りつぶしと選択</Text>
                                        <PureRoundedCheckbox onPress={(checked) => setProblemTypeOptionActive(checked)}  textStyle={{fontSize: 17}} innerStyle={{width: 30, height:30}} outerStyle={{borderColor: 'black', borderWidth: 0,  width: 35, height:35}} text="✔" uncheckedColor="grey"  />
                                    </View>
                                </View>

                                <TouchableOpacity
                                    style={[
                                        styles.button,
                                        { paddingHorizontal: 30, paddingVertical: 15, marginTop: 100 },
                                    ]}
                                    onPress={() => handleGameStart(timingNumber, autoNextProblemActive, problemTypeOptionActive)}
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