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
  ScrollView,
} from 'react-native';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import Colors from '../../../../../theme/colors';
import AppHeader from '../../../../../components/Header/AppHeader';
import { useBankService } from '../../../../../redux/services/mainApi/bank/Bankservice';
import AddBankModal from './AddBankModal';
import { ListSkeleton } from '../../../../../components/Skeleton';
import { BankFilterFields } from '../../../../../redux/services/mainApi/bank/Payload';
import { useGetDropDownQuery } from '../../../../../redux/services/mainApi/Common/CommonApi';
import { DropdownSelector } from '../../../../../components/Filters/DropdownSelector';
import { Poppins } from '../../../../../theme/typography';



const INITIAL_FILTER: BankFilterFields = {
  accountNumber: '',
  accountHolderName: '',
  ifscCode: '',
  mobileNumber: '',
  bankId: 0,
  accountTypeId: 0,
  statusId: 0,
  fromDate: '',
  toDate: '',
};

const BankListScreen = ({ navigation }: any) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [banks, setBanks] = useState<any[]>([]);
  const [pageIndex, setPageIndex] = useState(1);
  const [pageSize] = useState(25);
  const [hasMore, setHasMore] = useState(true);

  // Filter States
  const [showFilter, setShowFilter] = useState(false);
  const [filterFields, setFilterFields] = useState<BankFilterFields>({ ...INITIAL_FILTER });
  const [appliedFilter, setAppliedFilter] = useState<Partial<BankFilterFields>>({});

  // Inline Dropdown Toggle States
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null);
  const [dropdownSearch, setDropdownSearch] = useState('');

  // Modal States
  const [selectedBank, setSelectedBank] = useState<any>(null);
  const [isModalVisible, setIsModalVisible] = useState(false);

  // Use the Bank Service
  const {
    isFetching: isLoading,
    accountTypeList,
    fetchBanksList
  } = useBankService();

  const { data: bankData } = useGetDropDownQuery('BankAccount');
  const bankDropdownList = bankData?.data || [];

  const fetchBanks = useCallback(async (index: number, isNewSearch = false, filters?: Partial<BankFilterFields>) => {
    try {
      const activeFilters = filters || appliedFilter;
      const response = await fetchBanksList(index, pageSize, searchQuery, activeFilters);

      if (response.success) {
        const newData = response.data || [];
        if (isNewSearch) {
          setBanks(newData);
        } else {
          setBanks((prev) => [...prev, ...newData]);
        }
        setHasMore(newData.length === pageSize);
      } else {
        if (isNewSearch) setBanks([]);
        setHasMore(false);
      }
    } catch (error) {
      if (isNewSearch) setBanks([]);
    }
  }, [appliedFilter, searchQuery, pageSize, fetchBanksList]);

  // Initial Fetch on Mount
  useEffect(() => {
    fetchBanks(1, true);
  }, []);

  const handleLoadMore = () => {
    if (!isLoading && hasMore && banks.length >= pageSize) {
      const nextIndex = pageIndex + 1;
      setPageIndex(nextIndex);
      fetchBanks(nextIndex);
    }
  };

  const handleEdit = (item: any) => {
    setSelectedBank(item);
    setIsModalVisible(true);
  };

  const toggleFilter = () => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setShowFilter(prev => !prev);
    if (!showFilter) {
      setFilterFields({ ...INITIAL_FILTER, ...appliedFilter });
    }
    setActiveDropdown(null);
    setDropdownSearch('');
  };

  const updateFilterField = (field: keyof BankFilterFields, value: any) => {
    setFilterFields(prev => ({ ...prev, [field]: value }));
  };

  const handleApplyFilter = () => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);

    setAppliedFilter(filterFields);
    setPageIndex(1);
    setBanks([]);

    fetchBanks(1, true, filterFields);
    setShowFilter(false);
  };

  const handleDropdownSelect = (field: keyof BankFilterFields, value: any) => {
    updateFilterField(field, value);
    setActiveDropdown(null);
    setDropdownSearch('');
  };

  const handleClearFilter = () => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);

    setFilterFields({ ...INITIAL_FILTER });
    setAppliedFilter({});
    setSearchQuery('');
    setPageIndex(1);
    setBanks([]);

    fetchBanks(1, true, {});
    setShowFilter(false);
  };

  const activeFilterCount = Object.values(appliedFilter).filter(v => v !== '' && v !== 0 && v !== undefined).length;

  const renderItem = ({ item }: { item: any }) => (
    <View style={styles.card}>
      <View style={styles.cardHeader}>
        <View style={[styles.bankInfo, { flex: 1, marginRight: 10 }]}>
          <View style={styles.bankIconCircle}>
            <MaterialCommunityIcons name="bank" size={24} color={Colors.primary} />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={styles.bankName} numberOfLines={1}>
              {item.bankName || 'Bank Account'}
            </Text>
            <Text style={styles.accountHolder} numberOfLines={1}>
              {item.accountHolderName}
            </Text>
          </View>
        </View>
        <View style={{ alignItems: 'flex-end' }}>
          <View style={styles.typeBadge}>
            <Text style={styles.typeText}>{item.accountType || 'N/A'}</Text>
          </View>
          <TouchableOpacity style={[styles.editButton, { marginTop: 8 }]} onPress={() => handleEdit(item)}>
            <MaterialCommunityIcons name="pencil-outline" size={22} color={Colors.primary} />
          </TouchableOpacity>
        </View>
      </View>

      <View style={styles.cardDivider} />

      <View style={styles.cardFooter}>
        <View style={{ flex: 1 }}>
          <Text style={styles.label}>Account Number</Text>
          <Text style={styles.value} numberOfLines={1}>{item.accountNumber}</Text>
        </View>
        <View style={{ flex: 1, alignItems: 'flex-end' }}>
          <Text style={styles.label}>IFSC Code</Text>
          <Text style={styles.value} numberOfLines={1}>{item.ifscCode}</Text>
        </View>
      </View>

      <View style={styles.cardDivider} />
      <View style={styles.cardFooter}>
        <View style={{ flex: 1 }}>
          <Text style={styles.label}>Branch Name</Text>
          <Text style={styles.value} numberOfLines={1}>{item.branchName || 'N/A'}</Text>
        </View>
        <View style={{ flex: 1, alignItems: 'flex-end', marginLeft: 10 }}>
          <Text style={styles.label}>Branch Address</Text>
          <Text style={styles.value} numberOfLines={2}>{item.branchAddress || 'N/A'}</Text>
        </View>
      </View>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />
      <AppHeader title="Bank List" showBack={true} onBackPress={() => navigation.goBack()} />

      {isLoading && banks.length === 0 ? (
        <ListSkeleton />
      ) : (
        <>
          <View style={styles.searchContainer}>
            <View style={styles.searchRow}>
              <View style={styles.searchBar}>
                <MaterialCommunityIcons name="magnify" size={20} color={Colors.textSecondary} />
                <TextInput
                  placeholder="Search by account or name..."
                  style={styles.searchInput}
                  value={searchQuery}
                  onChangeText={(text) => setSearchQuery(text)}
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
                  {/* Fixed: Passed down state management control hooks */}
                  {/* <DropdownSelector
                    label="Bank Name"
                    value={filterFields.bankId}
                    options={bankDropdownList}
                    onSelect={(id: number) => handleDropdownSelect('bankId', id)}
                    dropdownId="bank"
                    placeholder="Select Bank"
                    activeDropdown={activeDropdown}
                    setActiveDropdown={setActiveDropdown}
                    dropdownSearch={dropdownSearch}
                    setDropdownSearch={setDropdownSearch}
                  /> */}

                  {/* Fixed: Passed down state management control hooks */}
                  {/* <DropdownSelector
                    label="Account Type"
                    value={filterFields.accountTypeId}
                    options={accountTypeList}
                    onSelect={(id: number) => handleDropdownSelect('accountTypeId', id)}
                    dropdownId="type"
                    placeholder="Select Type"
                    activeDropdown={activeDropdown}
                    setActiveDropdown={setActiveDropdown}
                    dropdownSearch={dropdownSearch}
                    setDropdownSearch={setDropdownSearch}
                  /> */}

                  <View style={styles.filterInputGroup}>
                    <Text style={styles.filterLabel}>Account Number</Text>
                    <View style={styles.filterInputWrapper}>
                      <TextInput
                        style={styles.filterInput}
                        placeholder="Enter account number"
                        value={filterFields.accountNumber}
                        onChangeText={(v) => updateFilterField('accountNumber', v)}
                        keyboardType="numeric"
                        placeholderTextColor={Colors.textMuted}
                      />
                    </View>
                  </View>

                  <View style={styles.filterInputGroup}>
                    <Text style={styles.filterLabel}>Holder Name</Text>
                    <View style={styles.filterInputWrapper}>
                      <TextInput
                        style={styles.filterInput}
                        placeholder="Enter holder name"
                        value={filterFields.accountHolderName}
                        onChangeText={(v) => updateFilterField('accountHolderName', v)}
                        placeholderTextColor={Colors.textMuted}
                      />
                    </View>
                  </View>

                  <View style={styles.filterInputGroup}>
                    <Text style={styles.filterLabel}>IFSC Code</Text>
                    <View style={styles.filterInputWrapper}>
                      <TextInput
                        style={styles.filterInput}
                        placeholder="Enter IFSC code"
                        value={filterFields.ifscCode}
                        onChangeText={(v) => updateFilterField('ifscCode', v)}
                        autoCapitalize="characters"
                        placeholderTextColor={Colors.textMuted}
                      />
                    </View>
                  </View>

                </View>

                <View style={styles.filterActions}>
                  <TouchableOpacity style={styles.clearButton} onPress={handleClearFilter} activeOpacity={0.7}>
                    <Text style={styles.clearButtonText}>Clear</Text>
                  </TouchableOpacity>
                  <TouchableOpacity style={styles.applyButton} onPress={handleApplyFilter} activeOpacity={0.7}>
                    <Text style={styles.applyButtonText}>Apply Filters</Text>
                  </TouchableOpacity>
                </View>
              </ScrollView>
            </View>
          )}

          <FlatList
            data={banks}
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
                  <MaterialCommunityIcons name="bank-off-outline" size={64} color="#E0E0E0" />
                  <Text style={styles.emptyText}>No banks found</Text>
                </View>
              ) : null
            }
          />
        </>
      )}

      {isModalVisible && (
        <AddBankModal
          isVisible={isModalVisible}
          initialData={selectedBank}
          onClose={() => {
            setIsModalVisible(false);
            setSelectedBank(null);
            fetchBanks(1, true);
          }}
        />
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F8F9FA' },
  searchContainer: { paddingHorizontal: 20, paddingVertical: 15, backgroundColor: '#FFFFFF' },
  searchRow: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  searchBar: { flex: 1, flexDirection: 'row', alignItems: 'center', backgroundColor: '#F3F4F6', borderRadius: 12, paddingHorizontal: 12, height: 45 },
  searchInput: { flex: 1, marginLeft: 8, fontSize: 16, color: Colors.textDark, padding: 0, fontFamily: Poppins.bold },

  filterButton: { width: 45, height: 45, borderRadius: 12, backgroundColor: Colors.primary + '15', justifyContent: 'center', alignItems: 'center', borderWidth: 1, borderColor: Colors.primary + '30' },
  filterButtonActive: { backgroundColor: Colors.primary, borderColor: Colors.primary },
  filterBadge: { position: 'absolute', top: -4, right: -4, backgroundColor: Colors.error, borderRadius: 10, width: 18, height: 18, justifyContent: 'center', alignItems: 'center' },
  filterBadgeText: { fontSize: 12, color: '#FFFFFF', fontFamily: Poppins.bold },

  filterPanel: { backgroundColor: '#FFFFFF', marginHorizontal: 16, marginTop: 4, marginBottom: 8, borderRadius: 16, padding: 16, elevation: 3, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.08, shadowRadius: 10, borderWidth: 1, borderColor: Colors.primary + '15', maxHeight: 500 },
  filterHeader: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 16 },
  filterTitle: { fontSize: 16, color: Colors.textDark, fontFamily: Poppins.bold },

  filterGrid: { gap: 12 },
  filterInputGroup: { gap: 6 },
  filterLabel: { fontSize: 12, color: Colors.textSecondary, textTransform: 'uppercase', letterSpacing: 0.5, fontFamily: Poppins.bold },

  filterInputWrapper: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#F8F9FA', borderRadius: 10, borderWidth: 1, borderColor: '#E5E7EB', paddingHorizontal: 12, height: 44, gap: 8 },
  filterInput: { flex: 1, fontSize: 16, color: Colors.textDark, padding: 0, fontFamily: Poppins.bold },

  filterActions: { flexDirection: 'row', justifyContent: 'flex-end', alignItems: 'center', gap: 12, marginTop: 20, paddingTop: 16, borderTopWidth: 1, borderTopColor: '#F3F4F6' },
  clearButton: { paddingHorizontal: 16, paddingVertical: 10, borderRadius: 10, backgroundColor: Colors.error + '10' },
  clearButtonText: { fontSize: 12, color: Colors.error, fontFamily: Poppins.bold },

  applyButton: { paddingHorizontal: 20, paddingVertical: 10, borderRadius: 10, backgroundColor: Colors.primary },
  applyButtonText: { fontSize: 12, color: '#FFFFFF', fontFamily: Poppins.bold },

  listContent: { padding: 20, paddingBottom: 40 },
  card: { backgroundColor: '#FFFFFF', borderRadius: 16, padding: 16, marginBottom: 16, elevation: 2, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 8 },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' },
  bankInfo: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  bankIconCircle: { width: 44, height: 44, borderRadius: 22, backgroundColor: Colors.primary + '15', justifyContent: 'center', alignItems: 'center' },
  bankName: { fontSize: 16, color: Colors.textDark, fontFamily: Poppins.bold },

  accountHolder: { fontSize: 12, color: Colors.textSecondary, marginTop: 2, fontFamily: Poppins.bold },

  editButton: { padding: 4 },
  typeBadge: { backgroundColor: '#F3F4F6', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 8 },
  typeText: { fontSize: 12, color: Colors.textSecondary, textTransform: 'uppercase', fontFamily: Poppins.bold },

  cardDivider: { height: 1, backgroundColor: '#F3F4F6', marginVertical: 12 },
  cardFooter: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  label: { fontSize: 12, color: Colors.textSecondary, textTransform: 'uppercase', letterSpacing: 0.5, fontFamily: Poppins.bold },

  value: { fontSize: 16, color: Colors.textDark, marginTop: 2, fontFamily: Poppins.bold },

  emptyContainer: { alignItems: 'center', justifyContent: 'center', marginTop: 100 },
  emptyText: { marginTop: 12, fontSize: 16, color: Colors.textSecondary, fontFamily: Poppins.bold },

});

export default BankListScreen;
