import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
  TextInput,
} from 'react-native';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import LinearGradient from 'react-native-linear-gradient';
import { useNavigation } from '@react-navigation/native';
import AppHeader from '../../../../components/Header/AppHeader';
import { Colors } from '../../../../theme';
import { Poppins } from '../../../../theme/typography';
import { FontSize, Radius, Spacing } from '../../../../theme/spacing';

const CREDIT_CARDS = [
  { id: 'hdfc', bank: 'HDFC Bank Credit Card', last4: '4567', icon: 'credit-card', iconColor: '#003087', iconBg: '#e8f0fb' },
  { id: 'icici', bank: 'ICICI Bank Credit Card', last4: '8812', icon: 'credit-card', iconColor: '#F15B25', iconBg: '#fff3ee' },
  { id: 'sbi', bank: 'SBI Card', last4: '3301', icon: 'credit-card', iconColor: '#2557A7', iconBg: '#eef3fc' },
];

const BANK_ACCOUNTS = [
  { id: 'sbi', name: 'State Bank of India', accountNo: '•••• •••• 1234', icon: 'bank', iconColor: '#2557A7', iconBg: '#eef3fc' },
  { id: 'hdfc', name: 'HDFC Bank', accountNo: '•••• •••• 5678', icon: 'bank', iconColor: '#003087', iconBg: '#e8f0fb' },
];

const RECENT_TRANSACTIONS = [
  { id: '1', card: 'HDFC Bank Credit Card', date: '02 May 2024, 11:30 AM', amount: '₹10,000', status: 'Success', iconColor: '#003087', iconBg: '#e8f0fb' },
  { id: '2', card: 'ICICI Bank Credit Card', date: '01 May 2024, 04:20 PM', amount: '₹15,000', status: 'Success', iconColor: '#F15B25', iconBg: '#fff3ee' },
  { id: '3', card: 'SBI Card', date: '30 Apr 2024, 09:45 AM', amount: '₹8,000', status: 'Success', iconColor: '#2557A7', iconBg: '#eef3fc' },
];

const WHY_FEATURES = [
  { icon: 'lightning-bolt', label: 'Instant\nDisbursal', color: Colors.primary },
  { icon: 'shield-check', label: '100%\nSecure', color: Colors.primary },
  { icon: 'percent-outline', label: 'Lowest\nCharges', color: Colors.primary },
  { icon: 'bank-transfer', label: 'Direct to Bank\nAccount', color: Colors.primary },
];

const CardToCashConfirmScreen: React.FC = () => {
  const navigation = useNavigation<any>();
  const [selectedCard, setSelectedCard] = useState(CREDIT_CARDS[0]);
  const [selectedBank, setSelectedBank] = useState(BANK_ACCOUNTS[0]);
  const [amount, setAmount] = useState('');
  const [showCardDrop, setShowCardDrop] = useState(false);
  const [showBankDrop, setShowBankDrop] = useState(false);

  const numericAmount = parseFloat(amount || '0');
  const processingFee = numericAmount > 0 ? +(numericAmount * 0.018).toFixed(2) : 0;
  const gst = numericAmount > 0 ? +(processingFee * 0.18).toFixed(2) : 0;
  const youGet = numericAmount > 0 ? +(numericAmount - processingFee - gst).toFixed(2) : 0;

  const handleProceed = () => {
    if (!amount || numericAmount < 1000) return;
    navigation.navigate('CardToCashPayScreen', {
      card: selectedCard,
      amount,
      fee: processingFee.toFixed(2),
      total: numericAmount.toFixed(2),
    });
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <AppHeader
        title="Card to Cash"
        showBack={true}
        onBackPress={() => navigation.goBack()}
      />

      <ScrollView style={styles.container} showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 24 }}>

        {/* ── HERO BANNER ── */}
        <View style={styles.heroBanner}>
          <View style={styles.heroLeft}>
            <Text style={styles.heroTitle}>Instant Cash from{'\n'}Your Credit Card</Text>
            <Text style={styles.heroSubtitle}>Transfer money to your bank{'\n'}account in just a few clicks</Text>

            <View style={styles.heroFeatureRow}>
              {[
                { icon: 'lightning-bolt', label: 'Instant\nTransfer' },
                { icon: 'shield-check-outline', label: '100%\nSecure' },
                { icon: 'percent-outline', label: 'Lowest\nCharges' },
              ].map((f) => (
                <View key={f.icon} style={styles.heroFeatureItem}>
                  <View style={styles.heroFeatureIconBox}>
                    <MaterialCommunityIcons name={f.icon} size={18} color={Colors.primary} />
                  </View>
                  <Text style={styles.heroFeatureLabel}>{f.label}</Text>
                </View>
              ))}
            </View>

            <View style={styles.heroPriceBadge}>
              <MaterialCommunityIcons name="tag-outline" size={14} color={Colors.primary} />
              <Text style={styles.heroPriceText}>Low Processing Fee{'\n'}Starting from 1.50%*</Text>
            </View>
          </View>

          <View style={styles.heroRight}>
            <View style={styles.heroCardIllustration}>
              <LinearGradient
                colors={[Colors.primaryDark, Colors.primary]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.heroCardGraphic}
              >
                <MaterialCommunityIcons name="integrated-circuit-chip" size={20} color="rgba(255,255,255,0.7)" />
                <Text style={styles.heroCardNum}>1234  5678{'\n'}9012  3456</Text>
                <Text style={styles.heroCardHolder}>CARD HOLDER</Text>
              </LinearGradient>
              <View style={styles.heroCoinBadge}>
                <MaterialCommunityIcons name="cash-multiple" size={28} color={Colors.success} />
              </View>
            </View>
          </View>
        </View>

        {/* ── TRANSFER FORM ── */}
        <View style={styles.formCard}>
          <Text style={styles.formTitle}>Transfer Money</Text>

          {/* Credit Card Selector */}
          <Text style={styles.fieldLabel}>Select Credit Card</Text>
          <TouchableOpacity
            style={styles.dropdownBtn}
            onPress={() => { setShowCardDrop(!showCardDrop); setShowBankDrop(false); }}
            activeOpacity={0.8}
          >
            <View style={[styles.dropdownIconBox, { backgroundColor: selectedCard.iconBg }]}>
              <MaterialCommunityIcons name={selectedCard.icon} size={20} color={selectedCard.iconColor} />
            </View>
            <View style={styles.dropdownTextBlock}>
              <Text style={styles.dropdownTitle}>{selectedCard.bank}</Text>
              <Text style={styles.dropdownSub}>•••• •••• •••• {selectedCard.last4}</Text>
            </View>
            <MaterialCommunityIcons
              name={showCardDrop ? 'chevron-up' : 'chevron-down'}
              size={20}
              color={Colors.textSecondary}
            />
          </TouchableOpacity>
          {showCardDrop && (
            <View style={styles.dropdownList}>
              {CREDIT_CARDS.map((c) => (
                <TouchableOpacity
                  key={c.id}
                  style={[styles.dropdownListItem, selectedCard.id === c.id && styles.dropdownListItemActive]}
                  onPress={() => { setSelectedCard(c); setShowCardDrop(false); }}
                >
                  <View style={[styles.dropdownIconBox, { backgroundColor: c.iconBg }]}>
                    <MaterialCommunityIcons name={c.icon} size={18} color={c.iconColor} />
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.dropdownTitle}>{c.bank}</Text>
                    <Text style={styles.dropdownSub}>•••• •••• •••• {c.last4}</Text>
                  </View>
                  {selectedCard.id === c.id && (
                    <MaterialCommunityIcons name="check-circle" size={18} color={Colors.primary} />
                  )}
                </TouchableOpacity>
              ))}
            </View>
          )}

        

          {/* Bank Account Selector */}
          <Text style={styles.fieldLabel}>Select Bank Account</Text>
          <TouchableOpacity
            style={styles.dropdownBtn}
            onPress={() => { setShowBankDrop(!showBankDrop); setShowCardDrop(false); }}
            activeOpacity={0.8}
          >
            <View style={[styles.dropdownIconBox, { backgroundColor: selectedBank.iconBg }]}>
              <MaterialCommunityIcons name={selectedBank.icon} size={20} color={selectedBank.iconColor} />
            </View>
            <View style={styles.dropdownTextBlock}>
              <Text style={styles.dropdownTitle}>{selectedBank.name}</Text>
              <Text style={styles.dropdownSub}>A/c No. {selectedBank.accountNo}</Text>
            </View>
            <MaterialCommunityIcons
              name={showBankDrop ? 'chevron-up' : 'chevron-down'}
              size={20}
              color={Colors.textSecondary}
            />
          </TouchableOpacity>
          {showBankDrop && (
            <View style={styles.dropdownList}>
              {BANK_ACCOUNTS.map((b) => (
                <TouchableOpacity
                  key={b.id}
                  style={[styles.dropdownListItem, selectedBank.id === b.id && styles.dropdownListItemActive]}
                  onPress={() => { setSelectedBank(b); setShowBankDrop(false); }}
                >
                  <View style={[styles.dropdownIconBox, { backgroundColor: b.iconBg }]}>
                    <MaterialCommunityIcons name={b.icon} size={18} color={b.iconColor} />
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.dropdownTitle}>{b.name}</Text>
                    <Text style={styles.dropdownSub}>A/c No. {b.accountNo}</Text>
                  </View>
                  {selectedBank.id === b.id && (
                    <MaterialCommunityIcons name="check-circle" size={18} color={Colors.primary} />
                  )}
                </TouchableOpacity>
              ))}
            </View>
          )}
  {/* Amount Input */}
          <Text style={styles.fieldLabel}>Enter Amount</Text>
          <View style={styles.amountInputWrapper}>
            <Text style={styles.amountPrefix}>₹</Text>
            <TextInput
              style={styles.amountInput}
              value={amount}
              onChangeText={(t) => setAmount(t.replace(/[^0-9]/g, ''))}
              keyboardType="number-pad"
              placeholder="10,000"
              placeholderTextColor={Colors.textMuted}
              maxLength={7}
            />
          </View>
          <View style={styles.amountLimitRow}>
            <Text style={styles.amountLimitText}>Min. ₹1,000</Text>
            <Text style={styles.amountLimitText}>Available Limit: ₹1,25,000</Text>
          </View>
          {/* Calculation Strip */}
          <View style={styles.calcStrip}>
            <View style={styles.calcItem}>
              <Text style={styles.calcSubLabel}>You Get</Text>
              <Text style={[styles.calcValue, { color: Colors.primary }]}>₹{youGet.toLocaleString('en-IN')}</Text>
            </View>
            <View style={styles.calcDivider} />
            <View style={styles.calcItem}>
              <Text style={styles.calcSubLabel}>Processing Fee (1.80%)</Text>
              <Text style={styles.calcValue}>₹{processingFee}</Text>
            </View>
            <View style={styles.calcDivider} />
            <View style={styles.calcItem}>
              <Text style={styles.calcSubLabel}>GST (18%)</Text>
              <Text style={styles.calcValue}>₹{gst}</Text>
            </View>
          </View>

          {/* Proceed Button */}
          <TouchableOpacity
            style={[styles.proceedBtn, (!amount || numericAmount < 1000) && styles.proceedBtnDisabled]}
            onPress={handleProceed}
            activeOpacity={0.88}
            disabled={!amount || numericAmount < 1000}
          >
            <Text style={styles.proceedBtnText}>Proceed to Transfer</Text>
            <MaterialCommunityIcons name="arrow-right" size={20} color={Colors.white} />
          </TouchableOpacity>

          <View style={styles.secureNote}>
            <MaterialCommunityIcons name="shield-check-outline" size={16} color={Colors.textSecondary} />
            <Text style={styles.secureNoteText}>Your transactions are 100% secure and encrypted</Text>
          </View>
        </View>

        {/* ── WHY CARD TO CASH ── */}
        <View style={styles.whySection}>
          <Text style={styles.sectionTitle}>Why Card to Cash?</Text>
          <View style={styles.whyGrid}>
            {WHY_FEATURES.map((f) => (
              <View key={f.icon} style={styles.whyItem}>
                <View style={styles.whyIconBox}>
                  <MaterialCommunityIcons name={f.icon} size={22} color={Colors.primary} />
                </View>
                <Text style={styles.whyLabel}>{f.label}</Text>
              </View>
            ))}
          </View>
        </View>

        {/* ── RECENT TRANSACTIONS ── */}
        <View style={styles.recentSection}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Recent Transactions</Text>
            <TouchableOpacity style={styles.viewAllBtn}>
              <Text style={styles.viewAllText}>View All</Text>
              <MaterialCommunityIcons name="chevron-right" size={16} color={Colors.primary} />
            </TouchableOpacity>
          </View>

          {RECENT_TRANSACTIONS.map((txn) => (
            <TouchableOpacity key={txn.id} style={styles.txnRow} activeOpacity={0.75}>
              <View style={[styles.txnIconBox, { backgroundColor: txn.iconBg }]}>
                <MaterialCommunityIcons name="credit-card" size={22} color={txn.iconColor} />
              </View>
              <View style={styles.txnInfo}>
                <Text style={styles.txnTitle}>{txn.card}</Text>
                <Text style={styles.txnDate}>{txn.date}</Text>
              </View>
              <View style={styles.txnRight}>
                <Text style={styles.txnAmount}>{txn.amount}</Text>
                <Text style={[styles.txnStatus, { color: Colors.success }]}>{txn.status}</Text>
              </View>
              <MaterialCommunityIcons name="chevron-right" size={18} color={Colors.textMuted} style={{ marginLeft: 4 }} />
            </TouchableOpacity>
          ))}
        </View>

        {/* ── SECURE FOOTER ── */}
        <View style={styles.secureFooter}>
          <View style={styles.secureFooterIconBox}>
            <MaterialCommunityIcons name="shield-lock" size={28} color={Colors.primary} />
          </View>
          <View style={{ flex: 1, marginLeft: Spacing.md }}>
            <Text style={styles.secureFooterTitle}>Safe &amp; Secure</Text>
            <Text style={styles.secureFooterSub}>We ensure the highest security standards{'\n'}to protect your data and money</Text>
          </View>
          <View style={styles.pciBox}>
            <MaterialCommunityIcons name="lock" size={16} color={Colors.textSecondary} />
            <Text style={styles.pciText}>PCI DSS{'\n'}COMPLIANT</Text>
          </View>
        </View>

      </ScrollView>
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
  },

  // ── HERO ──
  heroBanner: {
    flexDirection: 'row',
    backgroundColor: Colors.bgSecondaryBtn,
    marginHorizontal: Spacing.lg,
    marginTop: Spacing.md,
    borderRadius: Radius.md,
    padding: Spacing.lg,
    borderWidth: 1,
    borderColor: Colors.decorLine,
    overflow: 'hidden',
elevation: 2,
    shadowColor: Colors.primaryDark,
    shadowOffset: { width: 0, height: 3},
    shadowOpacity: 0.08,
    shadowRadius: 5,
    },
  heroLeft: { flex: 1, paddingRight: Spacing.sm },
  heroRight: { width: 130, alignItems: 'center', justifyContent: 'center' },
  heroTitle: {
    fontSize: FontSize.xl,
    fontFamily: Poppins.bold,
    color: Colors.primaryDark,
    lineHeight: 26,
    marginBottom: Spacing.xs,
  },
  heroSubtitle: {
    fontSize: FontSize.sm,
    fontFamily: Poppins.regular,
    color: Colors.textBody,
    lineHeight: 18,
    marginBottom: Spacing.md,
  },
  heroFeatureRow: {
    flexDirection: 'row',
    gap: Spacing.md,
    marginBottom: Spacing.md,
  },
  heroFeatureItem: { alignItems: 'center', gap: 4 },
  heroFeatureIconBox: {
    width: 36,
    height: 36,
    borderRadius: Radius.md,
    backgroundColor: Colors.white,
    borderWidth: 1,
    borderColor: Colors.decorLine,
    justifyContent: 'center',
    alignItems: 'center',
  },
  heroFeatureLabel: {
    fontSize: 12,
    fontFamily: Poppins.semiBold,
    color: Colors.textBody,
    textAlign: 'center',
  },
  heroPriceBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.white,
    borderRadius: Radius.md,
    paddingHorizontal: Spacing.sm,
    paddingVertical: 6,
    gap: 6,
    borderWidth: 1,
    borderColor: Colors.decorLine,
    alignSelf: 'flex-start',
  },
  heroPriceText: {
    fontSize: 12,
    fontFamily: Poppins.semiBold,
    color: Colors.primary,
    lineHeight: 13,
  },

  // Hero illustration
  heroCardIllustration: {
    alignItems: 'center',
    position: 'relative',
  },
  heroCardGraphic: {
    width: 110,
    height: 70,
    borderRadius: Radius.md,
    padding: 10,
    justifyContent: 'space-between',
  },
  heroCardNum: {
    color: Colors.white,
    fontSize: 12,
    fontFamily: Poppins.semiBold,
    letterSpacing: 0.5,
    lineHeight: 13,
  },
  heroCardHolder: {
    color: 'rgba(255,255,255,0.6)',
    fontSize: 12,
    fontFamily: Poppins.semiBold,
    letterSpacing: 0.5,
  },
  heroCoinBadge: {
    marginTop: Spacing.sm,
    alignItems: 'center',
  },

  // ── FORM CARD ──
  formCard: {
    backgroundColor: Colors.white,
    marginHorizontal: Spacing.lg,
    marginTop: Spacing.md,
    borderRadius: Radius.md,
    padding: Spacing.lg,
    borderWidth: 1,
    borderColor: Colors.decorLine,
    elevation: 2,
    shadowColor: Colors.primaryDark,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.08,
    shadowRadius: 5,
  },
  formTitle: {
    fontSize: FontSize.xl,
    fontFamily: Poppins.bold,
    color: Colors.textDark,
    marginBottom: Spacing.md,
  },
  fieldLabel: {
    fontSize: FontSize.sm,
    fontFamily: Poppins.semiBold,
    color: Colors.textSecondary,
    marginBottom: Spacing.sm,
    marginTop: Spacing.sm,
  },

  // Dropdown
  dropdownBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: Colors.inputBorder,
    borderRadius: Radius.md,
    
    padding:5,
    backgroundColor: Colors.bgLightest,
    gap: Spacing.sm,
  },
  dropdownIconBox: {
    width: 40,
    height: 40,
    borderRadius: Radius.md,
    justifyContent: 'center',
    alignItems: 'center',
  },
  dropdownTextBlock: { flex: 1 },
  dropdownTitle: {
    fontSize: FontSize.xs,
    fontFamily: Poppins.semiBold,
    color: Colors.textDark,
  },
  dropdownSub: {
    fontSize: FontSize.xs,
    fontFamily: Poppins.regular,
    color: Colors.textSecondary,
    marginTop: 1,
  },
  dropdownList: {
    borderWidth: 1,
    borderColor: Colors.decorLine,
    borderRadius: Radius.md,
    marginTop: 4,
    backgroundColor: Colors.white,
    overflow: 'hidden',
    elevation: 2,
    shadowColor: Colors.primaryDark,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 5,
  },
  dropdownListItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: Spacing.md,
    gap: Spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: Colors.decorLine,
  },
  dropdownListItemActive: {
    backgroundColor: Colors.bgInput,
  },

  // Amount
  amountInputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: Colors.inputBorder,
    borderRadius: Radius.md,
    paddingHorizontal: Spacing.md,
    paddingVertical: 6,
    backgroundColor: Colors.bgLightest,
  },
  amountPrefix: {
    fontSize: FontSize.xl,
    fontFamily: Poppins.bold,
    color: Colors.textDark,
    marginRight: Spacing.xs,
  },
  amountInput: {
    flex: 1,
    fontSize: 20,
    fontFamily: Poppins.medium,
    color: Colors.textDark,
    padding: 0,
    includeFontPadding: false,
  },
  amountLimitRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 4,
    marginBottom: Spacing.xs,
  },
  amountLimitText: {
    fontSize: FontSize.xs,
    fontFamily: Poppins.regular,
    color: Colors.textMuted,
  },

  // Calc Strip
  calcStrip: {
    flexDirection: 'row',
    borderWidth: 1,
    borderColor: Colors.decorLine,
    borderRadius: Radius.md,
    marginTop: Spacing.md,
    overflow: 'hidden',
    backgroundColor: Colors.bgLightest,
  },
  calcItem: {
    flex: 1,
    padding: Spacing.md,
    alignItems: 'center',
  },
  calcDivider: {
    width: 1,
    backgroundColor: Colors.decorLine,
  },
  calcSubLabel: {
    fontSize: 12,
    fontFamily: Poppins.semiBold,
    color: Colors.textSecondary,
    textAlign: 'center',
    marginBottom: 4,
  },
  calcValue: {
    fontSize: FontSize.lg,
    fontFamily: Poppins.bold,
    color: Colors.textDark,
  },

  // Button
  proceedBtn: {
    flexDirection: 'row',
    backgroundColor: Colors.primaryDark,
    borderRadius: Radius.md,
    height: 54,
    justifyContent: 'center',
    alignItems: 'center',
    gap: Spacing.sm,
    marginTop: Spacing.md,
    elevation: 2,
    shadowColor: Colors.primaryDark,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 5,
  },
  proceedBtnDisabled: {
    backgroundColor: Colors.textMuted,
    elevation: 2,
  },
  proceedBtnText: {
    color: Colors.white,
    fontSize: FontSize.lg,
    fontFamily: Poppins.bold,
  },
  secureNote: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: Spacing.md,
    gap: 6,
  },
  secureNoteText: {
    fontSize: FontSize.xs,
    fontFamily: Poppins.medium,
    color: Colors.textSecondary,
  },

  // ── WHY ──
  whySection: {
    marginHorizontal: Spacing.lg,
    marginTop: Spacing.lg,
  },
  sectionTitle: {
    fontSize: FontSize.lg,
    fontFamily: Poppins.bold,
    color: Colors.textDark,
    marginBottom: Spacing.md,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.md,
  },
  viewAllBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
  },
  viewAllText: {
    fontSize: FontSize.sm,
    fontFamily: Poppins.semiBold,
    color: Colors.primary,
  },
  whyGrid: {
    flexDirection: 'row',
    backgroundColor: Colors.white,
    borderRadius: Radius.md,
    padding: Spacing.md,
    borderWidth: 1,
    borderColor: Colors.decorLine,
    elevation: 2,
    shadowColor: Colors.primaryDark,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 5,
  },
  whyItem: {
    flex: 1,
    alignItems: 'center',
    gap: 6,
    borderRadius:20,
  },
  whyIconBox: {
    width: 46,
    height: 46,
    borderRadius: Radius.md,
    backgroundColor: Colors.bgSecondaryBtn,
    borderWidth: 1,
    borderColor: Colors.decorLine,
    justifyContent: 'center',
    alignItems: 'center',
  },
  whyLabel: {
    fontSize: 12,
    fontFamily: Poppins.semiBold,
    color: Colors.textBody,
    textAlign: 'center',
  },

  // ── RECENT TXN ──
  recentSection: {
    marginHorizontal: Spacing.lg,
    marginTop: Spacing.lg,
  },
  txnRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.white,
    borderRadius: Radius.md,
    padding: Spacing.md,
    marginBottom: Spacing.sm,
    borderWidth: 1,
    borderColor: Colors.decorLine,
    elevation: 2,
    shadowColor: Colors.primaryDark,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 5,
  },
  txnIconBox: {
    width: 44,
    height: 44,
    borderRadius: Radius.md,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: Spacing.md,
  },
  txnInfo: { flex: 1 },
  txnTitle: {
    fontSize: FontSize.md,
    fontFamily: Poppins.semiBold,
    color: Colors.textDark,
  },
  txnDate: {
    fontSize: FontSize.xs,
    fontFamily: Poppins.regular,
    color: Colors.textSecondary,
    marginTop: 2,
  },
  txnRight: { alignItems: 'flex-end' },
  txnAmount: {
    fontSize: FontSize.md,
    fontFamily: Poppins.bold,
    color: Colors.textDark,
  },
  txnStatus: {
    fontSize: FontSize.xs,
    fontFamily: Poppins.semiBold,
    marginTop: 2,
  },

  // ── FOOTER ──
  secureFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.bgSecondaryBtn,
    marginHorizontal: Spacing.lg,
    marginTop: Spacing.lg,
    borderRadius: Radius.md,
    padding: Spacing.md,
    borderWidth: 1,
    borderColor: Colors.decorLine,
  },
  secureFooterIconBox: {
    width: 48,
    height: 48,
    borderRadius: Radius.md,
    backgroundColor: Colors.primaryLight,
    justifyContent: 'center',
    alignItems: 'center',
  },
  secureFooterTitle: {
    fontSize: FontSize.md,
    fontFamily: Poppins.bold,
    color: Colors.primary,
  },
  secureFooterSub: {
    fontSize: FontSize.xs,
    fontFamily: Poppins.regular,
    color: Colors.textSecondary,
    marginTop: 2,
    lineHeight: 16,
  },
  pciBox: {
    alignItems: 'center',
    gap: 2,
    padding: Spacing.sm,
    borderRadius: Radius.md,
    backgroundColor: Colors.bgInput,
  },
  pciText: {
    fontSize: 12,
    fontFamily: Poppins.bold,
    color: Colors.textSecondary,
    textAlign: 'center',
    lineHeight: 11,
  },
});

export default CardToCashConfirmScreen;
