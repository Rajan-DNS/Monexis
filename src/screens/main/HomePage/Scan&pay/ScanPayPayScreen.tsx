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
  TextInput,
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

type ScanPayRouteParams = {
  ScanPayPayScreen: {
    payee: { name: string; upiId: string; category: string; verified: boolean };
    amount: string;
    note?: string;
  };
};

const ScanPayPayScreen: React.FC = () => {
  const navigation = useNavigation<any>();
  const route = useRoute<RouteProp<ScanPayRouteParams, 'ScanPayPayScreen'>>();

  const { payee, amount: paramAmount, note: paramNote } = route.params || {
    payee: { name: 'DNS Mart Store', upiId: 'dnsmart@ybl', category: 'Retail Store', verified: true },
    paramAmount: '',
    paramNote: '',
  };
  console.log("qr data ",payee)

  // Amount is editable — QR may or may not include one
  const [amount, setAmount] = useState(paramAmount || '');
  const [note, setNote] = useState(paramNote || '');
  const [amountError, setAmountError] = useState('');

  const [showAuthModal, setShowAuthModal] = useState(false);
  const [isPaying, setIsPaying] = useState(false);
  const [paymentDone, setPaymentDone] = useState(false);
  const [txnId, setTxnId] = useState('');
  const [locationCoords, setLocationCoords] = useState<{ latitude: number; longitude: number } | null>(null);

  useEffect(() => {
    requestLocationSpecs();
  }, []);

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

  const handlePayNow = () => {
    if (!amount || isNaN(Number(amount)) || Number(amount) <= 0) {
      setAmountError('Please enter a valid amount.');
      return;
    }
    setAmountError('');
    setShowAuthModal(true);
  };

  const executePayment = async (pin: string) => {
    setIsPaying(true);
    try {
      // Simulate API call
      await new Promise((res) => setTimeout(res, 1500));
      const generatedTxn = `TXN${Date.now()}`;
      setTxnId(generatedTxn);
      setPaymentDone(true);
    } catch {
      Alert.alert('Error', 'Payment failed. Please try again.');
    } finally {
      setIsPaying(false);
    }
  };

  if (paymentDone) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.successScreen}>
          <LinearGradient
            colors={[Colors.primaryDark, Colors.primary]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.successGradient}
          >
            <View style={styles.successIconCircle}>
              <MaterialCommunityIcons name="check-circle" size={64} color={Colors.white} />
            </View>
            <Text style={styles.successTitle}>Payment Successful!</Text>
            <Text style={styles.successAmount}>₹{amount}</Text>
            <Text style={styles.successPayee}>Paid to {payee.name}</Text>
          </LinearGradient>

          <View style={styles.successDetails}>
            <View style={styles.successDetailRow}>
              <Text style={styles.successDetailLabel}>Transaction ID</Text>
              <Text style={styles.successDetailValue}>{txnId}</Text>
            </View>
            <View style={styles.successDetailRow}>
              <Text style={styles.successDetailLabel}>UPI ID</Text>
              <Text style={styles.successDetailValue}>{payee.upiId}</Text>
            </View>
            <View style={styles.successDetailRow}>
              <Text style={styles.successDetailLabel}>Amount</Text>
              <Text style={styles.successDetailValue}>₹{amount}</Text>
            </View>
            {note ? (
              <View style={styles.successDetailRow}>
                <Text style={styles.successDetailLabel}>Note</Text>
                <Text style={styles.successDetailValue}>{note}</Text>
              </View>
            ) : null}
            <View style={styles.successDetailRow}>
              <Text style={styles.successDetailLabel}>Status</Text>
              <Text style={[styles.successDetailValue, { color: Colors.success }]}>Successful</Text>
            </View>
          </View>

          <TouchableOpacity style={styles.doneBtn} onPress={() => navigation.navigate('MainTabs')}>
            <Text style={styles.doneBtnText}>Done</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <AppHeader
        title="Confirm Payment"
        showBack={true}
        onBackPress={() => navigation.goBack()}
      />

      <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>

        {/* Payee + Amount Display */}
        <LinearGradient
          colors={[Colors.primaryDark, Colors.primary]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.paymentCard}
        >
          <View style={styles.paymentCardDecCircle} />
          <View style={styles.paymentCardDecCircle2} />

          <View style={styles.payeeRow}>
            <View style={styles.payeeAvatar}>
              <Text style={styles.payeeAvatarText}>{payee.name.charAt(0)}</Text>
            </View>
            <View style={styles.payeeDetails}>
              <View style={styles.payeeNameRow}>
                <Text style={styles.payeeCardName}>{payee.name}</Text>
                {payee.verified && (
                  <MaterialCommunityIcons name="check-decagram" size={16} color="rgba(255,255,255,0.9)" style={{ marginLeft: 4 }} />
                )}
              </View>
              <Text style={styles.payeeCardUPI}>{payee.upiId}</Text>
            </View>
          </View>

          <View style={styles.paymentCardDivider} />

          <Text style={styles.payingLabel}>YOU ARE PAYING</Text>
          <Text style={styles.paymentAmountText}>₹{amount}</Text>

          {note ? (
            <View style={styles.noteChip}>
              <MaterialCommunityIcons name="note-text" size={12} color="rgba(255,255,255,0.8)" />
              <Text style={styles.noteChipText}>{note}</Text>
            </View>
          ) : null}
        </LinearGradient>

        {/* ── Amount & Note Input ── */}
        <View style={styles.amountInputCard}>
          {/* Amount row */}
          <View style={styles.amountRow}>
            <View style={styles.amountIconBox}>
              <MaterialCommunityIcons name="currency-inr" size={22} color={Colors.primary} />
            </View>
            <View style={styles.amountInputWrapper}>
              <Text style={styles.amountInputLabel}>Enter Amount</Text>
              <View style={styles.amountInputBox}>
                <Text style={styles.amountRupeeSymbol}>₹</Text>
                <TextInput
                  style={styles.amountTextInput}
                  value={amount}
                  onChangeText={(t) => { setAmount(t.replace(/[^0-9.]/g, '')); setAmountError(''); }}
                  keyboardType="decimal-pad"
                  placeholder="0.00"
                  placeholderTextColor={Colors.textMuted}
                  maxLength={10}
                />
              </View>
              {!!amountError && (
                <Text style={styles.amountError}>{amountError}</Text>
              )}
            </View>
          </View>

          <View style={styles.inputDivider} />

          {/* Note row */}
          <View style={styles.amountRow}>
            <View style={[styles.amountIconBox, { backgroundColor: Colors.infoBg }]}>
              <MaterialCommunityIcons name="note-edit-outline" size={22} color={Colors.infoDark} />
            </View>
            <View style={styles.amountInputWrapper}>
              <Text style={styles.amountInputLabel}>Add Note (optional)</Text>
              <TextInput
                style={styles.noteTextInput}
                value={note}
                onChangeText={setNote}
                placeholder="What's this payment for?"
                placeholderTextColor={Colors.textMuted}
                maxLength={50}
              />
            </View>
          </View>
        </View>

        {/* Bill Summary */}
        <View style={styles.billCard}>
          <View style={styles.billHeader}>
            <MaterialCommunityIcons name="receipt" size={20} color={Colors.primaryDark} />
            <Text style={styles.billHeaderTitle}>Transaction Summary</Text>
          </View>
          <View style={styles.billDivider} />

          <View style={styles.billRow}>
            <Text style={styles.billLabel}>Amount</Text>
            <Text style={styles.billValue}>₹{amount}</Text>
          </View>
          <View style={styles.billRow}>
            <Text style={styles.billLabel}>Convenience Fee</Text>
            <Text style={[styles.billValue, { color: Colors.success }]}>FREE</Text>
          </View>
          <View style={styles.billRow}>
            <Text style={styles.billLabel}>GST</Text>
            <Text style={[styles.billValue, { color: Colors.success }]}>₹0.00</Text>
          </View>

          <View style={styles.billTotalRow}>
            <Text style={styles.billTotalLabel}>Total Payable</Text>
            <Text style={styles.billTotalValue}>₹{amount}</Text>
          </View>
        </View>

        {/* UPI Details */}
        <View style={styles.upiDetailsCard}>
          <View style={styles.upiDetailRow}>
            <View style={styles.upiDetailIcon}>
              <MaterialCommunityIcons name="qrcode" size={20} color={Colors.primary} />
            </View>
            <View style={styles.upiDetailInfo}>
              <Text style={styles.upiDetailLabel}>UPI Address</Text>
              <Text style={styles.upiDetailValue}>{payee.upiId}</Text>
            </View>
          </View>
          <View style={styles.upiDetailRow}>
            <View style={styles.upiDetailIcon}>
              <MaterialCommunityIcons name="clock-fast" size={20} color={Colors.success} />
            </View>
            <View style={styles.upiDetailInfo}>
              <Text style={styles.upiDetailLabel}>Processing Time</Text>
              <Text style={styles.upiDetailValue}>Instant</Text>
            </View>
          </View>
          <View style={styles.upiDetailRow}>
            <View style={styles.upiDetailIcon}>
              <MaterialCommunityIcons name="shield-check-outline" size={20} color={Colors.primary} />
            </View>
            <View style={styles.upiDetailInfo}>
              <Text style={styles.upiDetailLabel}>Security</Text>
              <Text style={styles.upiDetailValue}>UPI PIN Protected</Text>
            </View>
          </View>
        </View>

        {/* Payment Method */}
        <Text style={styles.sectionLabel}>Payment Via</Text>
        <View style={styles.paymentMethodCard}>
          <View style={styles.pmIcon}>
            <MaterialCommunityIcons name="wallet-outline" size={24} color={Colors.primary} />
          </View>
          <View style={styles.pmInfo}>
            <Text style={styles.pmTitle}>NextGen Wallet</Text>
            <Text style={styles.pmSub}>Sufficient balance • Instant transfer</Text>
          </View>
          <MaterialCommunityIcons name="radiobox-marked" size={24} color={Colors.primary} />
        </View>

        {/* Info Note */}
        <View style={styles.infoNote}>
          <MaterialIcons name="info-outline" size={18} color={Colors.warningDark} />
          <Text style={styles.infoNoteText}>
            This payment is protected under UPI guidelines. By proceeding, you authorize ₹{amount} to be debited from your wallet.
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
              <MaterialCommunityIcons name="send" size={22} color={Colors.white} />
              <Text style={styles.payBtnText}>Pay ₹{amount}</Text>
            </>
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
  safeArea: {
    flex: 1,
    backgroundColor: Colors.bgLightest,
  },
  container: {
    flex: 1,
    paddingHorizontal: Spacing.lg,
  },

  // Payment Card (gradient)
  paymentCard: {
    borderRadius: Radius.xxl,
    padding: Spacing.lg,
    marginTop: Spacing.md,
    marginBottom: Spacing.lg,
    elevation: 12,
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 16,
    overflow: 'hidden',
  },
  paymentCardDecCircle: {
    position: 'absolute',
    width: 140,
    height: 140,
    borderRadius: 70,
    backgroundColor: 'rgba(255,255,255,0.06)',
    right: -20,
    top: -30,
  },
  paymentCardDecCircle2: {
    position: 'absolute',
    width: 90,
    height: 90,
    borderRadius: 45,
    backgroundColor: 'rgba(255,255,255,0.07)',
    right: 80,
    bottom: -10,
  },
  payeeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: Spacing.md,
  },
  payeeAvatar: {
    width: 52,
    height: 52,
    borderRadius: Radius.full,
    backgroundColor: 'rgba(255,255,255,0.2)',
    borderWidth: 2,
    borderColor: 'rgba(255,255,255,0.4)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: Spacing.md,
  },
  payeeAvatarText: {
    fontSize: FontSize.xxl,
    fontFamily: Poppins.bold,
    color: Colors.white,
  },
  payeeDetails: { flex: 1 },
  payeeNameRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  payeeCardName: {
    color: Colors.white,
    fontSize: FontSize.lg,
    fontFamily: Poppins.bold,
  },
  payeeCardUPI: {
    color: 'rgba(255,255,255,0.75)',
    fontSize: FontSize.sm,
    fontFamily: Poppins.medium,
    marginTop: 2,
  },
  paymentCardDivider: {
    height: 1,
    backgroundColor: 'rgba(255,255,255,0.2)',
    marginVertical: Spacing.md,
  },
  payingLabel: {
    color: 'rgba(255,255,255,0.7)',
    fontSize: FontSize.xs,
    fontFamily: Poppins.bold,
    letterSpacing: 1,
    marginBottom: Spacing.xs,
  },
  paymentAmountText: {
    color: Colors.white,
    fontSize: 20,
    fontFamily: Poppins.bold,
    lineHeight: 56,
  },
  noteChip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.15)',
    borderRadius: Radius.full,
    paddingHorizontal: Spacing.sm,
    paddingVertical: 4,
    alignSelf: 'flex-start',
    marginTop: Spacing.sm,
    gap: 4,
  },
  noteChipText: {
    color: 'rgba(255,255,255,0.85)',
    fontSize: FontSize.xs,
    fontFamily: Poppins.medium,
  },

  // Amount + Note input card
  amountInputCard: {
    backgroundColor: Colors.white,
    borderRadius: Radius.xl,
    padding: Spacing.md,
    marginBottom: Spacing.lg,
    borderWidth: 1,
    borderColor: Colors.decorLine,
    elevation: 3,
    shadowColor: Colors.primaryDark,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.07,
    shadowRadius: 8,
  },
  amountRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: Spacing.md,
    paddingVertical: Spacing.sm,
  },
  amountIconBox: {
    width: 44,
    height: 44,
    borderRadius: Radius.md,
    backgroundColor: Colors.primaryLight,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 2,
  },
  amountInputWrapper: {
    flex: 1,
  },
  amountInputLabel: {
    fontSize: FontSize.xs,
    fontFamily: Poppins.medium,
    color: Colors.textMuted,
    marginBottom: 4,
    letterSpacing: 0.3,
  },
  amountInputBox: {
    flexDirection: 'row',
    alignItems: 'center',
    borderBottomWidth: 1.5,
    borderBottomColor: Colors.primary,
    paddingBottom: 4,
  },
  amountRupeeSymbol: {
    fontSize: FontSize.xxl,
    fontFamily: Poppins.bold,
    color: Colors.primaryDark,
    marginRight: 4,
  },
  amountTextInput: {
    flex: 1,
    fontSize: FontSize.xxl,
    fontFamily: Poppins.bold,
    color: Colors.primaryDark,
    padding: 0,
  },
  amountError: {
    color: Colors.error,
    fontSize: FontSize.xs,
    fontFamily: Poppins.medium,
    marginTop: 4,
  },
  noteTextInput: {
    fontSize: FontSize.md,
    fontFamily: Poppins.regular,
    color: Colors.textDark,
    borderBottomWidth: 1,
    borderBottomColor: Colors.divider,
    paddingBottom: 4,
    padding: 0,
  },
  inputDivider: {
    height: 1,
    backgroundColor: Colors.decorLine,
    marginVertical: 4,
  },

  // Bill Card
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

  // UPI Details
  upiDetailsCard: {
    backgroundColor: Colors.white,
    borderRadius: Radius.xl,
    padding: Spacing.md,
    marginBottom: Spacing.lg,
    borderWidth: 1,
    borderColor: Colors.decorLine,
    elevation: 2,
    shadowColor: Colors.primaryDark,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    gap: Spacing.sm,
  },
  upiDetailRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  upiDetailIcon: {
    width: 40,
    height: 40,
    borderRadius: Radius.md,
    backgroundColor: Colors.bgInput,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: Spacing.md,
  },
  upiDetailInfo: { flex: 1 },
  upiDetailLabel: {
    fontSize: FontSize.xs,
    fontFamily: Poppins.medium,
    color: Colors.textMuted,
    letterSpacing: 0.3,
  },
  upiDetailValue: {
    fontSize: FontSize.md,
    fontFamily: Poppins.bold,
    color: Colors.textDark,
    marginTop: 1,
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
  pmIcon: {
    width: 48,
    height: 48,
    borderRadius: Radius.md,
    backgroundColor: Colors.white,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: Spacing.md,
  },
  pmInfo: { flex: 1 },
  pmTitle: {
    fontSize: FontSize.lg,
    fontFamily: Poppins.bold,
    color: Colors.textDark,
  },
  pmSub: {
    fontSize: FontSize.sm,
    fontFamily: Poppins.medium,
    color: Colors.success,
    marginTop: 2,
  },

  // Info
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

  // Success Screen
  successScreen: {
    flex: 1,
  },
  successGradient: {
    flex: 0,
    paddingVertical: 48,
    paddingHorizontal: Spacing.xl,
    alignItems: 'center',
  },
  successIconCircle: {
    marginBottom: Spacing.md,
  },
  successTitle: {
    color: Colors.white,
    fontSize: FontSize.xxl,
    fontFamily: Poppins.bold,
    marginBottom: Spacing.sm,
  },
  successAmount: {
    color: Colors.white,
    fontSize: 20,
    fontFamily: Poppins.bold,
    marginBottom: Spacing.xs,
  },
  successPayee: {
    color: 'rgba(255,255,255,0.8)',
    fontSize: FontSize.md,
    fontFamily: Poppins.medium,
  },
  successDetails: {
    backgroundColor: Colors.white,
    margin: Spacing.lg,
    borderRadius: Radius.xl,
    padding: Spacing.lg,
    borderWidth: 1,
    borderColor: Colors.decorLine,
    elevation: 4,
    shadowColor: Colors.primaryDark,
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
    gap: Spacing.sm,
  },
  successDetailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  successDetailLabel: {
    fontSize: FontSize.md,
    fontFamily: Poppins.medium,
    color: Colors.textSecondary,
  },
  successDetailValue: {
    fontSize: FontSize.md,
    fontFamily: Poppins.bold,
    color: Colors.textDark,
    maxWidth: '60%',
    textAlign: 'right',
  },
  doneBtn: {
    marginHorizontal: Spacing.lg,
    backgroundColor: Colors.primaryDark,
    height: 60,
    borderRadius: Radius.lg,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 6,
    shadowColor: Colors.primaryDark,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.35,
    shadowRadius: 12,
  },
  doneBtnText: {
    color: Colors.white,
    fontSize: FontSize.xl,
    fontFamily: Poppins.bold,
  },
});

export default ScanPayPayScreen;
