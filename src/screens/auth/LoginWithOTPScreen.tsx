import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  StatusBar,
  KeyboardAvoidingView,
  Platform,
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

const otpLoginSchema = yup.object().shape({
  phone: yup
    .string()
    .required('Phone number is required')
    .matches(/^[0-9]+$/, 'Must be a valid number')
    .min(10, 'Phone number must be at least 10 digits'),
});

type RootStackParamList = {
  Login: undefined;
  LoginWithOTP: undefined;
  ForgotPassword: undefined;
};

type Props = NativeStackScreenProps<RootStackParamList, 'LoginWithOTP'>;

const LoginWithOTPScreen: React.FC<Props> = ({ navigation }) => {
  const { sendOTP, isLoading, statusModal, closeStatusModal } = useAuthService();

  const {
    control,
    handleSubmit,
    formState: { errors, isValid },
  } = useForm({
    resolver: yupResolver(otpLoginSchema),
    defaultValues: {
      phone: '',
    },
    mode: 'onChange',
  });

  const handleSendOTP = async (data: any) => {
    const result = await sendOTP(data.phone);
    if (result.success) {
      navigation.navigate('OTPVerification' as any, { phone: data.phone });
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: Colors.bg }]}>

      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <View style={styles.content}>
          <View style={styles.headerContainer}>
            <Text style={[styles.title, { color: Colors.authtext }]}>Login with OTP</Text>
            <Text style={styles.welcomeText}>
              Use your mobile number to receive a one-time login code.
            </Text>
          </View>

          <View style={styles.imageWrapper}>
            <LoginIllustration width="100%" height="100%" />
          </View>

          {/* Form Fields */}
          <View style={styles.form}>
            {/* Phone Input */}

            {/* Phone Input */}
            <Controller
              control={control}
              name="phone"
              render={({ field: { onChange, onBlur, value } }) => (
                <AuthTextInput
                  placeholder="Mobile Number"
                  keyboardType="number-pad"
                  onBlur={onBlur}
                  onChangeText={(text) => {
                    const filtered = text.replace(/[^0-9]/g, '');
                    onChange(filtered);
                  }}
                  value={value}
                  error={errors.phone?.message}
                  editable={!isLoading}
                  maxLength={10}
                />
              )}
            />

            <DNSButton
              title="Get OTP"
              onPress={handleSubmit(handleSendOTP)}
              loading={isLoading}
              disabled={!isValid}
              style={styles.mainButton}
            />

            <View style={styles.dividerContainer}>
              <View style={[styles.line, { backgroundColor: Colors.divider }]} />
              <Text style={[styles.dividerText, { color: Colors.textSecondary }]}>or</Text>
              <View style={[styles.line, { backgroundColor: Colors.divider }]} />
            </View>

            <DNSButton
              title="Login with Password"
              onPress={() => navigation.goBack()}
              variant="secondary"
              disabled={isLoading}
              style={styles.secondaryButton}
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
    paddingHorizontal: Spacing.xl,
    justifyContent: 'center',
    paddingTop: 10,

  },
  headerContainer: {
    alignItems: 'center',
    marginTop: 10,
  },
  title: {
    fontSize: 20,
    // fontFamily: NotoSerif.regular,
    textAlign: 'center',
  },
  imageWrapper: {
    width: '100%',
    height: '30%',
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: 10,
  },
  welcomeText: {
    fontSize: 16,
    // fontFamily: Poppins.regular,
    textAlign: 'center',
    color: '#64748B',
    marginTop: 6,
    paddingHorizontal: 15,
    lineHeight: 22,
  },
  form: {
    width: '100%',
    // justifyContent: 'flex-end',
    // marginBottom: Platform.OS === 'ios' ? 20 : 30,
  },
  mainButton: {
    borderRadius: 14,
    height: 56,
    justifyContent: 'center',
  },
  secondaryButton: {
    borderRadius: 14,
    height: 56,
    justifyContent: 'center',
  },
  dividerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 18,
  },
  line: {
    flex: 1,
    height: 1,
  },
  dividerText: {
    marginHorizontal: 15,
    fontSize: 12,
    // fontFamily: Poppins.semiBold,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
});

export default LoginWithOTPScreen;
