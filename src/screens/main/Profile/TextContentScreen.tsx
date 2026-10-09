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

const TextContentScreen = ({ route, navigation }: any) => {
  const { title, content } = route.params || { title: 'Terms & Conditions', content: [] };

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" backgroundColor="white" />

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <MaterialIcons name="arrow-back" size={28} color="#000" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{title}</Text>
      </View>

      <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
        <View style={styles.contentPadding}>
          {content.map((item: any, index: number) => (
            <View key={index} style={styles.section}>
              <Text style={styles.sectionTitle}>{item.title}</Text>
              <Text style={styles.sectionText}>{item.text}</Text>
            </View>
          ))}
        </View>
        <View style={{ height: 40 }} />
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: 'white',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 15,
    backgroundColor: 'white',
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  backButton: {
    marginRight: 15,
  },
  headerTitle: {
    fontSize: 16,
    fontFamily: Poppins.bold,
    
    color: '#000',
  },
  container: {
    flex: 1,
  },
  contentPadding: {
    padding: 20,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 16,
    fontFamily: Poppins.bold,
    
    color: '#1E293B',
    marginBottom: 10,
  },
  sectionText: {
    fontSize: 16,
    fontFamily: Poppins.regular,
    color: '#64748B',
    lineHeight: 22,
  },
});

export default TextContentScreen;
