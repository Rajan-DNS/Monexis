import React, { useState, useRef } from 'react';
import {
  Modal,
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  TouchableWithoutFeedback,
  Keyboard,
  NativeSyntheticEvent,
  TextInputKeyPressEventData
} from 'react-native';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import { Colors } from '../../../../../theme';
import { Poppins } from '../../../../../theme/typography';

interface VerificationOTPModalProps {
  isVisible: boolean;
  onClose: () => void;
  type: 'MOBILE' | 'PAN' | 'IFSC';
  targetValue: string;
  onVerify: (otp: string) => void;
}

export const VerificationOTPModal: React.FC<VerificationOTPModalProps> = ({
  isVisible,
  onClose,
  type,
  targetValue,
  onVerify
}) => {
  const [otp, setOtp] = useState<string[]>(['', '', '', '', '', '']);
  const [focusedIndex, setFocusedIndex] = useState<number>(0);
  const inputsRef = useRef<Array<TextInput | null>>([]);

  const handleOtpChange = (text: string, index: number) => {
    const cleanedText = text.replace(/[^0-9]/g, '').slice(-1);
    const newOtp = [...otp];
    newOtp[index] = cleanedText;
    setOtp(newOtp);

    // Auto-focus next input field
    if (cleanedText && index < 5) {
      inputsRef.current[index + 1]?.focus();
      setFocusedIndex(index + 1);
    }
  };

  const handleKeyPress = (e: NativeSyntheticEvent<TextInputKeyPressEventData>, index: number) => {
    if (e.nativeEvent.key === 'Backspace') {
      if (!otp[index] && index > 0) {
        const newOtp = [...otp];
        newOtp[index - 1] = '';
        setOtp(newOtp);
        inputsRef.current[index - 1]?.focus();
        setFocusedIndex(index - 1);
      }
    }
  };

  // Helper logic to dynamically mask values
  const getMaskedValue = () => {
    if (!targetValue) return '•••';
    switch (type) {
      case 'MOBILE':
        return targetValue.length >= 4
          ? `Phone Number ••••••${targetValue.slice(-4)}`
          : `Phone Number ${targetValue}`;
      case 'PAN':
        return `PAN Card ••••${targetValue.slice(-4).toUpperCase()}`;
      case 'IFSC':
        return `IFSC Account Route ${targetValue.toUpperCase()}`;
      default:
        return targetValue;
    }
  };

  const config = {
    MOBILE: { title: 'Verify your code', changeBtnText: 'Change Mobile Number' },
    PAN: { title: 'Verify your identity', changeBtnText: 'Change PAN Number' },
    IFSC: { title: 'Verify Bank Routes', changeBtnText: 'Change IFSC Code' }
  }[type];

  return (
    <Modal visible={isVisible} transparent animationType="slide" onRequestClose={onClose}>
      <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
        <View style={styles.overlay}>
          <View style={styles.modalContent}>

            {/* Top Minimalist Sheet Indicator Drag Bar */}
            <View style={styles.dragIndicator} />

            <View style={styles.bodyContent}>

              {/* Circular Icon Wrapper */}
              <View style={styles.iconContainer}>
                <View style={styles.shieldWrapper}>
                  <MaterialCommunityIcons name="shield-check" size={38} color="#2563EB" />
                </View>
              </View>

              {/* Title Header Typography */}
              <Text style={styles.headerTitle}>{config.title}</Text>

              {/* Contextual Paragraph Description */}
              <Text style={styles.subText}>
                We have sent a code to your{' '}
                <Text style={styles.boldTargetText}>{getMaskedValue()}</Text>
              </Text>

              {/* 6-Digit Code Row Layout */}
              <View style={styles.otpRow}>
                {otp.map((digit, idx) => (
                  <TextInput
                    key={idx}
                    ref={(el) => (inputsRef.current[idx] = el)}
                    style={[
                      styles.otpInput,
                      digit !== '' && styles.otpInputActive,
                      focusedIndex === idx && styles.otpInputFocused
                    ]}
                    keyboardType="number-pad"
                    maxLength={1}
                    value={digit}
                    onChangeText={(text) => handleOtpChange(text, idx)}
                    onKeyPress={(e) => handleKeyPress(e, idx)}
                    onFocus={() => setFocusedIndex(idx)}
                    textAlign="center"
                    selectTextOnFocus
                  />
                ))}
              </View>

              {/* Primary Form Execution Button */}
              <TouchableOpacity
                style={styles.verifyBtn}
                activeOpacity={0.8}
                onPress={() => onVerify(otp.join(''))}
              >
                <Text style={styles.verifyBtnText}>Done</Text>
              </TouchableOpacity>

              {/* Resend Link Interaction Line */}
              <Text style={styles.resendText}>
                Didn't receive code? <Text style={styles.resendLink}>Resend</Text>
              </Text>

              {/* Auxiliary Cancellation Trigger Layout */}
              <TouchableOpacity style={styles.changeBtn} onPress={onClose}>
                <Text style={styles.changeBtnText}>{config.changeBtnText}</Text>
              </TouchableOpacity>

            </View>
          </View>
        </View>
      </TouchableWithoutFeedback>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.4)',
    justifyContent: 'flex-end'
  },
  modalContent: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingBottom: 34,
    paddingHorizontal: 24
  },
  dragIndicator: {
    width: 42,
    height: 5,
    backgroundColor: '#E5E7EB',
    borderRadius: 3,
    alignSelf: 'center',
    marginTop: 12,
    marginBottom: 10,
  },
  bodyContent: {
    alignItems: 'center',
    paddingTop: 10
  },
  iconContainer: {
    marginBottom: 20
  },
  shieldWrapper: {
    width: 74,
    height: 74,
    borderRadius: 37,
    backgroundColor: '#EBF3FF',
    justifyContent: 'center',
    alignItems: 'center'
  },
  headerTitle: {
    color: '#111827',
    fontSize: 20,
    fontWeight: '700',
    fontFamily: Poppins.bold,
    marginBottom: 10
  },
  subText: {
    color: '#4B5563',
    textAlign: 'center',
    fontSize: 16,
    lineHeight: 22,
    paddingHorizontal: 16,
    fontFamily: Poppins.regular,
    marginBottom: 28
  },
  boldTargetText: {
    fontWeight: '600',
    color: '#1F2937',
    fontFamily: Poppins.semiBold
  },
  otpRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
    marginBottom: 32,
    paddingHorizontal: 4
  },
  otpInput: {
    width: 46,
    height: 46,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 12,
    fontSize: 20,
    fontWeight: '600',
    textAlign: 'center',
    color: '#1F2937',
    backgroundColor: '#FFFFFF',
    fontFamily: Poppins.semiBold,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.03,
    shadowRadius: 2,
    elevation: 1,
    // Explicit fixes for perfect centering on both iOS and Android
    padding: 0,
    includeFontPadding: false,
    textAlignVertical: 'center'
  },
  otpInputActive: {
    borderColor: '#9CA3AF',
  },
  otpInputFocused: {
    borderColor: '#2563EB',
    borderWidth: 2,
    backgroundColor: '#FFFFFF'
  },
  verifyBtn: {
    backgroundColor: '#1E1B4B',
    width: '100%',
    paddingVertical: 16,
    borderRadius: 14,
    alignItems: 'center',
    marginBottom: 18,
    shadowColor: '#1E1B4B',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.15,
    shadowRadius: 6,
    elevation: 3
  },
  verifyBtnText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
    fontFamily: Poppins.bold
  },
  resendText: {
    color: '#6B7280',
    fontSize: 16,
    marginBottom: 24,
    fontFamily: Poppins.regular
  },
  resendLink: {
    color: '#2563EB',
    fontWeight: '600',
    fontFamily: Poppins.semiBold
  },
  changeBtn: {
    width: '100%',
    paddingVertical: 12,
    alignItems: 'center'
  },
  changeBtnText: {
    color: '#9CA3AF',
    fontSize: 16,
    fontWeight: '500',
    fontFamily: Poppins.medium,
  }
});