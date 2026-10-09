import React, { useEffect } from 'react';
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
import { useRetailerService } from '../../../../../redux/services/mainApi/Retailer/RetailerService';
import { Poppins } from '../../../../../theme/typography';
import { DropdownSelector } from '../../../../../components/Filters/DropdownSelector';

// Validation Schema: Password is optional if initialData exists (Edit mode)
const schema = yup.object().shape({
  retailerName: yup.string().required('Retailer name is required'),
  shopName: yup.string().required('Shop name is required'),
  mobileNumber: yup.string().required('Mobile number is required').matches(/^[0-9]{10}$/, 'Must be 10 digits'),
  email: yup.string().email('Invalid email').required('Email is required'),
  password: yup.string().when('$isEdit', {
    is: true,
    then: (sch) => sch.notRequired(),
    otherwise: (sch) => sch.required('Password is required').min(6, 'Min 6 characters'),
  }),
  address: yup.string().required('Address is required'),
  stateId: yup.number().min(1, 'Please select a state').required('Please select a state'),
});

interface AddRetailerModalProps {
  isVisible: boolean;
  onClose: () => void;
  initialData?: any;
}

const AddRetailerModal: React.FC<AddRetailerModalProps> = ({ isVisible, onClose, initialData }) => {
  const isEditMode = !!initialData;

  const { submitRetailer, isLoading, stateList, statusModal, closeStatusModal } = useRetailerService();

  const [showPassword, setShowPassword] = React.useState(false);

  const {
    control,
    handleSubmit,
    formState: { errors },
    reset,
    setValue,
    watch,
  } = useForm({
    resolver: yupResolver(schema),
    context: { isEdit: isEditMode },
    defaultValues: {
      retailerName: '',
      shopName: '',
      mobileNumber: '',
      email: '',
      password: '',
      address: '',
      stateId: 0,
    },
  });

  useEffect(() => {
    if (isVisible) {
      if (initialData) {
        reset({
          retailerName: initialData.accountHolderName || initialData.fullName || '',
          shopName: initialData.shopName || '',
          mobileNumber: initialData.mobileNumber || '',
          email: initialData.email || '',
          password: '',
          address: initialData.address || '',
          stateId: initialData.stateId || 0,
        });
      } else {
        reset({
          retailerName: '',
          shopName: '',
          mobileNumber: '',
          email: '',
          password: '',
          address: '',
          stateId: 0,
        });
      }
    }
  }, [initialData, isVisible, reset]);

  const [activeDropdown, setActiveDropdown] = React.useState<string | null>(null);
  const [dropdownSearch, setDropdownSearch] = React.useState('');
  const selectedStateId = watch('stateId');

  const onSubmit = async (data: any) => {
    await submitRetailer(data, initialData);
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
          <Text style={styles.headerTitle}>{isEditMode ? 'Update Retailer' : 'Add New Retailer'}</Text>
          <TouchableOpacity onPress={onClose}>
            <MaterialIcons name="close" size={24} color={Colors.textDark} />
          </TouchableOpacity>
        </View>

        <ScrollView style={styles.formContent} showsVerticalScrollIndicator={false}>
          {/* Retailer Name */}
          <View style={styles.inputWrapper}>
            <Text style={styles.label}>Retailer Name</Text>
            <Controller
              control={control}
              name="retailerName"
              render={({ field: { onChange, onBlur, value } }) => (
                <TextInput
                  style={[styles.input, errors.retailerName && styles.inputError]}
                  placeholder="Enter retailer name"
                  onBlur={onBlur}
                  onChangeText={onChange}
                  value={value}
                  placeholderTextColor={Colors.textMuted}
                />
              )}
            />
            {errors.retailerName && <Text style={styles.errorText}>{errors.retailerName.message}</Text>}
          </View>

          {/* Shop Name */}
          <View style={styles.inputWrapper}>
            <Text style={styles.label}>Shop Name</Text>
            <Controller
              control={control}
              name="shopName"
              render={({ field: { onChange, onBlur, value } }) => (
                <TextInput
                  style={[styles.input, errors.shopName && styles.inputError]}
                  placeholder="Enter shop name"
                  onBlur={onBlur}
                  onChangeText={onChange}
                  value={value}
                  placeholderTextColor={Colors.textMuted}
                />
              )}
            />
            {errors.shopName && <Text style={styles.errorText}>{errors.shopName.message}</Text>}
          </View>

          {/* State Dropdown */}
          <View style={styles.inputWrapper}>
            <DropdownSelector
              label="Select State"
              value={selectedStateId}
              options={stateList?.map((s: any) => ({ text: s.stateName, value: s.id })) || []}
              onSelect={(val: any) => {
                setValue('stateId', val, { shouldValidate: true });
                setActiveDropdown(null);
              }}
              dropdownId="state"
              placeholder="Choose State"
              activeDropdown={activeDropdown}
              setActiveDropdown={setActiveDropdown}
              dropdownSearch={dropdownSearch}
              setDropdownSearch={setDropdownSearch}
            />
            {errors.stateId && <Text style={styles.errorText}>{errors.stateId.message}</Text>}
          </View>

          {/* Mobile Number */}
          <View style={styles.inputWrapper}>
            <Text style={styles.label}>Mobile Number</Text>
            <Controller
              control={control}
              name="mobileNumber"
              render={({ field: { onChange, onBlur, value } }) => (
                <TextInput
                  style={[styles.input, errors.mobileNumber && styles.inputError]}
                  placeholder="Enter 10 digit mobile number"
                  keyboardType="numeric"
                  maxLength={10}
                  onBlur={onBlur}
                  onChangeText={onChange}
                  value={value}
                  placeholderTextColor={Colors.textMuted}
                />
              )}
            />
          </View>

          {/* Email */}
          <View style={styles.inputWrapper}>
            <Text style={styles.label}>Email Address</Text>
            <Controller
              control={control}
              name="email"
              render={({ field: { onChange, onBlur, value } }) => (
                <TextInput
                  style={[styles.input, errors.email && styles.inputError]}
                  placeholder="Enter email address"
                  keyboardType="email-address"
                  autoCapitalize="none"
                  onBlur={onBlur}
                  onChangeText={onChange}
                  value={value}
                  placeholderTextColor={Colors.textMuted}
                />
              )}
            />
          </View>

          {/* Password - Helper text added for Edit mode */}
          {
            !isEditMode && (
              <View style={styles.inputWrapper}>
                <Text style={styles.label}>Password {isEditMode && '(Leave blank to keep current)'}</Text>
                <Controller
                  control={control}
                  name="password"
                  render={({ field: { onChange, onBlur, value } }) => (
                    <View style={styles.passwordInputContainer}>
                      <TextInput
                        style={[styles.inputp, errors.password && styles.inputError]}
                        placeholder={isEditMode ? "Enter new password" : "Create password"}
                        secureTextEntry={!showPassword}
                        onBlur={onBlur}
                        onChangeText={onChange}
                        value={value}
                        placeholderTextColor={Colors.textMuted}
                      />
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
                    </View>
                  )}
                />
              </View>
            )
          }


          {/* Address */}
          <View style={styles.inputWrapper}>
            <Text style={styles.label}>Address</Text>
            <Controller
              control={control}
              name="address"
              render={({ field: { onChange, onBlur, value } }) => (
                <TextInput
                  style={[styles.input, styles.textArea, errors.address && styles.inputError]}
                  placeholder="Enter full address"
                  multiline
                  onBlur={onBlur}
                  onChangeText={onChange}
                  value={value}
                  placeholderTextColor={Colors.textMuted}
                />
              )}
            />
          </View>

          <DNSButton
            title={isEditMode ? "Update Details" : "Register Retailer"}
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

      <CustomLoader visible={isLoading} message="Saving Retailer..." />
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
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
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
    color: Colors.textDark,
    // width: '100%'
  },
  inputp: {
    backgroundColor: '#F9FAFB',

    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
    fontFamily: Poppins.regular,
    color: Colors.textDark,
    width: '80%'
  },
  passwordInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#F9FAFB',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 12,
  },
  eyeIcon: {
    padding: 12,
  },
  textArea: {
    height: 80,
    textAlignVertical: 'top',
    paddingTop: 12,
  },
  inputError: {
    borderColor: Colors.error,
  },
  errorText: {
    color: Colors.error,
    fontSize: 12,
    fontFamily: Poppins.regular,
    marginTop: 4,
    marginLeft: 4,
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
    color: Colors.textDark,
  },
  dropdownMenu: {
    backgroundColor: 'white',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 12,
    marginTop: 4,
    overflow: 'hidden',
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
    color: Colors.textBody
  }
});

export default AddRetailerModal;
