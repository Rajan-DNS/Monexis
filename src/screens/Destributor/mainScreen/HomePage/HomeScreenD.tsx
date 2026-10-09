import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  StatusBar,
  Dimensions,
  Image,
  Platform,
  ActivityIndicator,
} from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import LinearGradient from 'react-native-linear-gradient';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import Ionicons from 'react-native-vector-icons/Ionicons';
import Colors from '../../../../theme/colors';
import AppHeader from '../../../../components/Header/AppHeader';
import { useAppSelector } from '../../../../redux/hooks';

// Modals
import AddRetailerModal from './Retailer/AddRetailerModal';
import AddBankModal from './BankingSevice/AddBankModal';
import AddTopUpModal from './Top-up-service/AddTopUpModal';
import { HomeSkeleton } from '../../../../components/Skeleton';

const { width } = Dimensions.get('window');

import { CompositeScreenProps } from '@react-navigation/native';
import { BottomTabScreenProps } from '@react-navigation/bottom-tabs';
import { RootStackParamList } from '../../../../navigation/RootNavigator';
import { TabParamList } from '../../../../navigation/MainTabs';
import FundTransferListScreen from './Top-up-service/FundTransferListScreen';
import AddFundScreen from './Top-up-service/AddFundScreen';
import { Poppins } from '../../../../theme/typography';
import KycVerificationModal, { KycData } from '../../../../components/Modals/KycVerificationModal';
import { useGetuserblanceQuery } from '../../../../redux/services/mainApi/Common/CommonApi';

type HomeScreenDProps = CompositeScreenProps<
  BottomTabScreenProps<TabParamList, 'Home'>,
  NativeStackScreenProps<RootStackParamList>
>;

const renderServiceCard = (title: string, icon: string, iconColor: string, bgColor: string, onPress?: () => void) => (
  <TouchableOpacity style={styles.serviceCard} onPress={onPress} activeOpacity={0.7}>
    <View style={[styles.iconContainer, { backgroundColor: bgColor }]}>
      <MaterialCommunityIcons name={icon} size={30} color={iconColor} />
    </View>
    <Text style={styles.serviceCardText}>{title}</Text>
  </TouchableOpacity>
);

const renderTopUpItem = (title: string, icon: string, iconColor: string, borderColor: string, onPress?: () => void) => (
  <TouchableOpacity style={styles.topUpItem} onPress={onPress} activeOpacity={0.7}>
    <View style={[styles.topUpIconCircle, { borderColor: borderColor }]}>
      <MaterialCommunityIcons name={icon} size={24} color={iconColor} />
    </View>
    <Text style={styles.topUpText}>{title}</Text>
  </TouchableOpacity>
);

const HomeScreenD: React.FC<HomeScreenDProps> = ({ navigation }) => {
  const user = useAppSelector((state: any) => state.auth.user);
  const [isBalanceVisible, setIsBalanceVisible] = useState(true);
  const [isLoading, setIsLoading] = useState(true);
  const [isKycVisible, setIsKycVisible] = React.useState(false);

  console.log("User", user);
  React.useEffect(() => {
    if (user?.isKycApproved === false) {
      setIsKycVisible(true);
    }
  }, [user?.isKycApproved]);
  useEffect(() => {
    const timer = setTimeout(() => setIsLoading(false), 2000);
    return () => clearTimeout(timer);
  }, []);
  const handleKycSubmit = (data: KycData) => {
    console.log('Submitted KYC Data:', data);
    setIsKycVisible(false);
  };

  const { data: balanceData, refetch, isFetching } = useGetuserblanceQuery();
  const [localBalance, setLocalBalance] = useState<string | null>(null);

  const handleRefreshBalance = async () => {
    try {
      const result = await refetch();
      if (result.data?.success && result.data.data) {
        setLocalBalance(result.data.data.p2ABalance?.toString());
      }
    } catch (error) {
      console.error('Failed to refresh balance:', error);
    }
  };

  const currentBalance = localBalance ?? balanceData?.data?.p2ABalance ?? user?.p2PBalance ?? '0.00';

  // Modal States
  const [isRetailerModalVisible, setIsRetailerModalVisible] = useState(false);
  const [isBankModalVisible, setIsBankModalVisible] = useState(false);
  const [isTopUpModalVisible, setIsTopUpModalVisible] = useState(false);
  const [isfundtransferModalVisible, setIsFundTransferModalVisible] = useState(false);

  return (
    <View style={[styles.container, { backgroundColor: Colors.bg }]}>
      <StatusBar
        barStyle="dark-content"
        backgroundColor={Platform.OS === 'android' ? Colors.bg : 'transparent'}
        translucent={Platform.OS === 'ios'}
      />

      <AppHeader
        isHome
        onLogout={() => (navigation as any).reset({ index: 0, routes: [{ name: 'Login' }] })}
        onProfilePress={() => navigation.navigate('MainTabs', { screen: 'Profile' })}
      />

      {isLoading ? (
        <HomeSkeleton />
      ) : (
        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          bounces={Platform.OS === 'ios'}
          showsVerticalScrollIndicator={false}
        >
          {/* Role-Based Header Section */}
          <LinearGradient
            colors={[Colors.primaryDark, Colors.primary]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.headerGradient}
          >
            <View style={styles.profileSection}>
              <View>
                <Text style={styles.welcomeLabel}>👋 Welcome Back</Text>
                <Text style={styles.userName}>
                  {user?.name || 'User'} {(user?.role )&& `(${user.role})`}
                </Text>
              </View>
            </View>

            <View style={styles.balanceCard}>
              <View style={styles.balanceHeader}>
                <Text style={styles.balanceLabel}>
                  Available Balance
                </Text>
              </View>
              <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 12 }}>
                <Text style={styles.balanceAmount}>
                  ₹ {isBalanceVisible ? currentBalance : '******'}
                </Text>

                {/* Action buttons wrapper */}
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 15 }}>
                  {/* Refresh Balance Button */}
                  <TouchableOpacity onPress={handleRefreshBalance} disabled={isFetching}>
                    {isFetching ? (
                      <ActivityIndicator size="small" color="#fff" />
                    ) : (
                      <Ionicons name="refresh-outline" size={22} color="#fff" />
                    )}
                  </TouchableOpacity>

                  {/* Toggle Eye Button */}
                  <TouchableOpacity onPress={() => setIsBalanceVisible(!isBalanceVisible)}>
                    <Ionicons
                      name={isBalanceVisible ? 'eye-outline' : 'eye-off-outline'}
                      size={22}
                      color="#fff"
                    />
                  </TouchableOpacity>
                </View>
              </View>
            </View>
          </LinearGradient>

          {/* White Content Body */}
          <View style={styles.contentBody}>

            {/* Retailer Service */}
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Retailers</Text>
              <TouchableOpacity onPress={() => navigation.navigate('RetailerList')}>
                <Text style={styles.managementLink}>MANAGEMENT</Text>
              </TouchableOpacity>
            </View>
            <View style={styles.servicesGrid}>
              {renderServiceCard('Add Retailer', 'account-plus-outline', '#4A90E2', 'rgba(74, 144, 226, 0.1)', () => {
                console.warn('Opening Retailer Modal');
                setIsRetailerModalVisible(true);
              })}
              {renderServiceCard('Retailers List', 'format-list-bulleted', '#F5A623', 'rgba(245, 166, 35, 0.1)', () => navigation.navigate('RetailerList'))}
            </View>

            {/* Banking Service */}
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Banking Service</Text>
              <TouchableOpacity onPress={() => navigation.navigate('BankList')}>
                <Text style={styles.managementLink}>FINANCIALS</Text>
              </TouchableOpacity>
            </View>
            <View style={styles.servicesGrid}>
              {renderServiceCard('Add Banks', 'bank-outline', '#E35D5D', 'rgba(227, 93, 93, 0.1)', () => {
                setIsBankModalVisible(true);
              })}
              {renderServiceCard('Banks List', 'wallet-outline', '#9B51E0', 'rgba(155, 81, 224, 0.1)', () => navigation.navigate('BankList'))}
            </View>

            {/* Top-up Service */}
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Top-up Service</Text>
              <TouchableOpacity onPress={() => navigation.navigate('TopUpList')}>
                <Text style={styles.managementLink}>WALLET</Text>
              </TouchableOpacity>
            </View>
            <View style={styles.topUpGrid}>
              {renderTopUpItem('Add\ntop-up', 'plus', '#F5A623', '#F5A623', () => setIsTopUpModalVisible(true))}
              {renderTopUpItem('Top up\nlist', 'file-document-outline', '#27AE60', '#27AE60', () => navigation.navigate('TopUpList'))}
              {renderTopUpItem('Fund\nTransfer', 'swap-horizontal', '#E91E63', '#E91E63', () => setIsFundTransferModalVisible(true))}
              {renderTopUpItem('Fund\nData', 'database-outline', '#2D9CDB', '#2D9CDB', () => navigation.navigate('FundTransferList'))}
            </View>

            <View style={{ height: 40 }} />
          </View>
        </ScrollView>
      )}

      {/* Modals */}
      {isRetailerModalVisible && (
        <AddRetailerModal
          isVisible={isRetailerModalVisible}
          onClose={() => setIsRetailerModalVisible(false)}
        />
      )}

      {isBankModalVisible && (
        <AddBankModal
          isVisible={isBankModalVisible}
          onClose={() => setIsBankModalVisible(false)}
        />
      )}

      {isTopUpModalVisible && (
        <AddTopUpModal
          isVisible={isTopUpModalVisible}
          onClose={() => setIsTopUpModalVisible(false)}
        />
      )}
      {isfundtransferModalVisible && (
        <AddFundScreen
          isVisible={isfundtransferModalVisible}
          onClose={() => setIsFundTransferModalVisible(false)}
        />
      )}
      <KycVerificationModal
        visible={isKycVisible}
        onClose={() => setIsKycVisible(false)}
        onVerify={handleKycSubmit}
      />

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
    paddingBottom: Platform.OS === 'ios' ? 10 : 1,
  },
  headerGradient: {
    paddingBottom: Platform.OS === 'ios' ? 25 : 50,

  },
  headerContent: {
    paddingHorizontal: 24,
    paddingBottom: Platform.OS === 'ios' ? 50 : 20,
  },
  profileSection: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingTop: Platform.OS === 'ios' ? 50 : 20,
    paddingVertical: Platform.OS === 'ios' ? 10 : 0,
  },
  welcomeLabel: {
    color: 'rgba(255, 255, 255, 0.7)',
    fontSize: 16,
    fontFamily: Poppins.semiBold,
    fontWeight: '600',
    letterSpacing: 1,
  },
  userName: {
    color: '#FFFFFF',
    fontSize: 20,
    fontFamily: Poppins.bold,
    fontWeight: 'bold',
    marginTop: 4,
  },
  headerSubText: {
    color: 'rgba(255, 255, 255, 0.8)',
    fontSize: 16,
    fontFamily: Poppins.regular,
    marginTop: 12,
    lineHeight: 22,
    width: '80%',
  },
  headerSubText1: {
    color: 'rgba(255, 255, 255, 0.8)',
    fontSize: 16,
    fontFamily: Poppins.regular,
    lineHeight: 22,
    width: '80%',
  },
  headerTextContent: {
    paddingHorizontal: 24,
    paddingTop: Platform.OS === 'ios' ? 10 : 20,
  },
  balanceCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    borderRadius: 20,
    padding: 20,
    marginTop: 24,
    marginHorizontal: 18,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 10 },
        shadowOpacity: 0.1,
        shadowRadius: 15,
      },
    }),
  },
  balanceHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  balanceLabel: {
    color: 'rgba(255, 255, 255, 0.9)',
    fontSize: 16,
    fontFamily: Poppins.medium,
    fontWeight: '500',
  },
  balanceRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 12,
  },
  balanceTextWrapper: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    width: '50%',
  },
  eyeButton: {
    marginLeft: 10,
    opacity: 0.9,
  },
  balanceAmount: {
    color: '#FFFFFF',
    fontSize: 20,
    fontFamily: Poppins.bold,
    fontWeight: 'bold',
  },
  currencySymbol: {
    fontSize: 20,
    fontFamily: Poppins.semiBold,
    color: '#FFFFFF',
    fontWeight: '600',
  },
  contentBody: {
    backgroundColor: '#FFFFFF',
    marginTop: Platform.OS === 'ios' ? -60 : -40,
    borderTopLeftRadius: 40,
    borderTopRightRadius: 40,
    paddingHorizontal: 24,
    paddingTop: 32,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: -10 },
        shadowOpacity: 0.05,
        shadowRadius: 10,
      },
    }),
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
    marginTop: 8,
  },
  sectionTitle: {
    fontSize: 20,
    fontFamily: Poppins.bold,
    fontWeight: '700',
    color: '#333',
  },
  managementLink: {
    fontSize: 12,
    fontFamily: Poppins.bold,
    fontWeight: 'bold',
    color: '#0052D4',
    letterSpacing: 1,
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
    alignItems: 'flex-start',
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.05,
        shadowRadius: 10,
      },
      android: {
        elevation: 0.3,
      },
    }),
    borderWidth: 1,
    borderColor: '#F0F0F0',
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  serviceCardText: {
    fontSize: 16,
    fontFamily: Poppins.semiBold,
    fontWeight: '600',
    color: '#444',
    lineHeight: 20,
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
  topUpIconCircle: {
    width: 56,
    height: 56,
    borderRadius: 28,
    borderWidth: 1,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
    backgroundColor: '#FFF',
  },
  topUpText: {
    fontSize: 12,
    fontFamily: Poppins.semiBold,
    fontWeight: '600',
    color: '#666',
    textAlign: 'center',
    lineHeight: 14,
  },
});

export default HomeScreenD;
