import React, { useState, useEffect, useCallback, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  StatusBar,
  SafeAreaView,
  ActivityIndicator,
  RefreshControl,
  TextInput,
  TextInput as RNTextInput,
  LayoutAnimation,
} from 'react-native';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import DateTimePicker from '@react-native-community/datetimepicker';
import Colors from '../../../theme/colors';
import AppHeader from '../../../components/Header/AppHeader';
import { useReportsService } from '../../../redux/services/mainApi/Report/ReportsService';
import { useAppSelector } from '../../../redux/hooks';
import { useGetdownlineuserListQuery } from '../../../redux/services/mainApi/Common/CommonApi';
import { DropdownSelector } from '../../../components/Filters/DropdownSelector';
import { Poppins } from '../../../theme/typography';
import { formatDate } from '../../../components/DATE/Dateformat';

const INITIAL_FILTER = {
  fromDate: '',
  toDate: '',
  retailerId: 0,
};



const DaybookReportScreen = ({ navigation }: any) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [dayBookData, setDayBookData] = useState<any>(null);

  const loginData = useAppSelector((state) => state.auth.user);
  const { fetchDistributorDayBook, isDayBookLoading } = useReportsService();

  // Filter States
  const [showFilter, setShowFilter] = useState(false);

 

  const [filterFields, setFilterFields] = useState({
    ...INITIAL_FILTER,
    fromDate: formatDate(new Date()),
    toDate: formatDate(new Date()),
  });
  const [appliedFilter, setAppliedFilter] = useState<any>({
    fromDate: formatDate(new Date()),
    toDate: formatDate(new Date()),
  });

  const [showFromPicker, setShowFromPicker] = useState(false);
  const [showToPicker, setShowToPicker] = useState(false);
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null);
  const [dropdownSearch, setDropdownSearch] = useState('');

  const { data: downlineData } = useGetdownlineuserListQuery();

  const retailerOptions = useMemo(() => {
    const list = downlineData?.data || [];
    return list.map((item: any) => ({
      value: item.value || item.id,
      text: item.text || item.fullName || item.name,
    }));
  }, [downlineData]);

  const filteredRetailerOptions = useMemo(() => {
    if (!dropdownSearch.trim()) return retailerOptions;
    return retailerOptions.filter((opt: any) =>
      opt.text.toLowerCase().includes(dropdownSearch.toLowerCase())
    );
  }, [retailerOptions, dropdownSearch]);

  const handleDropdownSelect = (field: string, value: any) => {
    updateFilterField(field, value);
    setActiveDropdown(null);
    setDropdownSearch('');
  };

  const fetchDayBook = useCallback(async () => {
    const filters = {
      fromDate: appliedFilter.fromDate || '',
      toDate: appliedFilter.toDate || '',
      searchQuery: searchQuery,
    };
    const targetUserId = appliedFilter.retailerId || loginData?.id || 0;
    const response = await fetchDistributorDayBook(1, 10, targetUserId, filters);
    if (response.success) {
      setDayBookData(response.data);
    }
  }, [loginData?.id, appliedFilter, searchQuery]);

  useEffect(() => {
    fetchDayBook();
  }, [appliedFilter]);

  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      fetchDayBook();
    }, 500);
    return () => clearTimeout(delayDebounceFn);
  }, [searchQuery]);

  const toggleFilter = () => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setShowFilter(prev => !prev);
    if (!showFilter) {
      setFilterFields({ ...INITIAL_FILTER, ...appliedFilter });
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
    const defaults = {
      ...INITIAL_FILTER,
      fromDate: formatDate(new Date()),
      toDate: formatDate(new Date()),
    };
    setFilterFields(defaults);
    setAppliedFilter(defaults);
    setSearchQuery('');
    setShowFilter(false);
  };

  const parseDate = (dateStr: string) => {
    if (!dateStr) return new Date();
    const [day, month, year] = dateStr.split('/').map(Number);
    return new Date(year, month - 1, day);
  };

  const onDateChange = (event: any, selectedDate?: Date, type: 'from' | 'to' = 'from') => {
    setShowFromPicker(false);
    setShowToPicker(false);
    if (selectedDate) {
      updateFilterField(type === 'from' ? 'fromDate' : 'toDate', formatDate(selectedDate));
    }
  };

  const activeFilterCount = Object.values(appliedFilter).filter(v => v !== '' && v !== 0 && v !== undefined && !v.toString().includes('/')).length;

  const renderDataGrid = (data: any) => (
    <View style={styles.dataGrid}>
      <View style={styles.dataItem}>
        <Text style={styles.gridLabel}>RECHARGE AMOUNT</Text>
        <Text style={styles.gridValue}>₹{data?.totalRechargeAmount || '0.00'}</Text>
      </View>
      <View style={[styles.dataItem, { alignItems: 'flex-end' }]}>
        <Text style={styles.gridLabel}>TOP-UP AMOUNT</Text>
        <Text style={styles.gridValue}>₹{data?.totalTopUpAmount || '0.00'}</Text>
      </View>
      <View style={styles.dataItem}>
        <Text style={styles.gridLabel}>COMMISSION</Text>
        <Text style={styles.gridValue}>₹{data?.totalCommission || '0.00'}</Text>
      </View>
      <View style={[styles.dataItem, { alignItems: 'flex-end' }]}>
        <Text style={styles.gridLabel}>CHARGE AMOUNT</Text>
        <Text style={styles.gridValue}>₹{data?.totalChargeAmount || '0.00'}</Text>
      </View>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />
      <AppHeader
        title="Daybook Reports"
        showBackButton
        onBackPress={() => navigation.goBack()}
      />

      <View style={styles.searchContainer}>
        <View style={styles.searchRow}>
          <View style={styles.searchBar}>
            <MaterialIcons name="search" size={20} color={Colors.textSecondary} />
            <TextInput
              placeholder="Search..."
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
                  onPress={() => setShowFromPicker(true)}
                >
                  <MaterialCommunityIcons name="calendar-range" size={18} color={Colors.textSecondary} />
                  <Text style={[styles.filterInput, !filterFields.fromDate && { color: Colors.textMuted }]}>
                    {filterFields.fromDate || 'DD/MM/YYYY'}
                  </Text>
                </TouchableOpacity>
                {showFromPicker && (
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
                  onPress={() => setShowToPicker(true)}
                >
                  <MaterialCommunityIcons name="calendar-range" size={18} color={Colors.textSecondary} />
                  <Text style={[styles.filterInput, !filterFields.toDate && { color: Colors.textMuted }]}>
                    {filterFields.toDate || 'DD/MM/YYYY'}
                  </Text>
                </TouchableOpacity>
                {showToPicker && (
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

            <DropdownSelector
              label="Retailer Name"
              value={filterFields.retailerId}
              options={filteredRetailerOptions}
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

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
        refreshControl={<RefreshControl refreshing={isDayBookLoading} onRefresh={fetchDayBook} color={Colors.primary} />}
      >
        {isDayBookLoading && !dayBookData ? (
          <ActivityIndicator size="large" color={Colors.primary} style={{ marginTop: 50 }} />
        ) : (
          <View style={styles.content}>
            <View style={styles.summaryCard}>
              <View style={styles.summaryHeader}>
                <View>
                  <Text style={styles.summaryLabel}>RETAILER</Text>
                  <Text style={styles.summaryName}>{loginData?.firstName} {loginData?.lastName}</Text>
                </View>
                <View style={styles.statusBadge}>
                  <Text style={styles.statusText}>DAILY SUMMARY</Text>
                </View>
              </View>

              {renderDataGrid(dayBookData)}

              <Text style={styles.sectionTitle}>FINANCIAL BREAKDOWN</Text>
              <View style={styles.breakdownRow}>
                <Text style={styles.breakdownLabel}>Opening Balance</Text>
                <Text style={styles.breakdownValue}>₹{dayBookData?.openingBalance || '0.00'}</Text>
              </View>
              <View style={styles.divider} />
              <View style={styles.breakdownRow}>
                <Text style={[styles.breakdownLabel, { fontWeight: 'bold', color: '#333' }]}>Closing Balance</Text>
                <Text style={[styles.breakdownValue, { color: Colors.primary }]}>₹{dayBookData?.closingBalance || '0.00'}</Text>
              </View>
            </View>

            <View style={styles.infoBox}>
              <MaterialIcons name="info-outline" size={20} color="#666" />
              <Text style={styles.infoText}>This daybook provides a summary of all transactions processed on the selected date.</Text>
            </View>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F8F9FA' },
  searchContainer: { paddingHorizontal: 20, paddingVertical: 15, backgroundColor: '#FFFFFF', borderBottomWidth: 1, borderBottomColor: '#F0F0F0' },
  searchRow: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  searchBar: { flex: 1, flexDirection: 'row', alignItems: 'center', backgroundColor: '#F3F4F6', borderRadius: 12, paddingHorizontal: 12, height: 48 },
  searchInput: { flex: 1, marginLeft: 8, fontSize: 16, color: Colors.textDark, padding: 0, fontFamily: Poppins.bold, },

  filterButton: { width: 48, height: 48, borderRadius: 12, backgroundColor: '#F3F4F6', justifyContent: 'center', alignItems: 'center', borderWidth: 1, borderColor: '#E5E7EB' },
  filterButtonActive: { backgroundColor: Colors.primary, borderColor: Colors.primary },
  filterBadge: { position: 'absolute', top: -5, right: -5, backgroundColor: '#FF3B30', width: 18, height: 18, borderRadius: 9, justifyContent: 'center', alignItems: 'center', borderWidth: 2, borderColor: '#FFFFFF' },
  filterBadgeText: { color: '#FFFFFF', fontSize: 12, fontWeight: '700', fontFamily: Poppins.bold, },

  filterPanel: { backgroundColor: '#FFFFFF', borderBottomWidth: 1, borderBottomColor: '#F0F0F0', paddingBottom: 20 },
  filterHeader: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 20, paddingTop: 15, paddingBottom: 10, gap: 8 },
  filterTitle: { fontSize: 16, fontWeight: '700', color: Colors.textDark, fontFamily: Poppins.bold, },

  filterGrid: { paddingHorizontal: 20 },
  filterRow: { flexDirection: 'row' },
  filterInputGroup: { marginBottom: 5 },
  filterLabel: { fontSize: 12, fontWeight: '600', color: Colors.textSecondary, marginBottom: 8, textTransform: 'uppercase', letterSpacing: 0.5, fontFamily: Poppins.bold, },

  filterInputWrapper: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', backgroundColor: '#F9FAFB', borderWidth: 1, borderColor: '#E5E7EB', borderRadius: 10, paddingHorizontal: 12, height: 44, gap: 10 },
  filterInput: { fontSize: 16, color: Colors.textDark, fontFamily: Poppins.bold, },

  filterActions: { flexDirection: 'row', paddingHorizontal: 20, paddingTop: 15, gap: 12 },
  clearButton: { flex: 1, height: 48, borderRadius: 12, justifyContent: 'center', alignItems: 'center', backgroundColor: '#F3F4F6' },
  clearButtonText: { fontSize: 16, fontWeight: '600', color: Colors.textSecondary, fontFamily: Poppins.bold, },

  applyButton: { flex: 2, height: 48, borderRadius: 12, justifyContent: 'center', alignItems: 'center', backgroundColor: Colors.primary },
  applyButtonText: { fontSize: 16, fontWeight: '600', color: '#FFFFFF', fontFamily: Poppins.bold, },

  activeDropdownBorder: { borderColor: Colors.primary },
  inlineDropdownList: { backgroundColor: '#FFFFFF', borderRadius: 10, marginTop: 5, borderWidth: 1, borderColor: '#E5E7EB', elevation: 3, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 4, padding: 5 },
  dropdownSearchInput: { height: 40, borderBottomWidth: 1, borderBottomColor: '#F3F4F6', paddingHorizontal: 10, fontSize: 16, color: Colors.textDark, marginBottom: 5, fontFamily: Poppins.bold, },

  inlineDropdownItem: { paddingVertical: 12, paddingHorizontal: 10, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', borderBottomWidth: 1, borderBottomColor: '#F9FAFB' },
  inlineDropdownText: { fontSize: 16, color: Colors.textDark, fontFamily: Poppins.bold, },

  selectedDropdownText: { color: Colors.primary, fontWeight: '700' },
  noOptionsText: { padding: 15, textAlign: 'center', color: Colors.textMuted, fontSize: 16, fontFamily: Poppins.bold, },

  scrollContent: { paddingBottom: 30 },
  content: { padding: 20 },
  summaryCard: { backgroundColor: '#FFF', borderRadius: 20, padding: 20, elevation: 0.3, shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.1, shadowRadius: 12, marginBottom: 20 },
  summaryHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 24 },
  summaryLabel: { fontSize: 12, color: '#999', fontWeight: 'bold', marginBottom: 4, letterSpacing: 0.5, fontFamily: Poppins.bold, },

  summaryName: { fontSize: 20, fontWeight: 'bold', color: '#1F2937', fontFamily: Poppins.bold, },

  statusBadge: { backgroundColor: 'rgba(16, 185, 129, 0.1)', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 6 },
  statusText: { fontSize: 12, fontWeight: 'bold', color: '#10B981', fontFamily: Poppins.bold, },

  dataGrid: { flexDirection: 'row', flexWrap: 'wrap', backgroundColor: '#F9FAFB', borderRadius: 16, padding: 16, marginBottom: 24, borderWidth: 1, borderColor: '#F3F4F6' },
  dataItem: { width: '50%', marginBottom: 16 },
  gridLabel: { fontSize: 12, color: '#6B7280', fontWeight: 'bold', marginBottom: 6, fontFamily: Poppins.bold, },

  gridValue: { fontSize: 16, fontWeight: 'bold', color: '#111827', fontFamily: Poppins.bold, },

  sectionTitle: { fontSize: 12, fontWeight: 'bold', color: Colors.primary, letterSpacing: 1, marginBottom: 16, textTransform: 'uppercase', fontFamily: Poppins.bold, },

  breakdownRow: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 10 },
  breakdownLabel: { fontSize: 16, color: '#4B5563', fontFamily: Poppins.bold, },

  breakdownValue: { fontSize: 16, fontWeight: 'bold', color: '#111827', fontFamily: Poppins.bold, },

  divider: { height: 1, backgroundColor: '#F3F4F6', marginVertical: 4 },
  infoBox: { flexDirection: 'row', backgroundColor: '#F3F4F6', padding: 16, borderRadius: 12, alignItems: 'center', gap: 12 },
  infoText: { flex: 1, fontSize: 12, color: '#6B7280', lineHeight: 18, fontFamily: Poppins.bold, },

});

export default DaybookReportScreen;
