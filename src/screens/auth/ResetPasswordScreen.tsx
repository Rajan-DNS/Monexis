import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  StatusBar,
  KeyboardAvoidingView,
  Platform,
  TextInput,
  TouchableOpacity,
} from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import Colors from '../../theme/colors';
import { Spacing } from '../../theme/spacing';
import { useForm, Controller } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import DNSButton from '../../components/DNSButton';
import LoginIllustration from '../../Assets/img/auth/LoginIllustration.svg';
import { useAuthService } from '../../redux/services/Auth/AuthService';
import StatusModal from '../../components/Modals/StatusModal';
import { NotoSerif, Poppins } from '../../theme/typography';
import AuthTextInput from '../../components/AuthTextInput';

const resetPasswordSchema = yup.object().shape({
  password: yup
    .string()
    .required('Password is required')
    .min(6, 'Password must be at least 6 characters'),
  confirmPassword: yup
    .string()
    .required('Confirm password is required')
    .oneOf([yup.ref('password')], 'Passwords must match'),
});

type RootStackParamList = {
  Login: undefined;
  ResetPassword: { phone?: string; mobileNumber?: string; otp?: string };
};

type Props = NativeStackScreenProps<RootStackParamList, 'ResetPassword'>;

const ResetPasswordScreen: React.FC<Props> = ({ navigation, route }) => {
  const phone = route.params?.phone || route.params?.mobileNumber || 'XXXXXXXXXX';


  const { sendOTP, resetPassword, isLoading, statusModal, closeStatusModal } = useAuthService();
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [timer, setTimer] = useState(30);
  const otpInputs = useRef<Array<TextInput | null>>([]);


  useEffect(() => {
    const interval = setInterval(() => {
      setTimer((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  const handleOtpChange = (text: string, index: number) => {
    // Only allow numbers
    const numericText = text.replace(/[^0-9]/g, '');

    // Handle backspace/deletion
    if (text === '') {
      const newOtp = [...otp];
      newOtp[index] = '';
      setOtp(newOtp);

      // Move focus back on delete
      if (index > 0) {
        otpInputs.current[index - 1]?.focus();
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
        otpInputs.current[index + 1]?.focus();
      }
    }
  };

  const handleOtpKeyPress = (e: any, index: number) => {
    // On some Android keyboards, backspace on an empty field doesn't trigger onChangeText
    // but triggers onKeyPress. This ensures we still move back.
    if (e.nativeEvent.key === 'Backspace' && !otp[index] && index > 0) {
      otpInputs.current[index - 1]?.focus();
    }
  };

  const handleResendOTP = async () => {
    const result = await sendOTP(phone);
    if (result.success) {
      setTimer(30);
    }
  };

  const {
    control,
    handleSubmit,
    formState: { errors, isValid },
  } = useForm({
    resolver: yupResolver(resetPasswordSchema),
    defaultValues: {
      password: '',
      confirmPassword: '',
    },
    mode: 'onChange',
  });

  const handleReset = async (data: any) => {
    const otpString = otp.join('');
    if (otpString.length < 6) {
      // Validation error is usually handled by simple state or modal, 
      // but here we can just return or use the service to show a modal.
      return;
    }

    const result = await resetPassword({
      mobileNumber: phone,
      otp: otpString,
      passWord: data.password,
    });

    if (result.success) {
      navigation.navigate('Login');
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: Colors.bg }]}>
      <StatusBar barStyle="dark-content" backgroundColor={Colors.bg} />

      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <View style={styles.content}>
          <View style={styles.headerContainer}>
            <Text style={[styles.title, { color: Colors.authtext }]}>New Password</Text>
            <Text style={styles.helperText}>
              Verify your code and create a secure password.
            </Text>
          </View>

          {/* Illustration */}
          <View style={styles.imageWrapper}>
            <LoginIllustration width="100%" height="100%" />
          </View>

          {/* OTP Verification Section */}
          <View style={styles.otpSection}>
            <Text style={styles.otpLabel}>Enter OTP sent to +91 {phone}</Text>
            <View style={styles.otpContainer}>
              {otp.map((digit, index) => (
                <TextInput
                  key={index}
                  ref={(ref) => {
                    otpInputs.current[index] = ref;
                  }}
                  style={styles.otpInput}
                  keyboardType="number-pad"
                  maxLength={1}
                  value={digit}
                  onChangeText={(text) => handleOtpChange(text, index)}
                  onKeyPress={(e) => handleOtpKeyPress(e, index)}
                  editable={!isLoading}
                />
              ))}
            </View>

           
          </View>
 <View style={styles.timerContainer}>
              {timer > 0 ? (
                <Text style={styles.timerText}>Resend code in {timer}s</Text>
              ) : (
                <TouchableOpacity onPress={handleResendOTP}>
                  <Text style={styles.resendText}>Resend Code</Text>
                </TouchableOpacity>
              )}
            </View>
          <View style={styles.form}>
            {/* New Password */}

            {/* New Password */}
            <Controller
              control={control}
              name="password"
              render={({ field: { onChange, onBlur, value } }) => (
                <AuthTextInput
                  placeholder="New Password"
                  isPassword
                  onBlur={onBlur}
                  onChangeText={onChange}
                  value={value}
                  error={errors.password?.message}
                  editable={!isLoading}
                />
              )}
            />

            {/* Confirm Password */}
            <Controller
              control={control}
              name="confirmPassword"
              render={({ field: { onChange, onBlur, value } }) => (
                <AuthTextInput
                  placeholder="Confirm New Password"
                  isPassword
                  onBlur={onBlur}
                  onChangeText={onChange}
                  value={value}
                  error={errors.confirmPassword?.message}
                  editable={!isLoading}
                />
              )}
            />

            <DNSButton
              title="Reset Password"
              onPress={handleSubmit(handleReset)}
              loading={isLoading}
              disabled={!isValid}
              style={styles.mainButton}
            />
          </View>
        </View>
      </KeyboardAvoidingView>

      <StatusModal
        isVisible={statusModal.isVisible}
        type={statusModal.type}
        title={statusModal.title}
        message={statusModal.message}
        onClose={closeStatusModal}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    flex: 1,
       justifyContent:'center',

    paddingHorizontal: Spacing.xl,
    paddingTop: Spacing.lg,
    paddingBottom: Platform.OS === 'ios' ? Spacing.xl : Spacing.xxl,
    
    
  },
  headerContainer: {
    alignItems: 'center',
    marginBottom: Spacing.md,
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
    height: 180,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Spacing.lg,
  },
  form: {
    width: '100%',
    // marginTop: 'auto',
  },
  errorContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(231, 76, 94, 0.1)',
    padding: 12,
    borderRadius: 8,
    marginBottom: 20,
    width: '100%',
    borderWidth: 1,
    borderColor: 'rgba(231, 76, 94, 0.2)',
  },
  errorText: {
    color: '#E74C5E',
    fontSize: 16,
    // fontFamily: Poppins.medium,
    fontWeight: '500',
    marginLeft: 8,
  },
  otpSection: {
    width: '100%',
    alignItems: 'center',
    // marginBottom: Spacing.,
  },
  otpLabel: {
    fontSize: 12,
    // fontFamily: Poppins.medium,
    color: Colors.textBody,
    marginBottom: Spacing.md,
    fontWeight: '500',
  },
  otpContainer: {
    flexDirection: 'row',
    justifyContent:'space-between',
    gap: 8,
    marginBottom: Spacing.md,
    width: '100%',
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
    
    marginBottom: Spacing.sm,
   alignItems:'flex-end',
   justifyContent:'flex-end'
  },
  timerText: {
    fontSize: 12,
    // fontFamily: Poppins.regular,
    color: Colors.textSecondary,
  },
  resendText: {
    fontSize: 12,
    // fontFamily: Poppins.bold,
    color: Colors.primary,
    fontWeight: 'bold',
  },
  mainButton: {
    borderRadius: 14,
    height: 56,
    justifyContent: 'center',
    marginTop: Spacing.md,
  },
});

export default ResetPasswordScreen;
