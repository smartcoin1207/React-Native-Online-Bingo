import { ImageStyle, StyleSheet } from "react-native";
import { customColors } from "./Color";

export const styles = StyleSheet.create({
    container: {
      flex: 1,
      justifyContent: "center",
      alignItems: "center",
      backgroundColor: customColors.black,
      paddingTop: 35,
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
      paddingVertical: 10,
      paddingHorizontal: 20,
      marginHorizontal: 4,
      borderRadius: 30,
      borderWidth: 1,
      borderColor: customColors.customLightBlue1,
    },
  
    textTitle: {
      fontSize: 25,
      color: customColors.white,
      fontFamily: "NotoSansJP_400Regular",
      fontWeight: "700",
      textAlign: "center",
      letterSpacing: 10
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
      fontFamily: "NotoSansJP_400Regular",
      fontWeight: "700",
      textAlign: "center",
      marginBottom: 20,
    },
    modalOkBtn: {
      backgroundColor: customColors.customLightBlue,
      paddingVertical: 8,
      paddingHorizontal: 6,
      padding: 4,
      marginHorizontal: 4,
      marginVertical: 4,
      borderRadius: 20,
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
      borderRadius: 20,
      borderWidth: 1,
      borderColor: customColors.white,
    },
    roomModalButtonText: {
      fontSize: 16,
      color: customColors.white,
      fontFamily: "NotoSansJP_400Regular",
      fontWeight: "700",
      textAlign: "center",
    },
    completedText: {
      fontSize: 30,
      color: customColors.white,
      width: "90%",
      fontFamily: "NotoSansJP_400Regular",
      fontWeight: "700",
      textAlign: "center",
    },
    roomModalBtns: {
      flexDirection: "row",
      width: "80%",
      justifyContent: "space-between",
    },
    input: {
      fontSize: 30,
      color: customColors.white,
      fontWeight: '700',
      width: 80,
      height: 80,
      textAlign: 'center'
    },
    modalText: {
      fontSize: 16,
      color: customColors.white,
      fontFamily: "NotoSansJP_400Regular",
      alignItems: "flex-start",
      marginBottom: 5,
    },
    errText: {
      color: customColors.blackRed,
      fontSize: 16,
    },
    tooltipText: {
      fontSize: 14,
      color: 'white',
    },
  
    modalOkText: {
      fontSize: 16,
      color: "white",
      fontFamily: "NotoSansJP_400Regular",
      fontWeight: "700",
      textAlign: "center",
    },
    numberText: {
      fontSize: 30,
      fontFamily: "NotoSansJP_400Regular",
      color: 'white',
      textAlign: 'center',
      fontWeight: '700'
    }
  });