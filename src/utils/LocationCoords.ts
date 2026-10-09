import { Platform, PermissionsAndroid, Alert } from 'react-native';
import Geolocation from '@react-native-community/geolocation';

export interface LocationCoords {
  latitude: number;
  longitude: number;
}

/**
 * Requests location permissions based on OS requirements.
 */
export const requestLocationPermission = async (): Promise<boolean> => {
  if (Platform.OS === 'android') {
    try {
      const granted = await PermissionsAndroid.request(
        PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
        {
          title: 'Location Permission Needed',
          message: 'To ensure secure transaction settlement, location services must be enabled.',
          buttonPositive: 'Allow',
          buttonNegative: 'Cancel',
        }
      );
      return granted === PermissionsAndroid.RESULTS.GRANTED;
    } catch (err) {
      console.warn('Location permission error:', err);
      return false;
    }
  }
  return true; // iOS handles permission prompts automatically on first call
};

/**
 * Gets current GPS coordinates with fallback accuracy.
 */
