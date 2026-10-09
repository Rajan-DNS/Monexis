import React from 'react';
import { View, StyleSheet, ScrollView, Platform } from 'react-native';
import DNSSkeleton from './DNSSkeleton';
import Colors from '../../theme/colors';

const HomeSkeleton = () => {
  return (
    <View style={styles.container}>
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Header Section Skeleton */}
        <View style={styles.headerGradient}>
          <View style={styles.headerTextContent}>
            <DNSSkeleton width={80} height={14} style={{ marginBottom: 8 }} />
            <DNSSkeleton width={200} height={32} style={{ marginBottom: 12 }} />
            <DNSSkeleton width="80%" height={15} style={{ marginBottom: 4 }} />
            <DNSSkeleton width="60%" height={15} />
          </View>

          <View style={styles.headerContent}>
            {/* Balance Card Skeleton */}
            <View style={styles.balanceCard}>
              <View style={styles.balanceHeader}>
                <DNSSkeleton width={120} height={16} />
                <DNSSkeleton width={24} height={24} circle />
              </View>
              <View style={styles.balanceRow}>
                <DNSSkeleton width={180} height={36} />
              </View>
            </View>
          </View>
        </View>

        {/* Content Body Skeleton */}
        <View style={styles.contentBody}>
          {/* Section 1 */}
          <View style={styles.sectionHeader}>
            <DNSSkeleton width={100} height={20} />
            <DNSSkeleton width={80} height={12} />
          </View>
          <View style={styles.servicesGrid}>
            <View style={styles.serviceCard}>
              <DNSSkeleton width={48} height={48} borderRadius={12} style={{ marginBottom: 12 }} />
              <DNSSkeleton width={80} height={15} style={{ marginBottom: 4 }} />
              <DNSSkeleton width={60} height={15} />
            </View>
            <View style={styles.serviceCard}>
              <DNSSkeleton width={48} height={48} borderRadius={12} style={{ marginBottom: 12 }} />
              <DNSSkeleton width={80} height={15} style={{ marginBottom: 4 }} />
              <DNSSkeleton width={60} height={15} />
            </View>
          </View>

          {/* Section 2 */}
          <View style={styles.sectionHeader}>
            <DNSSkeleton width={130} height={20} />
            <DNSSkeleton width={80} height={12} />
          </View>
          <View style={styles.servicesGrid}>
            <View style={styles.serviceCard}>
              <DNSSkeleton width={48} height={48} borderRadius={12} style={{ marginBottom: 12 }} />
              <DNSSkeleton width={80} height={15} />
            </View>
            <View style={styles.serviceCard}>
              <DNSSkeleton width={48} height={48} borderRadius={12} style={{ marginBottom: 12 }} />
              <DNSSkeleton width={80} height={15} />
            </View>
          </View>

          {/* Section 3 (Top-up) */}
          <View style={styles.sectionHeader}>
            <DNSSkeleton width={120} height={20} />
            <DNSSkeleton width={80} height={12} />
          </View>
          <View style={styles.topUpGrid}>
            {[1, 2, 3, 4].map((i) => (
              <View key={i} style={styles.topUpItem}>
                <DNSSkeleton width={56} height={56} circle style={{ marginBottom: 8 }} />
                <DNSSkeleton width={40} height={10} />
              </View>
            ))}
          </View>
        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 20,
  },
  headerGradient: {
    backgroundColor: Colors.primaryDark || '#0052D4',
    paddingBottom: Platform.OS === 'ios' ? 25 : 50,
  },
  headerTextContent: {
    paddingHorizontal: 24,
    paddingTop: Platform.OS === 'ios' ? 60 : 40,
  },
  headerContent: {
    paddingHorizontal: 24,
    paddingBottom: Platform.OS === 'ios' ? 50 : 20,
  },
  balanceCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    borderRadius: 20,
    padding: 24,
    marginTop: 24,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },
  balanceHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  balanceRow: {
    marginTop: 12,
  },
  contentBody: {
    backgroundColor: '#FFFFFF',
    marginTop: Platform.OS === 'ios' ? -60 : -40,
    borderTopLeftRadius: 40,
    borderTopRightRadius: 40,
    paddingHorizontal: 24,
    paddingTop: 32,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
    marginTop: 8,
  },
  servicesGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 24,
  },
  serviceCard: {
    width: '47%',
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 20,
    borderWidth: 1,
    borderColor: '#F0F0F0',
  },
  topUpGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 24,
  },
  topUpItem: {
    alignItems: 'center',
    width: '23%',
  },
});

export default HomeSkeleton;
