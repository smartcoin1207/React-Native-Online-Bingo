import React from "react";
import { StyleSheet, Text, TouchableOpacity } from "react-native";
import { customColors } from "../../utils/Color";

interface PlusMinusValueButtonProps {
    value: number;
    onButtonClick: (auto: boolean, value?: number) => void;
  }

const PlusMinusValueButton: React.FC<PlusMinusValueButtonProps> = ({ value, onButtonClick }) => {
    return (
      <TouchableOpacity
          style={styles.button}
          onPress={() => onButtonClick(false, value)}
          >
          <Text style={styles.buttonText}>{value}</Text>
      </TouchableOpacity>
    )
}

const styles = StyleSheet.create({
    button: {
        display: "flex",
        backgroundColor: customColors.customLightBlue,
        padding: 5,
        paddingHorizontal: 15,
        borderRadius: 6,
      },
    
    buttonText: {
        fontSize: 20,
        color: customColors.white,
        fontFamily: "NotoSansJP_400Regular",
        fontWeight: "500",
        textAlign: "center",
    },
  });

export default PlusMinusValueButton;