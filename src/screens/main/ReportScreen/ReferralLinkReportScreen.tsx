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
  ActivityIndicator,
  LayoutAnimation,
  Share,
  Platform,
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
    referralCode: 'DNS-A1B2C3',
    referralLink: 'https://dnslink.app/ref/DNS-A1B2C3',
    createdDate: '01 Jun 2026, 10:30 AM',
    totalClicks: 42,
    totalJoined: 18,
    totalEarned: '₹540.00',
    status: 'Active',
  },
  {
    id: '2',
    referralCode: 'DNS-X9Y8Z7',
    referralLink: 'https://dnslink.app/ref/DNS-X9Y8Z7',
    createdDate: '28 May 2026, 02:15 PM',
    totalClicks: 15,
    totalJoined: 6,
    totalEarned: '₹180.00',
    status: 'Active',
  },
  {
    id: '3',
    referralCode: 'DNS-P3Q4R5',
    referralLink: 'https://dnslink.app/ref/DNS-P3Q4R5',
    createdDate: '20 May 2026, 09:00 AM',
    totalClicks: 8,
    totalJoined: 2,
    totalEarned: '₹60.00',
    status: 'Inactive',
  },
  {
    id: '4',
    referralCode: 'DNS-M7N8O9',
    referralLink: 'https://dnslink.app/ref/DNS-M7N8O9',
    createdDate: '15 May 2026, 04:45 PM',
    totalClicks: 61,
    totalJoined: 27,
    totalEarned: '₹810.00',
    status: 'Active',
  },
  {
    id: '5',
    referralCode: 'DNS-K1L2M3',
    referralLink: 'https://dnslink.app/ref/DNS-K1L2M3',
    createdDate: '10 May 2026, 11:20 AM',
    totalClicks: 3,
    totalJoined: 0,
    totalEarned: '₹0.00',
    status: 'Inactive',
  },
];

// ─── Summary stats ────────────────────────────────────────────────────────────
const SUMMARY = {
  totalLinks: 5,
  totalClicks: 129,
  totalJoined: 53,
  totalEarned: '₹1,590.00',
};

// ─── Component ────────────────────────────────────────────────────────────────
const ReferralLinkReportScreen = ({ navigation }: any) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [showFilter, setShowFilter] = useState(false);
  const [fromDate, setFromDate] = useState('');
  const [toDate, setToDate] = useState('');
  const [showFromPicker, setShowFromPicker] = useState(false);
  const [showToPicker, setShowToPicker] = useState(false);
  const [statusFilter, setStatusFilter] = useState<'All' | 'Active' | 'Inactive'>('All');


  const filteredData = DUMMY_DATA.filter((item) => {
    const q = searchQuery.toLowerCase();
    const matchesSearch =
      item.referralCode.toLowerCase().includes(q) ||
      item.referralLink.toLowerCase().includes(q);
    const matchesStatus = statusFilter === 'All' || item.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const handleShare = async (item: (typeof DUMMY_DATA)[0]) => {
    try {
      await Share.share({
        message: `Join DNS NextGen using my referral link:\n${item.referralLink}\nCode: ${item.referralCode}`,
        url: item.referralLink,
        title: 'DNS NextGen Referral',
      });
    } catch { /* ignore */ }
  };

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
    const isActive = item.status === 'Active';
    return (
      <View style={styles.card}>
        {/* Header row */}
        <View style={styles.cardHeader}>
          <View style={styles.codeRow}>
            <View style={styles.codeIconBg}>
              <MaterialCommunityIcons name="link-variant" size={22} color={Colors.primary} />
            </View>
            <View>
              <Text style={styles.codeText}>{item.referralCode}</Text>
              <Text style={styles.dateText}>{item.createdDate}</Text>
            </View>
          </View>
          <View style={[styles.statusBadge, isActive ? styles.statusActive : styles.statusInactive]}>
            <Text style={[styles.statusText, { color: isActive ? '#10B981' : Colors.textMuted }]}>
              {item.status}
            </Text>
          </View>
        </View>

        {/* Link row */}
        <View style={styles.linkRow}>
          <MaterialCommunityIcons name="open-in-new" size={14} color={Colors.primary} />
          <Text style={styles.linkText} numberOfLines={1}>{item.referralLink}</Text>
        </View>

        <View style={styles.divider} />

        {/* Stats grid */}
        <View style={styles.statsGrid}>
          <View style={styles.statItem}>
            <Text style={styles.statValue}>{item.totalClicks}</Text>
            <Text style={styles.statLabel}>Clicks</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statItem}>
            <Text style={styles.statValue}>{item.totalJoined}</Text>
            <Text style={styles.statLabel}>Joined</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statItem}>
            <Text style={[styles.statValue, { color: Colors.success }]}>{item.totalEarned}</Text>
            <Text style={styles.statLabel}>Earned</Text>
          </View>
        </View>

        {/* Share button */}
        <TouchableOpacity style={styles.shareBtn} onPress={() => handleShare(item)} activeOpacity={0.8}>
          <MaterialCommunityIcons name="share-variant" size={16} color={Colors.white} />
          <Text style={styles.shareBtnText}>Share Link</Text>
        </TouchableOpacity>
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />
      <AppHeader title="Referral Link Report" showBack onBackPress={() => navigation.goBack()} />

      {/* Summary Banner */}
      <View style={styles.summaryBanner}>
        {[
          { label: 'Links', value: String(SUMMARY.totalLinks), icon: 'link-variant' },
          { label: 'Clicks', value: String(SUMMARY.totalClicks), icon: 'cursor-default-click-outline' },
          { label: 'Joined', value: String(SUMMARY.totalJoined), icon: 'account-plus-outline' },
          { label: 'Earned', value: SUMMARY.totalEarned, icon: 'currency-inr' },
        ].map((s, i) => (
          <View key={i} style={styles.summaryItem}>
            <MaterialCommunityIcons name={s.icon as any} size={18} color={Colors.white} />
            <Text style={styles.summaryValue}>{s.value}</Text>
            <Text style={styles.summaryLabel}>{s.label}</Text>
          </View>
        ))}
      </View>

      {/* Search + Filter bar */}
      <View style={styles.searchContainer}>
        <View style={styles.searchRow}>
          <View style={styles.searchBar}>
            <MaterialIcons name="search" size={20} color={Colors.textSecondary} />
            <TextInput
              placeholder="Search by code or link..."
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

          {/* Status chips */}
          <Text style={styles.filterLabel}>Status</Text>
          <View style={styles.chipRow}>
            {(['All', 'Active', 'Inactive'] as const).map((s) => (
              <TouchableOpacity
                key={s}
                style={[styles.chip, statusFilter === s && styles.chipActive]}
                onPress={() => setStatusFilter(s)}
              >
                <Text style={[styles.chipText, statusFilter === s && styles.chipTextActive]}>{s}</Text>
              </TouchableOpacity>
            ))}
          </View>

          {/* Date row */}
          <View style={styles.dateRow}>
            <View style={styles.dateGroup}>
              <Text style={styles.filterLabel}>From Date</Text>
              <TouchableOpacity style={styles.dateInput} onPress={() => setShowFromPicker(true)}>
                <MaterialCommunityIcons name="calendar-range" size={16} color={Colors.textSecondary} />
                <Text style={[styles.dateText2, !fromDate && { color: Colors.textMuted }]}>
                  {fromDate || 'DD/MM/YYYY'}
                </Text>
              </TouchableOpacity>
              {showFromPicker && (
                <DateTimePicker
                  value={new Date()}
                  mode="date"
                  display="default"
                  onChange={(_, d) => { setShowFromPicker(false); if (d) setFromDate(formatDate(d)); }}
                  maximumDate={new Date()}
                />
              )}
            </View>
            <View style={styles.dateGroup}>
              <Text style={styles.filterLabel}>To Date</Text>
              <TouchableOpacity style={styles.dateInput} onPress={() => setShowToPicker(true)}>
                <MaterialCommunityIcons name="calendar-range" size={16} color={Colors.textSecondary} />
                <Text style={[styles.dateText2, !toDate && { color: Colors.textMuted }]}>
                  {toDate || 'DD/MM/YYYY'}
                </Text>
              </TouchableOpacity>
              {showToPicker && (
                <DateTimePicker
                  value={new Date()}
                  mode="date"
                  display="default"
                  onChange={(_, d) => { setShowToPicker(false); if (d) setToDate(formatDate(d)); }}
                  maximumDate={new Date()}
                />
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
            <MaterialCommunityIcons name="link-off" size={64} color="#E0E0E0" />
            <Text style={styles.emptyText}>No referral links found</Text>
          </View>
        }
      />
    </SafeAreaView>
  );
};

// ─── Styles ───────────────────────────────────────────────────────────────────
const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F8F9FA' },

  // Summary banner
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

  // Search
  searchContainer: {
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
    backgroundColor: Colors.white,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  searchRow: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  searchBar: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F1F5F9',
    borderRadius: Radius.md,
    paddingHorizontal: 12,
    height: 45,
    gap: 8,
  },
  searchInput: { flex: 1, fontSize: FontSize.md, fontFamily: Poppins.regular, color: Colors.textDark, padding: 0 },
  filterBtn: {
    width: 45, height: 45, borderRadius: Radius.md,
    backgroundColor: '#F1F5F9', justifyContent: 'center', alignItems: 'center',
    borderWidth: 1, borderColor: '#E2E8F0', position: 'relative',
  },
  filterBtnActive: { backgroundColor: Colors.primary, borderColor: Colors.primary },
  filterBadge: {
    position: 'absolute', top: -5, right: -5,
    backgroundColor: Colors.error, width: 18, height: 18,
    borderRadius: 9, justifyContent: 'center', alignItems: 'center',
    borderWidth: 2, borderColor: Colors.white,
  },
  filterBadgeText: { color: Colors.white, fontSize: 12, fontFamily: Poppins.bold },

  // Filter panel
  filterPanel: {
    backgroundColor: Colors.white,
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  filterTitle: { fontSize: FontSize.md, fontFamily: Poppins.bold, color: Colors.textDark, marginBottom: Spacing.sm },
  filterLabel: { fontSize: FontSize.xs, fontFamily: Poppins.semiBold, color: Colors.textSecondary, marginBottom: 6, textTransform: 'uppercase', letterSpacing: 0.5 },
  chipRow: { flexDirection: 'row', gap: 8, marginBottom: Spacing.md },
  chip: {
    paddingHorizontal: 14, paddingVertical: 6, borderRadius: Radius.full,
    backgroundColor: '#F1F5F9', borderWidth: 1, borderColor: '#E2E8F0',
  },
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
  dateText2: { fontSize: FontSize.sm, fontFamily: Poppins.regular, color: Colors.textDark },
  filterActions: { flexDirection: 'row', gap: 12 },
  clearBtn: { flex: 1, height: 44, borderRadius: Radius.md, justifyContent: 'center', alignItems: 'center', backgroundColor: '#F3F4F6' },
  clearBtnText: { fontSize: FontSize.md, fontFamily: Poppins.semiBold, color: Colors.textSecondary },
  applyBtn: { flex: 2, height: 44, borderRadius: Radius.md, justifyContent: 'center', alignItems: 'center', backgroundColor: Colors.primary },
  applyBtnText: { fontSize: FontSize.md, fontFamily: Poppins.semiBold, color: Colors.white },

  // List
  listContent: { padding: Spacing.md, paddingBottom: 32 },

  // Card
  card: {
    backgroundColor: Colors.white,
    borderRadius: Radius.lg,
    padding: Spacing.md,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 6,
  },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 },
  codeRow: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  codeIconBg: {
    width: 40, height: 40, borderRadius: Radius.sm,
    backgroundColor: Colors.primaryLight, justifyContent: 'center', alignItems: 'center',
  },
  codeText: { fontSize: FontSize.md, fontFamily: Poppins.bold, color: Colors.textDark },
  dateText: { fontSize: FontSize.xs, fontFamily: Poppins.regular, color: Colors.textMuted, marginTop: 2 },
  statusBadge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: Radius.full },
  statusActive: { backgroundColor: '#D1FAE5' },
  statusInactive: { backgroundColor: '#F3F4F6' },
  statusText: { fontSize: FontSize.xs, fontFamily: Poppins.bold },
  linkRow: {
    flexDirection: 'row', alignItems: 'center', gap: 6,
    backgroundColor: '#F8FAFC', borderRadius: Radius.sm,
    paddingHorizontal: 10, paddingVertical: 6, marginBottom: 10,
  },
  linkText: { flex: 1, fontSize: FontSize.xs, fontFamily: Poppins.medium, color: Colors.primary },
  divider: { height: 1, backgroundColor: '#F1F5F9', marginBottom: 12 },
  statsGrid: { flexDirection: 'row', justifyContent: 'space-around', alignItems: 'center', marginBottom: 14 },
  statItem: { alignItems: 'center', flex: 1 },
  statValue: { fontSize: FontSize.lg, fontFamily: Poppins.bold, color: Colors.textDark },
  statLabel: { fontSize: FontSize.xs, fontFamily: Poppins.regular, color: Colors.textMuted, marginTop: 2 },
  statDivider: { width: 1, height: 30, backgroundColor: '#E5E7EB' },
  shareBtn: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    gap: 6, backgroundColor: Colors.primary, borderRadius: Radius.md,
    paddingVertical: 10,
  },
  shareBtnText: { color: Colors.white, fontSize: FontSize.sm, fontFamily: Poppins.semiBold },

  // Empty
  emptyContainer: { alignItems: 'center', justifyContent: 'center', marginTop: 80 },
  emptyText: { marginTop: 12, fontSize: FontSize.lg, fontFamily: Poppins.regular, color: '#999' },
});

export default ReferralLinkReportScreen;
