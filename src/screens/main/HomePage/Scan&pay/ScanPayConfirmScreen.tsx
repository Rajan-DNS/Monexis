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
import LinearGradient from 'react-native-linear-gradient';
import { useNavigation } from '@react-navigation/native';
import AppHeader from '../../../../components/Header/AppHeader';
import { Colors } from '../../../../theme';
import { Poppins } from '../../../../theme/typography';
import { FontSize, Radius, Spacing } from '../../../../theme/spacing';

// ── Mock saved QR payees ──
const SAVED_QR = [
  { id: '1', name: 'Starbucks', upiId: '****2234', color: '#00704A', initials: 'S' },
  { id: '2', name: 'More Store', upiId: '****5678', color: '#E8690B', initials: 'M' },
  { id: '3', name: 'Zomato', upiId: '****9101', color: '#E23744', initials: 'Z' },
  { id: '4', name: 'Jio', upiId: '****1121', color: '#0A3B8E', initials: 'J' },
  { id: '5', name: 'PhonePe', upiId: '****3344', color: '#5F259F', initials: 'P' },
];

const RECENT_TRANSACTIONS = [
  { id: '1', name: 'Starbucks Coffee', date: '02 May 2024, 11:30 AM', amount: '₹450.00', status: 'Success', color: '#00704A', initials: 'S' },
  { id: '2', name: 'More Store', date: '01 May 2024, 04:20 PM', amount: '₹750.00', status: 'Success', color: '#E8690B', initials: 'M' },
  { id: '3', name: 'Zomato', date: '30 Apr 2024, 09:15 PM', amount: '₹320.00', status: 'Success', color: '#E23744', initials: 'Z' },
  { id: '4', name: 'Jio Recharge', date: '29 Apr 2024, 12:10 PM', amount: '₹199.00', status: 'Success', color: '#0A3B8E', initials: 'J' },
];

const HERO_FEATURES = [
  { icon: 'shield-check-outline', label: '100%\nSecure' },
  { icon: 'lightning-bolt', label: 'Instant\nPayment' },
  { icon: 'check-circle-outline', label: 'UPI\nEnabled' },
];

const ScanPayConfirmScreen: React.FC = () => {
  const navigation = useNavigation<any>();

  const handleScanQR = () => {
    navigation.navigate('QRScannerScreen');
  };

  const handleSavedQR = (qr: typeof SAVED_QR[0]) => {
    navigation.navigate('ScanPayPayScreen', {
      payee: {
        name: qr.name,
        upiId: qr.upiId,
        category: 'Saved Payee',
        verified: true,
      },
      amount: '',
      note: '',
    });
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <AppHeader
        title="Scan & Pay"
        showBack={true}
        onBackPress={() => navigation.goBack()}
      />

      <ScrollView style={styles.container} showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 32 }}>

        {/* ── HERO BANNER ── */}
        <View style={styles.heroBanner}>
          <View style={styles.heroLeft}>
            <Text style={styles.heroTitle}>Scan any QR code</Text>
            <Text style={styles.heroSubtitle}>Pay instantly to any UPI QR</Text>

            <View style={styles.heroFeatureRow}>
              {HERO_FEATURES.map((f) => (
                <View key={f.icon} style={styles.heroFeatureItem}>
                  <MaterialCommunityIcons name={f.icon} size={20} color={Colors.primary} />
                  <Text style={styles.heroFeatureLabel}>{f.label}</Text>
                </View>
              ))}
            </View>
          </View>

          {/* Phone QR Illustration */}
          <View style={styles.heroRight}>
            <View style={styles.phoneFrame}>
              <View style={styles.phoneScreen}>
                <MaterialCommunityIcons name="qrcode-scan" size={40} color={Colors.primaryDark} />
              </View>
              <View style={styles.upiLabel}>
                <Text style={styles.upiLabelText}>UPI</Text>
              </View>
            </View>
          </View>
        </View>

        {/* ── SCAN BUTTON ── */}
        <TouchableOpacity
          style={styles.scanBtn}
          onPress={handleScanQR}
          activeOpacity={0.85}
        >
          <LinearGradient
            colors={[Colors.primaryDark, Colors.primary]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={styles.scanBtnGradient}
          >
            <MaterialCommunityIcons name="line-scan" size={26} color={Colors.white} />
            <View style={{ marginLeft: Spacing.md }}>
              <Text style={styles.scanBtnText}>Scan QR Code</Text>
              <Text style={styles.scanBtnSub}>Tap to open scanner</Text>
            </View>
          </LinearGradient>
        </TouchableOpacity>

        {/* ── SAVED QR CODES ── */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Saved QR Codes</Text>
          <TouchableOpacity style={styles.viewAllBtn}>
            <Text style={styles.viewAllText}>View All</Text>
            <MaterialCommunityIcons name="chevron-right" size={16} color={Colors.primary} />
          </TouchableOpacity>
        </View>

        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.savedQRScroll}
        >
          {SAVED_QR.map((qr) => (
            <TouchableOpacity
              key={qr.id}
              style={styles.savedQRItem}
              onPress={() => handleSavedQR(qr)}
              activeOpacity={0.8}
            >
              <View style={[styles.savedQRAvatar, { backgroundColor: qr.color }]}>
                <Text style={styles.savedQRAvatarText}>{qr.initials}</Text>
              </View>
              <Text style={styles.savedQRName} numberOfLines={1}>{qr.name}</Text>
              <Text style={styles.savedQRUPI}>{qr.upiId}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        {/* ── RECENT TRANSACTIONS ── */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Recent Transactions</Text>
          <TouchableOpacity style={styles.viewAllBtn}>
            <Text style={styles.viewAllText}>View All</Text>
            <MaterialCommunityIcons name="chevron-right" size={16} color={Colors.primary} />
          </TouchableOpacity>
        </View>

        <View style={styles.txnCard}>
          {RECENT_TRANSACTIONS.map((txn, idx) => (
            <View key={txn.id}>
              <TouchableOpacity style={styles.txnRow} activeOpacity={0.75}>
                <View style={[styles.txnAvatar, { backgroundColor: txn.color }]}>
                  <Text style={styles.txnAvatarText}>{txn.initials}</Text>
                </View>
                <View style={styles.txnInfo}>
                  <Text style={styles.txnTitle}>{txn.name}</Text>
                  <Text style={styles.txnDate}>{txn.date}</Text>
                </View>
                <View style={styles.txnRight}>
                  <Text style={styles.txnAmount}>{txn.amount}</Text>
                  <Text style={[styles.txnStatus, { color: Colors.success }]}>{txn.status}</Text>
                </View>
                <MaterialCommunityIcons name="chevron-right" size={18} color={Colors.textMuted} style={{ marginLeft: 4 }} />
              </TouchableOpacity>
              {idx < RECENT_TRANSACTIONS.length - 1 && <View style={styles.txnDivider} />}
            </View>
          ))}
        </View>

        {/* ── SECURE FOOTER ── */}
        <View style={styles.secureFooter}>
          <View style={styles.secureFooterLeft}>
            <View style={styles.secureIconBox}>
              <MaterialCommunityIcons name="shield-check" size={26} color={Colors.primary} />
            </View>
            <View style={{ flex: 1, marginLeft: Spacing.md }}>
              <Text style={styles.secureFooterTitle}>Safe &amp; Secure Payments</Text>
              <Text style={styles.secureFooterSub}>Your payments are protected with{'\n'}bank-level security</Text>
            </View>
          </View>
          <View style={styles.upiLogoBox}>
            <Text style={styles.upiLogoText}>UPI</Text>
            <Text style={styles.upiLogoSubtext}>UNITED PAYMENTS INTERFACE</Text>
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
    minHeight: 160,
  },
  heroLeft: { flex: 1, paddingRight: Spacing.sm },
  heroRight: {
    width: 110,
    justifyContent: 'center',
    alignItems: 'center',
  },
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
    marginBottom: Spacing.md,
  },
  heroFeatureRow: {
    flexDirection: 'row',
    gap: Spacing.md,
  },
  heroFeatureItem: {
    alignItems: 'center',
    gap: 4,
  },
  heroFeatureLabel: {
    fontSize: 12,
    fontFamily: Poppins.semiBold,
    color: Colors.textBody,
    textAlign: 'center',
    lineHeight: 12,
  },

  // Phone illustration
  phoneFrame: {
    width: 80,
    height: 110,
    borderRadius: 16,
    backgroundColor: Colors.white,
    borderWidth: 3,
    borderColor: Colors.decorLine,
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
    elevation: 4,
    shadowColor: Colors.primaryDark,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    position: 'relative',
  },
  phoneScreen: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f0f4ff',
    width: '100%',
  },
  upiLabel: {
    backgroundColor: Colors.primaryDark,
    width: '100%',
    paddingVertical: 4,
    alignItems: 'center',
  },
  upiLabelText: {
    color: Colors.white,
    fontSize: 12,
    fontFamily: Poppins.bold,
    letterSpacing: 1,
  },

  // ── SCAN BUTTON ──
  scanBtn: {
    marginHorizontal: Spacing.lg,
    marginTop: Spacing.md,
    borderRadius: Radius.md,
    overflow: 'hidden',
    elevation: 6,
    shadowColor: Colors.primaryDark,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
  },
  scanBtnGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: Spacing.lg,
    paddingHorizontal: Spacing.xl,
  },
  scanBtnText: {
    color: Colors.white,
    fontSize: FontSize.xl,
    fontFamily: Poppins.bold,
  },
  scanBtnSub: {
    color: 'rgba(255,255,255,0.75)',
    fontSize: FontSize.sm,
    fontFamily: Poppins.regular,
    marginTop: 2,
  },

  // ── SECTION HEADER ──
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginHorizontal: Spacing.lg,
    marginTop: Spacing.xl,
    marginBottom: Spacing.md,
  },
  sectionTitle: {
    fontSize: FontSize.lg,
    fontFamily: Poppins.bold,
    color: Colors.textDark,
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

  // ── SAVED QR ──
  savedQRScroll: {
    paddingHorizontal: Spacing.lg,
    gap: Spacing.md,
  },
  savedQRItem: {
    alignItems: 'center',
    width: 70,
  },
  savedQRAvatar: {
    width: 60,
    height: 60,
    borderRadius: Radius.full,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 6,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
  },
  savedQRAvatarText: {
    color: Colors.white,
    fontSize: FontSize.xl,
    fontFamily: Poppins.bold,
  },
  savedQRName: {
    fontSize: FontSize.xs,
    fontFamily: Poppins.semiBold,
    color: Colors.textDark,
    textAlign: 'center',
  },
  savedQRUPI: {
    fontSize: 12,
    fontFamily: Poppins.regular,
    color: Colors.textSecondary,
    textAlign: 'center',
    marginTop: 1,
  },

  // ── RECENT TXN ──
  txnCard: {
    backgroundColor: Colors.white,
    marginHorizontal: Spacing.lg,
    borderRadius: Radius.md,
    borderWidth: 1,
    borderColor: Colors.decorLine,
    overflow: 'hidden',
    elevation: 2,
    shadowColor: Colors.primaryDark,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 6,
  },
  txnRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.md,
  },
  txnDivider: {
    height: 1,
    backgroundColor: Colors.decorLine,
    marginHorizontal: Spacing.md,
  },
  txnAvatar: {
    width: 44,
    height: 44,
    borderRadius: Radius.full,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: Spacing.md,
  },
  txnAvatarText: {
    color: Colors.white,
    fontSize: FontSize.lg,
    fontFamily: Poppins.bold,
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
    justifyContent: 'space-between',
  },
  secureFooterLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  secureIconBox: {
    width: 46,
    height: 46,
    borderRadius: Radius.full,
    backgroundColor: Colors.primaryLight,
    justifyContent: 'center',
    alignItems: 'center',
  },
  secureFooterTitle: {
    fontSize: FontSize.sm,
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
  upiLogoBox: {
    alignItems: 'center',
    paddingLeft: Spacing.md,
  },
  upiLogoText: {
    fontSize: FontSize.xl,
    fontFamily: Poppins.bold,
    color: Colors.primaryDark,
    letterSpacing: 2,
  },
  upiLogoSubtext: {
    fontSize: 12.5,
    fontFamily: Poppins.bold,
    color: Colors.textSecondary,
    letterSpacing: 0.3,
    textAlign: 'center',
  },
});

export default ScanPayConfirmScreen;
