import React from 'react';
import { View, StyleSheet, ScrollView, SafeAreaView, Platform } from 'react-native';
import DNSSkeleton from './DNSSkeleton';

const ProfileSkeleton = () => {
  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView 
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Profile Header Skeleton */}
        <View style={styles.header}>
          <DNSSkeleton width={32} height={32} circle />
          <DNSSkeleton width={120} height={20} style={{ marginLeft: 16 }} />
        </View>

        {/* Profile Info Card Skeleton */}
        <View style={styles.infoCard}>
          <View style={styles.avatarRow}>
            <DNSSkeleton width={80} height={80} circle />
            <View style={{ marginLeft: 20, flex: 1 }}>
              <DNSSkeleton width="70%" height={24} style={{ marginBottom: 8 }} />
              <DNSSkeleton width="40%" height={16} />
            </View>
          </View>
          <View style={styles.statsRow}>
            <View style={styles.statItem}>
              <DNSSkeleton width={60} height={20} style={{ marginBottom: 4 }} />
              <DNSSkeleton width={40} height={12} />
            </View>
            <View style={styles.statItem}>
              <DNSSkeleton width={60} height={20} style={{ marginBottom: 4 }} />
              <DNSSkeleton width={40} height={12} />
            </View>
            <View style={styles.statItem}>
              <DNSSkeleton width={60} height={20} style={{ marginBottom: 4 }} />
              <DNSSkeleton width={40} height={12} />
            </View>
          </View>
        </View>

        {/* Security Section Skeleton */}
        <View style={styles.section}>
          <DNSSkeleton width={100} height={18} style={{ marginBottom: 16, marginLeft: 20 }} />
          <View style={styles.sectionCard}>
            {[1, 2, 3].map((i) => (
              <View key={i} style={styles.listItem}>
                <DNSSkeleton width={24} height={24} borderRadius={6} />
                <DNSSkeleton width="60%" height={16} style={{ marginLeft: 16 }} />
                <View style={{ flex: 1 }} />
                <DNSSkeleton width={16} height={16} circle />
              </View>
            ))}
          </View>
        </View>

        {/* Other Section Skeleton */}
        <View style={styles.section}>
          <DNSSkeleton width={80} height={18} style={{ marginBottom: 16, marginLeft: 20 }} />
          <View style={styles.sectionCard}>
            {[1, 2].map((i) => (
              <View key={i} style={styles.listItem}>
                <DNSSkeleton width={24} height={24} borderRadius={6} />
                <DNSSkeleton width="50%" height={16} style={{ marginLeft: 16 }} />
                <View style={{ flex: 1 }} />
                <DNSSkeleton width={16} height={16} circle />
              </View>
            ))}
          </View>
        </View>

        {/* Logout Button Skeleton */}
        <View style={styles.logoutButton}>
          <DNSSkeleton width="100%" height={52} borderRadius={12} />
        </View>

      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 40,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: Platform.OS === 'ios' ? 20 : 40,
    paddingBottom: 20,
  },
  infoCard: {
    backgroundColor: 'white',
    marginHorizontal: 20,
    borderRadius: 24,
    padding: 24,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: '#F1F5F9',
  },
  avatarRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 24,
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    borderTopWidth: 1,
    borderTopColor: '#F1F5F9',
    paddingTop: 20,
  },
  statItem: {
    alignItems: 'center',
  },
  section: {
    marginBottom: 24,
  },
  sectionCard: {
    backgroundColor: 'white',
    marginHorizontal: 20,
    borderRadius: 20,
    paddingVertical: 8,
    borderWidth: 1,
    borderColor: '#F1F5F9',
  },
  listItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  logoutButton: {
    marginHorizontal: 20,
    marginTop: 8,
  },
});

export default ProfileSkeleton;
