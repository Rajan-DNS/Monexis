import React, { useState, useEffect, useMemo, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  FlatList,
  Modal,
  ActivityIndicator,
  StatusBar,
  Dimensions,
  Alert,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import Ionicons from 'react-native-vector-icons/Ionicons';
import Colors from '../../../../../theme/colors';
import AppHeader from '../../../../../components/Header/AppHeader';
import { RootStackParamList } from '../../../../../navigation/RootNavigator';
import { BeneficiaryService } from '../../../../../redux/services/RetailerServices/Beneficiary/BeneficiaryService';
import Add_Beneficiary from './Add_Beneficiary';
import BeneficiaryCard from './BeneficiaryCard';
import { Poppins } from '../../../../../theme/typography';

const { width } = Dimensions.get('window');

const Add_BeneficiaryList: React.FC = () => {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const {
    fetchBeneficiaryList,
    deleteBeneficiary,
    isGetListLoading,
    isUpdateStatusLoading,
  } = BeneficiaryService();

  // State Management
  const [beneficiaries, setBeneficiaries] = useState<any[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [debouncedSearchQuery, setDebouncedSearchQuery] = useState('');

  // Filters Panel State
  const [showFilters, setShowFilters] = useState(false);
  const [filterMobile, setFilterMobile] = useState('');
  const [filterAccount, setFilterAccount] = useState('');
  const [filterName, setFilterName] = useState('');
  const [filterIFSC, setFilterIFSC] = useState('');

  // Applied filters (only updated when Find button is clicked)
  const [appliedFilters, setAppliedFilters] = useState({
    mobile: '',
    account: '',
    name: '',
    ifsc: '',
  });

  // Modals Toggles
  const [isAddEditVisible, setIsAddEditVisible] = useState(false);
  const [selectedBeneficiary, setSelectedBeneficiary] = useState<any>(null);
  const [isDeleteModalVisible, setIsDeleteModalVisible] = useState(false);
  const [beneficiaryToDelete, setBeneficiaryToDelete] = useState<any>(null);

  // Card Expand Collapse Tracker (holds IDs of expanded cards)
  const [expandedCards, setExpandedCards] = useState<Record<number, boolean>>({});

  // Debounce search query
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearchQuery(searchQuery);
    }, 500); // 500ms debounce delay

    return () => clearTimeout(timer);
  }, [searchQuery]);

  // Fetch list from API when applied filters or debounced search changes
  useEffect(() => {
    loadData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [appliedFilters.mobile, appliedFilters.account, appliedFilters.name, appliedFilters.ifsc]);

  const loadData = async () => {
    try {
      const filters: any = {};

      if (appliedFilters.mobile) filters.mobileNumber = appliedFilters.mobile;
      if (appliedFilters.account) filters.accountNumber = appliedFilters.account;
      if (appliedFilters.name) filters.accountHolderName = appliedFilters.name;
      if (appliedFilters.ifsc) filters.ifscCode = appliedFilters.ifsc;

      const response = await fetchBeneficiaryList(1, 100, filters);

      if (response.success && response.data) {
        const dataArray = Array.isArray(response.data) ? response.data : [];
        setBeneficiaries(dataArray);
      } else {
        setBeneficiaries([]);
      }
    } catch (error) {
      console.warn('Failed to load beneficiaries:', error);
      setBeneficiaries([]);
    }
  };

  // Apply filters when Find button is clicked
  const handleFindClick = useCallback(() => {
    setAppliedFilters({
      mobile: filterMobile,
      account: filterAccount,
      name: filterName,
      ifsc: filterIFSC,
    });
  }, [filterMobile, filterAccount, filterName, filterIFSC]);

  // Memoized filtered list based on debounced search query
  const filteredList = useMemo(() => {
    if (!debouncedSearchQuery) {
      return beneficiaries;
    }

    const q = debouncedSearchQuery.toLowerCase();
    return beneficiaries.filter(
      (item) =>
        (item.bankName || '').toLowerCase().includes(q) ||
        (item.accountHolderName || '').toLowerCase().includes(q) ||
        (item.accountNumber || '').includes(q) ||
        (item.mobileNumber || '').includes(q) ||
        (item.ifscCode || '').toLowerCase().includes(q)
    );
  }, [beneficiaries, debouncedSearchQuery]);

  const toggleExpand = useCallback((id: number) => {
    setExpandedCards((prev) => ({
      ...prev,
      [id]: !prev[id],
    }));
  }, []);

  const handleEditPress = useCallback((item: any) => {
    setSelectedBeneficiary(item);
    setIsAddEditVisible(true);
  }, []);

  const handleDeletePress = useCallback((item: any) => {
    setBeneficiaryToDelete(item);
    setIsDeleteModalVisible(true);
  }, []);

  const confirmDelete = async () => {
    if (beneficiaryToDelete) {
      try {
        const response = await deleteBeneficiary(beneficiaryToDelete.id);

        if (response.success) {
          Alert.alert('Success', 'Beneficiary deleted successfully');
          setIsDeleteModalVisible(false);
          setBeneficiaryToDelete(null);
          loadData(); // Reload the list
        } else {
          Alert.alert('Error', response.message || 'Failed to delete beneficiary');
        }
      } catch (error) {
        Alert.alert('Error', 'Failed to delete beneficiary');
      }
    }
  };

  const clearFilters = useCallback(() => {
    setFilterMobile('');
    setFilterAccount('');
    setFilterName('');
    setFilterIFSC('');
    setAppliedFilters({
      mobile: '',
      account: '',
      name: '',
      ifsc: '',
    });
    setSearchQuery('');
    setShowFilters(false);
  }, []);

  const maskCardNumber = useCallback((number: string) => {
    if (!number) return '**** **** ****';
    const clean = number.replace(/\s?/g, '');
    if (clean.length < 4) return clean;
    return `**** **** ${clean.slice(-4)}`;
  }, []);

  const getBankIconColor = useCallback((bankName: string) => {
    const name = (bankName || '').toLowerCase();
    if (name.includes('hdfc')) return { bg: '#F0F5FF', icon: '#0056D2' };
    if (name.includes('icici')) return { bg: '#E6F4EA', icon: '#137333' };
    if (name.includes('state') || name.includes('sbi')) return { bg: '#E8F0FE', icon: '#1A73E8' };
    return { bg: '#F1F3F4', icon: '#5F6368' };
  }, []);

  // Memoized render item for better performance
  const renderCard = useCallback(({ item }: { item: any }) => {
    const isExpanded = expandedCards[item.id] || false;
    const colors = getBankIconColor(item.bankName);

    return (
      <BeneficiaryCard
        item={item}
        isExpanded={isExpanded}
        colors={colors}
        onToggleExpand={toggleExpand}
        onEdit={handleEditPress}
        onDelete={handleDeletePress}
        maskCardNumber={maskCardNumber}
      />
    );
  }, [expandedCards, getBankIconColor, toggleExpand, handleEditPress, handleDeletePress, maskCardNumber]);

  // Memoized key extractor
  const keyExtractor = useCallback((item: any) => item.id?.toString() || Math.random().toString(), []);

  return (
    <View style={[styles.container, { backgroundColor: Colors.bgLightest }]}>
      <StatusBar barStyle="dark-content" backgroundColor={Colors.bgLightest} />
      <AppHeader
        title="Beneficiary List"
        showBack
        onBackPress={() => navigation.goBack()}
      />

      {/* Search Header */}
      <View style={styles.searchSection}>
        <View style={styles.searchBar}>
          <Ionicons name="search" size={20} color="#8F9BB3" style={styles.searchIcon} />
          <TextInput
            style={styles.searchInput}
            placeholder="Search by Mobile, Account Number or Name..."
            placeholderTextColor="#8F9BB3"
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity onPress={() => setSearchQuery('')}>
              <MaterialIcons name="close" size={20} color="#8F9BB3" />
            </TouchableOpacity>
          )}
        </View>
        <TouchableOpacity
          style={[styles.filterButton, showFilters && styles.filterButtonActive]}
          activeOpacity={0.8}
          onPress={() => setShowFilters(!showFilters)}
        >
          <MaterialCommunityIcons
            name="filter-variant"
            size={24}
            color={showFilters ? Colors.white : Colors.textDark}
          />
        </TouchableOpacity>
      </View>

      {/* Advanced Collapsible Filters */}
      {showFilters && (
        <View style={styles.filtersPanel}>
          <View style={styles.filterHeader}>
            <Text style={styles.filterTitle}>Filter List</Text>
            <TouchableOpacity onPress={clearFilters}>
              <Text style={[styles.clearAllText, { color: Colors.primary }]}>Clear All ×</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.filterForm}>
            {/* Row 1 */}
            <View style={styles.filterRow}>
              <View style={styles.filterGroupHalf}>
                <Text style={styles.filterLabel}>Mobile Number</Text>
                <TextInput
                  style={styles.filterInput}
                  placeholder="e.g. 9876543210"
                  placeholderTextColor="#8F9BB3"
                  keyboardType="numeric"
                  maxLength={10}
                  value={filterMobile}
                  onChangeText={setFilterMobile}
                />
              </View>
              <View style={styles.filterGroupHalf}>
                <Text style={styles.filterLabel}>Account Number</Text>
                <TextInput
                  style={styles.filterInput}
                  placeholder="e.g. 1234567890"
                  placeholderTextColor="#8F9BB3"
                  keyboardType="numeric"
                  value={filterAccount}
                  onChangeText={setFilterAccount}
                />
              </View>
            </View>

            {/* Row 2 */}
            <View style={styles.filterRow}>
              <View style={styles.filterGroupHalf}>
                <Text style={styles.filterLabel}>Holder Name</Text>
                <TextInput
                  style={styles.filterInput}
                  placeholder="e.g. John Doe"
                  placeholderTextColor="#8F9BB3"
                  value={filterName}
                  onChangeText={setFilterName}
                />
              </View>
              <View style={styles.filterGroupHalf}>
                <Text style={styles.filterLabel}>IFSC Code</Text>
                <TextInput
                  style={styles.filterInput}
                  placeholder="e.g. SBIN0001234"
                  placeholderTextColor="#8F9BB3"
                  autoCapitalize="characters"
                  value={filterIFSC}
                  onChangeText={setFilterIFSC}
                />
              </View>
            </View>

            {/* Find Button */}
            <TouchableOpacity
              style={styles.findButton}
              onPress={handleFindClick}
              activeOpacity={0.8}
            >
              <MaterialIcons name="search" size={20} color="#FFF" style={{ marginRight: 8 }} />
              <Text style={styles.findButtonText}>Find</Text>
            </TouchableOpacity>
          </View>
        </View>
      )}

      {/* Link Header Title Row */}
      <View style={styles.bankLinkedHeader}>
        <Text style={[styles.bankLinkTitle, { color: Colors.textDark }]}>Bank Linked</Text>
        <Text style={[styles.bankLinkSubtitle, { color: Colors.primary }]}>
          {filteredList.length} ACCOUNTS LINKED
        </Text>
      </View>

      {/* List content */}
      {isGetListLoading || isUpdateStatusLoading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={Colors.primary} />
        </View>
      ) : (
        <FlatList
          data={filteredList}
          keyExtractor={keyExtractor}
          renderItem={renderCard}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          maxToRenderPerBatch={10}
          windowSize={10}
          removeClippedSubviews={true}
          initialNumToRender={10}
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <MaterialCommunityIcons name="folder-open-outline" size={60} color="#8F9BB3" />
              <Text style={styles.emptyText}>No beneficiaries found</Text>
            </View>
          }
        />
      )}

      <TouchableOpacity
        style={[styles.fab, { backgroundColor: Colors.primary || '#0056D2' }]}
        activeOpacity={0.8}
        onPress={() => {
          setSelectedBeneficiary(null);
          setIsAddEditVisible(true);
        }}
      >
        <MaterialCommunityIcons name="account-plus" size={26} color="white" />
      </TouchableOpacity>

      {/* Add / Edit Beneficiary Modal */}
      <Add_Beneficiary
        isVisible={isAddEditVisible}
        onClose={() => {
          setIsAddEditVisible(false);
          setSelectedBeneficiary(null);
        }}
        onSubmitSuccess={loadData}
        initialData={selectedBeneficiary}
      />

      {/* Delete Confirmation Modal */}
      <Modal
        visible={isDeleteModalVisible}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setIsDeleteModalVisible(false)}
      >
        <View style={styles.deleteModalContainer}>
          <View style={styles.deleteModalContent}>
            <TouchableOpacity
              style={styles.closeDeleteButton}
              onPress={() => setIsDeleteModalVisible(false)}
            >
              <MaterialIcons name="close" size={24} color="#8F9BB3" />
            </TouchableOpacity>

            <View style={styles.deleteWarningIcon}>
              <MaterialIcons name="warning" size={32} color="#C5221F" />
            </View>

            <Text style={styles.deleteTitle}>Delete Beneficiary</Text>
            <Text style={styles.deleteSubtitle}>
              Are you sure you want to delete this beneficiary? This action cannot be undone.
            </Text>

            <TouchableOpacity
              style={styles.deleteConfirmButton}
              activeOpacity={0.8}
              onPress={confirmDelete}
            >
              <MaterialIcons name="delete" size={20} color="white" style={{ marginRight: 8 }} />
              <Text style={styles.deleteConfirmText}>Yes, Delete</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.deleteCancelButton}
              activeOpacity={0.8}
              onPress={() => setIsDeleteModalVisible(false)}
            >
              <Text style={styles.deleteCancelText}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  searchSection: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    marginTop: 16,
    marginBottom: 12,
  },
  searchBar: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: Colors.divider,
    borderRadius: 16,
    height: 52,
    paddingHorizontal: 16,
    backgroundColor: Colors.white,
    marginRight: 12,
  },
  searchIcon: {
    marginRight: 10,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    fontFamily: Poppins.regular,
    color: '#1E293B',
    padding: 0,
  },
  filterButton: {
    width: 52,
    height: 52,
    borderRadius: 16,
    borderWidth: 1.5,
    borderColor: Colors.divider,
    backgroundColor: Colors.white,
    justifyContent: 'center',
    alignItems: 'center',
  },
  filterButtonActive: {
    backgroundColor: '#1E293B',
    borderColor: '#1E293B',
  },
  filtersPanel: {
    backgroundColor: Colors.white,
    marginHorizontal: 20,
    borderRadius: 20,
    padding: 16,
    borderWidth: 1.5,
    borderColor: Colors.divider,
    marginBottom: 16,
  },
  filterHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 14,
  },
  filterRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
    gap: 12, // Requires RN 0.71+; if older, use marginRight on the first item instead
  },
  filterGroupHalf: {
    flex: 1, // Ensures both inputs take equal space
  },
  filterLabel: {
    fontSize: 12,
    fontFamily: Poppins.bold,
    fontWeight: '700',
    color: Colors.textSecondary,
    marginBottom: 6,
    textTransform: 'uppercase',
  },
  filterInput: {
    borderWidth: 1.5,
    borderColor: Colors.divider,
    borderRadius: 12,
    height: 48, // Increased height for better touch target
    paddingHorizontal: 14,
    fontSize: 16,
    fontFamily: Poppins.regular,
    color: '#1E293B',
    backgroundColor: Colors.bgLightest,
  },
  filterTitle: {
    fontSize: 16,
    fontFamily: Poppins.bold,
    fontWeight: 'bold',
    color: '#1E293B',
  },
  clearAllText: {
    fontSize: 12,
    fontFamily: Poppins.bold,
    fontWeight: '700',
  },
  filterForm: {
    flexDirection: 'column',
  },
  filterGroup: {
    marginBottom: 12,
  },

  findButton: {
    flexDirection: 'row',
    backgroundColor: Colors.primary,
    height: 48,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 16,
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  findButtonText: {
    color: '#FFF',
    fontSize: 16,
    fontFamily: Poppins.bold,
    fontWeight: '700',
  },
  bankLinkedHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 24,
    marginBottom: 16,
    marginTop: 8,
  },
  bankLinkTitle: {
    fontSize: 16,
    fontFamily: Poppins.extraBold,
    fontWeight: '800',
  },
  bankLinkSubtitle: {
    fontSize: 12,
    fontFamily: Poppins.extraBold,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  listContent: {
    paddingHorizontal: 20,
    paddingBottom: 100,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 60,
  },
  emptyText: {
    color: '#8F9BB3',
    fontSize: 16,
    fontFamily: Poppins.semiBold,
    marginTop: 12,
    fontWeight: '600',
  },
  fab: {
    position: 'absolute',
    bottom: 24,
    right: 20,
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: Colors.shadow,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 6,
  },

  /* Delete Modal Styles */
  deleteModalContainer: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.4)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  deleteModalContent: {
    width: width * 0.85,
    backgroundColor: Colors.white,
    borderRadius: 24,
    padding: 24,
    alignItems: 'center',
  },
  closeDeleteButton: {
    position: 'absolute',
    top: 16,
    right: 16,
    padding: 4,
  },
  deleteWarningIcon: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#FCE8E6',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 18,
    marginTop: 10,
  },
  deleteTitle: {
    fontSize: 16,
    fontFamily: Poppins.bold,
    fontWeight: 'bold',
    color: '#1E293B',
    marginBottom: 8,
  },
  deleteSubtitle: {
    fontSize: 16,
    fontFamily: Poppins.regular,
    color: Colors.textSecondary,
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: 24,
    paddingHorizontal: 10,
  },
  deleteConfirmButton: {
    flexDirection: 'row',
    height: 48,
    width: '100%',
    borderRadius: 14,
    backgroundColor: '#C5221F',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  deleteConfirmText: {
    color: Colors.white,
    fontSize: 16,
    fontFamily: Poppins.bold,
    fontWeight: 'bold',
  },
  deleteCancelButton: {
    height: 48,
    width: '100%',
    borderRadius: 14,
    borderWidth: 1.5,
    borderColor: Colors.divider,
    justifyContent: 'center',
    alignItems: 'center',
  },
  deleteCancelText: {
    color: '#0056D2',
    fontSize: 16,
    fontFamily: Poppins.bold,
    fontWeight: 'bold',
  },
  bankTextContainer: {
    flex: 1,
    marginRight: 10,
  },
});

export default Add_BeneficiaryList;
