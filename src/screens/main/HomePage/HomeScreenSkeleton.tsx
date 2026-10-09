import React from 'react';
import { View, StyleSheet, ScrollView, Dimensions } from 'react-native';
import DNSSkeleton from '../../../components/Skeleton/DNSSkeleton';
import Colors from '../../../theme/colors';

const { width } = Dimensions.get('window');

const HomeScreenSkeleton: React.FC = () => {
  return (
    <View style={[styles.container, { backgroundColor: Colors.bg }]}>
      <ScrollView
        style={styles.scrollView}
        bounces={false}
        showsVerticalScrollIndicator={false}
      >
        {/* Header Section Skeleton */}
        <View style={[styles.headerSkeleton, { backgroundColor: Colors.primaryDark }]}>
          <View style={styles.headerTextContent}>
            <DNSSkeleton width={100} height={14} style={styles.skeletonMargin} />
            <DNSSkeleton width={200} height={32} style={styles.skeletonMargin} />
            <DNSSkeleton width={'80%'} height={40} style={styles.skeletonMargin} />
          </View>

          <View style={styles.headerContent}>
            {/* Balance Card Skeleton */}
            <View style={styles.balanceCardSkeleton}>
              <View style={styles.balanceHeader}>
                <DNSSkeleton width={120} height={16} />
                <DNSSkeleton width={24} height={24} circle />
              </View>
              <View style={styles.balanceRow}>
                <DNSSkeleton width={180} height={40} />
                <DNSSkeleton width={60} height={24} borderRadius={12} />
              </View>
            </View>
          </View>
        </View>

        {/* Content Body Skeleton */}
        <View style={styles.contentBody}>
          {/* Section 1: Recharge */}
          <View style={styles.section}>
            <View style={styles.sectionHeaderSkeleton}>
              <DNSSkeleton width={150} height={20} />
              <DNSSkeleton width={60} height={16} />
            </View>
            <View style={styles.cardContainerSkeleton}>
              <View style={styles.grid}>
                {[1, 2, 3, 4].map((i) => (
                  <View key={i} style={styles.gridItem}>
                    <DNSSkeleton width={50} height={50} borderRadius={16} style={styles.iconSkeleton} />
                    <DNSSkeleton width={40} height={10} />
                  </View>
                ))}
              </View>
            </View>
          </View>

          {/* Section 2: Utilities */}
          <View style={styles.section}>
            <View style={styles.sectionHeaderSkeleton}>
              <DNSSkeleton width={150} height={20} />
              <DNSSkeleton width={60} height={16} />
            </View>
            <View style={styles.cardContainerSkeleton}>
              <View style={styles.grid}>
                {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
                  <View key={i} style={styles.gridItem}>
                    <DNSSkeleton width={50} height={50} borderRadius={16} style={styles.iconSkeleton} />
                    <DNSSkeleton width={40} height={10} />
                  </View>
                ))}
              </View>
            </View>
          </View>

          {/* Offer Banner Skeleton */}
          <DNSSkeleton width={'100%'} height={130} borderRadius={20} style={styles.bannerSkeleton} />
        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  headerSkeleton: {
    paddingBottom: 60,
    paddingTop: 40,
  },
  headerTextContent: {
    paddingHorizontal: 24,
    paddingTop: 20,
  },
  skeletonMargin: {
    marginBottom: 12,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
  },
  headerContent: {
    paddingHorizontal: 24,
    paddingTop: 10,
  },
  balanceCardSkeleton: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 20,
    padding: 24,
    marginTop: 24,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  balanceHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  balanceRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 12,
  },
  contentBody: {
    backgroundColor: '#FFFFFF',
    marginTop: -40,
    borderTopLeftRadius: 40,
    borderTopRightRadius: 40,
    paddingHorizontal: 24,
    paddingTop: 32,
  },
  section: {
    marginBottom: 32,
  },
  sectionTitle: {
    marginBottom: 16,
  },
  sectionHeaderSkeleton: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  cardContainerSkeleton: {
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    padding: 16,
    borderWidth: 1,
    borderColor: '#F0F0F0',
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 2,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  gridItem: {
    width: (width - 48 - 40) / 4, // 4 items per row
    alignItems: 'center',
    marginBottom: 20,
  },
  iconSkeleton: {
    marginBottom: 8,
  },
  bannerSkeleton: {
    marginBottom: 32,
  },
});

export default HomeScreenSkeleton;
