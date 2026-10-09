import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import Colors from '../../../../theme/colors';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../../../navigation/RootNavigator';
import { Poppins } from '../../../../theme/typography';

const LICSuccessScreen = () => {
    const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
    const route = useRoute<RouteProp<RootStackParamList, 'LICSuccessScreen'>>();
    const params = route.params as any || {};

    // Get the data from the previous screen (PolicyDetailsScreen)
    const responseData = params.responseData;
    
    // Parse nested JSON if data is a string
    let parsedData: any = {};
    if (typeof responseData?.data === 'string') {
        try {
            parsedData = JSON.parse(responseData.data);
        } catch (error) {
            console.log('Error parsing nested response data', error);
        }
    } else if (responseData?.data) {
        parsedData = responseData.data;
    }

    const config = {
        title: responseData?.success ? 'Payment Successful' : 'Payment Failed',
        successMessage: responseData?.message || 'Your premium payment status fetched.',
        amount: params.amount || '0',
        operatorName: params.operatorName || parsedData?.OperatorId || 'LIC',
        details: [
            { label: 'Policy Number', value: params.consumerNumber || 'N/A' },
            { label: 'Operator ID', value: parsedData?.OperatorId || 'N/A' },
            { label: 'Transaction ID', value: String(parsedData?.TransactionId ?? 'N/A') },
            { label: 'P2A Balance', value: `₹ ${parsedData?.P2ABalance ?? 0}` },
            { label: 'P2P Balance', value: `₹ ${parsedData?.P2PBalance ?? 0}` },
        ],
    };

    return (
        <View style={styles.container}>
          
            <ScrollView contentContainerStyle={styles.scrollContent}>

                {/* Success/Status Header */}
                <View style={styles.headerSection}>
                    <View style={responseData?.success ? styles.successIconOuter : styles.failedIconOuter}>
                        <View style={responseData?.success ? styles.successIconInner : styles.failedIconInner}>
                            <MaterialCommunityIcons 
                                name={responseData?.success ? "check" : "close"} 
                                size={32} 
                                color={Colors.white} 
                            />
                        </View>
                    </View>
                    <Text style={styles.title}>{config.title}</Text>
                    <Text style={styles.subtitle}>{config.successMessage}</Text>
                </View>

                {/* Receipt Card */}
                <View style={styles.card}>
                    <Text style={styles.amountLabel}>AMOUNT PAID</Text>
                    <Text style={styles.amountText}>₹ {config.amount}</Text>

                    {/* Operator Box */}
                    <View style={styles.operatorBox}>
                        <View>
                            <Text style={styles.operatorLabel}>OPERATOR</Text>
                            <Text style={styles.operatorName}>{config.operatorName}</Text>
                        </View>
                        <View style={styles.operatorIcon}>
                            <MaterialCommunityIcons name="shield-check" size={24} color={Colors.primary} />
                        </View>
                    </View>

                    {/* All Response Details */}
                    <View style={styles.detailsSection}>
                        {config.details.map((detail, index) => (
                            <View key={index} style={styles.row}>
                                <Text style={styles.rowLabel}>{detail.label}</Text>
                                <Text style={styles.rowValue}>{detail.value}</Text>
                            </View>
                        ))}
                    </View>

                    {/* Dotted Line Divider */}
                    <View style={styles.divider} />

                    {/* BBPS Badge */}
                    <View style={styles.bbpsBadge}>
                        <View style={styles.bbpsIcon}>
                            <MaterialCommunityIcons name="check" size={14} color={Colors.white} />
                        </View>
                        <View>
                            <Text style={styles.bbpsTitle}>100% Secure Payment</Text>
                            <Text style={styles.bbpsSubtitle}>Payment secured by NextGen</Text>
                        </View>
                    </View>
                </View>

                {/* Action Buttons */}
                <TouchableOpacity style={styles.downloadButton}>
                    <Text style={styles.downloadButtonText}>↓ Download Receipt</Text>
                </TouchableOpacity>

                <TouchableOpacity style={styles.homeButton} onPress={() => navigation.navigate('MainTabs' as any)}>
                    <Text style={styles.homeButtonText}>Back to Home</Text>
                </TouchableOpacity>

            </ScrollView>
        </View>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: Colors.bg },
    scrollContent: { padding: 20 },
    headerSection: { alignItems: 'center', marginVertical: 30 },
    
    successIconOuter: { width: 80, height: 80, borderRadius: 40, backgroundColor: Colors.badgeSuccessBg, justifyContent: 'center', alignItems: 'center' },
    successIconInner: { width: 50, height: 50, borderRadius: 25, backgroundColor: Colors.success, justifyContent: 'center', alignItems: 'center' },
    
    failedIconOuter: { width: 80, height: 80, borderRadius: 40, backgroundColor: '#FEE2E2', justifyContent: 'center', alignItems: 'center' },
    failedIconInner: { width: 50, height: 50, borderRadius: 25, backgroundColor: '#EF4444', justifyContent: 'center', alignItems: 'center' },

    title: {
        fontSize: 20, fontWeight: 'bold', color: Colors.textDark, marginTop: 20,
        fontFamily: Poppins.bold,
    },
    subtitle: {
        fontSize: 16, color: Colors.textSecondary, marginTop: 8, textAlign: 'center',
        fontFamily: Poppins.bold,
    },

    card: { backgroundColor: Colors.white, borderRadius: 24, padding: 20, elevation: 0.3, shadowColor: Colors.shadow, shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 8 },
    amountLabel: {
        textAlign: 'center', color: Colors.primaryDark, fontSize: 12, fontWeight: 'bold',
        fontFamily: Poppins.bold,
    },
    amountText: {
        textAlign: 'center', fontSize: 20, fontWeight: 'bold', color: Colors.textDark, marginVertical: 10,
        fontFamily: Poppins.bold,
    },

    operatorBox: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', backgroundColor: Colors.bgInput, borderWidth: 1, borderColor: Colors.primaryLight, borderRadius: 16, padding: 15, marginVertical: 15 },
    operatorLabel: {
        fontSize: 12, color: Colors.textSecondary,
        fontFamily: Poppins.bold,
    },
    operatorName: {
        fontSize: 16, fontWeight: '600', color: Colors.textDark,
        fontFamily: Poppins.bold,
    },
    operatorIcon: { width: 40, height: 40, borderRadius: 8, backgroundColor: Colors.white, justifyContent: 'center', alignItems: 'center', borderWidth: 1, borderColor: Colors.primaryLight },
    
    detailsSection: { marginVertical: 10 },
    row: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 12 },
    rowLabel: {
        color: Colors.textSecondary, fontSize: 12,
        fontFamily: Poppins.bold,
    },
    rowValue: {
        color: Colors.textDark, fontSize: 12, fontWeight: '600',
        fontFamily: Poppins.bold,
    },

    divider: { borderStyle: 'dashed', borderBottomWidth: 1, borderColor: Colors.divider, marginVertical: 15 },
    bbpsBadge: { flexDirection: 'row', alignItems: 'center', backgroundColor: Colors.bgInput, padding: 12, borderRadius: 12, borderWidth: 1, borderColor: Colors.inputBorder },
    bbpsIcon: { width: 20, height: 20, borderRadius: 10, backgroundColor: Colors.primary, justifyContent: 'center', alignItems: 'center', marginRight: 10 },
    bbpsTitle: {
        fontSize: 12, fontWeight: 'bold', color: Colors.primary,
        fontFamily: Poppins.bold,
    },
    bbpsSubtitle: {
        fontSize: 12, color: Colors.primary,
        fontFamily: Poppins.bold,
    },

    downloadButton: { backgroundColor: Colors.primary, padding: 16, borderRadius: 12, alignItems: 'center', marginTop: 25 },
    downloadButtonText: {
        color: Colors.white, fontWeight: 'bold', fontSize: 16,
        fontFamily: Poppins.bold,
    },

    homeButton: {
        padding: 16,
        borderRadius: 12,
        alignItems: 'center',
        marginTop: 12,
        borderWidth: 1,
        borderColor: Colors.divider
    },
    homeButtonText: {
        color: Colors.textSecondary,
        fontWeight: 'bold',
        fontSize: 16,
        fontFamily: Poppins.bold,
    },
});

export default LICSuccessScreen;
