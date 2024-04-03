import React, { useState } from 'react';
import { TouchableOpacity, Text, View, StyleSheet } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons'; // Import the icon component

interface Penalty {
  id: number;
  title: string;
}

interface RenderGameRoomItemProps {
  item: Penalty;
  index: number;
}

const RenderGameRoomItem: React.FC<RenderGameRoomItemProps> = ({ item, index }) => {
  const [isPressed, setIsPressed] = useState(false);

  const handlePressIn = () => {
    setIsPressed(true);
  };

  const handlePressOut = () => {
    setIsPressed(false);
  };

  return (
    <TouchableOpacity
      style={[styles.penaltyItemRow, isPressed && styles.pressedStyle]}
      activeOpacity={0.5}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
    >
      <Text style={{ fontSize: 20, color: 'white', width: '18%' }}>{index + 1}</Text>
      <Text style={{ fontSize: 15, color: 'white', display: 'flex' }}>{item.title}</Text>
      <View style={styles.iconContainer}>
        <TouchableOpacity style={styles.editIconBtn}>
          <MaterialCommunityIcons name="book-edit" size={24} color="yellow" />
        </TouchableOpacity>
        <TouchableOpacity style={styles.deleteIconBtn}>
          <MaterialCommunityIcons name="delete-forever" size={24} color="black" />
        </TouchableOpacity>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  penaltyItemRow: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 10,
    borderWidth: 1,
    borderColor: 'black',
  },
  pressedStyle: {
    backgroundColor: 'lightgrey',
  },
  iconContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  editIconBtn: {
    // Add styles for the edit icon button
  },
  deleteIconBtn: {
    // Add styles for the delete icon button
  },
});

export default RenderGameRoomItem;