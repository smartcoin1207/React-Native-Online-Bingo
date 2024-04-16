import * as React from "react";
import {
  Dimensions,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { customColors } from "../utils/Color";
import { List } from "react-native-paper";
import Icon from "react-native-vector-icons/FontAwesome";

const { width: viewportWidth, height: viewportHeight } =
  Dimensions.get("window");

const FirstRoute = () => {
  return (
    <View
      style={{
        flex: 1,
        backgroundColor: customColors.black,
        marginTop: 10,
        position: "relative",
      }}
    >
      <ScrollView
        showsVerticalScrollIndicator={true} 
        showsHorizontalScrollIndicator={true}
        scrollEnabled={true}
      >
        <View style={{ backgroundColor: "black", padding: 10 }}>
          <List.Accordion
            title="今 野"
            titleStyle={{
              color: customColors.white,
              alignSelf: "center",
              fontSize: 20,
            }}
            style={{
              backgroundColor: customColors.penaltyBackGrey,
              borderRadius: 20,
              paddingVertical: 0,
              alignItems: "center",
            }}
          >
            <List.Item
              title="お酒を一気飲み"
              titleStyle={{ color: customColors.white, alignSelf: "center" }}
            />

            <TouchableOpacity
              style={{
                position: "absolute",
                top: 5,
                left: "0%",
                borderRadius: 50,
                borderWidth: 1,
                borderColor: customColors.blackGrey,
                padding: 10,
                paddingHorizontal: 12,
                alignItems: "center",
              }}
              onPress={() => {
                console.log("xxx");
              }}
            >
              <Icon
                name="plus"
                size={15}
                color={customColors.customLightBlue}
              />
            </TouchableOpacity>
          </List.Accordion>
        </View>
      </ScrollView>
    </View>
  );
};

const PenaltyScreen = () => {

  return (
    <View style={styles.container}>
      <View style={styles.topHeader}>
        <Text style={styles.title}>罰ゲーム</Text>
      </View>
      <FirstRoute />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 5,
    paddingTop: viewportHeight * 0.02,
    backgroundColor: "#000000",
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
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },

  penaltyItemRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 10,
    marginVertical: 3,
    paddingVertical: 9,
    borderWidth: 1,
    borderColor: customColors.blackGrey,
    backgroundColor: customColors.penaltyBackGrey,
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
    // height: '10%',
    // backgroundColor: customColors.blackGrey,
    marginHorizontal: 5,
    marginTop: 10,
    paddingTop: 10,
    // borderRadius: 10,
    borderTopColor: customColors.white,
    borderTopWidth: 1,
  },
});

export default PenaltyScreen;
