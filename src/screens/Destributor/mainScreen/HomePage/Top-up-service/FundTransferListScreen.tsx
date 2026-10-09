import React, { useState, useEffect, useCallback, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  SafeAreaView,
  StatusBar,
  TouchableOpacity,
  LayoutAnimation,
  Platform,
  TextInput as RNTextInput,
} from 'react-native';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import DateTimePicker from '@react-native-community/datetimepicker';
import AppHeader from '../../../../../components/Header/AppHeader';
import Colors from '../../../../../theme/colors';
import { TransactionSkeleton } from '../../../../../components/Skeleton';
import { useTopUpService } from '../../../../../redux/services/mainApi/Top_upService/TopupService';
import { useAppSelector } from '../../../../../redux/hooks';
import { useGetdownlineuserListQuery } from '../../../../../redux/services/mainApi/Common/CommonApi';
import { DropdownSelector } from '../../../../../components/Filters/DropdownSelector';
import { Poppins } from '../../../../../theme/typography';

const INITIAL_FILTER = {
  fromDate: '',
  toDate: '',
  statusId: 0,
  retailerId: 0,
};

const FundTransferListScreen = ({ navigation }: any) => {
  const user = useAppSelector((state: any) => state.auth.user);
  const { fetchFundTransferList } = useTopUpService();
  const [isLoading, setIsLoading] = useState(true);
  const [data, setData] = useState<any[]>([]);

  // Filter States
  const [showFilter, setShowFilter] = useState(false);
  const [filterFields, setFilterFields] = useState(INITIAL_FILTER);
  const [appliedFilter, setAppliedFilter] = useState<any>({});
  const [showFromDatePicker, setShowFromDatePicker] = useState(false);
  const [showToDatePicker, setShowToDatePicker] = useState(false);
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null);
  const [dropdownSearch, setDropdownSearch] = useState('');
  const [searchQuery, setSearchQuery] = useState('');

  const { data: downlineData } = useGetdownlineuserListQuery();

  const retailerOptions = useMemo(() => {
    const list = downlineData?.data || [];
    return list.map((item: any) => ({
      value: item.value || item.id,
      text: item.text || item.fullName || item.name,
    }));
  }, [downlineData]);


  const handleDropdownSelect = (field: string, value: any) => {
    updateFilterField(field, value);
    setActiveDropdown(null);
    setDropdownSearch('');
  };

  const fetchTransfers = useCallback(async (customFilter?: any) => {
    setIsLoading(true);
    try {
      const currentFilter = customFilter || appliedFilter;
      const targetUserId = currentFilter.retailerId || user?.id || 0;

      const response = await fetchFundTransferList(1, 100, targetUserId, {
        ...currentFilter,
        paymentReferenceNumber: searchQuery,
      });
      if (response.success) {
        setData(response.data || []);
      }
    } catch (error) {
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  }, [user?.id, fetchFundTransferList, appliedFilter, searchQuery]);

  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      fetchTransfers();
    }, 500);
    return () => clearTimeout(delayDebounceFn);
  }, [searchQuery]);

  const toggleFilter = () => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setShowFilter(prev => !prev);
    if (!showFilter) {
      setFilterFields({ ...INITIAL_FILTER, ...appliedFilter });
    }
    setActiveDropdown(null);
    setDropdownSearch('');
  };

  const updateFilterField = (field: string, value: any) => {
    setFilterFields(prev => ({ ...prev, [field]: value }));
  };

  const handleApplyFilter = () => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setAppliedFilter(filterFields);
    fetchTransfers(filterFields);
    setShowFilter(false);
  };

  const handleClearFilter = () => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setFilterFields(INITIAL_FILTER);
    setAppliedFilter({});
    setSearchQuery('');
    fetchTransfers({});
    setShowFilter(false);
  };

  const onDateChange = (event: any, selectedDate?: Date, type: 'from' | 'to' = 'from') => {
    if (Platform.OS === 'android') {
      type === 'from' ? setShowFromDatePicker(false) : setShowToDatePicker(false);
    }
    if (selectedDate) {
      const day = String(selectedDate.getDate()).padStart(2, '0');
      const month = String(selectedDate.getMonth() + 1).padStart(2, '0');
      const year = selectedDate.getFullYear();
      const formattedDate = `${day}/${month}/${year}`;
      updateFilterField(type === 'from' ? 'fromDate' : 'toDate', formattedDate);
    }
  };

  const parseDate = (dateStr: string) => {
    if (!dateStr) return new Date();
    const [day, month, year] = dateStr.split('/').map(Number);
    return new Date(year, month - 1, day);
  };

  const activeFilterCount = Object.values(appliedFilter).filter(v => v !== '' && v !== 0 && v !== undefined).length;

  const renderItem = ({ item }: any) => (
    <View style={styles.card}>
      <View style={styles.cardHeader}>
        <View style={styles.bankInfo}>
          <View style={styles.bankIconContainer}>
            <MaterialCommunityIcons name="bank" size={24} color="#0052D4" />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={styles.bankName} numberOfLines={1}>{item.paymentReceiveBank}</Text>
            <View style={styles.transferTypeBadge}>
              <Text style={styles.transferTypeText} numberOfLines={1}>{item.transferTypeName}</Text>
            </View>
          </View>
        </View>
        <View style={styles.statusBadge}>
          <MaterialCommunityIcons name="check-circle" size={14} color="#27AE60" />
          <Text style={styles.statusText}>{item.status}</Text>
        </View>
      </View>

      <View style={styles.amountSection}>
        <View style={styles.blueBar} />
        <View style={styles.retailerInfo}>
          <View style={{ flex: 1, marginRight: 12 }}>
            <Text style={styles.detailLabel}>Retailer</Text>
            <Text style={styles.retailerName} numberOfLines={1}>{item.transferUser}</Text>
          </View>
          <View style={{ alignItems: 'flex-end' }}>
            <Text style={styles.detailLabel}>Amount</Text>
            <Text style={styles.amountValue}>₹{item.amount}</Text>
          </View>
        </View>
      </View>

      <View style={styles.footerRow}>
        <View>
          <Text style={styles.utrText}>UTR: {item.paymentRefNumber}</Text>
          <Text style={styles.dateText}>{item.requestDate}</Text>
        </View>
      </View>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#F8F9FB" />
      <AppHeader title="Fund Transfer List" onBackPress={() => navigation.goBack()} />

      <View style={styles.searchContainer}>
        <View style={styles.searchRow}>
          <View style={styles.searchBar}>
            <MaterialCommunityIcons name="magnify" size={20} color={Colors.textSecondary} />
            <RNTextInput
              placeholder="Search by UTR / Reference"
              style={styles.searchInput}
              value={searchQuery}
              onChangeText={setSearchQuery}
              placeholderTextColor={Colors.textMuted}
            />
          </View>
          <TouchableOpacity
            style={[styles.filterButton, showFilter && styles.filterButtonActive]}
            onPress={toggleFilter}
            activeOpacity={0.7}
          >
            <MaterialCommunityIcons
              name="filter-variant"
              size={22}
              color={showFilter ? '#FFFFFF' : Colors.primary}
            />
            {activeFilterCount > 0 && (
              <View style={styles.filterBadge}>
                <Text style={styles.filterBadgeText}>{activeFilterCount}</Text>
              </View>
            )}
          </TouchableOpacity>
        </View>
      </View>

      {showFilter && (
        <View style={styles.filterPanel}>
          <View style={styles.filterHeader}>
            <MaterialCommunityIcons name="filter-outline" size={18} color={Colors.primary} />
            <Text style={styles.filterTitle}>Filter Options</Text>
          </View>

          <View style={styles.filterGrid}>
            <View style={styles.filterRow}>
              <View style={[styles.filterInputGroup, { flex: 1 }]}>
                <Text style={styles.filterLabel}>From Date</Text>
                <TouchableOpacity
                  style={styles.filterInputWrapper}
                  onPress={() => setShowFromDatePicker(true)}
                >
                  <MaterialCommunityIcons name="calendar-range" size={18} color={Colors.textSecondary} />
                  <Text style={[styles.filterInput, !filterFields.fromDate && { color: Colors.textMuted }]}>
                    {filterFields.fromDate || 'DD/MM/YYYY'}
                  </Text>
                </TouchableOpacity>
                {showFromDatePicker && (
                  <DateTimePicker
                    value={parseDate(filterFields.fromDate)}
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
                  onPress={() => setShowToDatePicker(true)}
                >
                  <MaterialCommunityIcons name="calendar-range" size={18} color={Colors.textSecondary} />
                  <Text style={[styles.filterInput, !filterFields.toDate && { color: Colors.textMuted }]}>
                    {filterFields.toDate || 'DD/MM/YYYY'}
                  </Text>
                </TouchableOpacity>
                {showToDatePicker && (
                  <DateTimePicker
                    value={parseDate(filterFields.toDate)}
                    mode="date"
                    display="default"
                    onChange={(e, d) => onDateChange(e, d, 'to')}
                    maximumDate={new Date()}
                  />
                )}
              </View>
            </View>

            {/* Displaying selected Name indicator badge below */}
            <DropdownSelector
              label="Retailer Name"
              value={filterFields.retailerId}
              options={retailerOptions}
              onSelect={(id: number) => handleDropdownSelect('retailerId', id)}
              dropdownId="retailer"
              placeholder="Select Retailer"
              activeDropdown={activeDropdown}
              setActiveDropdown={setActiveDropdown}
              dropdownSearch={dropdownSearch}
              setDropdownSearch={setDropdownSearch}
            />


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

      {isLoading ? (
        <TransactionSkeleton />
      ) : (
        <FlatList
          data={data}
          keyExtractor={(item, index) => `${item.id}-${index}`}
          renderItem={renderItem}
          contentContainerStyle={styles.listContent}
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <MaterialCommunityIcons name="file-search-outline" size={64} color="#E0E0E0" />
              <Text style={styles.emptyText}>No records found</Text>
            </View>
          }
        />
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F8F9FB' },
  searchContainer: { paddingHorizontal: 20, paddingVertical: 15, backgroundColor: '#FFFFFF', borderBottomWidth: 1, borderBottomColor: '#F0F0F0' },
  searchRow: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  searchBar: { flex: 1, flexDirection: 'row', alignItems: 'center', backgroundColor: '#F3F4F6', borderRadius: 12, paddingHorizontal: 12, height: 48 },
  searchInput: { flex: 1, marginLeft: 8, fontSize: 16, color: Colors.textDark, padding: 0, fontFamily: Poppins.bold },

  filterButton: { width: 48, height: 48, borderRadius: 12, backgroundColor: '#F3F4F6', justifyContent: 'center', alignItems: 'center', borderWidth: 1, borderColor: '#E5E7EB' },
  filterButtonActive: { backgroundColor: Colors.primary, borderColor: Colors.primary },
  filterBadge: { position: 'absolute', top: -5, right: -5, backgroundColor: '#FF3B30', width: 18, height: 18, borderRadius: 9, justifyContent: 'center', alignItems: 'center', borderWidth: 2, borderColor: '#FFFFFF' },
  filterBadgeText: { color: '#FFFFFF', fontSize: 12, fontFamily: Poppins.bold },

  filterPanel: { backgroundColor: '#FFFFFF', borderBottomWidth: 1, borderBottomColor: '#F0F0F0', paddingBottom: 20 },
  filterHeader: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 20, paddingTop: 15, paddingBottom: 10, gap: 8 },
  filterTitle: { fontSize: 16, color: Colors.textDark, fontFamily: Poppins.bold },

  filterGrid: { paddingHorizontal: 20 },
  filterRow: { flexDirection: 'row' },
  filterInputGroup: { marginBottom: 5 },
  filterLabel: { fontSize: 12, color: Colors.textSecondary, marginBottom: 8, textTransform: 'uppercase', letterSpacing: 0.5, fontFamily: Poppins.bold },

  filterInputWrapper: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#F9FAFB', borderWidth: 1, borderColor: '#E5E7EB', borderRadius: 10, paddingHorizontal: 12, height: 44, gap: 10 },
  filterInput: { fontSize: 16, color: Colors.textDark, fontFamily: Poppins.bold },

  filterActions: { flexDirection: 'row', paddingHorizontal: 20, paddingTop: 15, gap: 12 },
  clearButton: { flex: 1, height: 48, borderRadius: 12, alignItems: 'center', backgroundColor: '#F3F4F6', justifyContent: 'center' },
  clearButtonText: { fontSize: 16, color: Colors.textSecondary, fontFamily: Poppins.bold },

  applyButton: { flex: 2, height: 48, borderRadius: 12, alignItems: 'center', backgroundColor: Colors.primary, justifyContent: 'center' },
  applyButtonText: { fontSize: 16, color: '#FFFFFF', fontFamily: Poppins.bold },

  listContent: { padding: 20, paddingBottom: 40 },
  card: { backgroundColor: '#FFF', borderRadius: 20, padding: 20, marginBottom: 16, shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.03, shadowRadius: 10, elevation: 0.3 },
  cardHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 20 },
  bankInfo: { flex: 1, flexDirection: 'row', alignItems: 'center', marginRight: 12 },
  bankIconContainer: { width: 40, height: 40, borderRadius: 10, backgroundColor: 'rgba(0, 82, 212, 0.05)', alignItems: 'center', marginRight: 12, borderWidth: 1, borderColor: 'rgba(0, 82, 212, 0.1)', justifyContent: 'center' },
  bankName: { fontSize: 16, color: '#333', fontFamily: Poppins.bold },

  transferTypeBadge: { backgroundColor: '#F0F0F0', paddingHorizontal: 6, paddingVertical: 2, borderRadius: 4, marginTop: 2, alignSelf: 'flex-start' },
  transferTypeText: { fontSize: 12, color: '#666', textTransform: 'uppercase', fontFamily: Poppins.bold },

  statusBadge: { flexDirection: 'row', alignItems: 'center', backgroundColor: 'rgba(39, 174, 96, 0.1)', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 6, gap: 4 },
  statusText: { fontSize: 12, color: '#27AE60', fontFamily: Poppins.bold },

  amountSection: { flexDirection: 'row', marginBottom: 20 },
  blueBar: { width: 4, backgroundColor: '#0052D4', borderRadius: 2, marginRight: 12 },
  retailerInfo: { flex: 1, flexDirection: 'row', alignItems: 'center' },
  detailLabel: { fontSize: 12, color: '#999', marginBottom: 4, fontFamily: Poppins.bold },

  retailerName: { fontSize: 16, color: '#333', fontFamily: Poppins.bold },

  amountValue: { fontSize: 20, color: '#0052D4', fontFamily: Poppins.bold },

  footerRow: { flexDirection: 'row', alignItems: 'flex-end', borderTopWidth: 1, borderTopColor: '#F5F5F5', paddingTop: 15 },
  utrText: { fontSize: 12, color: '#666', fontWeight: '500', fontFamily: Poppins.bold },

  dateText: { fontSize: 12, fontWeight: '600', color: '#444', fontFamily: Poppins.bold },

  emptyContainer: { flex: 1, alignItems: 'center', paddingVertical: 50, justifyContent: 'center' },
  emptyText: { marginTop: 12, fontSize: 16, color: Colors.textSecondary, fontWeight: '500', fontFamily: Poppins.bold },

  selectedContainer: {
    flexDirection: 'row',
    marginTop: 8,
    backgroundColor: '#EBF3FF',
    padding: 10,
    borderRadius: 8,
    alignItems: 'center',
    gap: 6
  },
  selectedLabelText: {
    fontSize: 12,
    fontFamily: Poppins.medium,
    color: Colors.textSecondary,
    fontWeight: '500'
  },
  selectedNameText: {
    fontSize: 12, fontFamily: Poppins.bold,
    color: '#0052D4',
    fontWeight: '700'
  }
});

export default FundTransferListScreen;