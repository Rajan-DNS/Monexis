import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
  StatusBar,
} from 'react-native';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import { Poppins } from '../../../theme/typography';
import LegalDocumentScreen from './LegalDocumentScreen';

const TextContentScreen = ({ route, navigation }: any) => {
  const { title, content } = route.params || { title: 'Terms & Conditions', content: [] };

  const isLegalDoc =
    title?.toLowerCase().includes('privacy') ||
    title?.toLowerCase().includes('term') ||
    title?.toLowerCase().includes('condition') ||
    title?.toLowerCase().includes('refund') ||
    title?.toLowerCase().includes('cancel') ||
    title?.toLowerCase().includes('cookie');

  if (isLegalDoc) {
    const lower = title?.toLowerCase() || '';
    let defaultDoc: 'privacy' | 'terms' | 'refund' | 'cookie' = 'privacy';
    if (lower.includes('refund') || lower.includes('cancel')) {
      defaultDoc = 'refund';
    } else if (lower.includes('cookie')) {
      defaultDoc = 'cookie';
    } else if (lower.includes('term') || lower.includes('condition')) {
      defaultDoc = 'terms';
    }

    return (
      <LegalDocumentScreen
        navigation={navigation}
        route={route}
        defaultDoc={defaultDoc}
      />
    );
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <MaterialIcons name="arrow-back" size={24} color="#001F5B" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{title}</Text>
      </View>

      <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
        <View style={styles.contentPadding}>
          {content && content.length > 0 ? (
            content.map((item: any, index: number) => (
              <View key={index} style={styles.sectionCard}>
                <View style={styles.sectionHeader}>
                  <View style={styles.bulletCircle}>
                    <Text style={styles.bulletNumber}>{index + 1}</Text>
                  </View>
                  <Text style={styles.sectionTitle}>{item.title}</Text>
                </View>
                <Text style={styles.sectionText}>{item.text}</Text>
              </View>
            ))
          ) : (
            <View style={styles.emptyWrap}>
              <MaterialIcons name="article" size={48} color="#CBD5E1" />
              <Text style={styles.emptyText}>No content available</Text>
            </View>
          )}
        </View>
        <View style={{ height: 40 }} />
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 15,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
  },
  backButton: {
    marginRight: 15,
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#F1F5F9',
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 16,
    fontFamily: Poppins.bold,
    color: '#001F5B',
  },
  container: {
    flex: 1,
  },
  contentPadding: {
    padding: 16,
  },
  sectionCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  bulletCircle: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#001F5B',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10,
  },
  bulletNumber: {
    color: '#FFFFFF',
    fontSize: 12,
    fontFamily: Poppins.bold,
  },
  sectionTitle: {
    flex: 1,
    fontSize: 15,
    fontFamily: Poppins.bold,
    color: '#1E293B',
  },
  sectionText: {
    fontSize: 13,
    fontFamily: Poppins.regular,
    color: '#475569',
    lineHeight: 22,
  },
  emptyWrap: {
    alignItems: 'center',
    paddingVertical: 48,
  },
  emptyText: {
    fontSize: 14,
    fontFamily: Poppins.medium,
    color: '#94A3B8',
    marginTop: 12,
  },
});

export default TextContentScreen;
