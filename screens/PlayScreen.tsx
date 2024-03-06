import * as React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import BingoBoard from '../components/BingoBoard';

const PlayBoard: React.FC = () => {
    return (
        <View style={styles.container}>
            <Text style={styles.title}>BINGO</Text>
            <Text style={styles.selected}>98</Text>
            <BingoBoard />
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        paddingTop: '15%',
        flexDirection: 'column',
        backgroundColor: '#241e20',
        alignItems: 'center',
    },
    title: {
        color: 'white',
        fontSize: 90,
        fontWeight: "700",
    },
    selected: {
        color: 'white',
        fontSize: 65,
        marginBottom: 20,
        borderColor: 'white',
    }
});

export default PlayBoard;