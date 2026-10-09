import React, { useState, useEffect, useCallback } from 'react';
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
} from 'react-native';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import DateTimePicker from '@react-native-community/datetimepicker';
import Colors from '../../../theme/colors';
import AppHeader from '../../../components/Header/AppHeader';
import { useReportsService } from '../../../redux/services/mainApi/Report/ReportsService';
import { useAppSelector } from '../../../redux/hooks';
import { ListSkeleton } from '../../../components/Skeleton';
import { formatDate, today } from '../../../components/DATE/Dateformat';
import { Poppins } from '../../../theme/typography';
const INITIAL_FILTER = {
  fromDate: today,
  toDate: today,
};

const TransactionReportScreen = ({ navigation }: any) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [transactions, setTransactions] = useState<any[]>([]);
  const [pageIndex, setPageIndex] = useState(1);
  const [pageSize] = useState(10);
  const [hasMore, setHasMore] = useState(true);

  const loginData = useAppSelector((state) => state.auth.user);
  const { fetchUserTxnLedger, isLedgerLoading } = useReportsService();

  // Filter States
  const [showFilter, setShowFilter] = useState(false);
  const [filterFields, setFilterFields] = useState(INITIAL_FILTER);
  const [appliedFilter, setAppliedFilter] = useState(INITIAL_FILTER);
  const [showFromPicker, setShowFromPicker] = useState(false);
  const [showToPicker, setShowToPicker] = useState(false);

  // Derive active filter counts dynamically
  const activeFilterCount = Object.values(appliedFilter).filter(Boolean).length;

  const fetchLedger = useCallback(async (index: number, isNewSearch = false) => {
    const filters = {
      fromDate: appliedFilter.fromDate || today,
      toDate: appliedFilter.toDate || today,
      searchQuery: searchQuery,
    };

    const response = await fetchUserTxnLedger(index, pageSize, Number(loginData?.id) || 0, filters);
    if (response?.success) {
      const newData = response.data || [];
      if (isNewSearch) {
        setTransactions(newData);
      } else {
        setTransactions((prev) => [...prev, ...newData]);
      }
      setHasMore(newData.length === pageSize);
    }
  }, [loginData?.id, appliedFilter, searchQuery, pageSize]);

  // Fetch when applied filters change
  useEffect(() => {
    setPageIndex(1);
    fetchLedger(1, true);
  }, [appliedFilter]);

  // Debounced search query monitoring
  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      setPageIndex(1);
      fetchLedger(1, true);
    }, 500);
    return () => clearTimeout(delayDebounceFn);
  }, [searchQuery]);

  const handleLoadMore = () => {
    if (!isLedgerLoading && hasMore && transactions.length >= pageSize) {
      const nextIndex = pageIndex + 1;
      setPageIndex(nextIndex);
      fetchLedger(nextIndex);
    }
  };

  const toggleFilter = () => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setShowFilter(prev => !prev);
    if (!showFilter) {
      setFilterFields(appliedFilter);
    }
  };

  const updateFilterField = (field: string, value: any) => {
    setFilterFields(prev => ({ ...prev, [field]: value }));
  };

  const handleApplyFilter = () => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setAppliedFilter(filterFields);
    setShowFilter(false);
  };

  const handleClearFilter = () => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setFilterFields(INITIAL_FILTER);
    setAppliedFilter(INITIAL_FILTER);
    setSearchQuery('');
    setShowFilter(false);
  };

  const onDateChange = (event: any, selectedDate?: Date, type: 'from' | 'to' = 'from') => {
    setShowFromPicker(false);
    setShowToPicker(false);
    if (selectedDate && event.type !== 'dismissed') {
      const formatted = formatDate(selectedDate);
      updateFilterField(type === 'from' ? 'fromDate' : 'toDate', formatted);
    }
  };

  const renderTransactionItem = ({ item }: { item: any }) => {
    console.log('Rendering Transaction Item:', item);

    // 1. Safe Property Mapping from your actual API response
    const isCredit = item.amtTypeName?.toUpperCase() === 'CREDIT';
    const amount = isCredit ? item.cr_Amt : item.db_Amt;
    const displayAmount = Number(amount).toFixed(2);
    const openingBal = Number(item.openingBal).toFixed(2);
    const closingBal = Number(item.closingBal).toFixed(2);

    // Format long technical timestamps (e.g., "2026-05-28 22:31:50.60" -> "28 May 2026, 22:31")
    const formatTxnDate = (dateStr: string) => {
      if (!dateStr) return 'N/A';
      try {
        const parts = dateStr.split(' ');
        const dateParts = parts[0].split('-');
        const timeParts = parts[1]?.split(':') || [];

        const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
        const monthIdx = parseInt(dateParts[1], 10) - 1;

        return `${dateParts[2]} ${months[monthIdx]} ${dateParts[0]}, ${timeParts[0]}:${timeParts[1]}`;
      } catch {
        return dateStr; // Fallback to raw string if format varies
      }
    };

    // Modern UI configurations based on entry types
    const typeColor = isCredit ? '#10B981' : '#EF4444'; // Emerald vs Rose
    const typeBg = isCredit ? '#E6F4EA' : '#FCE8E6';

    return (
      <TouchableOpacity style={styles.txnCard} activeOpacity={0.85}>
        {/* Top Banner Row */}
        <View style={styles.cardHeader}>
          <View style={styles.headerLeft}>
            <View style={[styles.iconWrapper, { backgroundColor: typeBg }]}>
              <MaterialCommunityIcons
                name={isCredit ? 'trending-up' : 'trending-down'}
                size={22}
                color={typeColor}
              />
            </View>
            <View>
              <Text style={styles.txnTypeTitle}>{item.txnTypeName || 'Transaction'}</Text>
              <Text style={styles.txnIdText}>ID: {item.recId}</Text>
            </View>
          </View>

          <View style={styles.headerRight}>
            <Text style={[styles.amountValue, { color: typeColor }]}>
              {isCredit ? '+' : '-'}₹{displayAmount}
            </Text>
            <View style={[styles.typeBadge, { backgroundColor: typeBg }]}>
              <Text style={[styles.typeBadgeText, { color: typeColor }]}>
                {item.amtTypeName}
              </Text>
            </View>
          </View>
        </View>

        {/* Horizontal Splitter divider */}
        <View style={styles.cardDivider} />
        <View style={styles.metaDataGrid}>
          <View style={styles.gridItem}>
            <Text style={styles.gridLabel}>TXN ID</Text>
            <Text style={styles.gridValue} numberOfLines={1}>{item.txnId || 'N/A'}</Text>
          </View>

          {/* <View style={styles.gridItem}>
            <Text style={styles.gridLabel}>Wallet Type</Text>
            <Text style={styles.gridValue}>{item.walletType || 'N/A'}</Text>
          </View> */}

          <View style={[styles.gridItem, { flex: 1.3 }]}>
            <Text style={styles.gridLabel}>Ref ID</Text>
            <Text style={styles.gridValue} numberOfLines={1}>
              {item.refTxnId || 'N/A'}
            </Text>
          </View>
        </View>
        <View style={[styles.cardDivider, { marginVertical: 8 }]} />

        {/* Bottom Grid Information Layer */}
        <View style={styles.metaDataGrid}>
          <View style={styles.gridItem}>
            <Text style={styles.gridLabel}>Opening Bal</Text>
            <Text style={styles.gridValue}>₹{openingBal}</Text>
          </View>

          <View style={styles.gridItem}>
            <Text style={styles.gridLabel}>Closing Bal</Text>
            <Text style={[styles.gridValue, { fontWeight: '700', color: '#1E293B' }]}>
              ₹{closingBal}
            </Text>
          </View>

          <View style={[styles.gridItem, { flex: 1.3 }]}>
            <Text style={styles.gridLabel}>Date & Time</Text>
            <Text style={styles.gridValue} numberOfLines={1}>
              {formatTxnDate(item.txnDate)}
            </Text>
          </View>
        </View>



      </TouchableOpacity>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor={Colors.bg} />
      <AppHeader title="Transaction Reports" showBack onBackPress={() => navigation.goBack()} />

      {/* Search Bar and Filter Header Button Container */}
      <View style={styles.searchContainer}>
        <View style={styles.searchRow}>
          <View style={styles.searchBar}>
            <MaterialIcons name="search" size={20} color={Colors.textSecondary || '#64748B'} />
            <TextInput
              placeholder="Search by ID or Remarks..."
              style={styles.searchInput}
              value={searchQuery}
              onChangeText={setSearchQuery}
              placeholderTextColor={Colors.textMuted || '#94A3B8'}
            />
          </View>

          <View style={styles.headerActionsGroup}>
            <TouchableOpacity
              style={[styles.filterButton, showFilter && styles.filterButtonActive]}
              onPress={toggleFilter}
              activeOpacity={0.7}
            >
              <MaterialCommunityIcons
                name="filter-variant"
                size={22}
                color={showFilter ? '#FFFFFF' : (Colors.primary || '#000')}
              />
              {activeFilterCount > 0 && (
                <View style={styles.filterBadge}>
                  <Text style={styles.filterBadgeText}>{activeFilterCount}</Text>
                </View>
              )}
            </TouchableOpacity>
          </View>
        </View>
      </View>

      {/* Expandable Filter Box Panel */}
      {showFilter && (
        <View style={styles.filterPanel}>
          <View style={styles.filterHeader}>
            <MaterialCommunityIcons name="filter-outline" size={18} color={Colors.primary || '#000'} />
            <Text style={styles.filterTitle}>Filter Options</Text>
          </View>

          <View style={styles.filterGrid}>
            <View style={styles.filterRow}>
              <View style={[styles.filterInputGroup, { flex: 1 }]}>
                <Text style={styles.filterLabel}>From Date</Text>
                <TouchableOpacity
                  style={styles.filterInputWrapper}
                  onPress={() => setShowFromPicker(true)}
                >
                  <MaterialCommunityIcons name="calendar-range" size={18} color={Colors.textSecondary || '#64748B'} />
                  <Text style={[styles.filterInput, !filterFields.fromDate && { color: Colors.textMuted || '#94A3B8' }]}>
                    {filterFields.fromDate || 'DD/MM/YYYY'}
                  </Text>
                </TouchableOpacity>
                {showFromPicker && (
                  <DateTimePicker
                    value={new Date()}
                    mode="date"
                    display="default"
                    onChange={(e, d) => onDateChange(e, d, 'from')}
                    maximumDate={new Date()}
                  />
                )}
              </View>

              <View style={[styles.filterInputGroup, { flex: 1, marginLeft: 10 }]}>
                <Text style={styles.filterLabel}>To Date</Text>
                <TouchableOpacity
                  style={styles.filterInputWrapper}
                  onPress={() => setShowToPicker(true)}
                >
                  <MaterialCommunityIcons name="calendar-range" size={18} color={Colors.textSecondary || '#64748B'} />
                  <Text style={[styles.filterInput, !filterFields.toDate && { color: Colors.textMuted || '#94A3B8' }]}>
                    {filterFields.toDate || 'DD/MM/YYYY'}
                  </Text>
                </TouchableOpacity>
                {showToPicker && (
                  <DateTimePicker
                    value={new Date()}
                    mode="date"
                    display="default"
                    onChange={(e, d) => onDateChange(e, d, 'to')}
                    maximumDate={new Date()}
                  />
                )}
              </View>
            </View>
          </View>

          <View style={styles.filterActions}>
            <TouchableOpacity style={styles.clearButton} onPress={handleClearFilter}>
              <Text style={styles.clearButtonText}>Clear All</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.applyButton} onPress={handleApplyFilter}>
              <Text style={styles.applyButtonText}>Apply Filters</Text>
            </TouchableOpacity>
          </View>
        </View>
      )}

      {/* Main Content Render */}
      {isLedgerLoading && transactions.length === 0 ? (
        <ListSkeleton />
      ) : (
        <FlatList
          data={transactions}
          renderItem={renderTransactionItem}
          keyExtractor={(item, index) => `${item.id || index}-${index}`}
          contentContainerStyle={styles.listContent}
          onEndReached={handleLoadMore}
          onEndReachedThreshold={0.5}
          ListFooterComponent={() =>
            isLedgerLoading ? <ActivityIndicator size="small" color={Colors.primary || '#000'} style={{ margin: 10 }} /> : null
          }
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <MaterialCommunityIcons name="swap-horizontal" size={64} color="#E0E0E0" />
              <Text style={styles.emptyText}>No transaction records found</Text>
            </View>
          }
        />
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8F9FA',
  },
  searchContainer: {
    paddingHorizontal: 20,
    paddingVertical: 15,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  searchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  searchBar: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F1F5F9',
    borderRadius: 12,
    paddingHorizontal: 12,
    height: 45,
  },
  headerActionsGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  searchInput: {
    flex: 1,
    marginLeft: 8,
    fontSize: 16,
    fontFamily: Poppins.regular,
    color: Colors.textDark || '#1E293B',
    padding: 0,
  },
  filterButton: {
    width: 45,
    height: 45,
    borderRadius: 12,
    backgroundColor: '#F1F5F9',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    position: 'relative',
  },
  filterButtonActive: {
    backgroundColor: Colors.primary || '#000',
    borderColor: Colors.primary || '#000',
  },
  filterBadge: {
    position: 'absolute',
    top: -5,
    right: -5,
    backgroundColor: Colors.error,
    width: 18,
    height: 18,
    borderRadius: 9,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: Colors.white || '#FFFFFF',
  },
  filterBadgeText: {
    color: Colors.white || '#FFFFFF',
    fontSize: 12,
    fontFamily: Poppins.bold,
    fontWeight: '700',
  },
  filterPanel: {
    backgroundColor: Colors.bg || '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
    paddingBottom: 20,
  },
  filterHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 15,
    paddingBottom: 10,
    gap: 8,
  },
  filterTitle: {
    fontSize: 16,
    fontFamily: Poppins.bold,
    fontWeight: '700',
    color: Colors.textDark || '#1E293B',
  },
  filterGrid: {
    paddingHorizontal: 20,
  },
  filterRow: {
    flexDirection: 'row',
  },
  filterInputGroup: {
    marginBottom: 5,
  },
  filterLabel: {
    fontSize: 12,
    fontFamily: Poppins.semiBold,
    fontWeight: '600',
    color: Colors.textSecondary || '#64748B',
    marginBottom: 8,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  filterInputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F9FAFB',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 10,
    paddingHorizontal: 12,
    height: 44,
    gap: 10
  },
  filterInput: {
    fontSize: 16,
    fontFamily: Poppins.regular,
    color: Colors.textDark || '#1E293B',
  },
  filterActions: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    paddingTop: 15,
    gap: 12,
  },
  clearButton: {
    flex: 1,
    height: 48,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F3F4F6',
  },
  clearButtonText: {
    fontSize: 16,
    fontFamily: Poppins.semiBold,
    fontWeight: '600',
    color: Colors.textSecondary || '#64748B',
  },
  applyButton: {
    flex: 2,
    height: 48,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: Colors.primary || '#000',
  },
  applyButtonText: {
    fontSize: 16,
    fontFamily: Poppins.semiBold,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  listContent: {
    padding: 16,
    paddingBottom: 30,
  },
  txnItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    backgroundColor: '#FFF',
    padding: 16,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#F0F0F0',
    marginBottom: 12,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
  },
  txnItemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  txnIconBg: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: '#F3F4F6',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    flex: 1,
  },
  txnTitle: {
    fontSize: 12,
    fontFamily: Poppins.bold,
    fontWeight: 'bold',
    color: '#333',
  },
  txnDate: {
    fontSize: 12,
    fontFamily: Poppins.regular,
    color: '#999',
  },
  txnSubtitle: {
    fontSize: 12,
    fontFamily: Poppins.regular,
    color: '#666',
    marginTop: 4,
  },
  txnItemRight: {
    alignItems: 'flex-end',
    marginLeft: 10,
  },
  txnAmount: {
    fontSize: 16,
    fontFamily: Poppins.bold,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 6,
  },
  txnStatusText: {
    fontSize: 12,
    fontFamily: Poppins.bold,
    fontWeight: 'bold',
    textTransform: 'uppercase',
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 100,
  },
  emptyText: {
    marginTop: 12,
    fontSize: 16,
    fontFamily: Poppins.regular,
    color: '#999',
  },

  txnCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: '#E2E8F0', // Soft structural border line
    // Smooth Elevation Shadowing
    elevation: 0.3,
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.04,
    shadowRadius: 10,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  iconWrapper: {
    width: 42,
    height: 42,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  txnTypeTitle: {
    fontSize: 16,
    fontFamily: Poppins.semiBold,
    fontWeight: '600',
    color: '#0F172A',
  },
  txnIdText: {
    fontSize: 12,
    color: '#64748B',
    marginTop: 2,
    fontFamily: 'Platform-Mono', // Monospace style fallbacks if available
  },
  headerRight: {
    alignItems: 'flex-end',
    gap: 4,
  },
  amountValue: {
    fontSize: 16,
    fontFamily: Poppins.bold,
    fontWeight: '700',
    letterSpacing: -0.3,
  },
  typeBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  typeBadgeText: {
    fontSize: 12,
    fontFamily: Poppins.bold,
    fontWeight: '700',
    textTransform: 'uppercase',
  },
  remarkContainer: {
    backgroundColor: '#F8FAFC',
    padding: 10,
    borderRadius: 8,
    marginTop: 12,
  },
  remarkText: {
    fontSize: 12,
    fontFamily: Poppins.regular,
    color: '#475569',
    lineHeight: 18,
    fontStyle: 'italic',
  },
  cardDivider: {
    height: 1,
    backgroundColor: '#F1F5F9',
    marginVertical: 12,
  },
  metaDataGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: 8,
  },
  gridItem: {
    flex: 1,
  },
  gridLabel: {
    fontSize: 12,
    fontFamily: Poppins.semiBold,
    color: '#94A3B8',
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 0.3,
    marginBottom: 4,
  },
  gridValue: {
    fontSize: 12,
    fontFamily: Poppins.medium,
    color: '#475569',
    fontWeight: '500',
  },

});

export default TransactionReportScreen;