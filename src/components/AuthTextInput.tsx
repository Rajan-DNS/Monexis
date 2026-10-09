import React, { useEffect, useRef, useState } from 'react';
import {
  Animated,
  StyleSheet,
  Text,
  TextInput,
  TextInputProps,
  TouchableOpacity,
  View,
} from 'react-native';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import Colors from '../theme/colors';
import { Poppins } from '../theme/typography';
import { Dimensions } from '../theme/spacing';

type AuthTextInputProps = TextInputProps & {
  error?: string;
  isPassword?: boolean;
};

const AuthTextInput: React.FC<AuthTextInputProps> = ({
  error,
  isPassword,
  onBlur,
  onFocus,
  style,
  ...props
}) => {
  const [isFocused, setIsFocused] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const focusAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(focusAnim, {
      toValue: isFocused ? 1 : 0,
      duration: 200,
      useNativeDriver: false,
    }).start();
  }, [focusAnim, isFocused]);

  const borderColor = focusAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [error ? '#EF4444' : '#E2E8F0', Colors.primary],
  });

  const backgroundColor = focusAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['#F8FAFC', '#FFFFFF'],
  });

  return (
    <View style={styles.wrapper}>
      <Animated.View style={[styles.container, { borderColor, backgroundColor }]}>
        <TextInput
          {...props}
          placeholderTextColor="#94A3B8"
          secureTextEntry={isPassword && !showPassword}
          style={[styles.input, style]}
          onFocus={(event) => {
            setIsFocused(true);
            onFocus?.(event);
          }}
          onBlur={(event) => {
            setIsFocused(false);
            onBlur?.(event);
          }}
        />
        {isPassword && (
          <TouchableOpacity
            onPress={() => setShowPassword(!showPassword)}
            style={styles.eyeIcon}
            activeOpacity={0.7}
          >
            <MaterialIcons
              name={showPassword ? 'visibility' : 'visibility-off'}
              size={22}
              color="#94A3B8"
            />
          </TouchableOpacity>
        )}
      </Animated.View>
      {!!error && <Text style={styles.errorText}>{error}</Text>}
    </View>
  );
};

const styles = StyleSheet.create({
  wrapper: {
    marginBottom: 16,
    width: '100%',
  },
  container: {
    width: '100%',
    height: Dimensions.inputHeight,
    borderRadius: 14,
    borderWidth: 1.5,
    paddingHorizontal: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  input: {
    fontSize: 16,
    fontFamily: Poppins.medium,
    color: '#0F172A',
    flex: 1,
  },
  eyeIcon: {
    padding: 4,
    marginLeft: 8,
  },
  errorText: {
    color: '#EF4444',
    fontSize: 12,
    fontFamily: Poppins.medium,
    marginTop: 4,
    marginLeft: 4,
  },
});

export default AuthTextInput;
