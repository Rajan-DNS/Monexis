
import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  Image,
  Alert,
} from 'react-native';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Colors } from '../../../../../theme';
import AppHeader from '../../../../../components/Header/AppHeader';
import DNSDropdown, { DropdownOption } from '../../../../../components/DNSDropdown';
import {
  useGetopretorQuery,
  useGetOperatorValidationDataQuery,
} from '../../../../../redux/services/mainApi/Common/CommonApi';
import { RootStackParamList } from '../../../../../navigation/RootNavigator';
import { Poppins } from '../../../../../theme/typography';
import { FontSize, Radius, Spacing, IconSize } from '../../../../../theme/spacing';

const baseUrl = 'https://webapi.monexis.store/';

interface DynamicValidationField {
  id: number;
  columnName: string;
  errorMsg: string;
  isMandatory: boolean;
  isNumeric: boolean;
  minMaxLenth?: string;
  minMaxVal?: string;
  operatorId: number;
  placeHolderText: string;
  startWith?: string;
  logoURL: string;
}

const DTHRechargeScreen = () => {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();

  // ── Operator State ────────────────────────────────────────────────────────
  const { data: operatorResponse } = useGetopretorQuery({ operatorTypeId: 2 });
  const operators = operatorResponse?.data || operatorResponse?.result || operatorResponse || [];
  const operatorList: any[] = Array.isArray(operators) ? operators : [];

  // Map operator items to DropdownOption objects
  const dropdownOptions: DropdownOption[] = operatorList.map((item: any) => ({
    label: item.operatorName || item.name || item.operator || '',
    value: item.operatorName || item.name || item.operator || '',
    logoURL: item.logoURL || item.logo || '',
  }));

  const [selectedOperatorName, setSelectedOperatorName] = useState('');
  const [selectedOperator, setSelectedOperator] = useState<any>(null);

  // ── Dynamic Validation State ──────────────────────────────────────────────
  const [dynamicFields, setDynamicFields] = useState<DynamicValidationField[]>([]);
  const [formValues, setFormValues] = useState<{ [key: number]: string }>({});
  const [useFallbackFields, setUseFallbackFields] = useState<boolean>(false);

  // Fallback inputs
  const [subscriberId, setSubscriberId] = useState('');
  const [amount, setAmount] = useState('');

  // ── Provider Grid State ───────────────────────────────────────────────────
  const [isExpanded, setIsExpanded] = useState(false);
  const displayedProviders = isExpanded ? operatorList : operatorList.slice(0, 6);

  // ── Operator Validation Query ──────────────────────────────────────────────
  const {
    data: operatorValidationResponse,
    isLoading: operatorValidationLoading,
    isFetching: operatorValidationFetching,
  } = useGetOperatorValidationDataQuery(
    { OperatorId: selectedOperator?.operatorId || selectedOperator?.id || 0 },
    { skip: !selectedOperator || !(selectedOperator?.operatorId || selectedOperator?.id) }
  );

  // ── Helpers ───────────────────────────────────────────────────────────────

  const parseRange = (rangeStr?: string) => {
    if (!rangeStr) return { min: 0, max: Infinity };
    const parts = rangeStr.split('-');
    if (parts.length === 2) {
      return {
        min: parseInt(parts[0], 10) || 0,
        max: parseInt(parts[1], 10) || Infinity,
      };
    }
    return { min: 0, max: Infinity };
  };

  const handleInputChange = (field: DynamicValidationField, text: string) => {
    let val = text;
    if (field.isNumeric) {
      val = val.replace(/[^0-9]/g, '');
    }
    setFormValues((prev) => ({ ...prev, [field.id]: val }));
  };

  // ── Effects ───────────────────────────────────────────────────────────────

  React.useEffect(() => {
    if (selectedOperator) {
      setFormValues({});
      setSubscriberId('');
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
  }, [
    selectedOperator,
    operatorValidationResponse,
    operatorValidationLoading,
    operatorValidationFetching,
  ]);

  // ── Operator Select Handlers ──────────────────────────────────────────────

  const handleSelectOption = (option: DropdownOption) => {
    setSelectedOperatorName(option.label);
    const operatorObj = operatorList.find(
      (item: any) => (item.operatorName || item.name || item.operator) === option.label
    );
    setSelectedOperator(operatorObj || null);
  };

  const handleSelectOperatorByName = (name: string) => {
    setSelectedOperatorName(name);
    const operatorObj = operatorList.find(
      (item: any) => (item.operatorName || item.name || item.operator) === name
    );
    setSelectedOperator(operatorObj || null);
  };

  // ── Validation & Submission ───────────────────────────────────────────────

  const validateForm = () => {
    if (!selectedOperatorName) {
      Alert.alert('Validation', 'Please select a DTH operator.');
      return false;
    }

    if (!useFallbackFields && dynamicFields.length > 0) {
      for (const field of dynamicFields) {
        const rawVal = formValues[field.id] || '';
        const val = rawVal.trim();
        if (field.isMandatory && !val) {
          Alert.alert('Validation Error', field.errorMsg || `Please enter ${field.columnName}.`);
          return false;
        }
        const range = parseRange(field.minMaxLenth);
        if (val.length > 0 && (val.length < range.min || val.length > range.max)) {
          Alert.alert(
            'Validation Error',
            `Length for ${field.columnName} must be between ${range.min} and ${range.max}.`
          );
          return false;
        }
      }
    } else {
      if (!subscriberId.trim()) {
        Alert.alert('Validation', 'Please enter your Subscriber ID / Customer ID.');
        return false;
      }
      const numAmount = parseFloat(amount);
      if (!amount || isNaN(numAmount) || numAmount <= 0) {
        Alert.alert('Validation', 'Please enter a valid amount.');
        return false;
      }
    }
    return true;
  };

  const getPrimarySubscriberId = () => {
    if (useFallbackFields) return subscriberId;
    if (dynamicFields.length > 0) return formValues[dynamicFields[0].id] || '';
    return '';
  };

  const getFormAmount = () => {
    if (useFallbackFields) return amount;
    const amountField = dynamicFields.find((f) =>
      f.columnName.toLowerCase().includes('amount')
    );
    return amountField ? formValues[amountField.id] || '0' : '0';
  };

  const handleProceed = () => {
    if (!validateForm()) return;
    navigation.navigate('DTHBill', {
      mobileNumber: getPrimarySubscriberId(),
      amount: getFormAmount(),
      operator: selectedOperator,
      plan: null,
    });
  };

  // ── Render ────────────────────────────────────────────────────────────────

  return (
    <View style={styles.container}>
      <AppHeader title="DTH Recharge" showBack={true} onBackPress={() => navigation.goBack()} />

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        {/* Top Promo Banner */}
        <View style={styles.topPromoBanner}>
          <View style={styles.promoIconBg}>
            <MaterialCommunityIcons name="satellite-variant" size={IconSize.xl} color="#0a429b" />
          </View>
          <View style={styles.promoTextContainer}>
            <Text style={styles.promoTitle}>DTH Recharge</Text>
            <Text style={styles.promoSubtitle}>Instant recharge. Unlimited entertainment.</Text>
          </View>
          <Image
            source={require('../../../../../Assets/img/DTH/dth.png')}
            style={styles.promoImage}
          />
        </View>

        {/* Form Card */}
        <View style={styles.formSection}>
          {/* Operator Dropdown */}
          <DNSDropdown
            label="OPERATOR"
            value={selectedOperatorName}
            options={dropdownOptions}
            onSelect={handleSelectOption}
            placeholder="Choose DTH Operator"
          />

          {/* Dynamic / Fallback Input Fields */}
          {operatorValidationLoading || operatorValidationFetching ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="small" color={Colors.primary} />
              <Text style={styles.loadingText}>Fetching field validation rules...</Text>
            </View>
          ) : selectedOperatorName && !useFallbackFields && dynamicFields.length > 0 ? (
            <>
              {dynamicFields.map((field) => {
                const lengthRange = parseRange(field.minMaxLenth);
                return (
                  <React.Fragment key={field.id}>
                    <View style={styles.labelRow}>
                      <Text style={styles.label}>
                        {field.columnName.toUpperCase()} {field.isMandatory && '*'}
                      </Text>
                    </View>

                    <View style={styles.inputWrapper}>
                      <MaterialCommunityIcons
                        name={field.isNumeric ? 'numeric' : 'text-short'}
                        size={IconSize.md}
                        color={Colors.textSecondary}
                        style={styles.inputIcon}
                      />
                      <TextInput
                        style={styles.input}
                        placeholder={field.placeHolderText}
                        placeholderTextColor={Colors.textMuted}
                        keyboardType={field.isNumeric ? 'numeric' : 'default'}
                        maxLength={lengthRange.max !== Infinity ? lengthRange.max : undefined}
                        value={formValues[field.id] || ''}
                        onChangeText={(text) => handleInputChange(field, text)}
                      />
                    </View>
                    <View style={{ height: 14 }} />
                  </React.Fragment>
                );
              })}

              <TouchableOpacity
                style={styles.proceedButton}
                activeOpacity={0.9}
                onPress={handleProceed}
              >
                <Text style={styles.proceedButtonText}>PROCEED TO PAY</Text>
                <MaterialCommunityIcons name="arrow-right" size={IconSize.md} color={Colors.white} />
              </TouchableOpacity>
            </>
          ) : selectedOperator && useFallbackFields ? (
            <>
              <View style={styles.labelRow}>
                <Text style={styles.label}>SUBSCRIBER ID / CUSTOMER ID *</Text>
                <TouchableOpacity style={styles.helpLink} activeOpacity={0.8}>
                  <MaterialCommunityIcons name="information" size={14} color={Colors.primary} />
                  <Text style={styles.helpText}> WHERE TO FIND?</Text>
                </TouchableOpacity>
              </View>

              <View style={styles.inputWrapper}>
                <MaterialCommunityIcons
                  name="card-account-details-outline"
                  size={IconSize.md}
                  color={Colors.textSecondary}
                  style={styles.inputIcon}
                />
                <TextInput
                  style={styles.input}
                  placeholder="Subscriber ID / Customer ID"
                  placeholderTextColor={Colors.textMuted}
                  value={subscriberId}
                  keyboardType="default"
                  onChangeText={(text) => {
                    const clean = text.replace(/[^0-9]/g, '').replace(/^0+/, '');
                    setSubscriberId(clean);
                  }}
                />
              </View>

              <View style={{ height: 14 }} />

              <View style={styles.labelRow}>
                <Text style={styles.label}>AMOUNT (₹) *</Text>
              </View>
              <View style={styles.inputWrapper}>
                <MaterialCommunityIcons
                  name="currency-inr"
                  size={IconSize.md}
                  color={Colors.textSecondary}
                  style={styles.inputIcon}
                />
                <TextInput
                  style={styles.input}
                  placeholder="Enter amount"
                  placeholderTextColor={Colors.textMuted}
                  value={amount}
                  onChangeText={(text) => {
                    const clean = text.replace(/[^0-9]/g, '').replace(/^0+/, '');
                    setAmount(clean);
                  }}
                  keyboardType="numeric"
                />
              </View>

              <View style={{ height: 14 }} />

              <TouchableOpacity
                style={[
                  styles.proceedButton,
                  (!subscriberId.trim() || !amount || parseFloat(amount) <= 0) && { opacity: 0.5 },
                ]}
                activeOpacity={0.9}
                onPress={handleProceed}
                disabled={!subscriberId.trim() || !amount || parseFloat(amount) <= 0}
              >
                <Text style={styles.proceedButtonText}>PROCEED TO PAY</Text>
                <MaterialCommunityIcons name="arrow-right" size={IconSize.md} color={Colors.white} />
              </TouchableOpacity>
            </>
          ) : null}

          {/* Trust Badges */}
          <View style={styles.trustFloor}>
            <View style={styles.trustItem}>
              <MaterialCommunityIcons name="text-box-check-outline" size={IconSize.sm} color={Colors.textDark} />
              <Text style={styles.trustText}>Secure {'\n'}Payment</Text>
            </View>
            <View style={styles.trustItem}>
              <MaterialCommunityIcons name="flash-outline" size={IconSize.sm} color={Colors.textDark} />
              <Text style={styles.trustText}>Instant {'\n'}Recharge</Text>
            </View>
            <View style={styles.trustItem}>
              <MaterialCommunityIcons name="headset" size={IconSize.sm} color="#0a429b" />
              <Text style={styles.trustText}>24x7 {'\n'}Support</Text>
            </View>
          </View>
        </View>

        {/* Provider Grid */}
        {operatorList.length > 0 && (
          <>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Providers</Text>
              {operatorList.length > 6 && (
                <TouchableOpacity onPress={() => setIsExpanded(!isExpanded)}>
                  <Text style={styles.viewAllText}>{isExpanded ? 'Show Less' : 'View All'}</Text>
                </TouchableOpacity>
              )}
            </View>

            <View style={styles.providerGrid}>
              {displayedProviders.map((provider: any, index: number) => {
                const name = provider.operatorName || provider.name || provider.operator;
                const isSelected = selectedOperatorName === name;
                const logoPath = provider.logoURL || provider.logo;

                return (
                  <TouchableOpacity
                    key={provider.operatorId || provider.id || index}
                    style={[styles.providerCard, isSelected && styles.providerCardSelected]}
                    onPress={() => handleSelectOperatorByName(name)}
                    activeOpacity={0.8}
                  >
                    {logoPath ? (
                      <Image
                        source={{ uri: `${baseUrl}${logoPath}` }}
                        style={styles.providerLogo}
                        resizeMode="contain"
                      />
                    ) : (
                      <MaterialCommunityIcons name="television-classic" size={30} color={Colors.primary} />
                    )}
                    <Text
                      style={[styles.providerName, isSelected && styles.providerNameSelected]}
                      numberOfLines={1}
                    >
                      {name}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>
          </>
        )}

        {/* Bottom Offer Banner */}
        <View style={styles.bannerContainer}>
          <View style={styles.bannerTextContainer}>
            <Text style={styles.bannerTitle}>DTH Special Offers</Text>
            <Text style={styles.bannerSubtitle}>Get up to 20% cashback on your first recharge.</Text>
            <TouchableOpacity style={styles.grabButton}>
              <Text style={styles.grabButtonText}>GRAB NOW</Text>
            </TouchableOpacity>
          </View>
          <MaterialCommunityIcons name="star-circle" size={IconSize.xxl} color={Colors.white} style={{ opacity: 0.8 }} />
        </View>

        <View style={{ height: Spacing.xxl }} />
      </ScrollView>
    </View>
  );
};

// ─── Styles ──────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f8f9fb' },
  scrollContent: { paddingHorizontal: Spacing.md, paddingTop: Spacing.md },

  // Promo Banner
  topPromoBanner: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: Colors.infoBg,
    borderRadius: Radius.lg,
    padding: Spacing.md,
    marginBottom: Spacing.md,
    shadowColor: '#000000',
    shadowOffset: { width: 2, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 1,
    elevation: 3,
  },
  promoIconBg: {
    width: 44,
    height: 44,
    borderRadius: Radius.full,
    backgroundColor: Colors.divider,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: Spacing.md,
  },
  promoTextContainer: { flex: 1 },
  promoTitle: { fontSize: FontSize.lg, color: Colors.primary, fontFamily: Poppins.bold },
  promoSubtitle: { fontSize: FontSize.sm, color: Colors.textBody, marginTop: Spacing.xs, fontFamily: Poppins.regular },
  promoImage: { height: 80, width: 80 },

  // Form Card
  formSection: {
    backgroundColor: Colors.white,
    borderRadius: Radius.md,
    padding: Spacing.md,
    shadowColor: Colors.primary,
    shadowOffset: { width: 2, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 1,
    elevation: 2,
  },

  label: {
    fontSize: FontSize.sm,
    fontFamily: Poppins.bold,
    color: Colors.textBody,
    marginBottom: Spacing.sm,
    letterSpacing: 0.5,
  },
  labelRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  helpLink: { flexDirection: 'row', alignItems: 'center' },
  helpText: { fontSize: 12, color: Colors.primary, fontFamily: Poppins.extraBold },

  loadingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    gap: 8,
  },
  loadingText: {
    fontSize: 13,
    color: Colors.textMuted,
    fontFamily: Poppins.medium,
  },

  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: Radius.md,
    paddingHorizontal: Spacing.md,
    height: 50,
    borderWidth: 1,
    borderColor: Colors.divider,
    backgroundColor: '#FCFDFF',
  },
  inputIcon: { marginRight: Spacing.sm },
  input: {
    flex: 1,
    fontSize: FontSize.lg,
    fontFamily: Poppins.medium,
    color: Colors.textDark,
    paddingVertical: 0,
  },

  proceedButton: {
    backgroundColor: Colors.primaryDark,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: Radius.md,
    height: 50,
    marginTop: 4,
    gap: 8,
    shadowColor: '#000000',
    shadowOffset: { width: 2, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 1,
    elevation: 4,
  },
  proceedButtonText: {
    color: Colors.white,
    fontSize: FontSize.lg,
    letterSpacing: 0.5,
    fontFamily: Poppins.bold,
  },

  trustFloor: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    marginTop: Spacing.md,
    borderTopWidth: 1,
    borderColor: Colors.divider,
    paddingTop: Spacing.md,
  },
  trustItem: { flexDirection: 'row', alignItems: 'center' },
  trustText: { fontSize: FontSize.xs + 1, color: Colors.textBody, marginLeft: Spacing.xs + 2, lineHeight: 14, fontFamily: Poppins.regular },

  // Providers
  sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: Spacing.md, marginTop: Spacing.lg, marginHorizontal: Spacing.xs },
  sectionTitle: { fontSize: FontSize.lg, color: Colors.textDark, fontFamily: Poppins.bold },
  viewAllText: { fontSize: FontSize.sm + 1, color: Colors.primaryDark, fontFamily: Poppins.bold },

  providerGrid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between', marginBottom: Spacing.lg },
  providerCard: {
    width: '48%',
    backgroundColor: Colors.white,
    borderRadius: Radius.md,
    padding: Spacing.md,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: Colors.divider,
    marginBottom: Spacing.md,
    shadowColor: Colors.primary,
    shadowOffset: { width: 2, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 1,
    elevation: 2,
  },
  providerCardSelected: {
    borderColor: Colors.primary,
    backgroundColor: Colors.infoBg,
  },
  providerLogo: { width: 50, height: 50, marginBottom: Spacing.sm },
  providerName: { fontSize: FontSize.sm, color: Colors.textDark, textAlign: 'center', fontFamily: Poppins.bold },
  providerNameSelected: { color: Colors.primary },

  // Promo Banner
  bannerContainer: {
    backgroundColor: Colors.primaryDark,
    borderRadius: Radius.lg,
    padding: Spacing.xl - 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: Spacing.md,
  },
  bannerTextContainer: { flex: 1, paddingRight: Spacing.md },
  bannerTitle: { color: Colors.white, fontSize: FontSize.xl, marginBottom: Spacing.xs, fontFamily: Poppins.regular },
  bannerSubtitle: { color: '#e6f0ff', fontSize: FontSize.sm + 1, marginBottom: Spacing.md, lineHeight: 18, fontFamily: Poppins.regular },
  grabButton: {
    backgroundColor: Colors.white,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderRadius: Radius.xl,
    alignSelf: 'flex-start',
  },
  grabButtonText: { color: Colors.primary, fontSize: FontSize.sm, fontFamily: Poppins.bold },
});

export default DTHRechargeScreen;