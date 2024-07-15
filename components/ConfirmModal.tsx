import React from 'react';
import { Modal, View, Text, StyleSheet, TouchableOpacity, TouchableWithoutFeedback } from 'react-native';
import { customColors } from '../utils/Color';

interface ModalProps {
    isVisible: boolean;
    setVisible: (isVisible: boolean) => void;
    messageText?: string;
    confirmText?: string;
    cancelText?: string;
    confirmBackgroundColor?: string;
    cancelBackgroundColor?: string;
    onConfirm: () => void,
    onCancel: () => void,
    topElement?: React.ReactNode,
    middleElement?: React.ReactNode,
    bottomElement?: React.ReactNode
}

const ConfirmModal: React.FC<ModalProps> = ({
    isVisible,
    setVisible,
    messageText = "本気ですか？",
    confirmText = "はい",
    cancelText = "いいえ",
    confirmBackgroundColor = customColors.customDarkGreen1,
    cancelBackgroundColor = customColors.blackGrey,
    onConfirm,
    onCancel,
    topElement = <></>,
    middleElement = <></>,
    bottomElement = <></>
}) => {
    return (
        <Modal
            animationType="fade"
            transparent={true}
            visible={isVisible}
            onRequestClose={() => {
                setVisible(false);
            }}
        >
            <TouchableWithoutFeedback onPress={() => setVisible(false)}>
                <View
                    style={{
                        flex: 1,
                        justifyContent: "center",
                        alignItems: "center",
                        backgroundColor: customColors.modalBackgroundColor,
                    }}
                >
                    <TouchableWithoutFeedback onPress={() => { }}>
                        <View style={styles.modalBody}>
                            <View style={styles.modalMessageTextContainer}>
                                <Text style={styles.modalMainMessageText}>
                                    {messageText}
                                </Text>
                            </View>

                            <View style={styles.modalMiddleElementContainer}>
                                {middleElement}
                            </View>

                            <Divider />

                            <View style={styles.buttonContainer}>
                                <TouchableOpacity
                                    style={[styles.modalCancelBtn, { backgroundColor: cancelBackgroundColor }]}
                                    onPress={() => { setVisible(false); onCancel(); }}
                                >
                                    <Text style={styles.modalOkText}> {cancelText} </Text>
                                </TouchableOpacity>

                                <TouchableOpacity style={[styles.modalOkBtn, { backgroundColor: confirmBackgroundColor }]} onPress={onConfirm}>
                                    <Text style={styles.modalOkText}> {confirmText} </Text>
                                </TouchableOpacity>
                            </View>
                            <View style={styles.modalBottomElementContainer}>
                                {bottomElement}
                            </View>
                        </View>
                    </TouchableWithoutFeedback>
                </View>
            </TouchableWithoutFeedback>
        </Modal>
    );
};

const Divider: React.FC = () => {
    return (
        <View style={styles.divider}>
        </View>
    )
}

const styles = StyleSheet.create({
    modalBody: {
        justifyContent: "center",
        alignItems: "center",
        backgroundColor: customColors.modalContainerBackgroundColor,
        paddingHorizontal: 15,
        paddingVertical: 15,
        borderWidth: 1,
        borderColor: customColors.blackGrey,
        borderRadius: 20,
        width: "80%",
    },
    buttonContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        width: '100%',
    },

    modalMessageTextContainer: {
        marginVertical: 15,
        alignItems: 'center'
    },
    modalMiddleElementContainer: {
        alignItems: 'center',
        marginTop: 10,
        width: '100%'
    },
    modalBottomElementContainer: {
        alignItems: 'center',
        width: '100%'
    },
    modalMainMessageText: {
        fontSize: 20,
        color: customColors.white,
        fontFamily: "NotoSansJP_400Regular",
        alignItems: "flex-start",
    },
    modalOkBtn: {
        backgroundColor: customColors.customDarkGreen1,
        paddingVertical: 8,
        paddingHorizontal: 6,
        padding: 4,
        marginHorizontal: 4,
        marginVertical: 4,
        borderRadius: 6,
        borderWidth: 1,
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
    },
    modalOkText: {
        fontSize: 16,
        color: "white",
        fontFamily: "NotoSansJP_400Regular",
        fontWeight: "700",
        textAlign: "center",
    },

    divider: {
        borderBottomColor: customColors.blackGrey,
        borderBottomWidth: 1,
        marginVertical: 15,
        width: "100%",
    },
});

export default ConfirmModal;
