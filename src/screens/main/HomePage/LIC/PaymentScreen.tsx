import React, { useState } from 'react';
import {
    StyleSheet,
    Text,
    View,
    TouchableOpacity,
    ScrollView,
    SafeAreaView,
    StatusBar,
} from 'react-native';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import Colors from '../../../../theme/colors';
import { Poppins } from '../../../../theme/typography';
import AppHeader from '../../../../components/Header/AppHeader';

const PaymentScreen = ({ navigation, route }) => {
    const [selectedMethod, setSelectedMethod] = useState('UPI');

    const paymentMethods = [
        { id: 'UPI', label: 'UPI Payment', icon: 'account-balance' },
        { id: 'CARD', label: 'Credit / Debit Card', icon: 'credit-card' },
        { id: 'NET_BANKING', label: 'Net Banking', icon: 'account-balance-wallet' },
        { id: 'WALLET', label: 'Digital Wallet', icon: 'wallet' },
    ];

    const summaryData = route?.params?.paymentSummary || {
        policyName: 'Jeevan Anand',
        policyNumber: '1234567890',
        premiumAmount: '₹ 28,374',
        gst: '₹ 5,108',
        totalAmount: '₹ 33,482',
    };

    const handleConfirmPayment = () => {
        console.log('Proceeding with payment using:', selectedMethod);
        // Navigate to success screen after payment
        navigation.navigate('LICSuccessScreen', {
            paymentData: {
                ...summaryData,
                paymentMethod: selectedMethod,
                transactionId: `TXN${Date.now()}`,
                date: new Date().toISOString(),
            }
        });
    };

    return (
        <SafeAreaView style={styles.container}>
            <StatusBar barStyle="dark-content" backgroundColor={Colors.white} />

            <AppHeader 
                title="Payment" 
                showBack 
                onBackPress={() => navigation?.goBack()} 
            />

            <ScrollView
                contentContainerStyle={styles.scrollContent}
                showsVerticalScrollIndicator={false}
            >
                {/* Premium Summary Card */}
                <View style={styles.summaryCard}>
                    <View style={styles.cardHeader}>
                        <MaterialCommunityIcons name="file-document" size={24} color={Colors.primary} />
                        <Text style={styles.cardTitle}>Premium Summary</Text>
                    </View>

                    <View style={styles.summaryRow}>
                        <Text style={styles.summaryLabel}>Policy Name</Text>
                        <Text style={styles.summaryValueBold}>{summaryData.policyName}</Text>
                    </View>

                    <View style={styles.summaryRow}>
                        <Text style={styles.summaryLabel}>Policy Number</Text>
                        <Text style={styles.summaryValueBold}>{summaryData.policyNumber}</Text>
                    </View>

                    <View style={styles.summaryRow}>
                        <Text style={styles.summaryLabel}>Premium Amount</Text>
                        <Text style={styles.summaryValueBold}>{summaryData.premiumAmount}</Text>
                    </View>

                    <View style={styles.summaryRow}>
                        <Text style={styles.summaryLabel}>GST (18%)</Text>
                        <Text style={styles.summaryValueBold}>{summaryData.gst}</Text>
                    </View>

                    <View style={styles.divider} />

                    <View style={styles.totalRow}>
                        <Text style={styles.totalLabel}>Total Amount</Text>
                        <Text style={styles.totalValue}>{summaryData.totalAmount}</Text>
                    </View>
                </View>

                {/* Payment Methods Section */}
                <View style={styles.methodsContainer}>
                    <Text style={styles.sectionTitle}>Select Payment Method</Text>

                    {paymentMethods.map((method) => {
                        const isSelected = selectedMethod === method.id;
                        return (
                            <TouchableOpacity
                                key={method.id}
                                style={[
                                    styles.methodCard,
                                    isSelected && styles.methodCardSelected,
                                ]}
                                onPress={() => setSelectedMethod(method.id)}
                                activeOpacity={0.8}
                            >
                                <View style={styles.methodLeft}>
                                    <View style={[
                                        styles.methodIconContainer,
                                        isSelected && styles.methodIconContainerSelected
                                    ]}>
                                        <MaterialIcons 
                                            name={method.icon} 
                                            size={20} 
                                            color={isSelected ? Colors.primary : Colors.textSecondary} 
                                        />
                                    </View>
                                    <Text style={[
                                        styles.methodLabel,
                                        isSelected && styles.methodLabelSelected
                                    ]}>
                                        {method.label}
                                    </Text>
                                </View>

                                <View
                                    style={[
                                        styles.radioButton,
                                        isSelected && styles.radioButtonSelected,
                                    ]}
                                >
                                    {isSelected && <View style={styles.radioButtonInner} />}
                                </View>
                            </TouchableOpacity>
                        );
                    })}
                </View>

                {/* Security Badge */}
                <View style={styles.securityContainer}>
                    <MaterialCommunityIcons name="shield-check" size={20} color={Colors.success} />
                    <Text style={styles.securityText}>100% Secure Payment</Text>
                </View>

                {/* Info Box */}
                <View style={styles.infoBox}>
                    <MaterialIcons name="info" size={18} color={Colors.infoDark} />
                    <Text style={styles.infoText}>
                        Your payment information is encrypted and secure. We don't store your card details.
                    </Text>
                </View>
            </ScrollView>

            {/* Bottom Fixed Action Button */}
            <View style={styles.bottomContainer}>
                <View style={styles.amountDisplay}>
                    <Text style={styles.amountLabel}>Total Payable</Text>
                    <Text style={styles.amountValue}>{summaryData.totalAmount}</Text>
                </View>
                <TouchableOpacity
                    style={styles.confirmButton}
                    onPress={handleConfirmPayment}
                    activeOpacity={0.85}
                >
                    <MaterialCommunityIcons name="shield-check" size={20} color={Colors.white} />
                    <Text style={styles.confirmButtonText}>Confirm Payment</Text>
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
        padding: 20,
        paddingBottom: 24,
    },

    /* Summary Card */
    summaryCard: {
        backgroundColor: Colors.white,
        borderRadius: 16,
        padding: 20,
        marginBottom: 20,
        shadowColor: Colors.shadow,
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.08,
        shadowRadius: 8,
        elevation: 3,
        borderWidth: 1,
        borderColor: Colors.divider,
    },
    cardHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 10,
        marginBottom: 16,
    },
    cardTitle: {
        fontSize: 16,
        fontWeight: '700',
        fontFamily: Poppins.bold,
        color: Colors.textDark,
    },
    summaryRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 12,
    },
    summaryLabel: {
        fontSize: 13,
        fontFamily: Poppins.medium,
        color: Colors.textSecondary,
    },
    summaryValueBold: {
        fontSize: 13,
        fontFamily: Poppins.semiBold,
        fontWeight: '600',
        color: Colors.textDark,
    },
    divider: {
        height: 1,
        backgroundColor: Colors.divider,
        marginVertical: 12,
    },
    totalRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginTop: 4,
    },
    totalLabel: {
        fontSize: 15,
        fontWeight: '700',
        fontFamily: Poppins.bold,
        color: Colors.textDark,
    },
    totalValue: {
        fontSize: 18,
        fontWeight: '800',
        fontFamily: Poppins.extraBold,
        color: Colors.primary,
    },

    /* Payment Methods */
    methodsContainer: {
        marginBottom: 20,
    },
    sectionTitle: {
        fontSize: 14,
        fontWeight: '700',
        fontFamily: Poppins.bold,
        color: Colors.textDark,
        marginBottom: 12,
        letterSpacing: 0.5,
    },
    methodCard: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        backgroundColor: Colors.white,
        borderWidth: 1,
        borderColor: Colors.divider,
        borderRadius: 12,
        paddingHorizontal: 16,
        paddingVertical: 14,
        marginBottom: 12,
    },
    methodCardSelected: {
        borderColor: Colors.primary,
        borderWidth: 2,
        backgroundColor: Colors.primaryLight,
    },
    methodLeft: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
    },
    methodIconContainer: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: Colors.bgInput,
        alignItems: 'center',
        justifyContent: 'center',
    },
    methodIconContainerSelected: {
        backgroundColor: Colors.primaryLight,
    },
    methodLabel: {
        fontSize: 14,
        fontWeight: '600',
        fontFamily: Poppins.semiBold,
        color: Colors.textDark,
    },
    methodLabelSelected: {
        color: Colors.primary,
        fontWeight: '700',
        fontFamily: Poppins.bold,
    },

    /* Radio Button */
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

    /* Security Footer Note */
    securityContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: Colors.successLight,
        borderRadius: 12,
        paddingVertical: 12,
        paddingHorizontal: 16,
        marginBottom: 16,
        gap: 8,
    },
    securityText: {
        fontSize: 13,
        fontWeight: '600',
        fontFamily: Poppins.semiBold,
        color: Colors.successDark,
    },

    /* Info Box */
    infoBox: {
        flexDirection: 'row',
        alignItems: 'flex-start',
        backgroundColor: Colors.infoBg,
        borderRadius: 12,
        padding: 14,
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

    /* Fixed Bottom Container */
    bottomContainer: {
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
    amountDisplay: {
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
        fontSize: 20,
        fontWeight: '800',
        fontFamily: Poppins.extraBold,
        color: Colors.primary,
    },
    confirmButton: {
        flexDirection: 'row',
        gap: 8,
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
    confirmButtonText: {
        color: Colors.white,
        fontSize: 16,
        fontWeight: '700',
        fontFamily: Poppins.bold,
    },
});

export default PaymentScreen;
