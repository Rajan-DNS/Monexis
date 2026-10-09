import React, { useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import LinearGradient from 'react-native-linear-gradient';
import Colors from '../../../../theme/colors';
import AppHeader from '../../../../components/Header/AppHeader';
import { RootStackParamList } from '../../../../navigation/RootNavigator';
import Add_Beneficiary from './AddBeneficiary/Add_Beneficiary';
import { Poppins } from '../../../../theme/typography';
import SectionHeader from '../../../../components/Header/SectionHeader';

interface DtmServicesProps {
  isDynamic?: boolean;
  onBack?: () => void;
}

const Dtm_services: React.FC<DtmServicesProps> = ({ isDynamic = false, onBack }) => {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const [isAddModalVisible, setIsAddModalVisible] = React.useState(false);

  const scrollViewRef = useRef<ScrollView>(null);

  useEffect(() => {
    if (!isDynamic) {
      const timeoutId = setTimeout(() => {
        scrollViewRef.current?.scrollTo({ y: 0, animated: true });
      }, 100);
      return () => clearTimeout(timeoutId);
    }
  }, [isDynamic]);

  const WrapperComponent = isDynamic ? View : ScrollView;
  const wrapperProps = isDynamic ? {} : {
    ref: scrollViewRef,
    style: styles.scrollView,
    contentContainerStyle: styles.scrollContent,
    showsVerticalScrollIndicator: false,
  };

  return (
    <View style={isDynamic ? null : [styles.container, { backgroundColor: Colors.bg }]}>
      {!isDynamic && (
        <AppHeader
          title="DMT (Money Transfer)"
          onBackPress={() => navigation.goBack()}
          showBack
        />
      )}


      {isDynamic && (
        <View style={styles.dynamicHeader}>
          <TouchableOpacity onPress={onBack} style={styles.dynamicBackButton}>
            <MaterialCommunityIcons name="arrow-left-bold" size={20} color={Colors.textDark} />          </TouchableOpacity>
          <Text style={[styles.dynamicTitle, { color: Colors.textDark }]}>DMT (Money Transfer)</Text>
        </View>
      )}

      <WrapperComponent {...wrapperProps}>
        {/* Manage Transfers Section */}
        <View style={styles.sectionHeader}>
          <SectionHeader title="Manage Transfers" />

          {/* <Text style={[styles.sectionTitle, { color: Colors.textDark }]}>Manage Transfers</Text> */}

        </View>

        {/* 2x2 Grid for Manage Transfers */}
        <View style={styles.gridContainer}>
          <TouchableOpacity
            style={styles.card}
            activeOpacity={0.7}
            onPress={() => setIsAddModalVisible(true)}
          >
            <View style={[styles.iconContainer, { backgroundColor: Colors.infoBg }]}>
              <MaterialCommunityIcons name="account-plus-outline" size={28} color={Colors.infoDark} />
            </View>
            <Text style={[styles.cardTitle, { color: Colors.textDark }]}>Add Beneficiary</Text>
            <Text style={[styles.cardSubtitle, { color: Colors.textSecondary }]}>
              Register new bank accounts
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.card}
            activeOpacity={0.7}
            onPress={() => navigation.navigate('Add_BeneficiaryList')}
          >
            <View style={[styles.iconContainer, { backgroundColor: Colors.successLight }]}>
              <MaterialCommunityIcons name="account-group-outline" size={28} color={Colors.successDark} />
            </View>
            <Text style={[styles.cardTitle, { color: Colors.textDark }]}>Beneficiary List</Text>
            <Text style={[styles.cardSubtitle, { color: Colors.textSecondary }]}>
              Manage saved contacts
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.card}
            activeOpacity={0.7}
            onPress={() => navigation.navigate('PayBeneficiary')}
          >
            <View style={[styles.iconContainer, { backgroundColor: Colors.borderLight }]}>
              <MaterialCommunityIcons name="sync" size={28} color={Colors.textSecondary} />
            </View>
            <Text style={[styles.cardTitle, { color: Colors.textDark }]}>Pay Beneficiary</Text>
            <Text style={[styles.cardSubtitle, { color: Colors.textSecondary }]}>
              Transfer funds instantly
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.card}
            activeOpacity={0.7}
            onPress={() => navigation.navigate('Payment_Report')}
          >
            <View style={[styles.iconContainer, { backgroundColor: Colors.warningLight }]}>
              <MaterialCommunityIcons name="chart-bar" size={28} color={Colors.warningDark} />
            </View>
            <Text style={[styles.cardTitle, { color: Colors.textDark }]}>Payment Report</Text>
            <Text style={[styles.cardSubtitle, { color: Colors.textSecondary }]}>
              Detailed history & logs
            </Text>
          </TouchableOpacity>
        </View>

        {/* Summary Stats Section */}
        <Text style={[styles.sectionTitle, { color: Colors.textDark, marginBottom: 16 }]}>
          Summary Stats
        </Text>
        <View style={styles.statsContainer}>
          <View style={styles.statCard}>
            <Text style={[styles.statLabel, { color: Colors.textSecondary }]}>
              Total Beneficiaries
            </Text>
            <View style={styles.statValueContainer}>
              <Text style={[styles.statValue, { color: Colors.textDark }]}>128</Text>
              {/* <View style={[styles.badge, { backgroundColor: '#E6F4EA' }]}>
                <Text style={[styles.badgeText, { color: '#137333' }]}>+5%</Text>
              </View> */}
            </View>
          </View>

          <View style={styles.statCard}>
            <Text style={[styles.statLabel, { color: Colors.textSecondary }]}>
              Total Transfers
            </Text>
            <View style={styles.statValueContainer}>
              <Text style={[styles.statValue, { color: Colors.textDark }]}>842</Text>
              {/* <View style={[styles.badge, { backgroundColor: '#E8F0FE' }]}>
                <Text style={[styles.badgeText, { color: '#1A73E8' }]}>+12%</Text>
              </View> */}
            </View>
          </View>
        </View>

        {/* Exclusive Offers Banner */}
        <LinearGradient
          colors={[Colors.primaryDark, Colors.primary]}
          style={styles.offerBanner}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
        >
          <View style={styles.offerTextContent}>
            <Text style={styles.offerLabel}>EXCLUSIVE OFFERS</Text>
            <Text style={styles.offerMainTitle}>Cashback up to ₹100</Text>
            <TouchableOpacity style={styles.offerButton} activeOpacity={0.8}>
              <Text style={[styles.offerButtonText, { color: Colors.primary }]}>View Offers</Text>
            </TouchableOpacity>
          </View>
          <View style={styles.offerIconContainer}>
            <MaterialCommunityIcons name="gift-outline" size={40} color="white" />
          </View>
        </LinearGradient>

        {/* Quick Actions Section */}
        <View style={styles.sectionHeader}>
          <Text style={[styles.sectionTitle, { color: Colors.textDark }]}>Quick Actions</Text>
          <TouchableOpacity>
            <Text style={[styles.viewAll, { color: Colors.primary }]}>View All</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.quickActionsContainer}>
          <TouchableOpacity style={styles.quickActionItem} activeOpacity={0.7}>
            <View style={[styles.quickActionIcon, { backgroundColor: Colors.infoBg }]}>
              <MaterialCommunityIcons name="bank-outline" size={24} color={Colors.infoDark} />
            </View>
            <Text style={[styles.quickActionLabel, { color: Colors.textDark }]}>DMT</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.quickActionItem} activeOpacity={0.7}>
            <View style={[styles.quickActionIcon, { backgroundColor: Colors.successLight }]}>
              <MaterialCommunityIcons name="flash-outline" size={24} color={Colors.successDark} />
            </View>
            <Text style={[styles.quickActionLabel, { color: Colors.textDark }]}>Bills</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.quickActionItem} activeOpacity={0.7}>
            <View style={[styles.quickActionIcon, { backgroundColor: Colors.warningBg }]}>
              <MaterialCommunityIcons name="train" size={24} color={Colors.error} />
            </View>
            <Text style={[styles.quickActionLabel, { color: Colors.textDark }]}>Travel</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.quickActionItem} activeOpacity={0.7}>
            <View style={[styles.quickActionIcon, { backgroundColor: Colors.bgInput }]}>
              <MaterialCommunityIcons name="wallet-outline" size={24} color={Colors.primary} />
            </View>
            <Text style={[styles.quickActionLabel, { color: Colors.textDark }]}>Wallet</Text>
          </TouchableOpacity>
        </View>

        {/* Bottom spacing for ScrollView */}
        <View style={{ height: 80 }} />
      </WrapperComponent>

      {/* Floating Action Button (FAB) */}


      <Add_Beneficiary
        isVisible={isAddModalVisible}
        onClose={() => setIsAddModalVisible(false)}
        onSubmitSuccess={() => { }}
      />
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
  scrollContent: {
    paddingHorizontal: 20,
    paddingTop: 16,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    // marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 20,
    // fontFamily: Poppins.bold,
    fontWeight: 'bold',
  },
  viewAll: {
    fontSize: 16,
    // fontFamily: Poppins.semiBold,
    fontWeight: '600',
  },
  gridContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  card: {
    width: '48%',
    backgroundColor: Colors.white,
    borderRadius: 24,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: Colors.borderLight,
    shadowColor: Colors.shadow,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.02,
    shadowRadius: 8,
    elevation: 1,
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  cardTitle: {
    fontSize: 16,
    // fontFamily: Poppins.bold,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  cardSubtitle: {
    fontSize: 12,
    // fontFamily: Poppins.regular,
    lineHeight: 16,
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 28,
  },
  statCard: {
    width: '48%',
    backgroundColor: Colors.bgInput,
    borderRadius: 20,
    padding: 16,
    borderWidth: 1,
    borderColor: Colors.borderLight,
  },
  statLabel: {
    fontSize: 12,
    // fontFamily: Poppins.medium,
    fontWeight: '500',
    marginBottom: 8,
  },
  statValueContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  statValue: {
    fontSize: 20,
    // fontFamily: Poppins.bold,
    fontWeight: 'bold',
  },
  badge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  badgeText: {
    fontSize: 12,
    // fontFamily: Poppins.bold,
    fontWeight: 'bold',
  },
  offerBanner: {
    borderRadius: 24,
    padding: 24,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 28,
  },
  offerTextContent: {
    flex: 1,
  },
  offerLabel: {
    color: 'rgba(255, 255, 255, 0.8)',
    fontSize: 12,
    // fontFamily: Poppins.bold,
    fontWeight: 'bold',
    letterSpacing: 1,
  },
  offerMainTitle: {
    color: Colors.white,
    fontSize: 20,
    // fontFamily: Poppins.bold,
    fontWeight: 'bold',
    marginVertical: 8,
  },
  offerButton: {
    backgroundColor: Colors.white,
    paddingHorizontal: 18,
    paddingVertical: 8,
    borderRadius: 14,
    alignSelf: 'flex-start',
    marginTop: 4,
  },
  offerButtonText: {
    fontWeight: 'bold',
    fontSize: 12,
    // fontFamily: Poppins.bold,
  },
  offerIconContainer: {
    width: 64,
    height: 64,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.3)',
  },
  quickActionsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    backgroundColor: Colors.white,
    borderRadius: 24,
    padding: 20,
    borderWidth: 1,
    borderColor: Colors.borderLight,
    shadowColor: Colors.shadow,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.02,
    shadowRadius: 8,
    elevation: 1,
    marginBottom: 24,
  },
  quickActionItem: {
    alignItems: 'center',
    flex: 1,
  },
  quickActionIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  quickActionLabel: {
    fontSize: 12,
    // fontFamily: Poppins.semiBold,
    fontWeight: '600',
  },
  fab: {
    position: 'absolute',
    bottom: 24,
    right: 20,
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: Colors.shadow,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 6,
  },
  dynamicHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 24,
    paddingVertical: 4,
  },
  dynamicBackButton: {
    marginRight: 16,
    padding: 4,
  },
  dynamicTitle: {
    fontSize: 20,
    // fontFamily: Poppins.bold,
    fontWeight: 'bold',
  },
});

export default Dtm_services;
