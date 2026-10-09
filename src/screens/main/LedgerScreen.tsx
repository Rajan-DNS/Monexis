import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  StatusBar,
  TouchableOpacity,
} from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import Colors from '../../theme/colors';
import Typography, { Poppins } from '../../theme/typography';
import { Spacing, Radius } from '../../theme/spacing';
import AppHeader from '../../components/Header/AppHeader';

type LedgerScreenProps = NativeStackScreenProps<any, 'Ledger'>;

const LedgerScreen: React.FC<LedgerScreenProps> = () => {
  const transactions: TransactionData[] = [
    { id: 1, title: 'Mobile Recharge', amount: '-₹500', date: 'Today', type: 'debit', icon: '📱' },
    { id: 2, title: 'Money Received', amount: '+₹1,000', date: 'Yesterday', type: 'credit', icon: '💳' },
    { id: 3, title: 'Electricity Bill', amount: '-₹2,450', date: '2 days ago', type: 'debit', icon: '⚡' },
    { id: 4, title: 'Water Bill', amount: '-₹800', date: '3 days ago', type: 'debit', icon: '💧' },
    { id: 5, title: 'Cashback', amount: '+₹100', date: '4 days ago', type: 'credit', icon: '🎁' },
    { id: 6, title: 'Flight Booking', amount: '-₹5,200', date: '1 week ago', type: 'debit', icon: '✈️' },
  ];

  return (
    <View style={[styles.container, { backgroundColor: Colors.bg }]}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />

      <AppHeader
        title="Ledger"
        rightComponent={
          <TouchableOpacity style={styles.filterButton}>
            <Text style={styles.filterText}>📅 Filter</Text>
          </TouchableOpacity>
        }
      />

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Summary Cards */}
        <View style={styles.summaryContainer}>
          <SummaryCard
            label="Total Spent"
            amount="₹9,450"
            icon="📉"
            color="#FF6B6B"
          />
          <SummaryCard
            label="Total Received"
            amount="₹1,100"
            icon="📈"
            color="#51CF66"
          />
        </View>

        {/* Transactions List */}
        <View style={styles.transactionsSection}>
          <Text style={styles.sectionTitle}>All Transactions</Text>
          {transactions.map((transaction, index) => (
            <TransactionItem
              key={transaction.id}
              transaction={transaction}
              isLast={index === transactions.length - 1}
            />
          ))}
        </View>
      </ScrollView>
    </View>
  );
};

interface TransactionData {
  id: number;
  title: string;
  amount: string;
  date: string;
  type: 'debit' | 'credit';
  icon: string;
}

interface TransactionItemProps {
  transaction: TransactionData;
  isLast: boolean;
}

const TransactionItem: React.FC<TransactionItemProps> = ({ transaction, isLast }) => (
  <View
    style={[
      styles.transactionItem,
      !isLast && { borderBottomWidth: 1, borderBottomColor: Colors.divider },
    ]}
  >
    <View style={styles.transactionLeft}>
      <Text style={styles.transactionIcon}>{transaction.icon}</Text>
      <View style={styles.transactionContent}>
        <Text style={styles.transactionTitle}>{transaction.title}</Text>
        <Text style={styles.transactionDate}>{transaction.date}</Text>
      </View>
    </View>
    <Text
      style={[
        styles.transactionAmount,
        transaction.type === 'credit'
          ? { color: '#51CF66' }
          : { color: Colors.textDark },
      ]}
    >
      {transaction.amount}
    </Text>
  </View>
);

interface SummaryCardProps {
  label: string;
  amount: string;
  icon: string;
  color: string;
}

const SummaryCard: React.FC<SummaryCardProps> = ({ label, amount, icon, color }) => (
  <View style={[styles.summaryCard, { backgroundColor: Colors.white }]}>
    <View style={[styles.summaryIcon, { backgroundColor: color + '20' }]}>
      <Text style={styles.summaryIconText}>{icon}</Text>
    </View>
    <Text style={styles.summaryLabel}>{label}</Text>
    <Text style={styles.summaryAmount}>{amount}</Text>
  </View>
);

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: Spacing.xl,
  },
  filterButton: {
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderRadius: Radius.md,
    backgroundColor: Colors.bgInput,
  },
  filterText: {
    fontSize: Typography.small,
    fontFamily: Poppins.regular,
    fontWeight: Typography.medium,
    color: Colors.textBody,
  },
  summaryContainer: {
    flexDirection: 'row',
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.lg,
    gap: Spacing.md,
  },
  summaryCard: {
    flex: 1,
    borderRadius: Radius.lg,
    padding: Spacing.md,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 2,
  },
  summaryIcon: {
    width: 48,
    height: 48,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: Spacing.sm,
  },
  summaryIconText: {
    fontSize: 20,
    fontFamily: Poppins.regular,
  },
  summaryLabel: {
    fontSize: Typography.small,
    fontFamily: Poppins.regular,
    color: Colors.textSecondary,
    marginBottom: Spacing.xs,
  },
  summaryAmount: {
    fontSize: Typography.h3,
    fontFamily: Poppins.regular,
    fontWeight: Typography.bold,
    color: Colors.textDark,
  },
  transactionsSection: {
    paddingHorizontal: Spacing.md,
  },
  sectionTitle: {
    fontSize: Typography.h3,
    fontFamily: Poppins.regular,
    fontWeight: Typography.bold,
    color: Colors.textDark,
    marginBottom: Spacing.md,
  },
  transactionItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.md,
    marginBottom: Spacing.sm,
    backgroundColor: Colors.white,
    borderRadius: Radius.lg,
  },
  transactionLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  transactionIcon: {
    fontSize: 20,
    fontFamily: Poppins.regular,
    marginRight: Spacing.md,
  },
  transactionContent: {
    flex: 1,
  },
  transactionTitle: {
    fontSize: Typography.body,
    fontFamily: Poppins.regular,
    fontWeight: Typography.medium,
    color: Colors.textBody,
  },
  transactionDate: {
    fontSize: Typography.small,
    fontFamily: Poppins.regular,
    color: Colors.textSecondary,
    marginTop: Spacing.xs,
  },
  transactionAmount: {
    fontSize: Typography.body,
    fontFamily: Poppins.regular,
    fontWeight: Typography.bold,
  },
});

export default LedgerScreen;
