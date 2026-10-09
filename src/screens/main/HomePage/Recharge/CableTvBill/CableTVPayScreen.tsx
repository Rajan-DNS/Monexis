import React, { useState } from 'react';
import {
    StyleSheet,
    Text,
    View,
    TouchableOpacity,
    ScrollView,
    SafeAreaView,
    StatusBar,
    ActivityIndicator,
} from 'react-native';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import Colors from '../../../../../theme/colors';
import { Poppins } from '../../../../../theme/typography';
import AppHeader from '../../../../../components/Header/AppHeader';
import { useNavigation, useRoute } from '@react-navigation/native';

interface PaymentMethod {
    id: string;
    name: string;
    icon: string;
    type: 'wallet' | 'upi' | 'card' | 'netbanking';
}

const PAYMENT_METHODS: PaymentMethod[] = [
    { id: 'wallet', name: 'Wallet Balance', icon: 'account-balance-wallet', type: 'wallet' },
    { id: 'upi', name: 'UPI / QR', icon: 'qr-code-scanner', type: 'upi' },
    { id: 'card', name: 'Credit / Debit Card', icon: 'credit-card', type: 'card' },
    { id: 'netbanking', name: 'Net Banking', icon: 'account-balance', type: 'netbanking' },
];

const CableTVPayScreen = () => {
    const navigation = useNavigation();
    const route = useRoute();
    const { operator, circle, consumerNumber, plan } = route.params as any;
    
    const [selectedPaymentMethod, setSelectedPaymentMethod] = useState<PaymentMethod>(PAYMENT_METHODS[0]);
    const [isProcessing, setIsProcessing] = useState(false);

    const convenienceFee = 5;
    const totalAmount = plan.price + convenienceFee;

    const handlePayNow = async () => {
        setIsProcessing(true);
        
        // Simulate API call
        setTimeout(() => {
            setIsProcessing(false);
            navigation.navigate('RechargeSuccess' as any, {
                mobileNumber: consumerNumber,
                amount: totalAmount.toString(),
                operator: operator.name,
                circle: circle.name,
                plan: plan,
                data: {
                    transactionId: `TXN${Date.now()}`,
                    dateTime: new Date().toLocaleString(),
                    status: 'success',
                },
            });
        }, 2000);
    };

    return (
        <SafeAreaView style={styles.container}>
            <StatusBar barStyle="dark-content" backgroundColor={Colors.white} />

            <AppHeader
                title="Payment"
                showBack
                onBackPress={() => navigation.goBack()}
            />

            <ScrollView
                contentContainerStyle={styles.scrollContent}
                showsVerticalScrollIndicator={false}
            >
                {/* Plan Summary Card */}
                <View style={styles.summaryCard}>
                    <View style={styles.summaryHeader}>
                        <MaterialCommunityIcons name="television-play" size={24} color={Colors.primary} />
                        <Text style={styles.summaryTitle}>Recharge Summary</Text>
                    </View>

                    <View style={styles.summaryDivider} />

                    <View style={styles.summaryRow}>
                        <Text style={styles.summaryLabel}>Operator</Text>
                        <View style={styles.summaryValueRow}>
                            <View style={styles.operatorBadge}>
                                <Text style={styles.operatorBadgeText}>{operator.shortName}</Text>
                            </View>
                            <Text style={styles.summaryValue}>{operator.name}</Text>
                        </View>
                    </View>

                    <View style={styles.summaryRow}>
                        <Text style={styles.summaryLabel}>Consumer Number</Text>
                        <Text style={styles.summaryValue}>{consumerNumber}</Text>
                    </View>

                    <View style={styles.summaryRow}>
                        <Text style={styles.summaryLabel}>Circle</Text>
                        <Text style={styles.summaryValue}>{circle.name}</Text>
                    </View>

                    <View style={styles.summaryRow}>
                        <Text style={styles.summaryLabel}>Plan</Text>
                        <Text style={styles.summaryValueHighlight}>{plan.name} Plan</Text>
                    </View>

                    <View style={styles.summaryRow}>
                        <Text style={styles.summaryLabel}>Channels</Text>
                        <Text style={styles.summaryValue}>{plan.channels}+ Channels</Text>
                    </View>

                    <View style={styles.summaryRow}>
                        <Text style={styles.summaryLabel}>Validity</Text>
                        <Text style={styles.summaryValue}>{plan.validity}</Text>
                    </View>

                    <View style={styles.summaryDivider} />

                    <View style={styles.summaryRow}>
                        <Text style={styles.summaryLabel}>Plan Amount</Text>
                        <Text style={styles.summaryValue}>₹{plan.price}</Text>
                    </View>

                    <View style={styles.summaryRow}>
                        <Text style={styles.summaryLabel}>Convenience Fee</Text>
                        <Text style={styles.summaryValue}>₹{convenienceFee}</Text>
                    </View>

                    <View style={styles.summaryDivider} />

                    <View style={styles.summaryRow}>
                        <Text style={styles.summaryTotalLabel}>Total Amount</Text>
                        <Text style={styles.summaryTotalValue}>₹{totalAmount}</Text>
                    </View>
                </View>

                {/* Payment Method Selection */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Select Payment Method</Text>
                    {PAYMENT_METHODS.map((method) => (
                        <TouchableOpacity
                            key={method.id}
                            style={[
                                styles.paymentMethodCard,
                                selectedPaymentMethod.id === method.id && styles.paymentMethodCardSelected,
                            ]}
                            onPress={() => setSelectedPaymentMethod(method)}
                            activeOpacity={0.7}
                        >
                            <View style={styles.paymentMethodLeft}>
                                <View style={[
                                    styles.paymentMethodIcon,
                                    selectedPaymentMethod.id === method.id && styles.paymentMethodIconSelected,
                                ]}>
                                    <MaterialIcons 
                                        name={method.icon as any} 
                                        size={22} 
                                        color={selectedPaymentMethod.id === method.id ? Colors.primary : Colors.textSecondary} 
                                    />
                                </View>
                                <Text style={[
                                    styles.paymentMethodName,
                                    selectedPaymentMethod.id === method.id && styles.paymentMethodNameSelected,
                                ]}>
                                    {method.name}
                                </Text>
                            </View>
                            <View style={[
                                styles.radioButton,
                                selectedPaymentMethod.id === method.id && styles.radioButtonSelected,
                            ]}>
                                {selectedPaymentMethod.id === method.id && (
                                    <View style={styles.radioButtonInner} />
                                )}
                            </View>
                        </TouchableOpacity>
                    ))}
                </View>

                {/* Security Badge */}
                <View style={styles.securityBadge}>
                    <MaterialIcons name="verified-user" size={18} color={Colors.success} />
                    <Text style={styles.securityText}>
                        100% Safe & Secure Payment
                    </Text>
                </View>

                {/* Info Note */}
                <View style={styles.infoBox}>
                    <MaterialIcons name="info-outline" size={18} color={Colors.infoDark} />
                    <Text style={styles.infoText}>
                        Your recharge will be processed instantly after successful payment
                    </Text>
                </View>
            </ScrollView>

            {/* Bottom Payment Button */}
            <View style={styles.bottomContainer}>
                <View style={styles.amountRow}>
                    <Text style={styles.amountLabel}>Total Payable</Text>
                    <Text style={styles.amountValue}>₹{totalAmount}</Text>
                </View>
                <TouchableOpacity
                    style={styles.payButton}
                    onPress={handlePayNow}
                    disabled={isProcessing}
                    activeOpacity={0.85}
                >
                    {isProcessing ? (
                        <ActivityIndicator color={Colors.white} size="small" />
                    ) : (
                        <>
                            <MaterialIcons name="lock" size={18} color={Colors.white} />
                            <Text style={styles.payButtonText}>Pay Now</Text>
                        </>
                    )}
                </TouchableOpacity>
            </View>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: Colors.bgLightest,
    },
    scrollContent: {
        paddingBottom: 140,
    },

    /* Summary Card */
    summaryCard: {
        backgroundColor: Colors.white,
        margin: 20,
        marginBottom: 16,
        borderRadius: 16,
        padding: 20,
        borderWidth: 1,
        borderColor: Colors.divider,
        shadowColor: Colors.shadow,
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 8,
        elevation: 2,
    },
    summaryHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 10,
        marginBottom: 16,
    },
    summaryTitle: {
        fontSize: 16,
        fontWeight: '700',
        fontFamily: Poppins.bold,
        color: Colors.textDark,
    },
    summaryDivider: {
        height: 1,
        backgroundColor: Colors.divider,
        marginVertical: 12,
    },
    summaryRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 12,
    },
    summaryLabel: {
        fontSize: 13,
        fontFamily: Poppins.regular,
        color: Colors.textSecondary,
    },
    summaryValue: {
        fontSize: 13,
        fontFamily: Poppins.medium,
        color: Colors.textDark,
    },
    summaryValueRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
    },
    operatorBadge: {
        backgroundColor: Colors.error,
        paddingHorizontal: 8,
        paddingVertical: 3,
        borderRadius: 4,
    },
    operatorBadgeText: {
        fontSize: 10,
        fontWeight: '700',
        fontFamily: Poppins.bold,
        color: Colors.white,
    },
    summaryValueHighlight: {
        fontSize: 13,
        fontWeight: '700',
        fontFamily: Poppins.bold,
        color: Colors.primary,
    },
    summaryTotalLabel: {
        fontSize: 15,
        fontWeight: '700',
        fontFamily: Poppins.bold,
        color: Colors.textDark,
    },
    summaryTotalValue: {
        fontSize: 18,
        fontWeight: '800',
        fontFamily: Poppins.extraBold,
        color: Colors.primary,
    },

    /* Payment Method Section */
    section: {
        paddingHorizontal: 20,
        marginBottom: 20,
    },
    sectionTitle: {
        fontSize: 15,
        fontWeight: '700',
        fontFamily: Poppins.bold,
        color: Colors.textDark,
        marginBottom: 12,
    },
    paymentMethodCard: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        backgroundColor: Colors.white,
        borderRadius: 12,
        padding: 14,
        marginBottom: 10,
        borderWidth: 1,
        borderColor: Colors.divider,
    },
    paymentMethodCardSelected: {
        borderColor: Colors.primary,
        borderWidth: 2,
        backgroundColor: Colors.primaryLight,
    },
    paymentMethodLeft: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
    },
    paymentMethodIcon: {
        width: 44,
        height: 44,
        borderRadius: 10,
        backgroundColor: Colors.bgLight,
        alignItems: 'center',
        justifyContent: 'center',
    },
    paymentMethodIconSelected: {
        backgroundColor: Colors.white,
    },
    paymentMethodName: {
        fontSize: 14,
        fontFamily: Poppins.medium,
        color: Colors.textBody,
    },
    paymentMethodNameSelected: {
        fontWeight: '700',
        fontFamily: Poppins.bold,
        color: Colors.textDark,
    },
    radioButton: {
        width: 22,
        height: 22,
        borderRadius: 11,
        borderWidth: 2,
        borderColor: Colors.divider,
        alignItems: 'center',
        justifyContent: 'center',
    },
    radioButtonSelected: {
        borderColor: Colors.primary,
    },
    radioButtonInner: {
        width: 12,
        height: 12,
        borderRadius: 6,
        backgroundColor: Colors.primary,
    },

    /* Security Badge */
    securityBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 8,
        paddingHorizontal: 20,
        paddingVertical: 12,
        marginHorizontal: 20,
        marginBottom: 12,
        backgroundColor: Colors.successBg,
        borderRadius: 10,
        borderWidth: 1,
        borderColor: Colors.successLight,
    },
    securityText: {
        fontSize: 13,
        fontWeight: '600',
        fontFamily: Poppins.semiBold,
        color: Colors.success,
    },

    /* Info Box */
    infoBox: {
        flexDirection: 'row',
        alignItems: 'flex-start',
        backgroundColor: Colors.infoBg,
        borderRadius: 12,
        padding: 14,
        marginHorizontal: 20,
        gap: 10,
        borderWidth: 1,
        borderColor: Colors.infoLight,
    },
    infoText: {
        flex: 1,
        fontSize: 12,
        fontFamily: Poppins.regular,
        color: Colors.infoDark,
        lineHeight: 18,
    },

    /* Bottom Container */
    bottomContainer: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        padding: 20,
        backgroundColor: Colors.white,
        borderTopWidth: 1,
        borderTopColor: Colors.divider,
        shadowColor: Colors.shadow,
        shadowOffset: { width: 0, height: -2 },
        shadowOpacity: 0.05,
        shadowRadius: 8,
        elevation: 8,
    },
    amountRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 12,
    },
    amountLabel: {
        fontSize: 14,
        fontFamily: Poppins.medium,
        color: Colors.textSecondary,
    },
    amountValue: {
        fontSize: 22,
        fontWeight: '800',
        fontFamily: Poppins.extraBold,
        color: Colors.primary,
    },
    payButton: {
        flexDirection: 'row',
        gap: 10,
        backgroundColor: Colors.primaryDark,
        borderRadius: 12,
        paddingVertical: 16,
        alignItems: 'center',
        justifyContent: 'center',
        shadowColor: Colors.primary,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
        elevation: 4,
    },
    payButtonText: {
        color: Colors.white,
        fontSize: 16,
        fontWeight: '700',
        fontFamily: Poppins.bold,
    },
});

export default CableTVPayScreen;
