import { useCallback, useEffect, useRef, useState } from 'react';
import {
    Alert,
    AppState,
    AppStateStatus,
    Linking,
    PermissionsAndroid,
    Platform,
} from 'react-native';
import NetInfo from '@react-native-community/netinfo';
import DeviceInfo from 'react-native-device-info';
import Geolocation from '@react-native-community/geolocation';

export type LocationPermissionStatus =
    | 'checking'
    | 'granted'
    | 'denied'
    | 'blocked'
    | 'unavailable';

export type LocationErrorType =
    | 'permission-denied'
    | 'permission-blocked'
    | 'gps-disabled'
    | 'timeout'
    | 'network'
    | 'unavailable'
    | null;

export interface LocationCoords {
    latitude: number;
    longitude: number;
}

interface DeviceLocationState {
    deviceModel: string;
    locationCoords: LocationCoords | null;
    permissionStatus: LocationPermissionStatus;
    errorType: LocationErrorType;
    errorMessage: string;
    isLoading: boolean;
    returnedFromSettings: boolean;
}

const LOCATION_OPTIONS = {
    enableHighAccuracy: true,
    timeout: 15000,
    maximumAge: 10000,
    distanceFilter: 0,
};

const FALLBACK_LOCATION_OPTIONS = {
    enableHighAccuracy: false,
    timeout: 20000,
    maximumAge: 60000,
    distanceFilter: 0,
};

const getAndroidPermissionStatus = async (): Promise<LocationPermissionStatus> => {
    const hasFineLocation = await PermissionsAndroid.check(
        PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
    );
    const hasCoarseLocation = await PermissionsAndroid.check(
        PermissionsAndroid.PERMISSIONS.ACCESS_COARSE_LOCATION,
    );

    if (hasFineLocation || hasCoarseLocation) {
        return 'granted';
    }

    const result = await PermissionsAndroid.request(
        PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
        {
            title: 'Location Permission',
            message: 'App needs access to your location for secure transactions.',
            buttonNeutral: 'Ask Me Later',
            buttonNegative: 'Cancel',
            buttonPositive: 'Allow',
        },
    );

    if (result === PermissionsAndroid.RESULTS.GRANTED) {
        return 'granted';
    }

    const coarseResult = await PermissionsAndroid.request(
        PermissionsAndroid.PERMISSIONS.ACCESS_COARSE_LOCATION,
        {
            title: 'Approximate Location Permission',
            message: 'App needs approximate location if precise GPS is unavailable.',
            buttonNegative: 'Cancel',
            buttonPositive: 'Allow',
        },
    );

    if (coarseResult === PermissionsAndroid.RESULTS.GRANTED) {
        return 'granted';
    }

    if (result === PermissionsAndroid.RESULTS.NEVER_ASK_AGAIN) {
        return 'blocked';
    }

    return 'denied';
};

const openLocationSettings = async () => {
    if (Platform.OS === 'android' && Linking.sendIntent) {
        await Linking.sendIntent('android.settings.LOCATION_SOURCE_SETTINGS');
        return;
    }

    await Linking.openSettings();
};

const getPosition = (
    options: typeof LOCATION_OPTIONS,
): Promise<LocationCoords> => new Promise((resolve, reject) => {
    Geolocation.getCurrentPosition(
        (position) => {
            const { latitude, longitude } = position.coords;
            resolve({ latitude, longitude });
        },
        reject,
        options,
    );
});

export const useDeviceLocation = () => {
    const [state, setState] = useState<DeviceLocationState>({
        deviceModel: '',
        locationCoords: null,
        permissionStatus: 'checking',
        errorType: null,
        errorMessage: '',
        isLoading: true,
        returnedFromSettings: false,
    });
    const openedSettingsRef = useRef(false);
    const appStateRef = useRef<AppStateStatus>(AppState.currentState);

    const setDeviceDetails = useCallback(async () => {
        try {
            const model = DeviceInfo.getModel();
            setState(current => ({ ...current, deviceModel: model }));
        } catch (error) {
            console.warn('Failed to get device info:', error);
        }
    }, []);

    const updateLocationError = useCallback((errorType: Exclude<LocationErrorType, null>, message: string) => {
        setState(current => ({
            ...current,
            locationCoords: null,
            errorType,
            errorMessage: message,
            isLoading: false,
            permissionStatus:
                errorType === 'permission-denied'
                    ? 'denied'
                    : errorType === 'permission-blocked'
                        ? 'blocked'
                        : errorType === 'gps-disabled' || errorType === 'timeout' || errorType === 'unavailable'
                            ? 'unavailable'
                            : current.permissionStatus,
        }));
    }, []);

    const showLocationServicesDialog = useCallback(() => {
        Alert.alert(
            'Turn On Location',
            'Location services are turned off. Please enable GPS to continue.',
            [
                { text: 'Cancel', style: 'cancel' },
                {
                    text: 'Open Location Settings',
                    onPress: async () => {
                        openedSettingsRef.current = true;
                        try {
                            await openLocationSettings();
                        } catch (error) {
                            console.warn('Unable to open location settings:', error);
                            Linking.openSettings();
                        }
                    },
                },
            ],
        );
    }, []);

    const requestLocationPermission = useCallback(async (): Promise<LocationPermissionStatus> => {
        if (Platform.OS === 'android') {
            try {
                return await getAndroidPermissionStatus();
            } catch (err) {
                console.warn('Location permission error:', err);
                return 'unavailable';
            }
        }

        return 'granted';
    }, []);

    const fetchCurrentLocation = useCallback(async () => {
        setState(current => ({
            ...current,
            locationCoords: null,
            permissionStatus: 'checking',
            errorType: null,
            errorMessage: '',
            isLoading: true,
            returnedFromSettings: false,
        }));

        const networkState = await NetInfo.fetch();
        if (!networkState.isConnected) {
            updateLocationError('network', 'Network unavailable. Check your internet connection and refresh location.');
            return;
        }

        const permission = await requestLocationPermission();
        setState(current => ({ ...current, permissionStatus: permission }));

        if (permission === 'denied') {
            updateLocationError('permission-denied', 'Location permission denied. Allow location access to continue.');
            return;
        }

        if (permission === 'blocked') {
            updateLocationError('permission-blocked', 'Location permission is permanently denied. Enable it from app settings.');
            return;
        }

        if (permission !== 'granted') {
            updateLocationError('unavailable', 'Location permission is unavailable on this device.');
            return;
        }

        try {
            try {
                const { latitude, longitude } = await getPosition(LOCATION_OPTIONS);
                setState(current => ({
                    ...current,
                    locationCoords: { latitude, longitude },
                    permissionStatus: 'granted',
                    errorType: null,
                    errorMessage: '',
                    isLoading: false,
                    returnedFromSettings: false,
                }));
                return;
            } catch (highAccuracyError: any) {
                console.warn(
                    'High accuracy geolocation failed:',
                    highAccuracyError?.code,
                    highAccuracyError?.message,
                );

                if (highAccuracyError?.code === 1) {
                    throw highAccuracyError;
                }

                const { latitude, longitude } = await getPosition(FALLBACK_LOCATION_OPTIONS);
                setState(current => ({
                    ...current,
                    locationCoords: { latitude, longitude },
                    permissionStatus: 'granted',
                    errorType: null,
                    errorMessage: '',
                    isLoading: false,
                    returnedFromSettings: false,
                }));
            }
        } catch (error: any) {
            console.warn('Geolocation error:', error?.code, error?.message);

            if (error?.code === 1) {
                updateLocationError('permission-denied', 'Location permission denied. Allow location access to continue.');
                return;
            }

            if (error?.code === 2) {
                updateLocationError('gps-disabled', 'Location services are disabled or the device could not find a location provider. Turn on GPS and refresh location.');
                showLocationServicesDialog();
                return;
            }

            if (error?.code === 3) {
                updateLocationError('timeout', 'Location request timed out. Turn on GPS, check network, move near a window, and refresh location.');
                return;
            }

            updateLocationError('unavailable', error?.message || 'Unable to fetch current location.');
        }
    }, [requestLocationPermission, showLocationServicesDialog, updateLocationError]);

    const openSettings = useCallback(async () => {
        openedSettingsRef.current = true;
        try {
            await Linking.openSettings();
        } catch (error) {
            console.warn('Unable to open app settings:', error);
        }
    }, []);

    const refreshLocation = useCallback(() => {
        fetchCurrentLocation();
    }, [fetchCurrentLocation]);

    useEffect(() => {
        setDeviceDetails();
        fetchCurrentLocation();
    }, [fetchCurrentLocation, setDeviceDetails]);

    useEffect(() => {
        const subscription = AppState.addEventListener('change', nextAppState => {
            const wasInBackground = appStateRef.current.match(/inactive|background/);
            const isActive = nextAppState === 'active';
            appStateRef.current = nextAppState;

            if (openedSettingsRef.current && wasInBackground && isActive) {
                openedSettingsRef.current = false;
                setState(current => ({
                    ...current,
                    returnedFromSettings: true,
                    isLoading: false,
                }));
            }
        });

        return () => subscription.remove();
    }, []);

    const locationString = state.locationCoords
        ? `latitude: ${state.locationCoords.latitude}, longitude: ${state.locationCoords.longitude}`
        : 'Location not available';

    return {
        ...state,
        locationString,
        locationLoading: state.isLoading,
        openSettings,
        refreshLocation,
        retryLocation: refreshLocation,
    };
};
