import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { rechargeStyles as styles } from '../rechargeStyles';

interface RechargeTabsProps {
    activeTab: 'Prepaid' | 'Postpaid';
    onTabChange: (tab: 'Prepaid' | 'Postpaid') => void;
}

export const RechargeTabs: React.FC<RechargeTabsProps> = ({ activeTab, onTabChange }) => {
    return (
        <View style={styles.topToggleContainer}>
            <TouchableOpacity
                style={[styles.topButton, activeTab === 'Prepaid' && styles.activeTopButton]}
                onPress={() => onTabChange('Prepaid')}
            >
                <Text style={[styles.topButtonText, activeTab === 'Prepaid' && styles.activeTopButtonText]}>
                    Prepaid
                </Text>
            </TouchableOpacity>
            <TouchableOpacity
                style={[styles.topButton, activeTab === 'Postpaid' && styles.activeTopButton]}
                onPress={() => onTabChange('Postpaid')}
            >
                <Text style={[styles.topButtonText, activeTab === 'Postpaid' && styles.activeTopButtonText]}>
                    Postpaid
                </Text>
            </TouchableOpacity>
        </View>
    );
};
