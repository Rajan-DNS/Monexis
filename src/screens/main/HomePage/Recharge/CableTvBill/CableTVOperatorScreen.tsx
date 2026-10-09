import React, { useState } from 'react';
import {
    StyleSheet,
    Text,
    View,
    TextInput,
    TouchableOpacity,
    ScrollView,
    SafeAreaView,
    FlatList,
} from 'react-native';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import Colors from '../../../../../theme/colors';
import { Poppins } from '../../../../../theme/typography';
import AppHeader from '../../../../../components/Header/AppHeader';
import { useNavigation } from '@react-navigation/native';

interface CableTVOperator {
    id: string;
    name: string;
    icon: string;
    popular?: boolean;
}

const CABLE_TV_OPERATORS: CableTVOperator[] = [
    { id: 'hathway', name: 'Hathway Cable', icon: 'television', popular: true },
    { id: 'den', name: 'DEN Networks', icon: 'television-classic', popular: true },
    { id: 'siti', name: 'Siti Cable', icon: 'television-box', popular: true },
    { id: 'asianet', name: 'Asianet Digital', icon: 'television' },
    { id: 'gtpl', name: 'GTPL Cable', icon: 'television-classic' },
    { id: 'incable', name: 'InCable Networks', icon: 'television-box' },
    { id: 'fastway', name: 'Fastway Transmissions', icon: 'television' },
    { id: 'ict', name: 'ICT Cable Network', icon: 'television-classic' },
    { id: 'siticable', name: 'Siti Broadband', icon: 'television-box' },
    { id: 'manthan', name: 'Manthan Cable', icon: 'television' },
];

const CableTVOperatorScreen = () => {
    const navigation = useNavigation();
    const [searchQuery, setSearchQuery] = useState('');
    const [subscriberId, setSubscriberId] = useState('');
    const [selectedOperator, setSelectedOperator] = useState<CableTVOperator | null>(null);

    const filteredOperators = CABLE_TV_OPERATORS.filter(operator =>
        operator.name.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const popularOperators = filteredOperators.filter(op => op.popular);
    const otherOperators = filteredOperators.filter(op => !op.popular);

    const handleOperatorSelect = (operator: CableTVOperator) => {
        setSelectedOperator(operator);
    };

    const handleProceed = () => {
        if (selectedOperator && subscriberId) {
            // Navigate to bill payment screen with operator details
            navigation.navigate('CableTVBillScreen' as any, {
                operator: selectedOperator,
                subscriberId: subscriberId,
            });
        }
    };

    const renderOperatorItem = ({ item }: { item: CableTVOperator }) => (
        <TouchableOpacity
            style={[
                styles.operatorCard,
                selectedOperator?.id === item.id && styles.operatorCardSelected,
            ]}
            onPress={() => handleOperatorSelect(item)}
            activeOpacity={0.7}
        >
            <View style={styles.operatorIconContainer}>
                <MaterialCommunityIcons
                    name={item.icon as any}
                    size={28}
                    color={selectedOperator?.id === item.id ? Colors.primary : Colors.textSecondary}
                />
            </View>
            <Text
                style={[
                    styles.operatorName,
                    selectedOperator?.id === item.id && styles.operatorNameSelected,
                ]}
            >
                {item.name}
            </Text>
            {selectedOperator?.id === item.id && (
                <View style={styles.selectedBadge}>
                    <MaterialIcons name="check-circle" size={20} color={Colors.primary} />
                </View>
            )}
        </TouchableOpacity>
    );

    return (
        <SafeAreaView style={styles.container}>
            <AppHeader
                title="Cable TV"
                showBack
                onBackPress={() => navigation.goBack()}
            />

            <ScrollView
                contentContainerStyle={styles.scrollContent}
                showsVerticalScrollIndicator={false}
            >
                {/* Search Bar */}
                <View style={styles.searchContainer}>
                    <MaterialIcons name="search" size={20} color={Colors.textSecondary} />
                    <TextInput
                        style={styles.searchInput}
                        placeholder="Search cable operator"
                        placeholderTextColor={Colors.textMuted}
                        value={searchQuery}
                        onChangeText={setSearchQuery}
                    />
                    {searchQuery.length > 0 && (
                        <TouchableOpacity onPress={() => setSearchQuery('')}>
                            <MaterialIcons name="close" size={20} color={Colors.textSecondary} />
                        </TouchableOpacity>
                    )}
                </View>

                {/* Subscriber ID Input */}
                {selectedOperator && (
                    <View style={styles.subscriberSection}>
                        <Text style={styles.sectionLabel}>SUBSCRIBER ID / CUSTOMER ID</Text>
                        <View style={styles.inputContainer}>
                            <MaterialCommunityIcons
                                name="card-account-details"
                                size={20}
                                color={Colors.primary}
                            />
                            <TextInput
                                style={styles.subscriberInput}
                                placeholder="Enter Subscriber ID"
                                placeholderTextColor={Colors.textMuted}
                                value={subscriberId}
                                onChangeText={setSubscriberId}
                                keyboardType="numeric"
                                maxLength={16}
                            />
                        </View>
                        <Text style={styles.helperText}>
                            You can find this on your cable TV bill or account statement
                        </Text>
                    </View>
                )}

                {/* Popular Operators */}
                {popularOperators.length > 0 && (
                    <>
                        <View style={styles.sectionHeader}>
                            <MaterialCommunityIcons name="star" size={20} color={Colors.warningText} />
                            <Text style={styles.sectionTitle}>Popular Operators</Text>
                        </View>
                        <FlatList
                            data={popularOperators}
                            renderItem={renderOperatorItem}
                            keyExtractor={(item) => item.id}
                            numColumns={2}
                            columnWrapperStyle={styles.operatorRow}
                            scrollEnabled={false}
                        />
                    </>
                )}

                {/* All Operators */}
                {otherOperators.length > 0 && (
                    <>
                        <View style={styles.sectionHeader}>
                            <MaterialCommunityIcons name="format-list-bulleted" size={20} color={Colors.textSecondary} />
                            <Text style={styles.sectionTitle}>All Operators</Text>
                        </View>
                        <FlatList
                            data={otherOperators}
                            renderItem={renderOperatorItem}
                            keyExtractor={(item) => item.id}
                            numColumns={2}
                            columnWrapperStyle={styles.operatorRow}
                            scrollEnabled={false}
                        />
                    </>
                )}

                {/* No Results */}
                {filteredOperators.length === 0 && (
                    <View style={styles.noResultsContainer}>
                        <MaterialCommunityIcons name="television-off" size={64} color={Colors.textMuted} />
                        <Text style={styles.noResultsText}>No operators found</Text>
                        <Text style={styles.noResultsSubtext}>
                            Try searching with a different name
                        </Text>
                    </View>
                )}

                {/* Info Card */}
                <View style={styles.infoCard}>
                    <MaterialIcons name="info" size={18} color={Colors.infoDark} />
                    <Text style={styles.infoText}>
                        Select your cable TV operator and enter your subscriber ID to view and pay your bill
                    </Text>
                </View>
            </ScrollView>

            {/* Bottom Action Button */}
            {selectedOperator && subscriberId.length > 0 && (
                <View style={styles.bottomContainer}>
                    <TouchableOpacity
                        style={styles.proceedButton}
                        onPress={handleProceed}
                        activeOpacity={0.85}
                    >
                        <Text style={styles.proceedButtonText}>Proceed to Pay Bill</Text>
                        <MaterialIcons name="arrow-forward" size={20} color={Colors.white} />
                    </TouchableOpacity>
                </View>
            )}
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: Colors.bgLightest,
    },
    scrollContent: {
        padding: 20,
        paddingBottom: 100,
    },

    /* Search Section */
    searchContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: Colors.white,
        borderRadius: 12,
        paddingHorizontal: 16,
        paddingVertical: 12,
        marginBottom: 24,
        borderWidth: 1,
        borderColor: Colors.divider,
        gap: 12,
    },
    searchInput: {
        flex: 1,
        fontSize: 14,
        fontFamily: Poppins.medium,
        color: Colors.textDark,
        padding: 0,
    },

    /* Subscriber Section */
    subscriberSection: {
        marginBottom: 24,
    },
    sectionLabel: {
        fontSize: 12,
        fontWeight: '600',
        fontFamily: Poppins.semiBold,
        color: Colors.textSecondary,
        marginBottom: 8,
        letterSpacing: 0.5,
    },
    inputContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: Colors.white,
        borderRadius: 12,
        paddingHorizontal: 16,
        paddingVertical: 14,
        borderWidth: 1,
        borderColor: Colors.divider,
        gap: 12,
    },
    subscriberInput: {
        flex: 1,
        fontSize: 14,
        fontFamily: Poppins.medium,
        color: Colors.textDark,
        padding: 0,
    },
    helperText: {
        fontSize: 12,
        fontFamily: Poppins.regular,
        color: Colors.textMuted,
        marginTop: 6,
        marginLeft: 4,
    },

    /* Section Header */
    sectionHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
        marginBottom: 16,
        marginTop: 8,
    },
    sectionTitle: {
        fontSize: 15,
        fontWeight: '700',
        fontFamily: Poppins.bold,
        color: Colors.textDark,
    },

    /* Operator Grid */
    operatorRow: {
        justifyContent: 'space-between',
        marginBottom: 12,
    },
    operatorCard: {
        flex: 1,
        backgroundColor: Colors.white,
        borderRadius: 12,
        padding: 16,
        marginHorizontal: 6,
        alignItems: 'center',
        borderWidth: 2,
        borderColor: Colors.divider,
        position: 'relative',
    },
    operatorCardSelected: {
        borderColor: Colors.primary,
        backgroundColor: Colors.primaryLight,
    },
    operatorIconContainer: {
        width: 56,
        height: 56,
        borderRadius: 28,
        backgroundColor: Colors.bgInput,
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 12,
    },
    operatorName: {
        fontSize: 13,
        fontFamily: Poppins.semiBold,
        fontWeight: '600',
        color: Colors.textDark,
        textAlign: 'center',
    },
    operatorNameSelected: {
        color: Colors.primary,
        fontWeight: '700',
        fontFamily: Poppins.bold,
    },
    selectedBadge: {
        position: 'absolute',
        top: 8,
        right: 8,
    },

    /* No Results */
    noResultsContainer: {
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 60,
    },
    noResultsText: {
        fontSize: 16,
        fontFamily: Poppins.semiBold,
        fontWeight: '600',
        color: Colors.textDark,
        marginTop: 16,
    },
    noResultsSubtext: {
        fontSize: 14,
        fontFamily: Poppins.regular,
        color: Colors.textMuted,
        marginTop: 4,
    },

    /* Info Card */
    infoCard: {
        flexDirection: 'row',
        alignItems: 'flex-start',
        backgroundColor: Colors.infoBg,
        borderRadius: 12,
        padding: 14,
        marginTop: 12,
        gap: 10,
        borderWidth: 1,
        borderColor: Colors.infoLight,
    },
    infoText: {
        flex: 1,
        fontSize: 12,
        fontFamily: Poppins.regular,
        color: Colors.infoDark,
        lineHeight: 18,
    },

    /* Bottom Button */
    bottomContainer: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        padding: 20,
        backgroundColor: Colors.white,
        borderTopWidth: 1,
        borderTopColor: Colors.divider,
        shadowColor: Colors.shadow,
        shadowOffset: { width: 0, height: -2 },
        shadowOpacity: 0.05,
        shadowRadius: 8,
        elevation: 8,
    },
    proceedButton: {
        flexDirection: 'row',
        gap: 8,
        backgroundColor: Colors.primaryDark,
        borderRadius: 12,
        paddingVertical: 16,
        alignItems: 'center',
        justifyContent: 'center',
        shadowColor: Colors.primary,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
        elevation: 4,
    },
    proceedButtonText: {
        color: Colors.white,
        fontSize: 16,
        fontWeight: '700',
        fontFamily: Poppins.bold,
    },
});

export default CableTVOperatorScreen;
