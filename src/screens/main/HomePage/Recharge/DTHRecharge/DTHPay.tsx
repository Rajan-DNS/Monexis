import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Alert, ActivityIndicator, Platform, PermissionsAndroid, SafeAreaView } from 'react-native';
import { useRoute, useNavigation, RouteProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../../../../navigation/RootNavigator';
import AppHeader from '../../../../../components/Header/AppHeader';
import { Colors, Radius } from '../../../../../theme';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import { usePayRechargeMutation } from '../../../../../redux/services/RetailerServices/Recharge/RechargeAPI';
import { useDeviceLocation } from '../../../../../hooks/useDeviceLocation';
import { Poppins } from '../../../../../theme/typography';
import PaymentAuthModal from '../../../../../components/Modals/PaymentAuthModal';

type DTHPayRouteProp = RouteProp<RootStackParamList, 'DTHPay'>;

const DTHPay = () => {
    const route = useRoute<DTHPayRouteProp>();
    const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();

    const { mobileNumber, amount, operator, plan } = route.params;

    const [payRecharge, { isLoading }] = usePayRechargeMutation();
    const { deviceModel, locationString } = useDeviceLocation();
    const [showAuthModal, setShowAuthModal] = useState(false);

    const handlePayNow = () => {
        setShowAuthModal(true);
    };
    const executePayment = async (pin: string) => {

        try {
            const payload = {
                operatorId: operator?.id || plan?.operatorId || operator?.operatorId || 0,
                mediumId: 2, // 2 for DTH
                amount: parseInt(amount || '0'),
                rechargePin: pin,
                rechargeNumber: mobileNumber,
                deviceInfo: deviceModel,
                locationinfo: locationString,
                addedById: 0
            };

            const response = await payRecharge(payload).unwrap();

            if (response.success) {
                navigation.navigate('RechargeSuccess', {
                    mobileNumber: mobileNumber,
                    amount: amount,
                    operator: operator?.name || operator?.operatorName || 'DTH Operator',
                    circle: "India", // DTH is usually pan-India
                    isPostpaid: false,
                    plan,
                    data: response.data,

                });
            } else {
                Alert.alert("Recharge Failed", response.message || "Failed to process recharge.");
            }
        } catch (error: any) {
            Alert.alert("Error", error?.data?.message || "Something went wrong.");
        }
    };



    return (
        <SafeAreaView style={styles.container}>
            <AppHeader
                title="DTH Payment"
                showBack={true}
                onBackPress={() => navigation.goBack()}
            />

            <ScrollView contentContainerStyle={styles.scrollContent}>
                <View style={styles.card}>
                    <View style={styles.iconContainer}>
                        <MaterialCommunityIcons name="television" size={40} color={Colors.primary} />
                    </View>
                    <Text style={styles.title}>Confirm Payment</Text>
                    <Text style={styles.subtitle}>You are about to pay for your DTH recharge.</Text>

                    <View style={styles.amountContainer}>
                        <Text style={styles.currency}>₹</Text>
                        <Text style={styles.amountText}>{amount}</Text>
                    </View>

                    <View style={styles.detailsContainer}>
                        <View style={styles.detailRow}>
                            <Text style={styles.detailLabel}>Subscriber ID</Text>
                            <Text style={styles.detailValue}>{mobileNumber}</Text>
                        </View>
                        <View style={styles.detailRow}>
                            <Text style={styles.detailLabel}>Operator</Text>
                            <Text style={styles.detailValue}>{operator?.name || operator?.operatorName || 'DTH Operator'}</Text>
                        </View>
                    </View>
                </View>

                <View style={styles.secureContainer}>
                    <MaterialCommunityIcons name="shield-check" size={24} color={Colors.success} />
                    <Text style={styles.secureText}>100% Secure Transaction</Text>
                </View>
            </ScrollView>

            <View style={styles.footer}>
                <TouchableOpacity
                    style={[styles.payButton, isLoading && { opacity: 0.7 }]}
                    onPress={handlePayNow}
                    disabled={isLoading}
                >
                    {isLoading ? (
                        <ActivityIndicator color={Colors.white} />
                    ) : (
                        <Text style={styles.payButtonText}>PAY ₹{amount}</Text>
                    )}
                </TouchableOpacity>
            </View>

            <PaymentAuthModal
                visible={showAuthModal}
                amount={amount}
                onClose={() => setShowAuthModal(false)}
                onSuccess={(pin) => {
                    setShowAuthModal(false);
                    executePayment(pin);
                }}
            />
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: Colors.bg },
    scrollContent: { padding: 24, alignItems: 'center' },
    card: {
        backgroundColor: Colors.white,
        borderRadius: 20,
        padding: 24,
        width: '100%',
        alignItems: 'center',
        elevation: 4,
        shadowColor: '#000',
        shadowOpacity: 0.1,
        shadowRadius: 10,
        shadowOffset: { width: 0, height: 4 },
    },
    iconContainer: {
        width: 80,
        height: 80,
        borderRadius: Radius.md,
        backgroundColor: Colors.bgLightest,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 16
    },
    title: { fontSize: 20, color: Colors.textDark, marginBottom: 8, fontFamily: Poppins.bold, },

    subtitle: { fontSize: 16, color: Colors.textSecondary, textAlign: 'center', marginBottom: 24, fontFamily: Poppins.bold, },

    amountContainer: { flexDirection: 'row', alignItems: 'flex-start', marginBottom: 32 },
    currency: { fontSize: 20, color: Colors.primary, marginTop: 4, marginRight: 4, fontFamily: Poppins.bold, },

    amountText: { fontSize: 20, color: Colors.textDark, fontFamily: Poppins.bold, },

    detailsContainer: { width: '100%', borderTopWidth: 1, borderTopColor: Colors.borderLight, paddingTop: 16 },
    detailRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 12 },
    detailLabel: { fontSize: 16, color: Colors.textSecondary, fontFamily: Poppins.bold, },

    detailValue: { fontSize: 16, color: Colors.textDark, fontFamily: Poppins.bold, },

    secureContainer: { flexDirection: 'row', alignItems: 'center', marginTop: 32 },
    secureText: { fontSize: 16, color: Colors.success, marginLeft: 8, fontFamily: Poppins.bold, },

    footer: { padding: 16, backgroundColor: Colors.white, borderTopWidth: 1, borderTopColor: Colors.borderLight },
    payButton: {
        backgroundColor: Colors.primary,
        paddingVertical: 16,
        borderRadius: 12,
        alignItems: 'center',
        justifyContent: 'center',
    },
    payButtonText: { color: Colors.white, fontSize: 16, fontFamily: Poppins.bold, },

});

export default DTHPay;
