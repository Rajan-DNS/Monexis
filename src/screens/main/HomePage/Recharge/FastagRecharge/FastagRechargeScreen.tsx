import React, { useState } from 'react';
import {
    StyleSheet,
    Text,
    View,
    TextInput,
    TouchableOpacity,
    ScrollView,
    Image,
    ImageSourcePropType,
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
import { FASTAG_CONFIG } from '../../../../../data/utilityConfigs';
import { useBillinfoMutation, useGetCirclesQuery, useGetopretorQuery, useGetOperatorValidationDataQuery } from '../../../../../redux/services/mainApi/Common/CommonApi';

const quickActions = [
    { id: 'history', title: 'View Bill', subtitle: 'History', icon: 'calendar-text-outline', color: '#8B3DFF', bg: '#F0E7FF' },
    { id: 'reminder', title: 'Payment', subtitle: 'Reminders', icon: 'bell-outline', color: '#18A84C', bg: '#E8F7ED' },
    { id: 'autopay', title: 'Auto-Pay', subtitle: 'Bills', icon: 'receipt-text-clock-outline', color: '#168DDA', bg: '#E7F3FF' },
    { id: 'offers', title: 'Offers &', subtitle: 'Rewards', icon: 'ticket-percent-outline', color: '#F59A23', bg: '#FFF1DF' },
];

const trustItems = [
    { id: 'secure', title: '100% Secure', subtitle: 'Safe & Secure\nPayments', icon: 'shield-check-outline', color: Colors.primary, bg: '#EDF2FF' },
    { id: 'instant', title: 'Instant Payment', subtitle: 'Quick & Hassle\nFree', icon: 'lightning-bolt-outline', color: '#16A34A', bg: '#EAF8EE' },
    { id: 'trusted', title: 'Trusted by Millions', subtitle: 'Reliable & Secure', icon: 'shield-account-outline', color: '#F43F5E', bg: '#FFEAF0' },
];

const FastagRechargeScreen = () => {
    const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
    const config = FASTAG_CONFIG;
    
    // States
    const [selectedOperatorName, setSelectedOperatorName] = useState('');
    const [selectedOperator, setSelectedOperator] = useState<any>(null);
    const [selectedCircleName, setSelectedCircleName] = useState('');
    const [mobileNo, setMobileNo] = useState('');
    const [amount, setAmount] = useState('');
    const [billInfoData, setBillInfoData] = useState<any>(null);
    const [isBillInfoVisible, setIsBillInfoVisible] = useState(false);
    
    // Query 1: Fetch Operators list
    const { data: operatorResponse } = useGetopretorQuery({ operatorTypeId: 0 });
    const { data: circleResponse } = useGetCirclesQuery();
    
    // Derive operator source data
    const operators = operatorResponse?.data || operatorResponse?.result || operatorResponse || [];
    const circles = circleResponse?.data || circleResponse?.result || circleResponse || [];
    const operatorList = Array.isArray(operators) ? operators : [];
    const circleList = Array.isArray(circles) ? circles : [];
    const operatorSource = operatorList.length ? operatorList : config.recentData || [];
    const operatorOptions = operatorSource.map(item => item.operatorName || item.name || item.operator).filter(Boolean);
    const circleOptions = circleList.map(item => item.circleName || item.name || item.circle).filter(Boolean);
    
    // Query 2: Dynamic Operator Validation Data
    const {
        data: operatorValidationResponse,
        isLoading: operatorValidationLoading,
        isFetching: operatorValidationFetching,
    } = useGetOperatorValidationDataQuery(
        { OperatorId: selectedOperator?.id ?? 0 },
        { skip: !selectedOperator || !selectedOperator?.id }
    );
    
    // Mutation: Fetch Bill Info
    const [billinfo, { isLoading: isFetchingBillInfo }] = useBillinfoMutation();

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

    const goToBill = () => navigation.navigate(config.nextScreen as any);
    const fetchBillInfo = async () => {
        const selectedOperator = operatorSource.find(item => (item.operatorName || item.name || item.operator) === selectedOperatorName);
        const payload = {
            operatorId: String(selectedOperator?.operatorId || selectedOperator?.id || '2'),
            mobileNo,
            amount,
            optional1: '',
            optional2: '',
            optional3: '',
            optional4: '',
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

                {/* HERO BANNER SECTION */}
                <View style={styles.heroCard}>
                    <View style={styles.heroCopy}>
                        <Text style={styles.heroTitle}>
                            Recharge FASTag Instantly & Securely
                        </Text>
                        <Text style={styles.heroSubtitle}>
                            Recharge on time, zoom through toll plazas!
                        </Text>

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
                                <Text style={styles.cashbackSub}>on minimum recharge of ₹200</Text>
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

                {/* INPUT FORM CARD */}
                <View style={styles.formCard}>
                    <DNSDropdown
                        label={config.operatorLabel}
                        value={selectedOperatorName}
                        options={operatorOptions}
                        onSelect={handleSelectOperator}
                        placeholder="Select Operator"
                    />

                    <DNSDropdown
                        label="CIRCLE"
                        value={selectedCircleName}
                        options={circleOptions}
                        onSelect={setSelectedCircleName}
                        placeholder="Select Circle"
                    />

                    {/* DYNAMIC FIELD RENDERING */}
                    {operatorValidationLoading || operatorValidationFetching ? (
                        <View style={styles.validationLoader}>
                            <ActivityIndicator size="small" color={Colors.primary} />
                            <Text style={styles.validationLoaderText}>Loading operator fields...</Text>
                        </View>
                    ) : selectedOperatorName ? (
                        <>
                            <View style={styles.labelRow}>
                                <Text style={styles.label}>
                                    {validationRules?.displayname || config.consumerLabel}
                                </Text>
                                <TouchableOpacity style={styles.helpLink} activeOpacity={0.8}>
                                    <MaterialCommunityIcons name="information" size={14} color={Colors.primary} />
                                    <Text style={styles.helpText}> WHERE TO FIND?</Text>
                                </TouchableOpacity>
                            </View>

                            <View style={styles.inputWrap}>
                                <TextInput
                                    style={styles.input}
                                    placeholder={validationRules?.helptext || config.placeholder}
                                    placeholderTextColor={Colors.textMuted}
                                    keyboardType="default"
                                    value={mobileNo}
                                    onChangeText={setMobileNo}
                                />
                                <MaterialCommunityIcons name="scan-helper" size={24} color={Colors.textSecondary} />
                            </View>
                            <View style={[styles.labelRow]}>
                                <Text style={[styles.label, { marginTop: 20 }]}>ENTER THE AMOUNT</Text>

                            </View>
                            <View style={styles.inputWrap}>

                                <TextInput
                                    style={styles.input}
                                    placeholder=' ₹ Enter Amount'
                                    placeholderTextColor={Colors.textMuted}
                                    keyboardType="numeric"
                                    value={amount}
                                    onChangeText={setAmount}
                                />
                                {/* <MaterialCommunityIcons name="scan-helper" size={24} color={Colors.textSecondary} /> */}
                            </View>

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

                            <TouchableOpacity style={[styles.payButton, { marginTop: 12 }]} activeOpacity={0.9} onPress={goToBill}>
                                <Text style={styles.payButtonText}>PROCEED TO PAY</Text>
                                <MaterialCommunityIcons name="arrow-right" size={20} color={Colors.white} />
                            </TouchableOpacity>
                        </>
                    ) : null}
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
                    {(operatorList.length ? operatorList : config.recentData || []).slice(0, 4).map((item, index) => (
                        <TouchableOpacity key={item.id || item.operatorId || index} style={styles.providerCard} activeOpacity={0.85} onPress={goToBill}>
                            <View style={styles.logoContainer}>
                                {typeof item.logo === 'number' ? (
                                    <Image source={item.logo} style={styles.providerLogo} resizeMode="contain" />
                                ) : (
                                    <MaterialCommunityIcons name={config.icon} size={30} color={Colors.primary} />
                                )}
                            </View>
                            <Text style={styles.providerName} numberOfLines={1}>{item.operatorName || item.name || item.operator}</Text>
                        </TouchableOpacity>
                    ))}
                </View>

                {/* QUICK ACTIONS CARD */}
                {/* <View style={styles.actionsCard}>
                    {quickActions.map((item, index) => (
                        <TouchableOpacity key={item.id} style={styles.actionItem} activeOpacity={0.8}>
                            <View style={[styles.actionIcon, { backgroundColor: item.bg }]}>
                                <MaterialCommunityIcons name={item.icon} size={22} color={item.color} />
                            </View>
                            <Text style={styles.actionTitle}>{item.title}</Text>
                            <Text style={styles.actionSubtitle}>{item.subtitle}</Text>
                            {index < quickActions.length - 1 && <View style={styles.actionDivider} />}
                        </TouchableOpacity>
                    ))}
                </View> */}

                {/* AUTO PAY BANNER */}
                {/* <View style={styles.autopayCard}>
                    <View style={styles.autopayIcon}>
                        <MaterialCommunityIcons name={config.bannerIcon || 'calendar-clock'} size={28} color={Colors.primary} />
                    </View>
                    <View style={styles.autopayCopy}>
                        <Text style={styles.featureLabel}>NEW FEATURE</Text>
                        <Text style={styles.autopayTitle}>{config.bannerTitle}</Text>
                        <Text style={styles.autopayText}>{config.bannerDesc}</Text>
                    </View>
                    <TouchableOpacity style={styles.enableButton} activeOpacity={0.9}>
                        <Text style={styles.enableText}>Explore</Text>
                    </TouchableOpacity>
                </View> */}

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
        borderRadius: 16, backgroundColor: Colors.infoBg, padding: 16, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', minHeight: 140,
         elevation: 4,
        shadowColor: Colors.primary, 
       shadowOffset: { width: 2, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 1,
          marginTop: 10,
    },
    heroCopy: { flex: 1.4, paddingRight: 4 },
    heroTitle: { fontSize: 16, lineHeight: 23, color: Colors.primary, fontFamily: Poppins.semiBold },
    heroSubtitle: { fontSize: 12, color: Colors.infoDark, marginTop: 4, fontFamily: Poppins.medium },
    cashbackBox: { zIndex: 1, marginTop: 12, backgroundColor: Colors.white, borderRadius: 8, paddingVertical: 6, paddingHorizontal: 8, flexDirection: 'row', alignItems: 'center', borderWidth: 1, borderColor: '#E2E8F0', alignSelf: 'flex-start' },
    cashbackIcon: { width: 24, height: 24, borderRadius: 6, backgroundColor: Colors.infoBg, justifyContent: 'center', alignItems: 'center' },
    cashbackTextWrap: { marginLeft: 8, marginRight: 12 },
    cashbackTitle: { fontSize: 12, color: Colors.primary, fontFamily: Poppins.semiBold,  },
    cashbackSub: { fontSize: 12, color: Colors.infoDark, fontFamily: Poppins.medium, marginTop: 1 },
    heroArt: { flex: 1, alignItems: 'flex-end' },
    heroImage: { width: '100%', height: 115 },
    pagination: { height: 24, flexDirection: 'row', justifyContent: 'center', alignItems: 'center', gap: 6, marginVertical: 4 },
    activeDot: { width: 16, height: 6, borderRadius: 3, backgroundColor: Colors.primary },
    dot: { width: 6, height: 6, borderRadius: 3, backgroundColor: '#CBD5E1' },
    formCard: { backgroundColor: Colors.white,
         borderRadius: 16,
          padding: 16,
           borderWidth: 1, 
           borderColor: '#F1F5F9',
             elevation: 4,
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
    label: { fontSize: 12, color: Colors.textDark, fontFamily: Poppins.semiBold, marginBottom: 8 },
    dropdown: { height: 54, borderWidth: 1, borderColor: Colors.inputBorder, borderRadius: 10, paddingHorizontal: 12, flexDirection: 'row', alignItems: 'center', backgroundColor: '#FCFDFF', marginBottom: 16 },
    inputIcon: { width: 36, height: 36, borderRadius: 8, backgroundColor: Colors.bgLightest, justifyContent: 'center', alignItems: 'center' },
    dropdownText: { flex: 1, marginLeft: 12, fontSize: 16, color: Colors.textDark, fontFamily: Poppins.medium },
    labelRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 },
    helpLink: { flexDirection: 'row', alignItems: 'center' },
    helpText: { fontSize: 12, color: Colors.primary, fontFamily: Poppins.semiBold,  },
    inputWrap: { height: 45, borderWidth: 1, borderColor: Colors.inputBorder, borderRadius: 10, paddingHorizontal: 12, flexDirection: 'row', alignItems: 'center', backgroundColor: '#FCFDFF' },
    input: { flex: 1, fontSize: 16, color: Colors.textDark, fontFamily: Poppins.medium, paddingVertical: 0 },
    payButton: { height: 50, borderRadius: 10, backgroundColor: Colors.primary, flexDirection: 'row', justifyContent: 'center', alignItems: 'center', marginTop: 20, gap: 8 },
    payButtonText: { color: Colors.white, fontSize: 16, fontFamily: Poppins.semiBold, letterSpacing: 0.5 },
    sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 24, marginBottom: 12, shadowColor: Colors.primary, shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.25, shadowRadius: 10, elevation: 4 },
    sectionTitle: { fontSize: 16, color: Colors.textDark, fontFamily: Poppins.semiBold,  },
    viewAllRow: { flexDirection: 'row', alignItems: 'center' },
    viewAll: { fontSize: 12, color: Colors.primary, fontFamily: Poppins.semiBold, },
    providersRow: { flexDirection: 'row', justifyContent: 'space-between' },
    providerCard: { width: '23%', backgroundColor: Colors.white, borderRadius: 12, alignItems: 'center', borderWidth: 1, borderColor: Colors.inputBorder, paddingHorizontal: 4,
         paddingBottom: 8,
            elevation: 4,
        shadowColor: Colors.primary, 
       shadowOffset: { width: 2, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 1,
             marginTop: 10 },
    logoContainer: { height: 50, justifyContent: 'center', alignItems: 'center', marginBottom: 6 },
    providerLogo: { width: 55, height: 35 },
    providerName: { fontSize: 12, color: Colors.textDark, fontFamily: Poppins.bold,  textAlign: 'center', textTransform: 'uppercase' },
    actionsCard: { backgroundColor: Colors.white, borderRadius: 14, borderWidth: 1, borderColor: Colors.inputBorder, marginTop: 20, paddingVertical: 14, flexDirection: 'row', shadowColor: Colors.primary, shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.25, shadowRadius: 10, elevation: 2 },
    actionItem: { flex: 1, alignItems: 'center' },
    actionIcon: { width: 38, height: 38, borderRadius: 19, justifyContent: 'center', alignItems: 'center', marginBottom: 6 },
    actionTitle: { fontSize: 12, color: Colors.textDark, fontFamily: Poppins.semiBold, textAlign: 'center' },
    actionSubtitle: { fontSize: 12, color: Colors.infoDark, fontFamily: Poppins.medium, textAlign: 'center' },
    actionDivider: { position: 'absolute', right: 0, top: 8, bottom: 8, width: 1, backgroundColor: Colors.inputBorder },
    autopayCard: { borderRadius: 14, backgroundColor: '#EFF6FF', borderWidth: 1, borderColor: '#DBEAFE', marginTop: 20, padding: 14, flexDirection: 'row', alignItems: 'center', shadowColor: Colors.primary, shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.25, shadowRadius: 10, elevation: 2 },
    autopayIcon: { width: 48, height: 48, borderRadius: 24, backgroundColor: '#DBEAFE', justifyContent: 'center', alignItems: 'center' },
    autopayCopy: { flex: 1, marginLeft: 12, marginRight: 8 },
    featureLabel: { fontSize: 12, color: '#0029A8', fontFamily: Poppins.semiBold,  },
    autopayTitle: { fontSize: 16, color: '#1E293B', fontFamily: Poppins.semiBold,  marginTop: 1 },
    autopayText: { fontSize: 12, color: '#475569', fontFamily: Poppins.medium, marginTop: 2, lineHeight: 15 },
    enableButton: { backgroundColor: '#0025A2', borderRadius: 6, paddingHorizontal: 14, paddingVertical: 8 },
    enableText: { color: Colors.white, fontSize: 12, fontFamily: Poppins.semiBold,  },
    trustCard: { backgroundColor: Colors.white, borderRadius: 14, borderWidth: 1, borderColor: '#F1F5F9', 
        marginTop: 24, paddingVertical: 12, 
        paddingHorizontal: 8,
         flexDirection: 'row',
          justifyContent: 'space-between',
             elevation: 4,
        shadowColor: Colors.primary, 
       shadowOffset: { width: 2, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 1,},
    trustItem: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', paddingHorizontal: 2 },
    trustIcon: { width: 30, height: 30, borderRadius: 15, justifyContent: 'center', alignItems: 'center', marginRight: 6 },
    trustCopy: { flex: 1 },
    trustTitle: { fontSize: 12, color: '#1E293B', fontFamily: Poppins.semiBold,  },
    trustSubtitle: { fontSize: 12, color: '#64748B', fontFamily: Poppins.medium, lineHeight: 12 },
    footerBadges: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        paddingHorizontal: 16,
        marginTop: 40,
        marginBottom: 20,
        alignItems: 'center',
    },
    footerBadgeItem: {
        flexDirection: 'row',
        alignItems: 'center',
        width: '30%',
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

export default FastagRechargeScreen;
