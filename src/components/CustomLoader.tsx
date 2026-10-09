import React, { useEffect, useRef } from 'react';
import {
  View,
  StyleSheet,
  Animated,
  Easing,
  Modal,
  Text,
  Dimensions,
} from 'react-native';
import Colors from '../theme/colors';
import { Poppins } from '../theme/typography';

const { width } = Dimensions.get('window');

interface CustomLoaderProps {
  visible: boolean;
  message?: string;
}

const CustomLoader: React.FC<CustomLoaderProps> = ({ visible, message = 'Processing...' }) => {
  const rotateAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (visible) {
      Animated.loop(
        Animated.timing(rotateAnim, {
          toValue: 1,
          duration: 1200,
          easing: Easing.linear,
          useNativeDriver: true,
        })
      ).start();
    } else {
      rotateAnim.setValue(0);
    }
  }, [visible, rotateAnim]);

  const spin = rotateAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg'],
  });

  return (
    <Modal
      transparent={true}
      animationType="fade"
      visible={visible}
      onRequestClose={() => { }}
    >
      <View style={styles.overlay}>
        <View style={styles.loaderContainer}>
          <View style={styles.spinnerWrapper}>
            <Animated.View style={[styles.spinner, { transform: [{ rotate: spin }] }]}>
              <View style={styles.dot} />
            </Animated.View>
            <View style={styles.innerCircle} />
          </View>
          {message && <Text style={styles.message}>{message}</Text>}
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.4)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  loaderContainer: {
    backgroundColor: '#FFFFFF',
    padding: 30,
    borderRadius: 20,
    alignItems: 'center',
    width: width * 0.45,
    elevation: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 0.2,
    shadowRadius: 10,
  },
  spinnerWrapper: {
    width: 60,
    height: 60,
    justifyContent: 'center',
    alignItems: 'center',
  },
  spinner: {
    width: 60,
    height: 60,
    borderRadius: 30,
    borderWidth: 4,
    borderColor: '#F3F4F6',
    borderTopColor: Colors.primary,
    borderRightColor: Colors.primary,
    position: 'absolute',
  },
  innerCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#F1F7FF',
    justifyContent: 'center',
    alignItems: 'center',
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: Colors.primary,
    position: 'absolute',
    top: 5,
    left: '45%',
  },
  message: {
    marginTop: 20,
    fontSize: 16,
    fontFamily: Poppins.semiBold,
    fontWeight: '600',
    color: '#4B5563',
    textAlign: 'center',
  },
});

export default CustomLoader;
