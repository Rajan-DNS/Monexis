import React, { useEffect, useLayoutEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  StatusBar,
  Dimensions,
  Image,
  Share,
  Alert,
  Platform,
  ActivityIndicator, // 1. Added ActivityIndicator
} from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import LinearGradient from 'react-native-linear-gradient';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import Ionicons from 'react-native-vector-icons/Ionicons';
import Colors from '../../../theme/colors';
import AppHeader from '../../../components/Header/AppHeader';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useFocusEffect } from '@react-navigation/native';
import { useAppSelector } from '../../../redux/hooks';
import { selectCurrentUser } from '../../../redux/slices/authSlice';

// Sub-components
import Recharge from './Recharge/components/Preplan/Recharge';
import Utilities from './Utilities/Utilities';
import Bookings from './Bookings/Bookings';
import TransfersPayments from './TransfersPayments/TransfersPayments';
import Dtm_services from './DTM/Dtm_services';

const { width, height } = Dimensions.get('window');

import { CompositeScreenProps } from '@react-navigation/native';
import { BottomTabScreenProps } from '@react-navigation/bottom-tabs';
import { RootStackParamList } from '../../../navigation/RootNavigator';
import { TabParamList } from '../../../navigation/MainTabs';

import HomeScreenSkeleton from './HomeScreenSkeleton';
import KycVerificationModal, { KycData } from '../../../components/Modals/KycVerificationModal';
import { Poppins } from '../../../theme/typography';
import { Spacing, Typography } from '../../../theme';
import KycVerificationOne from '../../../components/Modals/KycVerificationOne';
import { useGetuserblanceQuery } from '../../../redux/services/mainApi/Common/CommonApi';
import Finance from './Recharge/Finance/Finance';

type HomeScreenProps = CompositeScreenProps<
  BottomTabScreenProps<TabParamList, 'Home'>,
  NativeStackScreenProps<RootStackParamList>
>;

const HomeScreen: React.FC<HomeScreenProps> = ({ navigation }) => {
  const user = useAppSelector(selectCurrentUser);
  const [isBalanceVisible, setIsBalanceVisible] = React.useState(true);
  const [isLoading, setIsLoading] = React.useState(true);
  const [showDtmServices, setShowDtmServices] = React.useState(false);
  const [isKycVisible, setIsKycVisible] = React.useState(false);
  const [localBalance, setLocalBalance] = React.useState<string | null>(null);
  const scrollViewRef = React.useRef<ScrollView>(null);
  const width = Dimensions.get('window').width;
  const height = Dimensions.get('window').height;
  const userDataget = AsyncStorage.getItem('userData')
  console.log('userDataget', userDataget)

  const { data, refetch, isFetching } = useGetuserblanceQuery();
  console.log(user)
  useFocusEffect(
    React.useCallback(() => {
      refetch();
      const getLocalBalance = async () => {
        const storedBalance = await AsyncStorage.getItem('P2ABalance');
        if (storedBalance) {
          setLocalBalance(storedBalance);
        }
      };
      getLocalBalance();
    }, [refetch])
  );


  console.log('height', height);
  console.log('width', width);

  React.useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 2000);
    return () => clearTimeout(timer);
  }, []);

  React.useEffect(() => {
    if (user?.isKycApproved === false) {
      setIsKycVisible(true);
    }
  }, [user?.isKycApproved]);

  React.useEffect(() => {
    if (showDtmServices) {
      setTimeout(() => {
        scrollViewRef.current?.scrollTo({ y: 0, animated: true });
      }, 100);
    }
  }, [showDtmServices]);

  const handleKycSubmit = (data: KycData) => {
    console.log('Submitted KYC Data:', data);
    setIsKycVisible(false);
  };

  const handleRefreshBalance = async () => {
    try {
      const res = await refetch();
      if (res?.data?.data?.p2ABalance !== undefined) {
        const newBalance = res.data.data.p2ABalance.toString();
        await AsyncStorage.setItem('P2ABalance', newBalance);
        setLocalBalance(newBalance);
      }
    } catch (error) {
      console.log('Error refreshing balance:', error);
    }
  };

  const REFERRAL_CODE = "RAJAN100";

  const handleShare = async () => {
    const deepLink = `tapnpay://referral?code=${REFERRAL_CODE}`;
    const playStoreLink = `https://play.google.com/store/apps/details?id=com.tapnpay.app&referrer=${REFERRAL_CODE}`;
    const shareMessage = `Hey! Join me on TapNPay to make quick payments and earn rewards. Use my referral code: ${REFERRAL_CODE} or download directly using this link:\n\n${deepLink}\n\nDon't have the app? Get it here: ${playStoreLink}`;

    try {
      const result = await Share.share({
        message: shareMessage,
        title: 'Invite & Earn Cashback!',
      });

      if (result.action === Share.sharedAction) {
        if (result.activityType) {
          console.log(`Shared via ${result.activityType}`);
        } else {
          console.log('Link shared successfully!');
        }
      } else if (result.action === Share.dismissedAction) {
        console.log('Share dismissed');
      }
    } catch (error: any) {
      Alert.alert('Error', error.message);
    }
  };

  if (isLoading) {
    return (
      <View style={{ flex: 1 }}>
        <AppHeader
          isHome
          onLogout={() => (navigation as any).reset({ index: 0, routes: [{ name: 'Login' }] })}
          onProfilePress={() => navigation.navigate('MainTabs', { screen: 'Profile' })}
        />
        <HomeScreenSkeleton />
      </View>
    );
  }

  const currentBalance = localBalance ?? data?.data?.p2ABalance ?? user?.p2PBalance ?? '0.00';

  return (
    <View style={[styles.container, { backgroundColor: Colors.bg }]}>
      <StatusBar barStyle="dark-content" backgroundColor={Colors.bg} />

      <AppHeader
        isHome
        onLogout={() => (navigation as any).reset({ index: 0, routes: [{ name: 'Login' }] })}
        onProfilePress={() => navigation.navigate('MainTabs', { screen: 'Profile' })}
      />
      <LinearGradient
        colors={[ Colors.primary, Colors.primaryDark,]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.headerGradient}
      >
        {/* Header User Profile Bar */}
        <View style={styles.profileSection}>
          <View style={styles.userInfoRow}>
            {/* Avatar Container */}
            <TouchableOpacity
              onPress={() => navigation.navigate('MainTabs', { screen: 'Profile' })}
              style={styles.avatarContainer}
              activeOpacity={0.8}
            >
              <Text style={styles.avatarText}>
                {user?.name ? user.name.charAt(0).toUpperCase() : 'U'}
              </Text>
            </TouchableOpacity>

            <View style={{ marginLeft: 12 }}>
              <Text style={styles.welcomeLabel}>Welcome Back 👋</Text>
              <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                <Text style={styles.userName} numberOfLines={1}>
                  {user?.name || 'User'}
                </Text>
                {user?.role && (
                  <View style={styles.roleBadge}>
                    <Text style={styles.roleBadgeText}>{user.role}</Text>
                  </View>
                )}
              </View>
            </View>
          </View>

          {/* KYC / Status Badge */}
          <View style={styles.statusBadge}>
            <MaterialCommunityIcons
              name={user?.isKycApproved ? "shield-check" : "shield-alert"}
              size={14}
              color={user?.isKycApproved ? Colors.success : "#FFD700"}
            />
            <Text style={styles.statusBadgeText}>
              {user?.isKycApproved ? "Verified" : "Pending KYC"}
            </Text>
          </View>
        </View>

        {/* Modernized Balance Card */}
        <View style={styles.balanceCard}>
          <View style={styles.balanceHeader}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
              <Ionicons name="wallet-outline" size={18} color={Colors.white} />
              <Text style={styles.balanceLabel}>Available Balance</Text>
            </View>

            <View style={styles.actionIconsRow}>
              <TouchableOpacity
                onPress={handleRefreshBalance}
                disabled={isFetching}
                style={styles.iconIconButton}
              >
                {isFetching ? (
                  <ActivityIndicator size="small" color="#fff" />
                ) : (
                  <Ionicons name="refresh-outline" size={18} color="#fff" />
                )}
              </TouchableOpacity>

              <TouchableOpacity
                onPress={() => setIsBalanceVisible(!isBalanceVisible)}
                style={styles.iconIconButton}
              >
                <Ionicons
                  name={isBalanceVisible ? 'eye-outline' : 'eye-off-outline'}
                  size={18}
                  color="#fff"
                />
              </TouchableOpacity>
            </View>
          </View>

          <View style={styles.balanceAmountRow}>
            <Text style={styles.balanceAmount}>
              ₹ {isBalanceVisible ? currentBalance : '••••••'}
            </Text>

            {/* Quick Action Button inside Balance Card */}
            {/* <TouchableOpacity
              style={styles.addMoneyButton}
              activeOpacity={0.8}
              onPress={() => console.log('Add Money Pressed')}
            >
              <Ionicons name="add-circle" size={16} color={Colors.primary} />
              <Text style={styles.addMoneyText}>Add Money</Text>
            </TouchableOpacity> */}
          </View>
        </View>
      </LinearGradient>

      <ScrollView
        ref={scrollViewRef}
        style={styles.scrollView}
        bounces={false}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.contentBody}>
          {showDtmServices ? (
            <Dtm_services
              isDynamic={true}
              onBack={() => setShowDtmServices(false)}
            />
          ) : (
            <>
              <Recharge />
              {/* <Bookings /> */}
              <Utilities />
              <View style={styles.promoRow} >
                <View style={styles.cashbackBanner}>
                  <View style={styles.cashbackLeft}>
                    <Text style={styles.cashbackSub}>Recharge & Get Assured</Text>
                    <Text style={styles.cashbackTitle}>CASHBACK</Text>
                    <Text style={styles.cashbackPromo}>Upto <Text style={{ color: Colors.success }}>₹50</Text></Text>
                    <TouchableOpacity style={styles.viewOffersBtn} activeOpacity={0.8}>
                      <Text style={styles.viewOffersText}>View Offers</Text>
                      <Ionicons name="chevron-forward" size={10} color={Colors.white} style={{ marginLeft: 2 }} />
                    </TouchableOpacity>
                  </View>
                  <View style={styles.illustrationContainer}>
                    <Image
                      source={require('../../../Assets/img/DTH/rech.png')}
                      style={{ width: '100%', height: '100%' }}
                      resizeMode="contain"
                    />
                  </View>
                </View>
              </View>

              <TransfersPayments onDmtPress={() => setShowDtmServices(true)} />

              <View style={[styles.promoRow, { marginTop: 12 }]}>
                <View style={styles.cashbackBanner}>
                  <View style={styles.cashbackLeft}>
                    <Text style={styles.cashbackSub}>Earn Cashback</Text>
                    <Text style={styles.cashbackTitle}>Referral Code</Text>
                    <Text style={styles.cashbackPromo}>
                      Earn up to <Text style={{ color: Colors.success }}>₹100</Text>
                    </Text>

                    <Text style={{ fontSize: 12, color: Colors.textSecondary, marginTop: 4, marginBottom: 10 }}>
                      Invite your friends to join TapNPay and get rewards on every successful referral.
                    </Text>

                    <TouchableOpacity
                      style={styles.viewOffersBtn}
                      onPress={handleShare}
                      activeOpacity={0.8}>
                      <Text style={styles.viewOffersText}>Share Now</Text>
                      <Ionicons
                        name="share-social-outline"
                        size={14}
                        color={Colors.white}
                        style={{ marginLeft: 4 }}
                      />
                    </TouchableOpacity>
                  </View>

                  <View style={styles.illustrationContainer}>
                    <Image
                      source={require('../../../Assets/img/DTH/rech.png')}
                      style={{ width: '100%', height: '100%' }}
                      resizeMode="contain"
                    />
                  </View>
                </View>
              </View>
              <View style={{ height: 40 }} />
            </>
          )}
        </View>
      </ScrollView>

      <KycVerificationModal
        visible={isKycVisible}
        onClose={() => setIsKycVisible(false)}
        onVerify={handleKycSubmit}
      />
    </View>
  );
};

// ... Styles remain exactly the same as yours
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.bg,
  },
  scrollView: {
    flex: 1,
    marginTop: Platform.OS === 'ios' ? 20 : 20,
  },




  userRole: {
    color: Colors.inputBorder,
    fontSize: 16,
    // fontFamily: Poppins.medium,

  },




  statsRow: {
    flexDirection: 'row',
    marginTop: 15,
    justifyContent: 'space-between',
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
  },
  statValue: {
    color: Colors.white,
    fontSize: 16,
    // fontFamily: Poppins.bold,
    fontWeight: 'bold',

  },
  headerGradient: {
    paddingTop: Platform.OS === 'ios' ? 12 : 15,
    paddingBottom: 20,
    borderBottomLeftRadius: 28,
    borderBottomRightRadius: 28,
  },
  profileSection: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: Spacing.lg,
    marginBottom: 16,
  },
  userInfoRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatarContainer: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderWidth: 1.5,
    borderColor: 'rgba(255, 255, 255, 0.4)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarText: {
    color: Colors.white,
    fontSize: 18,
    fontWeight: 'bold',
  },
  welcomeLabel: {
    color: 'rgba(255, 255, 255, 0.75)',
    fontSize: 11,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  userName: {
    color: Colors.white,
    fontSize: 16,
    fontWeight: 'bold',
    maxWidth: 140,
  },
  roleBadge: {
    backgroundColor: 'rgba(255, 255, 255, 0.25)',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 10,
    marginLeft: 6,
  },
  roleBadgeText: {
    color: Colors.white,
    fontSize: 10,
    fontWeight: '600',
    textTransform: 'capitalize',
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: 'rgba(0, 0, 0, 0.2)',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.15)',
  },
  statusBadgeText: {
    color: Colors.white,
    fontSize: 11,
    fontWeight: '500',
  },
  balanceCard: {
    marginHorizontal: Spacing.lg,
    padding: 16,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.25)',
  },
  balanceHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  balanceLabel: {
    color: 'rgba(255, 255, 255, 0.85)',
    fontSize: 13,
    fontWeight: '500',
  },
  actionIconsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  iconIconButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  balanceAmountRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 12,
  },
  balanceAmount: {
    color: Colors.white,
    fontSize: 26,
    fontWeight: 'bold',
    letterSpacing: 0.5,
  },
  addMoneyButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: Colors.white,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
  },
  addMoneyText: {
    color: Colors.primary,
    fontSize: 12,
    fontWeight: 'bold',
  },
  statLabel: {
    color: Colors.inputBorder,
    fontSize: 12,
    marginTop: Spacing.sm,
    // fontFamily: Poppins.medium,

  },
  statDivider: {
    width: 1,
    backgroundColor: Colors.inputBorder,
  },
  headerSubText: {
    color: Colors.inputBorder,
    fontSize: 16,
    // fontFamily: Poppins.regular
    // ,
    marginTop: 12,
    lineHeight: 22,
    width: '80%',
  },
  headerSubText1: {
    color: Colors.inputBorder,
    fontSize: 16,
    lineHeight: 22,
    width: '80%',
    // fontFamily: Poppins.semiBol

  },
  headerTextContent: {
    flexDirection: 'column',
    justifyContent: "space-between",
    paddingHorizontal: Spacing.lg,
    paddingTop: Spacing.xl,
  },
  balanceRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: Spacing.sm,
  },
  balanceTextWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  eyeButton: {
    marginLeft: Spacing.md,
    opacity: 0.9,
  },
  currencySymbol: {
    fontSize: 20,
    // fontFamily: Poppins.semiBol
    // d,
    color: Colors.white,
    fontWeight: '600',
  },
  percentageBadge: {
    backgroundColor: Colors.bgSurface,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderRadius: 12,
    marginLeft: Spacing.md,
  },
  percentageText: {
    color: Colors.badgeSuccessText,
    fontWeight: 'bold',
    fontSize: 12,
    // fontFamily: Poppins.bold,


  },
  contentBody: {
    backgroundColor: Colors.white,
    borderTopLeftRadius: 40,
    borderTopRightRadius: 40,
    paddingHorizontal: Spacing.lg,
  },
  offerBanner: {
    borderRadius: Spacing.md,
    padding: Spacing.xl,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.xl,
  },
  offerTextContent: {
    flex: 1,
  },
  offerLabel: {
    color: Colors.infoLight,
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


    marginVertical: Spacing.md,
  },
  offerButton: {
    backgroundColor: Colors.white,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderRadius: 12,
    alignSelf: 'flex-start',
    marginTop: Spacing.sm,
  },
  offerButtonText: {
    color: Colors.white,
    fontWeight: 'bold',
    fontSize: 12,
    // fontFamily: Poppins.bold,


  },
  offerIconContainer: {
    width: 70,
    height: 70,
    borderRadius: 20,
    backgroundColor: Colors.inputBorder,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: Colors.inputBorder,
  },
  promoRow: {
  },
  cashbackBanner: {
    width: '100%',
    backgroundColor: Colors.infoBg,
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderWidth: 1,
    borderColor: Colors.infoLight,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: 10,
  },
  cashbackLeft: {
    zIndex: 2,
    width: "40%"
  },
  cashbackSub: {
    fontSize: 12,
    // fontFamily: Poppins.medium,

    color: Colors.textBody,
  },
  cashbackTitle: {
    fontSize: 16,
    // fontFamily: Poppins.bold,
    fontWeight: 'bold',

    color: Colors.primary,
    marginVertical: 1,
    letterSpacing: 0.5,
  },
  cashbackPromo: {
    fontSize: 16,
    // fontFamily: Poppins.bold,
    fontWeight: 'bold',

    color: Colors.textDark,
  },
  viewOffersBtn: {
    backgroundColor: Colors.primary,
    borderRadius: 12,
    paddingHorizontal: 20,
    paddingVertical: 12,
    // alignSelf: 'flex-start',
    marginTop: 8,
    flexDirection: 'row',
    alignItems: 'center',
  },
  viewOffersText: {
    color: Colors.white,
    fontSize: 12,
    // fontFamily: Poppins.bold,
    fontWeight: 'bold',

  },
  illustrationContainer: {
    height: height * 0.2,
    width: width * 0.45,
  },
});

export default HomeScreen;