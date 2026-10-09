import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ActivityIndicator } from 'react-native';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import { Colors } from '../theme';
import { Poppins } from '../theme/typography';
import { LocationErrorType, LocationPermissionStatus } from '../hooks/useDeviceLocation';

interface LocationInfoCardProps {
    deviceModel: string;
    locationCoords: { latitude: number; longitude: number } | null;
    locationString: string;
    permissionStatus: LocationPermissionStatus;
    isLoading: boolean;
    openSettings: () => void;
    retryLocation: () => void;
    refreshLocation?: () => void;
    errorType?: LocationErrorType;
    errorMessage?: string;
    returnedFromSettings?: boolean;
}

const LocationInfoCard: React.FC<LocationInfoCardProps> = ({
    deviceModel,
    locationCoords,
    locationString,
    permissionStatus,
    isLoading,
    openSettings,
    retryLocation,
    refreshLocation,
    errorType,
    errorMessage,
    returnedFromSettings,
}) => {
    const isPaymentEnabled = !!deviceModel && !!locationCoords;
    const handleRefresh = refreshLocation || retryLocation;
    const needsSettings = permissionStatus === 'denied' || permissionStatus === 'blocked';
    const showRefreshButton = returnedFromSettings || !locationCoords || !!errorType;
    const warningText = errorMessage
        || (isLoading
            ? 'Fetching your location...'
            : needsSettings
                ? 'Location permission denied. Enable in settings to proceed.'
                : 'Location required for payment processing');

    return (
        <View style={styles.locationCard}>
            <View style={styles.locationHeader}>
                <View style={styles.locationIconContainer}>
                    <MaterialCommunityIcons
                        name="map-marker"
                        size={24}
                        color={Colors.primary}
                    />
                </View>
                <Text style={styles.locationTitle}>Payment Location Info</Text>
            </View>
            
            <View style={styles.locationInfoRow}>
                <MaterialCommunityIcons
                    name="cellphone"
                    size={18}
                    color={Colors.textSecondary}
                />
                <View style={styles.locationInfoTextContainer}>
                    <Text style={styles.locationInfoLabel}>Device Model</Text>
                    <Text style={styles.locationInfoValue}>
                        {deviceModel || 'Detecting device...'}
                    </Text>
                </View>
            </View>

            <View style={styles.locationInfoRow}>
                <MaterialCommunityIcons
                    name="crosshairs-gps"
                    size={18}
                    color={Colors.textSecondary}
                />
                <View style={styles.locationInfoTextContainer}>
                    <Text style={styles.locationInfoLabel}>Coordinates</Text>
                    {isLoading ? (
                        <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 4 }}>
                            <ActivityIndicator size="small" color={Colors.primary} />
                            <Text style={[styles.locationInfoValue, { marginLeft: 8 }]}>Fetching location...</Text>
                        </View>
                    ) : (
                        <Text style={styles.locationInfoValue}>
                            {locationCoords ? (
                                `Lat: ${locationCoords.latitude.toFixed(6)}, Long: ${locationCoords.longitude.toFixed(6)}`
                            ) : (
                                'Location unavailable'
                            )}
                        </Text>
                    )}
                </View>
            </View>

            <View style={styles.locationInfoRow}>
                <MaterialCommunityIcons
                    name="map-marker-radius"
                    size={18}
                    color={Colors.textSecondary}
                />
                <View style={styles.locationInfoTextContainer}>
                    <Text style={styles.locationInfoLabel}>Location Address</Text>
                    <Text style={styles.locationInfoValue}>
                        {isLoading ? 'Loading address...' : (locationString !== "Location not available" ? locationString : 'Address unavailable')}
                    </Text>
                </View>
            </View>

            {!isPaymentEnabled && (
                <View style={styles.locationWarning}>
                    <MaterialCommunityIcons
                        name="alert-circle"
                        size={16}
                        color={Colors.warningText}
                    />
                    <Text style={styles.locationWarningText}>
                        {warningText}
                    </Text>
                </View>
            )}

            {showRefreshButton && (
                <View style={styles.locationActions}>
                    {needsSettings && (
                        <TouchableOpacity 
                            style={styles.settingsButton}
                            onPress={openSettings}
                        >
                            <MaterialCommunityIcons name="cog" size={18} color={Colors.white} />
                            <Text style={styles.settingsButtonText}>Open Settings</Text>
                        </TouchableOpacity>
                    )}
                    <TouchableOpacity 
                        style={[
                            needsSettings ? styles.retryButton : styles.refetchButton,
                            isLoading && { opacity: 0.6 }
                        ]}
                        onPress={handleRefresh}
                        disabled={isLoading}
                    >
                        <MaterialCommunityIcons 
                            name="refresh" 
                            size={18} 
                            color={isLoading ? Colors.textSecondary : (needsSettings ? Colors.primary : Colors.white)}
                        />
                        <Text style={[
                            needsSettings ? styles.retryButtonText : styles.refetchButtonText,
                            isLoading && { color: Colors.textSecondary }
                        ]}>
                            {isLoading ? 'Fetching...' : 'Refresh Location'}
                        </Text>
                    </TouchableOpacity>
                </View>
            )}
        </View>
    );
};

const styles = StyleSheet.create({
    locationCard: {
        backgroundColor: Colors.white,
        borderRadius: 20,
        padding: 20,
        marginBottom: 20,
        borderWidth: 1,
        borderColor: Colors.borderLight,
        elevation: 3,
        shadowColor: Colors.shadow,
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
    },
    locationHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 16,
        paddingBottom: 12,
        borderBottomWidth: 1,
        borderBottomColor: Colors.borderLight,
    },
    locationIconContainer: {
        width: 44,
        height: 44,
        borderRadius: 22,
        backgroundColor: Colors.infoBg,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 12,
    },
    locationTitle: {
        fontSize: 16,
        color: Colors.textDark,
        fontFamily: Poppins.semiBold,
    },
    locationInfoRow: {
        flexDirection: 'row',
        alignItems: 'flex-start',
        marginBottom: 14,
        paddingLeft: 4,
    },
    locationInfoTextContainer: {
        flex: 1,
        marginLeft: 12,
    },
    locationInfoLabel: {
        fontSize: 12,
        color: Colors.textSecondary,
        fontFamily: Poppins.regular,
        marginBottom: 2,
    },
    locationInfoValue: {
        fontSize: 14,
        color: Colors.textDark,
        fontFamily: Poppins.medium,
        lineHeight: 20,
    },
    locationWarning: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: Colors.warningLight,
        padding: 12,
        borderRadius: 12,
        marginTop: 8,
        borderWidth: 1,
        borderColor: Colors.warningBorder,
    },
    locationWarningText: {
        fontSize: 12,
        color: Colors.warningText,
        fontFamily: Poppins.medium,
        marginLeft: 8,
        flex: 1,
    },
    locationActions: {
        flexDirection: 'row',
        gap: 12,
        marginTop: 16,
    },
    settingsButton: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: Colors.primary,
        padding: 12,
        borderRadius: 12,
        gap: 8,
    },
    settingsButtonText: {
        color: Colors.white,
        fontSize: 14,
        fontFamily: Poppins.semiBold,
    },
    retryButton: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: Colors.white,
        padding: 12,
        borderRadius: 12,
        borderWidth: 1,
        borderColor: Colors.primary,
        gap: 8,
    },
    retryButtonText: {
        color: Colors.primary,
        fontSize: 14,
        fontFamily: Poppins.semiBold,
    },
    refetchButton: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: Colors.primary,
        padding: 12,
        borderRadius: 12,
        gap: 8,
    },
    refetchButtonText: {
        color: Colors.white,
        fontSize: 14,
        fontFamily: Poppins.semiBold,
    },
});

export default LocationInfoCard;
