// CustomTable.tsx
import React from 'react';
import { View, Text, FlatList, StyleSheet, ViewStyle, TextStyle, Image, TouchableOpacity } from 'react-native';
import { TableColumn, TableRow } from '../utils/Types';
  
  interface CustomTableProps {
    columns: TableColumn[];
    data: TableRow[];
    containerStyle?: ViewStyle;
    headerStyle?: TextStyle;
    rowStyle?: ViewStyle;
    cellStyle?: ViewStyle;
  }
  

const CustomTable: React.FC<CustomTableProps> = ({
  columns,
  data,
  containerStyle,
  headerStyle,
  rowStyle,
  cellStyle,
}) => {
  const renderHeader = () => {
    const totalWidth = columns.reduce((sum, column) => sum + (column.width ? column.width : 0), 0);

    return (
      <View style={[styles.headerRow, headerStyle]}>
        {columns.map((column) => {
          const columnWidth = 100 * (column.width ? column.width : 0) / totalWidth;
          const columnWidthPercent = `${columnWidth}%` as const;
          return <Text key={column.key} style={[styles.headerCell, { width: columnWidthPercent }, headerStyle]}>
                {column.title}
            </Text>
        })}
      </View>
    );
  };

  const renderItem = ({ item }: { item: TableRow }) => {
    const totalWidth = columns.reduce((sum, column) => sum + (column.width ? column.width : 0), 0);

    return (
      <View style={[styles.dataRow, rowStyle]}>
        {columns.map((column) => {
          const value = item[column.key];
          const columnWidth = 100 * (column.width ? column.width : 0) / totalWidth;
          const columnWidthPercent = `${columnWidth}%` as const;

          switch (column.type) {
            case 'avatar':
              return <View key={column.key} style={[styles.dataCell, { width: columnWidthPercent }, cellStyle]}><Image  source={{ uri: value }} style={styles.avatar} /></View>;
            case 'button':
              return (
                <View key={column.key} style={[styles.dataCell, { width: columnWidthPercent }, cellStyle]}>
                    <TouchableOpacity 
                        
                        style={styles.button} 
                        onPress={() => column.clickFunction ? column.clickFunction(item) : () => {}}
                    >
                    <Text style={styles.buttonText}>{value}</Text>
                    </TouchableOpacity>
                </View>
                
              );
            case 'image':
              return <View key={column.key} style={[styles.dataCell, { width: columnWidthPercent }, cellStyle]}><Image key={column.key} source={{ uri: value }} style={styles.image} /></View>;
            case 'icon':
              return <View key={column.key} style={[styles.dataCell, { width: columnWidthPercent }, cellStyle]}><Text style={[styles.icon, cellStyle]}>{value}</Text></View>;
            case 'reactnode':
                return (
                    <>{value}</>
                );
            default:
              return (
                <View key={column.key} style={[styles.dataCell, { width: columnWidthPercent }, cellStyle]}>
                    <Text style={{color: 'white'}}>
                        {value}
                    </Text>
                </View>
              );
          }
        })}
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
    // backgroundColor: '#f0f0f0',
  },
  headerCell: {
    // flex: 1,
    padding: 10,
    fontWeight: 'bold',
  },
  dataRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  dataCell: {
    // flex: 1,
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
  image: {
    width: 40,
    height: 40,
    marginHorizontal: 10,
  },
  icon: {
    fontSize: 24,
    textAlign: 'center',
  },
});

export default CustomTable;
