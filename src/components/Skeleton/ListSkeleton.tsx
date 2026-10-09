import React from 'react';
import { View, StyleSheet, FlatList, SafeAreaView } from 'react-native';
import DNSSkeleton from './DNSSkeleton';

const ListSkeleton = () => {
  const renderItem = () => (
    <View style={styles.card}>
      <View style={styles.cardHeader}>
        <View style={styles.infoRow}>
          <DNSSkeleton width={44} height={44} circle />
          <View style={{ flex: 1, marginLeft: 12 }}>
            <DNSSkeleton width="60%" height={16} style={{ marginBottom: 6 }} />
            <DNSSkeleton width="40%" height={12} />
          </View>
        </View>
        <DNSSkeleton width={70} height={24} borderRadius={8} />
      </View>

      <View style={styles.cardDivider} />

      <View style={styles.cardFooter}>
        <View>
          <DNSSkeleton width={50} height={10} style={{ marginBottom: 6 }} />
          <DNSSkeleton width={80} height={16} />
        </View>
        <View style={{ alignItems: 'flex-end' }}>
          <DNSSkeleton width={50} height={10} style={{ marginBottom: 6 }} />
          <DNSSkeleton width={80} height={16} />
        </View>
      </View>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.searchContainer}>
        <DNSSkeleton width="100%" height={45} borderRadius={12} />
      </View>

      <FlatList
        data={[1, 2, 3, 4, 5]}
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
    backgroundColor: '#F8F9FA',
  },
  searchContainer: {
    paddingHorizontal: 20,
    paddingVertical: 15,
    backgroundColor: '#FFFFFF',
  },
  listContent: {
    padding: 20,
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#F0F0F0',
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  infoRow: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
  },
  cardDivider: {
    height: 1,
    backgroundColor: '#F3F4F6',
    marginVertical: 12,
  },
  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
});

export default ListSkeleton;
