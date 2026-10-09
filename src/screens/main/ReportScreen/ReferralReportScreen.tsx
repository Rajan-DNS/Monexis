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
import { formatDate } from '../../../components/DATE/Dateformat';

// ─── Dummy Data ───────────────────────────────────────────────────────────────
const DUMMY_DATA = [
  {
    id: '1',
    referredName: 'Amit Sharma',
    referredMobile: '9876543210',
    referralCode: 'DNS-A1B2C3',
    joinedDate: '01 Jun 2026, 11:00 AM',
    firstRecharge: '₹299.00',
    bonusEarned: '₹30.00',
    status: 'Completed',
  },
  {
    id: '2',
    referredName: 'Priya Singh',
    referredMobile: '9123456780',
    referralCode: 'DNS-A1B2C3',
    joinedDate: '30 May 2026, 03:45 PM',
    firstRecharge: '₹199.00',
    bonusEarned: '₹20.00',
    status: 'Completed',
  },
  {
    id: '3',
    referredName: 'Rahul Verma',
    referredMobile: '9988776655',
    referralCode: 'DNS-X9Y8Z7',
    joinedDate: '28 May 2026, 09:30 AM',
    firstRecharge: '—',
    bonusEarned: '₹0.00',
    status: 'Pending',
  },
  {
    id: '4',
    referredName: 'Sunita Patel',
    referredMobile: '8765432109',
    referralCode: 'DNS-M7N8O9',
    joinedDate: '25 May 2026, 06:10 PM',
    firstRecharge: '₹599.00',
    bonusEarned: '₹60.00',
    status: 'Completed',
  },
  {
    id: '5',
    referredName: 'Deepak Kumar',
    referredMobile: '7654321098',
    referralCode: 'DNS-M7N8O9',
    joinedDate: '22 May 2026, 01:20 PM',
    firstRecharge: '—',
    bonusEarned: '₹0.00',
    status: 'Pending',
  },
  {
    id: '6',
    referredName: 'Neha Gupta',
    referredMobile: '9012345678',
    referralCode: 'DNS-A1B2C3',
    joinedDate: '20 May 2026, 10:00 AM',
    firstRecharge: '₹399.00',
    bonusEarned: '₹40.00',
    status: 'Completed',
  },
];

const SUMMARY = {
  totalReferred: 6,
  completed: 4,
  pending: 2,
  totalBonus: '₹150.00',
};

// ─── Status color map ─────────────────────────────────────────────────────────
const STATUS_CONFIG: Record<string, { bg: string; text: string }> = {
  Completed: { bg: '#D1FAE5', text: '#10B981' },
  Pending:   { bg: '#FEF3C7', text: '#F59E0B' },
};

// ─── Component ────────────────────────────────────────────────────────────────
const ReferralReportScreen = ({ navigation }: any) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [showFilter, setShowFilter] = useState(false);
  const [fromDate, setFromDate] = useState('');
  const [toDate, setToDate] = useState('');
  const [showFromPicker, setShowFromPicker] = useState(false);
  const [showToPicker, setShowToPicker] = useState(false);
  const [statusFilter, setStatusFilter] = useState<'All' | 'Completed' | 'Pending'>('All');

 
  const filteredData = DUMMY_DATA.filter((item) => {
    const q = searchQuery.toLowerCase();
    const matchesSearch =
      item.referredName.toLowerCase().includes(q) ||
      item.referredMobile.includes(q) ||
      item.referralCode.toLowerCase().includes(q);
    const matchesStatus = statusFilter === 'All' || item.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const toggleFilter = () => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setShowFilter((p) => !p);
  };

  const activeFilterCount = [fromDate, toDate, statusFilter !== 'All' ? statusFilter : ''].filter(Boolean).length;

  const clearFilter = () => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setFromDate('');
    setToDate('');
    setStatusFilter('All');
    setShowFilter(false);
  };

  // ─── Card ────────────────────────────────────────────────────────────────
  const renderCard = ({ item }: { item: (typeof DUMMY_DATA)[0] }) => {
    const cfg = STATUS_CONFIG[item.status] ?? { bg: '#F3F4F6', text: Colors.textMuted };
    const initials = item.referredName.split(' ').map((w) => w[0]).join('').slice(0, 2).toUpperCase();
    const isCompleted = item.status === 'Completed';

    return (
      <View style={styles.card}>
        {/* Top row */}
        <View style={styles.cardHeader}>
          <View style={styles.avatarRow}>
            <View style={[styles.avatar, { backgroundColor: isCompleted ? Colors.primaryLight : '#F3F4F6' }]}>
              <Text style={[styles.avatarText, { color: isCompleted ? Colors.primary : Colors.textMuted }]}>
                {initials}
              </Text>
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.nameText}>{item.referredName}</Text>
              <Text style={styles.mobileText}>{item.referredMobile}</Text>
            </View>
          </View>
          <View style={[styles.statusBadge, { backgroundColor: cfg.bg }]}>
            <Text style={[styles.statusText, { color: cfg.text }]}>{item.status}</Text>
          </View>
        </View>

        <View style={styles.divider} />

        {/* Details grid */}
        <View style={styles.detailsGrid}>
          <View style={styles.detailItem}>
            <Text style={styles.detailLabel}>REFERRAL CODE</Text>
            <Text style={styles.detailValue}>{item.referralCode}</Text>
          </View>
          <View style={[styles.detailItem, { alignItems: 'flex-end' }]}>
            <Text style={styles.detailLabel}>JOINED DATE</Text>
            <Text style={styles.detailValue}>{item.joinedDate}</Text>
          </View>
          <View style={styles.detailItem}>
            <Text style={styles.detailLabel}>FIRST RECHARGE</Text>
            <Text style={styles.detailValue}>{item.firstRecharge}</Text>
          </View>
          <View style={[styles.detailItem, { alignItems: 'flex-end' }]}>
            <Text style={styles.detailLabel}>BONUS EARNED</Text>
            <Text style={[styles.detailValue, isCompleted && { color: Colors.success }]}>
              {item.bonusEarned}
            </Text>
          </View>
        </View>
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />
      <AppHeader title="Referral Report" showBack onBackPress={() => navigation.goBack()} />

      {/* Summary Banner */}
      <View style={styles.summaryBanner}>
        {[
          { label: 'Referred', value: String(SUMMARY.totalReferred), icon: 'account-multiple-outline' },
          { label: 'Completed', value: String(SUMMARY.completed), icon: 'check-circle-outline' },
          { label: 'Pending', value: String(SUMMARY.pending), icon: 'clock-outline' },
          { label: 'Bonus', value: SUMMARY.totalBonus, icon: 'gift-outline' },
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
              placeholder="Search by name, mobile or code..."
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

          <Text style={styles.filterLabel}>Status</Text>
          <View style={styles.chipRow}>
            {(['All', 'Completed', 'Pending'] as const).map((s) => (
              <TouchableOpacity
                key={s}
                style={[styles.chip, statusFilter === s && styles.chipActive]}
                onPress={() => setStatusFilter(s)}
              >
                <Text style={[styles.chipText, statusFilter === s && styles.chipTextActive]}>{s}</Text>
              </TouchableOpacity>
            ))}
          </View>

          <View style={styles.dateRow}>
            <View style={styles.dateGroup}>
              <Text style={styles.filterLabel}>From Date</Text>
              <TouchableOpacity style={styles.dateInput} onPress={() => setShowFromPicker(true)}>
                <MaterialCommunityIcons name="calendar-range" size={16} color={Colors.textSecondary} />
                <Text style={[styles.dateText, !fromDate && { color: Colors.textMuted }]}>
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
                <Text style={[styles.dateText, !toDate && { color: Colors.textMuted }]}>
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
            <MaterialCommunityIcons name="account-multiple-outline" size={64} color="#E0E0E0" />
            <Text style={styles.emptyText}>No referral records found</Text>
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
    flexDirection: 'row',
    backgroundColor: Colors.primaryDark,
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.sm,
    justifyContent: 'space-around',
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
  chipRow: { flexDirection: 'row', gap: 8, marginBottom: Spacing.md },
  chip: { paddingHorizontal: 14, paddingVertical: 6, borderRadius: Radius.full, backgroundColor: '#F1F5F9', borderWidth: 1, borderColor: '#E2E8F0' },
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
  dateText: { fontSize: FontSize.sm, fontFamily: Poppins.regular, color: Colors.textDark },
  filterActions: { flexDirection: 'row', gap: 12 },
  clearBtn: { flex: 1, height: 44, borderRadius: Radius.md, justifyContent: 'center', alignItems: 'center', backgroundColor: '#F3F4F6' },
  clearBtnText: { fontSize: FontSize.md, fontFamily: Poppins.semiBold, color: Colors.textSecondary },
  applyBtn: { flex: 2, height: 44, borderRadius: Radius.md, justifyContent: 'center', alignItems: 'center', backgroundColor: Colors.primary },
  applyBtnText: { fontSize: FontSize.md, fontFamily: Poppins.semiBold, color: Colors.white },

  listContent: { padding: Spacing.md, paddingBottom: 32 },

  card: {
    backgroundColor: Colors.white, borderRadius: Radius.lg,
    padding: Spacing.md, marginBottom: 14,
    borderWidth: 1, borderColor: '#E5E7EB',
    elevation: 2, shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 6,
  },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
  avatarRow: { flexDirection: 'row', alignItems: 'center', gap: 10, flex: 1 },
  avatar: { width: 42, height: 42, borderRadius: Radius.full, justifyContent: 'center', alignItems: 'center' },
  avatarText: { fontSize: FontSize.md, fontFamily: Poppins.bold },
  nameText: { fontSize: FontSize.md, fontFamily: Poppins.bold, color: Colors.textDark },
  mobileText: { fontSize: FontSize.xs, fontFamily: Poppins.regular, color: Colors.textMuted, marginTop: 1 },
  statusBadge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: Radius.full },
  statusText: { fontSize: FontSize.xs, fontFamily: Poppins.bold },
  divider: { height: 1, backgroundColor: '#F1F5F9', marginBottom: 12 },
  detailsGrid: { flexDirection: 'row', flexWrap: 'wrap' },
  detailItem: { width: '50%', marginBottom: 10 },
  detailLabel: { fontSize: 12, fontFamily: Poppins.semiBold, color: Colors.textMuted, marginBottom: 2, textTransform: 'uppercase', letterSpacing: 0.3 },
  detailValue: { fontSize: FontSize.sm, fontFamily: Poppins.semiBold, color: Colors.textDark },

  emptyContainer: { alignItems: 'center', justifyContent: 'center', marginTop: 80 },
  emptyText: { marginTop: 12, fontSize: FontSize.lg, fontFamily: Poppins.regular, color: '#999' },
});

export default ReferralReportScreen;
