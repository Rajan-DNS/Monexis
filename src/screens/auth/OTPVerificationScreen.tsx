import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  StatusBar,
  KeyboardAvoidingView,
  Platform,
  TextInput,
  Keyboard,
} from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import Colors from '../../theme/colors';
import { Spacing } from '../../theme/spacing';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import { useAuthService } from '../../redux/services/Auth/AuthService';
import StatusModal from '../../components/Modals/StatusModal';
import CustomLoader from '../../components/CustomLoader';
import LoginIllustration from '../../Assets/img/auth/LoginIllustration.svg';
import DNSButton from '../../components/DNSButton';
import { NotoSerif, Poppins } from '../../theme/typography';

type RootStackParamList = {
  Login: undefined;
  OTPVerification: { phone: string };
  ResetPassword: { phone: string, otp: string };
  MainTabs: undefined;
};

type Props = NativeStackScreenProps<RootStackParamList, 'OTPVerification'>;

const OTPVerificationScreen: React.FC<Props> = ({ navigation, route }) => {
  const { signIn, isLoading, statusModal, closeStatusModal } = useAuthService();
  const { phone } = route.params || {};
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [timer, setTimer] = useState(30);
  const inputs = useRef<TextInput[] | any>([]);


  useEffect(() => {
    const interval = setInterval(() => {
      setTimer((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  const handleChange = (text: string, index: number) => {
    const numericText = text.replace(/[^0-9]/g, '');

    if (text === '') {
      const newOtp = [...otp];
      newOtp[index] = '';
      setOtp(newOtp);

      if (index > 0) {
        inputs.current[index - 1].focus();
      }
      return;
    }

    // If it's a digit
    if (numericText) {
      const newOtp = [...otp];
      newOtp[index] = numericText.charAt(numericText.length - 1);
      setOtp(newOtp);

      // Move focus forward
      if (index < 5) {
        inputs.current[index + 1].focus();
      }
    }
  };

  const handleKeyPress = (e: any, index: number) => {
    // On some Android keyboards, backspace on an empty field doesn't trigger onChangeText
    // but triggers onKeyPress. This ensures we still move back.
    if (e.nativeEvent.key === 'Backspace' && !otp[index] && index > 0) {
      inputs.current[index - 1].focus();
    }
  };

  const handleVerify = async () => {
    Keyboard.dismiss();
    const otpString = otp.join('');
    if (otpString.length < 6) return;

    const result = await signIn(phone, '', true, otpString);
    if (result.success) {
      navigation.reset({
        index: 0,
        routes: [{ name: 'MainTabs' }],
      });
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: Colors.bg }]}>
      <View style={styles.headerRow}>
        <TouchableOpacity onPress={() => {
          Keyboard.dismiss();
          setOtp(['', '', '', '', '', '']);
          navigation.goBack();
        }}>
          <MaterialIcons name="arrow-back" size={24} color={Colors.textDark} />
        </TouchableOpacity>

        <View style={{ width: 24 }} />
      </View>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <View style={styles.content}>
          <View style={styles.headerContainer}>
            <Text style={[styles.title, { color: Colors.authtext }]}>Verify OTP</Text>
            <Text style={styles.helperText}>
              Enter the 6-digit code sent to +91 {phone}
            </Text>
          </View>

          <View style={styles.imageWrapper}>
            <LoginIllustration width="100%" height="100%" />
          </View>

          {/* OTP Input Fields */}
          <View style={styles.otpContainer}>
            {otp.map((digit, index) => (
              <TextInput
                key={index}
                ref={(ref) => {
                  inputs.current[index] = ref as TextInput;
                }}
                style={styles.otpInput}
                keyboardType="number-pad"
                maxLength={1}
                value={digit}
                onChangeText={(text) => handleChange(text, index)}
                onKeyPress={(e) => handleKeyPress(e, index)}
              />
            ))}
          </View>

          {/* Resend Timer */}
          <View style={styles.timerContainer}>
            {timer > 0 ? (
              <Text style={styles.timerText}>Resend code in {timer}s</Text>
            ) : (
              <TouchableOpacity>
                <Text style={styles.resendText}>Resend Code</Text>
              </TouchableOpacity>
            )}
          </View>

          {/* Verify Button */}
          <View style={styles.buttonContainer}>
            <DNSButton
              title="Verify & Proceed"
              onPress={handleVerify}
              loading={isLoading}
              disabled={otp.join('').length < 6}
            />
          </View>
        </View>
      </KeyboardAvoidingView >

      <StatusModal
        isVisible={statusModal.isVisible}
        type={statusModal.type}
        title={statusModal.title}
        message={statusModal.message}
        onClose={closeStatusModal}
      />

      <CustomLoader visible={isLoading} message="Verifying OTP..." />
    </View >
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    flex: 1,
    paddingHorizontal: Spacing.xl,
    paddingTop: Spacing.md,
    paddingBottom: Platform.OS === 'ios' ? Spacing.xl : Spacing.xxl,
  },
  headerRow: {
    minHeight: 48,
    paddingHorizontal: Spacing.xl,
    paddingTop: Platform.OS === 'android' ? Spacing.sm : 0,
    justifyContent: 'center',
  },
  headerContainer: {
    alignItems: 'center',
    marginBottom: Spacing.lg,
  },
  title: {
    fontSize: 20,
    // fontFamily: NotoSerif.regular,
    textAlign: 'center',
    letterSpacing: -0.5,
  },
  helperText: {
    fontSize: 16,
    // fontFamily: Poppins.regular,
    textAlign: 'center',
    color: Colors.textSecondary,
    marginTop: Spacing.sm,
    paddingHorizontal: Spacing.md,
    lineHeight: 22,
  },
  imageWrapper: {
    width: '100%',
    height: 200,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Spacing.xl,
  },
  otpContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 8,
    width: '100%',
    marginBottom: Spacing.lg,
  },
  otpInput: {
    flex: 1,
    maxWidth: 50,
    height: 55,
    backgroundColor: Colors.bgInput,
    borderRadius: 14,
    borderWidth: 1.5,
    borderColor: Colors.divider,
    fontSize: 20,
    // fontFamily: Poppins.bold,
    fontWeight: 'bold',
    textAlign: 'center',
    color: Colors.primary,
  },
  timerContainer: {
    alignItems: 'center',
    marginBottom: Spacing.lg,
  },
  timerText: {
    fontSize: 16,
    // fontFamily: Poppins.regular,
    color: Colors.textSecondary,
  },
  resendText: {
    fontSize: 16,
    // fontFamily: Poppins.bold,
    color: Colors.primary,
    fontWeight: 'bold',
  },
  buttonContainer: {
    width: '100%',
    marginTop: 'auto',
  },
});

export default OTPVerificationScreen;
