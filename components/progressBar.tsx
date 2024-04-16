import React, { useEffect, useState } from 'react';
import { View, ProgressBarAndroid, StyleSheet } from 'react-native';

const MyProgressBar: React.FC = () => {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      if (progress < 1) {
        setProgress(prevProgress => prevProgress + 0.05);
      } else {
        clearInterval(interval);
      }
    }, 100); // Update the progress every second

    return () => clearInterval(interval);
  }, [progress]);

  return (
    <View style={styles.container}>
      <ProgressBarAndroid styleAttr="Horizontal" indeterminate={false} progress={progress} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    width: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default MyProgressBar;
