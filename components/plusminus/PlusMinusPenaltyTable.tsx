import React, { useEffect, useState } from "react";
import { Modal, Platform, StatusBar, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import Slider from '@react-native-community/slider';
import {
    PureRoundedCheckbox,
  } from "react-native-rounded-checkbox";

import { styles } from "../../utils/Styles";
import { customColors } from "../../utils/Color";
import Icon  from "react-native-vector-icons/Ionicons";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { TableColumn } from "../../utils/Types";
import CustomTable from "../CustomTable";
import Language from "../../utils/Variables";
const jpLanguage = Language.jp;

interface PlusMinusPenaltyTableProps {
    isVisible: boolean;
    setVisible: (isVisible: boolean) => void;
    setExitVisible: (isVisible: boolean) => void;
    scores: any[];
    penaltyResult: any;
    handleNextRound: () => void
}

const PlusMinusPenaltyTable: React.FC<PlusMinusPenaltyTableProps> = ({ isVisible, setVisible, setExitVisible, scores, penaltyResult, handleNextRound }) => {
    const columns: TableColumn[] = [
        { key: 'displayName', title: 'プレイヤー名', width: 100, type: 'text' },
        { key: 'correctResult', title: '正解', width: 100, type: 'text' },
        { key: 'wrongResult', title: '間違い', width: 100, type: 'text' },
      ];

    const lastUser = penaltyResult?.lastUser || '';
    const penaltyTitle = penaltyResult?.penaltyTitle || '';
    const lastUserDisplayName = lastUser?.displayName || '';

    const inset = useSafeAreaInsets();

    const statusBarHeight = (Platform.OS === 'ios' ? 20 : StatusBar.currentHeight) || 0; // On iOS, StatusBar.currentHeight is undefined, typically use 20

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
                            paddingHorizontal: 0,
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
                                paddingTop: inset.top,
                                borderWidth: 0,
                                borderColor: "white",
                                alignItems: "center",
                                justifyContent: 'flex-start'
                            },
                        ]}
                    >
                        <View style={{marginBottom: 20}}>
                            <Text style={{color: 'white', fontSize: 20, textAlign: 'center'}}>
                                足し算引き算ゲーム結果
                            </Text>
                        </View>
                        <CustomTable
                            columns={columns}
                            data={scores}
                            containerStyle={innerStyles.tableCointainer}
                            headerStyle={innerStyles.tableHeader}
                            rowStyle={innerStyles.tableRow}
                            cellStyle={innerStyles.tableCell}
                        />
                        <View style={{marginTop: 30, width: '80%'}}>
                            <View style={{flexDirection: 'row', justifyContent: 'space-between'}}>
                                <Text style={{color: 'white', fontSize: 20}}>
                                    最下位
                                </Text>
                                <Text style={{color: 'white', fontSize: 20}}>
                                    {lastUserDisplayName}
                                </Text>
                            </View>

                            <Divider />

                            <View style={{flexDirection: 'row', justifyContent: 'space-between'}}>
                                <Text style={{color: 'white', fontSize: 20}}>
                                    罰ゲーム
                                </Text>
                                <Text style={{color: 'white', fontSize: 20}}>
                                    {penaltyTitle}
                                </Text>
                            </View>
                        </View>
                        {true  && (
                            <View style={{ flexDirection: 'row', justifyContent: 'space-around', width: '100%', marginVertical: 'auto', alignItems: 'center',  flex: 1 }}>
                                <TouchableOpacity
                                    style={{ padding: 10, borderWidth: 1, borderColor: customColors.blackGrey, borderRadius: 20, backgroundColor: customColors.blackRed, justifyContent: 'center', alignItems: 'center', marginTop: 10 }}
                                    onPress={() => { setExitVisible(true);}}
                                >
                                    <Text style={{ fontSize: 18, color: 'white', letterSpacing: 5 }}>退出する</Text>
                                </TouchableOpacity>

                                <TouchableOpacity
                                    style={{ padding: 10, borderWidth: 1, borderColor: customColors.blackGrey, borderRadius: 20, backgroundColor: customColors.customLightBlue, justifyContent: 'center', alignItems: 'center', marginTop: 10 }}
                                    onPress={() => handleNextRound()}
                                >
                                    <Text style={{ fontSize: 18, color: 'white', letterSpacing: 5 }}>もう1回</Text>
                                </TouchableOpacity>
                            </View>
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
    divider: {
        borderBottomColor: customColors.blackGrey,
        borderBottomWidth: 1,
        marginVertical: 15,
        width: "100%",
      },
    tableCointainer: {
        borderWidth: 1,
        borderColor: '#ddd',
        borderRadius: 10,
        width: '94%',
        backgroundColor: customColors.customDarkBlueBackground
    },
    tableHeader: {
        backgroundColor: customColors.customDarkBlue,
        color: 'white',
        textAlign: 'center',
        borderRadius: 10
    },
    tableRow: {
        borderBottomWidth: 1,
        borderBottomColor: '#ddd',
        borderRadius: 10
    },
    tableCell: {
        alignItems: 'center'
    }
});

export default PlusMinusPenaltyTable;