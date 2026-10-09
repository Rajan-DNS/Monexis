import React, { useState, useEffect, useRef, useCallback } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Image, ActivityIndicator, Platform, PermissionsAndroid, Alert } from 'react-native';
import { useRoute, useNavigation, RouteProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../../../../navigation/RootNavigator';
import AppHeader from '../../../../../components/Header/AppHeader';
import { Colors, Radius, Spacing } from '../../../../../theme';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import { usePayRechargeMutation } from '../../../../../redux/services/RetailerServices/Recharge/RechargeAPI';
import DeviceInfo from 'react-native-device-info';
import Geolocation from '@react-native-community/geolocation';
import { Poppins } from '../../../../../theme/typography';
import { FontSize, IconSize } from '../../../../../theme/spacing';
import StatusModal from '../../../../../components/Modals/StatusModal';
import PaymentAuthModal from '../../../../../components/Modals/PaymentAuthModal';
import LocationInfoCard from '../../../../../components/LocationInfoCard';
import { useDeviceLocation } from '../../../../../hooks/useDeviceLocation';

type DTHBillRouteProp = RouteProp<RootStackParamList, 'DTHBill'>;

const DTHBill = () => {
    const route = useRoute<DTHBillRouteProp>();
    const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();

    const {
        mobileNumber = '',
        amount = '0',
        operator = null,
        plan = null
    } = route.params || {};

    const [selectedPayment, setSelectedPayment] = useState('wallet');
    const [payRecharge, { isLoading }] = usePayRechargeMutation();

    const [modalConfig, setModalConfig] = React.useState<{
        isVisible: boolean;
        type: 'success' | 'error';
        title: string;
        message: string;
    }>({
        isVisible: false,
        type: 'error',
        title: '',
        message: '',
    });
    const [showAuthModal, setShowAuthModal] = useState(false);


    const closeModal = () => setModalConfig(prev => ({ ...prev, isVisible: false }));
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
    // Use Refs to keep executePayment closure fresh —
    // prevents stale deviceInfo/locationinfo in the API payload
    const deviceRef = useRef(deviceModel);
    const locationCoordsRef = useRef(locationCoords);
    const locationStringRef = useRef(locationString);

    useEffect(() => {
        deviceRef.current = deviceModel;
        locationCoordsRef.current = locationCoords;
        locationStringRef.current = locationString;
    }, [deviceModel, locationCoords, locationString]);

    const isPaymentEnabled = !!deviceModel && !!locationCoords;

    const handlePayNow = () => {
        setShowAuthModal(true);
    };

    const executePayment = useCallback(async (pin?: string) => {
        const currentDevice = deviceRef.current || 'Unknown Device';
        const rawLocationStr = locationStringRef.current;
        const rawCoords = locationCoordsRef.current;

        let currentLocation = 'Location not available';
        if (rawLocationStr && rawLocationStr !== 'Location not available') {
            currentLocation = rawLocationStr;
        } else if (rawCoords) {
            currentLocation = `latitude: ${rawCoords.latitude}, longitude: ${rawCoords.longitude}`;
        }

        const finalPin = pin || '';

        try {
            const payload = {
                operatorId: operator?.id || plan?.operatorId || operator?.operatorId || 0,
                mediumId: 2,
                amount: parseInt(amount || '0'),
                rechargePin: finalPin,
                rechargeNumber: mobileNumber,
                deviceInfo: currentDevice,
                locationinfo: currentLocation,
                addedById: 0,
            };
            console.log('Sending DTH Recharge Payload:', payload);

            const response = await payRecharge(payload).unwrap();
            console.log('DTH Recharge Response:', response);

            if (response.success) {
                navigation.navigate('RechargeSuccess', {
                    mobileNumber: mobileNumber,
                    amount: amount,
                    operator: operator?.name || operator?.operatorName || 'DTH Operator',
                    circle: 'India',
                    isPostpaid: false,
                    plan,
                    data: response.data,
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
    }, [operator, plan, amount, mobileNumber, payRecharge, navigation]);

    const parsedAmount = parseFloat(amount || '0');
    const displayAmount = `₹${parsedAmount.toFixed(2)}`;
    const displayOperator = operator?.name || operator?.operatorName || plan?.operatorName || 'DTH Operator';

    return (
        <View style={styles.container}>
            <AppHeader
                title="DTH Bill"
                showBack={true}
                onBackPress={() => navigation.goBack()}
            />

            <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
                {/* 1. Promo Banner */}
                <View style={styles.topPromoBanner}>
                    <View style={styles.promoIconBg}>
                        <MaterialCommunityIcons name="satellite-variant" size={IconSize.xl} color={Colors.primary} />
                    </View>
                    <View style={styles.promoTextContainer}>
                        <Text style={styles.promoTitle}>DTH Recharge</Text>
                        <Text style={styles.promoSubtitle}>Instant recharge. Unlimited entertainment.</Text>
                    </View>
                    <Image source={require('../../../../../Assets/img/DTH/dth.png')} style={styles.promoImage} />
                </View>

                {/* 2. Operator Details Blue Card */}
                <View style={styles.blueCard}>
                    <View style={styles.blueCardHeader}>
                        <View style={styles.blueCardIconBg}>
                            <MaterialCommunityIcons name="antenna" size={24} color={Colors.white} />
                        </View>
                        <View style={styles.blueCardTitleWrap}>
                            <Text style={styles.blueCardLabel}>DTH OPERATOR</Text>
                            <Text style={styles.blueCardTitle}>{displayOperator}</Text>
                        </View>
                    </View>

                    <View style={styles.subscriberRow}>
                        <Text style={styles.blueTextMuted}>Subscriber ID</Text>
                        <Text style={styles.subscriberText}>{mobileNumber}</Text>
                    </View>

                    <View style={styles.blueCardDivider} />

                    <View style={styles.planRow}>
                        <View>
                            <Text style={styles.blueTextMuted}>Recharge Plan</Text>
                            <Text style={styles.planAmount}>{displayAmount}</Text>
                        </View>
                    </View>
                </View>

                {/* 3. Payment Method Section */}
                <Text style={[styles.sectionTitle, { marginBottom: 16 }]}>Payment Method</Text>

                <TouchableOpacity
                    style={[styles.paymentCard, selectedPayment === 'wallet' && styles.paymentCardSelected]}
                    onPress={() => setSelectedPayment('wallet')}
                >
                    <View style={styles.paymentIconBgWallet}>
                        <MaterialCommunityIcons name="wallet-outline" size={20} color={Colors.primary} />
                    </View>
                    <View style={styles.paymentDetails}>
                        <Text style={styles.paymentName}>NextGen Wallet</Text>
                        <Text style={styles.paymentBalance}>Available Balance: {displayAmount}</Text>
                    </View>
                    <MaterialCommunityIcons
                        name={selectedPayment === 'wallet' ? 'circle-slice-8' : 'circle-outline'}
                        size={24}
                        color={selectedPayment === 'wallet' ? Colors.primary : '#d1d5db'}
                    />
                </TouchableOpacity>

                {/* 4. Bill Summary Section */}
                <Text style={[styles.sectionTitle, { marginBottom: 16, marginTop: Spacing.lg }]}>Bill Summary</Text>

                <View style={styles.billSummaryCard}>
                    <View style={styles.summaryRow}>
                        <Text style={styles.summaryLabel}>Subtotal</Text>
                        <Text style={styles.summaryValue}>{displayAmount}</Text>
                    </View>
                    <View style={styles.summaryRow}>
                        <Text style={styles.summaryLabel}>Convenience Fee</Text>
                        <Text style={styles.summaryValueFree}>FREE</Text>
                    </View>

                    <View style={styles.summaryDivider} />

                    <View style={styles.totalRow}>
                        <Text style={styles.totalLabel}>Total Payable</Text>
                        <Text style={styles.totalValue}>{displayAmount}</Text>
                    </View>
                </View>

                {/* 5. Secure Badge */}
                <View style={styles.secureBadge}>
                    <MaterialCommunityIcons name="shield-check" size={16} color={Colors.success} />
                    <Text style={styles.secureText}>PAID VIA NEXTGEN WALLET</Text>
                </View>

                {/* Space spacer inside scroll view for footer clearance */}
                {/* <View style={{ height: 120 }} /> */}
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
                <View style={{ height: 120 }} />

            </ScrollView>

            {/* Sticky Footer */}
            <View style={styles.footer}>
                <TouchableOpacity
                    style={[styles.payButton, isLoading && { opacity: 0.7 }]}
                    onPress={handlePayNow}
                    disabled={isLoading}
                >
                    {isLoading ? (
                        <ActivityIndicator color={Colors.white} />
                    ) : (
                        <>
                            <Text style={styles.payButtonText}>Pay Now {displayAmount}</Text>
                            <MaterialCommunityIcons name="arrow-right" size={20} color={Colors.white} />
                        </>
                    )}
                </TouchableOpacity>
            </View>
            <StatusModal
                isVisible={modalConfig.isVisible}
                type={modalConfig.type}
                title={modalConfig.title}
                message={modalConfig.message}
                onClose={closeModal}
            />

            <PaymentAuthModal
                visible={showAuthModal}
                amount={amount}
                onClose={() => setShowAuthModal(false)}
                onSuccess={(pin) => {
                    setShowAuthModal(false);
                    executePayment(pin);
                }}
            />
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#f8f9fb',
    },
    scrollContent: {
        paddingHorizontal: Spacing.md,
        paddingTop: Spacing.md,
    },
    topPromoBanner: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        backgroundColor: '#eef4ff',
        borderRadius: Radius.lg,
        padding: Spacing.md,
        marginBottom: Spacing.md,
        shadowColor: '#000000',
        shadowOffset: { width: 0, height: 3 },
        shadowOpacity: 0.17,
        shadowRadius: 3.05,
        elevation: 4
    },
    promoIconBg: {
        width: 44,
        height: 44,
        borderRadius: Radius.full,
        backgroundColor: '#dbeafe',
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: Spacing.md
    },
    promoTextContainer: { flex: 1 },
    promoTitle: {
        fontSize: FontSize.lg,
        color: Colors.primary,
        fontFamily: Poppins.bold
    },
    promoSubtitle: {
        fontSize: FontSize.sm,
        color: '#4b5563',
        marginTop: Spacing.xs,
        fontFamily: Poppins.regular
    },
    promoImage: { height: 80, width: 80 },
    blueCard: {
        backgroundColor: Colors.primaryDark,
        borderRadius: Radius.xl,
        padding: Spacing.md,
        marginBottom: Spacing.xl,
        elevation: 4,
        shadowColor: Colors.bgLightest,
        shadowOffset: { width: 2, height: 2 },
        shadowOpacity: 0.25,
        shadowRadius: 1,
    },
    blueCardHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        // marginBottom: Spacing.lg,
    },
    blueCardIconBg: {
        width: 40,
        height: 40,
        borderRadius: Radius.full,
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.3)',
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: Spacing.md,
    },
    blueCardTitleWrap: {
        flex: 1,
    },
    blueCardLabel: {
        fontSize: 10,
        color: '#a3c2ff',
        letterSpacing: 1,
        // marginBottom: Spacing.xs,
        fontFamily: Poppins.bold,
    },
    blueCardTitle: {
        fontSize: 14,
        color: Colors.white,
        fontFamily: Poppins.bold,
    },
    subscriberRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginTop: Spacing.sm,
    },
    blueTextMuted: {
        fontSize: 12,
        color: '#e0eaff',
        fontFamily: Poppins.bold,
    },
    subscriberText: {
        fontSize: 16,
        color: Colors.white,
        fontFamily: Poppins.bold,
    },
    blueCardDivider: {
        height: 1,
        backgroundColor: 'rgba(255,255,255,0.2)',
        marginBottom: Spacing.md,
    },
    planRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    planAmount: {
        fontSize: 18,
        color: Colors.white,
        marginTop: Spacing.xs,
        fontFamily: Poppins.bold,
    },
    sectionTitle: {
        fontSize: 16,
        color: Colors.textDark,
        fontFamily: Poppins.bold,
    },
    paymentCard: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: Colors.white,
        borderRadius: Radius.lg,
        padding: Spacing.md,
        borderWidth: 1,
        borderColor: '#e5e7eb',
        marginBottom: Spacing.md,
    },
    paymentCardSelected: {
        borderColor: Colors.primary,
        backgroundColor: '#f0f5ff',
    },
    paymentIconBgWallet: {
        width: 40,
        height: 40,
        borderRadius: Radius.full,
        backgroundColor: '#e6f0ff',
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: Spacing.sm + 4,
    },
    paymentDetails: {
        flex: 1,
    },
    paymentName: {
        fontSize: 16,
        color: Colors.textDark,
        marginBottom: 2,
        fontFamily: Poppins.bold,
    },
    paymentBalance: {
        fontSize: 12,
        color: Colors.primary,
        fontFamily: Poppins.bold,
    },
    billSummaryCard: {
        marginBottom: Spacing.md,
    },
    summaryRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: Spacing.sm + 4,
    },
    summaryLabel: {
        fontSize: 16,
        color: Colors.textSecondary,
        fontFamily: Poppins.regular,
    },
    summaryValue: {
        fontSize: 16,
        color: Colors.textDark,
        fontFamily: Poppins.regular,
    },
    summaryValueFree: {
        fontSize: 16,
        color: '#f59e0b',
        fontFamily: Poppins.regular,
    },
    summaryDivider: {
        height: 1,
        backgroundColor: '#e5e7eb',
        marginVertical: Spacing.sm,
    },
    totalRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginTop: Spacing.sm,
    },
    totalLabel: {
        fontSize: 16,
        color: Colors.textDark,
        fontFamily: Poppins.regular,
    },
    totalValue: {
        fontSize: 16,
        color: Colors.textDark,
        fontFamily: Poppins.regular,
    },
    secureBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#ecfdf5',
        borderWidth: 1,
        borderColor: '#a7f3d0',
        borderRadius: Radius.sm,
        paddingVertical: Spacing.sm + 4,
        marginBottom: Spacing.lg,
    },
    secureText: {
        fontSize: 12,
        color: Colors.success,
        marginLeft: Spacing.sm,
        letterSpacing: 0.5,
        fontFamily: Poppins.bold,
    },
    footer: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        padding: Spacing.md,
        paddingBottom: Platform.OS === 'ios' ? Spacing.xl : Spacing.md,
        backgroundColor: Colors.white,
        borderTopWidth: 1,
        borderTopColor: '#e5e7eb',
    },
    payButton: {
        backgroundColor: Colors.primaryDark,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: Spacing.md,
        borderRadius: Radius.md,
    },
    payButtonText: {
        color: Colors.white,
        fontSize: 16,
        marginRight: Spacing.sm,
        fontFamily: Poppins.bold,
    },
});

export default DTHBill;
