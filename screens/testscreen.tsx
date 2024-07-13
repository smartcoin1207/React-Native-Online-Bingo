import React from 'react';
import { SafeAreaView, StyleSheet, Alert } from 'react-native';
import CustomTable from '../components/CustomTable';
import { TableColumn } from '../utils/Types';

const TestScreen = () => {
  const handleButtonClick = (item: any) => {
    Alert.alert('Button Clicked', `You clicked on ${item.name}`);
  };

  const columns: TableColumn[] = [
    { key: 'avatar', title: '', width: 50, type: 'avatar' },
    { key: 'name', title: 'Name', width: 100, type: 'text' },
    { key: 'age', title: 'Age', width: 50, type: 'text' },
    { key: 'city', title: 'City', width: 100, type: 'text' },
    { key: 'action', title: '', width: 100, type: 'button', clickFunction: handleButtonClick },
  ];

  const data = [
    { name: 'John Doe', age: 28, city: 'New York', avatar: 'https://via.placeholder.com/40', action: 'Click Me' },
    { name: 'Jane Smith', age: 34, city: 'Los Angeles', avatar: 'https://via.placeholder.com/40', action: 'Click Me' },
    { name: 'Sam Johnson', age: 45, city: 'Chicago', avatar: 'https://via.placeholder.com/40', action: 'Click Me' },
    { name: 'John Doe', age: 28, city: 'New York', avatar: 'https://via.placeholder.com/40', action: 'Click Me' },
    { name: 'Jane Smith', age: 34, city: 'Los Angeles', avatar: 'https://via.placeholder.com/40', action: 'Click Me' },
    { name: 'Sam Johnson', age: 45, city: 'Chicago', avatar: 'https://via.placeholder.com/40', action: 'Click Me' },    { name: 'John Doe', age: 28, city: 'New York', avatar: 'https://via.placeholder.com/40', action: 'Click Me' },
    { name: 'Jane Smith', age: 34, city: 'Los Angeles', avatar: 'https://via.placeholder.com/40', action: 'Click Me' },
    { name: 'Sam Johnson', age: 45, city: 'Chicago', avatar: 'https://via.placeholder.com/40', action: 'Click Me' },
  ];

  return (
    <SafeAreaView style={styles.container}>
      <CustomTable
        columns={columns}
        data={data}
        containerStyle={styles.tableContainer}
        headerStyle={styles.tableHeader}
        rowStyle={styles.tableRow}
        cellStyle={styles.tableCell}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  tableContainer: {
    borderWidth: 1,
    borderColor: '#ddd',
    width: '100%',
  },
  tableHeader: {
    backgroundColor: '#f7f7f7',
    textAlign: 'center',
  },
  tableRow: {
    borderBottomWidth: 1,
    borderBottomColor: '#ddd',
  },
  tableCell: {
    alignItems: 'center'
  },
});

export default TestScreen;
