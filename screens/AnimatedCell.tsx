import { View, Text, StyleSheet, Pressable, Dimensions, Linking, Animated, Easing  } from 'react-native';
import { UseSelector, useDispatch, useSelector } from 'react-redux';
import { useNavigation } from '@react-navigation/native';
import { useEffect } from 'react';
import { RootState } from '../store';
import { customColors } from '../utils/Color';
const screenHeight = Dimensions.get('window').height;
const cellSize = screenHeight / 5;

import { useRef } from 'react';

interface AnimatedCellProps {
    cellSize: number;
    cellValue: number;
    dynamicStyle : any;
}

const AnimatedCell: React.FC<AnimatedCellProps> = (props) => {
    const {cellSize, cellValue, dynamicStyle} = props;
    const animatedCellSize = useRef(new Animated.Value(cellSize)).current;
    const targetCellSize = cellSize * 1.06;
    const borderColor = useRef(new Animated.Value(0)).current;

    useEffect(() => {
        const animateBorder = () => {
          Animated.loop(
            Animated.sequence([
                Animated.timing(animatedCellSize, {
                    toValue: targetCellSize,
                    duration: 1000,
                    easing: Easing.linear,
                    useNativeDriver: false,
                }),
                Animated.timing(animatedCellSize, {
                    toValue: cellSize,
                    duration: 1000,
                    easing: Easing.linear,
                    useNativeDriver: false,
                })
            ])
        ).start();
          };
  
      animateBorder();
  
      return () => {
        animatedCellSize.setValue(cellSize);
        borderColor.setValue(0);
      };
    }, [animatedCellSize, borderColor]);

    const interpolatedColor = borderColor.interpolate({
        inputRange: [0, 1],
        outputRange: ['green', customColors.blackGreen],
      });
  
    return (
      <View style={{ width: targetCellSize, height: targetCellSize}}>
        <Animated.View
          style={{
            width: animatedCellSize,
            height: animatedCellSize,
            borderWidth: 1
          }}
          >
            <Text style={[dynamicStyle, { width: '100%', height: '100%' }]}>
              {cellValue}
            </Text>
          </Animated.View>
      </View>
    );
  };
  
  export {AnimatedCell};
