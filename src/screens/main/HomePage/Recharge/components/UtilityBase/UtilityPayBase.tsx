import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import AppHeader from '../../../../../../components/Header/AppHeader';
import Colors from '../../../../../../theme/colors';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../../../../../navigation/RootNavigator';
import { Poppins } from '../../../../../../theme/typography';

export interface PayConfig {
    title: string;
    successMessage: string;
    amount: string;
    operatorName: string;
    operatorIcon: string;
    details: Array<{ label: string; value: string }>;
    rewards?: Array<{ label: string; value: string; color: string; icon: string }>;
    similarPayments?: Array<{ label: string; subLabel: string; icon: string }>;
}

interface UtilityPayBaseProps {
    config: PayConfig;
}

const UtilityPayBase: React.FC<UtilityPayBaseProps> = ({ config }) => {
    const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();

    return (
        <View style={styles.container}>
            <AppHeader
                title="Payment Successful"
                onBackPress={() => navigation.navigate('MainTabs' as any)}
                showBack
            />
            <ScrollView contentContainerStyle={styles.scrollContent}>

                {/* Success Header */}
                <View style={styles.headerSection}>
                    <View style={styles.successIconOuter}>
                        <View style={styles.successIconInner}>
                            <MaterialCommunityIcons name="check" size={32} color={Colors.white} />
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
                            <MaterialCommunityIcons name={config.operatorIcon} size={24} color={Colors.primary} />
                        </View>
                    </View>

                    {/* Details */}
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
                            <Text style={styles.bbpsTitle}>BBPS Assured</Text>
                            <Text style={styles.bbpsSubtitle}>Payment secured by Bharat BillPay</Text>
                        </View>
                    </View>
                </View>

                {/* Rewards / Balance Cards */}
                {config.rewards && (
                    <View style={styles.rewardsRow}>
                        {config.rewards.map((reward, index) => (
                            <View key={index} style={styles.rewardCard}>
                                <Text style={styles.rewardLabel}>{reward.label}</Text>
                                <Text style={[styles.rewardValue, { color: reward.color }]}>{reward.value}</Text>
                            </View>
                        ))}
                    </View>
                )}

                {/* Action Buttons */}
                <TouchableOpacity style={styles.downloadButton}>
                    <Text style={styles.downloadButtonText}>↓ Download Receipt</Text>
                </TouchableOpacity>

                <TouchableOpacity style={styles.homeButton} onPress={() => navigation.navigate('MainTabs' as any)}>
                    <Text style={styles.homeButtonText}>Back to Home</Text>
                </TouchableOpacity>

                {/* Similar Payments */}
                {config.similarPayments && (
                    <>
                        <Text style={styles.sectionTitle}>Similar Payments</Text>
                        <View style={styles.similarPaymentsRow}>
                            {config.similarPayments.map((item, index) => (
                                <View key={index} style={styles.similarCard}>
                                    <View style={styles.similarIconBox}>
                                        <MaterialCommunityIcons name={item.icon} size={24} color={Colors.success} />
                                    </View>
                                    <Text style={styles.similarLabel}>{item.label}</Text>
                                    <Text style={styles.similarSubLabel}>{item.subLabel}</Text>
                                </View>
                            ))}
                        </View>
                    </>
                )}

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
    title: {
        fontSize: 20, fontWeight: 'bold', color: Colors.textDark, marginTop: 20,
        fontFamily: Poppins.bold,
    },

    subtitle: {
        fontSize: 16, color: Colors.textSecondary, marginTop: 8,
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
    sectionTitle: {
        fontSize: 16, fontWeight: 'bold', color: Colors.textDark, marginTop: 30, marginBottom: 15,
        fontFamily: Poppins.bold,
    },

    similarPaymentsRow: { flexDirection: 'row', gap: 12, marginBottom: 30 },
    similarCard: {
        flex: 1,
        backgroundColor: Colors.white,
        padding: 16,
        borderRadius: 20,
        borderWidth: 1,
        borderColor: Colors.borderLight,
        elevation: 2,
        shadowColor: Colors.shadow,
        shadowOpacity: 0.05,
        shadowRadius: 10,
    },
    similarIconBox: {
        width: 40,
        height: 40,
        borderRadius: 12,
        backgroundColor: Colors.successLight,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 10,
    },
    similarLabel: {
        fontSize: 12, fontWeight: 'bold', color: Colors.textDark,
        fontFamily: Poppins.bold,
    },

    similarSubLabel: {
        fontSize: 12, color: Colors.textSecondary, marginTop: 2,
        fontFamily: Poppins.bold,
    },

    rewardsRow: { flexDirection: 'row', gap: 12, marginTop: 20 },
    rewardCard: {
        flex: 1,
        backgroundColor: Colors.white,
        padding: 16,
        borderRadius: 16,
        borderWidth: 1,
        borderColor: Colors.borderLight,
        elevation: 1,
        shadowColor: Colors.shadow,
        shadowOpacity: 0.05,
        shadowRadius: 5,
    },
    rewardLabel: {
        fontSize: 12, color: Colors.textSecondary, fontWeight: 'bold',
        fontFamily: Poppins.bold,
    },

    rewardValue: {
        fontSize: 16, fontWeight: 'bold', marginTop: 4,
        fontFamily: Poppins.bold,
    },

});

export default UtilityPayBase;
