// CustomTable.tsx
import React from 'react';
import { View, Text, FlatList, StyleSheet, ViewStyle, TextStyle, Image, TouchableOpacity } from 'react-native';

interface TableColumn {
  key: string;
  title: string;
  width?: number;
}

interface TableRow {
  [key: string]: any;
}

interface CustomTableProps {
  columns: TableColumn[];
  data: TableRow[];
  containerStyle?: ViewStyle;
  headerStyle?: TextStyle;
  rowStyle?: ViewStyle;
  cellStyle?: TextStyle;
  onButtonClick?: (item: TableRow) => void;
}

const CustomTable1: React.FC<CustomTableProps> = ({
  columns,
  data,
  containerStyle,
  headerStyle,
  rowStyle,
  cellStyle,
  onButtonClick,
}) => {
  const renderHeader = () => {
    return (
      <View style={[styles.headerRow, headerStyle]}>
        {columns.map((column) => (
          <Text key={column.key} style={[styles.headerCell, { width: column.width }, headerStyle]}>
            {column.title}
          </Text>
        ))}
        <Text style={[styles.headerCell, { width: 50 }, headerStyle]}>Avatar</Text>
        <Text style={[styles.headerCell, { width: 80 }, headerStyle]}>Action</Text>
      </View>
    );
  };

  const renderItem = ({ item }: { item: TableRow }) => {
    return (
      <View style={[styles.dataRow, rowStyle]}>
        {columns.map((column) => (
          <Text key={column.key} style={[styles.dataCell, { width: column.width }, cellStyle]}>
            {item[column.key]}
          </Text>
        ))}
        <Image source={{ uri: item.avatar }} style={styles.avatar} />
        <TouchableOpacity style={styles.button} onPress={() => onButtonClick?.(item)}>
          <Text style={styles.buttonText}>Click Me</Text>
        </TouchableOpacity>
      </View>
    );
  };

  return (
    <View style={[styles.container, containerStyle]}>
      {renderHeader()}
      <FlatList
        data={data}
        renderItem={renderItem}
        keyExtractor={(item, index) => index.toString()}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    margin: 10,
  },
  headerRow: {
    flexDirection: 'row',
    backgroundColor: '#f0f0f0',
  },
  headerCell: {
    flex: 1,
    padding: 10,
    fontWeight: 'bold',
  },
  dataRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  dataCell: {
    flex: 1,
    padding: 10,
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginHorizontal: 10,
  },
  button: {
    backgroundColor: '#007BFF',
    padding: 10,
    borderRadius: 5,
  },
  buttonText: {
    color: '#fff',
  },
});

export default CustomTable1;
