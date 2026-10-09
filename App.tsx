import React, { useEffect } from 'react';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';
import { Provider } from 'react-redux';
import { PersistGate } from 'redux-persist/integration/react';
import { Alert, Platform, StatusBar } from 'react-native';
import NetInfo from '@react-native-community/netinfo';
import { store, persistor } from './src/redux/store';
import RootNavigator from './src/navigation/RootNavigator';
import { Colors } from './src/theme';
import { CustomStatusBar } from './src/components/StatusBar';

const App: React.FC = () => {
  useEffect(() => {
    // Monitor network connectivity
    const unsubscribe = NetInfo.addEventListener(state => {
      console.log('📡 Network Status:', {
        isConnected: state.isConnected,
        isInternetReachable: state.isInternetReachable,
        type: state.type,
      });

      // Alert user if no connection (only in dev mode)
      if (__DEV__ && !state.isConnected) {
        Alert.alert(
          '⚠️ No Internet',
          'Please check your internet connection.',
          [{ text: 'OK' }]
        );
      }

      // Special handling for MIUI devices
      if (Platform.OS === 'android' && state.isConnected && !state.isInternetReachable) {
        console.warn('⚠️ Connected but internet not reachable. This often happens on MIUI devices with restricted app permissions.');
      }
    });

    return () => unsubscribe();
  }, []);

  return (
    <Provider store={store}>
      <PersistGate loading={null} persistor={persistor}>
              <StatusBar barStyle='default' backgroundColor={Colors.bg} />
        
        <SafeAreaProvider>
          <CustomStatusBar 
            backgroundColor={Colors.primary} 
            barStyle='dark-content'
          />
          <SafeAreaView style={{ flex: 1, backgroundColor: Colors.bg }}>
            <RootNavigator />
          </SafeAreaView>
        </SafeAreaProvider>
      </PersistGate>
    </Provider>
  );
};

export default App;
