import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  TextInput,
  StatusBar,
  SafeAreaView,
  LayoutAnimation,
} from 'react-native';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import DateTimePicker from '@react-native-community/datetimepicker';
import Colors from '../../../theme/colors';
import AppHeader from '../../../components/Header/AppHeader';
import { Poppins } from '../../../theme/typography';
import { FontSize, Radius, Spacing } from '../../../theme/spacing';

// ─── Dummy Data ───────────────────────────────────────────────────────────────
const DUMMY_DATA = [
  {
    id: '1',
    txnId: 'CB-20260601-001',
    description: 'Referral Bonus — Amit Sharma joined',
    cashbackType: 'Referral',
    amount: '₹30.00',
    walletBalance: '₹830.00',
    date: '01 Jun 2026, 11:05 AM',
    status: 'Credited',
  },
  {
    id: '2',
    txnId: 'CB-20260530-002',
    description: 'Recharge Cashback — Jio ₹299',
    cashbackType: 'Recharge',
    amount: '₹15.00',
    walletBalance: '₹800.00',
    date: '30 May 2026, 04:00 PM',
    status: 'Credited',
  },
  {
    id: '3',
    txnId: 'CB-20260528-003',
    description: 'Referral Bonus — Priya Singh joined',
    cashbackType: 'Referral',
    amount: '₹20.00',
    walletBalance: '₹785.00',
    date: '28 May 2026, 09:45 AM',
    status: 'Credited',
  },
  {
    id: '4',
    txnId: 'CB-20260525-004',
    description: 'Promotional Offer — First UPI Pay',
    cashbackType: 'Promo',
    amount: '₹50.00',
    walletBalance: '₹765.00',
    date: '25 May 2026, 06:30 PM',
    status: 'Credited',
  },
  {
    id: '5',
    txnId: 'CB-20260522-005',
    description: 'Recharge Cashback — Airtel ₹199',
    cashbackType: 'Recharge',
    amount: '₹10.00',
    walletBalance: '₹715.00',
    date: '22 May 2026, 01:30 PM',
    status: 'Pending',
  },
  {
    id: '6',
    txnId: 'CB-20260520-006',
    description: 'Referral Bonus — Sunita Patel joined',
    cashbackType: 'Referral',
    amount: '₹60.00',
    walletBalance: '₹705.00',
    date: '20 May 2026, 10:10 AM',
    status: 'Credited',
  },
  {
    id: '7',
    txnId: 'CB-20260518-007',
    description: 'Festival Bonus — DNS Dhamaka Offer',
    cashbackType: 'Promo',
    amount: '₹100.00',
    walletBalance: '₹645.00',
    date: '18 May 2026, 08:00 AM',
    status: 'Credited',
  },
];

const SUMMARY = {
  totalCashback: '₹285.00',
  credited: 6,
  pending: 1,
  thisMonth: '₹125.00',
};

// ─── Cashback type config ─────────────────────────────────────────────────────
const TYPE_CONFIG: Record<string, { bg: string; color: string; icon: string }> = {
  Referral: { bg: '#EDE9FE', color: '#7C3AED', icon: 'account-heart-outline' },
  Recharge: { bg: '#DBEAFE', color: '#2563EB', icon: 'cellphone-wireless' },
  Promo:    { bg: '#FEF3C7', color: '#D97706', icon: 'tag-heart-outline' },
};

const STATUS_CONFIG: Record<string, { bg: string; text: string }> = {
  Credited: { bg: '#D1FAE5', text: '#10B981' },
  Pending:  { bg: '#FEF3C7', text: '#F59E0B' },
};

// ─── Component ────────────────────────────────────────────────────────────────
const CashBackReportScreen = ({ navigation }: any) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [showFilter, setShowFilter] = useState(false);
  const [fromDate, setFromDate] = useState('');
  const [toDate, setToDate] = useState('');
  const [showFromPicker, setShowFromPicker] = useState(false);
  const [showToPicker, setShowToPicker] = useState(false);
  const [typeFilter, setTypeFilter] = useState<'All' | 'Referral' | 'Recharge' | 'Promo'>('All');
  const [statusFilter, setStatusFilter] = useState<'All' | 'Credited' | 'Pending'>('All');

  const formatDate = (d: Date) =>
    `${d.getDate().toString().padStart(2, '0')}/${(d.getMonth() + 1).toString().padStart(2, '0')}/${d.getFullYear()}`;

  const filteredData = DUMMY_DATA.filter((item) => {
    const q = searchQuery.toLowerCase();
    const matchesSearch =
      item.description.toLowerCase().includes(q) ||
      item.txnId.toLowerCase().includes(q);
    const matchesType   = typeFilter === 'All'   || item.cashbackType === typeFilter;
    const matchesStatus = statusFilter === 'All' || item.status === statusFilter;
    return matchesSearch && matchesType && matchesStatus;
  });

  const toggleFilter = () => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setShowFilter((p) => !p);
  };

  const activeFilterCount = [fromDate, toDate, typeFilter !== 'All' ? typeFilter : '', statusFilter !== 'All' ? statusFilter : ''].filter(Boolean).length;

  const clearFilter = () => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setFromDate('');
    setToDate('');
    setTypeFilter('All');
    setStatusFilter('All');
    setShowFilter(false);
  };

  // ─── Card ────────────────────────────────────────────────────────────────
  const renderCard = ({ item }: { item: (typeof DUMMY_DATA)[0] }) => {
    const typeCfg  = TYPE_CONFIG[item.cashbackType]  ?? { bg: '#F3F4F6', color: Colors.textMuted, icon: 'cash' };
    const statusCfg = STATUS_CONFIG[item.status] ?? { bg: '#F3F4F6', text: Colors.textMuted };

    return (
      <View style={styles.card}>
        {/* Header */}
        <View style={styles.cardHeader}>
          <View style={[styles.typeIconBg, { backgroundColor: typeCfg.bg }]}>
            <MaterialCommunityIcons name={typeCfg.icon as any} size={22} color={typeCfg.color} />
          </View>
          <View style={styles.cardHeaderInfo}>
            <Text style={styles.descText} numberOfLines={2}>{item.description}</Text>
            <Text style={styles.txnIdText}>{item.txnId}</Text>
          </View>
          <Text style={[styles.amountText, { color: Colors.success }]}>{item.amount}</Text>
        </View>

        <View style={styles.divider} />

        {/* Bottom row */}
        <View style={styles.cardFooter}>
          <View style={[styles.typePill, { backgroundColor: typeCfg.bg }]}>
            <Text style={[styles.typePillText, { color: typeCfg.color }]}>{item.cashbackType}</Text>
          </View>

          <Text style={styles.dateText}>{item.date}</Text>

          <View style={[styles.statusBadge, { backgroundColor: statusCfg.bg }]}>
            <Text style={[styles.statusText, { color: statusCfg.text }]}>{item.status}</Text>
          </View>
        </View>

        {/* Wallet balance row */}
        <View style={styles.balanceRow}>
          <MaterialCommunityIcons name="wallet-outline" size={13} color={Colors.textMuted} />
          <Text style={styles.balanceText}>Wallet Balance after: {item.walletBalance}</Text>
        </View>
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />
      <AppHeader title="Cashback Report" showBack onBackPress={() => navigation.goBack()} />

      {/* Summary Banner */}
      <View style={styles.summaryBanner}>
        {[
          { label: 'Total', value: SUMMARY.totalCashback, icon: 'cash-multiple' },
          { label: 'Credited', value: String(SUMMARY.credited), icon: 'check-circle-outline' },
          { label: 'Pending', value: String(SUMMARY.pending), icon: 'clock-outline' },
          { label: 'This Month', value: SUMMARY.thisMonth, icon: 'calendar-month-outline' },
        ].map((s, i) => (
          <View key={i} style={styles.summaryItem}>
            <MaterialCommunityIcons name={s.icon as any} size={18} color={Colors.white} />
            <Text style={styles.summaryValue}>{s.value}</Text>
            <Text style={styles.summaryLabel}>{s.label}</Text>
          </View>
        ))}
      </View>

      {/* Search + Filter */}
      <View style={styles.searchContainer}>
        <View style={styles.searchRow}>
          <View style={styles.searchBar}>
            <MaterialIcons name="search" size={20} color={Colors.textSecondary} />
            <TextInput
              placeholder="Search by description or ID..."
              style={styles.searchInput}
              value={searchQuery}
              onChangeText={setSearchQuery}
              placeholderTextColor={Colors.textMuted}
            />
            {searchQuery.length > 0 && (
              <TouchableOpacity onPress={() => setSearchQuery('')}>
                <MaterialIcons name="close" size={18} color={Colors.textMuted} />
              </TouchableOpacity>
            )}
          </View>
          <TouchableOpacity
            style={[styles.filterBtn, showFilter && styles.filterBtnActive]}
            onPress={toggleFilter}
            activeOpacity={0.8}
          >
            <MaterialCommunityIcons name="filter-variant" size={22} color={showFilter ? Colors.white : Colors.primary} />
            {activeFilterCount > 0 && (
              <View style={styles.filterBadge}>
                <Text style={styles.filterBadgeText}>{activeFilterCount}</Text>
              </View>
            )}
          </TouchableOpacity>
        </View>
      </View>

      {/* Filter Panel */}
      {showFilter && (
        <View style={styles.filterPanel}>
          <Text style={styles.filterTitle}>Filter Options</Text>

          {/* Type chips */}
          <Text style={styles.filterLabel}>Cashback Type</Text>
          <View style={styles.chipRow}>
            {(['All', 'Referral', 'Recharge', 'Promo'] as const).map((t) => (
              <TouchableOpacity
                key={t}
                style={[styles.chip, typeFilter === t && styles.chipActive]}
                onPress={() => setTypeFilter(t)}
              >
                <Text style={[styles.chipText, typeFilter === t && styles.chipTextActive]}>{t}</Text>
              </TouchableOpacity>
            ))}
          </View>

          {/* Status chips */}
          <Text style={styles.filterLabel}>Status</Text>
          <View style={styles.chipRow}>
            {(['All', 'Credited', 'Pending'] as const).map((s) => (
              <TouchableOpacity
                key={s}
                style={[styles.chip, statusFilter === s && styles.chipActive]}
                onPress={() => setStatusFilter(s)}
              >
                <Text style={[styles.chipText, statusFilter === s && styles.chipTextActive]}>{s}</Text>
              </TouchableOpacity>
            ))}
          </View>

          {/* Date range */}
          <View style={styles.dateRow}>
            <View style={styles.dateGroup}>
              <Text style={styles.filterLabel}>From Date</Text>
              <TouchableOpacity style={styles.dateInput} onPress={() => setShowFromPicker(true)}>
                <MaterialCommunityIcons name="calendar-range" size={16} color={Colors.textSecondary} />
                <Text style={[styles.dateInputText, !fromDate && { color: Colors.textMuted }]}>
                  {fromDate || 'DD/MM/YYYY'}
                </Text>
              </TouchableOpacity>
              {showFromPicker && (
                <DateTimePicker value={new Date()} mode="date" display="default"
                  onChange={(_, d) => { setShowFromPicker(false); if (d) setFromDate(formatDate(d)); }}
                  maximumDate={new Date()} />
              )}
            </View>
            <View style={styles.dateGroup}>
              <Text style={styles.filterLabel}>To Date</Text>
              <TouchableOpacity style={styles.dateInput} onPress={() => setShowToPicker(true)}>
                <MaterialCommunityIcons name="calendar-range" size={16} color={Colors.textSecondary} />
                <Text style={[styles.dateInputText, !toDate && { color: Colors.textMuted }]}>
                  {toDate || 'DD/MM/YYYY'}
                </Text>
              </TouchableOpacity>
              {showToPicker && (
                <DateTimePicker value={new Date()} mode="date" display="default"
                  onChange={(_, d) => { setShowToPicker(false); if (d) setToDate(formatDate(d)); }}
                  maximumDate={new Date()} />
              )}
            </View>
          </View>

          <View style={styles.filterActions}>
            <TouchableOpacity style={styles.clearBtn} onPress={clearFilter}>
              <Text style={styles.clearBtnText}>Clear All</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.applyBtn} onPress={toggleFilter}>
              <Text style={styles.applyBtnText}>Apply</Text>
            </TouchableOpacity>
          </View>
        </View>
      )}

      {/* List */}
      <FlatList
        data={filteredData}
        renderItem={renderCard}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContent}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <MaterialCommunityIcons name="cash-off" size={64} color="#E0E0E0" />
            <Text style={styles.emptyText}>No cashback records found</Text>
          </View>
        }
      />
    </SafeAreaView>
  );
};

// ─── Styles ───────────────────────────────────────────────────────────────────
const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F8F9FA' },

  summaryBanner: {
    flexDirection: 'row', backgroundColor: Colors.primaryDark,
    paddingVertical: Spacing.md, paddingHorizontal: Spacing.sm, justifyContent: 'space-around',
  },
  summaryItem: { alignItems: 'center', gap: 2 },
  summaryValue: { color: Colors.white, fontSize: FontSize.md, fontFamily: Poppins.bold },
  summaryLabel: { color: 'rgba(255,255,255,0.7)', fontSize: FontSize.xs, fontFamily: Poppins.regular },

  searchContainer: {
    paddingHorizontal: Spacing.lg, paddingVertical: Spacing.md,
    backgroundColor: Colors.white, borderBottomWidth: 1, borderBottomColor: '#F0F0F0',
  },
  searchRow: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  searchBar: {
    flex: 1, flexDirection: 'row', alignItems: 'center',
    backgroundColor: '#F1F5F9', borderRadius: Radius.md, paddingHorizontal: 12, height: 45, gap: 8,
  },
  searchInput: { flex: 1, fontSize: FontSize.md, fontFamily: Poppins.regular, color: Colors.textDark, padding: 0 },
  filterBtn: {
    width: 45, height: 45, borderRadius: Radius.md, backgroundColor: '#F1F5F9',
    justifyContent: 'center', alignItems: 'center', borderWidth: 1, borderColor: '#E2E8F0', position: 'relative',
  },
  filterBtnActive: { backgroundColor: Colors.primary, borderColor: Colors.primary },
  filterBadge: {
    position: 'absolute', top: -5, right: -5, backgroundColor: Colors.error,
    width: 18, height: 18, borderRadius: 9, justifyContent: 'center', alignItems: 'center',
    borderWidth: 2, borderColor: Colors.white,
  },
  filterBadgeText: { color: Colors.white, fontSize: 12, fontFamily: Poppins.bold },

  filterPanel: {
    backgroundColor: Colors.white, paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md, borderBottomWidth: 1, borderBottomColor: '#F0F0F0',
  },
  filterTitle: { fontSize: FontSize.md, fontFamily: Poppins.bold, color: Colors.textDark, marginBottom: Spacing.sm },
  filterLabel: { fontSize: FontSize.xs, fontFamily: Poppins.semiBold, color: Colors.textSecondary, marginBottom: 6, textTransform: 'uppercase', letterSpacing: 0.5 },
  chipRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: Spacing.md },
  chip: { paddingHorizontal: 12, paddingVertical: 6, borderRadius: Radius.full, backgroundColor: '#F1F5F9', borderWidth: 1, borderColor: '#E2E8F0' },
  chipActive: { backgroundColor: Colors.primary, borderColor: Colors.primary },
  chipText: { fontSize: FontSize.sm, fontFamily: Poppins.semiBold, color: Colors.textSecondary },
  chipTextActive: { color: Colors.white },
  dateRow: { flexDirection: 'row', gap: 10, marginBottom: Spacing.md },
  dateGroup: { flex: 1 },
  dateInput: {
    flexDirection: 'row', alignItems: 'center', gap: 8,
    backgroundColor: '#F9FAFB', borderWidth: 1, borderColor: '#E5E7EB',
    borderRadius: Radius.sm, paddingHorizontal: 10, height: 42,
  },
  dateInputText: { fontSize: FontSize.sm, fontFamily: Poppins.regular, color: Colors.textDark },
  filterActions: { flexDirection: 'row', gap: 12 },
  clearBtn: { flex: 1, height: 44, borderRadius: Radius.md, justifyContent: 'center', alignItems: 'center', backgroundColor: '#F3F4F6' },
  clearBtnText: { fontSize: FontSize.md, fontFamily: Poppins.semiBold, color: Colors.textSecondary },
  applyBtn: { flex: 2, height: 44, borderRadius: Radius.md, justifyContent: 'center', alignItems: 'center', backgroundColor: Colors.primary },
  applyBtnText: { fontSize: FontSize.md, fontFamily: Poppins.semiBold, color: Colors.white },

  listContent: { padding: Spacing.md, paddingBottom: 32 },

  card: {
    backgroundColor: Colors.white, borderRadius: Radius.lg, padding: Spacing.md, marginBottom: 14,
    borderWidth: 1, borderColor: '#E5E7EB',
    elevation: 2, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 6,
  },
  cardHeader: { flexDirection: 'row', alignItems: 'flex-start', gap: 10, marginBottom: 12 },
  typeIconBg: { width: 42, height: 42, borderRadius: Radius.sm, justifyContent: 'center', alignItems: 'center' },
  cardHeaderInfo: { flex: 1 },
  descText: { fontSize: FontSize.sm, fontFamily: Poppins.semiBold, color: Colors.textDark, lineHeight: 18 },
  txnIdText: { fontSize: FontSize.xs, fontFamily: Poppins.regular, color: Colors.textMuted, marginTop: 2 },
  amountText: { fontSize: FontSize.lg, fontFamily: Poppins.bold },
  divider: { height: 1, backgroundColor: '#F1F5F9', marginBottom: 10 },
  cardFooter: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 },
  typePill: { paddingHorizontal: 8, paddingVertical: 3, borderRadius: Radius.full },
  typePillText: { fontSize: FontSize.xs, fontFamily: Poppins.bold },
  dateText: { fontSize: FontSize.xs, fontFamily: Poppins.regular, color: Colors.textMuted, flex: 1, textAlign: 'center' },
  statusBadge: { paddingHorizontal: 8, paddingVertical: 3, borderRadius: Radius.full },
  statusText: { fontSize: FontSize.xs, fontFamily: Poppins.bold },
  balanceRow: { flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: 2 },
  balanceText: { fontSize: FontSize.xs, fontFamily: Poppins.regular, color: Colors.textMuted },

  emptyContainer: { alignItems: 'center', justifyContent: 'center', marginTop: 80 },
  emptyText: { marginTop: 12, fontSize: FontSize.lg, fontFamily: Poppins.regular, color: '#999' },
});

export default CashBackReportScreen;
