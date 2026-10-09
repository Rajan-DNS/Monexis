import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
  StatusBar,
} from 'react-native';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import Colors from '../../../../../theme/colors';
import DNSInput from '../../../../../components/DNSInput';
import DNSButton from '../../../../../components/DNSButton';
import DNSDropdown from '../../../../../components/DNSDropdown';
import AppHeader from '../../../../../components/Header/AppHeader';
import { BANK_OPTIONS, PAYMENT_MODE_OPTIONS, REMARK_OPTIONS } from './SelectionData';
import { Poppins } from '../../../../../theme/typography';

const AddTopUpScreen = ({ navigation }: any) => {
  const [bank, setBank] = useState('State Bank of India');
  const [paymentMode, setPaymentMode] = useState('');
  const [amount, setAmount] = useState('2435664.00');
  const [utr, setUtr] = useState('');
  const [remark, setRemark] = useState('');

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFF" />
      <AppHeader title="Add Top-up" onBackPress={() => navigation.goBack()} />

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <DNSDropdown
          label="SELECT BANK"
          value={bank}
          options={BANK_OPTIONS}
          onSelect={setBank}
          placeholder="Select Bank"
        />

        <DNSDropdown
          label="PAYMENT MODE"
          value={paymentMode}
          options={PAYMENT_MODE_OPTIONS}
          onSelect={setPaymentMode}
          placeholder="Select Payment Mode"
        />

        <View style={styles.formGroup}>
          <Text style={styles.label}>AMOUNT</Text>
          <DNSInput
            value={amount}
            onChangeText={setAmount}
            placeholder="Enter Amount"
            keyboardType="numeric"
            containerStyle={styles.inputContainer}
          />
        </View>

        <View style={styles.formGroup}>
          <Text style={styles.label}>UTR</Text>
          <DNSInput
            value={utr}
            onChangeText={setUtr}
            placeholder="UTR number"
            containerStyle={styles.inputContainer}
          />
        </View>

        <DNSDropdown
          label="REMARK"
          value={remark}
          options={REMARK_OPTIONS}
          onSelect={setRemark}
          placeholder="Enter remark.."
        />

        <DNSButton
          title="Submit"
          onPress={() => { }}
          style={styles.submitButton}
        />

        <View style={{ height: 20 }} />
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFF',
  },
  scrollContent: {
    padding: 24,
  },
  label: {
    fontSize: 12,
    fontFamily: Poppins.bold,
    fontWeight: '700',
    color: '#444',
    marginBottom: 8,
    letterSpacing: 0.5,
  },
  formGroup: {
    marginBottom: 24,
  },
  dropdown: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#FFF',
    borderWidth: 1.2,
    borderColor: '#E0E0E0',
    borderRadius: 14,
    paddingHorizontal: 16,
    height: 58,
  },
  dropdownText: {
    fontSize: 16,
    fontFamily: Poppins.regular,
    color: '#999',
  },
  inputContainer: {
    marginBottom: 0,
  },
  submitButton: {
    marginTop: 40,
    backgroundColor: '#0052D4', // Premium dark blue
    borderRadius: 12,
  },
});

export default AddTopUpScreen;
