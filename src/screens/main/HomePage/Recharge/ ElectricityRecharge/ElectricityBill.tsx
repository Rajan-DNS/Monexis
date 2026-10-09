import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Colors } from '../../../../../theme';
import { Poppins } from '../../../../../theme/typography';
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
import { FontSize, IconSize, Radius, Spacing } from '../../../../../theme/spacing';
import { SummaryRow } from '../../../Profile/components/SummaryRow';
import PaymentAuthModal from '../../../../../components/Modals/PaymentAuthModal';
import StatusModal from '../../../../../components/Modals/StatusModal';
import { useBillpayMutation } from '../../../../../redux/services/mainApi/Common/CommonApi';
import { useDeviceLocation } from '../../../../../hooks/useDeviceLocation';
import LocationInfoCard from '../../../../../components/LocationInfoCard';
import AppHeader from '../../../../../components/Header/AppHeader';
import { useRoute, useNavigation, RouteProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../../../../navigation/RootNavigator';

export interface Plan {
  price: string;
  validity: string;
  tag?: string;
}

const ElectricityBill = () => {
  const route = useRoute<RouteProp<RootStackParamList, 'ElectricityBill'>>();
  const params = route.params || {} as any;
  console.log("--------->36", params)

  // Extract dynamic parameters
  const operatorId = params.operator?.id || params.operator?.value;
  const operatorName = params.operator?.name || params.operator?.text || 'Electricity Operator';
  const consumerNumber = params.formDetails.consumerNumber || '';
  const amount = params.amount || '0';
  const consumerLabel = params.consumerLabel || 'Consumer Number';
  const title = params.title || 'Electricity Bill';
  const validity = params.validity;
  const priceBreakdown: Array<{ label: string; value: string }> = params.priceBreakdown;
  const plans: Plan[] = params.plans;
  const offers: Array<{ title: string; desc: string; type: 'apply' }> = params.offers;
  const insights = params.insights;

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
        operatorId: operatorId,
        mobileNo: consumerNumber,
        amount: amount,
        addedById: 0,
        mediumId: 2,
        deviceInfo: currentDevice,
        locationinfo: currentLocation,
        tPin: finalPin,
      };
      console.log('Sending Electricity Bill Payload:', payload);
      const response = await payBill({ data: payload }).unwrap();
      console.log('PayBill Response:', response);

      if (response.success) {
        navigation.navigate('ElectricityPay' as any, {
          responseData: response,
          amount: amount,
          consumerNumber: consumerNumber,
          operatorName: operatorName,
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
  }, [operatorId, consumerNumber, amount, operatorName, payBill, navigation]);

  return (
    <View style={styles.container}>
      <AppHeader
        title={title}
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
            <MaterialCommunityIcons name="flash" size={IconSize.xl} color={Colors.primary} />
          </View>
          <View style={styles.promoTextContainer}>
            <Text style={styles.promoTitle}>Electricity Bill</Text>
            <Text style={styles.promoSubtitle}>Instant payment. Avoid late fees and penalties.</Text>
          </View>
          <Image source={require('../../../../../Assets/img/DTH/dth.png')} style={styles.promoImage} />
        </View>

        {/* LOCATION INFO CARD */}


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
                name="flash-circle"
                size={28}
                color={Colors.white}
              />
            </View>
            <View style={styles.operatorInfo}>
              <Text style={styles.operatorLabel}>ELECTRICITY OPERATOR</Text>
              <Text style={styles.operatorName}>{operatorName}</Text>
            </View>
          </View>

          {priceBreakdown && priceBreakdown.length > 0 && (
            <View style={styles.breakdownSection}>
              {priceBreakdown.map((item, idx) => (
                <View key={idx} style={styles.breakdownRow}>
                  <Text style={styles.breakdownLabel}>{item.label}</Text>
                  <Text style={styles.breakdownValue}>₹{item.value}</Text>
                </View>
              ))}
            </View>
          )}

          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>{consumerLabel}</Text>
            <Text style={styles.infoValue}>{consumerNumber}</Text>
          </View>

          <View style={styles.divider} />

          <View style={styles.planSection}>
            <View style={{ flex: 1 }}>
              <Text style={styles.infoLabel}>Bill Amount</Text>
              <Text style={styles.priceValue}>₹{amount}</Text>
            </View>
            <View style={styles.validityBadge}>
              <View style={styles.validityTag}>
                <Text style={styles.validityTagText}>Due Date</Text>
              </View>
              <View style={styles.validityRow}>
                <MaterialCommunityIcons
                  name="calendar-month"
                  size={18}
                  color={Colors.white}
                />
                <Text style={styles.validityText}>
                  {validity || 'Urgent'}
                </Text>
              </View>
            </View>
          </View>
        </LinearGradient>

        {/* BILLING CYCLES / RECENT BILLS SECTION */}
        {plans && plans.length > 0 && (
          <>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Previous Billing Cycles</Text>
              <TouchableOpacity>
                <Text style={styles.viewAll}>View History</Text>
              </TouchableOpacity>
            </View>

            <View style={styles.historyContainer}>
              {plans.map((plan, idx) => (
                <HistoryCard key={idx} plan={plan} idx={idx} />
              ))}
            </View>
          </>
        )}

        {/* PAYMENT METHOD */}
        <Text style={styles.sectionTitle}>Payment Method</Text>
        <View style={styles.paymentMethods}>
          <PaymentOption
            id="wallet"
            title="NextGen Wallet"
            subtitle={`Balance: ₹${amount}`}
            icon="wallet-outline"
            selected={selectedPayment === 'wallet'}
            onSelect={setSelectedPayment}
          />
        </View>

        {/* BILL SUMMARY */}
        <Text style={styles.sectionTitle}>Bill Summary</Text>
        <View style={styles.summaryCard}>
          <SummaryRow label="Current Bill Charges" value={`₹${amount}`} />
          <SummaryRow label="Taxes & Duties" value="Included" isSuccess />
          <SummaryRow label="Convenience Fee" value="FREE" isSuccess />
          <View style={styles.summaryDivider} />
          <View style={styles.totalRow}>
            <Text style={styles.totalLabel}>Total Payable</Text>
            <Text style={styles.totalValue}>₹{amount}</Text>
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

        {/* AVAILABLE OFFERS */}
        {offers && offers.length > 0 && (
          <>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Available Offers</Text>
              <TouchableOpacity>
                <Text style={styles.viewAll}>VIEW ALL</Text>
              </TouchableOpacity>
            </View>
            <View style={styles.offersContainer}>
              {offers.map((offer, idx) => (
                <View key={idx} style={styles.offerCard}>
                  <View style={styles.offerIconBox}>
                    <MaterialCommunityIcons
                      name="tag"
                      size={20}
                      color={Colors.primary}
                    />
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
        />
        {/* PAY NOW BUTTON */}
        <TouchableOpacity
          style={[styles.payButton, (!isPaymentEnabled || isPaying) && { opacity: 0.6 }]}
          onPress={() => setPaymentModalVisible(true)}
          disabled={!isPaymentEnabled || isPaying}
        >
          <Text style={styles.payButtonText}>
            Pay Now ₹{amount}
          </Text>
          <MaterialCommunityIcons
            name="arrow-right"
            size={24}
            color={Colors.white}
          />
        </TouchableOpacity>

        {/* PAYMENT INSIGHTS */}
        {insights && (
          <>
            <Text style={styles.sectionTitle}>PAYMENT INSIGHTS</Text>
            <View style={styles.insightsRow}>
              <View style={[styles.insightCard, { borderColor: Colors.infoLight }]}>
                <View style={styles.insightIconCircle}>
                  <MaterialCommunityIcons
                    name="trending-up"
                    size={16}
                    color={Colors.primary}
                  />
                </View>
                <Text style={styles.insightLabel}>AVG. MONTHLY</Text>
                <Text style={styles.insightValue}>
                  ₹{insights.avgMonthly}
                </Text>
              </View>
              <View style={[styles.insightCard, { borderColor: Colors.warningLight }]}>
                <View style={styles.insightIconCircle}>
                  <MaterialCommunityIcons
                    name="clock-outline"
                    size={16}
                    color={Colors.warningText}
                  />
                </View>
                <Text style={styles.insightLabel}>DUE DATE</Text>
                <Text style={styles.insightValue}>
                  {insights.dueDate}
                </Text>
              </View>
            </View>
          </>
        )}
      </ScrollView>

      <PaymentAuthModal
        visible={isPaymentModalVisible}
        amount={amount}
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

/* --- SUB COMPONENTS --- */

const HistoryCard = ({ plan, idx }: { plan: Plan; idx: number }) => {
  const [isOpen, setIsOpen] = React.useState(false);

  return (
    <View style={styles.expansionCard}>
      <TouchableOpacity
        style={styles.expansionHeader}
        activeOpacity={0.7}
        onPress={() => setIsOpen(!isOpen)}
      >
        <View style={styles.expansionHeaderLeft}>
          <View style={styles.historyIconBg}>
            <MaterialCommunityIcons name="receipt" size={20} color={Colors.textDark} />
          </View>
          <View>
            <Text style={styles.historyCycleText}>{plan.validity}</Text>
            <Text style={styles.historyPriceText}>₹{plan.price}</Text>
          </View>
        </View>

        <View style={styles.expansionHeaderRight}>
          <View style={styles.paidBadge}>
            <MaterialCommunityIcons name="check-circle" size={12} color={Colors.successDark} />
            <Text style={styles.paidBadgeText}>PAID</Text>
          </View>
          <MaterialCommunityIcons
            name={isOpen ? 'chevron-up' : 'chevron-down'}
            size={20}
            color={Colors.textSecondary}
          />
        </View>
      </TouchableOpacity>

      {isOpen && (
        <View style={styles.expansionContent}>
          <View style={styles.expansionDivider} />
          <View style={styles.detailsRow}>
            <Text style={styles.detailsLabel}>Transaction ID</Text>
            <Text style={styles.detailsValue}>TXN98374928{idx}</Text>
          </View>
          <View style={styles.detailsRow}>
            <Text style={styles.detailsLabel}>Payment Mode</Text>
            <Text style={styles.detailsValue}>NextGen Wallet</Text>
          </View>
        </View>
      )}
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

/* --- STYLES --- */
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
    paddingTop: 20,
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
  operatorInfo: { flex: 1, marginLeft: 16 },
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
    paddingHorizontal: 20,
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
    marginVertical: 10,
  },
  planSection: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  priceValue: {
    color: Colors.white,
    fontSize: 20,
    marginTop: 4,
    fontFamily: Poppins.semiBold,
  },
  validityBadge: { alignItems: 'flex-end' },
  validityTag: {
    backgroundColor: 'rgba(255,255,255,0.1)',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.5)',
    marginBottom: 8,
  },
  validityTagText: {
    color: Colors.white,
    fontSize: 12,
    fontFamily: Poppins.semiBold,
  },
  validityRow: { flexDirection: 'row', alignItems: 'center' },
  validityText: {
    color: Colors.white,
    fontSize: 16,
    marginLeft: 6,
    fontFamily: Poppins.semiBold,
  },
  sectionTitle: {
    fontSize: 16,
    color: Colors.textDark,
    marginTop: 28,
    marginBottom: 16,
    fontFamily: Poppins.semiBold,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  viewAll: {
    color: Colors.primary,
    fontSize: 12,
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
    marginVertical: 20,
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
  offerIconBox: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: Colors.white,
    justifyContent: 'center',
    alignItems: 'center',
  },
  offerTitle: {
    fontSize: 16,
    color: Colors.textDark,
    fontFamily: Poppins.semiBold,
  },
  offerDesc: {
    fontSize: 12,
    color: Colors.textSecondary,
    marginTop: 2,
    fontFamily: Poppins.semiBold,
  },
  applyButton: { paddingHorizontal: 12, paddingVertical: 6 },
  applyText: {
    color: Colors.primary,
    fontSize: 12,
    fontFamily: Poppins.semiBold,
  },
  breakdownSection: { marginTop: 10 },
  breakdownRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  breakdownLabel: {
    color: 'rgba(255,255,255,0.7)',
    fontSize: 12,
    fontFamily: Poppins.semiBold,
  },
  breakdownValue: {
    color: Colors.white,
    fontSize: 12,
    fontFamily: Poppins.semiBold,
  },
  insightsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 12,
    marginBottom: 30,
  },
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
  insightLabel: {
    fontSize: 12,
    color: Colors.textSecondary,
    letterSpacing: 0.5,
    fontFamily: Poppins.semiBold,
  },
  insightValue: {
    fontSize: 16,
    color: Colors.textDark,
    marginTop: 4,
    fontFamily: Poppins.semiBold,
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
    shadowOffset: { width: 2, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 1,
    elevation: 4,
  },
  promoIconBg: {
    width: 44,
    height: 44,
    borderRadius: Radius.full,
    backgroundColor: '#dbeafe',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: Spacing.md,
  },
  promoTextContainer: { flex: 1 },
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
  promoImage: { height: 80, width: 80 },
  historyContainer: { gap: 12, marginBottom: 2 },
  expansionCard: {
    backgroundColor: Colors.white,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: Colors.borderLight,
    overflow: 'hidden',
    elevation: 1,
    shadowColor: Colors.shadow,
    shadowOpacity: 0.03,
    shadowRadius: 8,
  },
  expansionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
  },
  expansionHeaderLeft: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  historyIconBg: {
    width: 40,
    height: 40,
    borderRadius: 10,
    backgroundColor: Colors.bgInput,
    justifyContent: 'center',
    alignItems: 'center',
  },
  historyCycleText: {
    fontSize: 16,
    color: Colors.textDark,
    fontFamily: Poppins.semiBold,
  },
  historyPriceText: {
    fontSize: 12,
    color: Colors.textSecondary,
    fontFamily: Poppins.regular,
    marginTop: 2,
  },
  expansionHeaderRight: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  paidBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: Colors.successLight,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  paidBadgeText: {
    fontSize: 12,
    color: Colors.successDark,
    fontFamily: Poppins.semiBold,
  },
  expansionContent: {
    paddingHorizontal: 16,
    paddingBottom: 16,
  },
  expansionDivider: {
    height: 1,
    backgroundColor: Colors.borderLight,
    marginBottom: 12,
  },
  detailsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  detailsLabel: {
    fontSize: 12,
    color: Colors.textSecondary,
    fontFamily: Poppins.regular,
  },
  detailsValue: {
    fontSize: 12,
    color: Colors.textDark,
    fontFamily: Poppins.medium,
  },
});

export default ElectricityBill;