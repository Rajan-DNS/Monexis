import { PermissionsAndroid, Platform } from "react-native";

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