import React, { useState } from 'react';
import {
  View,
  TextInput,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInputProps,
  ViewStyle,
} from 'react-native';
import { Colors, Typography, Spacing, Radius, Dimensions } from '../theme';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { Poppins } from '../theme/typography';

interface DNSInputProps extends TextInputProps {
  error?: string;
  isPassword?: boolean;
  containerStyle?: ViewStyle;
  isFocused?: boolean;
  onFocusInput?: () => void;
  onBlurInput?: () => void;
}

const DNSInput: React.FC<DNSInputProps> = ({
  error,
  isPassword = false,
  containerStyle,
  isFocused,
  onFocusInput,
  onBlurInput,
  ...rest
}) => {
  const [showPassword, setShowPassword] = useState(false);

  return (
    <View style={[styles.container, containerStyle]}>
      <View
        style={[
          styles.inputRow,
          isFocused && styles.inputRowFocused,
          error && styles.inputRowError,
        ]}
      >
        <TextInput
          style={styles.input}
          placeholderTextColor={Colors.textMuted}
          onFocus={onFocusInput}
          onBlur={onBlurInput}
          secureTextEntry={isPassword && !showPassword}
          {...rest}
        />

        {isPassword && (
          <TouchableOpacity onPress={() => setShowPassword(v => !v)} style={styles.eyeBtn}>
            <Ionicons
              name={showPassword ? 'eye-outline' : 'eye-off-outline'}
              size={24}
              color={Colors.textMuted}
            />
          </TouchableOpacity>
        )}
      </View>

      {error && <Text style={styles.error}>{error}</Text>}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: Spacing.md,
  },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.bgInput,
    borderRadius: Radius.md,
    borderWidth: 1.5,
    borderColor: Colors.inputBorder,
    minHeight: Dimensions.inputHeight,
  },
  inputRowFocused: {
    borderColor: Colors.inputBorderFocused,
    backgroundColor: Colors.white,
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.12,
    shadowRadius: 8,
    elevation: 3,
  },
  inputRowError: {
    borderColor: Colors.error,
  },
  input: {
    flex: 1,
    fontSize: Typography.inputText,
    fontFamily: Poppins.regular,
    color: Colors.textDark,
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.lg,
  },
  eyeBtn: {
    paddingRight: Spacing.md,

  },
  eyeIcon: {
    fontSize: 16,
    fontFamily: Poppins.regular,
  },
  error: {
    fontSize: Typography.small,
    fontFamily: Poppins.regular,
    color: Colors.error,
    marginTop: Spacing.xs,
    marginLeft: Spacing.sm,
  },
});

export default DNSInput;
