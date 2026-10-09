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
import { NotoSerif, Poppins } from '../../theme/typography';
import ForgotPasswordIllustration from '../../Assets/img/auth/ForgotPassword.svg';
import { useForm, Controller } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import DNSButton from '../../components/DNSButton';
import { useAuthService } from '../../redux/services/Auth/AuthService';
import StatusModal from '../../components/Modals/StatusModal';
import AuthTextInput from '../../components/AuthTextInput';

const forgotPasswordSchema = yup.object().shape({
  phone: yup
    .string()
    .required('Phone number is required')
    .matches(/^[0-9]{10}$/, 'Phone number must be exactly 10 digits'),
});

type RootStackParamList = {
  Login: undefined;
  ForgotPassword: undefined;
};

type ForgotPasswordScreenProps = NativeStackScreenProps<RootStackParamList, 'ForgotPassword'>;

const ForgotPasswordScreen: React.FC<ForgotPasswordScreenProps> = ({ navigation }) => {
  const { sendOTP, isLoading, statusModal, closeStatusModal } = useAuthService();

  const {
    control,
    handleSubmit,
    formState: { errors, isValid },
  } = useForm({
    resolver: yupResolver(forgotPasswordSchema),
    defaultValues: {
      phone: '',
    },
    mode: 'onChange',
  });

  const handleReset = async (data: any) => {
    const result = await sendOTP(data.phone);
    if (result.success) {
      navigation.navigate('ResetPassword' as any, { phone: data.phone });
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
            <Text style={[styles.title, { color: Colors.authtext }]}>Forgot Password</Text>
            <Text style={styles.welcomeText}>
              Enter your mobile number and we will send a verification code.
            </Text>
          </View>

          <View style={styles.imageWrapper}>
            <ForgotPasswordIllustration width="100%" height="100%" />
          </View>

          {/* Form Fields */}
          <View style={styles.form}>
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
              title="Send OTP"
              onPress={handleSubmit(handleReset)}
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
              title="Back to Login"
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
    paddingTop: Spacing.lg,
    paddingBottom: Platform.OS === 'ios' ? Spacing.xl : Spacing.xxl,
    justifyContent:'center'
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
  welcomeText: {
    fontSize: 16,
    // fontFamily: Poppins.regular,
    textAlign: 'center',
    color: Colors.textSecondary,
    marginTop: Spacing.xs,
    paddingHorizontal: Spacing.md,
    lineHeight: 22,
  },
  imageWrapper: {
    width: '100%',
    height: 300,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Spacing.xxl,
  },
  form: {
    width: '100%',
    // marginTop: 'auto',
  },
  mainButton: {
    borderRadius: 14,
    height: 56,
    justifyContent: 'center',
    marginTop: Spacing.md,
  },
  secondaryButton: {
    borderRadius: 14,
    height: 56,
    justifyContent: 'center',
  },
  dividerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: Spacing.lg,
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

export default ForgotPasswordScreen;
