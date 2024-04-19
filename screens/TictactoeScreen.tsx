import { View, SafeAreaView, Text, StyleSheet, TouchableOpacity, Dimensions, Linking, Animated, Easing  } from 'react-native';
import { UseSelector, useDispatch, useSelector } from 'react-redux';
import { useNavigation } from '@react-navigation/native';
import { useEffect } from 'react';
import { RootState } from '../store';
import { customColors } from '../utils/Color';
const screenHeight = Dimensions.get('window').height;

const TictactoeScreen: React.FC = () => {
    return (
        <SafeAreaView style={styles.container}>
            <Text style={{color: 'white', fontSize: 35, textAlign:'center'}}>
                （3 x 3） O　X ゲーム
            </Text>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        alignItems: 'center',
        backgroundColor: customColors.black,
        justifyContent: 'center'
    },
});

export default TictactoeScreen;

