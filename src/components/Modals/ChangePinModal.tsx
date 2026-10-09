import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  TextInput,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
  NativeSyntheticEvent,
  TextInputKeyPressEventData,
} from 'react-native';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import Colors from '../../theme/colors';
import { useChangePinMutation, useSendOTPMutation } from '../../redux/services/Auth/AuthApi';
import { useAppSelector } from '../../redux/hooks';
import { selectCurrentUser } from '../../redux/slices/authSlice';
import StatusModal from './StatusModal';
import { Poppins } from '../../theme/typography';

// --- SplitOtpInput Component ---
interface SplitOtpInputProps {
  value: string;
  onChange: (text: string) => void;
  length?: number;
  secureTextEntry?: boolean;
}

const SplitOtpInput: React.FC<SplitOtpInputProps> = ({ value, onChange, length = 6, secureTextEntry = false }) => {
  const inputsRef = useRef<Array<TextInput | null>>([]);
  const [focusedIndex, setFocusedIndex] = useState<number>(0);

  const otpArray = Array.from({ length }, (_, index) => value[index] || '');

  useEffect(() => {
    if (inputsRef.current[0]) {
      inputsRef.current[0].focus();
    }
  }, []);

  const handleTextChange = (text: string, index: number) => {
    const cleanedText = text.replace(/[^0-9]/g, '').slice(-1);
    const updatedOtpArray = [...otpArray];
    updatedOtpArray[index] = cleanedText;

    onChange(updatedOtpArray.join(''));

    if (cleanedText && index < length - 1) {
      inputsRef.current[index + 1]?.focus();
    }
  };

  const handleKeyPress = (
    e: NativeSyntheticEvent<TextInputKeyPressEventData>,
    index: number
  ) => {
    if (e.nativeEvent.key !== 'Backspace') return;

    const updatedOtpArray = [...otpArray];

    if (!otpArray[index] && index > 0) {
      updatedOtpArray[index - 1] = '';
      onChange(updatedOtpArray.join(''));
      inputsRef.current[index - 1]?.focus();
    } else {
      updatedOtpArray[index] = '';
      onChange(updatedOtpArray.join(''));
    }
  };

  return (
    <View style={{ width: '100%' }}>
      <View style={otpStyles.otpContainer}>
        {Array.from({ length }).map((_, index) => (
          <TextInput
            key={index}
            ref={(ref) => (inputsRef.current[index] = ref)}
            style={[
              otpStyles.otpBox,
              otpArray[index] !== '' && otpStyles.otpBoxActive,
              focusedIndex === index && otpStyles.otpBoxFocused
            ]}
            keyboardType="number-pad"
            maxLength={1}
            value={otpArray[index]}
            onChangeText={(text) => handleTextChange(text, index)}
            onKeyPress={(e) => handleKeyPress(e, index)}
            onFocus={() => setFocusedIndex(index)}
            secureTextEntry={secureTextEntry}
            textAlign="center"
            selectTextOnFocus
          />
        ))}
      </View>
    </View>
  );
};

const otpStyles = StyleSheet.create({
  otpContainer: { flexDirection: 'row', width: '100%' },
  otpBox: { width: 46, height: 54, borderWidth: 1.5, borderColor: '#D1D5DB', borderRadius: 10, fontSize: 20, color: '#111827', fontWeight: '600', backgroundColor: '#F9FAFB', marginHorizontal: 5 },
  otpBoxActive: { borderColor: '#9CA3AF' },
  otpBoxFocused: { borderColor: Colors.primary, backgroundColor: '#FFFFFF', shadowColor: Colors.primary, shadowOffset: { width: 0, height: 0 }, shadowOpacity: 0.1, shadowRadius: 4, elevation: 1 },
});

// --- ChangePinModal ---
interface ChangePinModalProps {
  isVisible: boolean;
  onClose: () => void;
}

const ChangePinModal: React.FC<ChangePinModalProps> = ({ isVisible, onClose }) => {
  const [otp, setOtp] = useState('');
  const [newPin, setNewPin] = useState('');
  const [timer, setTimer] = useState(0);
  const isInitialMount = useRef(true);

  const user = useAppSelector(selectCurrentUser);
  const [changePin, { isLoading }] = useChangePinMutation();
  const [sendOTP, { isLoading: isSendingOTP }] = useSendOTPMutation();
  console.log(newPin)
  const [statusModal, setStatusModal] = useState<{ isVisible: boolean; type: 'success' | 'error'; title: string; message: string }>({
    isVisible: false,
    type: 'success',
    title: '',
    message: '',
  });

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (timer > 0) {
      interval = setInterval(() => {
        setTimer((prev) => prev - 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [timer]);

  const handleSendOTP = async (isManual = false) => {
    const mobileNumber = user?.mobileNumber || user?.phone;
    if (!mobileNumber) {
      setStatusModal({ isVisible: true, type: 'error', title: 'Error', message: 'Mobile number not found in profile.' });
      return;
    }

    try {
      await sendOTP({ MobileNumber: mobileNumber }).unwrap();
      setTimer(60); // 60 seconds cooldown
      if (isManual) {
        setStatusModal({ isVisible: true, type: 'success', title: 'Success', message: 'OTP sent successfully!' });
      }
    } catch (error: any) {
      setStatusModal({ isVisible: true, type: 'error', title: 'Error', message: error?.data?.message || 'Failed to send OTP.' });
    }
  };

  // Reset state when modal opens and auto trigger OTP
  useEffect(() => {
    if (isVisible) {
      setOtp('');
      setNewPin('');
      setTimer(0);
      handleSendOTP(false);
    }
  }, [isVisible]);

  const handleSubmit = async () => {
    if (!otp || !newPin) {
      setStatusModal({ isVisible: true, type: 'error', title: 'Error', message: 'Please fill in all fields.' });
      return;
    }
    if (otp.length !== 6) {
      setStatusModal({ isVisible: true, type: 'error', title: 'Error', message: 'OTP must be 6 digits.' });
      return;
    }
    if (newPin.length !== 6) {
      setStatusModal({ isVisible: true, type: 'error', title: 'Error', message: 'PIN must be 6 digits.' });
      return;
    }

    try {
      const payload = {
        pin: parseInt(newPin, 10),
        otp: otp,
      };
      await changePin(payload).unwrap();

      setStatusModal({
        isVisible: true,
        type: 'success',
        title: 'Success',
        message: 'PIN changed successfully!',
      });
      setOtp('');
      setNewPin('');
    } catch (error: any) {
      setStatusModal({
        isVisible: true,
        type: 'error',
        title: 'Error',
        message: error?.data?.message || 'Failed to change PIN. Please try again.',
      });
    }
  };

  const handleCloseStatusModal = () => {
    const wasSuccess = statusModal.type === 'success' && statusModal.message === 'PIN changed successfully!';
    setStatusModal(prev => ({ ...prev, isVisible: false }));
    if (wasSuccess) {
      onClose();
    }
  };

  return (
    <>
      <Modal
        animationType="slide"
        transparent={true}
        visible={isVisible}
        onRequestClose={onClose}
      >
        <View style={styles.modalOverlay}>
          <KeyboardAvoidingView
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            style={styles.modalContent}
          >
            <View style={styles.header}>
              <Text style={styles.title}>Create PIN</Text>
              <TouchableOpacity onPress={onClose} style={styles.closeButton}>
                <MaterialIcons name="close" size={24} color="#333" />
              </TouchableOpacity>
            </View>

            <View style={styles.body}>
              <View style={styles.labelRow}>
                <Text style={styles.label}>OTP (6 digits)</Text>
                <TouchableOpacity
                  onPress={() => handleSendOTP(true)}
                  disabled={timer > 0 || isSendingOTP}
                >
                  {isSendingOTP ? (
                    <ActivityIndicator size="small" color={Colors.primary} />
                  ) : (
                    <Text style={[styles.resendText, timer > 0 && { color: '#9CA3AF' }]}>
                      {timer > 0 ? `Resend in ${timer}s` : 'Resend OTP'}
                    </Text>
                  )}
                </TouchableOpacity>
              </View>

              <View style={styles.inputContainer}>
                <SplitOtpInput value={otp} onChange={setOtp} length={6} />
              </View>

              <Text style={[styles.label, { marginTop: 16, marginBottom: 8 }]}>New PIN (6 digits)</Text>
              <View style={styles.inputContainer}>
                <SplitOtpInput value={newPin} onChange={setNewPin} length={6} secureTextEntry />
              </View>

              <TouchableOpacity
                style={[styles.submitButton, isLoading && { opacity: 0.7 }]}
                onPress={handleSubmit}
                disabled={isLoading}
              >
                {isLoading ? (
                  <ActivityIndicator color="#FFFFFF" />
                ) : (
                  <Text style={styles.submitButtonText}>Update PIN</Text>
                )}
              </TouchableOpacity>
            </View>
          </KeyboardAvoidingView>
        </View>
      </Modal>
      <StatusModal
        isVisible={statusModal.isVisible}
        type={statusModal.type}
        title={statusModal.title}
        message={statusModal.message}
        onClose={handleCloseStatusModal}
      />
    </>
  );
};

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
    paddingHorizontal: 24,
    paddingBottom: 40,
    paddingTop: 20,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  title: {
    fontSize: 20,
    fontFamily: Poppins.bold,
    fontWeight: 'bold',
    color: '#1A1D2E',
  },
  closeButton: {
    padding: 4,
  },
  body: {
    width: '100%',
  },
  labelRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 16,
    marginBottom: 8,
  },
  label: {
    fontSize: 16,
    fontFamily: Poppins.semiBold,
    fontWeight: '600',
    color: '#64748B',
  },
  resendText: {
    fontSize: 12,
    fontFamily: Poppins.semiBold,
    color: Colors.primary,
  },
  inputContainer: {
    marginBottom: 10,
    alignItems: 'center',
  },
  submitButton: {
    backgroundColor: Colors.primary,
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
    marginTop: 32,
  },
  submitButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontFamily: Poppins.bold,
    fontWeight: 'bold',
  },
});

export default ChangePinModal;
