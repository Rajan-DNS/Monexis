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
import Colors from '../../../../theme/colors';
import { Poppins } from '../../../../theme/typography';
import AppHeader from '../../../../components/Header/AppHeader';
import DNSDropdown from '../../../../components/DNSDropdown';
import { useGetopretorQuery, useGetOperatorValidationDataQuery } from '../../../../redux/services/mainApi/Common/CommonApi';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../../../navigation/RootNavigator';
import DateTimePicker from '@react-native-community/datetimepicker';

const trustItems = [
    { id: 'secure', title: '100% Secure', subtitle: 'Safe & Secure\nPayments', icon: 'shield-check-outline', color: Colors.primary, bg: '#EDF2FF' },
    { id: 'instant', title: 'Instant Payment', subtitle: 'Quick & Hassle\nFree', icon: 'lightning-bolt-outline', color: '#16A34A', bg: '#EAF8EE' },
    { id: 'trusted', title: 'Trusted by Millions', subtitle: 'Reliable & Secure', icon: 'shield-account-outline', color: '#F43F5E', bg: '#FFEAF0' },
];

const BookNewPolicyScreen = () => {
    const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();

    // ---------------------------------------------------------------------------
    // 1. ALL HOOKS MUST BE DECLARED UNCONDITIONALLY AT THE VERY TOP
    // ---------------------------------------------------------------------------

    // States
    const [selectedOperatorName, setSelectedOperatorName] = useState('');
    const [selectedOperator, setSelectedOperator] = useState<any>(null);
    const [customerNumber, setCustomerNumber] = useState('');
    const [amount, setAmount] = useState('');
    const [email, setEmail] = useState('');
    const [dob, setDob] = useState('');
    const [showDatePicker, setShowDatePicker] = useState(false);
    const [date, setDate] = useState(new Date());

    // Query 1: Fetch Operators list (operatorTypeId 10 for LIC/Insurance)
    const { data: operatorResponse } = useGetopretorQuery({ operatorTypeId:  6 });

    // Derive operator source data
    const operators = operatorResponse?.data || operatorResponse?.result || operatorResponse || [];
    const operatorList = Array.isArray(operators) ? operators : [];
    const operatorSource = operatorList.length ? operatorList : [];
    const operatorOptions = operatorSource.map((item: any) => item.operatorName || item.name || item.operator).filter(Boolean);

    // Query 2: Dynamic Operator Validation Data (Skipped safely when no operator is selected)
    const {
        data: operatorValidationResponse,
        isLoading: operatorValidationLoading,
        isFetching: operatorValidationFetching,
    } = useGetOperatorValidationDataQuery(
        { OperatorId: selectedOperator?.id || selectedOperator?.operatorId || 0 },
        { skip: !selectedOperator || !(selectedOperator?.id || selectedOperator?.operatorId) }
    );

    // Reset dynamic form values when operator selection changes
    useEffect(() => {
        setCustomerNumber('');
        setAmount('');
        setEmail('');
        setDob('');
    }, [selectedOperatorName]);

    // ---------------------------------------------------------------------------
    // HANDLERS
    // ---------------------------------------------------------------------------

    const validationRules = operatorValidationResponse?.data || operatorValidationResponse?.result || operatorValidationResponse;

    const handleSelectOperator = (name: string) => {
        setSelectedOperatorName(name);
        const operatorObj = operatorSource.find(
            (item: any) => (item.operatorName || item.name || item.operator) === name
        );
        setSelectedOperator(operatorObj || null);
    };

    const onChangeDate = (event: any, selectedDate?: Date) => {
        setShowDatePicker(false);
        if (selectedDate) {
            setDate(selectedDate);
            const dd = String(selectedDate.getDate()).padStart(2, '0');
            const mm = String(selectedDate.getMonth() + 1).padStart(2, '0');
            const yyyy = selectedDate.getFullYear();
            setDob(`${dd}/${mm}/${yyyy}`);
        }
    };

    const handleAmountChange = (text: string) => {
        // Strip non-numeric input and leading zeros
        const sanitized = text.replace(/[^0-9]/g, '').replace(/^0+/, '');
        setAmount(sanitized);
    };

    const calculatePremium = () => {
        const numericAmount = parseInt(amount.replace(/[^0-9]/g, ''), 10) || 0;
        return `₹ ${numericAmount.toLocaleString('en-IN')}`;
    };

    const handleBooking = () => {
        if (!selectedOperatorName) {
            Alert.alert('Validation', 'Please select an operator.');
            return;
        }
        if (!customerNumber.trim()) {
            Alert.alert('Validation', 'Please enter customer number.');
            return;
        }
        const numAmount = parseFloat(amount);
        if (!amount || isNaN(numAmount) || numAmount <= 0) {
            Alert.alert('Validation', 'Please enter a valid amount.');
            return;
        }

        const calculatedPremium = calculatePremium();

        const policyDetailsPayload = {
            policyNumber: customerNumber,
            status: 'Pending',
            policyType: selectedOperatorName,
            planNo: 'LIC Premium',
            customer: {
                name: customerNumber,
                dob,
                email,
            },
            info: {
                sumAssured: calculatedPremium,
                premiumYearly: calculatedPremium,
                nextDueDate: '',
                policyTerm: 'Premium Bill',
            },
            operatorId: selectedOperator?.id || selectedOperator?.operatorId,
            amount: amount,
            operatorName: selectedOperatorName,
        };

        navigation.navigate('PolicyDetailsScreen' as any, { policyData: policyDetailsPayload });
    };

    return (
        <View style={styles.container}>
            <AppHeader
                title="Insurance Premium Bill"
                onBackPress={() => navigation.goBack()}
                showBack
            />

            <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>

                {/* HERO BANNER SECTION */}
                <View style={styles.heroCard}>
                    <View style={styles.heroCopy}>
                        <Text style={styles.heroTitle}>
                            Pay Insurance Premium Instantly & Securely
                        </Text>
                        <Text style={styles.heroSubtitle}>Pay your insurance bills on time, stay protected!</Text>

                        <TouchableOpacity style={styles.cashbackBox} activeOpacity={0.8}>
                            <View style={styles.cashbackIcon}>
                                <MaterialCommunityIcons
                                    name="ticket-percent"
                                    size={16}
                                    color="#4F46E5"
                                />
                            </View>
                            <View style={styles.cashbackTextWrap}>
                                <Text style={styles.cashbackTitle}>Get Flat ₹25 Cashback</Text>
                                <Text style={styles.cashbackSub}>on minimum premium of ₹200</Text>
                            </View>
                            <MaterialCommunityIcons
                                name="chevron-right"
                                size={16}
                                color="#0A2574"
                            />
                        </TouchableOpacity>
                    </View>

                    <View style={styles.heroArt}>
                        <Image
                            source={require('../../../../Assets/img/DTH/rech.png')}
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

                {/* INPUT FORM CARD */}
                <View style={styles.formCard}>
                    <DNSDropdown
                        label="INSURANCE OPERATOR"
                        value={selectedOperatorName}
                        options={operatorOptions}
                        onSelect={handleSelectOperator}
                        placeholder="Select Operator"
                    />

                    {/* DYNAMIC FIELD RENDERING */}
                    {operatorValidationLoading || operatorValidationFetching ? (
                        <View style={styles.validationLoader}>
                            <ActivityIndicator size="small" color={Colors.primary} />
                            <Text style={styles.validationLoaderText}>Loading operator details...</Text>
                        </View>
                    ) : selectedOperatorName ? (
                        <>
                            <View style={styles.labelRow}>
                                <Text style={styles.label}>
                                    {validationRules?.displayname?.toUpperCase() || 'CUSTOMER NUMBER'}
                                </Text>
                                <TouchableOpacity style={styles.helpLink} activeOpacity={0.8}>
                                    <MaterialCommunityIcons name="information" size={14} color={Colors.primary} />
                                    <Text style={styles.helpText}> WHERE TO FIND?</Text>
                                </TouchableOpacity>
                            </View>

                            <View style={styles.inputWrap}>
                                <TextInput
                                    style={styles.input}
                                    placeholder={validationRules?.helptext || 'Enter customer number'}
                                    placeholderTextColor={Colors.textMuted}
                                    keyboardType="default"
                                    value={customerNumber}
                                    onChangeText={setCustomerNumber}
                                />
                                <MaterialCommunityIcons name="scan-helper" size={24} color={Colors.textSecondary} />
                            </View>

                            <View style={styles.labelRow}>
                                <Text style={[styles.label, { marginTop: 20 }]}>PREMIUM AMOUNT</Text>
                            </View>
                            <View style={styles.inputWrap}>
                                <TextInput
                                    style={styles.input}
                                    placeholder="₹ Enter Amount"
                                    placeholderTextColor={Colors.textMuted}
                                    keyboardType="numeric"
                                    value={amount}
                                    onChangeText={handleAmountChange}
                                />
                            </View>

                            <View style={styles.labelRow}>
                                <Text style={[styles.label, { marginTop: 20 }]}>EMAIL (OPTIONAL)</Text>
                            </View>
                            <View style={styles.inputWrap}>
                                <TextInput
                                    style={styles.input}
                                    placeholder="Enter email address"
                                    placeholderTextColor={Colors.textMuted}
                                    keyboardType="email-address"
                                    autoCapitalize="none"
                                    value={email}
                                    onChangeText={setEmail}
                                />
                                <MaterialCommunityIcons name="email-outline" size={24} color={Colors.textSecondary} />
                            </View>

                            <View style={styles.labelRow}>
                                <Text style={[styles.label, { marginTop: 20 }]}>DATE OF BIRTH (OPTIONAL)</Text>
                            </View>
                            <TouchableOpacity style={styles.inputWrap} onPress={() => setShowDatePicker(true)} activeOpacity={0.8}>
                                <TextInput
                                    style={styles.input}
                                    placeholder="DD/MM/YYYY"
                                    placeholderTextColor={Colors.textMuted}
                                    value={dob}
                                    editable={false}
                                    pointerEvents="none"
                                />
                                <MaterialCommunityIcons name="calendar" size={24} color={Colors.textSecondary} />
                            </TouchableOpacity>

                            {showDatePicker && (
                                <DateTimePicker
                                    value={date}
                                    mode="date"
                                    display="default"
                                    onChange={onChangeDate}
                                    maximumDate={new Date()}
                                />
                            )}

                            <TouchableOpacity
                                style={[
                                    styles.payButton,
                                    { marginTop: 20 },
                                    (!selectedOperatorName || !customerNumber.trim() || !amount || parseFloat(amount) <= 0) && { opacity: 0.5 }
                                ]}
                                activeOpacity={0.9}
                                onPress={handleBooking}
                                disabled={!selectedOperatorName || !customerNumber.trim() || !amount || parseFloat(amount) <= 0}
                            >
                                <Text style={styles.payButtonText}>PROCEED TO PAY</Text>
                                <MaterialCommunityIcons name="arrow-right" size={20} color={Colors.white} />
                            </TouchableOpacity>
                        </>
                    ) : null}

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
                                <MaterialCommunityIcons name="flash-outline" size={18} color={Colors.primary} />
                            </View>
                            <Text style={styles.badgeText}>Instant Payment{"\n"}<Text style={styles.badgeSubText}>Quick & Reliable</Text></Text>
                        </View>
                    </View>
                </View>

                {/* RECENT PROVIDERS SECTION */}
                <View style={styles.sectionHeader}>
                    <Text style={styles.sectionTitle}>Recent Providers</Text>
                    <TouchableOpacity style={styles.viewAllRow} activeOpacity={0.8}>
                        <Text style={styles.viewAll}>View All</Text>
                        <MaterialCommunityIcons name="chevron-right" size={18} color={Colors.primary} />
                    </TouchableOpacity>
                </View>

                <View style={styles.providersRow}>
                    {(operatorList.length ? operatorList : []).slice(0, 4).map((item: any, index: number) => {
                        const name = item.operatorName || item.name || item.operator;
                        return (
                            <TouchableOpacity
                                key={item.id || item.operatorId || index}
                                style={styles.providerCard}
                                activeOpacity={0.85}
                                onPress={() => handleSelectOperator(name)}
                            >
                                <View style={styles.logoContainer}>
                                    <MaterialCommunityIcons name="shield-account" size={30} color={Colors.primary} />
                                </View>
                                <Text style={styles.providerName} numberOfLines={1}>{name}</Text>
                            </TouchableOpacity>
                        );
                    })}
                </View>

                {/* TRUST BANNER SECTION */}
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
        </View>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#FAFBFF' },
    scrollContent: { padding: 16, paddingBottom: 32 },
    heroCard: {
        borderRadius: 16, backgroundColor: '#F4F7FF', padding: 16,
        flexDirection: 'row', justifyContent: 'space-between',
        alignItems: 'center',
        shadowColor: Colors.primary,
        shadowOffset: { width: 2, height: 2 },
        shadowOpacity: 0.25,
        shadowRadius: 1,
        marginTop: 10,
        elevation: 4
    },
    heroCopy: { flex: 1.4, paddingRight: 4 },
    heroTitle: { fontSize: 16, lineHeight: 23, color: '#0A2574', fontFamily: Poppins.semiBold },
    heroSubtitle: { fontSize: 12, color: '#64748B', marginTop: 4, fontFamily: Poppins.medium },
    cashbackBox: {
        marginTop: 12, backgroundColor: '#FFFFFF', borderRadius: 8,
        paddingVertical: 6,
        paddingHorizontal: 8,
        flexDirection: 'row',
        alignItems: 'center',
        borderWidth: 1,
        borderColor: '#E2E8F0',
        alignSelf: 'flex-start', zIndex: 1
    },
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
        borderRadius: 16, padding: 16,
        borderWidth: 1, borderColor: '#F1F5F9',
        elevation: 3,
        shadowColor: Colors.primary,
        shadowOffset: { width: 2, height: 2 },
        shadowOpacity: 0.25,
        shadowRadius: 1,
    },
    validationLoader: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 16,
        gap: 8,
    },
    validationLoaderText: {
        fontSize: 13,
        color: Colors.textMuted,
        fontFamily: Poppins.medium,
    },
    label: { fontSize: 12, color: '#475569', fontFamily: Poppins.semiBold },
    labelRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 },
    helpLink: { flexDirection: 'row', alignItems: 'center' },
    helpText: { fontSize: 12, color: '#0029A8', fontFamily: Poppins.semiBold },
    inputWrap: { height: 50, borderWidth: 1, borderColor: '#E2E8F0', borderRadius: 10, paddingHorizontal: 12, flexDirection: 'row', alignItems: 'center', backgroundColor: '#FCFDFF' },
    input: { flex: 1, fontSize: 16, color: '#1E293B', fontFamily: Poppins.medium, paddingVertical: 0 },
    payButton: { height: 50, borderRadius: 10, backgroundColor: '#0025A2', flexDirection: 'row', justifyContent: 'center', alignItems: 'center', marginTop: 20, gap: 8 },
    payButtonText: { color: Colors.white, fontSize: 16, fontFamily: Poppins.semiBold, letterSpacing: 0.5 },
    sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 24, marginBottom: 12 },
    sectionTitle: { fontSize: 16, color: '#0F172A', fontFamily: Poppins.semiBold },
    viewAllRow: { flexDirection: 'row', alignItems: 'center' },
    viewAll: { fontSize: 12, color: '#0029A8', fontFamily: Poppins.semiBold },
    providersRow: { flexDirection: 'row', justifyContent: 'space-between', flexWrap: 'wrap' },
    providerCard: {
        width: '23%',
        backgroundColor: Colors.white,
        borderRadius: 12, alignItems: 'center',
        borderWidth: 1, borderColor: '#F1F5F9',
        paddingHorizontal: 4, paddingBottom: 8,
        shadowColor: Colors.primary,
        shadowOffset: { width: 2, height: 2 },
        shadowOpacity: 0.25,
        shadowRadius: 1,
        elevation: 3,
        marginTop: 10
    },
    logoContainer: { height: 50, justifyContent: 'center', alignItems: 'center', marginBottom: 6 },
    providerName: { fontSize: 12, color: '#1E293B', fontFamily: Poppins.semiBold, textAlign: 'center', textTransform: 'uppercase' },
    trustCard: {
        backgroundColor: Colors.white, borderRadius: 14, borderWidth: 1,
        borderColor: '#F1F5F9',
        marginTop: 24, paddingVertical: 12,
        paddingHorizontal: 8,
        flexDirection: 'row',
        justifyContent: 'space-between',
        shadowColor: Colors.primary,
        shadowOffset: { width: 2, height: 2 },
        shadowOpacity: 0.25,
        shadowRadius: 1,
        elevation: 2
    },
    trustItem: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', paddingHorizontal: 2 },
    trustIcon: { width: 30, height: 30, borderRadius: 15, justifyContent: 'center', alignItems: 'center', marginRight: 6 },
    trustCopy: { flex: 1 },
    trustTitle: { fontSize: 12, color: '#1E293B', fontFamily: Poppins.semiBold },
    trustSubtitle: { fontSize: 12, color: '#64748B', fontFamily: Poppins.medium, lineHeight: 12 },
    footerBadges: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        paddingHorizontal: 16,
        marginTop: 20,
        marginBottom: 10,
        alignItems: 'center',
        flexWrap: 'wrap'
    },
    footerBadgeItem: { flexDirection: 'row', alignItems: 'center' },
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

export default BookNewPolicyScreen;