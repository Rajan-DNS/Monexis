import React from 'react';
import {View, Text, StyleSheet} from 'react-native';
import {NotoSerif} from './src/theme/typography';

/**
 * Test Component to verify NotoSerif font weights
 * 
 * Usage: Import this component in your App.tsx temporarily to test:
 * import TestNotoSerif from './TEST_NOTOSERIF';
 * Then render: <TestNotoSerif />
 */
const TestNotoSerif = () => {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>NotoSerif Font Test</Text>
      
      <Text style={styles.regular}>
        Regular: The quick brown fox jumps over the lazy dog
      </Text>
      
      <Text style={styles.medium}>
        Medium: The quick brown fox jumps over the lazy dog
      </Text>
      
      <Text style={styles.semiBold}>
        SemiBold: The quick brown fox jumps over the lazy dog
      </Text>
      
      <Text style={styles.bold}>
        Bold: The quick brown fox jumps over the lazy dog
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#fff',
    justifyContent: 'center',
  },
  title: {
    fontSize: 24,
    marginBottom: 30,
    textAlign: 'center',
    fontWeight: '700',
  },
  regular: {
    fontFamily: NotoSerif.regular,
    fontSize: 18,
    marginBottom: 15,
    color: '#000',
  },
  medium: {
    fontFamily: NotoSerif.medium,
    fontSize: 18,
    marginBottom: 15,
    color: '#000',
  },
  semiBold: {
    fontFamily: NotoSerif.semiBold,
    fontSize: 18,
    marginBottom: 15,
    color: '#000',
  },
  bold: {
    fontFamily: NotoSerif.bold,
    fontSize: 18,
    marginBottom: 15,
    color: '#000',
  },
});

export default TestNotoSerif;
