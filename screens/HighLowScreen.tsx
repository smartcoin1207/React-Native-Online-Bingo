import { View, SafeAreaView, Text, StyleSheet, TouchableOpacity, Dimensions, Linking, Animated, Easing  } from 'react-native';
import { UseSelector, useDispatch, useSelector } from 'react-redux';
import { useNavigation } from '@react-navigation/native';
import { useEffect } from 'react';
import { RootState } from '../store';
import { customColors } from '../utils/Color';
import React from 'react';
const screenHeight = Dimensions.get('window').height;

const HighLowScreen: React.FC = () => {
    const navigation = useNavigation();
    const isLoggedIn = useSelector((state: RootState) => state.auth.isLoggedIn);

    return (
        <SafeAreaView style={styles.container}>
            <Text style={{color: 'white', fontSize: 35, textAlign:'center'}}>
                High & Low
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

export default HighLowScreen;

