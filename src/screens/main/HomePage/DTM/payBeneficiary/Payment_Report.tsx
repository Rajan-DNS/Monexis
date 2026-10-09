import React, { useState, useEffect, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  FlatList,
  TextInput,
  ActivityIndicator,
  Platform,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import DateTimePicker, { DateTimePickerEvent } from '@react-native-community/datetimepicker';
import Colors from '../../../../../theme/colors';
import AppHeader from '../../../../../components/Header/AppHeader';
import { BeneficiaryService } from '../../../../../redux/services/RetailerServices/Beneficiary/BeneficiaryService';
import {
  useGetTransferTypeNameQuery,
  useGetStatusTypeQuery,
} from '../../../../../redux/services/mainApi/Common/CommonApi';
import FilterDropdownField from '../../../Profile/components/FilterDropdownField';

const getTodayFormattedString = (): string => {
  const date = new Date();
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${day}/${month}/${year}`;
};

const parseStringToDate = (dateStr: string): Date => {
  if (!dateStr || typeof dateStr !== 'string' || dateStr.trim() === '') {
    return new Date();
  }
  const parts = dateStr.split('/');
  if (parts.length === 3) {
    const day = parseInt(parts[0], 10);
    const month = parseInt(parts[1], 10) - 1;
    const year = parseInt(parts[2], 10);
    if (!isNaN(day) && !isNaN(month) && !isNaN(year)) {
      return new Date(year, month, day);
    }
  }
  return new Date();
};

const Payment_Report = () => {
  const navigation = useNavigation<any>();
  const {
    fetchDMTPaymentReport,
    fetchBeneficiaryList,
    isGetDMTPayDataLoading,
  } = BeneficiaryService();

  const { data: transferTypeData } = useGetTransferTypeNameQuery();
  const { data: statusTypeData } = useGetStatusTypeQuery();

  const [transactions, setTransactions] = useState<any[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [filteredTransactions, setFilteredTransactions] = useState<any[]>([]);
  const [beneficiaries, setBeneficiaries] = useState<any[]>([]);

  const [isFilterVisible, setIsFilterVisible] = useState(false);

  const [localFilters, setLocalFilters] = useState<any>({
    fromDate: getTodayFormattedString(),
    toDate: getTodayFormattedString(),
    accountNumber: '',
    beneficiaryId: null,
    transferType: null,
    statusId: null,
  });

  const [appliedFilters, setAppliedFilters] = useState<any>({
    fromDate: getTodayFormattedString(),
    toDate: getTodayFormattedString(),
    accountNumber: '',
    beneficiaryId: null,
    transferType: null,
    statusId: null,
  });

  const [activeDropdown, setActiveDropdown] = useState<string | null>(null);
  const [showDatePicker, setShowDatePicker] = useState<boolean>(false);
  const [currentPickerTarget, setCurrentPickerTarget] = useState<'fromDate' | 'toDate' | null>(null);

  useEffect(() => {
    loadBeneficiaries();
  }, []);

  const loadBeneficiaries = async () => {
    try {
      const response = await fetchBeneficiaryList(1, 1000);
      if (response?.success && response?.data) {
        setBeneficiaries(Array.isArray(response.data) ? response.data : []);
      }
    } catch (error) {
      console.warn('Failed to load beneficiaries:', error);
    }
  };

  const transferTypeOptions = useMemo(() => {
    if (!transferTypeData?.data) return [];
    return transferTypeData.data
      .filter((item: any) => item.value && !item.value.includes('4'))
      .map((item: any) => ({ value: item.value, text: item.text }));
  }, [transferTypeData]);

  const statusTypeOptions = useMemo(() => {
    if (!statusTypeData?.data) return [];
    return statusTypeData.data
      .filter((item: any) => item.remark && item.remark.includes('Recharge'))
      .map((item: any) => ({
        value: item.id,
        text: item.typeName,
      }));
  }, [statusTypeData]);

  const beneficiaryOptions = useMemo(() => {
    return beneficiaries.map((item: any) => ({
      value: item.id,
      text: `${item.accountHolderName} - ${item.accountNumber}`,
    }));
  }, [beneficiaries]);

  useEffect(() => {
    loadPaymentReport();
  }, [appliedFilters]);

  const loadPaymentReport = async () => {
    try {
      const filters: any = {};
      if (appliedFilters.accountNumber) filters.accountNumber = appliedFilters.accountNumber;
      if (appliedFilters.beneficiaryId) filters.beneficiaryId = appliedFilters.beneficiaryId;
      if (appliedFilters.statusId) filters.statusId = appliedFilters.statusId;
      if (appliedFilters.transferType) filters.transferTypeId = appliedFilters.transferType;
      if (appliedFilters.fromDate) filters.fromDate = appliedFilters.fromDate;
      if (appliedFilters.toDate) filters.toDate = appliedFilters.toDate;

      const response = await fetchDMTPaymentReport(1, 100, filters);

      if (response?.success && response?.data) {
        const dataArray = Array.isArray(response.data) ? response.data : [];
        setTransactions(dataArray);
        setFilteredTransactions(dataArray);
      } else {
        setTransactions([]);
        setFilteredTransactions([]);
      }
    } catch (error) {
      console.warn('Failed to load payment report:', error);
      setTransactions([]);
      setFilteredTransactions([]);
    }
  };

  const handleUpdateLocalField = (key: string, value: any) => {
    setLocalFilters((prev: any) => ({ ...prev, [key]: value }));
  };

  const handleOpenDatePicker = (target: 'fromDate' | 'toDate') => {
    setActiveDropdown(null);
    setCurrentPickerTarget(target);
    setShowDatePicker(true);
  };

  const onDateChange = (event: DateTimePickerEvent, selectedDate?: Date) => {
    if (Platform.OS === 'android') {
      setShowDatePicker(false);
    }
    if (event.type === 'set' && selectedDate && currentPickerTarget) {
      const year = selectedDate.getFullYear();
      const month = String(selectedDate.getMonth() + 1).padStart(2, '0');
      const day = String(selectedDate.getDate()).padStart(2, '0');
      handleUpdateLocalField(currentPickerTarget, `${day}/${month}/${year}`);
    }
    if (Platform.OS === 'android') {
      setCurrentPickerTarget(null);
    }
  };

  const handleApplyFilters = () => {
    setAppliedFilters(localFilters);
    setIsFilterVisible(false);
  };

  const handleClearFilters = () => {
    const emptyState = {
      fromDate: '',
      toDate: '',
      accountNumber: '',
      beneficiaryId: null,
      transferType: null,
      statusId: null,
    };
    setLocalFilters(emptyState);
    setAppliedFilters(emptyState);
    setIsFilterVisible(false);
  };

  useEffect(() => {
    let result = [...transactions];
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      result = result.filter(
        (item) =>
          (item.accountHolderName || '').toLowerCase().includes(q) ||
          (item.accountNumber || '').includes(q) ||
          (item.mobileNumber || '').includes(q) ||
          (item.utrNumber || '').includes(q)
      );
    }
    setFilteredTransactions(result);
  }, [searchQuery, transactions]);

  const getStatusColor = (status: string) => {
    const statusLower = (status || '').toLowerCase();
    if (statusLower.includes('success') || statusLower.includes('completed')) {
      return { bg: '#D1FAE5', text: '#059669', border: '#10B981' };
    }
    if (statusLower.includes('pending') || statusLower.includes('processing')) {
      return { bg: '#FEF3C7', text: '#D97706', border: '#F59E0B' };
    }
    return { bg: '#FEE2E2', text: '#DC2626', border: '#EF4444' };
  };

  const formatDateTime = (dateString: string) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return dateString;

    return date.toLocaleString('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      hour12: true,
    });
  };

  const renderTransaction = ({ item }: { item: any }) => {
    const statusColors = getStatusColor(item.status || item.statusName);
    return (
      <TouchableOpacity
        style={[styles.card, { borderLeftColor: statusColors.border }]}
        onPress={() => navigation.navigate('Transaction_Detailes', { transaction: item })}
        activeOpacity={0.7}
      >
        <View style={styles.cardHeader}>
          <View style={styles.bankIconContainer}>
            <MaterialCommunityIcons name="bank" size={22} color="#1A73E8" />
          </View>
          <View style={styles.beneficiaryInfo}>
            <Text style={styles.holderName} numberOfLines={1}>
              {item.accountHolderName || item.holderName || 'N/A'}
            </Text>
            <Text style={styles.bankAndType} numberOfLines={1}>
              {item.bankName || ''}
            </Text>
            <Text style={styles.bankAndType} numberOfLines={1}>
              • {item.transferType || item.type || 'N/A'}
            </Text>
          </View>
          <View style={styles.amountStatusContainer}>
            <Text style={styles.amountText}>₹{item.amount || '0.00'}</Text>
            <View style={[styles.statusBadge, { backgroundColor: statusColors.bg }]}>
              <Text style={[styles.statusText, { color: statusColors.text }]}>
                {(item.status || item.statusName || 'UNKNOWN').toUpperCase()}
              </Text>
            </View>
          </View>
        </View>

        <View style={styles.cardDetailsGrid}>
          <View style={styles.detailRow}>
            <View style={styles.detailBox}>
              <Text style={styles.detailLabel}>Acc No.</Text>
              <Text style={styles.detailValue}>{item.accountNumber || item.accNo || 'N/A'}</Text>
            </View>
            <View style={[styles.detailBox, { alignItems: 'flex-end' }]}>
              <Text style={styles.detailLabel}>IFSC Code</Text>
              <Text style={styles.detailValue}>{item.ifsccode || item.ifsc || 'N/A'}</Text>
            </View>
          </View>

          <View style={styles.detailRow}>
            <View style={styles.detailBox}>
              <Text style={styles.detailLabel}>Request Id</Text>
              <Text style={styles.detailValue}>{item.userRequestId || item.utr || 'N/A'}</Text>
            </View>
            <View style={[styles.detailBox, { alignItems: 'flex-end' }]}>
              <Text style={styles.detailLabel}>Transaction Id</Text>
              <Text style={styles.detailValue}>{item.txnId || 'N/A'}</Text>
            </View>
          </View>

          <View style={styles.detailRow}>
            <View style={styles.detailBox}>
              <Text style={styles.detailLabel}>UTR</Text>
              <Text style={styles.detailValue}>{item.utrNumber || item.utr || 'N/A'}</Text>
            </View>
            <View style={[styles.detailBox, { alignItems: 'flex-end' }]}>
              <Text style={styles.detailLabel}>Medium Type</Text>
              <Text style={styles.detailValue}>{item.mediumType || 'N/A'}</Text>
            </View>
          </View>

          <View style={styles.detailRow}>
            <View style={styles.detailBox}>
              <Text style={styles.detailLabel}>Date & Time</Text>
              <Text style={styles.detailValue}>
                {formatDateTime(item.updatedDate || item.resendTime)}
              </Text>
            </View>
            <View style={[styles.detailBox, { alignItems: 'flex-end' }]}>
              <Text style={styles.detailLabel}>Surcharge</Text>
              <Text style={styles.detailValue}>Rs. {item.userCommAmount ?? 'N/A'}</Text>
            </View>
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  const activeFiltersCount = Object.values(appliedFilters).filter(
    (val) => val !== '' && val !== null
  ).length;

  return (
    <View style={styles.container}>
      <AppHeader title="Payment Report" showBack onBackPress={() => navigation.goBack()} />

      <View style={styles.searchFilterRow}>
        <View style={styles.searchContainer}>
          <MaterialIcons name="search" size={22} color="#8F9BB3" />
          <TextInput
            style={styles.searchInput}
            placeholder="Search Mobile, Account No, UTR..."
            placeholderTextColor="#8F9BB3"
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity onPress={() => setSearchQuery('')}>
              <MaterialIcons name="close" size={18} color="#8F9BB3" />
            </TouchableOpacity>
          )}
        </View>

        <TouchableOpacity
          style={[styles.filterIconButton, isFilterVisible && styles.filterIconButtonActive]}
          onPress={() => setIsFilterVisible(!isFilterVisible)}
          activeOpacity={0.8}
        >
          <MaterialCommunityIcons
            name="filter-variant"
            size={22}
            color={isFilterVisible ? '#FFF' : '#1E293B'}
          />
          {activeFiltersCount > 0 && (
            <View style={styles.filterBadge}>
              <Text style={styles.filterBadgeText}>{activeFiltersCount}</Text>
            </View>
          )}
        </TouchableOpacity>
      </View>

      {isFilterVisible && (
        <View style={styles.inlineFilterCard}>
          <Text style={styles.filterCardTitle}>Filter Transactions</Text>

          <View style={styles.filterFieldsGrid}>
            <View style={styles.filterFieldBox}>
              <Text style={styles.fieldLabel}>Account Number</Text>
              <TextInput
                style={styles.fieldInput}
                placeholder="Enter account number"
                placeholderTextColor={Colors.textMuted || '#94A3B8'}
                keyboardType="numeric"
                value={localFilters.accountNumber || ''}
                onChangeText={(val) => handleUpdateLocalField('accountNumber', val)}
              />
            </View>

            <FilterDropdownField
              dropdownKey="beneficiaryId"
              label="Beneficiary"
              placeholder="Select beneficiary"
              options={beneficiaryOptions}
              selectedValue={localFilters.beneficiaryId}
              activeDropdown={activeDropdown}
              setActiveDropdown={setActiveDropdown}
              onSelect={handleUpdateLocalField}
            />

            <FilterDropdownField
              dropdownKey="transferType"
              label="Transfer Type"
              placeholder="Select type"
              options={transferTypeOptions}
              selectedValue={localFilters.transferType}
              activeDropdown={activeDropdown}
              setActiveDropdown={setActiveDropdown}
              onSelect={handleUpdateLocalField}
            />

            <FilterDropdownField
              dropdownKey="statusId"
              label="Status"
              placeholder="Select status"
              options={statusTypeOptions}
              selectedValue={localFilters.statusId}
              activeDropdown={activeDropdown}
              setActiveDropdown={setActiveDropdown}
              onSelect={handleUpdateLocalField}
            />

            <View style={styles.filterFieldBox}>
              <Text style={styles.fieldLabel}>From Date</Text>
              <TouchableOpacity
                style={styles.datePickerTrigger}
                onPress={() => handleOpenDatePicker('fromDate')}
              >
                <Text style={[styles.datePickerText, !localFilters.fromDate && { color: '#94A3B8' }]}>
                  {localFilters.fromDate || 'Select from date'}
                </Text>
                <MaterialCommunityIcons name="calendar-month" size={18} color="#64748B" />
              </TouchableOpacity>
            </View>

            <View style={styles.filterFieldBox}>
              <Text style={styles.fieldLabel}>To Date</Text>
              <TouchableOpacity
                style={styles.datePickerTrigger}
                onPress={() => handleOpenDatePicker('toDate')}
              >
                <Text style={[styles.datePickerText, !localFilters.toDate && { color: '#94A3B8' }]}>
                  {localFilters.toDate || 'Select to date'}
                </Text>
                <MaterialCommunityIcons name="calendar-month" size={18} color="#64748B" />
              </TouchableOpacity>
            </View>
          </View>

          {showDatePicker && (
            <View style={Platform.OS === 'ios' ? styles.iosPickerContainer : null}>
              <DateTimePicker
                value={parseStringToDate(currentPickerTarget ? localFilters[currentPickerTarget] : '')}
                mode="date"
                display={Platform.OS === 'ios' ? 'spinner' : 'default'}
                onChange={onDateChange}
                maximumDate={new Date()}
              />
              {Platform.OS === 'ios' && (
                <TouchableOpacity
                  style={styles.iosDoneButton}
                  onPress={() => {
                    setShowDatePicker(false);
                    setCurrentPickerTarget(null);
                  }}
                >
                  <Text style={styles.iosDoneButtonText}>Done</Text>
                </TouchableOpacity>
              )}
            </View>
          )}

          <View style={styles.filterActionsRow}>
            <TouchableOpacity style={styles.clearButton} onPress={handleClearFilters}>
              <Text style={styles.clearButtonText}>Clear All</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.applyButton} onPress={handleApplyFilters}>
              <Text style={styles.applyButtonText}>Apply Filters</Text>
            </TouchableOpacity>
          </View>
        </View>
      )}

      <View style={styles.listHeader}>
        <Text style={styles.showingText}>Showing {filteredTransactions.length} Transactions</Text>
        <TouchableOpacity onPress={loadPaymentReport} activeOpacity={0.7}>
          <MaterialCommunityIcons name="refresh" size={22} color="#64748B" />
        </TouchableOpacity>
      </View>

      {isGetDMTPayDataLoading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={Colors.primary || '#2563EB'} />
        </View>
      ) : (
        <FlatList
          data={filteredTransactions}
          keyExtractor={(item, index) => item.id?.toString() || index.toString()}
          renderItem={renderTransaction}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <MaterialCommunityIcons name="folder-open-outline" size={54} color="#CBD5E1" />
              <Text style={styles.emptyText}>No transactions found</Text>
            </View>
          }
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  searchFilterRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    marginVertical: 12,
  },
  searchContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFF',
    borderRadius: 12,
    paddingHorizontal: 12,
    height: 48,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    marginRight: 10,
  },
  searchInput: {
    flex: 1,
    marginLeft: 8,
    fontSize: 13,
    color: '#1E293B',
  },
  filterIconButton: {
    width: 48,
    height: 48,
    backgroundColor: '#FFF',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  filterIconButtonActive: {
    backgroundColor: '#1E293B',
    borderColor: '#1E293B',
  },
  filterBadge: {
    position: 'absolute',
    top: -4,
    right: -4,
    backgroundColor: '#2563EB',
    width: 18,
    height: 18,
    borderRadius: 9,
    justifyContent: 'center',
    alignItems: 'center',
  },
  filterBadgeText: {
    color: '#FFF',
    fontSize: 10,
    fontWeight: '700',
  },
  inlineFilterCard: {
    backgroundColor: '#FFF',
    marginHorizontal: 16,
    borderRadius: 14,
    padding: 14,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    marginBottom: 16,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
  },
  filterCardTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: '#1E293B',
    marginBottom: 12,
  },
  filterFieldsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  filterFieldBox: {
    width: '48%',
    marginBottom: 12,
  },
  fieldLabel: {
    fontSize: 11,
    fontWeight: '600',
    color: '#64748B',
    marginBottom: 4,
  },
  fieldInput: {
    height: 38,
    borderWidth: 1,
    borderColor: '#CBD5E1',
    borderRadius: 8,
    paddingHorizontal: 10,
    fontSize: 12,
    color: '#1E293B',
    backgroundColor: '#F8FAFC',
  },
  datePickerTrigger: {
    height: 38,
    borderWidth: 1,
    borderColor: '#CBD5E1',
    borderRadius: 8,
    paddingHorizontal: 10,
    backgroundColor: '#F8FAFC',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  datePickerText: {
    fontSize: 12,
    color: '#1E293B',
  },
  iosPickerContainer: {
    backgroundColor: '#F8FAFC',
    borderRadius: 8,
    padding: 8,
    marginBottom: 12,
    width: '100%',
  },
  iosDoneButton: {
    alignSelf: 'flex-end',
    paddingHorizontal: 16,
    paddingVertical: 6,
  },
  iosDoneButtonText: {
    color: '#2563EB',
    fontWeight: '600',
    fontSize: 15,
  },
  filterActionsRow: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginTop: 4,
    borderTopWidth: 1,
    borderTopColor: '#F1F5F9',
    paddingTop: 10,
  },
  clearButton: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    marginRight: 8,
  },
  clearButtonText: {
    fontSize: 12,
    color: '#64748B',
    fontWeight: '600',
  },
  applyButton: {
    backgroundColor: '#2563EB',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
  },
  applyButtonText: {
    fontSize: 12,
    color: '#FFF',
    fontWeight: '600',
  },
  listHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    marginBottom: 10,
  },
  showingText: {
    fontSize: 13,
    color: '#64748B',
    fontWeight: '500',
  },
  listContent: {
    paddingHorizontal: 16,
    paddingBottom: 24,
  },
  card: {
    backgroundColor: '#FFF',
    borderRadius: 14,
    padding: 14,
    marginBottom: 12,
    borderLeftWidth: 4,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 3,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 60,
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
  },
  emptyText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#94A3B8',
    marginTop: 12,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  bankIconContainer: {
    width: 38,
    height: 38,
    borderRadius: 10,
    backgroundColor: '#EFF6FF',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10,
  },
  beneficiaryInfo: {
    flex: 1,
    paddingRight: 6,
  },
  holderName: {
    fontSize: 13,
    fontWeight: '700',
    color: '#0F172A',
    marginBottom: 2,
  },
  bankAndType: {
    fontSize: 11,
    color: '#64748B',
    fontWeight: '500',
  },
  amountStatusContainer: {
    alignItems: 'flex-end',
  },
  amountText: {
    fontSize: 15,
    fontWeight: '700',
    color: '#1E293B',
    marginBottom: 4,
  },
  statusBadge: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  statusText: {
    fontSize: 9,
    fontWeight: '700',
  },
  cardDetailsGrid: {
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: '#F1F5F9',
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  detailBox: {
    flex: 1,
  },
  detailLabel: {
    fontSize: 11,
    color: '#94A3B8',
    marginBottom: 2,
  },
  detailValue: {
    fontSize: 11,
    color: '#1E293B',
    fontWeight: '600',
  },
});

export default Payment_Report;