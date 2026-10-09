import React, { useCallback, useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Image,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import AppHeader from '../../../../../components/Header/AppHeader';
import { RootStackParamList } from '../../../../../navigation/RootNavigator';
import Colors from '../../../../../theme/colors';
import { Poppins } from '../../../../../theme/typography';
import {
  useLazyGetElectricityCirclesQuery,
  useLazyGetElectricityOperatorsByCircleQuery,
} from '../../../../../redux/services/RetailerServices/Electricity/ElectricityApi';
import { useGetOperatorValidationDataQuery } from '../../../../../redux/services/mainApi/Common/CommonApi';
import DNSDropdown from '../../../../../components/DNSDropdown';

type ElectricityNavigation = NativeStackNavigationProp<RootStackParamList>;

interface DropdownItem {
  id: number | string;
  name: string;
  [key: string]: any;
}

interface DynamicValidationField {
  id: number;
  columnName: string;
  errorMsg: string;
  isMandatory: boolean;
  isNumeric: boolean;
  minMaxLenth?: string; // e.g. "1-13"
  minMaxVal?: string;   // e.g. "1-10000000"
  operatorId: number;
  placeHolderText: string;
  startWith?: string;
}

const trustItems = [
  {
    id: 'secure',
    title: '100% Secure',
    subtitle: 'Safe & Secure\nPayments',
    icon: 'shield-check-outline',
    color: Colors.primary,
    bg: '#EDF2FF',
  },
  {
    id: 'instant',
    title: 'Instant Payment',
    subtitle: 'Quick & Hassle\nFree',
    icon: 'lightning-bolt-outline',
    color: '#16A34A',
    bg: '#EAF8EE',
  },
  {
    id: 'trusted',
    title: 'Trusted by Millions',
    subtitle: 'Reliable & Secure',
    icon: 'shield-account-outline',
    color: '#F43F5E',
    bg: '#FFEAF0',
  },
];

const ElectricityRechargeScreen = () => {
  const navigation = useNavigation<ElectricityNavigation>();

  // ── State ─────────────────────────────────────
  const [selectedCircle, setSelectedCircle] = useState<DropdownItem | null>(null);
  const [selectedOperator, setSelectedOperator] = useState<DropdownItem | null>(null);

  // Dynamic fields mapped from API response
  const [dynamicFields, setDynamicFields] = useState<DynamicValidationField[]>([]);
  const [formValues, setFormValues] = useState<{ [key: number]: string }>({});

  // Default / Fallback input state when API provides no fields
  const [useFallbackFields, setUseFallbackFields] = useState<boolean>(false);
  const [consumerNumber, setConsumerNumber] = useState<string>('');
  const [amount, setAmount] = useState<string>('');

  // ── Helper to Parse Min / Max Range Strings ("1-10000000") ──
  const parseRange = (rangeStr?: string) => {
    if (!rangeStr) return { min: 0, max: Infinity };
    const parts = rangeStr.split('-').map((v) => parseInt(v.trim(), 10));
    return {
      min: isNaN(parts[0]) ? 0 : parts[0],
      max: isNaN(parts[1]) ? Infinity : parts[1],
    };
  };

  // ── Input Handler with Live Numeric Sanitization ──
  const handleInputChange = (field: DynamicValidationField, text: string) => {
    let sanitizedText = text;

    if (field.isNumeric) {
      // 1. Remove non-numeric characters
      sanitizedText = text.replace(/[^0-9]/g, '');
      // 2. Prevent leading zeros (e.g., "0" or "0123" -> "123")
      sanitizedText = sanitizedText.replace(/^0+/, '');
    }

    setFormValues((prev) => ({ ...prev, [field.id]: sanitizedText }));
  };

  // ── API hooks ─────────────────────────────────
  const [fetchCircles, { data: circleData, isLoading: circlesLoading }] =
    useLazyGetElectricityCirclesQuery();

  const [
    fetchOperators,
    { data: operatorData, isLoading: operatorsLoading, isFetching: operatorsFetching },
  ] = useLazyGetElectricityOperatorsByCircleQuery();

  const {
    data: operatorValidationResponse,
    isLoading: operatorValidationLoading,
    isFetching: operatorValidationFetching,
  } = useGetOperatorValidationDataQuery(
    { OperatorId: selectedOperator?.id ?? 0 },
    { skip: !selectedOperator || !selectedOperator?.id },
  );

  // ── Handle API Dynamic Rules vs Default Fallback Inputs ─────────────────
  useEffect(() => {
    if (selectedOperator) {
      setFormValues({});
      setConsumerNumber('');
      setAmount('');

      const rawData = operatorValidationResponse?.data ?? operatorValidationResponse;

      let fields: DynamicValidationField[] = [];
      if (Array.isArray(rawData)) {
        fields = rawData;
      } else if (rawData && typeof rawData === 'object' && Array.isArray(rawData.fields)) {
        fields = rawData.fields;
      }

      if (fields && fields.length > 0) {
        setDynamicFields(fields);
        setUseFallbackFields(false);
      } else if (!operatorValidationLoading && !operatorValidationFetching) {
        setDynamicFields([]);
        setUseFallbackFields(true);
      }
    } else {
      setDynamicFields([]);
      setUseFallbackFields(false);
    }
  }, [selectedOperator, operatorValidationResponse, operatorValidationLoading, operatorValidationFetching]);

  // Normalized dropdown items
  const rawCircles = Array.isArray(circleData?.data)
    ? circleData.data
    : Array.isArray(circleData)
      ? circleData
      : [];

  const circles: DropdownItem[] = rawCircles.map((c: any, index: number) => ({
    ...c,
    id: c.id ?? c.circleId ?? index,
    name: c.circleName ?? c.name ?? c.text ?? '',
  }));

  const rawOperators = Array.isArray(operatorData?.data)
    ? operatorData.data
    : Array.isArray(operatorData)
      ? operatorData
      : [];

  const operators: DropdownItem[] = rawOperators.map((o: any, index: number) => ({
    ...o,
    id: o.id ?? o.operatorId ?? o.value ?? index,
    name: o.text ?? o.name ?? o.operatorName ?? '',
  }));

  useEffect(() => {
    fetchCircles();
  }, [fetchCircles]);

  const handleCircleSelect = useCallback(
    (circle: DropdownItem) => {
      setSelectedCircle(circle);
      setSelectedOperator(null);
      setDynamicFields([]);
      setFormValues({});
      setConsumerNumber('');
      setAmount('');
      setUseFallbackFields(false);
      fetchOperators({ circleId: circle.id });
    },
    [fetchOperators],
  );

  // ── Validation logic ───────────────────────────
  const validateForm = (): boolean => {
    if (!selectedCircle) {
      Alert.alert('Validation Error', 'Please select a circle / state.');
      return false;
    }
    if (!selectedOperator) {
      Alert.alert('Validation Error', 'Please select an operator.');
      return false;
    }

    // A) DYNAMIC API FIELD VALIDATION
    if (!useFallbackFields && dynamicFields.length > 0) {
      for (const field of dynamicFields) {
        const rawVal = formValues[field.id] || '';
        const val = rawVal.trim();

        // 1. Mandatory Check
        if (field.isMandatory && !val) {
          Alert.alert(
            'Validation Error',
            field.errorMsg || `Please enter ${field.columnName}.`
          );
          return false;
        }

        if (val) {
          // 2. Strict Numeric Validation
          if (field.isNumeric) {
            if (!/^[1-9]\d*$/.test(val)) {
              Alert.alert(
                'Validation Error',
                field.errorMsg || `${field.columnName} must contain positive numbers only and cannot start with 0.`
              );
              return false;
            }

            // Numeric Range Check
            const numVal = parseInt(val, 10);
            const valRange = parseRange(field.minMaxVal);
            if (numVal < valRange.min || numVal > valRange.max) {
              Alert.alert(
                'Validation Error',
                `${field.columnName} value must be between ${valRange.min} and ${valRange.max}.`
              );
              return false;
            }
          }

          // 3. Min/Max Length Validation
          const lengthRange = parseRange(field.minMaxLenth);
          if (val.length < lengthRange.min || val.length > lengthRange.max) {
            Alert.alert(
              'Validation Error',
              `${field.columnName} must be between ${lengthRange.min} and ${lengthRange.max} digits.`
            );
            return false;
          }

          // 4. Prefix Validation
          if (field.startWith && !val.startsWith(field.startWith)) {
            Alert.alert(
              'Validation Error',
              `${field.columnName} must start with "${field.startWith}".`
            );
            return false;
          }
        }
      }
      return true;
    }

    if (useFallbackFields) {
      if (!consumerNumber.trim()) {
        Alert.alert('Validation Error', 'Please enter Consumer Number.');
        return false;
      }

      const parsedAmount = parseInt(amount, 10);
      if (!amount || isNaN(parsedAmount) || parsedAmount < 1 || parsedAmount > 10000000) {
        Alert.alert('Validation Error', 'Please enter a valid Amount between 1 and 10,000,000.');
        return false;
      }

      return true;
    }

    return false;
  };

  const handleProceed = () => {
    if (!validateForm()) return;

    let finalFormDetails: any = {};
    let finalAmount = '';

    if (useFallbackFields) {
      finalFormDetails = { consumerNumber };
      finalAmount = amount;
    } else {
      finalFormDetails = formValues;
      const amountField = dynamicFields.find((f) =>
        f.columnName.toLowerCase().includes('amount'),
      );
      finalAmount = amountField ? formValues[amountField.id] : '';
    }

    navigation.navigate('ElectricityBill', {
      circle: selectedCircle,
      operator: selectedOperator,
      formDetails: finalFormDetails,
      amount: finalAmount,
    } as any);
  };

  // Enable/Disable Submit Button
  const isDynamicValid =
    dynamicFields.length > 0 &&
    dynamicFields.every((field) => {
      const val = (formValues[field.id] || '').trim();
      return field.isMandatory ? val.length > 0 : true;
    });

  const isFallbackValid = consumerNumber.trim().length > 0 && amount.trim().length > 0;

  const isFormValid =
    selectedCircle !== null &&
    selectedOperator !== null &&
    !operatorValidationLoading &&
    !operatorValidationFetching &&
    (useFallbackFields ? isFallbackValid : isDynamicValid);

  return (
    <View style={styles.container}>
      <AppHeader
        title="Electricity Recharge"
        onBackPress={() => navigation.goBack()}
        showBack
      />

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
      >
        {/* HERO BANNER */}
        <View style={styles.heroCard}>
          <View style={styles.heroCopy}>
            <Text style={styles.heroTitle}>
              Pay Electricity Bills Instantly & Securely
            </Text>
            <Text style={styles.heroSubtitle}>
              Pay on time, stay worry free!
            </Text>

            <TouchableOpacity style={styles.cashbackBox} activeOpacity={0.8}>
              <View style={styles.cashbackIcon}>
                <MaterialCommunityIcons name="ticket-percent" size={16} color="#4F46E5" />
              </View>
              <View style={styles.cashbackTextWrap}>
                <Text style={styles.cashbackTitle}>Get Flat ₹25 Cashback</Text>
                <Text style={styles.cashbackSub}>on minimum bill of ₹200</Text>
              </View>
              <MaterialCommunityIcons name="chevron-right" size={16} color="#0A2574" />
            </TouchableOpacity>
          </View>

          <View style={styles.heroArt}>
            <Image
              source={require('../../../../../Assets/img/DTH/rech.png')}
              style={styles.heroImage}
              resizeMode="contain"
            />
          </View>
        </View>

        {/* INPUT FORM CARD */}
        <View style={styles.formCard}>
          {circlesLoading ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="small" color={Colors.primary} />
              <Text style={styles.loadingText}>Loading circles...</Text>
            </View>
          ) : (
            <DNSDropdown
              label="CIRCLE / STATE"
              placeholder="Select Circle"
              value={selectedCircle?.name || ''}
              options={circles.map((c) => c.name)}
              onSelect={(name) => {
                const circle = circles.find((c) => c.name === name);
                if (circle) handleCircleSelect(circle);
              }}
            />
          )}

          <View style={{ height: 14 }} />

          {operatorsLoading || operatorsFetching ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="small" color={Colors.primary} />
              <Text style={styles.loadingText}>Loading operators...</Text>
            </View>
          ) : (
            <DNSDropdown
              label="ELECTRICITY OPERATOR"
              placeholder={selectedCircle ? 'Select Operator' : 'Select circle first'}
              value={selectedOperator?.name || ''}
              options={selectedCircle ? operators.map((o) => o.name) : []}
              onSelect={(name) => {
                const operator = operators.find((o) => o.name === name);
                if (operator) setSelectedOperator(operator);
              }}
            />
          )}

          <View style={{ height: 14 }} />

          {/* DYNAMIC FIELD RENDERING / FALLBACK RENDERING */}
          {operatorValidationLoading || operatorValidationFetching ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="small" color={Colors.primary} />
              <Text style={styles.loadingText}>Fetching field validation rules...</Text>
            </View>
          ) : !useFallbackFields && dynamicFields.length > 0 ? (
            /* 1. RENDER API DYNAMIC FIELDS */
            dynamicFields.map((field) => {
              const lengthRange = parseRange(field.minMaxLenth);
              return (
                <React.Fragment key={field.id}>
                  <View style={styles.labelRow}>
                    <Text style={styles.label}>
                      {field.columnName.toUpperCase()} {field.isMandatory && '*'}
                    </Text>
                  </View>

                  <View style={styles.inputWrap}>
                    <TextInput
                      style={styles.input}
                      placeholder={field.placeHolderText}
                      placeholderTextColor={Colors.textMuted ?? '#94A3B8'}
                      keyboardType={field.isNumeric ? 'numeric' : 'default'}
                      maxLength={lengthRange.max !== Infinity ? lengthRange.max : undefined}
                      value={formValues[field.id] || ''}
                      onChangeText={(text) => handleInputChange(field, text)}
                    />
                    <MaterialCommunityIcons
                      name={field.isNumeric ? 'numeric' : 'text-short'}
                      size={22}
                      color={Colors.textSecondary}
                    />
                  </View>

                  <View style={{ height: 14 }} />
                </React.Fragment>
              );
            })
          ) : selectedOperator && useFallbackFields ? (
            /* 2. RENDER FALLBACK INPUT FIELDS WHEN API HAS NO DATA */
            <>
              <View style={styles.labelRow}>
                <Text style={styles.label}>CONSUMER NUMBER *</Text>
              </View>
              <View style={styles.inputWrap}>
                <TextInput
                  style={styles.input}
                  keyboardType="numeric"
                  placeholder="Enter Consumer Number"
                  placeholderTextColor={Colors.textMuted ?? '#94A3B8'}
                  value={consumerNumber}
                  onChangeText={(text) => {
                    const cleanText = text.replace(/[^0-9]/g, '').replace(/^0+/, '');
                    setConsumerNumber(cleanText);
                  }}
                />
                <MaterialCommunityIcons
                  name="account-box-outline"
                  size={22}
                  color={Colors.textSecondary}
                />
              </View>

              <View style={{ height: 14 }} />

              <View style={styles.labelRow}>
                <Text style={styles.label}>AMOUNT (₹) *</Text>
              </View>
              <View style={styles.inputWrap}>
                <TextInput
                  style={styles.input}
                  placeholder="Enter Amount"
                  placeholderTextColor={Colors.textMuted ?? '#94A3B8'}
                  keyboardType="numeric"
                  value={amount}
                  onChangeText={(text) => {
                    const cleanText = text.replace(/[^0-9]/g, '').replace(/^0+/, '');
                    setAmount(cleanText);
                  }}
                />
                <MaterialCommunityIcons
                  name="currency-inr"
                  size={22}
                  color={Colors.textSecondary}
                />
              </View>

              <View style={{ height: 14 }} />
            </>
          ) : null}

          <TouchableOpacity
            style={[styles.payButton, !isFormValid && styles.payButtonDisabled]}
            activeOpacity={0.9}
            onPress={handleProceed}
            disabled={!isFormValid}
          >
            <Text style={styles.payButtonText}>PROCEED TO PAY</Text>
            <MaterialCommunityIcons name="arrow-right" size={20} color={Colors.white} />
          </TouchableOpacity>
        </View>

        {/* TRUST BANNER */}
        <View style={styles.trustCard}>
          {trustItems.map((item) => (
            <View key={item.id} style={styles.trustItem}>
              <View style={[styles.trustIcon, { backgroundColor: item.bg }]}>
                <MaterialCommunityIcons name={item.icon} size={18} color={item.color} />
              </View>
              <View style={styles.trustCopy}>
                <Text style={styles.trustTitle}>{item.title}</Text>
                <Text style={styles.trustSubtitle}>{item.subtitle}</Text>
              </View>
            </View>
          ))}
        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FAFBFF' },
  scrollContent: { padding: 16, paddingBottom: 32 },

  heroCard: {
    borderRadius: 16,
    backgroundColor: '#F4F7FF',
    padding: 16,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    minHeight: 140,
    shadowColor: Colors.primary,
    shadowOffset: { width: 2, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 1,
    elevation: 4,
    marginTop: 10,
  },
  heroCopy: { flex: 1.4, paddingRight: 4 },
  heroTitle: { fontSize: 16, lineHeight: 23, color: '#0A2574' },
  heroSubtitle: { fontSize: 12, color: '#64748B', marginTop: 4, fontFamily: Poppins.medium },
  cashbackBox: {
    marginTop: 12,
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
    paddingVertical: 6,
    paddingHorizontal: 8,
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    alignSelf: 'flex-start',
  },
  cashbackIcon: {
    width: 24,
    height: 24,
    borderRadius: 6,
    backgroundColor: '#EEF2FF',
    justifyContent: 'center',
    alignItems: 'center',
  },
  cashbackTextWrap: { marginLeft: 8, marginRight: 12 },
  cashbackTitle: { fontSize: 12, color: '#0A2574' },
  cashbackSub: { fontSize: 12, color: '#64748B', fontFamily: Poppins.medium, marginTop: 1 },
  heroArt: { flex: 1, alignItems: 'flex-end' },
  heroImage: { width: '100%', height: 115 },

  formCard: {
    backgroundColor: Colors.white,
    borderRadius: 16,
    padding: 16,
    marginTop: 16,
    borderWidth: 1,
    borderColor: '#F1F5F9',
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 2, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 1,
  },
  loadingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 20,
  },
  loadingText: { marginLeft: 10, fontSize: 14, color: Colors.textSecondary, fontFamily: Poppins.medium },
  label: {
    fontSize: 12, color: Colors.textDark, fontWeight: '700',
  },
  labelRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  helpLink: { flexDirection: 'row', alignItems: 'center' },
  helpText: { fontSize: 12, color: '#0029A8' },
  inputWrap: {
    height: 50,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 10,
    paddingHorizontal: 12,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FCFDFF',
  },
  input: { flex: 1, fontSize: 14, color: Colors.textDark, paddingVertical: 0 },
  payButton: {
    height: 50,
    borderRadius: 10,
    backgroundColor: '#0025A2',
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 20,
    gap: 8,
  },
  payButtonDisabled: { opacity: 0.5 },
  payButtonText: {
    color: Colors.white, fontSize: 15, letterSpacing: 0.5, fontWeight: '700',
  },

  trustCard: {
    backgroundColor: Colors.white,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#F1F5F9',
    marginTop: 24,
    paddingVertical: 12,
    paddingHorizontal: 8,
    flexDirection: 'row',
    justifyContent: 'space-between',
    elevation: 2,
  },
  trustItem: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center' },
  trustIcon: { width: 30, height: 30, borderRadius: 15, justifyContent: 'center', alignItems: 'center', marginRight: 6 },
  trustCopy: { flex: 1 },
  trustTitle: { fontSize: 12, color: '#1E293B' },
  trustSubtitle: { fontSize: 12, color: '#64748B', fontFamily: Poppins.medium, lineHeight: 12 },
});

export default ElectricityRechargeScreen;