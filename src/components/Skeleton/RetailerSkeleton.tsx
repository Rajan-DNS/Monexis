import React from 'react';
import { View, StyleSheet, FlatList, SafeAreaView } from 'react-native';
import DNSSkeleton from './DNSSkeleton';

const RetailerSkeleton = () => {
  const renderItem = () => (
    <View style={styles.card}>
      <View style={styles.cardHeader}>
        <View style={styles.headerContent}>
          <View style={styles.topRow}>
            <View style={{ flex: 1 }}>
              <DNSSkeleton width={60} height={10} style={{ marginBottom: 6 }} />
              <DNSSkeleton width="70%" height={20} />
            </View>
            <DNSSkeleton width={30} height={30} borderRadius={10} />
          </View>

          {/* Shop Name Skeleton */}
          <DNSSkeleton width={120} height={24} borderRadius={6} style={{ marginBottom: 12 }} />

          <View style={styles.contactRow}>
            <View style={styles.contactItem}>
              <DNSSkeleton width={50} height={10} style={{ marginBottom: 6 }} />
              <DNSSkeleton width="80%" height={16} />
            </View>
            <View style={styles.contactItem}>
              <DNSSkeleton width={40} height={10} style={{ marginBottom: 6 }} />
              <DNSSkeleton width="90%" height={16} />
            </View>
          </View>

          <View style={styles.addressSection}>
            <DNSSkeleton width="90%" height={12} />
          </View>
        </View>
      </View>

      <View style={styles.cardFooter}>
        <View>
          <DNSSkeleton width={80} height={10} style={{ marginBottom: 6 }} />
          <DNSSkeleton width={100} height={24} />
        </View>
        <DNSSkeleton width={80} height={32} borderRadius={20} />
      </View>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.searchContainer}>
        <DNSSkeleton width="100%" height={50} borderRadius={12} />
      </View>

      <FlatList
        data={[1, 2, 3]}
        keyExtractor={(item) => item.toString()}
        renderItem={renderItem}
        contentContainerStyle={styles.listContent}
        scrollEnabled={false}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8F9FB',
  },
  searchContainer: {
    paddingHorizontal: 20,
    marginTop: 10,
    marginBottom: 5,
  },
  listContent: {
    padding: 20,
  },
  card: {
    backgroundColor: 'white',
    borderRadius: 20,
    marginBottom: 20,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#F0F0F0',
  },
  cardHeader: {
    backgroundColor: '#0056D2',
    padding: 20,
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
    opacity: 0.1, // Simulate the blue header background but very faded for skeleton
  },
  headerContent: {
    width: '100%',
  },
  topRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 10,
  },
  contactRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  contactItem: {
    flex: 0.48,
  },
  addressSection: {
    marginTop: 12,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: 'rgba(0, 0, 0, 0.05)',
  },
  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
  },
});

export default RetailerSkeleton;
