import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, SafeAreaView, Image, ActivityIndicator, Alert, Platform, PermissionsAndroid } from 'react-native';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { Colors, Radius, Spacing } from '../../../../../../theme';
import AppHeader from '../../../../../../components/Header/AppHeader';
import { RootStackParamList } from '../../../../../../navigation/RootNavigator';
import { usePayRechargeMutation } from '../../../../../../redux/services/RetailerServices/Recharge/RechargeAPI';
import { logAllDeviceData } from '../../../../../../components/parseDeviceInfo/parseDeviceInfo';
import DeviceInfo from 'react-native-device-info';
import Geolocation from '@react-native-community/geolocation';
import { Poppins } from '../../../../../../theme/typography';
import { FontSize } from '../../../../../../theme/spacing';
import LinearGradient from 'react-native-linear-gradient';
import PaymentAuthModal from '../../../../../../components/Modals/PaymentAuthModal';
import { SummaryRow } from '../../../../Profile/components/SummaryRow';

type PlanConfirmationRouteProp = RouteProp<RootStackParamList, 'PlanConfirmation'>;

const PlanConfirmationScreen: React.FC = () => {
    const navigation = useNavigation<any>();
    const route = useRoute<PlanConfirmationRouteProp>();

    const {
        plan = {},
        mobileNumber = '',
        amount = '',
        operator = null,
        circle = '',
        isPostpaid = false,
        rechargePin = ''
    } = route.params || {};

    const displayPhone = mobileNumber;
    const displayOperator = operator?.name || plan?.operator || 'Jio';
    const displayCircle = circle || 'Mumbai';
    const displayAmount = amount || plan?.price || plan?.rs || '0';

    const [payRecharge, { isLoading: isPaying }] = usePayRechargeMutation();
    const [deviceModel, setDeviceModel] = useState('Mobile Device');
    const [locationCoords, setLocationCoords] = useState<{ latitude: number; longitude: number } | null>(null);
    const [showAuthModal, setShowAuthModal] = useState(false);

    const extractPlanBenefits = (desc: string = '') => {
        const result = {
            calls: 'Unlimited Calls',
            data: 'N/A',
            sms: '100 SMS/Day',
        };

        if (!desc) return result;

        const normalizedDesc = desc.replace(/\n/g, ' ').replace(/\s+/g, ' ');

        // 1. Extract Calls
        const callsMatch = normalizedDesc.match(/Calls\s*:\s*([^|]+)/i);
        if (callsMatch) {
            result.calls = callsMatch[1].trim();
        } else if (normalizedDesc.toLowerCase().includes('unlimited calls') || normalizedDesc.toLowerCase().includes('unlimited local & std')) {
            result.calls = 'Unlimited Calls';
        }

        const dashboardDashDataMatch = normalizedDesc.match(/UNLIMITED DATA\s*-\s*([^|.\n]+)/i);
        const dataColonMatch = normalizedDesc.match(/Data\s*:\s*([^|]+)/i);
        const bulletDataMatch = normalizedDesc.match(/\d+\.\s*Unlimited Data\s*\((.*?)\)/i);

        if (dashboardDashDataMatch) {
            result.data = dashboardDashDataMatch[1].trim();
        } else if (dataColonMatch) {
            result.data = dataColonMatch[1].trim();
        } else if (bulletDataMatch) {
            result.data = bulletDataMatch[1].trim();
        } else if (normalizedDesc.toLowerCase().includes('unlimited data')) {
            result.data = 'Unlimited Data';
        }

        // 3. Extract SMS
        const smsMatch = normalizedDesc.match(/SMS\s*:\s*([^|]+)/i);
        const genericSmsMatch = normalizedDesc.match(/(\d+\s*SMS\s*\/\s*day|\d+\s*SMS)/i);

        if (smsMatch) {
            result.sms = smsMatch[1].trim();
        } else if (genericSmsMatch) {
            result.sms = genericSmsMatch[1].trim();
        }

        return result;
    };

    const benefits = extractPlanBenefits(plan?.desc || plan?.ofrtext);

    useEffect(() => {
        getDeviceDetails();
        logAllDeviceData();
        requestLocationSpecs();
    }, []);

    const getDeviceDetails = async () => {
        try {
            await logAllDeviceData();
            const syncData = {
                uniqueId: DeviceInfo.getUniqueIdSync(),
                bundleId: DeviceInfo.getBundleId(),
                systemName: DeviceInfo.getSystemName(),
                systemVersion: DeviceInfo.getSystemVersion(),
                brand: DeviceInfo.getBrand(),
                model: DeviceInfo.getModel(),
                deviceId: DeviceInfo.getDeviceId(),
                apiLevel: Platform.OS === 'android' ? DeviceInfo.getApiLevelSync() : -1,
                isEmulator: DeviceInfo.isEmulatorSync(),
                isTablet: DeviceInfo.isTablet(),
                appName: DeviceInfo.getApplicationName(),
                appVersion: DeviceInfo.getVersion(),
                buildNumber: DeviceInfo.getBuildNumber(),
            };
            setDeviceModel(`${syncData.brand} ${syncData.model} ${syncData.systemName} ${syncData.systemVersion} - App v${syncData.appVersion} build ${syncData.buildNumber}`);
        } catch (error) {
            setDeviceModel(`${Platform.OS} Mobile Device`);
        }
    };

    const requestLocationSpecs = async () => {
        if (Platform.OS === 'android') {
            try {
                const granted = await PermissionsAndroid.request(
                    PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
                    {
                        title: 'Location Access Request',
                        message: 'Secure transaction settlement parameters require current tracking values enabled.',
                        buttonNeutral: 'Ask Me Later',
                        buttonNegative: 'Cancel',
                        buttonPositive: 'OK',
                    }
                );
                if (granted === PermissionsAndroid.RESULTS.GRANTED) {
                    getCurrentGPSCoordinates();
                }
            } catch (err) {
                console.warn(err);
            }
        } else {
            getCurrentGPSCoordinates();
        }
    };

    const getCurrentGPSCoordinates = () => {
        Geolocation.getCurrentPosition(
            (position) => {
                const { latitude, longitude } = position.coords;
                setLocationCoords({ latitude, longitude });
            },
            (error) => {
                console.warn('Geolocation tracing failed code:', error.code, error.message);
            },
            { enableHighAccuracy: true, timeout: 15000, maximumAge: 10000 }
        );
    };

    const handleProceed = () => {
        setShowAuthModal(true);
    };

    const executePayment = async (enteredPin: string) => {
        const locationString = locationCoords
            ? `latitude: ${locationCoords.latitude}, longitude: ${locationCoords.longitude}`
            : "Location not available";
        try {
            const payload = {
                operatorId: operator?.id || (plan as any)?.operatorId || 0,
                mediumId: 2,
                amount: parseInt(displayAmount),
                rechargePin: enteredPin || rechargePin,
                rechargeNumber: displayPhone,
                deviceInfo: deviceModel,
                locationinfo: locationString,
                addedById: 0,
            };

            const response = await payRecharge(payload).unwrap();

            if (response.success) {

                navigation.navigate('RechargeSuccess', {
                    mobileNumber: displayPhone,
                    amount: displayAmount,
                    operator: displayOperator,
                    circle: displayCircle,
                    isPostpaid,
                    plan,
                    data: response.data
                });
            } else {
                Alert.alert("Recharge Failed", response.message || "Failed to process recharge.");
            }
        } catch (error: any) {
            Alert.alert("Error", error?.data?.message || "Something went wrong.");
        }
    };

    const displayType = isPostpaid ? 'POSTPAID' : 'PREPAID';
    const displayValidity = plan?.validity || 'Current Bill';

    return (
        <SafeAreaView style={styles.safeArea}>
            <AppHeader
                title="Review Plan"
                showBack={true}
                onBackPress={() => navigation.goBack()}
            />

            <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
                <View style={styles.userInfoCard}>
                    <View style={styles.userInfoRow}>
                        <View style={styles.userTextInfo}>
                            <Text style={styles.prepaidLabel}>{displayType}</Text>
                            <Text style={styles.phoneNumber}>{displayPhone}</Text>
                            <Text style={styles.operatorCircle}>{displayOperator} • {displayCircle}</Text>
                        </View>
                        <View style={styles.phoneIconContainer}>
                            <MaterialCommunityIcons name="cellphone" size={32} color={Colors.primary} />
                        </View>
                    </View>
                </View>

                <LinearGradient start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} colors={[Colors.primaryDark, Colors.primary]} style={styles.planCard}>
                    <View style={styles.planCardHeader}>
                        <View style={styles.operatorCircleSmall}>
                            {operator?.logo ? (
                                <Image source={{ uri: operator.logo }} style={{ width: 24, height: 24, borderRadius: 12 }} />
                            ) : (
                                <MaterialCommunityIcons name="cellphone" size={24} color="white" />
                            )}
                        </View>
                        <View style={styles.planNameContainer}>
                            <Text style={styles.planNameText}>{displayOperator.toUpperCase()} {displayType}</Text>
                            <Text style={styles.planPhoneText}>{displayPhone}</Text>
                        </View>
                        <MaterialCommunityIcons name="file-document-outline" size={24} color="white" />
                    </View>

                    <View style={styles.planPriceRow}>
                        <View>
                            <Text style={styles.planPriceText}>₹ {displayAmount} <Text style={styles.planValiditySmall}> / {displayValidity} </Text></Text>
                        </View>
                        {!isPostpaid && benefits.data !== 'N/A' && (
                            <View style={{ alignItems: 'flex-end', maxWidth: '65%' }}>
                                <Text style={styles.planDataText} numberOfLines={1} adjustsFontSizeToFit>{benefits.data}</Text>
                                <Text style={styles.planDataLabel}>DATA BALANCE</Text>
                            </View>
                        )}
                    </View>

                    <View style={styles.planBenefitsGrid}>
                        {benefits.calls !== 'N/A' && (
                            <View style={styles.benefitItem}>
                                <MaterialCommunityIcons name="infinity" size={16} color="white" />
                                <Text style={styles.benefitText}>{benefits.calls}</Text>
                            </View>
                        )}
                        {benefits.sms !== 'N/A' && (
                            <View style={styles.benefitItem}>
                                <MaterialCommunityIcons name="email-outline" size={16} color="white" />
                                <Text style={styles.benefitText}>{benefits.sms}</Text>
                            </View>
                        )}
                        <View style={styles.benefitItem}>
                            <MaterialCommunityIcons name="calendar-range" size={16} color="white" />
                            <Text style={styles.benefitText}>{displayValidity}</Text>
                        </View>
                    </View>
                </LinearGradient>

                <View style={styles.billSummaryContainer}>
                    <View style={styles.billRow}>
                        <Text style={styles.billLabel}>Plan Amount</Text>
                        <Text style={styles.billValue}>₹{displayAmount}.00</Text>
                    </View>
                    <View style={styles.billRow}>
                        <Text style={styles.billLabel}>Convenience Fee</Text>
                        <Text style={[styles.billValue, { color: Colors.success }]}>FREE</Text>
                    </View>
                    <View style={styles.totalRow}>
                        <Text style={styles.totalLabel}>Total Amount</Text>
                        <Text style={styles.totalValue}>₹{displayAmount}.00</Text>
                    </View>
                </View>


                <View style={styles.infoNote}>
                    <MaterialIcons name="info-outline" size={20} color={Colors.warningDark} />
                    <Text style={styles.infoNoteText}>
                        By proceeding, you agree to the Terms of Service. The recharge will be processed instantly and a confirmation SMS will be sent to your number.
                    </Text>
                </View>
                <View style={{ height: 20 }} />
            </ScrollView>

            <View style={styles.bottomAction}>
                <TouchableOpacity
                    style={styles.proceedButton}
                    onPress={handleProceed}
                    disabled={isPaying}
                >
                    {isPaying ? (
                        <ActivityIndicator color="white" />
                    ) : (
                        <Text style={styles.proceedButtonText}>Proceed to Pay ₹{displayAmount}</Text>
                    )}
                </TouchableOpacity>
            </View>

            {/* PIN / Biometric auth — fires before actual payment */}
            <PaymentAuthModal
                visible={showAuthModal}
                amount={displayAmount}
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
    safeArea: {
        flex: 1,
        backgroundColor: Colors.bgLightest,
    },
    container: {
        flex: 1,
        padding: Spacing.lg,
    },
    userInfoCard: {
        backgroundColor: Colors.bgLightest,
        borderRadius: Radius.md,
        padding: Spacing.lg - 4,
        marginBottom: Spacing.lg,
        borderColor: Platform.OS === 'ios' ? '#F3F4F6' : 'transparent',
        shadowOffset: { width: 2, height: 2 },
        shadowOpacity: 0.08,
        shadowRadius: 1,
        shadowColor: Colors.primary,
        elevation: 3,
    },
    userInfoRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    userTextInfo: {
        flex: 1,
    },
    prepaidLabel: {
        fontSize: FontSize.sm,
        color: Colors.warningDark,
        marginBottom: Spacing.xs,
        letterSpacing: 0.5,
        fontFamily: Poppins.semiBold,
    },
    phoneNumber: {
        fontSize: FontSize.xxl,
        color: Colors.textDark,
        marginBottom: Spacing.xs,
        fontFamily: Poppins.semiBold,
    },
    operatorCircle: {
        fontSize: FontSize.lg,
        color: Colors.textSecondary,
        fontFamily: Poppins.semiBold,
    },
    phoneIconContainer: {
        width: 56,
        height: 56,
        borderRadius: Radius.md,
        backgroundColor: Colors.white,
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 1,
        borderColor: '#E2E8F0',
    },
    planCard: {
        // backgroundColor: Colors.primaryDark,
        borderRadius: Radius.md,
        padding: Platform.OS === 'ios' ? 0 : 20,
        marginBottom: Spacing.lg,
        borderColor: Platform.OS === 'ios' ? '#F3F4F6' : 'transparent',
        shadowOffset: { width: 2, height: 2 },
        shadowOpacity: 0.08,
        shadowRadius: 1,
        shadowColor: Colors.primary,
        elevation: 3,
    },
    planCardHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: Platform.OS === 'ios' ? 10 : 20,
        paddingHorizontal: Platform.OS === 'ios' ? 20 : 0,
        paddingVertical: Platform.OS === 'ios' ? 20 : 0


    },
    operatorCircleSmall: {
        width: 44,
        height: 44,
        borderRadius: Radius.full,
        backgroundColor: 'rgba(255,255,255,0.2)',
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: Spacing.md,
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.3)',
    },
    planNameContainer: {
        flex: 1,
    },
    planNameText: {
        color: Colors.white,
        fontSize: FontSize.lg,
        fontFamily: Poppins.semiBold,

    },
    planPhoneText: {
        color: 'rgba(255,255,255,0.8)',
        fontSize: FontSize.md,
        fontFamily: Poppins.semiBold,

    },
    planPriceRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        // alignItems: 'flex-end',
        // paddingBottom: Spacing.md + 4,
        borderBottomWidth: 1,
        borderBottomColor: 'rgba(255,255,255,0.2)',
        // marginBottom: Spacing.md + 4,
        paddingHorizontal: Platform.OS === 'ios' ? 20 : 0


    },
    planPriceText: {
        color: Colors.white,
        fontSize: FontSize.xl,
        fontFamily: Poppins.semiBold,


    },
    planValiditySmall: {
        fontSize: FontSize.md,
        color: 'rgba(255,255,255,0.7)',
        fontFamily: Poppins.semiBold,
    },
    planDataText: {
        color: Colors.white,
        fontSize: FontSize.xl,
        fontFamily: Poppins.semiBold,
    },
    planDataLabel: {
        color: 'rgba(255,255,255,0.7)',
        fontSize: FontSize.xs,
        fontFamily: Poppins.semiBold,
    },
    planBenefitsGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        paddingHorizontal: Platform.OS === 'ios' ? 20 : 0,
        paddingBottom: Platform.OS === 'ios' ? 10 : 0

    },
    benefitItem: {
        flexDirection: 'row',
        alignItems: 'center',
        marginRight: Spacing.md,
        marginTop: Spacing.sm,
    },
    benefitText: {
        color: Colors.white,
        fontSize: 12,
        marginLeft: Spacing.sm,
        fontFamily: Poppins.semiBold,
    },
    billSummaryContainer: {
        backgroundColor: Colors.bgInput,
        borderRadius: Radius.xl,
        marginBottom: Spacing.lg,
        shadowOffset: { width: 0, height: 4 },
        shadowColor: Colors.textDark,
        shadowOpacity: 0.1,
        shadowRadius: 4,
    },
    billRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        paddingHorizontal: Spacing.lg - 4,
        paddingVertical: Spacing.md,
        backgroundColor: Colors.white,
        borderBottomWidth: 1,
        borderBottomColor: Colors.bgInput,
    },
    billLabel: {
        fontSize: 16,
        color: Colors.textSecondary,
        fontFamily: Poppins.semiBold,
    },
    billValue: {
        fontSize: 16,
        color: Colors.textDark,
        fontFamily: Poppins.semiBold,
    },
    totalRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        paddingHorizontal: Spacing.lg - 4,
        paddingVertical: Spacing.md,
        alignItems: 'center',
    },
    totalLabel: {
        fontSize: FontSize.xl,
        color: Colors.textDark,
        fontFamily: Poppins.semiBold,
    },
    totalValue: {
        fontSize: FontSize.xxl,
        color: Colors.textDark,
        fontFamily: Poppins.semiBold,
    },
    infoNote: {
        flexDirection: 'row',
        backgroundColor: Colors.warningBg,
        padding: Spacing.md,
        borderRadius: Radius.lg,
        borderWidth: 1,
        borderColor: Colors.warningBorder,
    },
    infoNoteText: {
        flex: 1,
        marginLeft: Spacing.sm + 4,
        fontSize: 12,
        lineHeight: 18,
        color: Colors.warningDark,
        fontFamily: Poppins.medium,
    },
    bottomAction: {
        padding: Spacing.lg,
        backgroundColor: Colors.white,
        borderTopWidth: 1,
        borderTopColor: '#E2E8F0',
    },
    proceedButton: {
        backgroundColor: Colors.primaryDark,
        height: 60,
        borderRadius: Radius.md,
        justifyContent: 'center',
        alignItems: 'center',
        shadowColor: Colors.bgInput,
        shadowOffset: { width: 0, height: 3 },
        shadowOpacity: 0.17,
        shadowRadius: 3.05,
        elevation: 4
    },
    proceedButtonText: {
        color: Colors.white,
        fontSize: FontSize.xl,
        fontFamily: Poppins.semiBold,
    },
    summaryCard: {
        backgroundColor: Colors.bgInput,
        borderRadius: 24,
        padding: 20,
        marginTop: 4,
    },
    summaryDivider: { height: 1, backgroundColor: Colors.divider, marginVertical: 12 },

});

export default PlanConfirmationScreen;