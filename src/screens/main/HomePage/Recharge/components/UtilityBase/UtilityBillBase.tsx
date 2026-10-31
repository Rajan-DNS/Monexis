import React, { useState } from 'react';
import {
    StyleSheet,
    View,
    Text,
    TextInput,
    TouchableOpacity,
    ScrollView,
    Alert,
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import { Colors } from '../../../../../../theme';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import AppHeader from '../../../../../../components/Header/AppHeader';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../../../../../navigation/RootNavigator';
import { Poppins } from '../../../../../../theme/typography';
import PaymentAuthModal from '../../../../../../components/Modals/PaymentAuthModal';
import StatusModal from '../../../../../../components/Modals/StatusModal';
import { useBillpayMutation } from '../../../../../../redux/services/mainApi/Common/CommonApi';
import { useDeviceLocation } from '../../../../../../hooks/useDeviceLocation';

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
    plans: Plan[];
    nextScreen: keyof RootStackParamList;
    insights?: {
        avgMonthly: string;
        dueDate: string;
    };
    offers?: Array<{ title: string; desc: string; type: 'apply' }>;
    priceBreakdown?: Array<{ label: string; value: string }>;
    deliverySlots?: Array<{ title: string; time: string; selected?: boolean }>;
}

interface UtilityBillBaseProps {
    config: BillConfig;
}

const UtilityBillBase: React.FC<UtilityBillBaseProps> = ({ config }) => {
    const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
    const [selectedPayment, setSelectedPayment] = React.useState('wallet');
    const [isPaymentModalVisible, setPaymentModalVisible] = useState(false);
    const [modalConfig, setModalConfig] = useState<{ isVisible: boolean; type: 'success' | 'error'; title: string; message: string }>({
        isVisible: false,
        type: 'success',
        title: '',
        message: '',
    });
    const [payBill, { isLoading: isPaying }] = useBillpayMutation();
    const { deviceModel, locationCoords, locationString } = useDeviceLocation();

    const isPaymentEnabled = !!deviceModel && !!locationCoords;

    const handlePaymentSuccess = async (pin: string) => {
        setPaymentModalVisible(false);
        try {
            const response = await payBill({
                data: {
                    operatorId: (config as any).operator || 0,
                    mobileNo: config.consumerValue,
                    amount: config.currentAmount,
                    addedById: 0,
                    mediumId: 2,
                    deviceInfo: deviceModel,
                    locationinfo: locationString,
                    tPin: pin,
                }
            }).unwrap();

            if (response.success) {
                navigation.navigate(config.nextScreen as any, {
                    responseData: response,
                    amount: config.currentAmount,
                    consumerNumber: config.consumerValue,
                    operatorName: config.operatorName,
                });
            }
        } catch (error: any) {
            Alert.alert('Payment Failed', error?.data?.message || 'Something went wrong during payment.');
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

                {/* LOCATION INFO CARD */}
                <View style={styles.locationCard}>
                    <View style={styles.locationHeader}>
                        <View style={styles.locationIconContainer}>
                            <MaterialCommunityIcons name="map-marker" size={24} color={Colors.primary} />
                        </View>
                        <Text style={styles.locationTitle}>Payment Location Info</Text>
                    </View>

                    <View style={styles.locationInfoRow}>
                        <MaterialCommunityIcons name="cellphone" size={18} color={Colors.textSecondary} />
                        <View style={styles.locationInfoTextContainer}>
                            <Text style={styles.locationInfoLabel}>Device Model</Text>
                            <Text style={styles.locationInfoValue}>{deviceModel || 'Detecting device...'}</Text>
                        </View>
                    </View>

                    <View style={styles.locationInfoRow}>
                        <MaterialCommunityIcons name="crosshairs-gps" size={18} color={Colors.textSecondary} />
                        <View style={styles.locationInfoTextContainer}>
                            <Text style={styles.locationInfoLabel}>Coordinates</Text>
                            <Text style={styles.locationInfoValue}>
                                {locationCoords ? `Lat: ${locationCoords.latitude.toFixed(6)}, Long: ${locationCoords.longitude.toFixed(6)}` : 'Fetching location...'}
                            </Text>
                        </View>
                    </View>

                    <View style={styles.locationInfoRow}>
                        <MaterialCommunityIcons name="map-marker-radius" size={18} color={Colors.textSecondary} />
                        <View style={styles.locationInfoTextContainer}>
                            <Text style={styles.locationInfoLabel}>Location Address</Text>
                            <Text style={styles.locationInfoValue}>{locationString || 'Loading address...'}</Text>
                        </View>
                    </View>

                    {!isPaymentEnabled && (
                        <View style={styles.locationWarning}>
                            <MaterialCommunityIcons name="alert-circle" size={16} color={Colors.warningText} />
                            <Text style={styles.locationWarningText}>Location required for payment processing</Text>
                        </View>
                    )}
                </View>

                {/* Main Payment Card */}
                <LinearGradient
                    colors={[Colors.primaryDark, Colors.primary]}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 0 }} style={styles.operatorCard}>
                    <View style={styles.cardHeader}>
                        <View style={styles.iconContainer}>
                            <MaterialCommunityIcons name={config.operatorIcon} size={28} color={Colors.white} />
                        </View>
                        <View style={styles.operatorInfo}>
                            <Text style={styles.operatorLabel}>DTH OPERATOR</Text>
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
                        <Text style={styles.infoLabel}>{config.consumerLabel}</Text>
                        <Text style={styles.infoValue}>{config.consumerValue}</Text>
                    </View>

                    <View style={styles.divider} />

                    <View style={styles.planSection}>
                        <View style={{ flex: 1 }}>
                            <Text style={styles.infoLabel}>Recharge Plan</Text>
                            <Text style={styles.priceValue}>₹{config.currentAmount}</Text>
                        </View>
                        <View style={styles.validityBadge}>
                            <View style={styles.validityTag}>
                                <Text style={styles.validityTagText}>Validiy</Text>
                            </View>
                            <View style={styles.validityRow}>
                                <MaterialCommunityIcons name="calendar-month" size={18} color={Colors.white} />
                                <Text style={styles.validityText}>{config.validity || '28 DAYS'}</Text>
                            </View>
                        </View>
                    </View>
                </LinearGradient>

                {/* Popular Plans */}
                <View style={styles.sectionHeader}>
                    <Text style={styles.sectionTitle}>Popular Plans</Text>
                    <TouchableOpacity><Text style={styles.viewAll}>View All</Text></TouchableOpacity>
                </View>
                <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.plansContainer}>
                    {config.plans.map((plan, idx) => (
                        <View key={idx} style={styles.planCard}>
                            <Text style={styles.planPrice}>₹{plan.price}</Text>
                            <Text style={styles.planValid}>{plan.validity}</Text>
                            {plan.tag && (
                                <View style={styles.tagContainer}>
                                    <MaterialCommunityIcons name="star" size={12} color={Colors.primary} />
                                    <Text style={styles.tagText}>{plan.tag}</Text>
                                </View>
                            )}
                        </View>
                    ))}
                </ScrollView>

                {/* Payment Method */}
                <Text style={styles.sectionTitle}>Payment Method</Text>
                <View style={styles.paymentMethods}>
                    <PaymentOption
                        id="wallet"
                        title="Monexis Wallet"
                        subtitle={`Balance: ₹${config.currentAmount}`}
                        icon="wallet-outline"
                        selected={selectedPayment === 'wallet'}
                        onSelect={setSelectedPayment}
                    />
                    <PaymentOption
                        id="upi"
                        title="UPI (PhonePe/Google Pay)"
                        subtitle="Pay via any UPI app"
                        icon="qrcode-scan"
                        selected={selectedPayment === 'upi'}
                        onSelect={setSelectedPayment}
                    />
                    <PaymentOption
                        id="card"
                        title="Debit/Credit Cards"
                        subtitle="Visa, Mastercard, RuPay"
                        icon="credit-card-outline"
                        selected={selectedPayment === 'card'}
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
                    <Text style={styles.walletBadgeText}>PAID VIA MONEXIS WALLET</Text>
                </View>

                {/* Available Offers */}
                {config.offers && (
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

                {/* Pay Button */}
                <TouchableOpacity
                    style={[styles.payButton, (!isPaymentEnabled || isPaying) && { opacity: 0.6 }]}
                    onPress={() => setPaymentModalVisible(true)}
                    disabled={!isPaymentEnabled || isPaying}
                >
                    <Text style={styles.payButtonText}>Pay Now ₹{config.currentAmount}</Text>
                    <MaterialCommunityIcons name="arrow-right" size={24} color={Colors.white} />
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
            name={selected ? "radiobox-marked" : "radiobox-blank"}
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
        borderRadius: 24,
        padding: 24,
        elevation: 8,
        shadowColor: Colors.shadow,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.2,
        shadowRadius: 8,
    },
    cardHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 24 },
    iconContainer: {
        width: 60, height: 60, borderRadius: 16,
        backgroundColor: 'rgba(255,255,255,0.1)',
        borderWidth: 1, borderColor: 'rgba(255,255,255,0.3)',
        justifyContent: 'center', alignItems: 'center',
    },
    operatorInfo: { flex: 1, marginLeft: 16 },
    operatorLabel: {
        color: 'rgba(255,255,255,0.7)', fontSize: 12, letterSpacing: 0.5,
        fontFamily: Poppins.semiBold,
    },

    operatorName: { color: Colors.white, fontSize: 20, marginTop: 2, fontFamily: Poppins.extraBold, },
    infoRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 12 },
    infoLabel: { color: 'rgba(255,255,255,0.8)', fontSize: 16, fontFamily: Poppins.extraBold, },
    infoValue: { color: Colors.white, fontSize: 20, fontFamily: Poppins.extraBold, },
    divider: { height: 1, backgroundColor: 'rgba(255,255,255,0.2)', marginVertical: 20 },
    planSection: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-end' },
    priceValue: { color: Colors.white, fontSize: 20, marginTop: 4, fontFamily: Poppins.extraBold, },
    validityBadge: { alignItems: 'flex-end' },
    validityTag: { backgroundColor: 'rgba(255,255,255,0.1)', paddingHorizontal: 12, paddingVertical: 4, borderRadius: 20, borderWidth: 1, borderColor: 'rgba(255,255,255,0.5)', marginBottom: 8 },
    validityTagText: { color: Colors.white, fontSize: 12, fontFamily: Poppins.extraBold, },
    validityRow: { flexDirection: 'row', alignItems: 'center' },
    validityText: { color: Colors.white, fontSize: 16, marginLeft: 6, fontFamily: Poppins.extraBold, },

    sectionTitle: { fontSize: 16, color: Colors.textDark, marginTop: 28, marginBottom: 16, fontFamily: Poppins.extraBold, },
    sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 28, marginBottom: 16 },
    viewAll: { color: Colors.primary, fontSize: 12, fontFamily: Poppins.extraBold, },

    plansContainer: { marginBottom: 8 },
    planCard: {
        backgroundColor: Colors.white,
        width: 160,
        padding: 20,
        borderRadius: 24,
        marginRight: 12,
        borderWidth: 1,
        borderColor: Colors.borderLight,
        elevation: 2,
        shadowColor: Colors.shadow,
        shadowOpacity: 0.05,
        shadowRadius: 10
    },
    planPrice: { fontSize: 20, color: Colors.textDark, fontFamily: Poppins.extraBold, },
    planValid: { fontSize: 12, color: Colors.textSecondary, marginTop: 4, fontFamily: Poppins.extraBold, },
    tagContainer: { flexDirection: 'row', alignItems: 'center', marginTop: 12 },
    tagText: { fontSize: 12, color: Colors.primary, marginLeft: 4, textTransform: 'uppercase', fontFamily: Poppins.extraBold, },

    paymentMethods: { gap: 12 },
    paymentItem: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: Colors.white,
        padding: 16,
        borderRadius: 20,
        borderWidth: 1,
        borderColor: Colors.borderLight,
    },
    paymentItemSelected: { borderColor: Colors.primary, backgroundColor: Colors.infoBg },
    paymentIconBox: { width: 48, height: 48, borderRadius: 24, backgroundColor: Colors.bgInput, justifyContent: 'center', alignItems: 'center' },
    paymentTitle: { fontSize: 16, color: Colors.textDark, fontFamily: Poppins.extraBold, },
    paymentSub: { fontSize: 12, color: Colors.textSecondary, marginTop: 2, fontFamily: Poppins.extraBold, },

    summaryCard: { backgroundColor: Colors.bgInput, borderRadius: 24, padding: 20, marginTop: 4 },
    summaryRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 12 },
    summaryLabel: { color: Colors.textSecondary, fontSize: 16, fontFamily: Poppins.extraBold, },
    summaryValue: { color: Colors.textDark, fontSize: 16, fontFamily: Poppins.extraBold, },
    summaryDivider: { height: 1, backgroundColor: Colors.divider, marginVertical: 12 },
    totalRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
    totalLabel: { fontSize: 16, color: Colors.textDark, fontFamily: Poppins.extraBold, },
    totalValue: { fontSize: 20, color: Colors.textDark, fontFamily: Poppins.extraBold, },

    walletBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: Colors.successLight,
        paddingVertical: 10,
        borderRadius: 8,
        marginTop: 20,
        borderWidth: 1,
        borderColor: Colors.successBorder
    },
    walletBadgeText: { color: Colors.successDark, fontSize: 12, marginLeft: 8, fontFamily: Poppins.extraBold, },

    payButton: {
        backgroundColor: Colors.primaryDark,
        flexDirection: 'row',
        height: 60,
        borderRadius: 16,
        justifyContent: 'center',
        alignItems: 'center',
        marginTop: 24,
        marginBottom: 30
    },
    payButtonText: { color: Colors.white, fontSize: 16, marginRight: 12, fontFamily: Poppins.extraBold, },
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
    offerTitle: { fontSize: 16, color: Colors.textDark, fontFamily: Poppins.extraBold, },
    offerDesc: { fontSize: 12, color: Colors.textSecondary, marginTop: 2, fontFamily: Poppins.extraBold, },
    applyButton: { paddingHorizontal: 12, paddingVertical: 6 },
    applyText: { color: Colors.primary, fontSize: 12, fontFamily: Poppins.extraBold, },
    breakdownSection: { marginTop: 10 },
    breakdownRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 4 },
    breakdownLabel: { color: 'rgba(255,255,255,0.7)', fontSize: 12, fontFamily: Poppins.extraBold, },
    breakdownValue: { color: Colors.white, fontSize: 12, fontFamily: Poppins.extraBold, },
    slotsRow: { flexDirection: 'row', gap: 12 },
    slotCard: {
        flex: 1,
        padding: 16,
        borderRadius: 16,
        borderWidth: 2,
        borderColor: Colors.borderLight,
        backgroundColor: Colors.white,
    },
    slotCardSelected: { borderColor: Colors.primary, backgroundColor: Colors.infoBg },
    slotHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
    slotTitle: { fontSize: 12, color: Colors.textSecondary, textTransform: 'uppercase', fontFamily: Poppins.extraBold, },
    slotTitleSelected: { color: Colors.primary },
    slotTime: { fontSize: 12, color: Colors.textDark, marginTop: 4, fontFamily: Poppins.extraBold, },
    slotTimeSelected: { color: Colors.primary },
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
    insightLabel: { fontSize: 12, color: Colors.textSecondary, letterSpacing: 0.5, fontFamily: Poppins.extraBold, },
    insightValue: { fontSize: 16, color: Colors.textDark, marginTop: 4, fontFamily: Poppins.extraBold, },
    locationCard: {
        backgroundColor: Colors.white,
        borderRadius: 20,
        padding: 20,
        marginBottom: 20,
        borderWidth: 1,
        borderColor: Colors.borderLight,
        elevation: 3,
        shadowColor: Colors.shadow,
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
    },
    locationHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 16,
        paddingBottom: 12,
        borderBottomWidth: 1,
        borderBottomColor: Colors.borderLight,
    },
    locationIconContainer: {
        width: 44,
        height: 44,
        borderRadius: 22,
        backgroundColor: Colors.infoBg,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 12,
    },
    locationTitle: {
        fontSize: 16,
        color: Colors.textDark,
        fontFamily: Poppins.semiBold,
    },
    locationInfoRow: {
        flexDirection: 'row',
        alignItems: 'flex-start',
        marginBottom: 14,
        paddingLeft: 4,
    },
    locationInfoTextContainer: {
        flex: 1,
        marginLeft: 12,
    },
    locationInfoLabel: {
        fontSize: 12,
        color: Colors.textSecondary,
        fontFamily: Poppins.regular,
        marginBottom: 2,
    },
    locationInfoValue: {
        fontSize: 14,
        color: Colors.textDark,
        fontFamily: Poppins.medium,
        lineHeight: 20,
    },
    locationWarning: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: Colors.warningLight,
        padding: 12,
        borderRadius: 12,
        marginTop: 8,
        borderWidth: 1,
        borderColor: Colors.warningBorder,
    },
    locationWarningText: {
        fontSize: 12,
        color: Colors.warningText,
        fontFamily: Poppins.medium,
        marginLeft: 8,
        flex: 1,
    },
});

export default UtilityBillBase;
