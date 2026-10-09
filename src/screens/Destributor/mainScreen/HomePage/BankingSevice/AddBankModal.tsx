import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  ScrollView,
} from 'react-native';
import { useForm, Controller } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import Colors from '../../../../../theme/colors';
import DNSButton from '../../../../../components/DNSButton';
import StatusModal from '../../../../../components/Modals/StatusModal';
import CustomLoader from '../../../../../components/CustomLoader';
import { useBankService } from '../../../../../redux/services/mainApi/bank/Bankservice';
import { BankFormData } from '../../../../../redux/services/mainApi/bank/Payload';
import { Poppins } from '../../../../../theme/typography';
import { DropdownSelector } from '../../../../../components/Filters/DropdownSelector';

// Validation Schema
const schema = yup.object().shape({
  bankName: yup.string().required('Bank name is required'),
  accountNumber: yup.string().required('Account number is required').min(9, 'Too short'),
  ifscCode: yup.string().required('IFSC code is required'),
  accountHolderName: yup.string().required('Account holder name is required'),
  accountType: yup.string().required('Please select an account type'),
  branchName: yup.string().required('Branch name is required'),
  branchAddress: yup.string().required('Branch address is required'),
});

interface AddBankModalProps {
  isVisible: boolean;
  onClose: () => void;
  initialData?: any;
}

// BankFormData type is now imported from Payload.ts

const AddBankModal: React.FC<AddBankModalProps> = ({ isVisible, onClose, initialData }) => {
  const { submitBank, isLoading, bankDropdownList, accountTypeList, statusModal, closeStatusModal } = useBankService();
  console.log("bankDropdownList----->", bankDropdownList);
  const {
    control,
    handleSubmit,
    formState: { errors },
    reset,
    setValue,
    watch,
  } = useForm<BankFormData>({
    resolver: yupResolver(schema) as any,
    defaultValues: {
      bankAccountId: 0,
      bankName: '',
      accountNumber: '',
      ifscCode: '',
      accountHolderName: '',
      accountTypeId: 0,
      branchName: '',
      branchAddress: '',
      upiAddress: '',
      remark: '',
    },
  });

  // Populate form for editing
  React.useEffect(() => {
    if (isVisible) {
      if (initialData) {
        // initialData already contains bankName and accountType from the API
        const bankId = initialData.bankId || initialData.bankAccountId || 0;
        reset({
          bankAccountId: bankId,
          bankName: initialData.bankName || '',
          accountNumber: initialData.accountNumber,
          ifscCode: initialData.ifscCode,
          accountHolderName: initialData.accountHolderName,
          accountTypeId: initialData.accountTypeId,
          accountType: initialData.accountType || '',
          branchName: initialData.branchName,
          branchAddress: initialData.branchAddress,
          upiAddress: initialData.upiAddress,
          remark: initialData.remark,
        });
      } else {
        reset({
          bankAccountId: 0,
          bankName: '',
          accountNumber: '',
          ifscCode: '',
          accountHolderName: '',
          accountTypeId: 0,
          accountType: '',
          branchName: '',
          branchAddress: '',
          upiAddress: '',
          remark: '',
        });
      }
    }
  }, [initialData, isVisible, reset, bankDropdownList, accountTypeList]);

  const [activeDropdown, setActiveDropdown] = React.useState<string | null>(null);
  const [dropdownSearch, setDropdownSearch] = React.useState('');
  const selectedBank = watch('bankName');
  const selectedType = watch('accountType');

  const onSubmit = async (data: BankFormData) => {
    const success = await submitBank(data, initialData);
    if (success) {
      reset();
    }
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
    <View style={styles.modalOverlay}>
      <View style={styles.modalContainer}>
        <View style={styles.header}>
          <Text style={styles.headerTitle}>{initialData ? 'Edit Banking ' : 'Add Banking '}</Text>
          <TouchableOpacity onPress={onClose}>
            <MaterialIcons name="close" size={24} color={Colors.textDark} />
          </TouchableOpacity>
        </View>

        <ScrollView style={styles.formContent} showsVerticalScrollIndicator={false}>
          {/* Bank Name Dropdown */}
          <View style={styles.inputWrapper}>
            <DropdownSelector
              label="Bank Name"
              value={watch('bankAccountId') || ''}
              displayText={watch('bankName') || ''}
              options={bankDropdownList || []}
              onSelect={(val: any) => {
                const bank = bankDropdownList?.find((b: any) => b.value === val);
                if (bank) {
                  setValue('bankName', bank.text, { shouldValidate: true });
                  setValue('bankAccountId', bank.value);
                }
                setActiveDropdown(null);
              }}
              dropdownId="bankName"
              placeholder="Select bank"
              activeDropdown={activeDropdown}
              setActiveDropdown={setActiveDropdown}
              dropdownSearch={dropdownSearch}
              setDropdownSearch={setDropdownSearch}
            />
            {errors.bankName && <Text style={styles.errorText}>{errors.bankName.message}</Text>}
          </View>

          {/* Account Type Dropdown */}
          <View style={styles.inputWrapper}>
            <DropdownSelector
              label="Account Type"
              value={watch('accountTypeId') || ''}
              displayText={watch('accountType') || ''}
              options={accountTypeList || []}
              onSelect={(val: any) => {
                const type = accountTypeList?.find((t: any) => t.value === val);
                if (type) {
                  setValue('accountType', type.text, { shouldValidate: true });
                  setValue('accountTypeId', type.value);
                }
                setActiveDropdown(null);
              }}
              dropdownId="accountType"
              placeholder="Select account type"
              activeDropdown={activeDropdown}
              setActiveDropdown={setActiveDropdown}
              dropdownSearch={dropdownSearch}
              setDropdownSearch={setDropdownSearch}
            />
            {errors.accountType && <Text style={styles.errorText}>{errors.accountType.message}</Text>}
          </View>

          {/* Account Holder Name */}
          <View style={styles.inputWrapper}>
            <Text style={styles.label}>Account Holder Name</Text>
            <Controller
              control={control}
              name="accountHolderName"
              render={({ field: { onChange, onBlur, value } }) => (
                <TextInput
                  style={[styles.input, errors.accountHolderName && styles.inputError]}
                  placeholder="Enter holder name"
                  onBlur={onBlur}
                  onChangeText={onChange}
                  value={value}
                />
              )}
            />
            {errors.accountHolderName && <Text style={styles.errorText}>{errors.accountHolderName.message}</Text>}
          </View>

          {/* Account Number */}
          <View style={styles.inputWrapper}>
            <Text style={styles.label}>Account Number</Text>
            <Controller
              control={control}
              name="accountNumber"
              render={({ field: { onChange, onBlur, value } }) => (
                <TextInput
                  style={[styles.input, errors.accountNumber && styles.inputError]}
                  placeholder="Enter account number"
                  keyboardType="numeric"
                  onBlur={onBlur}
                  onChangeText={onChange}
                  value={value}
                  placeholderTextColor={Colors.textMuted}
                />
              )}
            />
            {errors.accountNumber && <Text style={styles.errorText}>{errors.accountNumber.message}</Text>}
          </View>

          {/* IFSC Code */}
          <View style={styles.inputWrapper}>
            <Text style={styles.label}>IFSC Code</Text>
            <Controller
              control={control}
              name="ifscCode"
              render={({ field: { onChange, onBlur, value } }) => (
                <TextInput
                  style={[styles.input, errors.ifscCode && styles.inputError]}
                  placeholder="e.g. SBIN0001234"
                  autoCapitalize="characters"
                  onBlur={onBlur}
                  onChangeText={onChange}
                  value={value}
                  placeholderTextColor={Colors.textMuted}
                />
              )}
            />
            {errors.ifscCode && <Text style={styles.errorText}>{errors.ifscCode.message}</Text>}
          </View>

          {/* Branch Name */}
          <View style={styles.inputWrapper}>
            <Text style={styles.label}>Branch Name</Text>
            <Controller
              control={control}
              name="branchName"
              render={({ field: { onChange, onBlur, value } }) => (
                <TextInput
                  style={[styles.input, errors.branchName && styles.inputError]}
                  placeholder="Enter branch name"
                  onBlur={onBlur}
                  onChangeText={onChange}
                  value={value}
                  placeholderTextColor={Colors.textMuted}
                />
              )}
            />
            {errors.branchName && <Text style={styles.errorText}>{errors.branchName.message}</Text>}
          </View>

          {/* Branch Address */}
          <View style={styles.inputWrapper}>
            <Text style={styles.label}>Branch Address</Text>
            <Controller
              control={control}
              name="branchAddress"
              render={({ field: { onChange, onBlur, value } }) => (
                <TextInput
                  style={[styles.input, errors.branchAddress && styles.inputError]}
                  placeholder="Enter branch address"
                  onBlur={onBlur}
                  onChangeText={onChange}
                  value={value}
                  placeholderTextColor={Colors.textMuted}
                />
              )}
            />
            {errors.branchAddress && <Text style={styles.errorText}>{errors.branchAddress.message}</Text>}
          </View>

          {/* UPI Address */}
          <View style={styles.inputWrapper}>
            <Text style={styles.label}>UPI ID (Optional)</Text>
            <Controller
              control={control}
              name="upiAddress"
              render={({ field: { onChange, onBlur, value } }) => (
                <TextInput
                  style={[styles.input]}
                  placeholder="e.g. name@upi"
                  onBlur={onBlur}
                  onChangeText={onChange}
                  value={value}
                  placeholderTextColor={Colors.textMuted}
                />
              )}
            />
          </View>

          {/* Remark */}
          <View style={styles.inputWrapper}>
            <Text style={styles.label}>Remark</Text>
            <Controller
              control={control}
              name="remark"
              render={({ field: { onChange, onBlur, value } }) => (
                <TextInput
                  style={[styles.input]}
                  placeholder="Enter remark"
                  onBlur={onBlur}
                  onChangeText={onChange}
                  value={value}
                  placeholderTextColor={Colors.textMuted}
                />
              )}
            />
          </View>

          {/* Block Amount */}



          <DNSButton
            title={initialData ? 'Update Bank' : 'Add Bank'}
            onPress={handleSubmit(onSubmit)}
            loading={isLoading}
            disabled={isLoading}
            style={{ marginTop: 10, marginBottom: 20 }}
          />
        </ScrollView>
      </View>

      <StatusModal
        isVisible={statusModal.isVisible}
        type={statusModal.type}
        title={statusModal.title}
        message={statusModal.message}
        onClose={handleCloseStatusModal}
      />

      <CustomLoader visible={isLoading} message="Saving Bank Details..." />
    </View>
  );
};

const styles = StyleSheet.create({
  modalOverlay: {
    ...StyleSheet.absoluteFill,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    zIndex: 9999,
  },
  modalContainer: {
    width: '100%',
    backgroundColor: 'white',
    borderRadius: 20,
    padding: 24,
    maxHeight: '80%',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  headerTitle: {
    fontSize: 20,
    fontFamily: Poppins.bold,
    fontWeight: 'bold',
    color: Colors.textDark,
  },
  formContent: {
    marginBottom: 10,
  },
  inputWrapper: {
    marginBottom: 16,
  },
  label: {
    fontSize: 16,
    fontFamily: Poppins.semiBold,
    fontWeight: '600',
    color: Colors.textBody,
    marginBottom: 8,
  },
  input: {
    backgroundColor: '#F9FAFB',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
    fontFamily: Poppins.regular,
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
    paddingVertical: 12,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  dropdownText: {
    fontSize: 16,
    fontFamily: Poppins.regular,
  },
  dropdownMenu: {
    backgroundColor: 'white',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 12,
    marginTop: 4,
    zIndex: 1000,
  },
  dropdownItem: {
    padding: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  dropdownItemText: {
    fontSize: 16,
    fontFamily: Poppins.regular,
    color: Colors.textDark,
  },
});

export default AddBankModal;
