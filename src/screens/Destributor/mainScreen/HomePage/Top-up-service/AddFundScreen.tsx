import React, { useEffect, useMemo, useState } from 'react';
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
import DateTimePicker from '@react-native-community/datetimepicker';

import Colors from '../../../../../theme/colors';
import DNSButton from '../../../../../components/DNSButton';
import StatusModal from '../../../../../components/Modals/StatusModal';
import CustomLoader from '../../../../../components/CustomLoader';
import { Poppins } from '../../../../../theme/typography';
import { DropdownSelector } from '../../../../../components/Filters/DropdownSelector';
import { formatDate } from '../../../../../components/DATE/Dateformat';

import { useTopUpService } from '../../../../../redux/services/mainApi/Top_upService/TopupService';
import {
  useGetTransferTypeNameQuery,
  useGetdownlineuserListQuery,
} from '../../../../../redux/services/mainApi/Common/CommonApi';
import { useAppSelector } from '../../../../../redux/hooks';
import { useGetBankAccountListMutation } from '../../../../../redux/services/mainApi/bank/BankApi';
import { buildBankFilterPayload } from '../../../../../redux/services/mainApi/bank/Payload';

interface AddFundModalProps {
  isVisible?: boolean;
  onClose?: () => void;
  [key: string]: any;
}

const AddFundScreen: React.FC<AddFundModalProps> = ({ isVisible = true, onClose = () => {} }) => {
  const user = useAppSelector((state: any) => state.auth.user);
  const { submitFundTransfer, isLoading: isSubmitting, statusModal, closeStatusModal } = useTopUpService();

  // API Hooks
  const [getBankAccountList, { data: bankData }] = useGetBankAccountListMutation();
  const { data: transferTypeData } = useGetTransferTypeNameQuery(undefined, { skip: !isVisible });
  const { data: retailerData } = useGetdownlineuserListQuery(undefined, { skip: !isVisible });

  // Form State
  const [retailer, setRetailer] = useState({ id: '', name: '' });
  const [bank, setBank] = useState({ id: '', name: '' });
  const [transferType, setTransferType] = useState({ id: '', name: '' });
  const [amount, setAmount] = useState('');
  const [utr, setUtr] = useState('');
  const [paymentDate, setPaymentDate] = useState(new Date());
  const [remark, setRemark] = useState({ id: '', name: '' });

  const [showDatePicker, setShowDatePicker] = useState(false);
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null);
  const [dropdownSearch, setDropdownSearch] = useState('');

  useEffect(() => {
    if (!isVisible) return;

    const payload = buildBankFilterPayload(1, 100, {});
    getBankAccountList(payload);
  }, [getBankAccountList, isVisible]);

  const bankOptions = useMemo(() => {
    const list = Array.isArray(bankData?.data) ? bankData.data : [];

    return list.map((item: any) => {
      const value = item.value ?? item.bankAccountId ?? item.id ?? item.recId;
      const bankName = item.text ?? item.bankName ?? item.bank ?? item.name ?? 'Bank Account';
      const accountNumber = item.accountNumber ? ` - ${item.accountNumber}` : '';

      return {
        ...item,
        value,
        text: `${bankName}${accountNumber}`,
      };
    }).filter((item: any) => item.value !== undefined && item.value !== null);
  }, [bankData?.data]);

  const onDateChange = (_: any, selectedDate?: Date) => {
    setShowDatePicker(false);
    if (selectedDate) {
      setPaymentDate(selectedDate);
    }
  };

  const handleSubmit = async () => {
    if (
      !retailer.id ||
      (String(transferType.id) !== '4' && !bank.id) ||
      !transferType.id ||
      !amount ||
      (String(transferType.id) !== '4' && !utr)
    ) {
      return;
    }

    const formData = {
      retailerId: Number(retailer.id),
      bankId: String(transferType.id) === '4' ? 0 : Number(bank.id),
      transferTypeId: Number(transferType.id),
      amount,
      utr,
      paymentDate: formatDate(paymentDate),
      remark: remark.name,
    };

    const success = await submitFundTransfer(formData, user?.id || 0);
    if (success) {
      // Optional callback logic after submission
    }
  };

  const handleCloseStatusModal = () => {
    const wasSuccess = statusModal.type === 'success';
    closeStatusModal();
    if (wasSuccess) {
      onClose();
    }
  };

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
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            style={styles.keyboardView}
          >
            <SafeAreaView style={styles.sheetContainer}>
              {/* Header */}
              <View style={styles.header}>
                <Text style={styles.headerTitle}>Add Fund Transfer</Text>
                <TouchableOpacity onPress={onClose} style={styles.closeButton}>
                  <MaterialIcons name="close" size={24} color={Colors.textDark} />
                </TouchableOpacity>
              </View>

              {/* Form Body */}
              <ScrollView style={styles.form} showsVerticalScrollIndicator={false}>
                {/* Retailer Selection */}
                <View style={styles.inputGroup}>
                  <DropdownSelector
                    label="Select Retailer"
                    value={retailer.id}
                    options={retailerData?.data || []}
                    onSelect={(val: any) => {
                      const selected = (retailerData?.data || []).find((opt: any) => opt.value === val);
                      if (selected) setRetailer({ id: selected.value, name: selected.text });
                      setActiveDropdown(null);
                    }}
                    dropdownId="retailer"
                    placeholder="Choose retailer"
                    activeDropdown={activeDropdown}
                    setActiveDropdown={setActiveDropdown}
                    dropdownSearch={dropdownSearch}
                    setDropdownSearch={setDropdownSearch}
                  />
                </View>

                {/* Transfer Type */}
                <View style={styles.inputGroup}>
                  <DropdownSelector
                    label="Transfer Type"
                    value={transferType.id}
                    options={(transferTypeData?.data || []).filter((type: any) => String(type.value) !== '4')}
                    onSelect={(val: any) => {
                      const selected = (transferTypeData?.data || []).find((opt: any) => opt.value === val);
                      if (selected) setTransferType({ id: selected.value, name: selected.text });
                      setActiveDropdown(null);
                    }}
                    dropdownId="transferType"
                    placeholder="Select payment mode"
                    activeDropdown={activeDropdown}
                    setActiveDropdown={setActiveDropdown}
                    dropdownSearch={dropdownSearch}
                    setDropdownSearch={setDropdownSearch}
                  />
                </View>

                {/* Bank Selection */}
                {String(transferType.id) !== '4' && (
                  <View style={styles.inputGroup}>
                    <DropdownSelector
                      label="Select Bank Account"
                      value={bank.id}
                      options={bankOptions}
                      onSelect={(val: any) => {
                        const selected = bankOptions.find((opt: any) => String(opt.value) === String(val));
                        if (selected) setBank({ id: selected.value, name: selected.text });
                        setActiveDropdown(null);
                      }}
                      dropdownId="bank"
                      placeholder="Choose bank account"
                      activeDropdown={activeDropdown}
                      setActiveDropdown={setActiveDropdown}
                      dropdownSearch={dropdownSearch}
                      setDropdownSearch={setDropdownSearch}
                    />
                  </View>
                )}

                {/* Amount */}
                <View style={styles.inputGroup}>
                  <Text style={styles.label}>Amount</Text>
                  <TextInput
                    style={styles.input}
                    placeholder="Enter amount"
                    keyboardType="numeric"
                    value={amount}
                    onChangeText={setAmount}
                    placeholderTextColor={Colors.textMuted}
                  />
                </View>

                {/* Payment Date */}
                <View style={styles.inputGroup}>
                  <Text style={styles.label}>Payment Date</Text>
                  <TouchableOpacity
                    activeOpacity={0.7}
                    style={styles.dropdownTrigger}
                    onPress={() => setShowDatePicker(true)}
                  >
                    <Text style={styles.dropdownText}>{formatDate(paymentDate)}</Text>
                    <MaterialCommunityIcons name="calendar" size={20} color="#6B7280" />
                  </TouchableOpacity>
                  {showDatePicker && (
                    <DateTimePicker
                      value={paymentDate}
                      mode="date"
                      display={Platform.OS === 'ios' ? 'spinner' : 'default'}
                      onChange={onDateChange}
                      maximumDate={new Date()}
                    />
                  )}
                </View>

                {/* UTR / Reference */}
                {String(transferType.id) !== '4' && (
                  <View style={styles.inputGroup}>
                    <Text style={styles.label}>UTR / Reference Number</Text>
                    <TextInput
                      style={styles.input}
                      placeholder="Enter reference number"
                      value={utr}
                      onChangeText={setUtr}
                      placeholderTextColor={Colors.textMuted}
                    />
                  </View>
                )}

                {/* Remark */}
                <View style={styles.inputGroup}>
                  <Text style={styles.label}>Remark</Text>
                  <TextInput
                    style={[styles.input, { height: 60, textAlignVertical: 'top' }]}
                    placeholder="Enter remark"
                    multiline
                    numberOfLines={2}
                    value={remark.name}
                    onChangeText={(text) => setRemark({ ...remark, name: text })}
                    placeholderTextColor={Colors.textMuted}
                  />
                </View>

                <DNSButton
                  title="Submit Request"
                  onPress={handleSubmit}
                  loading={isSubmitting}
                  style={{ marginTop: 10, marginBottom: 30 }}
                />
              </ScrollView>
            </SafeAreaView>
          </KeyboardAvoidingView>
        </View>
      </TouchableWithoutFeedback>

      {/* Status Modal & Global Loader */}
      <StatusModal
        isVisible={statusModal.isVisible}
        type={statusModal.type}
        title={statusModal.title}
        message={statusModal.message}
        onClose={handleCloseStatusModal}
      />
      <CustomLoader visible={isSubmitting} message="Processing Transfer..." />
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.4)', // Dimmed backdrop for sheet feel
    justifyContent: 'flex-end',
  },
  keyboardView: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  sheetContainer: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    marginTop: Platform.OS === 'ios' ? 40 : 20, // Leave top space to reveal rounded corners
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
    flex: 1,
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

export default AddFundScreen;
