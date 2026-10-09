import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  StatusBar,
  TouchableOpacity,
  ScrollView,
} from 'react-native';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import { Spacing, Radius } from '../../../theme/spacing';
import AppHeader from '../../../components/Header/AppHeader';
import { Colors, Typography } from '../../../theme';

interface ReportItem {
  id: string;
  title: string;
  subtitle: string;
  icon: string;
  iconType?: 'material' | 'community';
  route: string;
  badgeBg: string;
  iconColor: string;
}

interface ReportCardProps {
  item: ReportItem;
  isActive: boolean;
  onPress: () => void;
  onViewDetails: () => void;
}

const REPORT_ITEMS: ReportItem[] = [
  {
    id: 'recharge',
    title: 'Recharge Reports',
    subtitle: 'All Recharge Reports Data',
    icon: 'file-document-outline',
    badgeBg: '#E7F9EF',
    iconColor: '#00A86B',
    route: 'RechargeReport',
  },
  {
    id: 'transaction',
    title: 'Transaction Reports',
    subtitle: 'All Transaction Reports Data',
    icon: 'swap-horizontal',
    badgeBg: '#FFF4E5',
    iconColor: '#F9AB00',
    route: 'TransactionReport',
  },
  {
    id: 'daybook',
    title: 'Daybook Reports',
    subtitle: 'Daybook Reports Data',
    icon: 'chart-bar',
    badgeBg: '#E8F0FE',
    iconColor: '#1A73E8',
    route: 'DaybookReport',
  },
  {
    id: 'commission',
    title: 'Commission Report',
    subtitle: 'All Commission Report Data',
    icon: 'file-percent-outline',
    badgeBg: '#F0FDF4',
    iconColor: '#10B981',
    route: 'CommissionReport',
  },
  {
    id: 'range',
    title: 'Commission Range',
    subtitle: 'All Commission Range Data',
    icon: 'chart-bell-curve-cumulative',
    badgeBg: '#FFF4E5',
    iconColor: '#F77F00',
    route: 'CommissionRange',
  },
];

const ReportCard: React.FC<ReportCardProps> = ({
  item,
  isActive,
  onPress,
  onViewDetails,
}) => {
  const IconComp = item.iconType === 'material' ? MaterialIcons : MaterialCommunityIcons;

  const handleCardPress = () => {
    onPress();
    onViewDetails();
  };

  return (
    <TouchableOpacity
      activeOpacity={0.85}
      onPress={handleCardPress}
      style={[
        styles.card,
        isActive ? styles.activeCard : styles.inactiveCard,
      ]}
    >
      <View
        style={[
          styles.iconWrapper,
          { backgroundColor: isActive ? 'rgba(255, 255, 255, 0.2)' : item.badgeBg },
        ]}
      >
        <IconComp
          name={item.icon as any}
          size={26}
          color={isActive ? '#FFFFFF' : item.iconColor}
        />
      </View>

      <View style={styles.textContainer}>
        <Text style={[styles.cardTitle, isActive && styles.activeText]}>
          {item.title}
        </Text>
        <Text style={[styles.cardSubtitle, isActive && styles.activeSubtext]}>
          {item.subtitle}
        </Text>
      </View>

      <View style={styles.actionContainer}>
        <Text style={[styles.viewDetailsText, isActive && styles.activeActionText]}>
          View
        </Text>
        <MaterialIcons
          name="chevron-right"
          size={20}
          color={isActive ? '#FFFFFF' : Colors.primary || '#0047AB'}
        />
      </View>
    </TouchableOpacity>
  );
};

const ReportsScreen: React.FC<any> = ({ navigation }) => {
  const [activeCardId, setActiveCardId] = useState<string>('recharge');

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor={Colors.bg} />

      <AppHeader
        title="Reports"
        rightComponent={
          <TouchableOpacity style={styles.filterButton}>
            <MaterialIcons name="filter-list" size={18} color={Colors.primary || '#0066FF'} />
            <Text style={styles.filterText}>Filter</Text>
          </TouchableOpacity>
        }
        onBackPress={() => navigation.goBack()}
      />

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {REPORT_ITEMS.map((item) => {
          const isActive = activeCardId === item.id;
          return (
            <ReportCard
              key={item.id}
              item={item}
              isActive={isActive}
              onPress={() => setActiveCardId(item.id)}
              onViewDetails={() => navigation.navigate(item.route)}
            />
          );
        })}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8F9FA',
  },
  scrollContent: {
    padding: Spacing.md,
    paddingBottom: Spacing.xl,
  },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: Spacing.md,
    borderRadius: Radius.lg || 16,
    marginBottom: Spacing.md,
    minHeight: 84,
  },
  inactiveCard: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#EAEFEF',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 8,
    elevation: 2,
  },
  activeCard: {
    backgroundColor: Colors.primary || '#0052CC',
    borderWidth: 1,
    borderColor: Colors.primary || '#0052CC',
    shadowColor: Colors.primary || '#0052CC',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.25,
    shadowRadius: 10,
    elevation: 6,
  },
  iconWrapper: {
    width: 48,
    height: 48,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  textContainer: {
    flex: 1,
    marginLeft: Spacing.md,
    marginRight: Spacing.xs,
  },
  cardTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: '#1A1A1A',
  },
  cardSubtitle: {
    fontSize: 12,
    fontWeight: '400',
    color: '#6C757D',
    marginTop: 2,
  },
  activeText: {
    color: '#FFFFFF',
  },
  activeSubtext: {
    color: 'rgba(255, 255, 255, 0.8)',
  },
  actionContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  viewDetailsText: {
    fontSize: 13,
    fontWeight: '600',
    color: Colors.primary || '#0047AB',
    marginRight: 2,
  },
  activeActionText: {
    color: '#FFFFFF',
  },
  filterButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.sm + 4,
    paddingVertical: Spacing.xs + 2,
    borderRadius: Radius.md || 8,
    backgroundColor: '#F0F4FF',
    gap: 4,
  },
  filterText: {
    fontSize: Typography.small || 13,
    fontWeight: '600',
    color: Colors.primary || '#0066FF',
  },
});

export default ReportsScreen;