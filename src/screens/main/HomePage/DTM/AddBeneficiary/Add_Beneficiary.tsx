import React, { useState, useEffect, useMemo, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  Modal,
  ScrollView,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  TouchableWithoutFeedback,
  Keyboard,
  Dimensions,
  FlatList,
  ListRenderItem,
} from 'react-native';

import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import Ionicons from 'react-native-vector-icons/Ionicons';

import Colors from '../../../../../theme/colors';
import { Poppins } from '../../../../../theme/typography';

import { useGetBankListQuery } from '../../../../../redux/services/mainApi/Common/CommonApi';
import { buildBeneficiaryPayload } from '../../../../../redux/services/RetailerServices/Beneficiary/BeneficiaryPayload';
import { BeneficiaryService } from '../../../../../redux/services/RetailerServices/Beneficiary/BeneficiaryService';
import { useAppSelector } from '../../../../../redux/hooks';
import { VerificationOTPModal } from './VerificationOTPModal';
import {
  useKycCheckerQuery,
  usePanVerificationMutation,
  useSendMobileOtpMutation,
  useVerifyOtpMutation,
} from '../../../../../redux/services/mainApi/KYC/KycService';
import CustomAlertModal from '../../../../../components/Modals/CustomAlertModal';
import { useCustomAlert } from '../../../../../hooks/useCustomAlert';

const { height } = Dimensions.get('window');

interface BankItem {
  value: string | number;
  text: string;
}

interface BeneficiaryData {
  id?: number;
  bankId?: number;
  bankName?: string;
  accountNumber?: string;
  ifsccode?: string;
  mobileNumber?: string;
  accountHolderName?: string;
  aadharNumber?: string;
  panNumber?: string;
}

interface AddBeneficiaryProps {
  isVisible: boolean;
  onClose: () => void;
  onSubmitSuccess: () => void;
  initialData?: BeneficiaryData | null;
}

interface FormErrors {
  bankId?: string;
  mobileNumber?: string;
  accountNumber?: string;
  ifscCode?: string;
  accountHolderName?: string;
  aadharNumber?: string;
  panNumber?: string;
  bankName?: string;
}

const PAN_REGEX = /[A-Z]{5}[0-9]{4}[A-Z]{1}/;

const Add_Beneficiary: React.FC<AddBeneficiaryProps> = ({
  isVisible,
  onClose,
  onSubmitSuccess,
  initialData,
}) => {
  const { FetchBeneficiary, isAddUpdateLoading } = BeneficiaryService();
  const user = useAppSelector((state: any) => state.auth.user);
  const { data: bankListData } = useGetBankListQuery();

  // KYC API hooks
  const [sendMobileOtp, { isLoading: isSendingMobileOtp }] = useSendMobileOtpMutation();
  const [verifyOtp] = useVerifyOtpMutation();
  const { data: kycData } = useKycCheckerQuery('');
  // const isDmtKycChecked = Boolean(kycData?.data?.checkDMTKYC);
  const isDmtKycChecked = Boolean(false); // For testing purposes, set to false. Change to true in production.
  // Custom Alert
  const { alertConfig, showSuccess, showError, showWarning, hideAlert } = useCustomAlert();

  const [bankSearchQuery, setBankSearchQuery] = useState('');
  const [isBankModalVisible, setIsBankModalVisible] = useState(false);
  const [errors, setErrors] = useState<FormErrors>({});

  // Verification status tracking
  const [verificationStatus, setVerificationStatus] = useState({
    mobile: false,
    pan: false,
    ifsc: false,
  });

  const [panVerification, { isLoading: isPanVerifying }] = usePanVerificationMutation();

  const [formData, setFormData] = useState<buildBeneficiaryPayload>({
    id: 0,
    accountNumber: '',
    ifscCode: '',
    mobileNumber: '',
    bankId: 0,
    accountHolderName: '',
    aadharNumber: '',
    panNumber: '',
  });

  // Ensure the bank array reference is stable
  const availableBanks = useMemo<BankItem[]>(() => {
    return Array.isArray(bankListData?.data) ? bankListData.data : [];
  }, [bankListData?.data]);

  const resetForm = useCallback(() => {
    setFormData({
      id: 0,
      accountNumber: '',
      ifscCode: '',
      mobileNumber: '',
      bankId: 0,
      accountHolderName: '',
      aadharNumber: '',
      panNumber: '',
    });
    setErrors({});
    setVerificationStatus({
      mobile: false,
      pan: false,
      ifsc: false,
    });
  }, []);

  useEffect(() => {
    if (initialData && isVisible) {
      const matchedBank = availableBanks.find(
        (b) => Number(b.value) === Number(initialData.bankId)
      );

      setFormData({
        id: initialData.id || 0,
        accountNumber: initialData.accountNumber || '',
        ifscCode: initialData.ifsccode || '',
        mobileNumber: initialData.mobileNumber || '',
        bankId: initialData.bankId || 0,
        bankName: matchedBank ? matchedBank.text : (initialData.bankName || ''),
        accountHolderName: initialData.accountHolderName || '',
        aadharNumber: initialData.aadharNumber || '',
        panNumber: initialData.panNumber || '',
      });
      setErrors({});
    } else if (isVisible) {
      resetForm();
    }
  }, [initialData, isVisible, availableBanks, resetForm]);

  const filteredBanks = useMemo(() => {
    if (!bankSearchQuery.trim()) return availableBanks;
    const query = bankSearchQuery.toLowerCase();
    return availableBanks.filter((bank) =>
      (bank?.text || '').toLowerCase().includes(query)
    );
  }, [availableBanks, bankSearchQuery]);

  const handleInputChange = (field: keyof buildBeneficiaryPayload, value: string | number) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (errors[field as keyof FormErrors]) {
      setErrors((prev) => ({ ...prev, [field]: undefined }));
    }
  };

  const handleSelectBank = useCallback((bank: BankItem) => {
    setFormData((prev) => ({
      ...prev,
      bankId: Number(bank?.value) || 0,
      bankName: bank?.text || '',
    }));
    setErrors((prev) => ({ ...prev, bankId: undefined }));
    setIsBankModalVisible(false);
    setBankSearchQuery('');
  }, []);

  const validateForm = (): boolean => {
    const tempErrors: FormErrors = {};
    let isValid = true;

    if (!formData.bankId) {
      tempErrors.bankId = 'Please select bank';
      isValid = false;
    }
    if (!formData.mobileNumber || formData.mobileNumber.length !== 10) {
      tempErrors.mobileNumber = 'Mobile number must be 10 digits';
      isValid = false;
    }
    if (!formData.accountNumber) {
      tempErrors.accountNumber = 'Please enter account number';
      isValid = false;
    }
    if (!formData.ifscCode) {
      tempErrors.ifscCode = 'Please enter IFSC code';
      isValid = false;
    }
    if (!formData.accountHolderName) {
      tempErrors.accountHolderName = 'Please enter account holder name';
      isValid = false;
    }
    if (!formData.aadharNumber || formData.aadharNumber.length !== 12) {
      tempErrors.aadharNumber = 'Aadhaar must be 12 digits';
      isValid = false;
    }
    if (!formData.panNumber || !PAN_REGEX.test(formData.panNumber)) {
      tempErrors.panNumber = 'Invalid PAN format';
      isValid = false;
    }

    setErrors(tempErrors);
    return isValid;
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;

    if ((!isDmtKycChecked && verificationStatus.mobile) || (!isDmtKycChecked && verificationStatus.pan)) {
      showWarning(
        'Verification Required',
        'Please verify your Mobile Number and PAN before submitting.'
      );
      return;
    }

    try {
      const response = await FetchBeneficiary(
        { ...formData, addedById: user?.roleId || 0 },
        initialData
      );
      if (response?.success) {
        onSubmitSuccess();
        onClose();
        resetForm();
      }
    } catch (error: any) {
      showError('Submission Failed', error?.data?.message || 'Something went wrong');
    }
  };

  const [verificationConfig, setVerificationConfig] = useState<{
    visible: boolean;
    type: 'MOBILE' | 'PAN' | 'IFSC';
    targetValue: string;
    otpSent: boolean;
  }>({
    visible: false,
    type: 'MOBILE',
    targetValue: '',
    otpSent: false,
  });

  const handleMobileVerification = async () => {
    if (!formData.mobileNumber || formData.mobileNumber.length !== 10) {
      showError('Invalid Input', 'Please enter a valid 10-digit mobile number');
      return;
    }

    try {
      const result = await sendMobileOtp(formData.mobileNumber).unwrap();
      if (result?.success) {
        setVerificationConfig({
          visible: true,
          type: 'MOBILE',
          targetValue: formData.mobileNumber,
          otpSent: true,
        });
        showSuccess('OTP Sent', 'OTP has been sent to your mobile number');
      } else {
        showError('Failed', result?.message || 'Failed to send OTP');
      }
    } catch (error: any) {
      showError('Error', error?.data?.message || 'Failed to send OTP');
    }
  };

  const handleOtpVerificationComplete = async (otpCode: string) => {
    if (!otpCode || otpCode.length < 6) {
      showError('Invalid OTP', 'Please enter a valid 6-digit OTP');
      return;
    }

    try {
      const result = await verifyOtp({
        type: 'MOBILE',
        mobileNumber: formData.mobileNumber,
        mobileOtp: otpCode,
        emailId: '',
        emailOtp: '',
        Kyctype: '',
      }).unwrap();

      if (result?.success) {
        setVerificationStatus((prev) => ({ ...prev, mobile: true }));
        setVerificationConfig((prev) => ({ ...prev, visible: false }));
        showSuccess('Verified', 'Mobile number verified successfully');
      } else {
        showError('Verification Failed', result?.message || 'OTP verification failed');
      }
    } catch (error: any) {
      showError('Error', error?.data?.message || 'OTP verification failed');
    }
  };

  const handleVerifyPan = async () => {
    if (!formData.panNumber || !PAN_REGEX.test(formData.panNumber)) {
      showError('Required Field', 'Please enter a valid 10-digit PAN number');
      return;
    }

    try {
      const result = await panVerification({
        panCardNumber: formData.panNumber,
      }).unwrap();

      if (result?.success) {
        showSuccess('Verification Successful', 'PAN Card verified successfully');
        setVerificationStatus((prev) => ({ ...prev, pan: true }));
      } else {
        showError('Verification Failed', result?.message || 'PAN verification failed');
      }
    } catch (error: any) {
      showError('Error', error?.data?.message || 'Failed to verify PAN Card');
    }
  };

  const renderBankItem: ListRenderItem<BankItem> = useCallback(
    ({ item }) => (
      <TouchableOpacity
        style={styles.bankItem}
        onPress={() => handleSelectBank(item)}
        activeOpacity={0.7}
      >
        <MaterialCommunityIcons name="bank" size={22} color={Colors.primary} />
        <Text style={styles.bankItemName}>{item.text}</Text>
      </TouchableOpacity>
    ),
    [handleSelectBank]
  );

  return (
    <>
      <Modal visible={isVisible} transparent animationType="slide" onRequestClose={onClose}>
        <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
          <View style={styles.modalContainer}>
            <KeyboardAvoidingView
              style={styles.keyboardView}
              behavior={Platform.OS === 'ios' ? 'padding' : undefined}
            >
              <View style={styles.modalContent}>
                {/* HEADER */}
                <View style={styles.header}>
                  <Text style={styles.headerTitle}>
                    {initialData ? 'Edit Beneficiary' : 'Add Beneficiary'}
                  </Text>
                  <TouchableOpacity onPress={onClose} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
                    <MaterialIcons name="close" size={24} color={Colors.textDark} />
                  </TouchableOpacity>
                </View>

                <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.formContent}>
                  {/* BANK SELECT DROPDOWN */}
                  <View style={styles.inputGroup}>
                    <Text style={styles.inputLabel}>BANK NAME</Text>
                    <TouchableOpacity
                      style={[styles.dropdownTrigger, errors.bankId ? styles.inputErrorBorder : null]}
                      onPress={() => setIsBankModalVisible(true)}
                      activeOpacity={0.8}
                    >
                      <Text style={formData.bankName ? styles.dropdownText : styles.placeholderText} numberOfLines={1}>
                        {formData.bankName || 'Select Bank'}
                      </Text>
                      <MaterialIcons name="keyboard-arrow-down" size={24} color="#8F9BB3" />
                    </TouchableOpacity>
                    {errors.bankId && <Text style={styles.errorText}>{errors.bankId}</Text>}
                  </View>

                  {/* MOBILE NUMBER */}
                  <View style={styles.inputGroup}>
                    <Text style={styles.inputLabel}>MOBILE NUMBER</Text>
                    <View
                      style={[
                        styles.inputWrapper,
                        errors.mobileNumber ? styles.inputErrorBorder : null,
                        verificationStatus.mobile ? styles.inputVerifiedBorder : null,
                      ]}
                    >
                      <TextInput
                        style={styles.textInput}
                        placeholder="Enter Mobile Number"
                        keyboardType="number-pad"
                        maxLength={10}
                        value={formData.mobileNumber}
                        placeholderTextColor={Colors.textMuted}
                        onChangeText={(text) => handleInputChange('mobileNumber', text.replace(/[^0-9]/g, ''))}
                        editable={!verificationStatus.mobile || isDmtKycChecked}
                      />
                      {isDmtKycChecked &&
                        (verificationStatus.mobile ? (
                          <View style={styles.verifiedIconRow}>
                            <MaterialCommunityIcons name="check-circle" size={24} color="#00875A" />
                            <TouchableOpacity
                              onPress={() => {
                                setVerificationStatus((prev) => ({ ...prev, mobile: false }));
                                handleInputChange('mobileNumber', '');
                              }}
                              style={styles.editBtn}
                            >
                              <MaterialCommunityIcons name="pencil-outline" size={16} color={Colors.primary} />
                              <Text style={styles.editBtnText}>Edit</Text>
                            </TouchableOpacity>
                          </View>
                        ) : (
                          <TouchableOpacity onPress={handleMobileVerification} disabled={isSendingMobileOtp}>
                            {isSendingMobileOtp ? (
                              <ActivityIndicator size="small" color="#1E52C7" />
                            ) : (
                              <Text style={styles.verifyLinkText}>Verify</Text>
                            )}
                          </TouchableOpacity>
                        ))}
                    </View>
                    {isDmtKycChecked &&
                      (verificationStatus.mobile ? (
                        <View style={styles.statusTagVerified}>
                          <MaterialCommunityIcons name="check-circle-outline" size={13} color="#00875A" />
                          <Text style={styles.statusTagVerifiedText}>Mobile Number Verified</Text>
                        </View>
                      ) : (
                        <View style={styles.statusTagPending}>
                          <MaterialCommunityIcons name="alert-circle-outline" size={13} color="#F59E0B" />
                          <Text style={styles.statusTagPendingText}>Mobile not verified — tap Verify</Text>
                        </View>
                      ))}
                    {errors.mobileNumber && <Text style={styles.errorText}>{errors.mobileNumber}</Text>}
                  </View>

                  {/* ACCOUNT NUMBER */}
                  <View style={styles.inputGroup}>
                    <Text style={styles.inputLabel}>ACCOUNT NUMBER</Text>
                    <View style={[styles.inputWrapper, errors.accountNumber ? styles.inputErrorBorder : null]}>
                      <TextInput
                        style={styles.textInput}
                        placeholder="Enter Account Number"
                        keyboardType="number-pad"
                        value={formData.accountNumber}
                        placeholderTextColor={Colors.textMuted}
                        onChangeText={(text) => handleInputChange('accountNumber', text)}
                      />
                      <MaterialCommunityIcons name="bank-outline" size={20} color="#8F9BB3" />
                    </View>
                    {errors.accountNumber && <Text style={styles.errorText}>{errors.accountNumber}</Text>}
                  </View>

                  {/* IFSC CODE */}
                  <View style={styles.inputGroup}>
                    <Text style={styles.inputLabel}>IFSC CODE</Text>
                    <View style={[styles.inputWrapper, errors.ifscCode ? styles.inputErrorBorder : null]}>
                      <TextInput
                        style={styles.textInput}
                        placeholder="Enter IFSC Code"
                        autoCapitalize="characters"
                        value={formData.ifscCode}
                        placeholderTextColor={Colors.textMuted}
                        onChangeText={(text) => handleInputChange('ifscCode', text.toUpperCase())}
                        editable={!verificationStatus.ifsc}
                      />
                      {verificationStatus.ifsc && (
                        <MaterialCommunityIcons name="check-circle" size={24} color="#00875A" />
                      )}
                    </View>
                    {errors.ifscCode && <Text style={styles.errorText}>{errors.ifscCode}</Text>}
                  </View>

                  {/* ACCOUNT HOLDER */}
                  <View style={styles.inputGroup}>
                    <Text style={styles.inputLabel}>ACCOUNT HOLDER NAME</Text>
                    <View style={[styles.inputWrapper, errors.accountHolderName ? styles.inputErrorBorder : null]}>
                      <TextInput
                        style={styles.textInput}
                        placeholder="Enter Account Holder Name"
                        value={formData.accountHolderName}
                        placeholderTextColor={Colors.textMuted}
                        onChangeText={(text) => handleInputChange('accountHolderName', text)}
                      />
                      <Ionicons name="person-outline" size={20} color="#8F9BB3" />
                    </View>
                    {errors.accountHolderName && <Text style={styles.errorText}>{errors.accountHolderName}</Text>}
                  </View>

                  {/* AADHAAR NUMBER */}
                  <View style={styles.inputGroup}>
                    <Text style={styles.inputLabel}>AADHAAR NUMBER</Text>
                    <View style={[styles.inputWrapper, errors.aadharNumber ? styles.inputErrorBorder : null]}>
                      <MaterialCommunityIcons name="card-account-details-outline" size={20} color="#8F9BB3" style={styles.inputIcon} />
                      <TextInput
                        style={styles.textInput}
                        placeholder="Enter Aadhaar Number"
                        keyboardType="number-pad"
                        maxLength={12}
                        placeholderTextColor={Colors.textMuted}
                        value={formData.aadharNumber}
                        onChangeText={(text) => handleInputChange('aadharNumber', text.replace(/[^0-9]/g, ''))}
                      />
                    </View>
                    {errors.aadharNumber && <Text style={styles.errorText}>{errors.aadharNumber}</Text>}
                  </View>

                  {/* PAN NUMBER */}
                  <View style={styles.inputGroup}>
                    <Text style={styles.inputLabel}>PAN NUMBER</Text>
                    <View
                      style={[
                        styles.inputWrapper,
                        errors.panNumber ? styles.inputErrorBorder : null,
                        verificationStatus.pan ? styles.inputVerifiedBorder : null,
                      ]}
                    >
                      <TextInput
                        style={styles.textInput}
                        placeholder="Enter PAN Number"
                        autoCapitalize="characters"
                        maxLength={10}
                        value={formData.panNumber}
                        placeholderTextColor={Colors.textMuted}
                        onChangeText={(text) => handleInputChange('panNumber', text.toUpperCase())}
                        editable={!verificationStatus.pan}
                      />
                      {isDmtKycChecked &&
                        (verificationStatus.pan ? (
                          <View style={styles.verifiedIconRow}>
                            <MaterialCommunityIcons name="check-circle" size={24} color="#00875A" />
                            <TouchableOpacity
                              onPress={() => {
                                setVerificationStatus((prev) => ({ ...prev, pan: false }));
                                handleInputChange('panNumber', '');
                              }}
                              style={styles.editBtn}
                            >
                              <MaterialCommunityIcons name="pencil-outline" size={16} color={Colors.primary} />
                              <Text style={styles.editBtnText}>Edit</Text>
                            </TouchableOpacity>
                          </View>
                        ) : (
                          <TouchableOpacity onPress={handleVerifyPan} disabled={isPanVerifying}>
                            {isPanVerifying ? (
                              <ActivityIndicator size="small" color="#1E52C7" />
                            ) : (
                              <Text style={styles.verifyLinkText}>Verify</Text>
                            )}
                          </TouchableOpacity>
                        ))}
                    </View>
                    {isDmtKycChecked &&
                      (verificationStatus.pan ? (
                        <View style={styles.statusTagVerified}>
                          <MaterialCommunityIcons name="check-circle-outline" size={13} color="#00875A" />
                          <Text style={styles.statusTagVerifiedText}>PAN Verified</Text>
                        </View>
                      ) : (
                        <View style={styles.statusTagPending}>
                          <MaterialCommunityIcons name="alert-circle-outline" size={13} color="#F59E0B" />
                          <Text style={styles.statusTagPendingText}>PAN not verified — tap Verify</Text>
                        </View>
                      ))}
                    {errors.panNumber && <Text style={styles.errorText}>{errors.panNumber}</Text>}
                  </View>

                  {/* SUBMIT BUTTON */}
                  <TouchableOpacity
                    style={[
                      styles.submitButton,
                      ((isDmtKycChecked && !verificationStatus.mobile) || (isDmtKycChecked && !verificationStatus.pan)) &&
                      styles.submitButtonDisabled,
                    ]}
                    onPress={handleSubmit}
                    disabled={isAddUpdateLoading}
                    activeOpacity={0.85}
                  >
                    {isAddUpdateLoading ? (
                      <ActivityIndicator color={Colors.white} />
                    ) : (
                      <Text style={styles.submitButtonText}>Submit</Text>
                    )}
                  </TouchableOpacity>
                </ScrollView>
              </View>
            </KeyboardAvoidingView>
          </View>
        </TouchableWithoutFeedback>
      </Modal>

      {/* OTP Verification Modal */}
      <VerificationOTPModal
        isVisible={verificationConfig.visible}
        type={verificationConfig.type}
        targetValue={verificationConfig.targetValue}
        onClose={() => setVerificationConfig((prev) => ({ ...prev, visible: false }))}
        onVerify={handleOtpVerificationComplete}
      />

      {/* Custom Alert Modal */}
      <CustomAlertModal
        visible={alertConfig.visible}
        type={alertConfig.type}
        title={alertConfig.title}
        message={alertConfig.message}
        onClose={hideAlert}
        confirmText={alertConfig.confirmText}
        onConfirm={alertConfig.onConfirm}
      />

      {/* BANK SEARCH SELECTION MODAL */}
      <Modal visible={isBankModalVisible} transparent animationType="slide" onRequestClose={() => setIsBankModalVisible(false)}>
        <View style={styles.bankModalContainer}>
          <View style={styles.bankModalContent}>
            {/* HEADER */}
            <View style={styles.bankHeader}>
              <Text style={styles.bankHeaderTitle}>Select Bank</Text>
              <TouchableOpacity onPress={() => setIsBankModalVisible(false)} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
                <MaterialIcons name="close" size={24} color={Colors.textDark} />
              </TouchableOpacity>
            </View>

            {/* SEARCH */}
            <View style={styles.bankSearchWrapper}>
              <Ionicons name="search" size={20} color="#8F9BB3" />
              <TextInput
                style={styles.bankSearchInput}
                placeholder="Search Bank..."
                value={bankSearchQuery}
                onChangeText={setBankSearchQuery}
                autoCorrect={false}
              />
            </View>

            {/* HIGH-PERFORMANCE BANK LIST */}
            <FlatList
              data={filteredBanks}
              renderItem={renderBankItem}
              keyExtractor={(item, index) => item.value?.toString() || index.toString()}
              initialNumToRender={15}
              maxToRenderPerBatch={10}
              windowSize={5}
              removeClippedSubviews={Platform.OS === 'android'}
              keyboardShouldPersistTaps="handled"
              showsVerticalScrollIndicator={false}
              ListEmptyComponent={<Text style={styles.noBanksText}>No Banks Found</Text>}
            />
          </View>
        </View>
      </Modal>
    </>
  );
};

export default Add_Beneficiary;

const styles = StyleSheet.create({
  modalContainer: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.4)',
    justifyContent: 'flex-end',
  },
  keyboardView: {
    width: '100%',
  },
  modalContent: {
    backgroundColor: Colors.white,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    maxHeight: height * 0.9,
    paddingTop: 20,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  headerTitle: {
    fontSize: 20,
    fontFamily: Poppins.bold,
    fontWeight: '700',
    color: Colors.textDark,
  },
  formContent: {
    paddingHorizontal: 20,
    paddingBottom: 40,
  },
  inputGroup: {
    marginBottom: 16,
  },
  inputLabel: {
    fontSize: 12,
    fontFamily: Poppins.bold,
    fontWeight: '700',
    marginBottom: 8,
    color: Colors.textBody,
  },
  dropdownTrigger: {
    height: 56,
    borderWidth: 1,
    borderColor: Colors.divider,
    borderRadius: 14,
    paddingHorizontal: 16,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#FAFAFA',
  },
  dropdownText: {
    fontSize: 16,
    fontFamily: Poppins.semiBold,
    color: Colors.textDark,
    fontWeight: '600',
    flex: 1,
    marginRight: 10,
  },
  placeholderText: {
    fontSize: 16,
    fontFamily: Poppins.regular,
    color: '#8F9BB3',
    flex: 1,
  },
  inputWrapper: {
    height: 56,
    borderWidth: 1,
    borderColor: Colors.divider,
    borderRadius: 14,
    backgroundColor: '#FAFAFA',
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
  },
  inputIcon: {
    marginRight: 8,
  },
  textInput: {
    flex: 1,
    fontSize: 16,
    fontFamily: Poppins.medium,
    color: Colors.textDark,
  },
  inputErrorBorder: {
    borderColor: Colors.error,
  },
  inputVerifiedBorder: {
    borderColor: '#00875A',
  },
  errorText: {
    color: Colors.error,
    fontSize: 12,
    fontFamily: Poppins.semiBold,
    fontWeight: '600',
    marginTop: 6,
    marginLeft: 4,
  },
  submitButton: {
    height: 54,
    borderRadius: 14,
    backgroundColor: Colors.primaryDark,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 10,
  },
  submitButtonDisabled: {
    backgroundColor: '#E2E8F0',
  },
  submitButtonText: {
    color: Colors.white,
    fontSize: 16,
    fontFamily: Poppins.bold,
    fontWeight: '700',
  },
  bankModalContainer: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.4)',
    justifyContent: 'flex-end',
  },
  bankModalContent: {
    backgroundColor: Colors.white,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    height: height * 0.7,
    padding: 20,
  },
  bankHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  bankHeaderTitle: {
    fontSize: 16,
    fontFamily: Poppins.bold,
    fontWeight: '700',
    color: Colors.textDark,
  },
  bankSearchWrapper: {
    height: 50,
    borderWidth: 1,
    borderColor: Colors.divider,
    borderRadius: 14,
    backgroundColor: '#FAFAFA',
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    marginBottom: 16,
  },
  bankSearchInput: {
    flex: 1,
    marginLeft: 8,
    fontSize: 15,
    color: Colors.textDark,
  },
  bankItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F2F5',
  },
  bankItemName: {
    marginLeft: 12,
    fontSize: 15,
    fontFamily: Poppins.medium,
    color: Colors.textDark,
  },
  noBanksText: {
    textAlign: 'center',
    color: Colors.textMuted,
    marginTop: 40,
    fontSize: 14,
  },
  verifiedIconRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  editBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    marginLeft: 8,
  },
  editBtnText: {
    fontSize: 14,
    color: Colors.primary,
    marginLeft: 2,
  },
  verifyLinkText: {
    color: Colors.primary,
    fontWeight: '600',
  },
  statusTagVerified: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 6,
  },
  statusTagVerifiedText: {
    color: '#00875A',
    fontSize: 12,
    marginLeft: 4,
  },
  statusTagPending: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 6,
  },
  statusTagPendingText: {
    color: '#F59E0B',
    fontSize: 12,
    marginLeft: 4,
  },
});