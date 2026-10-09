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
import { useGetcommisionMutation, useGetcommisionrangMutation } from '../../../redux/services/mainApi/Common/CommonApi';
import Colors from '../../../theme/colors';
import { FontSize, Radius, Spacing } from '../../../theme/spacing';
import { Poppins } from '../../../theme/typography';

type CommissionRow = {
  id: string;
  so: string;
  operatorName: string;
  p2pCommission: string;
  p2aCommission: string;
  commissionType: string;
  amountType: string;
  amount: string;
};

// Safe fallback picker for dynamic API keys
const pickValue = (item: any, keys: string[], fallback = '-') => {
  for (const key of keys) {
    const value = item?.[key];
    if (value !== undefined && value !== null && value !== '') {
      return String(value);
    }
  }
  return fallback;
};

// Formatting helper to turn decimal values (like 0.10) into readable point values
const formatCommission = (value: string, fallback = '-') => {
  if (!value || value === '-' || isNaN(Number(value))) {
    return value || fallback;
  }

  const num = Number(value);
  // Displays as a percentage point (e.g., "0.10%"). 
  // Note: If 0.10 actually represents 10%, change to: `${(num * 100).toFixed(2)}%`
  return `${num.toFixed(2)}`;
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

const normalizeRows = (packageResponse: any, rangeResponse: any): CommissionRow[] => {
  const packageRows = unwrapList(packageResponse);
  const rangeRows = unwrapList(rangeResponse);
  const sourceRows = packageRows.length ? packageRows : rangeRows;

  return sourceRows.map((item, index) => {
    const matchingRange =
      rangeRows[index] ??
      rangeRows.find((range) => {
        const operatorId = pickValue(item, ['operatorId', 'operatorID', 'opId', 'id'], '');
        return operatorId && operatorId === pickValue(range, ['operatorId', 'operatorID', 'opId', 'id'], '');
      }) ??
      {};

    const combined = { ...matchingRange, ...item };

    const rawP2P = pickValue(combined, ['commission', 'p2pCommission', 'p2pCommision', 'p2p', 'p2pcommission']);
    const rawP2A = pickValue(combined, ['p2ACommission', 'p2aCommission', 'p2aCommision', 'p2a', 'p2acommission']);

    return {
      id: pickValue(combined, ['id', 'commissionId', 'packageCommissionId'], `${index}`),
      so: pickValue(combined, ['so', 'sO', 'serviceOperator', 'serviceType', 'serviceName', 'operatorType']),
      operatorName: pickValue(combined, ['operatorName', 'operator', 'opName', 'name']),
      p2pCommission: formatCommission(rawP2P),
      p2aCommission: formatCommission(rawP2A),
      commissionType: pickValue(combined, ['commissionType', 'commisionType', 'type', 'commissionMode']),
      amountType: pickValue(combined, ['amountType']),
      amount: pickValue(combined, ['amount', 'fromAmount', 'rangeAmount', 'slabAmount', 'maxAmount']),
    };
  });
};

const CommissionReportScreen = ({ navigation }: any) => {
  const [rows, setRows] = useState<CommissionRow[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [expandedCardId, setExpandedCardId] = useState<string | null>(null);

  const [getCommission, { isLoading: isCommissionLoading }] = useGetcommisionMutation();
  const [getCommissionRange, { isLoading: isRangeLoading }] = useGetcommisionrangMutation();

  const isLoading = isCommissionLoading || isRangeLoading;

  const loadCommissionReport = useCallback(async () => {
    setErrorMessage('');
    try {
      const [packageResponse, rangeResponse] = await Promise.all([
        getCommission({ data: {} }).unwrap(),
        getCommissionRange({ data: {} }).unwrap(),
      ]);

      setRows(normalizeRows(packageResponse, rangeResponse));
    } catch (error: any) {
      setErrorMessage(error?.data?.message || error?.message || 'Unable to load commission report');
      setRows([]);
    }
  }, [getCommission, getCommissionRange]);

  useEffect(() => {
    loadCommissionReport();
  }, [loadCommissionReport]);

  const filteredRows = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();
    if (!query) {
      return rows;
    }

    return rows.filter((item) =>
      [item.so, item.operatorName, item.p2pCommission, item.p2aCommission, item.commissionType, item.amountType, item.amount]
        .join(' ')
        .toLowerCase()
        .includes(query),
    );
  }, [rows, searchQuery]);

  const toggleExpandCard = (cardId: string) => {
    setExpandedCardId(prevId => (prevId === cardId ? null : cardId));
  };

  const renderInfo = (label: string, value: string, fullWidth = false, numberOfLines = 2) => (
    <View style={[styles.infoItem, fullWidth && styles.fullWidthInfo]}>
      <Text style={styles.infoLabel}>{label}</Text>
      <Text style={styles.infoValue} numberOfLines={numberOfLines}>{value}</Text>
    </View>
  );

  const renderCard = ({ item, index }: { item: CommissionRow; index: number }) => {
    const cardUniqueId = `${item.id}-${index}`;
    const isExpanded = expandedCardId === cardUniqueId;

    return (
      <TouchableOpacity
        activeOpacity={0.8}
        onPress={() => toggleExpandCard(cardUniqueId)}
        style={[styles.card, isExpanded && styles.cardExpanded]}
      >
        <View style={styles.cardHeader}>
          <View style={styles.serialBadge}>
            <Text style={styles.serialText}>{item?.id}</Text>
          </View>
          <View style={styles.headerText}>
            <Text style={styles.operatorText} numberOfLines={1}>{item.operatorName}</Text>
            {/* <Text style={styles.soText} numberOfLines={1}>S.O: {item.so}</Text> */}
          </View>
          <View style={styles.rightHeaderAction}>
            <View style={styles.typePill}>
              <Text style={styles.typeText} numberOfLines={1}>{item.commissionType}</Text>
            </View>
           
          </View>
        </View>

        <View style={styles.divider} />

        <View style={styles.infoGrid}>
          {renderInfo('P2P Commission', item.p2pCommission)}
          {renderInfo('Amount Type', item.amountType)}
          {item.amount !== '-' && renderInfo('Amount', item.amount)}
        </View>

        <View style={styles.dividerLight} />
        {isExpanded ? (
          renderInfo('P2A Commission', item.p2aCommission, true, 0) // No line limit when expanded
        ) : (
          renderInfo('P2A Commission', item.p2aCommission, true, 1) // Clean, clipped single-line when collapsed
        )}
      </TouchableOpacity>
    );
  };

  const emptyComponent = () => (
    <View style={styles.emptyState}>
      {isLoading ? (
        <ActivityIndicator size="large" color={Colors.primary} />
      ) : (
        <>
          <MaterialCommunityIcons name="file-percent-outline" size={48} color={Colors.textMuted} />
          <Text style={styles.emptyTitle}>{errorMessage ? 'Report not loaded' : 'No commission data found'}</Text>
          {!!errorMessage && <Text style={styles.emptySubtitle}>{errorMessage}</Text>}
          <TouchableOpacity style={styles.retryButton} onPress={loadCommissionReport}>
            <Text style={styles.retryText}>Retry</Text>
          </TouchableOpacity>
        </>
      )}
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor={Colors.white} />
      <AppHeader title="Commission Report" showBack onBackPress={() => navigation.goBack()} />

      <View style={styles.searchContainer}>
        <MaterialCommunityIcons name="magnify" size={22} color={Colors.textMuted} />
        <TextInput
          value={searchQuery}
          onChangeText={setSearchQuery}
          placeholder="Search operator or commission"
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
          <RefreshControl refreshing={isLoading} onRefresh={loadCommissionReport} colors={[Colors.primary]} />
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
  cardExpanded: {
    borderColor: Colors.primary,
    borderWidth: 1.2,
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
    backgroundColor: '#E8F0FE',
  },
  serialText: {
    fontSize: FontSize.sm,
    fontFamily: Poppins.bold,
    color: Colors.primary,
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
  rightHeaderAction: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  typePill: {
    maxWidth: 110,
    paddingHorizontal: Spacing.sm,
    paddingVertical: 6,
    borderRadius: Radius.full,
    backgroundColor: '#DCFCE7',
  },
  typeText: {
    fontSize: FontSize.xs,
    fontFamily: Poppins.semiBold,
    color: Colors.success,
  },
  chevronIcon: {
    marginLeft: Spacing.xs,
  },
  divider: {
    height: 1,
    backgroundColor: Colors.divider,
    marginVertical: Spacing.md,
  },
  dividerLight: {
    height: 1,
    backgroundColor: '#F1F5F9',
    marginVertical: Spacing.xs,
  },
  infoGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginHorizontal: -Spacing.xs,
  },
  infoItem: {
    width: '50%',
    paddingHorizontal: Spacing.xs,
    marginBottom: Spacing.sm,
  },
  fullWidthInfo: {
    width: '100%',
    marginBottom: Spacing.xs,
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

export default CommissionReportScreen;