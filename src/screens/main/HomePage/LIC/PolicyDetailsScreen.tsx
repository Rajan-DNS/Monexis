import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Colors } from '../../../../theme';
import { Poppins } from '../../../../theme/typography';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import {
  Image,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  Alert,
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import { IconSize } from '../../../../theme/spacing';
import PaymentAuthModal from '../../../../components/Modals/PaymentAuthModal';
import StatusModal from '../../../../components/Modals/StatusModal';
import { useBillpayMutation } from '../../../../redux/services/mainApi/Common/CommonApi';
import { useDeviceLocation } from '../../../../hooks/useDeviceLocation';
import LocationInfoCard from '../../../../components/LocationInfoCard';
import AppHeader from '../../../../components/Header/AppHeader';
import { useRoute, useNavigation, RouteProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../../../navigation/RootNavigator';
import { SummaryRow } from '../../Profile/components/SummaryRow';

const PolicyDetailsScreen = () => {
  const route = useRoute<RouteProp<RootStackParamList, 'PolicyDetailsScreen'>>();
  const params = route.params || {} as any;
  const policyData = params.policyData || {};

  const config = {
    title: 'Policy Details',
    operatorName: policyData.operatorName || 'LIC',
    operatorIcon: 'shield-check',
    consumerLabel: 'Policy Number',
    consumerValue: policyData.policyNumber || '',
    validity: policyData.info?.nextDueDate || 'Urgent',
    currentAmount: policyData.amount || '0',
    operator: policyData.operatorId || 0,
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
    openSettings,
    retryLocation,
  } = useDeviceLocation();

  // Use Refs to keep handlePaymentSuccess closure fresh
  const deviceRef = useRef(deviceModel);
  const locationCoordsRef = useRef(locationCoords);
  const locationStringRef = useRef(locationString);

  useEffect(() => {
    deviceRef.current = deviceModel;
    locationCoordsRef.current = locationCoords;
    locationStringRef.current = locationString;
  }, [deviceModel, locationCoords, locationString]);

  const isPaymentEnabled = !!deviceModel && !!locationCoords;

  const handlePaymentSuccess = useCallback(async (pin?: string) => {
    setPaymentModalVisible(false);

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
        operatorId: config.operator,
        mobileNo: config.consumerValue,
        amount: config.currentAmount,
        addedById: 0,
        mediumId: 2,
        deviceInfo: currentDevice,
        locationinfo: currentLocation,
        tPin: finalPin,
      };
      console.log('Sending LIC Policy Payload:', payload);
      const response = await payBill({ data: payload }).unwrap();
      console.log('PayBill Response:', response);

      if (response.success) {
        navigation.navigate('LICSuccessScreen' as any, {
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
          message: response?.message || 'Something went wrong during payment.',
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
        title={config.title}
        onBackPress={() => navigation.goBack()}
        showBack
      />

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* TOP PROMO BANNER */}
        <View style={styles.topPromoBanner}>
          <View style={styles.promoIconBg}>
            <MaterialCommunityIcons name="shield-check" size={IconSize.xl} color={Colors.primary} />
          </View>
          <View style={styles.promoTextContainer}>
            <Text style={styles.promoTitle}>Insurance Premium</Text>
            <Text style={styles.promoSubtitle}>Instant payment. Avoid late fees and penalties.</Text>
          </View>
        </View>

        {/* LOCATION INFO CARD */}
        <LocationInfoCard
          deviceModel={deviceModel}
          locationCoords={locationCoords}
          locationString={locationString}
          permissionStatus={permissionStatus}
          isLoading={locationLoading}
          openSettings={openSettings}
          retryLocation={retryLocation}
        />

        {/* MAIN OPERATOR CARD */}
        <LinearGradient
          colors={[Colors.primaryDark, Colors.primary]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={styles.operatorCard}
        >
          <View style={styles.cardHeader}>
            <View style={styles.iconContainer}>
              <MaterialCommunityIcons
                name="shield"
                size={28}
                color={Colors.white}
              />
            </View>
            <View style={styles.operatorInfo}>
              <Text style={styles.operatorLabel}>INSURANCE OPERATOR</Text>
              <Text style={styles.operatorName}>{config.operatorName}</Text>
            </View>
          </View>

          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>{config.consumerLabel}</Text>
            <Text style={styles.infoValue}>{config.consumerValue}</Text>
          </View>

          <View style={styles.divider} />

          <View style={styles.planSection}>
            <View style={{ flex: 1 }}>
              <Text style={styles.infoLabel}>Premium Amount</Text>
              <Text style={styles.priceValue}>₹{config.currentAmount}</Text>
            </View>
          </View>
        </LinearGradient>

        {/* PAYMENT METHOD */}
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

        {/* BILL SUMMARY */}
        <Text style={styles.sectionTitle}>Bill Summary</Text>
        <View style={styles.summaryCard}>
          <SummaryRow label="Current Premium Charges" value={`₹${config.currentAmount}`} />
          <SummaryRow label="Taxes & Duties" value="Included" isSuccess />
          <SummaryRow label="Convenience Fee" value="FREE" isSuccess />
          <View style={styles.summaryDivider} />
          <View style={styles.totalRow}>
            <Text style={styles.totalLabel}>Total Payable</Text>
            <Text style={styles.totalValue}>₹{config.currentAmount}</Text>
          </View>
        </View>

        {/* WALLET BADGE */}
        <View style={styles.walletBadge}>
          <MaterialCommunityIcons
            name="shield-check-outline"
            size={20}
            color={Colors.successDark}
          />
          <Text style={styles.walletBadgeText}>PAID VIA NEXTGEN WALLET</Text>
        </View>

        {/* PAY NOW BUTTON */}
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

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.bg },
  scrollContent: { padding: 20 },
  operatorCard: {
    borderRadius: 24,
    elevation: 8,
    shadowColor: Colors.bgLightest,
    shadowOffset: { width: 2, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 1,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 24,
    paddingHorizontal: 20,
    paddingTop: 20
  },
  iconContainer: {
    width: 60,
    height: 60,
    borderRadius: 16,
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.3)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  operatorInfo: { flex: 1, marginLeft: 16, },
  operatorLabel: {
    color: 'rgba(255,255,255,0.7)',
    fontSize: 12,
    letterSpacing: 0.5,
    fontFamily: Poppins.semiBold,
  },
  operatorName: {
    color: Colors.white,
    fontSize: 20,
    fontFamily: Poppins.bold,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20
  },
  infoLabel: {
    color: 'rgba(255,255,255,0.8)',
    fontSize: 16,
    fontFamily: Poppins.regular,
  },
  infoValue: {
    color: Colors.white,
    fontSize: 20,
    fontFamily: Poppins.regular,
  },
  divider: {
    height: 1,
    backgroundColor: 'rgba(255,255,255,0.2)',
    marginHorizontal: 20,
    marginVertical: 10
  },
  planSection: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingBottom: 20
  },
  priceValue: {
    color: Colors.white,
    fontSize: 20,
    marginTop: 4,
    fontFamily: Poppins.semiBold,
  },
  sectionTitle: {
    fontSize: 16,
    color: Colors.textDark,
    marginTop: 28,
    marginBottom: 16,
    fontFamily: Poppins.semiBold,
  },
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
  paymentItemSelected: {
    borderColor: Colors.primary,
    backgroundColor: Colors.infoBg,
  },
  paymentIconBox: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: Colors.bgInput,
    justifyContent: 'center',
    alignItems: 'center',
  },
  paymentTitle: {
    fontSize: 16,
    color: Colors.textDark,
    fontFamily: Poppins.semiBold,
  },
  paymentSub: {
    fontSize: 12,
    color: Colors.textSecondary,
    marginTop: 2,
    fontFamily: Poppins.semiBold,
  },
  summaryCard: {
    backgroundColor: Colors.bgInput,
    borderRadius: 24,
    padding: 20,
    marginTop: 4,
  },
  summaryDivider: {
    height: 1,
    backgroundColor: Colors.divider,
    marginVertical: 12,
  },
  totalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  totalLabel: {
    fontSize: 16,
    color: Colors.textDark,
    fontFamily: Poppins.semiBold,
  },
  totalValue: {
    fontSize: 20,
    color: Colors.textDark,
    fontFamily: Poppins.semiBold,
  },
  walletBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.successLight,
    paddingVertical: 10,
    borderRadius: 8,
    marginTop: 20,
    borderWidth: 1,
    borderColor: Colors.successBorder,
  },
  walletBadgeText: {
    color: Colors.successDark,
    fontSize: 12,
    marginLeft: 8,
    fontFamily: Poppins.semiBold,
  },
  payButton: {
    backgroundColor: Colors.primaryDark,
    flexDirection: 'row',
    height: 60,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 24,
    marginBottom: 30,
  },
  payButtonText: {
    color: Colors.white,
    fontSize: 16,
    marginRight: 12,
    fontFamily: Poppins.semiBold,
  },
  topPromoBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.infoBg,
    padding: 16,
    borderRadius: 16,
    marginBottom: 20,
  },
  promoIconBg: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: Colors.white,
    justifyContent: 'center',
    alignItems: 'center',
  },
  promoTextContainer: {
    flex: 1,
    marginLeft: 16,
  },
  promoTitle: {
    fontSize: 16,
    color: Colors.textDark,
    fontFamily: Poppins.bold,
  },
  promoSubtitle: {
    fontSize: 12,
    color: Colors.textSecondary,
    marginTop: 2,
    fontFamily: Poppins.medium,
  },
});

export default PolicyDetailsScreen;
