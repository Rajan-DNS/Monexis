import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
  ActivityIndicator,
  Alert,
  Platform,
  PermissionsAndroid,
} from 'react-native';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import LinearGradient from 'react-native-linear-gradient';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import Geolocation from '@react-native-community/geolocation';
import DeviceInfo from 'react-native-device-info';
import AppHeader from '../../../../components/Header/AppHeader';
import PaymentAuthModal from '../../../../components/Modals/PaymentAuthModal';
import { Colors } from '../../../../theme';
import { Poppins } from '../../../../theme/typography';
import { FontSize, Radius, Spacing } from '../../../../theme/spacing';

type CardToCashPayRouteParams = {
  CardToCashPayScreen: {
    card: { id: string; label: string; last4: string; network: string; color: string[] };
    amount: string;
    fee: string;
    total: string;
  };
};

const CardToCashPayScreen: React.FC = () => {
  const navigation = useNavigation<any>();
  const route = useRoute<RouteProp<CardToCashPayRouteParams, 'CardToCashPayScreen'>>();

  const { card, amount, fee, total } = route.params || {
    card: { id: 'mc', label: 'MC', last4: '8812', network: 'Mastercard Gold', color: ['#170C79', '#0E21A0'] },
    amount: '0',
    fee: '0.00',
    total: '0.00',
  };

  const [showAuthModal, setShowAuthModal] = useState(false);
  const [isPaying, setIsPaying] = useState(false);
  const [locationCoords, setLocationCoords] = useState<{ latitude: number; longitude: number } | null>(null);
  const [deviceModel, setDeviceModel] = useState('Mobile Device');

  useEffect(() => {
    getDeviceDetails();
    requestLocationSpecs();
  }, []);

  const getDeviceDetails = async () => {
    try {
      const brand = DeviceInfo.getBrand();
      const model = DeviceInfo.getModel();
      const sysName = DeviceInfo.getSystemName();
      const sysVer = DeviceInfo.getSystemVersion();
      const appVer = DeviceInfo.getVersion();
      setDeviceModel(`${brand} ${model} ${sysName} ${sysVer} - App v${appVer}`);
    } catch {
      setDeviceModel(`${Platform.OS} Mobile Device`);
    }
  };

  const requestLocationSpecs = async () => {
    if (Platform.OS === 'android') {
      try {
        const granted = await PermissionsAndroid.request(
          PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
          {
            title: 'Location Permission',
            message: 'Required for secure transaction.',
            buttonNeutral: 'Ask Me Later',
            buttonNegative: 'Cancel',
            buttonPositive: 'OK',
          },
        );
        if (granted === PermissionsAndroid.RESULTS.GRANTED) getCurrentGPS();
      } catch (e) {
        console.warn(e);
      }
    } else {
      getCurrentGPS();
    }
  };

  const getCurrentGPS = () => {
    Geolocation.getCurrentPosition(
      (pos) => setLocationCoords({ latitude: pos.coords.latitude, longitude: pos.coords.longitude }),
      (err) => console.warn('GPS error:', err.message),
      { enableHighAccuracy: true, timeout: 15000, maximumAge: 10000 },
    );
  };

  const handlePayNow = () => setShowAuthModal(true);

  const executePayment = async (pin: string) => {
    setIsPaying(true);
    try {
      // Simulate API call
      await new Promise((res) => setTimeout(res, 1500));
      Alert.alert('Success', `₹${amount} withdrawal initiated successfully!`, [
        { text: 'OK', onPress: () => navigation.goBack() },
      ]);
    } catch {
      Alert.alert('Error', 'Something went wrong. Please try again.');
    } finally {
      setIsPaying(false);
    }
  };

  const cardColorArr = (card?.color as string[]) || ['#170C79', '#0E21A0'];

  return (
    <SafeAreaView style={styles.safeArea}>
      <AppHeader
        title="Pay Now"
        showBack={true}
        onBackPress={() => navigation.goBack()}
      />

      <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>

        {/* Card Preview */}
        <LinearGradient
          colors={cardColorArr as any}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.cardPreview}
        >
          <View style={styles.cardPreviewTop}>
            <MaterialCommunityIcons name="integrated-circuit-chip" size={30} color="rgba(255,255,255,0.8)" />
            <View style={styles.cardPreviewBadge}>
              <MaterialCommunityIcons name="shield-lock-outline" size={14} color="rgba(255,255,255,0.8)" />
              <Text style={styles.cardPreviewBadgeText}>SECURED</Text>
            </View>
          </View>
          <Text style={styles.cardPreviewNumber}>•••• •••• •••• {card.last4}</Text>
          <View style={styles.cardPreviewFooter}>
            <View>
              <Text style={styles.cardPreviewNetworkLabel}>CARD NETWORK</Text>
              <Text style={styles.cardPreviewNetwork}>{card.network}</Text>
            </View>
            <Text style={styles.cardPreviewLabel}>{card.label}</Text>
          </View>
        </LinearGradient>

        {/* Amount Display */}
        <View style={styles.amountDisplay}>
          <Text style={styles.amountDisplayLabel}>Withdrawal Amount</Text>
          <Text style={styles.amountDisplayValue}>₹{amount}</Text>
          <View style={styles.amountBadge}>
            <MaterialCommunityIcons name="bank-transfer-out" size={16} color={Colors.primary} />
            <Text style={styles.amountBadgeText}>To Bank Account</Text>
          </View>
        </View>

        {/* Bill Breakdown */}
        <View style={styles.billCard}>
          <View style={styles.billHeader}>
            <MaterialCommunityIcons name="receipt" size={20} color={Colors.primaryDark} />
            <Text style={styles.billHeaderTitle}>Payment Summary</Text>
          </View>
          <View style={styles.billDivider} />

          <View style={styles.billRow}>
            <Text style={styles.billLabel}>Withdrawal Amount</Text>
            <Text style={styles.billValue}>₹{amount}</Text>
          </View>
          <View style={styles.billRow}>
            <Text style={styles.billLabel}>Processing Fee (1.5%)</Text>
            <Text style={[styles.billValue, { color: Colors.warningText }]}>₹{fee}</Text>
          </View>
          <View style={styles.billRow}>
            <Text style={styles.billLabel}>Tax on Fee</Text>
            <Text style={[styles.billValue, { color: Colors.success }]}>Included</Text>
          </View>

          <View style={styles.billTotalRow}>
            <Text style={styles.billTotalLabel}>Total Deducted</Text>
            <Text style={styles.billTotalValue}>₹{total}</Text>
          </View>
        </View>

        {/* Payout Info */}
        <View style={styles.payoutInfoRow}>
          <View style={styles.payoutInfoCard}>
            <View style={styles.payoutIconBox}>
              <MaterialCommunityIcons name="clock-fast" size={20} color={Colors.primary} />
            </View>
            <Text style={styles.payoutInfoLabel}>PAYOUT TIME</Text>
            <Text style={styles.payoutInfoValue}>2–4 Hours</Text>
          </View>
          <View style={styles.payoutInfoCard}>
            <View style={styles.payoutIconBox}>
              <MaterialCommunityIcons name="bank-outline" size={20} color={Colors.success} />
            </View>
            <Text style={styles.payoutInfoLabel}>TO ACCOUNT</Text>
            <Text style={styles.payoutInfoValue}>Linked Bank</Text>
          </View>
          <View style={styles.payoutInfoCard}>
            <View style={styles.payoutIconBox}>
              <MaterialCommunityIcons name="shield-check-outline" size={20} color={Colors.successDark} />
            </View>
            <Text style={styles.payoutInfoLabel}>SECURITY</Text>
            <Text style={styles.payoutInfoValue}>256-bit SSL</Text>
          </View>
        </View>

        {/* Payment Method */}
        <Text style={styles.sectionLabel}>Payment Method</Text>
        <View style={styles.paymentMethodCard}>
          <View style={styles.paymentMethodIcon}>
            <MaterialCommunityIcons name="wallet-outline" size={24} color={Colors.primary} />
          </View>
          <View style={styles.paymentMethodInfo}>
            <Text style={styles.paymentMethodTitle}>NextGen Wallet</Text>
            <Text style={styles.paymentMethodSub}>Sufficient balance available</Text>
          </View>
          <MaterialCommunityIcons name="radiobox-marked" size={24} color={Colors.primary} />
        </View>

        {/* Info Note */}
        <View style={styles.infoNote}>
          <MaterialIcons name="info-outline" size={18} color={Colors.warningDark} />
          <Text style={styles.infoNoteText}>
            By proceeding, you authorize this Card to Cash withdrawal. The amount will be deducted from your card balance and credited to your linked bank account.
          </Text>
        </View>

        <View style={{ height: 24 }} />
      </ScrollView>

      {/* Pay Button */}
      <View style={styles.bottomAction}>
        <TouchableOpacity
          style={styles.payBtn}
          onPress={handlePayNow}
          disabled={isPaying}
          activeOpacity={0.88}
        >
          {isPaying ? (
            <ActivityIndicator color={Colors.white} />
          ) : (
            <>
              <MaterialCommunityIcons name="bank-transfer-out" size={22} color={Colors.white} />
              <Text style={styles.payBtnText}>Pay ₹{total}</Text>
            </>
          )}
        </TouchableOpacity>
      </View>

      <PaymentAuthModal
        visible={showAuthModal}
        amount={total}
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
    paddingHorizontal: Spacing.lg,
  },

  // Card Preview
  cardPreview: {
    borderRadius: Radius.xxl,
    padding: Spacing.lg,
    marginTop: Spacing.md,
    marginBottom: Spacing.lg,
    height: 180,
    justifyContent: 'space-between',
    elevation: 10,
    shadowColor: Colors.primaryDark,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 16,
  },
  cardPreviewTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  cardPreviewBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.15)',
    borderRadius: Radius.full,
    paddingHorizontal: Spacing.sm,
    paddingVertical: 4,
    gap: 4,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.3)',
  },
  cardPreviewBadgeText: {
    color: 'rgba(255,255,255,0.9)',
    fontSize: FontSize.xs,
    fontFamily: Poppins.bold,
    letterSpacing: 0.5,
  },
  cardPreviewNumber: {
    color: Colors.white,
    fontSize: FontSize.lg,
    fontFamily: Poppins.semiBold,
    letterSpacing: 2,
  },
  cardPreviewFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
  },
  cardPreviewNetworkLabel: {
    color: 'rgba(255,255,255,0.6)',
    fontSize: FontSize.xs,
    fontFamily: Poppins.semiBold,
    letterSpacing: 0.5,
  },
  cardPreviewNetwork: {
    color: Colors.white,
    fontSize: FontSize.md,
    fontFamily: Poppins.bold,
  },
  cardPreviewLabel: {
    color: Colors.white,
    fontSize: FontSize.xxl,
    fontFamily: Poppins.bold,
    letterSpacing: 1,
  },

  // Amount Display
  amountDisplay: {
    backgroundColor: Colors.white,
    borderRadius: Radius.xxl,
    padding: Spacing.lg,
    alignItems: 'center',
    marginBottom: Spacing.lg,
    borderWidth: 1,
    borderColor: Colors.decorLine,
    elevation: 3,
    shadowColor: Colors.primaryDark,
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.08,
    shadowRadius: 10,
  },
  amountDisplayLabel: {
    fontSize: FontSize.sm,
    fontFamily: Poppins.medium,
    color: Colors.textSecondary,
    letterSpacing: 0.5,
    textTransform: 'uppercase',
    marginBottom: Spacing.xs,
  },
  amountDisplayValue: {
    fontSize: 20,
    fontFamily: Poppins.bold,
    color: Colors.primaryDark,
    marginBottom: Spacing.sm,
  },
  amountBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.primaryLight,
    borderRadius: Radius.full,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.xs,
    gap: Spacing.xs,
  },
  amountBadgeText: {
    color: Colors.primaryDark,
    fontSize: FontSize.sm,
    fontFamily: Poppins.semiBold,
  },

  // Bill
  billCard: {
    backgroundColor: Colors.white,
    borderRadius: Radius.xl,
    padding: Spacing.lg,
    marginBottom: Spacing.lg,
    borderWidth: 1,
    borderColor: Colors.decorLine,
    elevation: 3,
    shadowColor: Colors.primaryDark,
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.08,
    shadowRadius: 10,
  },
  billHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    marginBottom: Spacing.md,
  },
  billHeaderTitle: {
    fontSize: FontSize.lg,
    fontFamily: Poppins.bold,
    color: Colors.textDark,
  },
  billDivider: {
    height: 1,
    backgroundColor: Colors.divider,
    marginBottom: Spacing.md,
  },
  billRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: Spacing.sm,
  },
  billLabel: {
    fontSize: FontSize.md,
    fontFamily: Poppins.medium,
    color: Colors.textSecondary,
  },
  billValue: {
    fontSize: FontSize.md,
    fontFamily: Poppins.bold,
    color: Colors.textDark,
  },
  billTotalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: Colors.bgInput,
    borderRadius: Radius.lg,
    padding: Spacing.md,
    marginTop: Spacing.sm,
  },
  billTotalLabel: {
    fontSize: FontSize.lg,
    fontFamily: Poppins.bold,
    color: Colors.textDark,
  },
  billTotalValue: {
    fontSize: FontSize.xxl,
    fontFamily: Poppins.bold,
    color: Colors.primaryDark,
  },

  // Payout Info
  payoutInfoRow: {
    flexDirection: 'row',
    gap: Spacing.sm,
    marginBottom: Spacing.lg,
  },
  payoutInfoCard: {
    flex: 1,
    backgroundColor: Colors.white,
    borderRadius: Radius.xl,
    padding: Spacing.md,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: Colors.decorLine,
    elevation: 2,
    shadowColor: Colors.primaryDark,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 6,
  },
  payoutIconBox: {
    width: 40,
    height: 40,
    borderRadius: Radius.md,
    backgroundColor: Colors.bgInput,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: Spacing.xs,
  },
  payoutInfoLabel: {
    fontSize: FontSize.xs,
    fontFamily: Poppins.bold,
    color: Colors.textMuted,
    letterSpacing: 0.5,
    textAlign: 'center',
  },
  payoutInfoValue: {
    fontSize: FontSize.sm,
    fontFamily: Poppins.bold,
    color: Colors.textDark,
    textAlign: 'center',
    marginTop: 2,
  },

  // Payment Method
  sectionLabel: {
    fontSize: FontSize.lg,
    fontFamily: Poppins.bold,
    color: Colors.textDark,
    marginBottom: Spacing.md,
  },
  paymentMethodCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.infoBg,
    borderRadius: Radius.xl,
    padding: Spacing.md,
    marginBottom: Spacing.md,
    borderWidth: 1.5,
    borderColor: Colors.primary,
    elevation: 2,
  },
  paymentMethodIcon: {
    width: 48,
    height: 48,
    borderRadius: Radius.md,
    backgroundColor: Colors.white,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: Spacing.md,
  },
  paymentMethodInfo: { flex: 1 },
  paymentMethodTitle: {
    fontSize: FontSize.lg,
    fontFamily: Poppins.bold,
    color: Colors.textDark,
  },
  paymentMethodSub: {
    fontSize: FontSize.sm,
    fontFamily: Poppins.medium,
    color: Colors.success,
    marginTop: 2,
  },

  // Info Note
  infoNote: {
    flexDirection: 'row',
    backgroundColor: Colors.warningBg,
    padding: Spacing.md,
    borderRadius: Radius.lg,
    borderWidth: 1,
    borderColor: Colors.warningBorder,
    alignItems: 'flex-start',
  },
  infoNoteText: {
    flex: 1,
    marginLeft: Spacing.sm,
    fontSize: 12,
    lineHeight: 18,
    color: Colors.warningDark,
    fontFamily: Poppins.medium,
  },

  // Bottom
  bottomAction: {
    padding: Spacing.lg,
    backgroundColor: Colors.white,
    borderTopWidth: 1,
    borderTopColor: Colors.divider,
  },
  payBtn: {
    flexDirection: 'row',
    backgroundColor: Colors.primaryDark,
    height: 60,
    borderRadius: Radius.lg,
    justifyContent: 'center',
    alignItems: 'center',
    gap: Spacing.sm,
    elevation: 6,
    shadowColor: Colors.primaryDark,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.35,
    shadowRadius: 12,
  },
  payBtnText: {
    color: Colors.white,
    fontSize: FontSize.xl,
    fontFamily: Poppins.bold,
  },
});

export default CardToCashPayScreen;
