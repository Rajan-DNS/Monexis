import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
    StyleSheet,
    View,
    Text,
    ScrollView,
    Image,
    TouchableOpacity,
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Colors, Radius, Spacing } from '../../../../../theme';
import { Poppins } from '../../../../../theme/typography';
import AppHeader from '../../../../../components/Header/AppHeader';
import { RootStackParamList } from '../../../../../navigation/RootNavigator';
import { GAS_BILL_CONFIG } from '../../../../../data/utilityConfigs';
import { FontSize, IconSize } from '../../../../../theme/spacing';
import PaymentAuthModal from '../../../../../components/Modals/PaymentAuthModal';
import StatusModal from '../../../../../components/Modals/StatusModal';
import { useBillpayMutation } from '../../../../../redux/services/mainApi/Common/CommonApi';
import { useDeviceLocation } from '../../../../../hooks/useDeviceLocation';
import LocationInfoCard from '../../../../../components/LocationInfoCard';

export interface Plan {
    price: string;
    validity: string;
    tag?: string;
}

export interface BillConfig {
    title: string;
    operatorName: string;
    operatorIcon: string;
    consumerLabel: string;
    consumerValue: string;
    validity?: string;
    currentAmount: string;
    plans?: Plan[];
    nextScreen: keyof RootStackParamList;
    insights?: {
        avgMonthly: string;
        dueDate: string;
    };
    offers?: Array<{ title: string; desc: string; type: 'apply' }>;
    priceBreakdown?: Array<{ label: string; value: string }>;
}

const GasBill: React.FC<any> = () => {
    const route = useRoute<RouteProp<RootStackParamList, 'GasBill'>>();
    const params = route.params || {} as any;

    const config = {
        ...GAS_BILL_CONFIG,
        consumerValue: params.consumerNumber || GAS_BILL_CONFIG.consumerValue,
        currentAmount: params.amount || GAS_BILL_CONFIG.currentAmount,
        operator: params.operator?.id || params.operator?.value || GAS_BILL_CONFIG.operator,
        operatorName: params.operator?.name || params.operator?.text || GAS_BILL_CONFIG.operatorName,
    };

    const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
    const [selectedPayment, setSelectedPayment] = useState('wallet');
    const [isPaymentModalVisible, setPaymentModalVisible] = useState(false);
    const [modalConfig, setModalConfig] = useState<{ isVisible: boolean; type: 'success' | 'error'; title: string; message: string }>({
        isVisible: false,
        type: 'success',
        title: '',
        message: '',
    });

    const [payBill, { isLoading: isPaying }] = useBillpayMutation();
    const {
        deviceModel,
        locationCoords,
        locationString,
        permissionStatus,
        isLoading: locationLoading,
        errorType: locationErrorType,
        errorMessage: locationErrorMessage,
        returnedFromSettings,
        openSettings,
        retryLocation,
    } = useDeviceLocation();

    // Use Refs to ensure handlePaymentSuccess always accesses the latest values
    const deviceRef = useRef(deviceModel);
    const locationCoordsRef = useRef(locationCoords);
    const locationStringRef = useRef(locationString);

    useEffect(() => {
        deviceRef.current = deviceModel;
        locationCoordsRef.current = locationCoords;
        locationStringRef.current = locationString;
    }, [deviceModel, locationCoords, locationString]);

    // Check if location and device details are available
    const isPaymentEnabled = !!deviceModel && !!locationCoords;

    const handlePaymentSuccess = useCallback(async (pin?: string, biometricState?: any) => {
        setPaymentModalVisible(false);

        // Fetch latest details from refs to prevent closure issues
        const currentDevice = deviceRef.current || 'Unknown Device';
        const rawLocationStr = locationStringRef.current;
        const rawCoords = locationCoordsRef.current;

        let currentLocation = 'Location not available';
        if (rawLocationStr && rawLocationStr !== 'Location not available') {
            currentLocation = rawLocationStr;
        } else if (rawCoords) {
            currentLocation = `latitude: ${rawCoords.latitude}, longitude: ${rawCoords.longitude}`;
        }

        const finalPin = pin || biometricState?.tPin || '';

        try {
            const payload = {
                operatorId: config.operator || 0,
                mobileNo: config.consumerValue,
                amount: config.currentAmount,
                addedById: 0,
                mediumId: 2,
                deviceInfo: currentDevice,
                locationinfo: currentLocation,
                tPin: finalPin,
            };

            console.log('Sending PayBill Payload:', payload);

            const response = await payBill({ data: payload }).unwrap();
            console.log('PayBill Response:', response);

            if (response.success) {
                navigation.navigate(config.nextScreen as any, {
                    responseData: response,
                    amount: config.currentAmount,
                    consumerNumber: config.consumerValue,
                    operatorName: config.operatorName,
                });
            } else {
                setModalConfig({
                    isVisible: true,
                    type: 'error',
                    title: 'Error',
                    message: response.message || 'Something went wrong during payment.',
                });
            }
        } catch (error: any) {
            setModalConfig({
                isVisible: true,
                type: 'error',
                title: 'Error',
                message: error?.data?.message || 'Something went wrong during payment.',
            });
        }
    }, [config, payBill, navigation]);

    return (
        <View style={styles.container}>
            <AppHeader
                title={config.title || 'Gas Bill'}
                onBackPress={() => navigation.goBack()}
                showBack
            />

            <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
                <View style={styles.topPromoBanner}>
                    <View style={styles.promoIconBg}>
                        <MaterialCommunityIcons name="fire" size={IconSize.xl} color={Colors.primary} />
                    </View>
                    <View style={styles.promoTextContainer}>
                        <Text style={styles.promoTitle}>Piped Gas Bill</Text>
                        <Text style={styles.promoSubtitle}>Instant payment. Avoid late fees and penalties.</Text>
                    </View>
                </View>

                {/* Main Payment Card */}
                <LinearGradient
                    colors={[Colors.primaryDark, Colors.primary]}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 0 }}
                    style={styles.operatorCard}
                >
                    <View style={{ padding: 20 }}>
                        <View style={styles.cardHeader}>
                            <View style={styles.iconContainer}>
                                <MaterialCommunityIcons name={config.operatorIcon || 'fire'} size={28} color={Colors.white} />
                            </View>
                            <View style={styles.operatorInfo}>
                                <Text style={styles.operatorLabel}>GAS OPERATOR</Text>
                                <Text style={styles.operatorName}>{config.operatorName}</Text>
                            </View>
                        </View>

                        {config.priceBreakdown && (
                            <View style={styles.breakdownSection}>
                                {config.priceBreakdown.map((item, idx) => (
                                    <View key={idx} style={styles.breakdownRow}>
                                        <Text style={styles.breakdownLabel}>{item.label}</Text>
                                        <Text style={styles.breakdownValue}>₹{item.value}</Text>
                                    </View>
                                ))}
                            </View>
                        )}

                        <View style={styles.infoRow}>
                            <Text style={styles.infoLabel}>{config.consumerLabel || 'Consumer No'}</Text>
                            <Text style={styles.infoValue}>{config.consumerValue}</Text>
                        </View>

                        <View style={styles.divider} />

                        <View style={styles.planSection}>
                            <View style={{ flex: 1 }}>
                                <Text style={styles.infoLabel}>Bill Amount</Text>
                                <Text style={styles.priceValue}>₹ {config.currentAmount}</Text>
                            </View>
                            {config.insights?.dueDate && (
                                <View style={styles.validityBadge}>
                                    <View style={styles.validityTag}>
                                        <Text style={styles.validityTagText}>Due Date</Text>
                                    </View>
                                    <View style={styles.validityRow}>
                                        <MaterialCommunityIcons name="calendar-month" size={18} color={Colors.white} />
                                        <Text style={styles.validityText}>{config.insights.dueDate}</Text>
                                    </View>
                                </View>
                            )}
                        </View>
                    </View>
                </LinearGradient>

                {/* Payment Method */}
                <Text style={styles.sectionTitle}>Payment Method</Text>
                <View style={styles.paymentMethods}>
                    <PaymentOption
                        id="wallet"
                        title="NextGen Wallet"
                        subtitle={`Balance: ₹${config.currentAmount}`}
                        icon="wallet-outline"
                        selected={selectedPayment === 'wallet'}
                        onSelect={setSelectedPayment}
                    />
                </View>

                {/* Bill Summary */}
                <Text style={styles.sectionTitle}>Bill Summary</Text>
                <View style={styles.summaryCard}>
                    <SummaryRow label="Subtotal" value={`₹${config.currentAmount}`} />
                    <SummaryRow label="Convenience Fee" value="FREE" isSuccess />
                    <View style={styles.summaryDivider} />
                    <View style={styles.totalRow}>
                        <Text style={styles.totalLabel}>Total Payable</Text>
                        <Text style={styles.totalValue}>₹{config.currentAmount}</Text>
                    </View>
                </View>

                {/* Wallet Badge */}
                <View style={styles.walletBadge}>
                    <MaterialCommunityIcons name="shield-check-outline" size={20} color={Colors.successDark} />
                    <Text style={styles.walletBadgeText}>PAID VIA NEXTGEN WALLET</Text>
                </View>

                {/* Available Offers */}
                {config.offers && config.offers.length > 0 && (
                    <>
                        <View style={styles.sectionHeader}>
                            <Text style={styles.sectionTitle}>Available Offers</Text>
                            <TouchableOpacity><Text style={styles.viewAll}>VIEW ALL</Text></TouchableOpacity>
                        </View>
                        <View style={styles.offersContainer}>
                            {config.offers.map((offer, idx) => (
                                <View key={idx} style={styles.offerCard}>
                                    <View style={styles.offerIconBox}>
                                        <MaterialCommunityIcons name="tag" size={20} color={Colors.primary} />
                                    </View>
                                    <View style={{ flex: 1, marginLeft: 12 }}>
                                        <Text style={styles.offerTitle}>{offer.title}</Text>
                                        <Text style={styles.offerDesc}>{offer.desc}</Text>
                                    </View>
                                    <TouchableOpacity style={styles.applyButton}>
                                        <Text style={styles.applyText}>APPLY</Text>
                                    </TouchableOpacity>
                                </View>
                            ))}
                        </View>
                    </>
                )}

                <LocationInfoCard
                    deviceModel={deviceModel}
                    locationCoords={locationCoords}
                    locationString={locationString}
                    permissionStatus={permissionStatus}
                    isLoading={locationLoading}
                    openSettings={openSettings}
                    retryLocation={retryLocation}
                    errorType={locationErrorType}
                    errorMessage={locationErrorMessage}
                    returnedFromSettings={returnedFromSettings}
                />

                {/* Pay Button */}
                <TouchableOpacity
                    style={[styles.payButton, (!isPaymentEnabled || isPaying) && { opacity: 0.6 }]}
                    onPress={() => setPaymentModalVisible(true)}
                    disabled={!isPaymentEnabled || isPaying}
                >
                    <Text style={styles.payButtonText}>
                        Pay Now ₹{config.currentAmount}
                    </Text>
                    <MaterialCommunityIcons
                        name="arrow-right"
                        size={24}
                        color={Colors.white}
                    />
                </TouchableOpacity>

                {/* Payment Insights */}
                {config.insights && (
                    <>
                        <Text style={styles.sectionTitle}>PAYMENT INSIGHTS</Text>
                        <View style={styles.insightsRow}>
                            <View style={[styles.insightCard, { borderColor: Colors.infoLight }]}>
                                <View style={styles.insightIconCircle}>
                                    <MaterialCommunityIcons name="trending-up" size={16} color={Colors.primary} />
                                </View>
                                <Text style={styles.insightLabel}>AVG. MONTHLY</Text>
                                <Text style={styles.insightValue}>₹{config.insights.avgMonthly}</Text>
                            </View>
                            <View style={[styles.insightCard, { borderColor: Colors.warningLight }]}>
                                <View style={styles.insightIconCircle}>
                                    <MaterialCommunityIcons name="clock-outline" size={16} color={Colors.warningText} />
                                </View>
                                <Text style={styles.insightLabel}>DUE DATE</Text>
                                <Text style={styles.insightValue}>{config.insights.dueDate}</Text>
                            </View>
                        </View>
                    </>
                )}
            </ScrollView>

            <PaymentAuthModal
                visible={isPaymentModalVisible}
                amount={config.currentAmount}
                onSuccess={handlePaymentSuccess}
                onClose={() => setPaymentModalVisible(false)}
            />

            <StatusModal
                isVisible={modalConfig.isVisible}
                type={modalConfig.type}
                title={modalConfig.title}
                message={modalConfig.message}
                onClose={() => setModalConfig({ ...modalConfig, isVisible: false })}
            />
        </View>
    );
};

const PaymentOption = ({ id, title, subtitle, icon, selected, onSelect }: any) => (
    <TouchableOpacity
        style={[styles.paymentItem, selected && styles.paymentItemSelected]}
        onPress={() => onSelect(id)}
    >
        <View style={styles.paymentIconBox}>
            <MaterialCommunityIcons name={icon} size={24} color={Colors.primary} />
        </View>
        <View style={{ flex: 1, marginLeft: 12 }}>
            <Text style={styles.paymentTitle}>{title}</Text>
            <Text style={styles.paymentSub}>{subtitle}</Text>
        </View>
        <MaterialCommunityIcons
            name={selected ? 'radiobox-marked' : 'radiobox-blank'}
            size={24}
            color={selected ? Colors.primary : Colors.inputBorder}
        />
    </TouchableOpacity>
);

const SummaryRow = ({ label, value, isSuccess }: any) => (
    <View style={styles.summaryRow}>
        <Text style={styles.summaryLabel}>{label}</Text>
        <Text style={[styles.summaryValue, isSuccess && { color: Colors.warningText }]}>{value}</Text>
    </View>
);

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: Colors.bg },
    scrollContent: { padding: 20 },
    operatorCard: {
        borderRadius: Radius.md,
        elevation: 4,
        shadowColor: Colors.primary,
        shadowOffset: { width: 2, height: 2 },
        shadowOpacity: 0.25,
        shadowRadius: 1,
    },
    cardHeader: { flexDirection: 'row', alignItems: 'center', gap: 20 },
    iconContainer: {
        width: 60, height: 60, borderRadius: 16,
        backgroundColor: 'rgba(255,255,255,0.1)',
        borderWidth: 1, borderColor: 'rgba(255,255,255,0.3)',
        justifyContent: 'center', alignItems: 'center',
    },
    operatorInfo: { flex: 1 },
    operatorLabel: {
        color: 'rgba(255,255,255,0.7)', fontSize: 12, letterSpacing: 0.5,
        fontFamily: Poppins.semiBold,
    },
    operatorName: { color: Colors.white, fontSize: 20, marginTop: 2, fontFamily: Poppins.semiBold },
    infoRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 12 },
    infoLabel: { color: 'rgba(255,255,255,0.8)', fontSize: 16, fontFamily: Poppins.semiBold },
    infoValue: { color: Colors.white, fontSize: 20, fontFamily: Poppins.semiBold },
    divider: { height: 1, backgroundColor: 'rgba(255,255,255,0.2)', marginVertical: 20 },
    planSection: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-end' },
    priceValue: { color: Colors.white, fontSize: 20, marginTop: 4, fontFamily: Poppins.semiBold },
    validityBadge: { alignItems: 'flex-end' },
    validityTag: { backgroundColor: 'rgba(255,255,255,0.1)', paddingHorizontal: 12, paddingVertical: 4, borderRadius: 20, borderWidth: 1, borderColor: 'rgba(255,255,255,0.5)', marginBottom: 8 },
    validityTagText: { color: Colors.white, fontSize: 12, fontFamily: Poppins.semiBold },
    validityRow: { flexDirection: 'row', alignItems: 'center' },
    validityText: { color: Colors.white, fontSize: 16, marginLeft: 6, fontFamily: Poppins.semiBold },

    sectionTitle: { fontSize: 16, color: Colors.textDark, marginTop: 28, marginBottom: 16, fontFamily: Poppins.semiBold },
    sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 28, marginBottom: 16 },
    viewAll: { color: Colors.primary, fontSize: 12, fontFamily: Poppins.semiBold },

    paymentMethods: { gap: 12 },
    paymentItem: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: Colors.white,
        padding: 16,
        borderRadius: Radius.md,
        borderWidth: 1,
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
        shadowColor: Colors.primary,
        elevation: 4,
    },
    paymentItemSelected: { borderColor: Colors.primary, backgroundColor: Colors.infoBg },
    paymentIconBox: { width: 48, height: 48, borderRadius: 24, backgroundColor: Colors.bgInput, justifyContent: 'center', alignItems: 'center' },
    paymentTitle: { fontSize: 16, color: Colors.textDark, fontFamily: Poppins.semiBold },
    paymentSub: { fontSize: 12, color: Colors.textSecondary, marginTop: 2, fontFamily: Poppins.semiBold },

    summaryCard: {
        backgroundColor: Colors.bgInput,
        borderRadius: Radius.md,
        padding: 20,
        marginTop: 4,
        elevation: 4,
        shadowColor: Colors.primary,
        shadowOffset: { width: 2, height: 2 },
        shadowOpacity: 0.25,
        shadowRadius: 1,
    },
    summaryRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 12 },
    summaryLabel: { color: Colors.textSecondary, fontSize: 16, fontFamily: Poppins.semiBold },
    summaryValue: { color: Colors.textDark, fontSize: 16, fontFamily: Poppins.semiBold },
    summaryDivider: { height: 1, backgroundColor: Colors.divider, marginVertical: 12 },
    totalRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
    totalLabel: { fontSize: 16, color: Colors.textDark, fontFamily: Poppins.semiBold },
    totalValue: { fontSize: 20, color: Colors.textDark, fontFamily: Poppins.semiBold },

    walletBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: Colors.successLight,
        paddingVertical: 10,
        borderRadius: 8,
        marginVertical: 20,
        borderWidth: 1,
        borderColor: Colors.successBorder,
    },
    walletBadgeText: { color: Colors.successDark, fontSize: 12, marginLeft: 8, fontFamily: Poppins.semiBold },

    payButton: {
        backgroundColor: Colors.primaryDark,
        flexDirection: 'row',
        height: 60,
        borderRadius: Radius.md,
        justifyContent: 'center',
        alignItems: 'center',
        marginTop: 24,
        marginBottom: 30,
    },
    payButtonText: { color: Colors.white, fontSize: 16, marginRight: 12, fontFamily: Poppins.semiBold },
    offersContainer: { gap: 12 },
    offerCard: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: Colors.infoBg,
        padding: 16,
        borderRadius: 16,
        borderWidth: 1,
        borderColor: Colors.infoLight,
    },
    offerIconBox: { width: 40, height: 40, borderRadius: 12, backgroundColor: Colors.white, justifyContent: 'center', alignItems: 'center' },
    offerTitle: { fontSize: 16, color: Colors.textDark, fontFamily: Poppins.semiBold },
    offerDesc: { fontSize: 12, color: Colors.textSecondary, marginTop: 2, fontFamily: Poppins.semiBold },
    applyButton: { paddingHorizontal: 12, paddingVertical: 6 },
    applyText: { color: Colors.primary, fontSize: 12, fontFamily: Poppins.semiBold },
    breakdownSection: { marginTop: 10 },
    breakdownRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 4 },
    breakdownLabel: { color: 'rgba(255,255,255,0.7)', fontSize: 12, fontFamily: Poppins.semiBold },
    breakdownValue: { color: Colors.white, fontSize: 12, fontFamily: Poppins.semiBold },

    insightsRow: { flexDirection: 'row', justifyContent: 'space-between', gap: 12, marginBottom: 30 },
    insightCard: {
        flex: 1,
        backgroundColor: Colors.white,
        padding: 16,
        borderRadius: 20,
        borderWidth: 1,
        elevation: 2,
        shadowColor: Colors.shadow,
        shadowOpacity: 0.05,
        shadowRadius: 10,
    },
    insightIconCircle: {
        width: 32,
        height: 32,
        borderRadius: 16,
        backgroundColor: Colors.bgInput,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 8,
    },
    insightLabel: { fontSize: 12, color: Colors.textSecondary, letterSpacing: 0.5, fontFamily: Poppins.semiBold },
    insightValue: { fontSize: 16, color: Colors.textDark, marginTop: 4, fontFamily: Poppins.semiBold },
    topPromoBanner: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        backgroundColor: '#eef4ff',
        borderRadius: Radius.lg,
        padding: Spacing.md,
        marginBottom: Spacing.md,
        shadowColor: Colors.primary,
        shadowOffset: { width: 2, height: 2 },
        shadowOpacity: 0.25,
        shadowRadius: 1,
        elevation: 4,
    },
    promoIconBg: {
        width: 44,
        height: 44,
        borderRadius: Radius.md,
        backgroundColor: '#dbeafe',
        justifyContent: 'center',
        alignItems: 'center',
    },
    promoTextContainer: { flex: 1, marginLeft: Spacing.sm },
    promoTitle: {
        fontSize: FontSize.lg,
        color: Colors.primary,
        fontFamily: Poppins.bold,
    },
    promoSubtitle: {
        fontSize: FontSize.sm,
        color: '#4b5563',
        marginTop: Spacing.xs,
        fontFamily: Poppins.regular,
    },
});

export default GasBill;