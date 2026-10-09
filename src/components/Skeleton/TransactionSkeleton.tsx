import React from 'react';
import { View, StyleSheet, ScrollView, SafeAreaView } from 'react-native';
import DNSSkeleton from './DNSSkeleton';

const TransactionSkeleton = () => {
  const renderItem = () => (
    <View style={styles.card}>
      <View style={styles.cardHeader}>
        <View style={styles.bankInfo}>
          <DNSSkeleton width={40} height={40} borderRadius={10} style={{ marginRight: 12 }} />
          <View>
            <DNSSkeleton width={100} height={18} style={{ marginBottom: 6 }} />
            <DNSSkeleton width={60} height={12} />
          </View>
        </View>
        <DNSSkeleton width={70} height={24} borderRadius={12} />
      </View>

      <View style={styles.amountSection}>
        <View style={styles.blueBar} />
        <View style={styles.retailerInfo}>
          <View>
            <DNSSkeleton width={50} height={10} style={{ marginBottom: 4 }} />
            <DNSSkeleton width={80} height={16} />
          </View>
          <View style={{ alignItems: 'flex-end' }}>
            <DNSSkeleton width={50} height={10} style={{ marginBottom: 4 }} />
            <DNSSkeleton width={90} height={20} />
          </View>
        </View>
      </View>

      <View style={styles.footerRow}>
        <DNSSkeleton width={120} height={10} style={{ marginBottom: 4 }} />
        <DNSSkeleton width={150} height={10} />
      </View>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        <View style={styles.sectionHeader}>
          <DNSSkeleton width={60} height={16} style={{ marginRight: 12 }} />
          <View style={styles.sectionLine} />
        </View>
        {renderItem()}
        {renderItem()}

        <View style={styles.sectionHeader}>
          <DNSSkeleton width={80} height={16} style={{ marginRight: 12 }} />
          <View style={styles.sectionLine} />
        </View>
        {renderItem()}
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8F9FB',
  },
  scrollView: {
    paddingHorizontal: 20,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 24,
    marginBottom: 16,
  },
  sectionLine: {
    flex: 1,
    height: 1,
    backgroundColor: '#EEE',
  },
  card: {
    backgroundColor: '#FFF',
    borderRadius: 20,
    padding: 20,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#F0F0F0',
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  bankInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  amountSection: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  blueBar: {
    width: 4,
    height: 44,
    backgroundColor: '#E0E0E0',
    borderRadius: 2,
    marginRight: 12,
  },
  retailerInfo: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  footerRow: {
    borderTopWidth: 1,
    borderTopColor: '#F0F0F0',
    paddingTop: 12,
  },
});

export default TransactionSkeleton;
