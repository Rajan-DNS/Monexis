import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  RefreshControl,
  SafeAreaView,
  StatusBar,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import AppHeader from '../../../components/Header/AppHeader';
import { useGetcommisionrangMutation } from '../../../redux/services/mainApi/Common/CommonApi';
import Colors from '../../../theme/colors';
import { FontSize, Radius, Spacing } from '../../../theme/spacing';
import { Poppins } from '../../../theme/typography';

type CommissionRangeRow = {
  id: string;
  so: string;
  operatorName: string;
  circleName: string;
  gstName: string;
  slabRange: string;
  p2pCommission: string;
  commissionName: string;
  amountType: string;
  amount: string;
};

const pickValue = (item: any, keys: string[], fallback = '-') => {
  for (const key of keys) {
    const value = item?.[key];
    if (value !== undefined && value !== null && value !== '') {
      return String(value);
    }
  }
  return fallback;
};

const unwrapList = (response: any): any[] => {
  const candidates = [
    response,
    response?.data,
    response?.data?.data,
    response?.data?.result,
    response?.data?.items,
    response?.result,
    response?.items,
    response?.list,
  ];

  for (const candidate of candidates) {
    if (Array.isArray(candidate)) {
      return candidate;
    }
  }

  return [];
};

const buildSlabRange = (item: any) => {
  const directRange = pickValue(item, ['slabRange', 'salbReng', 'slabReng', 'range', 'amountRange'], '');
  if (directRange) {
    return directRange;
  }

  const fromAmount = pickValue(item, ['fromAmount', 'minAmount', 'startAmount', 'slabFrom'], '');
  const toAmount = pickValue(item, ['toAmount', 'maxAmount', 'endAmount', 'slabTo'], '');

  if (fromAmount && toAmount) {
    return `${fromAmount} - ${toAmount}`;
  }

  return fromAmount || toAmount || '-';
};

const normalizeRows = (response: any): CommissionRangeRow[] =>
  unwrapList(response).map((item, index) => ({
    id: pickValue(item, ['id', 'commissionRangeId', 'packageCommissionRangeId'], `${index}`),
    so: pickValue(item, ['so', 'sO', 'serviceOperator', 'serviceType', 'serviceName', 'operatorType']),
    operatorName: pickValue(item, ['operatorName', 'operator', 'opName', 'name']),
    circleName: pickValue(item, ['circleName', 'circle', 'circle_name']),
    gstName: pickValue(item, ['gstName', 'gst', 'gstType', 'gstTypeName']),
    slabRange: buildSlabRange(item),
    p2pCommission: pickValue(item, ['commission', 'p2pCommission', 'p2pCommision', 'p2p', 'p2pcommission']),
    commissionName: pickValue(item, ['commissionType', 'commissionName', 'commisionName', 'commisionType', 'name']),
    amountType: pickValue(item, ['amountType']),
    amount: pickValue(item, ['amount', 'commissionAmount', 'rangeAmount', 'slabAmount']),
  }));

const CommissionRangeScreen = ({ navigation }: any) => {
  const [rows, setRows] = useState<CommissionRangeRow[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [getCommissionRange, { isLoading }] = useGetcommisionrangMutation();

  const loadCommissionRange = useCallback(async () => {
    setErrorMessage('');
    try {
      const response = await getCommissionRange({ data: {} }).unwrap();
      setRows(normalizeRows(response));
    } catch (error: any) {
      setErrorMessage(error?.data?.message || error?.message || 'Unable to load commission range');
      setRows([]);
    }
  }, [getCommissionRange]);

  useEffect(() => {
    loadCommissionRange();
  }, [loadCommissionRange]);

  const filteredRows = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();
    if (!query) {
      return rows;
    }

    return rows.filter((item) =>
      [
        item.so,
        item.operatorName,
        item.circleName,
        item.gstName,
        item.slabRange,
        item.p2pCommission,
        item.commissionName,
        item.amountType,
        item.amount,
      ]
        .join(' ')
        .toLowerCase()
        .includes(query),
    );
  }, [rows, searchQuery]);

  const renderInfo = (label: string, value: string) => (
    <View style={styles.infoItem}>
      <Text style={styles.infoLabel}>{label}</Text>
      <Text style={styles.infoValue} numberOfLines={1}>{value}</Text>
    </View>
  );

  const renderCard = ({ item, index }: { item: CommissionRangeRow; index: number }) => (
    <View style={styles.card}>
      <View style={styles.cardHeader}>
        <View style={styles.serialBadge}>
          <Text style={styles.serialText}>{index + 1}</Text>
        </View>
        <View style={styles.headerText}>
          <Text style={styles.operatorText} numberOfLines={1}>{item.operatorName}</Text>
          {/* <Text style={styles.soText} numberOfLines={1}>S.O: {item.so}</Text> */}
        </View>
        {/* <View style={styles.amountPill}>
          <Text style={styles.amountText} numberOfLines={1}>{item.amount}</Text>
        </View> */}
      </View>

      <View style={styles.divider} />

      <View style={styles.infoGrid}>
        {renderInfo('Circle Name', item.circleName)}
        {renderInfo('GST Name', item.gstName)}
        {renderInfo('Slab Range', item.slabRange)}
        {renderInfo('Commission', item.p2pCommission)}
        {renderInfo('Comm. Type', item.commissionName)}
        {renderInfo('Amount Type', item.amountType)}
      </View>
    </View>
  );

  const emptyComponent = () => (
    <View style={styles.emptyState}>
      {isLoading ? (
        <ActivityIndicator size="large" color={Colors.primary} />
      ) : (
        <>
          <MaterialCommunityIcons name="chart-bell-curve-cumulative" size={48} color={Colors.textMuted} />
          <Text style={styles.emptyTitle}>{errorMessage ? 'Range not loaded' : 'No commission range data found'}</Text>
          {!!errorMessage && <Text style={styles.emptySubtitle}>{errorMessage}</Text>}
          <TouchableOpacity style={styles.retryButton} onPress={loadCommissionRange}>
            <Text style={styles.retryText}>Retry</Text>
          </TouchableOpacity>
        </>
      )}
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor={Colors.white} />
      <AppHeader title="Commission Range" showBack onBackPress={() => navigation.goBack()} />

      <View style={styles.searchContainer}>
        <MaterialCommunityIcons name="magnify" size={22} color={Colors.textMuted} />
        <TextInput
          value={searchQuery}
          onChangeText={setSearchQuery}
          placeholder="Search operator, circle or slab"
          placeholderTextColor={Colors.textMuted}
          style={styles.searchInput}
        />
      </View>

      <FlatList
        data={filteredRows}
        keyExtractor={(item, index) => `${item.id}-${index}`}
        renderItem={renderCard}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={emptyComponent}
        refreshControl={
          <RefreshControl refreshing={isLoading} onRefresh={loadCommissionRange} colors={[Colors.primary]} />
        }
      />


    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: Spacing.md,
    marginTop: Spacing.md,
    paddingHorizontal: Spacing.md,
    height: 48,
    borderRadius: Radius.md,
    backgroundColor: Colors.white,
    borderWidth: 1,
    borderColor: Colors.divider,
  },
  searchInput: {
    flex: 1,
    marginLeft: Spacing.sm,
    fontSize: FontSize.md,
    fontFamily: Poppins.regular,
    color: Colors.textDark,
  },
  listContent: {
    padding: Spacing.md,
    paddingBottom: Spacing.xl,
    flexGrow: 1,
  },
  card: {
    backgroundColor: Colors.white,
    borderRadius: Radius.md,
    padding: Spacing.md,
    marginBottom: Spacing.md,
    borderWidth: 1,
    borderColor: Colors.divider,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  serialBadge: {
    width: 34,
    height: 34,
    borderRadius: Radius.full,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFF4E5',
  },
  serialText: {
    fontSize: FontSize.sm,
    fontFamily: Poppins.bold,
    color: '#F77F00',
  },
  headerText: {
    flex: 1,
    marginHorizontal: Spacing.sm,
  },
  operatorText: {
    fontSize: FontSize.lg,
    fontFamily: Poppins.semiBold,
    color: Colors.textDark,
  },
  soText: {
    marginTop: 2,
    fontSize: FontSize.sm,
    fontFamily: Poppins.regular,
    color: Colors.textSecondary,
  },
  amountPill: {
    maxWidth: 110,
    paddingHorizontal: Spacing.sm,
    paddingVertical: 6,
    borderRadius: Radius.full,
    backgroundColor: '#E8F0FE',
  },
  amountText: {
    fontSize: FontSize.xs,
    fontFamily: Poppins.semiBold,
    color: Colors.primary,
  },
  divider: {
    height: 1,
    backgroundColor: Colors.divider,
    marginVertical: Spacing.md,
  },
  infoGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    flexWrap: 'wrap',
    // marginHorizontal: -Spacing.xs,
  },
  infoItem: {
    width: '50%',
    paddingHorizontal: Spacing.xs,
    marginBottom: Spacing.sm,
  },
  infoLabel: {
    fontSize: FontSize.xs,
    fontFamily: Poppins.regular,
    color: Colors.textMuted,
  },
  infoValue: {
    marginTop: 2,
    fontSize: FontSize.md,
    fontFamily: Poppins.semiBold,
    color: Colors.textDark,
  },
  emptyState: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: Spacing.lg,
  },
  emptyTitle: {
    marginTop: Spacing.md,
    fontSize: FontSize.lg,
    fontFamily: Poppins.semiBold,
    color: Colors.textDark,
    textAlign: 'center',
  },
  emptySubtitle: {
    marginTop: Spacing.sm,
    fontSize: FontSize.md,
    fontFamily: Poppins.regular,
    color: Colors.textSecondary,
    textAlign: 'center',
  },
  retryButton: {
    marginTop: Spacing.md,
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.sm,
    borderRadius: Radius.md,
    backgroundColor: Colors.primary,
  },
  retryText: {
    fontSize: FontSize.md,
    fontFamily: Poppins.semiBold,
    color: Colors.white,
  },
});

export default CommissionRangeScreen;
