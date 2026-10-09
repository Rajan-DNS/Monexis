import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
} from 'react-native';
import { Colors } from '../../theme';

interface Operator {
  id: string;
  name: string;
}

interface Circle {
  id: string;
  name: string;
}

const OPERATORS: Operator[] = [
  { id: '1', name: 'Bharatgas' },
  { id: '2', name: 'HP Gas' },
  { id: '3', name: 'Indane Gas' },
];

const CIRCLES: Circle[] = [
  { id: '1', name: 'All Circles' },
  { id: '2', name: 'Delhi' },
  { id: '3', name: 'Mumbai' },
];

const ExampleGasBillScreen = () => {
  const [consumerNumber, setConsumerNumber] = useState('');
  const [selectedOperator, setSelectedOperator] = useState<Operator | null>(null);
  const [selectedCircle, setSelectedCircle] = useState<Circle | null>(null);

  const handleContinue = () => {
    console.log('Continue with:', {
      operator: selectedOperator,
      circle: selectedCircle,
      consumerNumber,
    });
  };

  return (
    <View style={styles.container}>
      <ScrollView 
        showsVerticalScrollIndicator={false} 
        contentContainerStyle={styles.scrollContent}
      >
        {/* Banner */}
        <View style={styles.bannerContainer}>
          <Text style={styles.bannerTitle}>Gas Bill Payment</Text>
          <Text style={styles.bannerTitleOrange}>Instant & Secure</Text>
          <Text style={styles.bannerDescription}>
            Pay your gas bills quickly and get instant confirmation
          </Text>
          
          <View style={styles.bannerFeaturesRow}>
            <View style={styles.bannerFeatureItem}>
              <View style={styles.featureIconContainer}>
                <Text style={styles.featureIcon}>⚡</Text>
              </View>
              <Text style={styles.featureTitle}>Instant</Text>
              <Text style={styles.featureSubtitle}>Payment</Text>
            </View>
            
            <View style={styles.bannerFeatureItem}>
              <View style={styles.featureIconContainer}>
                <Text style={styles.featureIcon}>🔒</Text>
              </View>
              <Text style={styles.featureTitle}>Secure</Text>
              <Text style={styles.featureSubtitle}>Transaction</Text>
            </View>
            
            <View style={styles.bannerFeatureItem}>
              <View style={styles.featureIconContainer}>
                <Text style={styles.featureIcon}>💰</Text>
              </View>
              <Text style={styles.featureTitle}>Best</Text>
              <Text style={styles.featureSubtitle}>Offers</Text>
            </View>
          </View>
        </View>

        {/* Input Card */}
        <View style={styles.cardWrapper}>
          {/* Consumer Number Input */}
          <Text style={styles.inputLabel}>Consumer Number</Text>
          <View style={styles.inputBox}>
            <Text style={styles.inputIcon}>📄</Text>
            <TextInput
              style={styles.input}
              placeholder="Enter consumer number"
              placeholderTextColor={Colors.searchPlaceholder}
              value={consumerNumber}
              onChangeText={setConsumerNumber}
              keyboardType="numeric"
            />
            <TouchableOpacity activeOpacity={0.7}>
              <Text style={styles.inputIcon}>📖</Text>
            </TouchableOpacity>
          </View>

          {/* Dropdowns Row */}
          <View style={styles.dropdownsRow}>
            <View style={styles.dropdownColumn}>
              <Text style={styles.inputLabel}>Select Operator</Text>
              <View style={styles.dropdownBox}>
                <Text style={styles.dropdownText}>
                  {selectedOperator?.name || 'Choose operator'}
                </Text>
                <Text style={styles.dropdownIcon}>▼</Text>
              </View>
            </View>

            <View style={styles.dropdownColumn}>
              <Text style={styles.inputLabel}>Select Circle</Text>
              <View style={styles.dropdownBox}>
                <Text style={styles.dropdownText}>
                  {selectedCircle?.name || 'Choose circle'}
                </Text>
                <Text style={styles.dropdownIcon}>▼</Text>
              </View>
            </View>
          </View>
        </View>

        <View style={{ height: 100 }} />
      </ScrollView>

      {/* Continue Button */}
      <View style={styles.buttonContainer}>
        <TouchableOpacity
          style={styles.continueBtn}
          onPress={handleContinue}
          activeOpacity={0.88}
        >
          <Text style={styles.continueBtnText}>Continue →</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

export default ExampleGasBillScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.screenBg,
  },
  scrollContent: {
    padding: 16,
  },

  // Banner Styles
  bannerContainer: {
    width: '100%',
    minHeight: 210,
    borderRadius: 20,
    backgroundColor: Colors.bannerBlue,
    padding: 20,
    marginBottom: 16,
  },
  bannerTitle: {
    color: Colors.white,
    fontSize: 24,
    fontWeight: '700',
  },
  bannerTitleOrange: {
    color: Colors.bannerOrange,
    fontSize: 24,
    fontWeight: '800',
    marginBottom: 6,
  },
  bannerDescription: {
    color: Colors.searchPlaceholder,
    fontSize: 11,
    marginBottom: 20,
    paddingRight: 6,
  },
  bannerFeaturesRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    width: '90%',
  },
  bannerFeatureItem: {
    alignItems: 'center',
  },
  featureIconContainer: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(255,255,255,0.15)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 6,
  },
  featureIcon: {
    fontSize: 16,
  },
  featureTitle: {
    color: Colors.white,
    fontSize: 9,
    fontWeight: '700',
    textAlign: 'center',
  },
  featureSubtitle: {
    color: Colors.searchPlaceholder,
    fontSize: 8,
    textAlign: 'center',
  },

  // Card Styles
  cardWrapper: {
    marginTop: 20,
    paddingHorizontal: 16,
    paddingVertical: 20,
    backgroundColor: Colors.cardBg,
    borderWidth: 1,
    borderColor: Colors.cardBorder,
    borderRadius: 16,
    shadowColor: Colors.shadowColor,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 3,
  },

  // Input Styles
  inputLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: Colors.textLabel,
    marginBottom: 8,
  },
  inputBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.bgInput,
    borderWidth: 1,
    borderColor: Colors.borderLight,
    borderRadius: 15,
    paddingHorizontal: 16,
    height: 55,
    marginBottom: 20,
  },
  inputIcon: {
    fontSize: 20,
  },
  input: {
    flex: 1,
    fontSize: 15,
    paddingHorizontal: 12,
    color: Colors.textPrimary,
  },

  // Dropdown Styles
  dropdownsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 12,
  },
  dropdownColumn: {
    flex: 1,
  },
  dropdownBox: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: Colors.bgInput,
    borderWidth: 1,
    borderColor: Colors.borderLight,
    borderRadius: 15,
    paddingHorizontal: 16,
    height: 55,
  },
  dropdownText: {
    fontSize: 14,
    color: Colors.textSecondary,
  },
  dropdownIcon: {
    fontSize: 12,
    color: Colors.textSecondary,
  },

  // Button Styles
  buttonContainer: {
    paddingHorizontal: 20,
    paddingBottom: 20,
    backgroundColor: Colors.white,
  },
  continueBtn: {
    height: 56,
    borderRadius: 28,
    backgroundColor: Colors.btnContinue,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: Colors.shadowColor,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 4,
  },
  continueBtnText: {
    color: Colors.btnText,
    fontSize: 16,
    fontWeight: '700',
  },
});
