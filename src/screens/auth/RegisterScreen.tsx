import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  KeyboardAvoidingView,
  Platform,
  StatusBar,
  Modal,
} from 'react-native';
import { useForm, Controller } from 'react-hook-form';
import Colors from '../../theme/colors';
import { Spacing } from '../../theme/spacing';
import { Poppins } from '../../theme/typography';
import DNSButton from '../../components/DNSButton';
import CustomLoader from '../../components/CustomLoader';
import StatusModal from '../../components/Modals/StatusModal';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../navigation/RootNavigator';
import { DropdownSelector } from '../../components/Filters/DropdownSelector';
import { useSendSignUpOTPMutation, useSignUpMutation } from '../../redux/services/Auth/AuthApi';
import { useGetStateListQuery, useGetDistrictListQuery } from '../../redux/services/mainApi/Common/CommonApi';

type RegisterScreenProps = NativeStackScreenProps<RootStackParamList, 'Register'>;

type RegisterFormData = {
  fullName: string;
  orgName: string;
  mobileNumber: string;
  email: string;
  panCardNumber: string;
  aadharNumber: string;
  address: string;
  pincode: string;
  gstNumber: string;
  domainName: string;
  stateId: number;
  districtId: number;
  passWord: string;
};

const RegisterScreen: React.FC<RegisterScreenProps> = ({ navigation, route }) => {
  const showSignUp = route.params?.showSignUp ?? false;

  const [sendOTP, { isLoading: isSendingOTP }] = useSendSignUpOTPMutation();
  const [signUp, { isLoading: isSigningUp }] = useSignUpMutation();

  const [showOTPModal, setShowOTPModal] = useState(false);
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [pendingFormData, setPendingFormData] = useState<RegisterFormData | null>(null);
  const inputRefs = useRef<Array<TextInput | null>>([]);

  const [statusModal, setStatusModal] = useState<{
    isVisible: boolean;
    type: 'success' | 'error';
    title: string;
    message: string;
  }>({
    isVisible: false,
    type: 'success',
    title: '',
    message: '',
  });

  const closeStatusModal = () => {
    const wasSuccess = statusModal.type === 'success';
    setStatusModal((prev) => ({ ...prev, isVisible: false }));
    if (wasSuccess) {
      navigation.navigate('Login');
    }
  };

  const {
    control,
    handleSubmit,
    formState: { errors },
    watch,
    setValue,
  } = useForm<RegisterFormData>({
    defaultValues: {
      fullName: '',
        passWord:'',

      orgName: '',
      mobileNumber: '',
      email: '',
      panCardNumber: '',
      aadharNumber: '',
      address: '',
      pincode: '',
      stateId: 0,
      districtId: 0,
    },
  });

  const selectedStateId = watch('stateId');
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null);
  const [stateSearch, setStateSearch] = useState('');
  const [districtSearch, setDistrictSearch] = useState('');

  const { data: stateData, isLoading: isStatesLoading } = useGetStateListQuery();
  const { data: districtData, isLoading: isDistrictsLoading } = useGetDistrictListQuery(
    selectedStateId,
    { skip: !selectedStateId }
  );

  const stateList = stateData?.data || [];
  const districtList = districtData?.data || [];

  // Step 1: Validate form -> call sendOTP -> show OTP modal
  const onSubmitDetails = async (data: RegisterFormData) => {
    try {
      const result = await sendOTP({ MobileNumber: data.mobileNumber, email: data.email }).unwrap();

      if (result.success || result.statusCode === 200) {
        setPendingFormData(data);
        setOtp(['', '', '', '', '', '']);
        setShowOTPModal(true);
      } else {
        setStatusModal({
          isVisible: true,
          type: 'error',
          title: 'OTP Request Failed',
          message: result.message || 'Failed to send OTP. Please try again.',
        });
      }
    } catch (error: any) {
      console.error('Send OTP Error:', error);
      setStatusModal({
        isVisible: true,
        type: 'error',
        title: 'Error',
        message: error?.data?.message || 'Failed to send OTP. Please try again.',
      });
    }
  };

  // Step 2: Verify OTP -> call Account/SignUp
  const handleVerifyAndSignUp = async () => {
    if (!pendingFormData) return;

    const otpString = otp.join('');
    if (otpString.length < 6) return;

    try {
      const payload = {
        otp: otpString,
        roleId: 4,
        fullName: pendingFormData.fullName.trim(),
        
        orgName: pendingFormData.orgName.trim(),
        mobileNumber: pendingFormData.mobileNumber.trim(),
        email: pendingFormData.email.trim(),
        stateId: pendingFormData.stateId,
        districtId: pendingFormData.districtId,
        address: pendingFormData.address.trim(),
        pincode: pendingFormData.pincode.trim(),
        aadharNumber: pendingFormData.aadharNumber.trim(),
        panCardNumber: pendingFormData.panCardNumber.trim().toUpperCase(),
        companyTypeId: 0,
      };

      const result = await signUp(payload).unwrap();
      if (result?.success || result?.statusCode === 200) {
        setShowOTPModal(false);
        setStatusModal({
          isVisible: true,
          type: 'success',
          title: 'Registration Successful!',
          message: result?.message || 'Your account has been created. Please login to continue.',
        });
      } else {
        setShowOTPModal(false);
        setStatusModal({
          isVisible: true,
          type: 'error',
          title: 'Registration Failed',
          message: result?.message || 'Something went wrong. Please try again.',
        });
      }
    } catch (error: any) {
      console.error('SignUp Error:', error);
      setShowOTPModal(false);
      setStatusModal({
        isVisible: true,
        type: 'error',
        title: 'Registration Failed',
        message: error?.data?.message || error?.message || 'Something went wrong. Please try again.',
      });
    }
  };

  const handleOtpChange = (value: string, index: number) => {
    const numericValue = value.replace(/[^0-9]/g, '');
    if (value !== '' && numericValue === '') return;

    const newOtp = [...otp];
    newOtp[index] = numericValue;
    setOtp(newOtp);

    if (numericValue && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyPress = (e: any, index: number) => {
    if (e.nativeEvent.key === 'Backspace' && !otp[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  return showSignUp ? (
    <View style={styles.container}>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          {/* Header Bar */}
          <View style={styles.headerBar}>
            <TouchableOpacity
              style={styles.backButton}
              onPress={() => navigation.goBack()}
            >
              <Text style={styles.backText}>‹</Text>
            </TouchableOpacity>
            <View style={styles.stepBadge}>
              <Text style={styles.stepBadgeText}>Create Account</Text>
            </View>
          </View>

          {/* Form Content */}
          <View style={styles.formContainer}>
            <Text style={styles.welcomeText}>Welcome</Text>
            <Text style={styles.title}>Create Retailer Account</Text>
            <Text style={styles.subtitle}>Fill in your details to get started</Text>

            {/* Full Name */}
            <View style={styles.inputWrapper}>
              <Text style={styles.label}>Full Name</Text>
              <Controller
                control={control}
                name="fullName"
                rules={{ required: 'Full Name is required' }}
                render={({ field: { onChange, onBlur, value } }) => (
                  <TextInput
                    style={[styles.input, errors.fullName && styles.inputError]}
                    placeholder="Enter Full Name"
                    onBlur={onBlur}
                    onChangeText={onChange}
                    value={value}
                    placeholderTextColor={Colors.textSecondary}
                  />
                )}
              />
              {errors.fullName && (
                <Text style={styles.errorText}>{errors.fullName.message?.toString()}</Text>
              )}
            </View>

            {/* Organisation / Shop Name */}
            <View style={styles.inputWrapper}>
              <Text style={styles.label}>Organisation / Shop Name</Text>
              <Controller
                control={control}
                name="orgName"
                rules={{ required: 'Organisation Name is required' }}
                render={({ field: { onChange, onBlur, value } }) => (
                  <TextInput
                    style={[styles.input, errors.orgName && styles.inputError]}
                    placeholder="Enter Organisation or Shop Name"
                    onBlur={onBlur}
                    onChangeText={onChange}
                    value={value}
                                        placeholderTextColor={Colors.textSecondary}

                  />
                )}
              />
              {errors.orgName && (
                <Text style={styles.errorText}>{errors.orgName.message?.toString()}</Text>
              )}
            </View>

            {/* Mobile Number */}
            <View style={styles.inputWrapper}>
              <Text style={styles.label}>Mobile Number</Text>
              <Controller
                control={control}
                name="mobileNumber"
                rules={{
                  required: 'Mobile number is required',
                  pattern: {
                    value: /^[6-9]\d{9}$/,
                    message: 'Enter a valid 10-digit Indian mobile number',
                  },
                }}
                render={({ field: { onChange, onBlur, value } }) => (
                  <TextInput
                    style={[styles.input, errors.mobileNumber && styles.inputError]}
                    placeholder="Enter 10-digit Mobile Number"
                    keyboardType="numeric"
                    maxLength={10}
                    onBlur={onBlur}
                    onChangeText={onChange}
                    value={value}
                                        placeholderTextColor={Colors.textSecondary}

                  />
                )}
              />
              {errors.mobileNumber && (
                <Text style={styles.errorText}>{errors.mobileNumber.message?.toString()}</Text>
              )}
            </View>

            {/* Email */}
            <View style={styles.inputWrapper}>
              <Text style={styles.label}>Email Address</Text>
              <Controller
                control={control}
                name="email"
                rules={{
                  required: 'Email is required',
                  pattern: {
                    value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                    message: 'Invalid email address',
                  },
                }}
                render={({ field: { onChange, onBlur, value } }) => (
                  <TextInput
                    style={[styles.input, errors.email && styles.inputError]}
                    placeholder="Enter Email Address"
                    keyboardType="email-address"
                    autoCapitalize="none"
                    onBlur={onBlur}
                    onChangeText={onChange}
                    value={value}
                                        placeholderTextColor={Colors.textSecondary}

                  />
                )}
              />
              {errors.email && (
                <Text style={styles.errorText}>{errors.email.message?.toString()}</Text>
              )}
            </View>

            {/* PAN Card */}
            <View style={styles.inputWrapper}>
              <Text style={styles.label}>PAN Card Number</Text>
              <Controller
                control={control}
                name="panCardNumber"
                rules={{
                  required: 'PAN Card is required',
                  pattern: {
                    value: /^[A-Z]{5}[0-9]{4}[A-Z]{1}$/,
                    message: 'Enter a valid PAN (e.g. ABCDE1234E)',
                  },
                }}
                render={({ field: { onChange, onBlur, value } }) => (
                  <TextInput
                    style={[styles.input, errors.panCardNumber && styles.inputError]}
                    placeholder="Enter PAN Card Number (e.g. ABCDE1234E)"
                    autoCapitalize="characters"
                    maxLength={10}
                    onBlur={onBlur}
                    onChangeText={(val) => onChange(val.toUpperCase())}
                    value={value}
                                        placeholderTextColor={Colors.textSecondary}

                  />
                )}
              />
              {errors.panCardNumber && (
                <Text style={styles.errorText}>{errors.panCardNumber.message?.toString()}</Text>
              )}
            </View>

            {/* Unique Identifier */}
            <View style={styles.inputWrapper}>
              <Text style={styles.label}>Aadhaar Number</Text>
              <Controller
                control={control}
                name="aadharNumber"
                rules={{
                  required: 'Aadhaar Number is required',
                  pattern: {
                    value: /^[0-9]{12}$/,
                    message: 'Must be 12 digits',
                  },
                }}
                render={({ field: { onChange, onBlur, value } }) => (
                  <TextInput
                    style={[styles.input, errors.aadharNumber && styles.inputError]}
                    placeholder="Enter 12-digit Aadhaar Number"
                    keyboardType="numeric"
                    maxLength={12}
                    onBlur={onBlur}
                    onChangeText={onChange}
                    value={value}
                    placeholderTextColor={Colors.textSecondary}
                  />
                )}
              />
              {errors.aadharNumber && (
                <Text style={styles.errorText}>{errors.aadharNumber.message?.toString()}</Text>
              )}
            </View>

            {/* Business Address */}
            <View style={styles.inputWrapper}>
              <Text style={styles.label}>Business Address</Text>
              <Controller
                control={control}
                name="address"
                rules={{ required: 'Business Address is required' }}
                render={({ field: { onChange, onBlur, value } }) => (
                  <TextInput
                    style={[styles.input, styles.textArea, errors.address && styles.inputError]}
                    placeholder="Enter Business Address"
                    multiline
                    onBlur={onBlur}
                    onChangeText={onChange}
                    value={value}
                    placeholderTextColor={Colors.textSecondary}
                  />
                )}
              />
              {errors.address && (
                <Text style={styles.errorText}>{errors.address.message?.toString()}</Text>
              )}
            </View>

            {/* Pincode */}
            <View style={styles.inputWrapper}>
              <Text style={styles.label}>Pincode</Text>
              <Controller
                control={control}
                name="pincode"
                rules={{
                  required: 'Pincode is required',
                  pattern: {
                    value: /^[1-9][0-9]{5}$/,
                    message: 'Enter a valid 6-digit Pincode',
                  },
                }}
                render={({ field: { onChange, onBlur, value } }) => (
                  <TextInput
                    style={[styles.input, errors.pincode && styles.inputError]}
                    placeholder="Enter 6-digit Pincode"
                    keyboardType="numeric"
                    maxLength={6}
                    onBlur={onBlur}
                    onChangeText={onChange}
                    value={value}
                                        placeholderTextColor={Colors.textSecondary}

                  />
                )}
              />
              {errors.pincode && (
                <Text style={styles.errorText}>{errors.pincode.message?.toString()}</Text>
              )}
            </View>

            {/* State Dropdown */}
            <View style={styles.inputWrapper}>
              <Controller
                control={control}
                name="stateId"
                rules={{
                  required: 'Please select a state',
                  min: { value: 1, message: 'Please select a state' },
                }}
                render={({ field: { onChange, value } }) => (
                  <DropdownSelector
                    label="Select State"
                    value={value}
                    options={stateList?.map((s: any) => ({ text: s.stateName || s.name, value: s.id })) || []}
                    onSelect={(val: any) => {
                      onChange(val);
                      setValue('districtId', 0, { shouldValidate: true });
                      setActiveDropdown(null);
                    }}
                    dropdownId="state"
                    placeholder="Choose State"
                    activeDropdown={activeDropdown}
                    setActiveDropdown={setActiveDropdown}
                    dropdownSearch={stateSearch}
                    setDropdownSearch={setStateSearch}
                  />
                )}
              />
              {errors.stateId && (
                <Text style={styles.errorText}>{errors.stateId.message?.toString()}</Text>
              )}
            </View>

            {/* District Dropdown */}
            <View style={styles.inputWrapper}>
              <Controller
                control={control}
                name="districtId"
                rules={{
                  required: 'Please select a district',
                  min: { value: 1, message: 'Please select a district' },
                }}
                render={({ field: { onChange, value } }) => (
                  <DropdownSelector
                    label="Select District"
                    value={value}
                    options={
                      districtList?.map((d: any) => ({
                        text: d.districtName || d.name,
                        value: d.id,
                      })) || []
                    }
                    onSelect={(val: any) => {
                      onChange(val);
                      setActiveDropdown(null);
                    }}
                    dropdownId="district"
                    placeholder={selectedStateId ? 'Choose District' : 'Select state first'}
                    activeDropdown={activeDropdown}
                    setActiveDropdown={setActiveDropdown}
                    dropdownSearch={districtSearch}
                    setDropdownSearch={setDistrictSearch}
                  />
                )}
              />
              {errors.districtId && (
                <Text style={styles.errorText}>{errors.districtId.message?.toString()}</Text>
              )}
            </View>

            {/* Submit Button */}
            <DNSButton
              title="Submit Details"
              onPress={handleSubmit(onSubmitDetails)}
              loading={isSendingOTP}
              style={{ marginTop: 20, marginBottom: 16 }}
            />

            <TouchableOpacity
              onPress={() => navigation.navigate('Login')}
              style={{ marginBottom: 40, alignItems: 'center' }}
            >
              <Text style={styles.footerText}>
                Already have an account?{' '}
                <Text style={{ color: Colors.primary || '#007AFF', fontFamily: Poppins.bold }}>
                  Login
                </Text>
              </Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>

      <CustomLoader
        visible={isSendingOTP || isStatesLoading || isDistrictsLoading || isSigningUp}
        message="Please wait..."
      />

      {/* OTP Modal */}
      <Modal visible={showOTPModal} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={styles.modalContainer}>
            <Text style={styles.modalTitle}>Verify OTP</Text>
            <Text style={styles.modalSubtitle}>
              Enter the 6-digit code sent to{'\n'}
              +91 {pendingFormData?.mobileNumber ? `******${pendingFormData.mobileNumber.slice(-4)}` : ''}
            </Text>

            <View style={styles.otpContainer}>
              {otp.map((digit, index) => (
                <TextInput
                  key={index}
                  ref={(ref) => { inputRefs.current[index] = ref; }}
                  style={styles.otpInput}
                  keyboardType="numeric"
                  maxLength={1}
                  value={digit}
                  onChangeText={(value) => handleOtpChange(value, index)}
                  onKeyPress={(e) => handleKeyPress(e, index)}
                  editable={!isSigningUp}
                />
              ))}
            </View>

            <DNSButton
              title="Verify & Register"
              onPress={handleVerifyAndSignUp}
              loading={isSigningUp}
              disabled={otp.join('').length < 6}
            />

            <TouchableOpacity
              onPress={() => setShowOTPModal(false)}
              style={{ marginTop: 20, alignItems: 'center' }}
            >
              <Text style={{ color: Colors.error || '#DC2626', fontFamily: Poppins.semiBold }}>
                Cancel
              </Text>
            </TouchableOpacity>
          </KeyboardAvoidingView>
        </View>
      </Modal>

      <StatusModal
        isVisible={statusModal.isVisible}
        type={statusModal.type}
        title={statusModal.title}
        message={statusModal.message}
        onClose={closeStatusModal}
      />
    </View>
  ) : null;
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.bg || '#F9FAFB',
  },
  scrollContent: {
    paddingHorizontal: Spacing.lg || 20,
    paddingTop: 16,
    paddingBottom: 30,
  },
  headerBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 20,
    marginTop: Platform.OS === 'ios' ? 10 : 0,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  backText: {
    fontSize: 28,
    lineHeight: 30,
    color: Colors.textDark || '#111827',
    fontFamily: Poppins.regular,
    marginTop: -2,
  },
  stepBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    backgroundColor: '#EEF2FF',
  },
  stepBadgeText: {
    fontSize: 12,
    fontFamily: Poppins.semiBold,
    color: Colors.primary || '#4F46E5',
  },
  formContainer: {
    width: '100%',
  },
  welcomeText: {
    fontSize: 14,
    fontFamily: Poppins.semiBold,
    color: Colors.primary || '#4F46E5',
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginBottom: 4,
  },
  title: {
    fontSize: 26,
    fontFamily: Poppins.bold,
    color: Colors.authtext || '#111827',
    marginBottom: 6,
  },
  subtitle: {
    fontSize: 14,
    fontFamily: Poppins.regular,
    color: Colors.textSecondary || '#6B7280',
    marginBottom: 24,
  },
  inputWrapper: {
    marginBottom: 16,
    width: '100%',
  },
  label: {
    fontSize: 14,
    fontFamily: Poppins.semiBold,
    color: Colors.textBody || '#374151',
    marginBottom: 8,
  },
  input: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 15,
    fontFamily: Poppins.regular,
    color: Colors.textDark || '#111827',
  },
  textArea: {
    height: 90,
    textAlignVertical: 'top',
  },
  inputError: {
    borderColor: Colors.error || '#EF4444',
  },
  errorText: {
    color: Colors.error || '#EF4444',
    fontSize: 12,
    fontFamily: Poppins.regular,
    marginTop: 4,
    marginLeft: 4,
  },
  footerText: {
    fontSize: 14,
    fontFamily: Poppins.regular,
    color: Colors.textBody || '#374151',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalContainer: {
    width: '100%',
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 24,
    elevation: 5,
  },
  modalTitle: {
    fontSize: 22,
    fontFamily: Poppins.bold,
    color: Colors.textDark || '#111827',
    textAlign: 'center',
    marginBottom: 8,
  },
  modalSubtitle: {
    fontSize: 14,
    fontFamily: Poppins.regular,
    color: Colors.textSecondary || '#6B7280',
    textAlign: 'center',
    marginBottom: 24,
    lineHeight: 20,
  },
  otpContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
    marginBottom: 30,
  },
  otpInput: {
    width: 45,
    height: 55,
    backgroundColor: '#F8FAFF',
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: '#A8C5F5',
    textAlign: 'center',
    fontSize: 20,
    fontFamily: Poppins.bold,
    color: '#1A4F95',
  },
});

export default RegisterScreen;