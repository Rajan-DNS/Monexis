import React, { useState, useEffect } from 'react';
import {
    StyleSheet,
    Text,
    View,
    TextInput,
    TouchableOpacity,
    ScrollView,
    Image,
    Alert,
    ActivityIndicator,
} from 'react-native';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import Colors from '../../../../../theme/colors';
import AppHeader from '../../../../../components/Header/AppHeader';
import DNSDropdown from '../../../../../components/DNSDropdown';
import BillInfoModal from '../../../../../components/BillInfoModal';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../../../../navigation/RootNavigator';
import { Poppins } from '../../../../../theme/typography';
import { BROADBAND_CONFIG } from '../../../../../data/utilityConfigs';
import {
    useBillinfoMutation,
    useGetopretorQuery,
    useGetOperatorValidationDataQuery,
} from '../../../../../redux/services/mainApi/Common/CommonApi';

const trustItems = [
    { id: 'secure', title: '100% Secure', subtitle: 'Safe & Secure\nPayments', icon: 'shield-check-outline', color: Colors.primary, bg: '#EDF2FF' },
    { id: 'instant', title: 'Instant Payment', subtitle: 'Quick & Hassle\nFree', icon: 'lightning-bolt-outline', color: '#16A34A', bg: '#EAF8EE' },
    { id: 'trusted', title: 'Trusted by Millions', subtitle: 'Reliable & Secure', icon: 'shield-account-outline', color: '#F43F5E', bg: '#FFEAF0' },
];

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
}


const BroadbandRechargeScreen = () => {
    const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList, 'BroadbandBill'>>();
    const config = BROADBAND_CONFIG;

    // 1. ALL HOOKS CALLED AT TOP LEVEL IN FIXED ORDER
    const { data: operatorResponse } = useGetopretorQuery({ operatorTypeId: 0 });
    const [billinfo, { isLoading: isFetchingBillInfo }] = useBillinfoMutation();

    // Form state
    const [selectedOperatorName, setSelectedOperatorName] = useState('');
    const [selectedOperator, setSelectedOperator] = useState<any>(null);
    const [dynamicFields, setDynamicFields] = useState<DynamicValidationField[]>([]);
    const [formValues, setFormValues] = useState<{ [key: number]: string }>({});
    const [useFallbackFields, setUseFallbackFields] = useState<boolean>(false);
    const [consumerNumber, setConsumerNumber] = useState<string>('');
    const [amount, setAmount] = useState<string>('');
    const [billInfoData, setBillInfoData] = useState<any>(null);
    const [isBillInfoVisible, setIsBillInfoVisible] = useState(false);

    // Derived values
    const operators = operatorResponse?.data || operatorResponse?.result || operatorResponse || [];
    const operatorList = Array.isArray(operators) ? operators : [];
    const operatorSource = operatorList.length ? operatorList : config.recentData || [];
    const operatorOptions = operatorSource.map((item: any) => item.operatorName || item.name || item.operator).filter(Boolean);

    // RTK Query with skip option
    const {
        data: operatorValidationResponse,
        isLoading: operatorValidationLoading,
        isFetching: operatorValidationFetching,
    } = useGetOperatorValidationDataQuery(
        { OperatorId: selectedOperator?.operatorId || selectedOperator?.id || 0 },
        { skip: !selectedOperator || !(selectedOperator?.operatorId || selectedOperator?.id) }
    );

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

    React.useEffect(() => {
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

    const handleSelectOperator = (name: string) => {
        setSelectedOperatorName(name);
        const operatorObj = operatorSource.find(
            (item: any) => (item.operatorName || item.name || item.operator) === name
        );
        setSelectedOperator(operatorObj || null);
    };

    const validateForm = () => {
        if (!selectedOperatorName) {
            Alert.alert('Validation', 'Please select an operator.');
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
                    Alert.alert('Validation Error', `Length for ${field.columnName} must be between ${range.min} and ${range.max}.`);
                    return false;
                }
            }
        } else {
            if (!consumerNumber.trim()) {
                Alert.alert('Validation', 'Please enter your consumer number.');
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

    const getPrimaryConsumerNumber = () => {
        if (useFallbackFields) return consumerNumber;
        if (dynamicFields.length > 0) return formValues[dynamicFields[0].id] || '';
        return '';
    };

    const getFormAmount = () => {
        if (useFallbackFields) return amount;
        const amountField = dynamicFields.find((f) => f.columnName.toLowerCase().includes('amount'));
        return amountField ? formValues[amountField.id] || '0' : '0';
    };

    const goToBill = () => {
        if (!validateForm()) return;

        navigation.navigate('BroadbandBill', {
            operator: {
                id: selectedOperator?.operatorId || selectedOperator?.id,
                value: selectedOperator?.value || selectedOperator?.operatorId || selectedOperator?.id,
                name: selectedOperatorName,
                text: selectedOperatorName,
            },
            consumerNumber: getPrimaryConsumerNumber(),
            amount: getFormAmount(),
            dynamicValues: formValues,
            validationData: operatorValidationResponse?.data || null,
        });
    };

    const fetchBillInfo = async () => {
        if (!validateForm()) return;

        let opt1 = '', opt2 = '', opt3 = '', opt4 = '';
        if (!useFallbackFields && dynamicFields.length > 1) {
            opt1 = formValues[dynamicFields[1]?.id] || '';
            opt2 = formValues[dynamicFields[2]?.id] || '';
            opt3 = formValues[dynamicFields[3]?.id] || '';
            opt4 = formValues[dynamicFields[4]?.id] || '';
        }

        const payload = {
            operatorId: String(selectedOperator?.operatorId || selectedOperator?.id || '2'),
            mobileNo: getPrimaryConsumerNumber(),
            amount: getFormAmount(),
            optional1: opt1,
            optional2: opt2,
            optional3: opt3,
            optional4: opt4,
        };

        try {
            const response = await billinfo({ data: payload }).unwrap();
            setBillInfoData(response?.data || response);
            setIsBillInfoVisible(true);
        } catch (error: any) {
            Alert.alert('Error', error?.data?.message || 'Unable to fetch bill info.');
        }
    };

    return (
        <View style={styles.container}>
            <AppHeader
                title={config.title}
                onBackPress={() => navigation.goBack()}
                showBack
            />

            <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>

                {/* HERO BANNER */}
                <View style={styles.heroCard}>
                    <View style={styles.heroCopy}>
                        <Text style={styles.heroTitle}>
                            Pay Broadband Bills Instantly & Securely
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

                {/* PAGINATION DOTS */}
                <View style={styles.pagination}>
                    <View style={styles.activeDot} />
                    <View style={styles.dot} />
                    <View style={styles.dot} />
                </View>

                {/* FORM CARD */}
                <View style={styles.formCard}>
                    {/* OPERATOR SELECTION */}
                    <DNSDropdown
                        label={config.operatorLabel}
                        value={selectedOperatorName}
                        options={operatorOptions}
                        onSelect={handleSelectOperator}
                        placeholder="Select Operator"
                    />

                    {/* DYNAMIC FIELD RENDERING */}
                    {operatorValidationLoading || operatorValidationFetching ? (
                        <View style={styles.loadingContainer}>
                            <ActivityIndicator size="small" color={Colors.primary} />
                            <Text style={styles.loadingText}>Fetching field validation rules...</Text>
                        </View>
                    ) : selectedOperatorName && !useFallbackFields && dynamicFields.length > 0 ? (
                        /* 1. RENDER API DYNAMIC FIELDS */
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
                            })}

                            <TouchableOpacity style={styles.payButton} activeOpacity={0.9} onPress={fetchBillInfo} disabled={isFetchingBillInfo}>
                                {isFetchingBillInfo ? (
                                    <ActivityIndicator color={Colors.white} size="small" />
                                ) : (
                                    <>
                                        <Text style={styles.payButtonText}>FETCH INFO</Text>
                                        <MaterialCommunityIcons name="file-search-outline" size={20} color={Colors.white} />
                                    </>
                                )}
                            </TouchableOpacity>

                            <TouchableOpacity
                                style={[
                                    styles.payButton,
                                    { marginTop: 12 }
                                ]}
                                activeOpacity={0.9}
                                onPress={goToBill}
                            >
                                <Text style={styles.payButtonText}>PROCEED TO PAY</Text>
                                <MaterialCommunityIcons name="arrow-right" size={20} color={Colors.white} />
                            </TouchableOpacity>
                        </>
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

                            <TouchableOpacity style={styles.payButton} activeOpacity={0.9} onPress={fetchBillInfo} disabled={isFetchingBillInfo}>
                                {isFetchingBillInfo ? (
                                    <ActivityIndicator color={Colors.white} size="small" />
                                ) : (
                                    <>
                                        <Text style={styles.payButtonText}>FETCH INFO</Text>
                                        <MaterialCommunityIcons name="file-search-outline" size={20} color={Colors.white} />
                                    </>
                                )}
                            </TouchableOpacity>

                            <TouchableOpacity
                                style={[
                                    styles.payButton,
                                    { marginTop: 12 },
                                    (!selectedOperatorName || !consumerNumber.trim() || !amount || parseFloat(amount) <= 0) && { opacity: 0.5 }
                                ]}
                                activeOpacity={0.9}
                                onPress={goToBill}
                                disabled={!selectedOperatorName || !consumerNumber.trim() || !amount || parseFloat(amount) <= 0}
                            >
                                <Text style={styles.payButtonText}>PROCEED TO PAY</Text>
                                <MaterialCommunityIcons name="arrow-right" size={20} color={Colors.white} />
                            </TouchableOpacity>
                        </>
                    ) : null}

                    {/* FOOTER BADGES */}
                    <View style={styles.footerBadges}>
                        <View style={styles.footerBadgeItem}>
                            <View style={styles.badgeIconCircle}>
                                <MaterialCommunityIcons name="shield-check-outline" size={18} color={Colors.primary} />
                            </View>
                            <Text style={styles.badgeText}>100% Secure{"\n"}<Text style={styles.badgeSubText}>Safe Transactions</Text></Text>
                        </View>

                        <View style={styles.footerVerticalDivider} />

                        <View style={styles.footerBadgeItem}>
                            <View style={styles.badgeIconCircle}>
                                <MaterialCommunityIcons name="flash-outline" size={14} color={Colors.primary} />
                            </View>
                            <Text style={styles.badgeText}>Instant Recharge{"\n"}<Text style={styles.badgeSubText}>Quick & Reliable</Text></Text>
                        </View>
                    </View>
                </View>

                {/* RECENT PROVIDERS */}
                <View style={styles.sectionHeader}>
                    <Text style={styles.sectionTitle}>Recent Providers</Text>
                    <TouchableOpacity style={styles.viewAllRow} activeOpacity={0.8}>
                        <Text style={styles.viewAll}>View All</Text>
                        <MaterialCommunityIcons name="chevron-right" size={18} color={Colors.primary} />
                    </TouchableOpacity>
                </View>

                <View style={styles.providersRow}>
                    {(operatorList.length ? operatorList : config.recentData || []).slice(0, 4).map((item: any, index: number) => (
                        <TouchableOpacity
                            key={item.id || item.operatorId || index}
                            style={styles.providerCard}
                            activeOpacity={0.85}
                            onPress={() => setSelectedOperatorName(item.operatorName || item.name || item.operator)}
                        >
                            <View style={styles.logoContainer}>
                                {typeof item.logo === 'number' ? (
                                    <Image source={item.logo} style={styles.providerLogo} resizeMode="contain" />
                                ) : (
                                    <MaterialCommunityIcons name={config.icon} size={30} color={Colors.primary} />
                                )}
                            </View>
                            <Text style={styles.providerName} numberOfLines={1}>
                                {item.operatorName || item.name || item.operator}
                            </Text>
                        </TouchableOpacity>
                    ))}
                </View>

                {/* TRUST BANNER */}
                <View style={styles.trustCard}>
                    {trustItems.map(item => (
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

            <BillInfoModal
                visible={isBillInfoVisible}
                data={billInfoData}
                onClose={() => setIsBillInfoVisible(false)}
                onProceed={goToBill}
            />
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
        shadowOpacity: 0.2,
        shadowRadius: 1,
        elevation: 3,
        marginTop: 10,
    },
    heroCopy: { flex: 1.4, paddingRight: 4 },
    heroTitle: { fontSize: 16, lineHeight: 23, color: '#0A2574', fontFamily: Poppins.semiBold },
    heroSubtitle: { fontSize: 12, color: '#64748B', marginTop: 4, fontFamily: Poppins.medium },
    cashbackBox: { marginTop: 12, backgroundColor: '#FFFFFF', borderRadius: 8, paddingVertical: 6, paddingHorizontal: 8, flexDirection: 'row', alignItems: 'center', borderWidth: 1, borderColor: '#E2E8F0', alignSelf: 'flex-start' },
    cashbackIcon: { width: 24, height: 24, borderRadius: 6, backgroundColor: '#EEF2FF', justifyContent: 'center', alignItems: 'center' },
    cashbackTextWrap: { marginLeft: 8, marginRight: 12 },
    cashbackTitle: { fontSize: 12, color: '#0A2574', fontFamily: Poppins.semiBold },
    cashbackSub: { fontSize: 12, color: '#64748B', fontFamily: Poppins.medium, marginTop: 1 },
    heroArt: { flex: 1, alignItems: 'flex-end' },
    heroImage: { width: '100%', height: 115 },
    pagination: { height: 24, flexDirection: 'row', justifyContent: 'center', alignItems: 'center', gap: 6, marginVertical: 4 },
    activeDot: { width: 16, height: 6, borderRadius: 3, backgroundColor: '#0029A8' },
    dot: { width: 6, height: 6, borderRadius: 3, backgroundColor: '#CBD5E1' },
    formCard: {
        backgroundColor: Colors.white,
        borderRadius: 16,
        padding: 16,
        borderWidth: 1,
        borderColor: '#F1F5F9',
        shadowColor: Colors.primary,
        shadowOffset: { width: 2, height: 2 },
        shadowOpacity: 0.2,
        shadowRadius: 1,
        elevation: 3,
        marginTop: 10,
    },
    label: { fontSize: 12, color: Colors.textDark, fontWeight: '700' },
    optionalText: { color: Colors.textMuted, fontFamily: Poppins.regular },
    labelRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 },
    helpLink: { flexDirection: 'row', alignItems: 'center' },
    helpText: { fontSize: 12, color: Colors.primary, },
    inputWrap: { height: 45, borderWidth: 1, borderColor: '#E2E8F0', borderRadius: 10, paddingHorizontal: 12, flexDirection: 'row', alignItems: 'center', backgroundColor: '#FCFDFF' },
    input: { flex: 1, fontSize: 14, color: Colors.textDark, paddingVertical: 0 },
    loadingContainer: { flexDirection: 'row', alignItems: 'center', gap: 8, marginVertical: 12 },
    loadingText: { fontSize: 12, color: Colors.textMuted, fontWeight: '600' },
    payButton: { height: 50, borderRadius: 10, backgroundColor: Colors.primary, flexDirection: 'row', justifyContent: 'center', alignItems: 'center', marginTop: 20, gap: 8 },
    payButtonText: { color: Colors.white, fontSize: 14, fontWeight: '600', letterSpacing: 0.5 },
    sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 24, marginBottom: 12 },
    sectionTitle: { fontSize: 16, color: Colors.textDark, fontFamily: Poppins.semiBold },
    viewAllRow: { flexDirection: 'row', alignItems: 'center' },
    viewAll: { fontSize: 12, color: Colors.primary, fontFamily: Poppins.semiBold },
    providersRow: { flexDirection: 'row', justifyContent: 'space-between' },
    providerCard: {
        width: '23%',
        backgroundColor: Colors.white,
        borderRadius: 12,
        alignItems: 'center',
        borderWidth: 1,
        borderColor: '#F1F5F9',
        paddingHorizontal: 4,
        paddingBottom: 8,
        shadowColor: Colors.primary,
        shadowOffset: { width: 2, height: 2 },
        shadowOpacity: 0.2,
        shadowRadius: 1,
        elevation: 3,
        marginTop: 10,
    },
    logoContainer: { height: 50, justifyContent: 'center', alignItems: 'center', marginBottom: 6 },
    providerLogo: { width: 55, height: 35 },
    providerName: { fontSize: 12, color: '#1E293B', fontFamily: Poppins.semiBold, textAlign: 'center', textTransform: 'uppercase' },
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
        shadowColor: Colors.primary,
        shadowOffset: { width: 2, height: 2 },
        shadowOpacity: 0.2,
        shadowRadius: 1,
        elevation: 3,
    },
    trustItem: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', paddingHorizontal: 2 },
    trustIcon: { width: 30, height: 30, borderRadius: 15, justifyContent: 'center', alignItems: 'center', marginRight: 6 },
    trustCopy: { flex: 1 },
    trustTitle: { fontSize: 12, color: '#1E293B', fontFamily: Poppins.semiBold },
    trustSubtitle: { fontSize: 12, color: '#64748B', fontFamily: Poppins.medium, lineHeight: 12 },
    footerBadges: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        paddingHorizontal: 2,
        marginTop: 20,
        marginBottom: 10,
        alignItems: 'center',
        flexWrap: 'wrap',
    },
    footerBadgeItem: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    badgeIconCircle: {
        width: 32,
        height: 32,
        borderRadius: 16,
        backgroundColor: Colors.infoBg,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 6,
    },
    badgeText: {
        fontSize: 12,
        fontFamily: Poppins.bold,
        color: Colors.textDark,
        lineHeight: 12,
    },
    badgeSubText: {
        fontFamily: Poppins.medium,
        color: Colors.textSecondary,
    },
    footerVerticalDivider: {
        width: 1,
        height: 24,
        backgroundColor: Colors.divider,
    },
});

export default BroadbandRechargeScreen;