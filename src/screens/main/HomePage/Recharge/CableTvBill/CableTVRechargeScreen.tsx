import React, { useState } from 'react';
import {
    StyleSheet,
    Text,
    View,
    TextInput,
    TouchableOpacity,
    ScrollView,
    SafeAreaView,
    StatusBar,
    Image,
    Modal,
    ActivityIndicator,
    Alert,
} from 'react-native';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import Colors from '../../../../../theme/colors';
import { Poppins } from '../../../../../theme/typography';
import AppHeader from '../../../../../components/Header/AppHeader';
import { useNavigation } from '@react-navigation/native';
import { useGetopretorQuery, useGetOperatorValidationDataQuery } from '../../../../../redux/services/mainApi/Common/CommonApi';

interface Operator {
    id: string;
    name: string;
    shortName: string;
}

interface Circle {
    id: string;
    name: string;
}

interface DynamicValidationField {
    id: number;
    columnName: string;
    errorMsg: string;
    isMandatory: boolean;
    isNumeric: boolean;
    minMaxLenth?: string;
    minMaxVal?: string;
    operatorId: number;
    placeHolderText: string;
    startWith?: string;
}

const OPERATORS: Operator[] = [
    { id: 'act', name: 'ACT Fibernet', shortName: 'ACT' },
    { id: 'hathway', name: 'Hathway Cable', shortName: 'Hathway' },
    { id: 'den', name: 'DEN Networks', shortName: 'DEN' },
    { id: 'siti', name: 'Siti Cable', shortName: 'Siti' },
    { id: 'gtpl', name: 'GTPL Cable', shortName: 'GTPL' },
];

const CIRCLES: Circle[] = [
    { id: 'all', name: 'All Circles' },
    { id: 'delhi', name: 'Delhi' },
    { id: 'mumbai', name: 'Mumbai' },
    { id: 'bangalore', name: 'Bangalore' },
    { id: 'chennai', name: 'Chennai' },
    { id: 'kolkata', name: 'Kolkata' },
];

const CableTVRechargeScreen = () => {
    const navigation = useNavigation();
    
    // States
    const [selectedOperator, setSelectedOperator] = useState<Operator>(OPERATORS[0]);
    const [selectedCircle, setSelectedCircle] = useState<Circle>(CIRCLES[0]);
    const [isOperatorModalVisible, setIsOperatorModalVisible] = useState(false);
    const [isCircleModalVisible, setIsCircleModalVisible] = useState(false);
    const [dynamicFields, setDynamicFields] = useState<DynamicValidationField[]>([]);
    const [formValues, setFormValues] = useState<{ [key: number]: string }>({});
    const [useFallbackFields, setUseFallbackFields] = useState<boolean>(false);
    const [consumerNumber, setConsumerNumber] = useState<string>('');

    // Query: Fetch Operators list (operatorTypeId 8 for Cable TV)
    const { data: operatorResponse } = useGetopretorQuery({ operatorTypeId: 8 });
    const operators = operatorResponse?.data || operatorResponse?.result || operatorResponse || [];
    const operatorList = Array.isArray(operators) ? operators : [];

    // Query: Dynamic Operator Validation Data
    const {
        data: operatorValidationResponse,
        isLoading: operatorValidationLoading,
        isFetching: operatorValidationFetching,
    } = useGetOperatorValidationDataQuery(
        { OperatorId: selectedOperator?.id ?? 0 },
        { skip: !selectedOperator || !selectedOperator?.id }
    );

    const parseRange = (rangeStr?: string) => {
        if (!rangeStr) return { min: 0, max: Infinity };
        const parts = rangeStr.split('-');
        if (parts.length === 2) {
            return {
                min: parseInt(parts[0], 10) || 0,
                max: parseInt(parts[1], 10) || Infinity,
            };
        }
        return { min: 0, max: Infinity };
    };

    const handleInputChange = (field: DynamicValidationField, text: string) => {
        let val = text;
        if (field.isNumeric) {
            val = val.replace(/[^0-9]/g, '');
        }
        setFormValues((prev) => ({ ...prev, [field.id]: val }));
    };

    React.useEffect(() => {
        if (selectedOperator) {
            setFormValues({});
            setConsumerNumber('');
            const rawData = operatorValidationResponse?.data ?? operatorValidationResponse;
            let fields: DynamicValidationField[] = [];
            if (Array.isArray(rawData)) {
                fields = rawData;
            } else if (rawData && typeof rawData === 'object' && Array.isArray(rawData.fields)) {
                fields = rawData.fields;
            }

            if (fields && fields.length > 0) {
                setDynamicFields(fields);
                setUseFallbackFields(false);
            } else if (!operatorValidationLoading && !operatorValidationFetching) {
                setDynamicFields([]);
                setUseFallbackFields(true);
            }
        } else {
            setDynamicFields([]);
            setUseFallbackFields(false);
        }
    }, [selectedOperator, operatorValidationResponse, operatorValidationLoading, operatorValidationFetching]);

    const validateForm = () => {
        if (!selectedOperator) {
            Alert.alert('Validation', 'Please select an operator.');
            return false;
        }

        if (!useFallbackFields && dynamicFields.length > 0) {
            for (const field of dynamicFields) {
                const rawVal = formValues[field.id] || '';
                const val = rawVal.trim();
                if (field.isMandatory && !val) {
                    Alert.alert('Validation Error', field.errorMsg || `Please enter ${field.columnName}.`);
                    return false;
                }
                const range = parseRange(field.minMaxLenth);
                if (val.length > 0 && (val.length < range.min || val.length > range.max)) {
                    Alert.alert('Validation Error', `Length for ${field.columnName} must be between ${range.min} and ${range.max}.`);
                    return false;
                }
            }
        } else {
            if (!consumerNumber.trim()) {
                Alert.alert('Validation', 'Please enter your consumer number.');
                return false;
            }
        }
        return true;
    };

    const getPrimaryConsumerNumber = () => {
        if (useFallbackFields) return consumerNumber;
        if (dynamicFields.length > 0) return formValues[dynamicFields[0].id] || '';
        return '';
    };

    const handleContinue = () => {
        if (validateForm()) {
            navigation.navigate('CableTVDetailsScreen' as any, {
                operator: selectedOperator,
                circle: selectedCircle,
                consumerNumber: getPrimaryConsumerNumber(),
            });
        }
    };

    return (
        <SafeAreaView style={styles.container}>
            <StatusBar barStyle="dark-content" backgroundColor={Colors.white} />

            <AppHeader
                title="Cable Tv Operator"
                showBack
                onBackPress={() => navigation.goBack()}
            />

            <ScrollView
                contentContainerStyle={styles.scrollContent}
                showsVerticalScrollIndicator={false}
            >
                {/* Hero Banner */}
                <View style={styles.heroBanner}>
                    <View style={styles.bannerContent}>
                        <View style={styles.bannerTextSection}>
                            <Text style={styles.bannerTitle}>
                                Cable TV{'\n'}Dish <Text style={styles.bannerTitleOrange}>Recharge</Text>
                            </Text>
                            <Text style={styles.bannerSubtitle}>
                                Transform the way you enjoy instantly and easily your favorite shows, news and entertainment
                            </Text>

                            {/* Icon Row */}
                            <View style={styles.iconRow}>
                                <View style={styles.iconBox}>
                                    <MaterialCommunityIcons name="television" size={20} color={Colors.white} />
                                </View>
                                <View style={styles.iconBox}>
                                    <MaterialCommunityIcons name="satellite-variant" size={20} color={Colors.white} />
                                </View>
                                <View style={styles.iconBox}>
                                    <MaterialCommunityIcons name="antenna" size={20} color={Colors.white} />
                                </View>
                                <View style={styles.iconBox}>
                                    <MaterialCommunityIcons name="remote" size={20} color={Colors.white} />
                                </View>
                            </View>
                        </View>

                        {/* Phone Mockup */}
                        <View style={styles.phoneMockup}>
                            <View style={styles.phoneFrame}>
                                <MaterialCommunityIcons name="cellphone" size={120} color={Colors.white} />
                            </View>
                            {/* Orange Badge */}
                            <View style={styles.orangeBadge}>
                                <Text style={styles.orangeBadgeText}>BEST{'\n'}PRICE</Text>
                            </View>
                            {/* Play Button */}
                            <View style={styles.playButton}>
                                <MaterialIcons name="play-arrow" size={24} color={Colors.white} />
                            </View>
                        </View>
                    </View>
                </View>

                {/* Search Bar */}
                <View style={styles.searchContainer}>
                    <MaterialIcons name="search" size={20} color={Colors.textMuted} />
                    <TextInput
                        style={styles.searchInput}
                        placeholder="Search Operator Name..."
                        placeholderTextColor={Colors.textMuted}
                    />
                </View>

                {/* Dynamic Fields Section */}
                <View style={styles.section}>
                    {operatorValidationLoading || operatorValidationFetching ? (
                        <View style={styles.loadingContainer}>
                            <ActivityIndicator size="small" color={Colors.primary} />
                            <Text style={styles.loadingText}>Loading operator fields...</Text>
                        </View>
                    ) : !useFallbackFields && dynamicFields.length > 0 ? (
                        /* 1. RENDER API DYNAMIC FIELDS */
                        <>
                            {dynamicFields.map((field) => {
                                const lengthRange = parseRange(field.minMaxLenth);
                                return (
                                    <React.Fragment key={field.id}>
                                        <View style={styles.labelRow}>
                                            <Text style={styles.sectionLabel}>
                                                {field.columnName.toUpperCase()} {field.isMandatory && '*'}
                                            </Text>
                                        </View>

                                        <View style={styles.inputContainer}>
                                            <TextInput
                                                style={styles.input}
                                                placeholder={field.placeHolderText}
                                                placeholderTextColor={Colors.textMuted ?? '#94A3B8'}
                                                keyboardType={field.isNumeric ? 'numeric' : 'default'}
                                                maxLength={lengthRange.max !== Infinity ? lengthRange.max : undefined}
                                                value={formValues[field.id] || ''}
                                                onChangeText={(text) => handleInputChange(field, text)}
                                            />
                                            <MaterialCommunityIcons
                                                name={field.isNumeric ? 'numeric' : 'text-short'}
                                                size={22}
                                                color={Colors.textSecondary}
                                            />
                                        </View>

                                        <View style={{ height: 14 }} />
                                    </React.Fragment>
                                );
                            })}
                        </>
                    ) : (
                        /* 2. RENDER FALLBACK INPUT FIELDS WHEN API HAS NO DATA */
                        <>
                            <View style={styles.labelRow}>
                                <Text style={styles.sectionLabel}>CONSUMER NUMBER *</Text>
                            </View>
                            <View style={styles.inputContainer}>
                                <MaterialCommunityIcons name="card-account-details-outline" size={20} color={Colors.textSecondary} />
                                <TextInput
                                    style={styles.input}
                                    placeholder="Enter Consumer Number"
                                    placeholderTextColor={Colors.textMuted ?? '#94A3B8'}
                                    value={consumerNumber}
                                    onChangeText={setConsumerNumber}
                                />
                                <MaterialCommunityIcons
                                    name="barcode-scan"
                                    size={22}
                                    color={Colors.primary}
                                />
                            </View>
                        </>
                    )}
                </View>

                {/* Operator and Circle Selection */}
                <View style={styles.selectionRow}>
                    <View style={styles.selectionItem}>
                        <Text style={styles.selectionLabel}>Select operator</Text>
                        <TouchableOpacity
                            style={styles.dropdown}
                            onPress={() => setIsOperatorModalVisible(true)}
                            activeOpacity={0.7}
                        >
                            <View style={styles.dropdownLeft}>
                                <View style={styles.operatorBadge}>
                                    <Text style={styles.operatorBadgeText}>{selectedOperator.shortName}</Text>
                                </View>
                                <Text style={styles.dropdownText}>{selectedOperator.shortName}</Text>
                            </View>
                            <MaterialIcons name="keyboard-arrow-down" size={20} color={Colors.textSecondary} />
                        </TouchableOpacity>
                    </View>

                    <View style={styles.selectionItem}>
                        <Text style={styles.selectionLabel}>Select Circle</Text>
                        <TouchableOpacity
                            style={styles.dropdown}
                            onPress={() => setIsCircleModalVisible(true)}
                            activeOpacity={0.7}
                        >
                            <View style={styles.dropdownLeft}>
                                <MaterialIcons name="location-on" size={18} color={Colors.primary} />
                                <Text style={styles.dropdownText}>Circle</Text>
                            </View>
                            <MaterialIcons name="keyboard-arrow-down" size={20} color={Colors.textSecondary} />
                        </TouchableOpacity>
                    </View>
                </View>

                {/* Info Note */}
                <View style={styles.infoBox}>
                    <MaterialIcons name="info-outline" size={18} color={Colors.infoDark} />
                    <Text style={styles.infoText}>
                        Select your operator and enter consumer number to view available plans
                    </Text>
                </View>
            </ScrollView>

            {/* Bottom Button */}
            <View style={styles.bottomContainer}>
                <TouchableOpacity
                    style={styles.continueButton}
                    onPress={handleContinue}
                    activeOpacity={0.85}
                >
                    <Text style={styles.continueButtonText}>Continue</Text>
                    <MaterialIcons name="arrow-forward" size={20} color={Colors.white} />
                </TouchableOpacity>
            </View>

            {/* Operator Modal */}
            <Modal
                visible={isOperatorModalVisible}
                transparent={true}
                animationType="fade"
                onRequestClose={() => setIsOperatorModalVisible(false)}
            >
                <TouchableOpacity
                    style={styles.modalOverlay}
                    activeOpacity={1}
                    onPress={() => setIsOperatorModalVisible(false)}
                >
                    <View style={styles.modalContent}>
                        <View style={styles.modalHeader}>
                            <Text style={styles.modalTitle}>Select Operator</Text>
                            <TouchableOpacity onPress={() => setIsOperatorModalVisible(false)}>
                                <MaterialIcons name="close" size={24} color={Colors.textSecondary} />
                            </TouchableOpacity>
                        </View>
                        {OPERATORS.map((operator, index) => (
                            <TouchableOpacity
                                key={operator.id}
                                style={[
                                    styles.modalItem,
                                    index === OPERATORS.length - 1 && styles.modalItemLast
                                ]}
                                onPress={() => {
                                    setSelectedOperator(operator);
                                    setIsOperatorModalVisible(false);
                                }}
                            >
                                <Text style={[
                                    styles.modalItemText,
                                    selectedOperator.id === operator.id && styles.modalItemTextSelected
                                ]}>
                                    {operator.name}
                                </Text>
                                {selectedOperator.id === operator.id && (
                                    <MaterialIcons name="check-circle" size={20} color={Colors.primary} />
                                )}
                            </TouchableOpacity>
                        ))}
                    </View>
                </TouchableOpacity>
            </Modal>

            {/* Circle Modal */}
            <Modal
                visible={isCircleModalVisible}
                transparent={true}
                animationType="fade"
                onRequestClose={() => setIsCircleModalVisible(false)}
            >
                <TouchableOpacity
                    style={styles.modalOverlay}
                    activeOpacity={1}
                    onPress={() => setIsCircleModalVisible(false)}
                >
                    <View style={styles.modalContent}>
                        <View style={styles.modalHeader}>
                            <Text style={styles.modalTitle}>Select Circle</Text>
                            <TouchableOpacity onPress={() => setIsCircleModalVisible(false)}>
                                <MaterialIcons name="close" size={24} color={Colors.textSecondary} />
                            </TouchableOpacity>
                        </View>
                        {CIRCLES.map((circle, index) => (
                            <TouchableOpacity
                                key={circle.id}
                                style={[
                                    styles.modalItem,
                                    index === CIRCLES.length - 1 && styles.modalItemLast
                                ]}
                                onPress={() => {
                                    setSelectedCircle(circle);
                                    setIsCircleModalVisible(false);
                                }}
                            >
                                <Text style={[
                                    styles.modalItemText,
                                    selectedCircle.id === circle.id && styles.modalItemTextSelected
                                ]}>
                                    {circle.name}
                                </Text>
                                {selectedCircle.id === circle.id && (
                                    <MaterialIcons name="check-circle" size={20} color={Colors.primary} />
                                )}
                            </TouchableOpacity>
                        ))}
                    </View>
                </TouchableOpacity>
            </Modal>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: Colors.bgLightest,
    },
    scrollContent: {
        paddingBottom: 100,
    },

    /* Hero Banner */
    heroBanner: {
        backgroundColor: Colors.primaryDark,
        borderBottomLeftRadius: 32,
        borderBottomRightRadius: 32,
        overflow: 'hidden',
    },
    bannerContent: {
        flexDirection: 'row',
        padding: 24,
        paddingTop: 16,
    },
    bannerTextSection: {
        flex: 1,
    },
    bannerTitle: {
        fontSize: 24,
        fontWeight: '800',
        fontFamily: Poppins.extraBold,
        color: Colors.white,
        lineHeight: 32,
    },
    bannerTitleOrange: {
        color: '#FF6B00',
    },
    bannerSubtitle: {
        fontSize: 11,
        fontFamily: Poppins.regular,
        color: 'rgba(255,255,255,0.8)',
        marginTop: 8,
        lineHeight: 16,
    },
    iconRow: {
        flexDirection: 'row',
        gap: 8,
        marginTop: 16,
    },
    iconBox: {
        width: 36,
        height: 36,
        borderRadius: 8,
        backgroundColor: 'rgba(255,255,255,0.1)',
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.2)',
        alignItems: 'center',
        justifyContent: 'center',
    },

    /* Phone Mockup */
    phoneMockup: {
        position: 'relative',
        width: 140,
        alignItems: 'center',
        justifyContent: 'center',
    },
    phoneFrame: {
        opacity: 0.3,
    },
    orangeBadge: {
        position: 'absolute',
        top: 10,
        right: 10,
        backgroundColor: '#FF6B00',
        borderRadius: 20,
        paddingHorizontal: 12,
        paddingVertical: 8,
    },
    orangeBadgeText: {
        fontSize: 9,
        fontWeight: '800',
        fontFamily: Poppins.extraBold,
        color: Colors.white,
        textAlign: 'center',
        lineHeight: 12,
    },
    playButton: {
        position: 'absolute',
        bottom: 20,
        right: 20,
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: Colors.primary,
        alignItems: 'center',
        justifyContent: 'center',
        shadowColor: Colors.primary,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
        elevation: 4,
    },

    /* Search Bar */
    searchContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: Colors.white,
        borderRadius: 12,
        paddingHorizontal: 16,
        paddingVertical: 12,
        margin: 20,
        marginBottom: 16,
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

    /* Sections */
    section: {
        paddingHorizontal: 20,
        marginBottom: 20,
    },
    sectionLabel: {
        fontSize: 14,
        fontWeight: '600',
        fontFamily: Poppins.semiBold,
        color: Colors.textDark,
        marginBottom: 10,
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
    input: {
        flex: 1,
        fontFamily: Poppins.medium,
        fontSize: 16,
        color: Colors.textDark,
        paddingVertical: 12,
    },
    labelRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 8,
    },
    loadingContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 12,
        gap: 8,
    },
    loadingText: {
        fontSize: 13,
        color: Colors.textMuted,
        fontFamily: Poppins.medium,
    },
    validationLoader: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 16,
        gap: 8,
        backgroundColor: Colors.white,
        borderRadius: 12,
        borderWidth: 1,
        borderColor: Colors.divider,
    },
    validationLoaderText: {
        fontSize: 13,
        color: Colors.textMuted,
        fontFamily: Poppins.medium,
    },

    /* Selection Row */
    selectionRow: {
        flexDirection: 'row',
        paddingHorizontal: 20,
        gap: 12,
        marginBottom: 20,
    },
    selectionItem: {
        flex: 1,
    },
    selectionLabel: {
        fontSize: 12,
        fontFamily: Poppins.medium,
        color: Colors.textSecondary,
        marginBottom: 8,
    },
    dropdown: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        backgroundColor: Colors.white,
        borderRadius: 12,
        paddingHorizontal: 12,
        paddingVertical: 12,
        borderWidth: 1,
        borderColor: Colors.divider,
    },
    dropdownLeft: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
    },
    operatorBadge: {
        backgroundColor: Colors.error,
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 4,
    },
    operatorBadgeText: {
        fontSize: 10,
        fontWeight: '700',
        fontFamily: Poppins.bold,
        color: Colors.white,
    },
    dropdownText: {
        fontSize: 13,
        fontFamily: Poppins.semiBold,
        fontWeight: '600',
        color: Colors.textDark,
    },

    /* Info Box */
    infoBox: {
        flexDirection: 'row',
        alignItems: 'flex-start',
        backgroundColor: Colors.infoBg,
        borderRadius: 12,
        padding: 14,
        marginHorizontal: 20,
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
    continueButton: {
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
    continueButtonDisabled: {
        backgroundColor: Colors.textMuted,
        opacity: 0.5,
    },
    continueButtonText: {
        color: Colors.white,
        fontSize: 16,
        fontWeight: '700',
        fontFamily: Poppins.bold,
    },

    /* Modals */
    modalOverlay: {
        flex: 1,
        backgroundColor: Colors.overlay,
        justifyContent: 'center',
        alignItems: 'center',
        paddingHorizontal: 24,
    },
    modalContent: {
        width: '100%',
        backgroundColor: Colors.white,
        borderRadius: 20,
        padding: 20,
        elevation: 8,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.15,
        shadowRadius: 12,
    },
    modalHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 16,
    },
    modalTitle: {
        fontSize: 18,
        fontWeight: '700',
        fontFamily: Poppins.bold,
        color: Colors.textDark,
    },
    modalItem: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingVertical: 14,
        borderBottomWidth: 1,
        borderBottomColor: Colors.divider,
    },
    modalItemLast: {
        borderBottomWidth: 0,
    },
    modalItemText: {
        fontSize: 14,
        fontFamily: Poppins.medium,
        color: Colors.textBody,
    },
    modalItemTextSelected: {
        color: Colors.primary,
        fontWeight: '700',
        fontFamily: Poppins.bold,
    },
});

export default CableTVRechargeScreen;
