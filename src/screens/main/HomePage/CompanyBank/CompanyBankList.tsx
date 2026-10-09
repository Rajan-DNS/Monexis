import React, { useEffect, useState } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  FlatList, 
  ActivityIndicator, 
  TouchableOpacity,
  TextInput,
  ScrollView,
  LayoutAnimation,
  Platform
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import { RootStackParamList } from '../../../../navigation/RootNavigator';
import { Colors, Spacing } from '../../../../theme';
import { Poppins } from '../../../../theme/typography';
import { useParentBankAccountDataMutation } from '../../../../redux/services/mainApi/Top_upService/TopupApi';

const INITIAL_FILTER = {
  accountNumber: '',
  accountHolderName: '',
  ifscCode: '',
  mobileNumber: '',
};

const CompanyBankList: React.FC = () => {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const [getBankAccountList, { isLoading }] = useParentBankAccountDataMutation();
  const [banks, setBanks] = useState<any[]>([]);
  
  // Filter States
  const [showFilter, setShowFilter] = useState(false);
  const [filterFields, setFilterFields] = useState(INITIAL_FILTER);
  const [appliedFilter, setAppliedFilter] = useState<any>({});
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    fetchBanks();
  }, []);

  const fetchBanks = async (customFilter?: any) => {
    try {
      const currentFilter = customFilter !== undefined ? customFilter : appliedFilter;
      
      const payload = {
        pageNumber: 1,
        pageSize: 100,
        filter: {
          accountNumber: currentFilter.accountNumber || "",
          accountHolderName: currentFilter.accountHolderName || "",
          ifscCode: currentFilter.ifscCode || "",
          mobileNumber: currentFilter.mobileNumber || "",
          lapuNumber: "",
          email: "",
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
          paymentReferenceNumber: "",
          remark: "",
          dealerId: 0,
          transactionId: 0,
          ourRequestId: "",
          userRequestId: "",
          fromDate: "",
          toDate: "",
          isApproved: 0
        }
      };
      
      const res = await getBankAccountList(payload).unwrap();
      
      if (res?.success && res?.data && Array.isArray(res.data)) {
        // Apply local search filter on bank name if search query exists
        let filteredData = res.data;
        if (searchQuery.trim()) {
          filteredData = res.data.filter((bank: any) => 
            bank.bankName?.toLowerCase().includes(searchQuery.toLowerCase())
          );
        }
        setBanks(filteredData);
      }
    } catch (error) {
      console.error('Failed to fetch company banks', error);
      setBanks([]);
    }
  };

  // Debounced search
  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      fetchBanks();
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

  const updateFilterField = (field: string, value: string) => {
    setFilterFields(prev => ({ ...prev, [field]: value }));
  };

  const handleApplyFilter = () => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setAppliedFilter(filterFields);
    fetchBanks(filterFields);
    setShowFilter(false);
  };

  const handleClearFilter = () => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setFilterFields(INITIAL_FILTER);
    setAppliedFilter({});
    setSearchQuery('');
    fetchBanks({});
    setShowFilter(false);
  };

  const activeFilterCount = Object.values(appliedFilter).filter(v => v !== '' && v !== undefined).length;

  const renderBankCard = ({ item }: { item: any }) => {
    return (
      <View style={styles.card}>
        <View style={styles.cardHeader}>
          <MaterialCommunityIcons name="bank" size={24} color={Colors.primary} />
          <Text style={styles.bankName}>{item.bankName || 'Bank Name'}</Text>
        </View>
        <View style={styles.cardBody}>
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Account Name:</Text>
            <Text style={styles.detailValue}>{item.accountHolderName || item.accountName || 'N/A'}</Text>
          </View>
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Account No:</Text>
            <Text style={styles.detailValue}>{item.accountNumber || 'N/A'}</Text>
          </View>
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>IFSC Code:</Text>
            <Text style={styles.detailValue}>{item.ifscCode || 'N/A'}</Text>
          </View>
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Branch:</Text>
            <Text style={styles.detailValue}>{item.branchName || 'N/A'}</Text>
          </View>
        </View>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <MaterialCommunityIcons name="arrow-left" size={24} color="#000" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Company Bank Accounts</Text>
      </View>

      {/* Search and Filter Bar */}
      <View style={styles.searchContainer}>
        <View style={styles.searchRow}>
          <View style={styles.searchBar}>
            <MaterialCommunityIcons name="magnify" size={20} color={Colors.textSecondary} />
            <TextInput
              placeholder="Search by bank name"
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

      {/* Filter Panel */}
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
              {/* Account Number */}
              <View style={styles.filterInputGroup}>
                <Text style={styles.filterLabel}>Account Number</Text>
                <TextInput
                  style={styles.filterInput}
                  placeholder="Enter account number"
                  value={filterFields.accountNumber}
                  onChangeText={(text) => updateFilterField('accountNumber', text)}
                  placeholderTextColor={Colors.textMuted}
                />
              </View>

              {/* Account Holder Name */}
              <View style={styles.filterInputGroup}>
                <Text style={styles.filterLabel}>Account Holder Name</Text>
                <TextInput
                  style={styles.filterInput}
                  placeholder="Enter account holder name"
                  value={filterFields.accountHolderName}
                  onChangeText={(text) => updateFilterField('accountHolderName', text)}
                  placeholderTextColor={Colors.textMuted}
                />
              </View>

              {/* IFSC Code */}
              <View style={styles.filterInputGroup}>
                <Text style={styles.filterLabel}>IFSC Code</Text>
                <TextInput
                  style={styles.filterInput}
                  placeholder="Enter IFSC code"
                  value={filterFields.ifscCode}
                  onChangeText={(text) => updateFilterField('ifscCode', text)}
                  placeholderTextColor={Colors.textMuted}
                  autoCapitalize="characters"
                />
              </View>

              {/* Mobile Number */}
              <View style={styles.filterInputGroup}>
                <Text style={styles.filterLabel}>Mobile Number</Text>
                <TextInput
                  style={styles.filterInput}
                  placeholder="Enter mobile number"
                  value={filterFields.mobileNumber}
                  onChangeText={(text) => updateFilterField('mobileNumber', text)}
                  placeholderTextColor={Colors.textMuted}
                  keyboardType="phone-pad"
                  maxLength={10}
                />
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

      {isLoading ? (
        <View style={styles.loaderContainer}>
          <ActivityIndicator size="large" color={Colors.primary} />
        </View>
      ) : (
        <FlatList
          data={banks}
          keyExtractor={(item, index) => item.id?.toString() || index.toString()}
          renderItem={renderBankCard}
          contentContainerStyle={styles.listContainer}
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <MaterialCommunityIcons name="bank-off-outline" size={64} color="#E0E0E0" />
              <Text style={styles.emptyText}>No company banks found</Text>
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
    backgroundColor: '#F5F7FA',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: Spacing.md,
    backgroundColor: Colors.white,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  backBtn: {
    padding: Spacing.sm,
    marginRight: Spacing.sm,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#000',
    fontFamily: Poppins.bold,
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
    gap: 12,
  },
  searchBar: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F3F4F6',
    borderRadius: 12,
    paddingHorizontal: 12,
    height: 48,
  },
  searchInput: {
    flex: 1,
    marginLeft: 8,
    fontSize: 16,
    color: Colors.textDark,
    fontFamily: Poppins.regular,
  },
  filterButton: {
    width: 48,
    height: 48,
    borderRadius: 12,
    backgroundColor: '#F3F4F6',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  filterButtonActive: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
  },
  filterBadge: {
    position: 'absolute',
    top: -5,
    right: -5,
    backgroundColor: '#FF3B30',
    width: 18,
    height: 18,
    borderRadius: 9,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#FFFFFF',
  },
  filterBadgeText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontFamily: Poppins.bold,
  },
  filterPanel: {
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
    maxHeight: 400,
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
    color: Colors.textDark,
    fontFamily: Poppins.bold,
  },
  filterGrid: {
    paddingHorizontal: 20,
  },
  filterInputGroup: {
    marginBottom: 15,
  },
  filterLabel: {
    fontSize: 12,
    color: Colors.textSecondary,
    marginBottom: 8,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    fontFamily: Poppins.semiBold,
  },
  filterInput: {
    backgroundColor: '#F9FAFB',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 10,
    paddingHorizontal: 12,
    height: 44,
    fontSize: 16,
    color: Colors.textDark,
    fontFamily: Poppins.regular,
  },
  filterActions: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    paddingTop: 10,
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
    color: Colors.textSecondary,
    fontFamily: Poppins.semiBold,
  },
  applyButton: {
    flex: 2,
    height: 48,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: Colors.primary,
  },
  applyButtonText: {
    fontSize: 16,
    color: '#FFFFFF',
    fontFamily: Poppins.bold,
  },
  loaderContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  listContainer: {
    padding: Spacing.md,
  },
  card: {
    backgroundColor: Colors.white,
    borderRadius: 12,
    padding: Spacing.md,
    marginBottom: Spacing.md,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: Colors.borderLight,
    paddingBottom: Spacing.sm,
    marginBottom: Spacing.sm,
  },
  bankName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: Colors.textDark,
    marginLeft: Spacing.sm,
    fontFamily: Poppins.bold,
  },
  cardBody: {},
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: Spacing.xs,
  },
  detailLabel: {
    fontSize: 14,
    color: Colors.textMuted,
    flex: 1,
    fontFamily: Poppins.regular,
  },
  detailValue: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.textDark,
    flex: 1,
    textAlign: 'right',
    fontFamily: Poppins.semiBold,
  },
  emptyContainer: {
    alignItems: 'center',
    padding: Spacing.xl,
    marginTop: 50,
  },
  emptyText: {
    fontSize: 16,
    color: Colors.textMuted,
    marginTop: 12,
    fontFamily: Poppins.regular,
  },
});

export default CompanyBankList;
