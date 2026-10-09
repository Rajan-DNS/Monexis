import React, { useState, useEffect, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  TextInput,
  Modal,
  SafeAreaView,
  Dimensions,
  Alert,
  ActivityIndicator,
  Platform,
  PermissionsAndroid,
  Linking,
  AppState,
} from 'react-native';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import DeviceInfo from 'react-native-device-info';
import Geolocation from '@react-native-community/geolocation';

import Colors from '../../../../../theme/colors';
import AppHeader from '../../../../../components/Header/AppHeader';
import { BeneficiaryService } from '../../../../../redux/services/RetailerServices/Beneficiary/BeneficiaryService';
import { useGetBankListQuery, useGetTransferTypeNameQuery } from '../../../../../redux/services/mainApi/Common/CommonApi';
import { useGetuserblanceQuery } from '../../../../../redux/services/mainApi/Common/CommonApi'; // Adjust path if needed

const { width } = Dimensions.get('window');

import { getAllDeviceData, logAllDeviceData, } from '../../../../../components/parseDeviceInfo/parseDeviceInfo';
import FailedModal from '../../../../../components/Modals/FailedModal';
import BeneficiarySelectionModal from '../../../../../components/Modals/BeneficiarySelectionModal';
import { useSelector } from 'react-redux';
import SuccessModal from '../../../../../components/Modals/SuccessModal';
import { Poppins } from '../../../../../theme/typography';
import { formatDate } from '../../../../../components/DATE/Dateformat';
import PaymentAuthModal from '../../../../../components/Modals/PaymentAuthModal';


const PayBeneficiary = () => {
  const navigation = useNavigation();
  const {
    fetchBeneficiaryList,
    payBeneficiary,
    isDMTPayLoading,
  } = BeneficiaryService();

  // RTK Query Hooks
  const { data: bankListData } = useGetBankListQuery();
  const { data: transferTypeResponse, isLoading: isTransferTypeLoading } = useGetTransferTypeNameQuery();
  const { data: balanceData, refetch: refetchBalance, isFetching: isBalanceFetching } = useGetuserblanceQuery();


  // Get user details from Redux state for backup balance reference if needed
  const user = useSelector((state: any) => state.auth?.user);

  const [beneficiaries, setBeneficiaries] = useState<any[]>([]);
  const [selectedBeneficiary, setSelectedBeneficiary] = useState<any>(null);
  const [isBeneficiaryModalVisible, setIsBeneficiaryModalVisible] = useState(false);

  const [transferType, setTransferType] = useState('');
  const [amount, setAmount] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('Wallet');
  const [locationCoords, setLocationCoords] = useState<{ latitude: number; longitude: number } | null>(null);
  const [deviceModel, setDeviceModel] = useState<string>('Detecting Device...');
  const [isSuccessModalVisible, setIsSuccessModalVisible] = useState(false);
  const [isFailedModalVisible, setIsFailedModalVisible] = useState(false);
  const [transactionData, setTransactionData] = useState<any>(null);
  const [hasLocationPermission, setHasLocationPermission] = useState(false);
  const [isLocationPermissionModalVisible, setIsLocationPermissionModalVisible] = useState(false);
  const [isRefreshingLocation, setIsRefreshingLocation] = useState(false);
  const [isAuthModalVisible, setIsAuthModalVisible] = useState(false);

  // Dedicated Field Validation Errors
  const [beneficiaryError, setBeneficiaryError] = useState('');
  const [transferTypeError, setTransferTypeError] = useState('');
  const [amountError, setAmountError] = useState('');

  // Fallback chain for balance evaluation
  const currentBalance = balanceData?.data?.p2ABalance ?? balanceData?.data?.p2PBalance ?? user?.p2PBalance ?? '0.00';

  const transferTypesList = useMemo(() => {
    const rawList = Array.isArray(transferTypeResponse)
      ? transferTypeResponse
      : transferTypeResponse?.data || [];

    const filteredList = rawList.filter((item: any) => {
      const isFour = String(item.value) === '4';
      const isAllType = String(item.text || '').toUpperCase() === 'ALL';
      return !isFour && !isAllType;
    });

    return [...filteredList];
  }, [transferTypeResponse]);

  useEffect(() => {
    loadBeneficiaries();
    getDeviceDetails();
    checkAndRequestLocationPermission();

    // Listen for app state changes (when user comes back from settings)
    const subscription = AppState.addEventListener('change', handleAppStateChange);

    return () => {
      subscription?.remove();
    };
  }, []);

  // Fetch location every time user navigates to this screen
  useFocusEffect(
    React.useCallback(() => {
      console.log('Screen focused - checking location permission and fetching location');
      checkAndRequestLocationPermission();
      return () => {
        // Cleanup if needed
      };
    }, [])
  );

  const handleAppStateChange = (nextAppState: string) => {
    if (nextAppState === 'active') {
      // App has come to the foreground, re-check location permission
      console.log('App state changed to active - re-checking location');
      checkAndRequestLocationPermission();
    }
  };

  const getDeviceDetails = async () => {
    try {
      await logAllDeviceData();
      const syncData = {
        uniqueId: DeviceInfo.getUniqueIdSync(),
        bundleId: DeviceInfo.getBundleId(),
        systemName: DeviceInfo.getSystemName(),
        systemVersion: DeviceInfo.getSystemVersion(),
        brand: DeviceInfo.getBrand(),
        model: DeviceInfo.getModel(),
        deviceId: DeviceInfo.getDeviceId(),
        apiLevel: Platform.OS === 'android' ? DeviceInfo.getApiLevelSync() : -1,
        isEmulator: DeviceInfo.isEmulatorSync(),
        isTablet: DeviceInfo.isTablet(),
        appName: DeviceInfo.getApplicationName(),
        appVersion: DeviceInfo.getVersion(),
        buildNumber: DeviceInfo.getBuildNumber(),
      };
      setDeviceModel(`${syncData.brand} ${syncData.model} ${syncData.systemName} ${syncData.systemVersion} - App v${syncData.appVersion} build ${syncData.buildNumber} - ${syncData.isEmulator ? 'Emulator' : 'Physical'}`);
    } catch (error) {
      setDeviceModel(`${Platform.OS} Mobile Device`);
    }
  };

  const requestLocationSpecs = async () => {
    console.log('requestLocationSpecs called');
    if (Platform.OS === 'android') {
      try {
        const granted = await PermissionsAndroid.request(
          PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
          {
            title: 'Location Access Request',
            message: 'Secure transaction settlement parameters require current tracking values enabled.',
            buttonNeutral: 'Ask Me Later',
            buttonNegative: 'Cancel',
            buttonPositive: 'OK',
          }
        );
        console.log('Permission result:', granted);
        if (granted === PermissionsAndroid.RESULTS.GRANTED) {
          console.log('Permission granted, fetching location...');
          setHasLocationPermission(true);
          getCurrentGPSCoordinates();
          return true;
        } else {
          console.log('Permission denied');
          setHasLocationPermission(false);
          return false;
        }
      } catch (err) {
        console.warn('Error requesting permission:', err);
        setHasLocationPermission(false);
        return false;
      }
    } else {
      // For iOS, we'll assume permission is granted if getCurrentPosition succeeds
      console.log('iOS - fetching location directly');
      getCurrentGPSCoordinates();
      setHasLocationPermission(true);
      return true;
    }
  };

  const checkAndRequestLocationPermission = async () => {
    console.log('checkAndRequestLocationPermission called');
    if (Platform.OS === 'android') {
      try {
        const hasPermission = await PermissionsAndroid.check(
          PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION
        );

        console.log('Current permission status:', hasPermission);

        if (hasPermission) {
          console.log('Permission already granted, fetching location...');
          setHasLocationPermission(true);
          getCurrentGPSCoordinates();
        } else {
          console.log('Permission not granted, requesting permission...');
          setHasLocationPermission(false);
          // Automatically request permission
          const granted = await requestLocationSpecs();
          if (granted) {
            console.log('Permission granted after request');
          } else {
            console.log('Permission denied after request');
          }
        }
      } catch (err) {
        console.warn('Error checking permission:', err);
        setHasLocationPermission(false);
      }
    } else {
      // For iOS, try to get location and set permission based on result
      console.log('iOS - trying to get location');
      getCurrentGPSCoordinates();
      setHasLocationPermission(true);
    }
  };

  const getCurrentGPSCoordinates = () => {
    console.log('getCurrentGPSCoordinates called');
    Geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        setLocationCoords({ latitude, longitude });
        console.log('✅ Location fetched successfully:', latitude, longitude);
      },
      (error) => {
        console.warn('❌ Geolocation failed - Code:', error.code, 'Message:', error.message);
        // On iOS, if location fails, mark permission as false
        if (Platform.OS === 'ios' && error.code !== 3) { // code 3 is timeout
          setHasLocationPermission(false);
        }
        // On Android, if permission error
        if (error.code === 1) { // PERMISSION_DENIED
          setHasLocationPermission(false);
        }
      },
      { enableHighAccuracy: true, timeout: 15000, maximumAge: 10000 }
    );
  };

  const loadBeneficiaries = async () => {
    try {
      const response = await fetchBeneficiaryList(1, 100);
      if (response.success && response.data) {
        const dataArray = Array.isArray(response.data) ? response.data : [];
        setBeneficiaries(dataArray);
        if (dataArray.length > 0 && !selectedBeneficiary) {
          setSelectedBeneficiary(dataArray[0]);
        }
      }
    } catch (error) {
      console.warn('Failed to load beneficiaries:', error);
    }
  };

  const handleAmountChange = (text: string) => {
    if (text.includes('-')) {
      setAmountError('Minus value not allowed');
      return;
    }
    if (text.includes('.')) {
      setAmountError('Point value not allowed');
      return;
    }

    setAmountError('');

    let cleaned = text.replace(/[^0-9.]/g, '');

    const parts = cleaned.split('.');
    if (parts.length > 2) {
      cleaned = parts[0] + '.' + parts.slice(1).join('');
    }

    setAmount(cleaned);
  };

  const handleCheckBalance = () => {
    refetchBalance();
  };

  const handlePayNow = async () => {
    // Check location permission first
    if (!hasLocationPermission) {
      setIsLocationPermissionModalVisible(true);
      return;
    }

    let hasError = false;

    setBeneficiaryError('');
    setTransferTypeError('');
    setAmountError('');

    if (!selectedBeneficiary) {
      setBeneficiaryError('Please select a beneficiary');
      hasError = true;
    }

    if (!transferType) {
      setTransferTypeError('Please select a payment transfer type');
      hasError = true;
    }

    if (!amount || Number(amount) <= 0) {
      setAmountError('Please enter a valid amount');
      hasError = true;
    }

    if (hasError) return;

    // Show Auth Modal instead of processing directly
    setIsAuthModalVisible(true);
  };

  const processPayment = async (pin: string) => {
    setIsAuthModalVisible(false);

    // Retain input field values for modals/receipts before clearing
    const currentAmount = amount;
    const currentTransferType = transferType;
    const currentBeneficiary = selectedBeneficiary;

    try {
      const selectedTypeObj = transferTypesList.find(
        (t: any) => (t.text || '').toUpperCase() === currentTransferType.toUpperCase()
      );

      const parsedDevice = await getAllDeviceData();

      const paymentData = {
        beneficiaryId: currentBeneficiary?.id,
        mediumId: 2,
        amount: Number(currentAmount),
        transferType: currentTransferType,
        transferTypeId: selectedTypeObj?.value === 'all' ? 0 : (Number(selectedTypeObj?.value) || 2),

        deviceInfo: deviceModel,
        deviceId: parsedDevice.deviceId,
        deviceMode: parsedDevice.model,

        latitude: locationCoords ? locationCoords.latitude : null,
        longitude: locationCoords ? locationCoords.longitude : null,
        locationInfo: locationCoords
          ? `Lat: ${locationCoords.latitude}, Long: ${locationCoords.longitude}`
          : null,
      };

      // Clear the input fields upon calling processPayment
      resetForm();

      const response = await payBeneficiary(paymentData);

      // Handle parsed data if response.data is stringified JSON
      let parsedData: any = response?.data;
      if (typeof parsedData === 'string') {
        try {
          parsedData = JSON.parse(parsedData);
        } catch (e) {
          console.error('Failed to parse response.data JSON:', e);
          parsedData = {};
        }
      }

      console.log('payBeneficiary parsed response data:', parsedData);

      const txStatus = (parsedData?.Status || parsedData?.status || '').toUpperCase();
      const isTxSuccess = response?.success === true && (txStatus === 'SUCCESS' || txStatus === 'SUCCESSFUL');

      const txnPayload = {
        ...(parsedData && typeof parsedData === 'object' ? parsedData : {}),
        amount: currentAmount,
        transferType: currentTransferType,
        beneficiary: currentBeneficiary,
        txnId: (parsedData?.TransactionId !== undefined && parsedData?.TransactionId !== null && parsedData?.TransactionId !== '')
          ? String(parsedData.TransactionId)
          : (parsedData?.txnId ? String(parsedData.txnId) : 'N/A'),
        utrNumber: parsedData?.OperatorId || parsedData?.utrNumber || parsedData?.operatorId || 'N/A',
        bankName: currentBeneficiary?.bankName || parsedData?.bankName || 'N/A',
        accNo: currentBeneficiary?.accountNumber || parsedData?.accountNumber || 'N/A',
        ifcecode: currentBeneficiary?.ifsccode || parsedData?.ifsccode || 'N/A',
        date: new Date(),
      };

      if (isTxSuccess) {
        setTransactionData({
          ...txnPayload,
          status: 'SUCCESS',
          message: parsedData?.Message || parsedData?.message || response?.message || 'Transaction Successful.',
        });
        setIsSuccessModalVisible(true);
        refetchBalance?.();
      } else {
        const errorMessage = parsedData?.Message || parsedData?.message || response?.message || 'Transaction Failed.';
        setTransactionData({
          ...txnPayload,
          error: errorMessage,
          status: txStatus || 'FAILED',
        });
        setIsFailedModalVisible(true);
        refetchBalance?.();
      }
    } catch (error: any) {
      setTransactionData({
        amount: currentAmount,
        transferType: currentTransferType,
        beneficiary: currentBeneficiary,
        error: error.message || 'Payment failed',
        status: 'FAILED',
        date: new Date(),
      });
      setIsFailedModalVisible(true);
    }
  };

  const handleRequestLocationPermission = async () => {
    setIsLocationPermissionModalVisible(false);
    const granted = await requestLocationSpecs();

    if (granted) {
      // Permission granted, location will be fetched automatically
      Alert.alert(
        'Permission Granted',
        'Location permission granted successfully. You can now proceed with payment.',
        [{ text: 'OK' }]
      );
    } else {
      // Permission denied, show option to open settings
      Alert.alert(
        'Permission Required',
        'Location permission is required to process payments. Please enable it in your device settings.',
        [
          { text: 'Cancel', style: 'cancel' },
          {
            text: 'Open Settings',
            onPress: () => {
              if (Platform.OS === 'android') {
                Linking.openSettings();
              } else {
                Linking.openURL('app-settings:');
              }
            },
          },
        ]
      );
    }
  };

  const handleRefreshLocation = async () => {
    setIsRefreshingLocation(true);

    if (Platform.OS === 'android') {
      const hasPermission = await PermissionsAndroid.check(
        PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION
      );

      if (!hasPermission) {
        const granted = await requestLocationSpecs();
        setIsRefreshingLocation(false);
        if (!granted) {
          Alert.alert(
            'Permission Denied',
            'Location permission is required. Please tap "Pay Now" to grant permission or enable it in Settings.',
            [{ text: 'OK' }]
          );
        }
        return;
      }
    }

    await checkAndRequestLocationPermission();
    setTimeout(() => {
      setIsRefreshingLocation(false);
    }, 2000);
  };

  const handleOpenSettings = () => {
    console.log('Opening device settings...');
    Alert.alert(
      'Enable Location Permission',
      'You will be redirected to device settings. Please enable location permission for this app, then return here.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Open Settings',
          onPress: () => {
            if (Platform.OS === 'android') {
              Linking.openSettings();
            } else {
              Linking.openURL('app-settings:');
            }
            // The AppState listener will automatically refetch when user returns
          },
        },
      ]
    );
  };

  const resetForm = () => {
    setSelectedBeneficiary(null);
    setAmount('');
    setPaymentMethod('Wallet');
    setTransferType('');
    setBeneficiaryError('');
    setTransferTypeError('');
    setAmountError('');
  };

  const handleSelectBeneficiary = (beneficiary: any) => {
    setSelectedBeneficiary(beneficiary);
    setBeneficiaryError('');
    setIsBeneficiaryModalVisible(false);
  };

  const maskAccountNumber = (number: string) => {
    if (!number) return '**** **** ****';
    const clean = number.replace(/\s?/g, '');
    if (clean.length < 4) return clean;
    return `**** **** ${clean.slice(-4)}`;
  };

  return (
    <View style={styles.container}>
      <AppHeader title="Pay to Beneficiary" showBack onBackPress={() => navigation.goBack()} />

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <View style={styles.headerContainer}>
          <View style={styles.headerSubContainer}>

            {/* Beneficiary Selector */}
            <Text style={styles.sectionLabel}>SELECT BENEFICIARY</Text>
            <TouchableOpacity
              style={[styles.beneficiaryCard, beneficiaryError ? styles.inputFieldError : null]}
              activeOpacity={0.8}
              onPress={() => setIsBeneficiaryModalVisible(true)}
            >
              <View style={styles.bankIconContainer}>
                <MaterialCommunityIcons name="bank" size={24} color="#1A73E8" />
              </View>
              <View style={styles.beneficiaryInfo}>
                <Text style={styles.bankName}>{selectedBeneficiary?.bankName || 'Select Beneficiary'}</Text>
                <Text style={styles.holderName}>{selectedBeneficiary?.accountHolderName || 'No beneficiary selected'}</Text>
                <Text style={styles.accountNumber}>{selectedBeneficiary ? maskAccountNumber(selectedBeneficiary.accountNumber) : ''}</Text>
              </View>
              <View pointerEvents="none" style={styles.arrowIconWrapper}>
                <MaterialIcons name="keyboard-arrow-down" size={26} color="#5F6368" />
              </View>
            </TouchableOpacity>
            {beneficiaryError ? (
              <Text style={styles.inlineErrorText}>{beneficiaryError}</Text>
            ) : null}

            {/* Dynamic Transfer Type Selection Container */}
            <Text style={styles.sectionLabel}>TRANSFER TYPE</Text>
            <View style={[styles.transferTypeRow, transferTypeError ? styles.transferTypeRowError : null]}>
              {isTransferTypeLoading ? (
                <View style={styles.loadingWrapper}>
                  <ActivityIndicator size="small" color="#2563EB" />
                </View>
              ) : (
                (transferTypesList || []).map((item: any, index: number) => {
                  const typeName = item?.text || '';
                  const typeValue = item?.value !== undefined ? String(item.value) : `type-${index}`;

                  let subtitle = 'Standard';
                  const upperName = typeName.toUpperCase();
                  if (upperName.includes('IMPS')) subtitle = 'Instant';
                  else if (upperName.includes('NEFT')) subtitle = '2-4 Hours';
                  else if (upperName.includes('RTGS')) subtitle = 'Large Sum';

                  const isSelected = (transferType || '').trim().toLowerCase() === (typeName || '').trim().toLowerCase();

                  return (
                    <TouchableOpacity
                      key={typeValue}
                      style={[styles.typeButton, isSelected && styles.typeButtonSelected]}
                      onPress={() => {
                        setTransferType(typeName);
                        setTransferTypeError('');
                      }}
                      activeOpacity={0.7}
                    >
                      <Text style={[styles.typeText, isSelected && styles.typeTextSelected]}>
                        {typeName}
                      </Text>
                      <Text style={[styles.typeSubtitle, isSelected && styles.typeSubtitleSelected]}>
                        {subtitle}
                      </Text>
                    </TouchableOpacity>
                  );
                })
              )}
            </View>
            {transferTypeError ? (
              <Text style={styles.inlineErrorText}>{transferTypeError}</Text>
            ) : null}

            {/* Amount Input */}
            <Text style={styles.sectionLabel}>AMOUNT TO TRANSFER</Text>
            <View style={[styles.amountContainer, amountError ? styles.inputFieldError : null]}>
              <Text style={styles.rupeeSymbol}>₹</Text>
              <TextInput
                style={styles.amountInput}
                placeholder="0.00"
                placeholderTextColor="#9CA3AF"
                keyboardType="decimal-pad"
                maxLength={15}
                value={amount}
                onChangeText={handleAmountChange}
              />
            </View>
            {amountError ? (
              <Text style={styles.inlineErrorText}>{amountError}</Text>
            ) : null}

            {/* Balance Details Display Area */}
            <View style={styles.amountFooter}>
              <View style={styles.balanceContainer}>
                <Text style={styles.limitText}>AVAILABLE BALANCE: </Text>
                {isBalanceFetching ? (
                  <ActivityIndicator size="small" color="#2563EB" style={{ marginLeft: 4 }} />
                ) : (
                  <Text style={styles.balanceValueText}>₹{currentBalance}</Text>
                )}
              </View>
              <TouchableOpacity onPress={handleCheckBalance} activeOpacity={0.7}>
                <Text style={styles.checkBalanceText}>Refresh Balance</Text>
              </TouchableOpacity>
            </View>

            {/* Bottom Actions */}
            <View style={styles.bottomActions}>
              {/* Location Status Indicator */}
              <View style={styles.locationStatusContainer}>
                <View style={styles.locationStatusHeader}>
                  <View style={styles.locationStatusRow}>
                    <MaterialIcons
                      name={hasLocationPermission ? "location-on" : "location-off"}
                      size={18}
                      color={hasLocationPermission ? "#10B981" : "#EF4444"}
                    />
                    <Text style={[
                      styles.locationStatusText,
                      { color: hasLocationPermission ? "#10B981" : "#EF4444" }
                    ]}>
                      {hasLocationPermission ? "Location Enabled" : "Location Permission Required"}
                    </Text>
                  </View>
                  <View style={styles.locationActions}>
                    {!hasLocationPermission && (
                      <TouchableOpacity
                        onPress={handleOpenSettings}
                        style={styles.settingsButton}
                        activeOpacity={0.7}
                      >
                        <MaterialIcons name="settings" size={18} color="#2563EB" />
                        <Text style={styles.settingsButtonText}>Settings</Text>
                      </TouchableOpacity>
                    )}
                    <TouchableOpacity
                      onPress={handleRefreshLocation}
                      disabled={isRefreshingLocation}
                      style={styles.refreshButton}
                      activeOpacity={0.7}
                    >
                      {isRefreshingLocation ? (
                        <ActivityIndicator size="small" color="#2563EB" />
                      ) : (
                        <MaterialIcons name="refresh" size={20} color="#2563EB" />
                      )}
                    </TouchableOpacity>
                  </View>
                </View>
                {locationCoords && hasLocationPermission && (
                  <Text style={styles.locationCoordsText}>
                    📍 Lat: {locationCoords.latitude.toFixed(6)}, Long: {locationCoords.longitude.toFixed(6)}
                  </Text>
                )}
                {!hasLocationPermission && (
                  <View style={styles.locationHintContainer}>
                    <Text style={styles.locationHintText}>
                      Tap Settings to enable location permission in device settings
                    </Text>
                  </View>
                )}
              </View>

              <TouchableOpacity
                style={[
                  styles.payNowButton,
                  !hasLocationPermission && styles.payNowButtonDisabled
                ]}
                onPress={handlePayNow}
                activeOpacity={0.8}
                disabled={isDMTPayLoading}
              >
                {isDMTPayLoading ? (
                  <ActivityIndicator color="#FFF" />
                ) : (
                  <>
                    <MaterialCommunityIcons
                      name="shield-check"
                      size={20}
                      color={!hasLocationPermission ? "#9CA3AF" : "#FFF"}
                      style={{ marginRight: 8 }}
                    />
                    <Text style={[
                      styles.payNowText,
                      !hasLocationPermission && styles.payNowTextDisabled
                    ]}>Pay Now</Text>
                  </>
                )}
              </TouchableOpacity>

              <TouchableOpacity style={styles.resetButton} onPress={resetForm} activeOpacity={0.8}>
                <Text style={styles.resetText}>Reset Form</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>

        <View style={styles.securBox}>
          <MaterialCommunityIcons name="alert-circle" size={20} color="#2d2c2cff" />
          <Text style={styles.modalSubtitle}>
            Your transaction is protected by bank-grade {"\n"}256-bit encryption. Funds are usually credited {"\n"} instantly via IMPS.
          </Text>
        </View>
      </ScrollView>

      {/* Modals */}
      <SuccessModal
        visible={isSuccessModalVisible}
        onClose={() => setIsSuccessModalVisible(false)}
        transactionData={transactionData}
        amount={transactionData?.amount || amount}
        transferType={transactionData?.transferType || transferType}
        selectedBeneficiary={transactionData?.beneficiary || selectedBeneficiary}
        formatDate={formatDate}
      />

      <FailedModal
        visible={isFailedModalVisible}
        onClose={() => setIsFailedModalVisible(false)}
        transactionData={transactionData}
        amount={transactionData?.amount || amount}
        transferType={transactionData?.transferType || transferType}
        formatDate={formatDate}
        selectedBeneficiary={transactionData?.beneficiary || selectedBeneficiary}
      />

      <BeneficiarySelectionModal
        visible={isBeneficiaryModalVisible}
        onClose={() => setIsBeneficiaryModalVisible(false)}
        beneficiaries={beneficiaries}
        selectedBeneficiary={selectedBeneficiary}
        onSelect={handleSelectBeneficiary}
        maskAccountNumber={maskAccountNumber}
      />

      <PaymentAuthModal
        visible={isAuthModalVisible}
        amount={amount}
        onSuccess={processPayment}
        onClose={() => setIsAuthModalVisible(false)}
      />

      {/* Location Permission Modal */}
      <Modal
        visible={isLocationPermissionModalVisible}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setIsLocationPermissionModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.locationPermissionModal}>
            <View style={styles.locationIconContainer}>
              <MaterialIcons name="location-on" size={48} color="#2563EB" />
            </View>

            <Text style={styles.locationModalTitle}>Location Permission Required</Text>

            <Text style={styles.locationModalDescription}>
              To ensure secure transactions and comply with payment regulations, we need access to your location data. This helps us:
            </Text>

            <View style={styles.locationBenefitsList}>
              <View style={styles.locationBenefitItem}>
                <MaterialCommunityIcons name="shield-check" size={20} color="#10B981" />
                <Text style={styles.locationBenefitText}>Verify transaction authenticity</Text>
              </View>
              <View style={styles.locationBenefitItem}>
                <MaterialCommunityIcons name="security" size={20} color="#10B981" />
                <Text style={styles.locationBenefitText}>Prevent fraudulent activities</Text>
              </View>
              <View style={styles.locationBenefitItem}>
                <MaterialCommunityIcons name="check-circle" size={20} color="#10B981" />
                <Text style={styles.locationBenefitText}>Comply with banking regulations</Text>
              </View>
            </View>

            <Text style={styles.locationModalNote}>
              Your location data is only used during payment processing and is not stored or shared.
            </Text>

            <View style={styles.locationModalButtons}>
              <TouchableOpacity
                style={styles.locationAllowButton}
                onPress={handleRequestLocationPermission}
                activeOpacity={0.8}
              >
                <MaterialIcons name="location-on" size={20} color="#FFF" style={{ marginRight: 8 }} />
                <Text style={styles.locationAllowButtonText}>Grant Permission</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.locationSettingsButton}
                onPress={() => {
                  setIsLocationPermissionModalVisible(false);
                  setTimeout(() => {
                    handleOpenSettings();
                  }, 300);
                }}
                activeOpacity={0.8}
              >
                <MaterialIcons name="settings" size={20} color="#2563EB" style={{ marginRight: 8 }} />
                <Text style={styles.locationSettingsButtonText}>Open Settings</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.locationCancelButton}
                onPress={() => setIsLocationPermissionModalVisible(false)}
                activeOpacity={0.8}
              >
                <Text style={styles.locationCancelButtonText}>Cancel</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.bgLightest,
  },
  headerContainer: {
    backgroundColor: Colors.white,
    borderRadius: 20,
    elevation: 0.3,
    shadowColor: Colors.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
  },
  headerSubContainer: {
    padding: 20,
  },
  scrollContent: {
    padding: 20,
    paddingBottom: 40,
  },
  sectionLabel: {
    fontSize: 12,
    fontWeight: '700',
    color: Colors.textSecondary,
    letterSpacing: 1,
    marginBottom: 12,
    marginTop: 8,
  },
  beneficiaryCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFF',
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: Colors.divider,
  },
  bankIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 12,
    backgroundColor: '#EFF6FF',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  beneficiaryInfo: {
    flex: 1,
  },
  bankName: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1E293B',
    marginBottom: 2,
  },
  holderName: {
    fontSize: 12,
    fontWeight: '600',
    color: Colors.textSecondary,
    textTransform: 'uppercase',
  },
  accountNumber: {
    fontSize: 16,
    color: '#1E293B',
    marginTop: 4,
    letterSpacing: 1,
  },
  arrowIconWrapper: {
    padding: 4,
    justifyContent: 'center',
    alignItems: 'center',
  },
  transferTypeRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  transferTypeRowError: {
    borderWidth: 1,
    borderColor: Colors.error,
    borderRadius: 12,
    padding: 4,
  },
  loadingWrapper: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    height: 50,
  },
  typeButton: {
    flex: 1,
    backgroundColor: '#FFF',
    borderWidth: 1,
    borderColor: Colors.divider,
    borderRadius: 12,
    paddingVertical: 12,
    alignItems: 'center',
    marginHorizontal: 4,
  },
  typeButtonSelected: {
    borderColor: '#2563EB',
    backgroundColor: '#EFF6FF',
  },
  typeText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1E293B',
  },
  typeTextSelected: {
    color: '#2563EB',
  },
  typeSubtitle: {
    fontSize: 12,
    color: Colors.textSecondary,
    marginTop: 2,
  },
  typeSubtitleSelected: {
    color: '#3B82F6',
  },
  amountContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFF',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: Colors.divider,
    paddingHorizontal: 16,
    height: 60,
  },
  rupeeSymbol: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1E293B',
    marginRight: 8,
  },
  amountInput: {
    flex: 1,
    fontSize: 20,
    fontWeight: '700',
    color: '#1E293B',
  },
  inputFieldError: {
    borderColor: Colors.error,
    borderWidth: 1,
  },
  inlineErrorText: {
    color: Colors.error,
    fontSize: 12,
    marginTop: 6,
    fontWeight: '600',
    paddingHorizontal: 4,
  },
  amountFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 12,
    marginBottom: 24,
  },
  balanceContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  limitText: {
    fontSize: 12,
    color: Colors.textSecondary,
    fontWeight: '600',
  },
  balanceValueText: {
    fontSize: 13,
    color: '#1E293B',
    fontWeight: '700',
  },
  checkBalanceText: {
    fontSize: 12,
    color: '#2563EB',
    fontWeight: '600',
  },
  bottomActions: {
    paddingVertical: 10,
    backgroundColor: '#FFF',
  },
  locationStatusContainer: {
    backgroundColor: '#F9FAFB',
    borderRadius: 12,
    padding: 12,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  locationStatusHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  locationStatusRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    flex: 1,
  },
  locationStatusText: {
    fontSize: 14,
    fontWeight: '600',
  },
  locationActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 20,
  },
  settingsButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingVertical: 6,
    paddingHorizontal: 10,
    borderRadius: 8,
    backgroundColor: '#EFF6FF',
    borderWidth: 1,
    borderColor: '#BFDBFE',
  },
  settingsButtonText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#2563EB',
  },
  refreshButton: {
    padding: 6,
    borderRadius: 8,
    backgroundColor: '#EFF6FF',
  },
  locationCoordsText: {
    fontSize: 11,
    color: '#6B7280',
    marginTop: 6,
    fontFamily: 'monospace',
  },
  locationHintContainer: {
    marginTop: 8,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
  },
  locationHintText: {
    fontSize: 12,
    color: '#6B7280',
    fontStyle: 'italic',
  },
  payNowButton: {
    flexDirection: 'row',
    backgroundColor: Colors.primaryDark,
    borderRadius: 12,
    height: 54,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  payNowButtonDisabled: {
    backgroundColor: '#E5E7EB',
  },
  payNowText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: '700',
  },
  payNowTextDisabled: {
    color: '#9CA3AF',
  },
  permissionWarning: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FEF2F2',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
    marginBottom: 12,
    gap: 6,
  },
  permissionWarningText: {
    color: '#EF4444',
    fontSize: 12,
    fontWeight: '600',
  },
  resetButton: {
    height: 54,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: Colors.divider,
    justifyContent: 'center',
    alignItems: 'center',
  },
  resetText: {
    color: Colors.textSecondary,
    fontSize: 16,
    fontWeight: '600',
  },
  securBox: {
    backgroundColor: Colors.bgSecondaryBox || Colors.bgInput,
    borderRadius: 8,
    padding: 12,
    marginTop: 16,
    marginBottom: 8,
    flexDirection: "row",
    gap: 8,
  },
  modalSubtitle: {
    fontSize: 14,
    color: Colors.textSecondary,
    textAlign: 'left',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  locationPermissionModal: {
    backgroundColor: '#FFF',
    borderRadius: 20,
    padding: 24,
    width: '100%',
    maxWidth: 400,
    alignItems: 'center',
  },
  locationIconContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#EFF6FF',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
  },
  locationModalTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1E293B',
    marginBottom: 12,
    textAlign: 'center',
  },
  locationModalDescription: {
    fontSize: 14,
    color: Colors.textSecondary,
    textAlign: 'center',
    marginBottom: 16,
    lineHeight: 20,
  },
  locationBenefitsList: {
    width: '100%',
    marginBottom: 16,
  },
  locationBenefitItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    paddingHorizontal: 8,
  },
  locationBenefitText: {
    fontSize: 14,
    color: '#1E293B',
    marginLeft: 12,
    flex: 1,
    fontWeight: '500',
  },
  locationModalNote: {
    fontSize: 12,
    color: Colors.textSecondary,
    textAlign: 'center',
    fontStyle: 'italic',
    marginBottom: 24,
    paddingHorizontal: 8,
    lineHeight: 18,
  },
  locationModalButtons: {
    width: '100%',
  },
  locationAllowButton: {
    flexDirection: 'row',
    backgroundColor: '#2563EB',
    borderRadius: 12,
    height: 50,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  locationAllowButtonText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: '700',
  },
  locationSettingsButton: {
    flexDirection: 'row',
    backgroundColor: '#EFF6FF',
    borderRadius: 12,
    height: 50,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#2563EB',
  },
  locationSettingsButtonText: {
    color: '#2563EB',
    fontSize: 16,
    fontWeight: '700',
  },
  locationCancelButton: {
    backgroundColor: '#FFF',
    borderRadius: 12,
    height: 50,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: Colors.divider,
  },
  locationCancelButtonText: {
    color: Colors.textSecondary,
    fontSize: 16,
    fontWeight: '600',
  },
});

export default PayBeneficiary;