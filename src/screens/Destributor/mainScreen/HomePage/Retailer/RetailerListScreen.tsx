import { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  StatusBar,
  SafeAreaView,
  Image,
  TextInput,
  FlatList,
  ActivityIndicator,
  RefreshControl,
  Keyboard,
  Modal,
  ScrollView,
  LayoutAnimation,
} from 'react-native';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import Colors from '../../../../../theme/colors';
import { useAppSelector } from '../../../../../redux/hooks';
import AddRetailerModal from './AddRetailerModal';
import { RetailerSkeleton } from '../../../../../components/Skeleton';
import { useGetDropDownQuery, useGetdownlineuserListQuery } from '../../../../../redux/services/mainApi/Common/CommonApi';
import { useGetDistributorUserListQuery } from '../../../../../redux/services/mainApi/Retailer/RetailerApi';
import { buildRetailerFilterPayload } from '../../../../../redux/services/mainApi/Retailer/Payload';
import { DropdownSelector } from '../../../../../components/Filters/DropdownSelector';
import { Poppins } from '../../../../../theme/typography';

const RetailerListScreen = ({ navigation }: any) => {
  const user = useAppSelector((state: any) => state.auth.user);
  const listRef = useRef<FlatList>(null);

  // Pagination & Search States
  const [pageNumber, setPageNumber] = useState(1);
  const [searchQuery, setSearchQuery] = useState('');
  const [debouncedQuery, setDebouncedQuery] = useState('');
  const [retailersData, setRetailersData] = useState<any[]>([]);
  const [hasMore, setHasMore] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // Modal & Filter States
  const [isRetailerModalVisible, setIsRetailerModalVisible] = useState(false);
  const [selectedRetailer, setSelectedRetailer] = useState<any>(null);
  const [isFilterVisible, setIsFilterVisible] = useState(false);
  const [appliedFilters, setAppliedFilters] = useState({
    roleId: 0,
    roleName: 'All Roles',
    userRequestId: '',
  });
  const [tempFilters, setTempFilters] = useState({ ...appliedFilters });
  const [showRoleDropdown, setShowRoleDropdown] = useState(false);
  const [dropdownSearch, setDropdownSearch] = useState('');
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null);

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



  // Frontend Filter Logic
  const filteredRetailers = useMemo(() => {
    if (!searchQuery.trim()) return retailersData;
    const query = searchQuery.toLowerCase();
    return retailersData.filter((item: any) => {
      const name = (item.accountHolderName || item.fullName || item.name || '').toLowerCase();
      const shop = (item.shopName || '').toLowerCase();
      const mobile = (item.mobileNumber || item.mobile || item.contact || '').toLowerCase();
      const email = (item.email || '').toLowerCase();

      return (
        name.includes(query) ||
        shop.includes(query) ||
        mobile.includes(query) ||
        email.includes(query)
      );
    });
  }, [searchQuery, retailersData]);

  // Dropdown Data
  const { data: roleDropdownData } = useGetDropDownQuery('');
  console.log("roleDropdownData", roleDropdownData);


  const handleEditPress = (retailer: any) => {
    setSelectedRetailer(retailer);
    setIsRetailerModalVisible(true);
  };

  const handleAddPress = () => {
    setSelectedRetailer(null);
    setIsRetailerModalVisible(true);
  };

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedQuery(searchQuery);
      setPageNumber(1);
      setHasMore(true);
    }, 500);

    return () => clearTimeout(handler);
  }, [searchQuery]);

  const filterPayload = useMemo(() => {
    return buildRetailerFilterPayload(
      pageNumber,
      10,
      debouncedQuery,
      user?.userId || 0,
      {
        roleId: appliedFilters.roleId,
        userRequestId: appliedFilters.userRequestId
      }
    );
  }, [pageNumber, debouncedQuery, user?.userId, appliedFilters]);

  const { data, isLoading, isFetching, isError, refetch } =
    useGetDistributorUserListQuery(filterPayload);

  useEffect(() => {
    if (data) {
      const fetchedData = data?.data || data?.result || (Array.isArray(data) ? data : []);
      if (pageNumber === 1) {
        setRetailersData(fetchedData);
      } else {
        setRetailersData(prev => [...prev, ...fetchedData]);
      }
      setHasMore(fetchedData.length === 10);
    }
    setRefreshing(false);
  }, [data, pageNumber]);

  const onRefresh = () => {
    setRefreshing(true);
    setPageNumber(1);
    setHasMore(true);
    refetch();
  };

  const loadMore = () => {
    if (!isFetching && hasMore) {
      setPageNumber(prev => prev + 1);
    }
  };

  const applyFilters = () => {
    setAppliedFilters(tempFilters);
    setIsFilterVisible(false);
    setPageNumber(1);
    setHasMore(true);
  };

  const resetFilters = () => {
    const resetValues = {
      roleId: 0,
      roleName: 'All Roles',
      userRequestId: '',
    };
    setTempFilters(resetValues);
    setAppliedFilters(resetValues);
    setActiveDropdown(null);
    setDropdownSearch('');
    setIsFilterVisible(false);
    setPageNumber(1);
    setHasMore(true);
  };

  const renderRetailerCard = ({ item: retailer }: { item: any }) => (
    <View style={styles.card}>
      <View style={styles.cardHeader}>
        <View style={styles.headerContent}>
          <View style={styles.topRow}>
            <View style={{ flex: 1 }}>
              <Text style={styles.label}>RETAILER</Text>
              <Text style={styles.retailerName} numberOfLines={1}>
                {retailer.accountHolderName || retailer.fullName || retailer.name || 'Unknown'}
              </Text>
            </View>
            <View style={styles.verifiedBadge}>
              <MaterialCommunityIcons name="shield-check" size={18} color="white" />
            </View>
          </View>

          {/* Shop Name Section */}
          {retailer.shopName && (
            <View style={styles.shopSection}>
              <MaterialCommunityIcons name="store-outline" size={16} color="rgba(255, 255, 255, 0.8)" />
              <Text style={styles.shopNameText} numberOfLines={1}>{retailer.shopName}</Text>
            </View>
          )}

          <View style={styles.contactRow}>
            <View style={styles.contactItem}>
              <Text style={styles.labelSmall}>CONTACT</Text>
              <View style={styles.contactValue}>
                <MaterialIcons name="call" size={14} color="white" />
                <Text style={styles.valueText}>{retailer.mobileNumber || retailer.contact || 'N/A'}</Text>
              </View>
            </View>
            <View style={styles.contactItem}>
              <Text style={styles.labelSmall}>EMAIL</Text>
              <View style={styles.contactValue}>
                <MaterialIcons name="mail" size={14} color="white" />
                <Text style={styles.valueText} numberOfLines={1}>{retailer.email || 'N/A'}</Text>
              </View>
            </View>
          </View>

          {/* Address & State Section */}
          {(retailer.address || retailer.stateName) && (
            <View style={styles.addressSection}>
              <MaterialCommunityIcons name="map-marker-outline" size={14} color="rgba(255, 255, 255, 0.7)" />
              <Text style={styles.addressText} numberOfLines={1}>
                {retailer.address}{retailer.address && retailer.stateName ? ', ' : ''}{retailer.stateName}
              </Text>
            </View>
          )}
        </View>
      </View>

      <View style={styles.cardFooter}>
        <View>
          <Text style={styles.labelDark}>WALLET BALANCE</Text>
          <Text style={styles.balanceText}>{retailer.p2ABalance != null ? `₹${retailer.p2ABalance}` : '₹0.00'}</Text>
        </View>
        <TouchableOpacity
          style={styles.editButton}
          onPress={() => handleEditPress(retailer)}
        >
          <MaterialCommunityIcons name="pencil" size={16} color="#0056D2" />
          <Text style={styles.editText}>Edit</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" backgroundColor="white" />

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <MaterialIcons name="arrow-back" size={28} color="#000" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Retailer Lists</Text>
        <View style={styles.profileContainer}>
          <Image
            source={{ uri: 'https://i.pinimg.com/736x/da/59/64/da59647bd31dd524c09991cb89949804.jpg' }}
            style={styles.profileImage}
          />
        </View>
      </View>

      {isLoading && retailersData.length === 0 ? (
        <RetailerSkeleton />
      ) : (
        <>
          {/* Search Bar */}
          <View style={styles.searchSection}>
            <View style={styles.searchContainer}>
              <MaterialIcons name="search" size={24} color={Colors.textSecondary} style={styles.searchIcon} />
              <TextInput
                style={styles.searchInput}
                placeholder="Search by name or mobile..."
                value={searchQuery}
                onChangeText={setSearchQuery}
                placeholderTextColor={Colors.textMuted}
              />
            </View>
            {/* <TouchableOpacity
              style={[styles.filterButton, (appliedFilters.roleId !== 0 || appliedFilters.userRequestId !== '') && styles.filterActive]}
              onPress={() => {
                setTempFilters(appliedFilters);
                setIsFilterVisible(true);
              }}
            >
              <MaterialIcons name="filter-list" size={28} color={appliedFilters.roleId !== 0 || appliedFilters.userRequestId !== '' ? 'white' : Colors.primary} />
            </TouchableOpacity> */}
          </View>

          <FlatList
            ref={listRef}
            style={{ flex: 1 }}
            data={filteredRetailers}
            keyExtractor={(item, index) => item.id?.toString() || index.toString()}
            renderItem={renderRetailerCard}
            contentContainerStyle={styles.scrollContent}
            onEndReached={loadMore}
            onEndReachedThreshold={0.5}
            refreshControl={
              <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={[Colors.primary]} />
            }
            ListEmptyComponent={
              !isLoading && !isFetching ? (
                <View style={styles.emptyContainer}>
                  <MaterialCommunityIcons name="account-search" size={60} color={Colors.textMuted} />
                  <Text style={styles.emptyText}>No retailers found</Text>
                  {(searchQuery !== '' || appliedFilters.roleId !== 0 || appliedFilters.userRequestId !== '') && (
                    <TouchableOpacity onPress={() => { setSearchQuery(''); resetFilters(); }} style={styles.clearSearchButton}>
                      <Text style={styles.clearSearchText}>Clear All Filters</Text>
                    </TouchableOpacity>
                  )}
                </View>
              ) : null
            }
            ListFooterComponent={
              isFetching && pageNumber > 1 ? (
                <ActivityIndicator size="small" color={Colors.primary} style={{ marginVertical: 20 }} />
              ) : (
                <View style={{ height: 80 }} /> // Spacer for FAB
              )
            }
          />
        </>
      )}

      {/* Filter Modal */}
      <Modal
        visible={isFilterVisible}
        transparent
        animationType="slide"
        onRequestClose={() => setIsFilterVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.filterModalContent}>
            <View style={styles.filterHeader}>
              <Text style={styles.filterTitle}>Filter Retailers</Text>
              <TouchableOpacity onPress={() => setIsFilterVisible(false)}>
                <MaterialIcons name="close" size={24} color="#333" />
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.filterBody} showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">
              {/* Retailer Type Dropdown */}
              <DropdownSelector
                label="Retailer Type"
                value={tempFilters.roleId}
                options={[{ value: 0, text: 'All Roles' }, ...(roleDropdownData?.data || [])]}
                onSelect={(id: number) => {
                  const role = [{ value: 0, text: 'All Roles' }, ...(roleDropdownData?.data || [])].find(r => r.value === id);
                  setTempFilters({ ...tempFilters, roleId: id, roleName: role?.text || 'All Roles' });
                }}
                dropdownId="role"
                placeholder="Select Role"
              />

              {/* Retailer Name Dropdown */}
              <View style={{ marginTop: 20 }}>
                <DropdownSelector
                  label="Retailer Name"
                  value={tempFilters.userRequestId}
                  options={filteredRetailerOptions}
                  onSelect={(id: any) => setTempFilters({ ...tempFilters, userRequestId: id })}
                  dropdownId="retailer"
                  placeholder="Select Retailer"
                />
              </View>

              {/* User Request ID Input (Optional, keeping as manual entry too if needed, or remove) */}
              <View style={{ marginTop: 20 }}>
                <Text style={styles.inputLabel}>Manual Request ID</Text>
                <TextInput
                  style={styles.filterInput}
                  placeholder="Enter Request ID..."
                  value={tempFilters.userRequestId}
                  onChangeText={(text) => setTempFilters({ ...tempFilters, userRequestId: text })}
                  placeholderTextColor={Colors.textMuted}
                />
              </View>
            </ScrollView>

            <View style={styles.filterFooter}>
              <TouchableOpacity style={styles.resetButton} onPress={resetFilters}>
                <Text style={styles.resetButtonText}>Reset</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.applyButton} onPress={applyFilters}>
                <Text style={styles.applyButtonText}>Apply Filters</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* FAB for Adding Retailer */}
      <TouchableOpacity
        style={styles.fab}
        onPress={handleAddPress}
        activeOpacity={0.8}
      >
        <MaterialIcons name="person-add" size={28} color="white" />
      </TouchableOpacity>

      <AddRetailerModal
        isVisible={isRetailerModalVisible}
        initialData={selectedRetailer} // Pass the data as a prop
        onClose={() => {
          setIsRetailerModalVisible(false);
          setSelectedRetailer(null); // Reset after close
        }}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#F8F9FB',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 15,
    backgroundColor: 'white',
  },
  backButton: {
    marginRight: 15,
  },
  headerTitle: {
    flex: 1,
    fontSize: 20,
    fontFamily: Poppins.bold,
    fontWeight: 'bold',
    color: '#000',
  },
  profileContainer: {
    width: 45,
    height: 45,
    borderRadius: 22.5,
    overflow: 'hidden',
    borderWidth: 1.5,
    borderColor: '#E2E8F0',
  },
  profileImage: {
    width: '100%',
    height: '100%',
  },
  container: {
    flex: 1,
  },
  searchSection: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    marginTop: 15,
    marginBottom: 5,
  },
  searchContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'white',
    borderRadius: 12,
    paddingHorizontal: 15,
    elevation: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 5,
  },
  filterButton: {
    width: 50,
    height: 50,
    backgroundColor: 'white',
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 10,
    elevation: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 5,
  },
  filterActive: {
    backgroundColor: Colors.primary,
  },
  searchIcon: {
    marginRight: 10,
  },
  searchInput: {
    flex: 1,
    height: 50,
    fontSize: 16,
    fontFamily: Poppins.regular,
    color: '#000',
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 50,
  },
  emptyText: {
    fontSize: 16,
    fontFamily: Poppins.regular,
    color: '#94A3B8',
    marginTop: 10,
  },
  scrollContent: {
    padding: 20,
  },
  card: {
    backgroundColor: 'white',
    borderRadius: 20,
    marginBottom: 20,
    overflow: 'hidden',
    elevation: 0.3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
  },
  cardHeader: {
    backgroundColor: '#0056D2',
    padding: 20,
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
  },
  headerContent: {
    width: '100%',
  },
  label: {
    fontSize: 12,
    fontFamily: Poppins.bold,
    color: 'rgba(255, 255, 255, 0.7)',
    fontWeight: 'bold',
    letterSpacing: 1,
    marginBottom: 4,
  },
  labelSmall: {
    fontSize: 12,
    fontFamily: Poppins.semiBold,
    color: 'rgba(255, 255, 255, 0.6)',
    fontWeight: '600',
    marginBottom: 4,
  },
  topRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 10,
  },
  shopSection: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    alignSelf: 'flex-start',
  },
  shopNameText: {
    fontSize: 16,
    fontFamily: Poppins.semiBold,
    color: 'white',
    fontWeight: '600',
    marginLeft: 6,
  },
  addressSection: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 12,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.1)',
  },
  addressText: {
    fontSize: 12,
    fontFamily: Poppins.regular,
    color: 'rgba(255, 255, 255, 0.8)',
    marginLeft: 6,
    flex: 1,
  },
  nameRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 15,
  },
  retailerName: {
    fontSize: 16,
    fontFamily: Poppins.bold,
    fontWeight: 'bold',
    color: 'white',
  },
  verifiedBadge: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    padding: 6,
    borderRadius: 10,
  },
  contactRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  contactItem: {
    flex: 0.48,
  },
  contactValue: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  valueText: {
    fontSize: 12,
    fontFamily: Poppins.medium,
    color: 'white',
    marginLeft: 6,
    fontWeight: '500',
  },
  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
  },
  labelDark: {
    fontSize: 12,
    fontFamily: Poppins.bold,
    color: '#94A3B8',
    fontWeight: 'bold',
    letterSpacing: 0.5,
    marginBottom: 4,
  },
  balanceText: {
    fontSize: 20,
    fontFamily: Poppins.bold,
    fontWeight: 'bold',
    color: '#0F172A',
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',

  },
  statusText: {
    fontSize: 12,
    fontFamily: Poppins.bold,
    fontWeight: 'bold',
    marginLeft: 4,
  },
  editButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#E0E7FF', // Light blue background
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: Colors.primary,
  },
  editText: {
    fontSize: 12,
    fontFamily: Poppins.bold,
    color: Colors.primary,
    fontWeight: 'bold',
    marginLeft: 4,
  },
  fab: {
    position: 'absolute',
    right: 20,
    bottom: 30,
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#0056D2',
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 5,
  },
  clearSearchButton: {
    marginTop: 15,
    paddingHorizontal: 20,
    paddingVertical: 10,
    backgroundColor: '#E2E8F0',
    borderRadius: 20,
  },
  clearSearchText: {
    color: '#475569',
    fontWeight: '600',
  },
  avatarContainer: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 10,
  },
  avatarText: {
    color: 'white',
    fontSize: 20,
    fontFamily: Poppins.bold,
    fontWeight: 'bold',
  },
  nameSection: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  filterModalContent: {
    backgroundColor: 'white',
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
    padding: 24,
    maxHeight: '80%',
  },
  filterHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 24,
  },
  filterTitle: {
    fontSize: 20,
    fontFamily: Poppins.bold,
    fontWeight: 'bold',
    color: '#1E293B',
  },
  filterBody: {
    marginBottom: 24,
  },
  inputLabel: {
    fontSize: 16,
    fontFamily: Poppins.semiBold,
    fontWeight: '600',
    color: '#64748B',
    marginBottom: 8,
  },
  filterInput: {
    backgroundColor: '#F1F5F9',
    borderRadius: 12,
    paddingHorizontal: 16,
    height: 50,
    fontSize: 16,
    fontFamily: Poppins.regular,
    color: '#1E293B',
  },
  dropdownTrigger: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#F1F5F9',
    borderRadius: 12,
    paddingHorizontal: 16,
    height: 50,
  },
  dropdownValue: {
    fontSize: 16,
    fontFamily: Poppins.regular,
    color: '#1E293B',
  },
  dropdownContent: {
    marginTop: 8,
    backgroundColor: '#F8FAFC',
    borderRadius: 12,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  dropdownItem: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  dropdownItemText: {
    fontSize: 16,
    fontFamily: Poppins.regular,
    color: '#334155',
  },
  filterFooter: {
    flexDirection: 'row',
    gap: 12,
  },
  resetButton: {
    flex: 1,
    height: 50,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  resetButtonText: {
    fontSize: 16,
    fontFamily: Poppins.semiBold,
    fontWeight: '600',
    color: '#64748B',
  },
  applyButton: {
    flex: 2,
    height: 50,
    backgroundColor: Colors.primary,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  applyButtonText: {
    fontSize: 16,
    fontFamily: Poppins.semiBold,
    fontWeight: '600',
    color: 'white',
  },
  activeDropdownBorder: {
    borderColor: Colors.primary,
    borderWidth: 1.5,
  },
  inlineDropdownList: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    marginTop: 8,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    overflow: 'hidden',
  },
  dropdownSearchInput: {
    height: 45,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
    paddingHorizontal: 15,
    fontSize: 16,
    fontFamily: Poppins.regular,
    color: '#1E293B',
  },
  inlineDropdownItem: {
    padding: 15,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: '#F8FAFC',
  },
  inlineDropdownText: {
    fontSize: 16,
    fontFamily: Poppins.regular,
    color: '#334155',
  },
  selectedDropdownText: {
    color: Colors.primary,
    fontWeight: '700',
  },
  noOptionsText: {
    padding: 20,
    textAlign: 'center',
    color: Colors.textMuted,
    fontSize: 16,
    fontFamily: Poppins.regular,
  },
});

export default RetailerListScreen;
