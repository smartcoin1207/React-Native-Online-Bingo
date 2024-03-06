import { useNavigation } from '@react-navigation/native';
import { View, Text, StyleSheet, Pressable, Dimensions, TouchableOpacity } from 'react-native';

const screenHeight = Dimensions.get('window').height;
    const cellSize = screenHeight / 5; 

export default function GameRoomScreen() {
    const navigator = useNavigation();
    
    return (
       
            <View style={styles.container}>
                <Pressable 
                    style={styles.button}
                    onPress={() => navigator.navigate('Play')}
                >
                    <Text style={styles.textTitle}>ゲームを作る</Text>
                </Pressable>
                
                <Pressable style={styles.button}>
                    <Text style={styles.textTitle}>ゲーム参加</Text>
                </Pressable>
            </View>
        
    );
}

const styles = StyleSheet.create({

    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'black',
        paddingHorizontal: 30,
        width: '100%',
        
    },
    button : {
        width : '100%',
        backgroundColor: '#ff0000',
        paddingVertical: 8,
        marginVertical: 4,
        borderRadius: 6,
    },
    textTitle:{
        fontSize: 20,
        color: 'white',
        fontFamily:'serif',
        fontWeight: '700',
        textAlign: 'center',
    }
});
