import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { Platform } from 'react-native';

// Screens & Navigators
import LoginScreen from '../screens/auth/LoginScreen';
import RegisterScreen from '../screens/auth/RegisterScreen';
import ForgotPasswordScreen from '../screens/auth/ForgotPasswordScreen';
import LoginWithOTPScreen from '../screens/auth/LoginWithOTPScreen';
import OTPVerificationScreen from '../screens/auth/OTPVerificationScreen';
import ResetPasswordScreen from '../screens/auth/ResetPasswordScreen';
import SplashScreen from '../screens/auth/SplashScreen';
import MainTabs from './MainTabs';
import { NavigatorScreenParams } from '@react-navigation/native';
import { TabParamList } from './MainTabs';
import PlanConfirmationScreen from '../screens/main/HomePage/Recharge/components/PopularPlans/PlanConfirmationScreen';
import RechargeSuccessScreen from '../screens/main/HomePage/Recharge/components/PopularPlans/RechargeSuccessScreen';
import ElectricityRechargeScreen from '../screens/main/HomePage/Recharge/ ElectricityRecharge/ElectricityReachargescreen';
import ElectricityBill from '../screens/main/HomePage/Recharge/ ElectricityRecharge/ElectricityBill';
import ElectricityPay from '../screens/main/HomePage/Recharge/ ElectricityRecharge/Electricitypay';
import DTHRechargeScreen from '../screens/main/HomePage/Recharge/DTHRecharge/DTHRechargeScreen';
import DTHBill from '../screens/main/HomePage/Recharge/DTHRecharge/DTHBill';
import DTHPay from '../screens/main/HomePage/Recharge/DTHRecharge/DTHPay';
import HistoryScreen from '../screens/main/History/HistoryScreen';
import GasRechargeScreen from '../screens/main/HomePage/Recharge/GasRecharge/GasRechargeScreen';
import GasBill from '../screens/main/HomePage/Recharge/GasRecharge/GasBill';
import GasPay from '../screens/main/HomePage/Recharge/GasRecharge/GasPay';
import BroadbandRechargeScreen from '../screens/main/HomePage/Recharge/BroadbandRecharge/BroadbandRechargeScreen';
import BroadbandBill from '../screens/main/HomePage/Recharge/BroadbandRecharge/BroadbandBill';
import BroadbandPay from '../screens/main/HomePage/Recharge/BroadbandRecharge/BroadbandPay';
import LandlineRechargeScreen from '../screens/main/HomePage/Recharge/Landline/LandlineRechargeScreen';
import LandlineBill from '../screens/main/HomePage/Recharge/Landline/LandlineBill';
import LandlinePay from '../screens/main/HomePage/Recharge/Landline/LandlinePay';
import WaterRechargeScreen from '../screens/main/HomePage/Recharge/WaterRecharge/WaterRechargeScreen';
import WaterBill from '../screens/main/HomePage/Recharge/WaterRecharge/WaterBill';
import WaterPay from '../screens/main/HomePage/Recharge/WaterRecharge/WaterPay';
import FastagRechargeScreen from '../screens/main/HomePage/Recharge/FastagRecharge/FastagRechargeScreen';
import FastagBill from '../screens/main/HomePage/Recharge/FastagRecharge/FastagBill';
import FastagPay from '../screens/main/HomePage/Recharge/FastagRecharge/FastagPay';
import GasBookingScreen from '../screens/main/HomePage/Recharge/Gas_Booking/GasBookingScreen';
import GasBookingBill from '../screens/main/HomePage/Recharge/Gas_Booking/GasBookingBill';
import GasBookingPay from '../screens/main/HomePage/Recharge/Gas_Booking/GasBookingPay';
import RetailerListScreen from '../screens/Destributor/mainScreen/HomePage/Retailer/RetailerListScreen';
import AboutUsScreen from '../screens/main/Profile/AboutUsScreen';
import ContactUsScreen from '../screens/main/Profile/ContactUsScreen';
import TextContentScreen from '../screens/main/Profile/TextContentScreen';
import PrivacyPolicyScreen from '../screens/main/Profile/PrivacyPolicyScreen';
import TermsConditionsScreen from '../screens/main/Profile/TermsConditionsScreen';
import RefundAndCancellationPolicyScreen from '../screens/main/Profile/RefundAndCancellationPolicyScreen';
import CookiePolicyScreen from '../screens/main/Profile/CookiePolicyScreen';

// Top-up Service Screens
import AddTopUpScreen from '../screens/Destributor/mainScreen/HomePage/Top-up-service/AddTopUpScreen';
import TopUpListScreen from '../screens/Destributor/mainScreen/HomePage/Top-up-service/TopUpListScreen';
import AddFundScreen from '../screens/Destributor/mainScreen/HomePage/Top-up-service/AddFundScreen';
import FundTransferListScreen from '../screens/Destributor/mainScreen/HomePage/Top-up-service/FundTransferListScreen';
import BankListScreen from '../screens/Destributor/mainScreen/HomePage/BankingSevice/BankListScreen';
import RechargeReportScreen from '../screens/main/ReportScreen/RechargeReportScreen';
import TransactionReportScreen from '../screens/main/ReportScreen/TransactionReportScreen';
import DaybookReportScreen from '../screens/main/ReportScreen/DaybookReportScreen';
import ReferralLinkReportScreen from '../screens/main/ReportScreen/ReferralLinkReportScreen';
import ReferralReportScreen from '../screens/main/ReportScreen/ReferralReportScreen';
import CashBackReportScreen from '../screens/main/ReportScreen/CashBackReportScreen';
import CommissionReportScreen from '../screens/main/ReportScreen/CommissionReportScreen';
import CommissionRangeScreen from '../screens/main/ReportScreen/CommissionRangeScreen';
import Dtm_services from '../screens/main/HomePage/DTM/Dtm_services';
import Add_BeneficiaryList from '../screens/main/HomePage/DTM/AddBeneficiary/Add_BeneficiaryList';
import PayBeneficiary from '../screens/main/HomePage/DTM/payBeneficiary/PayBeneficiary';
import Payment_Report from '../screens/main/HomePage/DTM/payBeneficiary/Payment_Report';
import Transaction_Detailes from '../screens/main/HomePage/DTM/payBeneficiary/Transaction_Detailes';
import RechargeScreen from '../screens/main/HomePage/Recharge/components/Preplan/RecherScreens';
import CardToCashConfirmScreen from '../screens/main/HomePage/Cardtocash/CardToCashConfirmScreen';
import CardToCashPayScreen from '../screens/main/HomePage/Cardtocash/CardToCashPayScreen';
import ScanPayConfirmScreen from '../screens/main/HomePage/Scan&pay/ScanPayConfirmScreen';
import ScanPayPayScreen from '../screens/main/HomePage/Scan&pay/ScanPayPayScreen';
import QRScannerScreen from '../screens/main/HomePage/Scan&pay/QRScannerScreen';
import CompanyBankList from '../screens/main/HomePage/CompanyBank/CompanyBankList';
import BookNewPolicyScreen from '../screens/main/HomePage/LIC/BookNewPolicyScreen';
import PolicyDetailsScreen from '../screens/main/HomePage/LIC/PolicyDetailsScreen';
import PaymentScreen from '../screens/main/HomePage/LIC/PaymentScreen';
import LICSuccessScreen from '../screens/main/HomePage/LIC/LICSuccessScreen';

import CableTVRechargeScreen from '../screens/main/HomePage/Recharge/CableTvBill/CableTVRechargeScreen';
import CableTVDetailsScreen from '../screens/main/HomePage/Recharge/CableTvBill/CableTVDetailsScreen';
import CableTVPayScreen from '../screens/main/HomePage/Recharge/CableTvBill/CableTVPayScreen';


// Types
export type RootStackParamList = {

  Splash: undefined;
  Login: undefined;
  Register: { showSignUp?: boolean } | undefined;
  ForgotPassword: undefined;
  LoginWithOTP: undefined;
  OTPVerification: { phone: string };
  ResetPassword: { phone: string; otp: string };
  MainTabs: NavigatorScreenParams<TabParamList>;
  RechargeScreen: undefined;
  PlanConfirmation: {
    plan?: any;
    mobileNumber?: string;
    amount?: string;
    operator?: any;
    circle?: string;
    isPostpaid?: boolean;
    rechargePin?: string;
  };
  RechargeSuccess: {
    mobileNumber: string;
    amount: string;
    operator: string;
    circle: string;
    isPostpaid?: boolean;
    plan?: any;
    data: any;
  };
  ElectricityBill: {
    circle?: { id: number; name: string } | null;
    operator?: { id: number; name: string } | null;
    consumerNumber?: string;
    amount?: string;
  } | undefined;
  ElectricityRechargeScreen: undefined;
  ElectricityPay: undefined;
  DTHRechargeScreen: undefined;
  DTHBill: {
    mobileNumber: string;
    amount: string;
    operator: any;
    plan?: any;
  };
  DTHPay: {
    mobileNumber: string;
    amount: string;
    operator: any;
    plan?: any;
  };
  HistoryScreen: undefined;
  GasRechargeScreen: undefined;
  GasPay: undefined;
  BroadbandRechargeScreen: undefined;
  BroadbandPay: undefined;
  LandlineRechargeScreen: undefined;
  LandlinePay: undefined;
  LandlineBill: {
    operator: any;
    consumerNumber: string;
    amount?: string;
    dynamicValues?: any;
    validationData?: any;
  };
  WaterRechargeScreen: undefined;
  WaterBill: {
    operator: {
      id: string;
      value: string;
      name: string;
      text: string;
    };
    consumerNumber: string;
    amount: string;
  };
  GasBill: {
    operator: {
      id: string;
      value: string;
      name: string;
      text: string;
    };
    consumerNumber: string;
    amount: string;
  };
  GasBookingBill: {
    operator: {
      id: string | number;
      value: string | number;
      name: string;
      text: string;
    };
    consumerNumber: string;
    amount: string;
  };
  WaterPay: undefined;
  FastagRechargeScreen: undefined;
  FastagBill: undefined;
  FastagPay: undefined;
  GasBookingScreen: undefined;
  GasBookingPay: undefined;
  FastagRecharge: undefined; // Some components might use this name
  RetailerList: undefined;
  AboutUs: undefined;
  ContactUs: undefined;
  PolicyDetailsScreen: undefined;
  TextContent: { title: string; content?: { title: string; text: string }[] };
  PrivacyPolicy: undefined;
  TermsConditions: undefined;
  RefundAndCancellationPolicy: undefined;
  CookiePolicy: undefined;
  // Top-up Service
  AddTopUp: undefined;
  TopUpList: undefined;
  AddFund: undefined;
  FundTransferList: undefined;
  BankList: undefined;
  RechargeReport: undefined;
  TransactionReport: undefined;
  DaybookReport: undefined;
  ReferralLinkReport: undefined;
  ReferralReport: undefined;
  CashBackReport: undefined;
  CommissionReport: undefined;
  CommissionRange: undefined;
  Dtm_services: undefined;
  Add_BeneficiaryList: undefined;
  PayBeneficiary: undefined;
  Payment_Report: undefined;
  BookNewPolicyScreen: undefined;
  PaymentScreen: undefined;
  LICSuccessScreen: undefined;
  CableTVRechargeScreen: undefined;
  CableTVDetailsScreen: {
    operator: any;
    circle: any;
    consumerNumber: string;
  };
  CableTVPayScreen: {
    operator: any;
    circle: any;
    consumerNumber: string;
    plan: any;
  };

  Transaction_Detailes: { transaction?: any };
  // Card to Cash
  CardToCashConfirmScreen: undefined;
  CardToCashPayScreen: {
    card: { id: string; label: string; last4: string; network: string; color: string[] };
    amount: string;
    fee: string;
    total: string;
  };
  // Scan & Pay
  ScanPayConfirmScreen: undefined;
  QRScannerScreen: undefined;
  ScanPayPayScreen: {
    payee: { name: string; upiId: string; category: string; verified: boolean };
    amount: string;
    note?: string;
  };
  CompanyBankList: undefined;
  BroadbandBill: {
    operator: {
      id: string;
      value: string;
      name: string;
      text: string;
    };
    consumerNumber: string;
    amount: string;
    dynamicValues: Record<string, any>;
    validationData: any | null;
  };

};

import { navigationRef } from './navigationService';

const Stack = createNativeStackNavigator<RootStackParamList>();

const RootNavigator: React.FC = () => {
  return (
    <NavigationContainer ref={navigationRef}>
      <Stack.Navigator
        initialRouteName="Splash"
        screenOptions={{
          headerShown: false,
          // Common modern animation for mobile
          animation: 'slide_from_right',
          // Ensure StatusBar is visible and doesn't cause layout issues
          statusBarAnimation: 'fade',
          statusBarStyle: 'auto',
          // Prevent StatusBar from overlapping content
          contentStyle: { 
            backgroundColor: 'transparent' 
          },
        }}
      >
        <Stack.Screen
          name="Splash"
          component={SplashScreen}
        />
        <Stack.Screen
          name="Login"
          component={LoginScreen}
        />
        <Stack.Screen
          name="Register"
          component={RegisterScreen}
        />
        <Stack.Screen
          name="ForgotPassword"
          component={ForgotPasswordScreen}
        />
        <Stack.Screen
          name="LoginWithOTP"
          component={LoginWithOTPScreen}
        />
        <Stack.Screen
          name="OTPVerification"
          component={OTPVerificationScreen}
        />
        <Stack.Screen
          name="ResetPassword"
          component={ResetPasswordScreen}
        />

        <Stack.Screen
          name="MainTabs"
          component={MainTabs}
          options={{
            // 'push' animation makes it feel like entering the app
            animation: 'fade_from_bottom',
          }}
        />
        <Stack.Screen
          name="RechargeScreen"
          component={RechargeScreen}
        />
        <Stack.Screen
          name="PlanConfirmation"
          component={PlanConfirmationScreen}
        />
        <Stack.Screen
          name="RechargeSuccess"
          component={RechargeSuccessScreen}
        />
        <Stack.Screen
          name="ElectricityRechargeScreen"
          component={ElectricityRechargeScreen}
        />
        <Stack.Screen
          name="ElectricityBill"
          component={ElectricityBill}
        />
        <Stack.Screen
          name="ElectricityPay"
          component={ElectricityPay}
        />
        <Stack.Screen
          name="DTHRechargeScreen"
          component={DTHRechargeScreen}
        />
        <Stack.Screen
          name="DTHBill"
          component={DTHBill}
        />
        <Stack.Screen
          name="DTHPay"
          component={DTHPay}
        />
        <Stack.Screen
          name="HistoryScreen"
          component={HistoryScreen}
        />
        <Stack.Screen
          name="GasRechargeScreen"
          component={GasRechargeScreen}
        />
        <Stack.Screen
          name="GasBill"
          component={GasBill}
        />
        <Stack.Screen
          name="GasPay"
          component={GasPay}
        />
        <Stack.Screen
          name="BroadbandRechargeScreen"
          component={BroadbandRechargeScreen}
        />
        <Stack.Screen
          name="BroadbandBill"
          component={BroadbandBill}
        />
        <Stack.Screen
          name="BroadbandPay"
          component={BroadbandPay}
        />
        <Stack.Screen
          name="LandlineRechargeScreen"
          component={LandlineRechargeScreen}
        />
        <Stack.Screen
          name="LandlineBill"
          component={LandlineBill}
        />
        <Stack.Screen
          name="LandlinePay"
          component={LandlinePay}
        />
        <Stack.Screen
          name="WaterRechargeScreen"
          component={WaterRechargeScreen}
        />
        <Stack.Screen
          name="WaterBill"
          component={WaterBill}
        />
        <Stack.Screen
          name="WaterPay"
          component={WaterPay}
        />
        <Stack.Screen
          name="FastagRechargeScreen"
          component={FastagRechargeScreen}
        />
        <Stack.Screen
          name="FastagBill"
          component={FastagBill}
        />
        <Stack.Screen
          name="FastagPay"
          component={FastagPay}
        />
        <Stack.Screen
          name="GasBookingScreen"
          component={GasBookingScreen}
        />
        <Stack.Screen
          name="GasBookingBill"
          component={GasBookingBill}
        />
        <Stack.Screen
          name="GasBookingPay"
          component={GasBookingPay}
        />


        <Stack.Screen name='BookNewPolicyScreen' component={BookNewPolicyScreen} />
        <Stack.Screen name='PolicyDetailsScreen' component={PolicyDetailsScreen} />
        <Stack.Screen name='PaymentScreen' component={PaymentScreen} />
        <Stack.Screen name='LICSuccessScreen' component={LICSuccessScreen} />
        <Stack.Screen name='CableTVRechargeScreen' component={CableTVRechargeScreen} />
        <Stack.Screen name='CableTVDetailsScreen' component={CableTVDetailsScreen} />
        <Stack.Screen name='CableTVPayScreen' component={CableTVPayScreen} />

        <Stack.Screen
          name="RetailerList"
          component={RetailerListScreen}
        />
        <Stack.Screen
          name="AboutUs"
          component={AboutUsScreen}
        />
        <Stack.Screen
          name="ContactUs"
          component={ContactUsScreen}
        />
        <Stack.Screen
          name="TextContent"
          component={TextContentScreen}
        />
        <Stack.Screen
          name="PrivacyPolicy"
          component={PrivacyPolicyScreen}
        />
        <Stack.Screen
          name="TermsConditions"
          component={TermsConditionsScreen}
        />
        <Stack.Screen
          name="RefundAndCancellationPolicy"
          component={RefundAndCancellationPolicyScreen}
        />
        <Stack.Screen
          name="CookiePolicy"
          component={CookiePolicyScreen}
        />

        {/* Top-up Service */}
        <Stack.Screen
          name="AddTopUp"
          component={AddTopUpScreen}
        />
        <Stack.Screen
          name="TopUpList"
          component={TopUpListScreen}
        />
        <Stack.Screen
          name="AddFund"
          component={AddFundScreen}
        />
        <Stack.Screen
          name="FundTransferList"
          component={FundTransferListScreen}
        />
        <Stack.Screen
          name="BankList"
          component={BankListScreen}
        />
        <Stack.Screen name="RechargeReport" component={RechargeReportScreen} />
        <Stack.Screen name="TransactionReport" component={TransactionReportScreen} />
        <Stack.Screen name="DaybookReport" component={DaybookReportScreen} />
        <Stack.Screen name="ReferralLinkReport" component={ReferralLinkReportScreen} />
        <Stack.Screen name="ReferralReport" component={ReferralReportScreen} />
        <Stack.Screen name="CashBackReport" component={CashBackReportScreen} />
        <Stack.Screen name="CommissionReport" component={CommissionReportScreen} />
        <Stack.Screen name="CommissionRange" component={CommissionRangeScreen} />
        <Stack.Screen
          name="Dtm_services"
          component={Dtm_services}
        />
        <Stack.Screen
          name="Add_BeneficiaryList"
          component={Add_BeneficiaryList}
        />
        <Stack.Screen
          name="PayBeneficiary"
          component={PayBeneficiary}
        />
        <Stack.Screen
          name="Payment_Report"
          component={Payment_Report}
        />
        <Stack.Screen
          name="Transaction_Detailes"
          component={Transaction_Detailes}
        />

        {/* Card to Cash */}
        <Stack.Screen
          name="CardToCashConfirmScreen"
          component={CardToCashConfirmScreen}
        />
        <Stack.Screen
          name="CardToCashPayScreen"
          component={CardToCashPayScreen}
        />

        {/* Scan & Pay */}
        <Stack.Screen name="ScanPayConfirmScreen" component={ScanPayConfirmScreen} />
        <Stack.Screen name="QRScannerScreen" component={QRScannerScreen} options={{ animation: 'slide_from_bottom' }} />
        <Stack.Screen name="ScanPayPayScreen" component={ScanPayPayScreen} />
        <Stack.Screen name="CompanyBankList" component={CompanyBankList} />

      </Stack.Navigator>
    </NavigationContainer>
  );
};

export default RootNavigator;
