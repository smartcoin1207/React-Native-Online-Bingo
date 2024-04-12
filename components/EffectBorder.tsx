import { ReactNode } from "react";
import { View } from "react-native";

interface EffectBorderProps {
    style: any;
    children: ReactNode;
  }
  
  const EffectBorder: React.FC<EffectBorderProps> = ({ style,  children }) => {
    // You can access additionalProp here
    return (
      <View style={ [ style, { borderColor: '#09271b82', borderRadius: 55, borderWidth: 5}] }>
        <View style={{ borderColor: 'white', borderRadius: 55, borderWidth: 1}}>
          <View style={{ padding: 2, borderColor: '#09271b82', borderRadius: 45, borderWidth: 5 }}>
            {children}
          </View>
        </View>    
      </View>
    );
  };

  export default EffectBorder;