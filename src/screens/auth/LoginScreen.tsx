import React, { useEffect, useRef, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  StatusBar,
  KeyboardAvoidingView,
  Platform,
  Animated,
  Easing,
  TextInput,
} from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import Colors from '../../theme/colors';
import { Spacing } from '../../theme/spacing';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import { useAuthService } from '../../redux/services/Auth/AuthService';
import LoginIllustration from '../../Assets/img/auth/LoginIllustration.svg';
import { useForm, Controller } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import typography, { NotoSerif, Poppins } from '../../theme/typography';
import DNSButton from '../../components/DNSButton';
import { SafeAreaView } from 'react-native-safe-area-context';
import CustomLoader from '../../components/CustomLoader';
import StatusModal from '../../components/Modals/StatusModal';
import { useCheckSignUpShowOnAppQuery } from '../../redux/services/Auth/AuthApi';

const AnimatedLoginIllustration = Animated.createAnimatedComponent(LoginIllustration);
interface Props {
  showSignUp: boolean
}

const loginSchema = yup.object().shape({
  phone: yup
    .string()
    .required('Phone number is required')
    .matches(/^[0-9]{10}$/, 'Invalid UserName. It must be exactly 10 digits.'),
  password: yup
    .string()
    .required('Password is required')
    .min(2, 'Password must be at least 2 characters'),
});

type RootStackParamList = {
  Login: undefined;
  Register: { showSignUp?: boolean };
  ForgotPassword: undefined;
  LoginWithOTP: undefined;
  MainTabs: undefined;
};

type LoginScreenProps = NativeStackScreenProps<RootStackParamList, 'Login'>;

// Custom Focus-Border Input Component for Unique UI Look
const UniqueTextInput = ({ placeholder, error, isPassword, ...props }: any) => {
  const [isFocused, setIsFocused] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const focusAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(focusAnim, {
      toValue: isFocused ? 1 : 0,
      duration: 200,
      useNativeDriver: false,
    }).start();
  }, [isFocused]);

  const borderColor = focusAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [error ? '#EF4444' : '#E2E8F0', Colors.primary || '#3B82F6'],
  });

  const backgroundColor = focusAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['#F8FAFC', '#FFFFFF'],
  });

  return (
    <View style={styles.inputWrapper}>
      <Animated.View style={[styles.inputContainer, { borderColor, backgroundColor }]}>
        <TextInput
          {...props}
          placeholder={placeholder}
          placeholderTextColor="#94A3B8"
          secureTextEntry={isPassword && !showPassword}
          style={styles.textInput}
          onFocus={() => setIsFocused(true)}
          onBlur={() => {
            setIsFocused(false);
            if (props.onBlur) props.onBlur();
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
      {error && <Text style={styles.errorText}>{error}</Text>}
    </View>
  );
};

const LoginScreen: React.FC<LoginScreenProps> = ({ navigation }) => {
  const { signIn, isLoading, statusModal, closeStatusModal } = useAuthService();
  const { data } = useCheckSignUpShowOnAppQuery('')

  const showSignUp = data?.data?.showSignUp;
  console.log(showSignUp)
  const {
    control,
    handleSubmit,
    formState: { errors, isValid },
    setError: setFormError,
  } = useForm({
    resolver: yupResolver(loginSchema),
    defaultValues: {
      phone: '',
      password: '',
    },
    mode: 'onChange',
  });

  const [rememberMe, setRememberMe] = useState(false);
  const slideAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const startSliding = () => {
      Animated.loop(
        Animated.sequence([
          Animated.timing(slideAnim, {
            toValue: 10,
            duration: 2500,
            easing: Easing.inOut(Easing.sin),
            useNativeDriver: true,
          }),
          Animated.timing(slideAnim, {
            toValue: -10,
            duration: 2500,
            easing: Easing.inOut(Easing.sin),
            useNativeDriver: true,
          }),
        ])
      ).start();
    };

    startSliding();
  }, [slideAnim]);

  const handleLogin = async (data: any) => {
    const { phone, password } = data;
    const result = await signIn(phone, password);

    if (result.success) {
      if (result.response?.data) {
        await AsyncStorage.setItem('userData', JSON.stringify(result.response.data));
        console.log('User data stored in AsyncStorage:', result.response.data);
      }
      navigation.reset({
        index: 0,
        routes: [{ name: 'MainTabs' }],
      });
    } else if (result.error) {
      const serverMessage = result.error;
      if (serverMessage.includes('UserName') || serverMessage.includes('digits')) {
        setFormError('phone', { type: 'manual', message: serverMessage });
      } else if (serverMessage.toLowerCase().includes('password')) {
        setFormError('password', { type: 'manual', message: serverMessage });
      }
    }
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: Colors.bg }]}>
      <StatusBar barStyle="dark-content" backgroundColor={Colors.bg} />

      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <View style={styles.content}>

          {/* Header Title section */}
          <View style={styles.headerContainer}>
            <Text style={[styles.title, { color: Colors.authtext || '#0F172A' }]}>Welcome Back</Text>
            <Text style={styles.welcomeText}>
              We've missed you! Sign in to continue your journey.
            </Text>
          </View>

          {/* Floating Animated Illustration */}
          <View style={styles.imageWrapper}>
            <AnimatedLoginIllustration
              width="100%"
              height="100%"
            // style={{ transform: [{ translateY: slideAnim }] }}
            />
          </View>

          {/* Form Fields Section */}
          <View style={styles.form}>
            {/* Phone Input */}
            <Controller
              control={control}
              name="phone"
              render={({ field: { onChange, onBlur, value } }) => (
                <UniqueTextInput
                  placeholder="Mobile Number"
                  keyboardType="number-pad"
                  onBlur={onBlur}
                  onChangeText={(text: any) => {
                    const filtered = text.replace(/[^0-9]/g, '');
                    onChange(filtered);
                  }}
                  value={value}
                  error={errors.phone?.message}
                  editable={!isLoading}
                  maxLength={10}
                  autoCapitalize="none"
                  autoCorrect={false}
                />
              )}
            />

            {/* Password Input */}
            <Controller
              control={control}
              name="password"
              render={({ field: { onChange, onBlur, value } }) => (
                <UniqueTextInput
                  placeholder="Password"
                  isPassword
                  onBlur={onBlur}
                  onChangeText={onChange}
                  value={value}
                  error={errors.password?.message}
                  editable={!isLoading}
                  autoCapitalize="none"
                  autoCorrect={false}
                />
              )}
            />

            {/* Remember Me & Forgot Password Row */}
            <View style={styles.row}>
              <TouchableOpacity
                style={styles.checkboxContainer}
                onPress={() => setRememberMe(!rememberMe)}
                disabled={isLoading}
                activeOpacity={0.7}
              >
                <View
                  style={[
                    styles.checkbox,
                    rememberMe && { backgroundColor: Colors.primary || '#3B82F6', borderColor: Colors.primary || '#3B82F6' },
                  ]}
                >
                  {rememberMe && <MaterialIcons name="check" size={14} color="#FFF" />}
                </View>
                <Text style={[styles.checkboxLabel, { color: Colors.textSecondary || '#64748B' }]}>Remember me</Text>
              </TouchableOpacity>

              <TouchableOpacity disabled={isLoading} onPress={() => navigation.navigate('ForgotPassword')} activeOpacity={0.7}>
                <Text style={[styles.forgotPassword, { color: Colors.primary || '#3B82F6' }]}>Forgot Password?</Text>
              </TouchableOpacity>
            </View>

            {/* Login Button */}
            <DNSButton
              title="Sign In"
              onPress={handleSubmit(handleLogin)}
              loading={isLoading}
              disabled={!isValid}
              style={styles.mainButton}
            />

            {/* Modern Divider */}
            <View style={styles.dividerContainer}>
              <View style={[styles.line, { backgroundColor: Colors.divider || '#E2E8F0' }]} />
              <Text style={[styles.dividerText, { color: Colors.textSecondary || '#94A3B8' }]}>or continue with</Text>
              <View style={[styles.line, { backgroundColor: Colors.divider || '#E2E8F0' }]} />
            </View>

            {/* OTP Button */}
            <DNSButton
              title="Login with OTP"
              onPress={() => navigation.navigate('LoginWithOTP' as any)}
              variant="secondary"
              disabled={isLoading}
              style={styles.secondaryButton}
            />
            {showSignUp === true && (
              <TouchableOpacity onPress={() => navigation.navigate('Register', { showSignUp })} style={{ flexDirection: 'row', justifyContent: 'center', marginTop: 20 }}>
                <Text>New Partner ? <Text style={{ color: Colors.primary || '#3B82F6' }}> Create an account</Text></Text>
              </TouchableOpacity>
            )}
          </View>
        </View>
      </KeyboardAvoidingView>

      <CustomLoader visible={isLoading} message="Logging you in..." />
      <StatusModal
        isVisible={statusModal.isVisible}
        type={statusModal.type}
        title={statusModal.title}
        message={statusModal.message}
        onClose={closeStatusModal}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    flex: 1,
    paddingHorizontal: Spacing.xl,
    justifyContent: 'space-between',
    paddingTop: 10,
  },
  headerContainer: {
    alignItems: 'center',
    marginTop: 10,
  },
  title: {
    fontSize: 20,
    // fontFamily: NotoSerif.regular,
    letterSpacing: -0.5,
    textAlign: 'center',
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
  imageWrapper: {
    width: '100%',
    height: '30%',
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: 10,
  },
  form: {
    width: '100%',
    justifyContent: 'flex-end',
    marginBottom: Platform.OS === 'ios' ? 20 : 30,
  },
  inputWrapper: {
    marginBottom: 16,
    width: '100%',
  },
  inputContainer: {
    width: '100%',
    height: 56,
    borderRadius: 14,
    borderWidth: 1.5,
    paddingHorizontal: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  textInput: {
    fontSize: 16,
    // fontFamily: Poppins.medium,
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
    // fontFamily: Poppins.medium,
    marginTop: 4,
    marginLeft: 4,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 24,
    marginTop: 4,
  },
  checkboxContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  checkbox: {
    width: 20,
    height: 20,
    borderRadius: 6,
    backgroundColor: '#F8FAFC',
    borderWidth: 1.5,
    borderColor: '#CBD5E1',
    marginRight: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  checkboxLabel: {
    fontSize: 16,
    // fontFamily: Poppins.medium,
  },
  forgotPassword: {
    fontSize: 16,
    // fontFamily: Poppins.semiBold,
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

export default LoginScreen;