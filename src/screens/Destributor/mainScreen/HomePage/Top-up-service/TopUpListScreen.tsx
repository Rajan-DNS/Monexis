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
  Platform,
  ScrollView,
} from 'react-native';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import DateTimePicker from '@react-native-community/datetimepicker';
import Colors from '../../../../../theme/colors';
import AppHeader from '../../../../../components/Header/AppHeader';
import { useTopUpService } from '../../../../../redux/services/mainApi/Top_upService/TopupService';
import { useParentBankAccountDataMutation } from '../../../../../redux/services/mainApi/Top_upService/TopupApi';
import AddTopUpModal from './AddTopUpModal';
import { ListSkeleton } from '../../../../../components/Skeleton';
import { useAppSelector } from '../../../../../redux/hooks';
import { DropdownSelector } from '../../../../../components/Filters/DropdownSelector';
import { Poppins } from '../../../../../theme/typography';
import { useGetStatusTypeQuery } from '../../../../../redux/services/mainApi/Common/CommonApi';

const INITIAL_FILTER = {
  bankAccountId: 0,
  fromDate: '',
  toDate: '',
  statusId: 0,
  gstTypeId: 0,
  transferTypeId: 0,
};

const TopUpListScreen = ({ navigation }: any) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [requests, setRequests] = useState<any[]>([]);
  const [pageIndex, setPageIndex] = useState(1);
  const [pageSize] = useState(10);
  const [hasMore, setHasMore] = useState(true);
  const loginData = useAppSelector((state) => state.auth.user);

  // Filter States
  const [showFilter, setShowFilter] = useState(false);
  const [filterFields, setFilterFields] = useState(INITIAL_FILTER);
  const [appliedFilter, setAppliedFilter] = useState<any>({});
  const [showFromDatePicker, setShowFromDatePicker] = useState(false);
  const [showToDatePicker, setShowToDatePicker] = useState(false);

  // Inline Dropdown Toggle States
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null);
  const [dropdownSearch, setDropdownSearch] = useState('');

  // Modal States
  const [selectedRequest, setSelectedRequest] = useState<any>(null);
  const [isModalVisible, setIsModalVisible] = useState(false);

  const { fetchTopUpList, isLoading } = useTopUpService();
  const [fetchParentBankAccountData] = useParentBankAccountDataMutation();
  const [bankDropdownList, setBankDropdownList] = useState<any[]>([]);

  // API call to fetch status types array
  const { data: statusIdList } = useGetStatusTypeQuery();

  const fetchTopUps = async (index: number, isNewSearch = false, customFilter?: any) => {
    try {
      const currentFilter = customFilter || appliedFilter;
      const response = await fetchTopUpList(index, pageSize, loginData?.id || 0, {
        ...currentFilter,
        paymentReferenceNumber: searchQuery,
      });

      if (response.success) {
        const newData = response.data || [];
        if (isNewSearch) {
          setRequests(newData);
        } else {
          setRequests((prev) => [...prev, ...newData]);
        }
        setHasMore(newData.length === pageSize);
      }
    } catch (error) {
      console.error('Fetch error:', error);
    }
  };

  const getStatusDetails = (id: number) => {
    const list = Array.isArray(statusIdList)
      ? statusIdList
      : statusIdList?.data || [];

    const statusObj = list.find((item: any) => item.id === id);

    const fallbackNames: Record<number, string> = {
      1: 'Success',
      2: 'Processing',
      3: 'Failed',
      4: 'Hold',
      5: 'Pending',
      6: 'Approved',
      7: 'Cancelled',
      8: 'Resolved',
      9: 'ReOpen',
      10: 'Reject',
      11: 'Refund',
    };

    const name = statusObj?.typeName || fallbackNames[id] || 'Pending';

    let color = '#F2994A';
    let icon = 'clock-outline';

    switch (id) {
      case 1:
      case 6:
      case 8:
        color = '#27AE60';
        icon = 'check-circle';
        break;

      case 3:
      case 7:
      case 10:
        color = '#EB5757';
        icon = 'close-circle';
        break;

      case 2:
      case 4:
      case 9:
      case 11:
        color = '#2F80ED';
        icon = 'alert-circle-outline';
        break;

      case 5:
      default:
        color = '#F2994A';
        icon = 'clock-outline';
        break;
    }

    return { name, color, icon };
  };

  useEffect(() => {
    const fetchBankAccounts = async () => {
      try {
        const payload = {
          pageNumber: 1,
          pageSize: 100,
          filter: {
            accountNumber: '',
            accountHolderName: '',
            ifscCode: '',
            mobileNumber: '',
            lapuNumber: '',
            email: '',
            recId: 0,
            beneficiaryId: 0,
            userId: 0,
            roleId: 0,
            statusId: 0,
            gstTypeId: 0,
            vendorGstTypeId: 0,
            globalId: 0,
            hubId: 0,
            bankAccountId: 0,
            txnTypeId: 0,
            amountTypeId: 0,
            transferTypeId: 0,
            packageId: 0,
            operatorId: 0,
            operatorTypeId: 0,
            apiId: 0,
            mediumId: 0,
            filterTypeId: 0,
            circleId: 0,
            parentId: 0,
            paymentReferenceNumber: '',
            remark: '',
            dealerId: 0,
            transactionId: 0,
            ourRequestId: '',
            userRequestId: '',
            fromDate: '',
            toDate: '',
            isApproved: 0,
          },
        };

        const response = await fetchParentBankAccountData(payload).unwrap();

        if (response?.success && response?.data) {
          const formattedData = response.data.map((bank: any) => ({
            text: `${bank.bankName} - ${bank.accountNumber}`,
            value: bank.id,
          }));
          setBankDropdownList(formattedData);
        }
      } catch (error) {
        console.error('Error fetching bank accounts:', error);
      }
    };

    fetchBankAccounts();
  }, []);

  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      setPageIndex(1);
      fetchTopUps(1, true);
    }, 500);
    return () => clearTimeout(delayDebounceFn);
  }, [searchQuery]);

  const toggleFilter = () => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setShowFilter((prev) => !prev);
    if (!showFilter) {
      setFilterFields({ ...INITIAL_FILTER, ...appliedFilter });
    }
    setActiveDropdown(null);
    setDropdownSearch('');
  };

  const updateFilterField = (field: string, value: any) => {
    setFilterFields((prev) => ({ ...prev, [field]: value }));
  };

  const handleDropdownSelect = (field: string, value: any) => {
    updateFilterField(field, value);
    setActiveDropdown(null);
    setDropdownSearch('');
  };

  const handleApplyFilter = () => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setAppliedFilter(filterFields);
    setPageIndex(1);
    setRequests([]);
    fetchTopUps(1, true, filterFields);
    setShowFilter(false);
  };

  const handleClearFilter = () => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setFilterFields(INITIAL_FILTER);
    setAppliedFilter({});
    setSearchQuery('');
    setPageIndex(1);
    setRequests([]);
    fetchTopUps(1, true, {});
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

  const activeFilterCount = Object.values(appliedFilter).filter(
    (v) => v !== '' && v !== 0 && v !== undefined
  ).length;

  const handleLoadMore = () => {
    if (!isLoading && hasMore && requests.length >= pageSize) {
      const nextIndex = pageIndex + 1;
      setPageIndex(nextIndex);
      fetchTopUps(nextIndex);
    }
  };

  const handleEdit = (item: any) => {
    setSelectedRequest(item);
    setIsModalVisible(true);
  };

  const renderItem = ({ item }: { item: any }) => {
    // Dynamic status details derived from item.statusId
    const { name: statusName, color: statusColor, icon: statusIcon } = getStatusDetails(item.statusId);

    return (
      <View style={styles.card}>
        <View style={styles.cardHeader}>
          <View style={styles.retailerInfo}>
            <View style={[styles.iconCircle, { backgroundColor: statusColor + '20' }]}>
              <MaterialCommunityIcons name={statusIcon} size={24} color={statusColor} />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.retailerName} numberOfLines={1}>
                {item.bankName || 'Wallet Request'}
              </Text>
              <Text style={styles.txnId}>{item.paymentReferenceNumber}</Text>
            </View>
          </View>
          <View style={{ alignItems: 'flex-end' }}>
            <View style={[styles.statusBadge, { backgroundColor: statusColor + '15' }]}>
              <Text style={[styles.statusText, { color: statusColor }]}>{statusName}</Text>
            </View>
            {/* Show edit button if status is Pending (5) or Hold (4) */}
            {/* {(item.statusId === 5 || item.statusId === 4 || item.isApproved === 6) && (
              <TouchableOpacity style={styles.editButton} onPress={() => handleEdit(item)}>
                <MaterialCommunityIcons name="pencil-outline" size={20} color={Colors.primary} />
              </TouchableOpacity>
            )} */}
          </View>
        </View>

        <View style={styles.cardDivider} />

        <View style={styles.cardFooter}>
          <View>
            <Text style={styles.label}>Amount</Text>
            <Text style={styles.amount}>₹{item.amount}</Text>
          </View>
          <View style={{ alignItems: 'flex-end' }}>
            <Text style={styles.label}>transferType</Text>
            <Text style={styles.date}>{item.transferType}</Text>
          </View>

        </View>

        {item.remark && (
          <>
            <View style={styles.cardDivider} />
            <View style={styles.cardFooter}>
              <View>
                <Text style={styles.label}>Remark</Text>
                <Text style={styles.remark} numberOfLines={2}>
                  {item.remark}
                </Text>
              </View><View style={{ alignItems: 'flex-end' }}>
                <Text style={styles.label}>Date</Text>
                <Text style={styles.date}>{new Date(item.paymentDate).toLocaleDateString()}</Text>
              </View>

            </View>

          </>
        )}
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />
      <AppHeader title="Top-up History" onBackPress={() => navigation.goBack()} />

      {isLoading && requests.length === 0 ? (
        <ListSkeleton />
      ) : (
        <>
          <View style={styles.searchContainer}>
            <View style={styles.searchRow}>
              <View style={styles.searchBar}>
                <MaterialCommunityIcons name="magnify" size={20} color={Colors.textSecondary} />
                <TextInput
                  placeholder="Search by Reference / UTR"
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
              <ScrollView
                showsVerticalScrollIndicator={false}
                contentContainerStyle={{ paddingBottom: 20 }}
                keyboardShouldPersistTaps="handled"
              >
                <View style={styles.filterHeader}>
                  <MaterialCommunityIcons name="filter-outline" size={18} color={Colors.primary} />
                  <Text style={styles.filterTitle}>Filter Options</Text>
                </View>

                <View style={styles.filterGrid}>
                  <DropdownSelector
                    label="Bank Account"
                    value={filterFields.bankAccountId}
                    options={bankDropdownList || []}
                    onSelect={(id: number) => handleDropdownSelect('bankAccountId', id)}
                    dropdownId="bank"
                    placeholder="All Banks"
                    activeDropdown={activeDropdown}
                    setActiveDropdown={setActiveDropdown}
                    dropdownSearch={dropdownSearch}
                    setDropdownSearch={setDropdownSearch}
                  />

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
                </View>

                <View style={styles.filterActions}>
                  <TouchableOpacity style={styles.clearButton} onPress={handleClearFilter}>
                    <Text style={styles.clearButtonText}>Clear All</Text>
                  </TouchableOpacity>
                  <TouchableOpacity style={styles.applyButton} onPress={handleApplyFilter}>
                    <Text style={styles.applyButtonText}>Apply Filters</Text>
                  </TouchableOpacity>
                </View>
              </ScrollView>
            </View>
          )}

          <FlatList
            data={requests}
            keyExtractor={(item, index) => `${item.id}-${index}`}
            renderItem={renderItem}
            contentContainerStyle={styles.listContent}
            onEndReached={handleLoadMore}
            onEndReachedThreshold={0.5}
            ListFooterComponent={() =>
              isLoading ? <ActivityIndicator size="small" color={Colors.primary} style={{ margin: 10 }} /> : null
            }
            ListEmptyComponent={
              !isLoading ? (
                <View style={styles.emptyContainer}>
                  <MaterialCommunityIcons name="file-search-outline" size={64} color="#E0E0E0" />
                  <Text style={styles.emptyText}>No records found</Text>
                </View>
              ) : null
            }
          />
        </>
      )}

      {isModalVisible && (
        <AddTopUpModal
          isVisible={isModalVisible}
          initialData={selectedRequest}
          onClose={() => {
            setIsModalVisible(false);
            setSelectedRequest(null);
            fetchTopUps(1, true);
          }}
        />
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F8F9FA' },
  searchContainer: { paddingHorizontal: 20, paddingVertical: 15, backgroundColor: '#FFFFFF', borderBottomWidth: 1, borderBottomColor: '#F0F0F0' },
  searchRow: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  searchBar: { flex: 1, flexDirection: 'row', alignItems: 'center', backgroundColor: '#F3F4F6', borderRadius: 12, paddingHorizontal: 12, height: 48 },
  searchInput: { flex: 1, marginLeft: 8, fontSize: 16, color: Colors.textDark, fontFamily: Poppins.bold },

  filterButton: { width: 48, height: 48, borderRadius: 12, backgroundColor: '#F3F4F6', justifyContent: 'center', alignItems: 'center', borderWidth: 1, borderColor: '#E5E7EB' },
  filterButtonActive: { backgroundColor: Colors.primary, borderColor: Colors.primary },
  filterBadge: { position: 'absolute', top: -5, right: -5, backgroundColor: '#FF3B30', width: 18, height: 18, borderRadius: 9, justifyContent: 'center', alignItems: 'center', borderWidth: 2, borderColor: '#FFFFFF' },
  filterBadgeText: { color: '#FFFFFF', fontSize: 12, fontFamily: Poppins.bold },

  filterPanel: { backgroundColor: '#FFFFFF', borderBottomWidth: 1, borderBottomColor: '#F0F0F0', maxHeight: 400 },
  filterHeader: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 20, paddingTop: 15, paddingBottom: 10, gap: 8 },
  filterTitle: { fontSize: 16, color: Colors.textDark, fontFamily: Poppins.bold },

  filterGrid: { paddingHorizontal: 20 },
  filterRow: { flexDirection: 'row', marginTop: 15 },
  filterInputGroup: { marginBottom: 15 },
  filterLabel: { fontSize: 12, color: Colors.textSecondary, marginBottom: 8, textTransform: 'uppercase', letterSpacing: 0.5, fontFamily: Poppins.bold },

  filterInputWrapper: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', backgroundColor: '#F9FAFB', borderWidth: 1, borderColor: '#E5E7EB', borderRadius: 10, paddingHorizontal: 12, height: 44, gap: 10 },
  filterInput: { fontSize: 16, color: Colors.textDark, fontFamily: Poppins.bold },

  filterActions: { flexDirection: 'row', paddingHorizontal: 20, paddingTop: 10, gap: 12 },
  clearButton: { flex: 1, height: 48, borderRadius: 12, justifyContent: 'center', alignItems: 'center', backgroundColor: '#F3F4F6' },
  clearButtonText: { fontSize: 16, color: Colors.textSecondary, fontFamily: Poppins.bold },

  applyButton: { flex: 2, height: 48, borderRadius: 12, justifyContent: 'center', alignItems: 'center', backgroundColor: Colors.primary },
  applyButtonText: { fontSize: 16, color: '#FFFFFF', fontFamily: Poppins.bold },

  listContent: { padding: 20, paddingBottom: 40 },
  card: { backgroundColor: '#FFFFFF', borderRadius: 16, padding: 16, marginBottom: 16, elevation: 2, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 8 },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' },
  retailerInfo: { flex: 1, flexDirection: 'row', alignItems: 'center', gap: 12, marginRight: 10 },
  iconCircle: { width: 44, height: 44, borderRadius: 22, justifyContent: 'center', alignItems: 'center' },
  retailerName: { fontSize: 16, color: Colors.textDark, fontFamily: Poppins.bold },

  txnId: { fontSize: 12, color: Colors.textSecondary, marginTop: 2, fontFamily: Poppins.bold },

  statusBadge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 8 },
  statusText: { fontSize: 12, textTransform: 'uppercase', fontFamily: Poppins.bold },

  editButton: { marginTop: 8, padding: 4 },
  cardDivider: { height: 1, backgroundColor: '#F3F4F6', marginVertical: 12 },
  cardFooter: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  label: { fontSize: 12, color: Colors.textSecondary, textTransform: 'uppercase', letterSpacing: 0.5, fontFamily: Poppins.bold },

  amount: { fontSize: 16, color: Colors.primary, marginTop: 2, fontFamily: Poppins.bold },

  date: { fontSize: 12, color: Colors.textDark, marginTop: 2, fontFamily: Poppins.bold },

  remark: { fontSize: 12, color: Colors.textSecondary, marginTop: 4, fontStyle: 'italic', fontFamily: Poppins.bold },

  emptyContainer: { alignItems: 'center', justifyContent: 'center', marginTop: 100 },
  emptyText: { marginTop: 12, fontSize: 16, color: Colors.textSecondary, fontFamily: Poppins.bold },
});

export default TopUpListScreen;