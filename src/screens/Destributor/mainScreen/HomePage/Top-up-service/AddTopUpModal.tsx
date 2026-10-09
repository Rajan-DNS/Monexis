import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  TextInput,
  Platform,
  KeyboardAvoidingView,
  TouchableWithoutFeedback,
  Keyboard,
  Modal,
  SafeAreaView,
} from 'react-native';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import { useForm, Controller, FieldValues } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import DateTimePicker from '@react-native-community/datetimepicker';

import Colors from '../../../../../theme/colors';
import DNSButton from '../../../../../components/DNSButton';
import StatusModal from '../../../../../components/Modals/StatusModal';
import CustomLoader from '../../../../../components/CustomLoader';
import {
  useGetTransferTypeNameQuery,
  useGetDropDownGstTypeQuery,
} from '../../../../../redux/services/mainApi/Common/CommonApi';
import { useAppSelector } from '../../../../../redux/hooks';
import { useTopUpService } from '../../../../../redux/services/mainApi/Top_upService/TopupService';
import { TopUpFormData } from '../../../../../redux/services/mainApi/Top_upService/Payload';
import { Poppins } from '../../../../../theme/typography';
import { DropdownSelector } from '../../../../../components/Filters/DropdownSelector';
import { useParentBankAccountDataMutation } from '../../../../../redux/services/mainApi/Top_upService/TopupApi';

// Validation Schema
const getSchema = (isRetailer: boolean) =>
  yup.object().shape({
    amount: yup
      .string()
      .required('Amount is required')
      .test('is-positive', 'Must be a positive number', (val) => Number(val) > 0),
    bankAccountId: yup.number().when('transferTypeId', {
      is: (val: any) => String(val) !== '4',
      then: (schema) => schema.min(1, 'Please select a bank account').required('Please select a bank account'),
      otherwise: (schema) => schema.nullable().notRequired(),
    }),
    transferTypeId: yup.number().min(1, 'Please select transfer type').required('Please select transfer type'),
    paymentDate: yup.date().required('Payment date is required'),
    paymentReferenceNumber: yup.string().when('transferTypeId', {
      is: (val: any) => String(val) !== '4',
      then: (schema) => schema.required('Reference number is required'),
      otherwise: (schema) => schema.nullable().notRequired(),
    }),
    gstTypeId: isRetailer
      ? yup.number().notRequired()
      : yup.number().min(1, 'Please select GST type').required('Please select GST type'),
    remark: yup.string(),
  });

interface AddTopUpModalProps {
  isVisible: boolean;
  onClose: () => void;
  initialData?: any;
}

interface TopUpFormInput extends FieldValues {
  gstTypeId: number;
  gstTypeName: string;
  bankAccountId: number;
  bankName: string;
  amount: string;
  transferTypeId: number;
  transferTypeName: string;
  paymentDate: Date;
  paymentReferenceNumber: string;
  remark: string;
}

const AddTopUpModal: React.FC<AddTopUpModalProps> = ({ isVisible, onClose, initialData }) => {
  const { submitTopUp, isAdding: isSaving, statusModal, closeStatusModal } = useTopUpService();

  const [fetchParentBankAccountData] = useParentBankAccountDataMutation();

  const { data: transferTypeName } = useGetTransferTypeNameQuery();
  const { data: gstType } = useGetDropDownGstTypeQuery();

  const user = useAppSelector((state: any) => state.auth.user);
  const roleId = user?.roleId || 0;
  const userId = user?.id || 0;

  const [showDatePicker, setShowDatePicker] = useState(false);
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null);
  const [dropdownSearch, setDropdownSearch] = useState('');
  const [bankDropdownData, setBankDropdownData] = useState<any[]>([]);

  const isRetailer = user?.role?.toLowerCase() === 'retailer';

  const {
    control,
    handleSubmit,
    formState: { errors },
    reset,
    setValue,
    watch,
  } = useForm<TopUpFormInput>({
    resolver: yupResolver(getSchema(isRetailer)) as any,
    defaultValues: {
      gstTypeId: 0,
      gstTypeName: '',
      bankAccountId: 0,
      bankName: '',
      amount: '',
      transferTypeId: 0,
      transferTypeName: '',
      paymentDate: new Date(),
      paymentReferenceNumber: '',
      remark: 'Top-up Request',
    },
  });

  const shouldShowBankFields = initialData || String(watch('transferTypeId')) !== '4';

  // Fetch Parent Bank Account Data when modal opens
  useEffect(() => {
    const fetchBankAccounts = async () => {
      try {
        const payload = {
          pageNumber: 1,
          pageSize: 100,
          filter: {
            accountNumber: '',
            accountHolderName: '',
            ifscCode: '',
            mobileNumber: '',
            lapuNumber: '',
            email: '',
            recId: 0,
            beneficiaryId: 0,
            userId: 0,
            roleId: 0,
            statusId: 0,
            gstTypeId: 0,
            vendorGstTypeId: 0,
            globalId: 0,
            hubId: 0,
            bankAccountId: 0,
            txnTypeId: 0,
            amountTypeId: 0,
            transferTypeId: 0,
            packageId: 0,
            operatorId: 0,
            operatorTypeId: 0,
            apiId: 0,
            mediumId: 0,
            filterTypeId: 0,
            circleId: 0,
            parentId: 0,
            paymentReferenceNumber: '',
            remark: '',
            dealerId: 0,
            transactionId: 0,
            ourRequestId: '',
            userRequestId: '',
            fromDate: '',
            toDate: '',
            isApproved: 0,
          },
        };

        const response = await fetchParentBankAccountData(payload).unwrap();

        if (response?.success && response?.data) {
          const formattedData = response.data.map((bank: any) => ({
            text: `${bank.bankName} - ${bank.accountNumber}`,
            value: bank.id,
          }));
          setBankDropdownData(formattedData);
        }
      } catch (error) {
        console.error('Error fetching bank accounts:', error);
      }
    };

    if (isVisible) {
      fetchBankAccounts();
    }
  }, [isVisible, fetchParentBankAccountData]);

  // Handle Form Reset / Populate Initial Data
  useEffect(() => {
    if (isVisible) {
      if (initialData) {
        const bankLabel =
          bankDropdownData.find((b: any) => String(b.value) === String(initialData.bankAccountId))?.text || '';
        const transferList = transferTypeName?.data || [];
        const gstList = gstType?.data || [];

        const transferLabel =
          transferList.find((t: any) => String(t.value) === String(initialData.transferTypeId))?.text || '';
        const gstLabel =
          gstList.find((g: any) => String(g.id) === String(initialData.gstTypeId))?.gstName ||
          initialData.gstTypeName ||
          '';

        reset({
          gstTypeId: initialData.gstTypeId || 0,
          gstTypeName: gstLabel,
          bankAccountId: initialData.bankAccountId || 0,
          bankName: bankLabel,
          amount: initialData.amount?.toString() || '',
          transferTypeId: initialData.transferTypeId || 0,
          transferTypeName: transferLabel,
          paymentDate: initialData.paymentDate ? new Date(initialData.paymentDate) : new Date(),
          paymentReferenceNumber: initialData.paymentReferenceNumber || '',
          remark: initialData.remark || 'Top-up Request',
        });
      } else {
        reset({
          gstTypeId: 0,
          gstTypeName: '',
          bankAccountId: 0,
          bankName: '',
          amount: '',
          transferTypeId: 0,
          transferTypeName: '',
          paymentDate: new Date(),
          paymentReferenceNumber: '',
          remark: 'Top-up Request',
        });
      }
    }
  }, [isVisible, initialData, bankDropdownData, transferTypeName, gstType, reset]);

  const onDateChange = (_: any, selectedDate?: Date) => {
    setShowDatePicker(false);
    if (selectedDate) {
      setValue('paymentDate', selectedDate);
    }
  };

  const formatDateForDisplay = (date: Date) => {
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const year = date.getFullYear();
    return `${day}/${month}/${year}`;
  };

  const onSubmit = async (data: TopUpFormInput) => {
    const formData: TopUpFormData = {
      amount: data.amount,
      paymentDate: formatDateForDisplay(data.paymentDate),
      paymentReferenceNumber: data.paymentReferenceNumber,
      remark: data.remark,
      bankAccountId: data.bankAccountId,
      transferTypeId: data.transferTypeId,
      gstTypeId: !isRetailer ? data.gstTypeId : 2,
    };
    await submitTopUp(formData, userId, roleId);
  };

  const handleCloseStatusModal = () => {
    const wasSuccess = statusModal.type === 'success';
    closeStatusModal();
    if (wasSuccess) {
      onClose();
    }
  };

  if (!isVisible) return null;

  return (
    <Modal
      visible={isVisible}
      animationType="slide"
      transparent={true}
      onRequestClose={onClose}
    >
      <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
        <View style={styles.modalOverlay}>
          <KeyboardAvoidingView
            behavior={Platform.OS === 'ios' ? 'padding' : undefined}
            style={styles.keyboardView}
          >
            <SafeAreaView style={styles.sheetContainer}>
              {/* Header */}
              <View style={styles.header}>
                <Text style={styles.headerTitle}>
                  {initialData ? 'Update Top-up' : 'Add Top-up Request'}
                </Text>
                <TouchableOpacity onPress={onClose} style={styles.closeButton}>
                  <MaterialIcons name="close" size={24} color={Colors.textDark} />
                </TouchableOpacity>
              </View>

              {/* Form Content */}
              <ScrollView style={styles.form} showsVerticalScrollIndicator={false}>
                {/* Amount */}
                <View style={styles.inputGroup}>
                  <Text style={styles.label}>Amount</Text>
                  <Controller
                    control={control}
                    name="amount"
                    render={({ field: { onChange, value } }) => (
                      <TextInput
                        style={[styles.input, errors.amount && styles.inputError]}
                        placeholder="Enter amount"
                        keyboardType="numeric"
                        value={value}
                        onChangeText={onChange}
                        placeholderTextColor={Colors.textMuted}
                      />
                    )}
                  />
                  {errors.amount && <Text style={styles.errorText}>{errors.amount.message}</Text>}
                </View>

                {/* Transfer Type */}
                <View style={styles.inputGroup}>
                  <DropdownSelector
                    label="Transfer Type"
                    value={watch('transferTypeId') || ''}
                    options={(transferTypeName?.data || []).filter(
                      (type: any) => String(type.value) !== '4'
                    )}
                    onSelect={(val: any) => {
                      const type = (transferTypeName?.data || []).find(
                        (t: any) => String(t.value) === String(val)
                      );
                      if (type) {
                        setValue('transferTypeName', type.text);
                        setValue('transferTypeId', type.value, { shouldValidate: true });
                      }
                      setActiveDropdown(null);
                    }}
                    dropdownId="transferType"
                    placeholder="Select type"
                    activeDropdown={activeDropdown}
                    setActiveDropdown={setActiveDropdown}
                    dropdownSearch={dropdownSearch}
                    setDropdownSearch={setDropdownSearch}
                  />
                  {errors.transferTypeId && (
                    <Text style={styles.errorText}>{errors.transferTypeId.message}</Text>
                  )}
                </View>

                {/* Bank Selection */}
                {shouldShowBankFields && (
                  <View style={styles.inputGroup}>
                    <DropdownSelector
                      label="Select Bank Account"
                      value={watch('bankAccountId') || ''}
                      options={bankDropdownData || []}
                      onSelect={(val: any) => {
                        const bank = (bankDropdownData || []).find(
                          (b: any) => String(b.value) === String(val)
                        );
                        if (bank) {
                          setValue('bankName', bank.text);
                          setValue('bankAccountId', bank.value, { shouldValidate: true });
                        }
                        setActiveDropdown(null);
                      }}
                      dropdownId="bank"
                      placeholder="Choose bank account"
                      activeDropdown={activeDropdown}
                      setActiveDropdown={setActiveDropdown}
                      dropdownSearch={dropdownSearch}
                      setDropdownSearch={setDropdownSearch}
                    />
                    {errors.bankAccountId && (
                      <Text style={styles.errorText}>{errors.bankAccountId.message}</Text>
                    )}
                  </View>
                )}

                {/* GST Type */}
                {!isRetailer && (
                  <View style={styles.inputGroup}>
                    <DropdownSelector
                      label="GST Type"
                      value={watch('gstTypeId') || ''}
                      options={(gstType?.data || [])
                        .filter((t: any) => String(t.id) !== '3')
                        .map((t: any) => ({ text: t.gstName, value: t.id }))}
                      onSelect={(val: any) => {
                        const type = (gstType?.data || []).find(
                          (t: any) => String(t.id) === String(val)
                        );
                        if (type) {
                          setValue('gstTypeName', type.gstName);
                          setValue('gstTypeId', type.id, { shouldValidate: true });
                        }
                        setActiveDropdown(null);
                      }}
                      dropdownId="gstType"
                      placeholder="Select type"
                      activeDropdown={activeDropdown}
                      setActiveDropdown={setActiveDropdown}
                      dropdownSearch={dropdownSearch}
                      setDropdownSearch={setDropdownSearch}
                    />
                    {errors.gstTypeId && (
                      <Text style={styles.errorText}>{errors.gstTypeId.message}</Text>
                    )}
                  </View>
                )}

                {/* Payment Date */}
                <View style={styles.inputGroup}>
                  <Text style={styles.label}>Payment Date</Text>
                  <TouchableOpacity
                    activeOpacity={0.7}
                    style={[styles.dropdownTrigger, errors.paymentDate && styles.inputError]}
                    onPress={() => setShowDatePicker(true)}
                  >
                    <Text style={styles.dropdownText}>
                      {watch('paymentDate')
                        ? formatDateForDisplay(watch('paymentDate'))
                        : 'Select Date'}
                    </Text>
                    <MaterialCommunityIcons name="calendar" size={20} color="#6B7280" />
                  </TouchableOpacity>
                  {errors.paymentDate && (
                    <Text style={styles.errorText}>{errors.paymentDate.message}</Text>
                  )}

                  {showDatePicker && (
                    <DateTimePicker
                      value={watch('paymentDate') || new Date()}
                      mode="date"
                      display={Platform.OS === 'ios' ? 'spinner' : 'default'}
                      onChange={onDateChange}
                      maximumDate={new Date()}
                    />
                  )}
                </View>

                {/* Reference Number */}
                {shouldShowBankFields && (
                  <View style={styles.inputGroup}>
                    <Text style={styles.label}>UTR / Reference Number</Text>
                    <Controller
                      control={control}
                      name="paymentReferenceNumber"
                      render={({ field: { onChange, value } }) => (
                        <TextInput
                          style={[styles.input, errors.paymentReferenceNumber && styles.inputError]}
                          placeholder="Enter reference number"
                          value={value}
                          onChangeText={onChange}
                          placeholderTextColor="#9CA3AF"
                        />
                      )}
                    />
                    {errors.paymentReferenceNumber && (
                      <Text style={styles.errorText}>{errors.paymentReferenceNumber.message}</Text>
                    )}
                  </View>
                )}

                {/* Remark */}
                <View style={styles.inputGroup}>
                  <Text style={styles.label}>Remark</Text>
                  <Controller
                    control={control}
                    name="remark"
                    render={({ field: { onChange, value } }) => (
                      <TextInput
                        style={[styles.input, { height: 60, textAlignVertical: 'top' }]}
                        placeholder="Enter remark"
                        multiline
                        numberOfLines={2}
                        value={value}
                        onChangeText={onChange}
                        placeholderTextColor="#9CA3AF"
                      />
                    )}
                  />
                </View>

                <DNSButton
                  title={initialData ? 'Update Request' : 'Submit Request'}
                  onPress={handleSubmit(onSubmit)}
                  loading={isSaving}
                  style={{ marginTop: 10, marginBottom: 30 }}
                />
              </ScrollView>
            </SafeAreaView>
          </KeyboardAvoidingView>
        </View>
      </TouchableWithoutFeedback>

      {/* Status Modal & Loader */}
      <StatusModal
        isVisible={statusModal.isVisible}
        type={statusModal.type}
        title={statusModal.title}
        message={statusModal.message}
        onClose={handleCloseStatusModal}
      />
      <CustomLoader visible={isSaving} message="Submitting Request..." />
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.4)',
    justifyContent: 'flex-end',
  },
  keyboardView: {
    justifyContent: 'flex-end',
  },
  sheetContainer: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    maxHeight: '90%',
    overflow: 'hidden',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
    backgroundColor: '#FFFFFF',
  },
  headerTitle: {
    fontSize: 16,
    fontFamily: Poppins.bold,
    fontWeight: '700',
    color: Colors.textDark,
  },
  closeButton: {
    padding: 4,
  },
  form: {
    padding: 20,
  },
  inputGroup: {
    marginBottom: 20,
  },
  label: {
    fontSize: 16,
    fontFamily: Poppins.semiBold,
    fontWeight: '600',
    color: Colors.textDark,
    marginBottom: 8,
  },
  input: {
    backgroundColor: '#F9FAFB',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: Platform.OS === 'ios' ? 14 : 10,
    fontSize: 16,
    fontFamily: Poppins.regular,
    color: Colors.textDark,
  },
  inputError: {
    borderColor: Colors.error,
  },
  errorText: {
    color: Colors.error,
    fontSize: 12,
    fontFamily: Poppins.regular,
    marginTop: 4,
  },
  dropdownTrigger: {
    backgroundColor: '#F9FAFB',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: Platform.OS === 'ios' ? 14 : 12,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  dropdownText: {
    fontSize: 16,
    fontFamily: Poppins.regular,
    color: Colors.textDark,
  },
});

export default AddTopUpModal;