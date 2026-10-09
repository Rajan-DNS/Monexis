import React from 'react';
import {
    StyleSheet,
    Text,
    View,
    TextInput,
    TouchableOpacity,
    ScrollView,
    Image,
} from 'react-native';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import Colors from '../../../../../../theme/colors';
import AppHeader from '../../../../../../components/Header/AppHeader';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../../../../../navigation/RootNavigator';
import LinearGradient from 'react-native-linear-gradient';
import { Poppins } from '../../../../../../theme/typography';

export interface UtilityConfig {
    type: 'Electricity' | 'DTH' | 'Water' | 'Gas' | 'Broadband';
    title: string;
    operatorLabel: string;
    consumerLabel: string;
    placeholder: string;
    icon: string;
    bannerTitle: string;
    bannerDesc: string;
    bannerIcon: string;
    recentData: any[];
    nextScreen: keyof RootStackParamList;
}

interface UtilityRechargeBaseProps {
    config: UtilityConfig;
}

const UtilityRechargeBase: React.FC<UtilityRechargeBaseProps> = ({ config }) => {
    const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();

    return (
        <View style={styles.container}>
            <AppHeader
                title={config.title}
                onBackPress={() => navigation.goBack()}
                showBack
            />

            <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>

                {/* Form Section */}
                <View style={styles.card}>
                    <Text style={styles.label}>{config.operatorLabel}</Text>
                    <TouchableOpacity style={styles.dropdown}>
                        <View style={styles.iconContainer}>
                            <MaterialCommunityIcons name={config.icon} size={20} color={Colors.primary} />
                        </View>
                        <Text style={styles.dropdownText}>Select Operator</Text>
                        <MaterialCommunityIcons name="chevron-down" size={20} color={Colors.textSecondary} />
                    </TouchableOpacity>

                    <View style={styles.labelRow}>
                        <Text style={styles.label}>{config.consumerLabel}</Text>
                        <TouchableOpacity style={styles.helpLink}>
                            <MaterialCommunityIcons name="information" size={14} color={Colors.primary} />
                            <Text style={[styles.helpText, { color: Colors.primary }]}> WHERE TO FIND?</Text>
                        </TouchableOpacity>
                    </View>
                    <TextInput
                        style={styles.input}
                        placeholder={config.placeholder}
                        placeholderTextColor={Colors.textMuted}
                    />

                    <TouchableOpacity
                        style={[styles.payButton, { backgroundColor: Colors.primary }]}
                        onPress={() => navigation.navigate(config.nextScreen as any)}
                    >
                        <Text style={styles.payButtonText}>PROCEED TO PAY</Text>
                        <MaterialCommunityIcons name="arrow-right" size={20} color={Colors.white} />
                    </TouchableOpacity>
                </View>

                {/* Recent Provider Section */}
                <Text style={styles.sectionTitle}>Recent Provider</Text>
                <View style={styles.grid}>
                    <View style={styles.gridContainer}>
                        {config.recentData?.map((item) => (
                            <TouchableOpacity
                                key={item.id}
                                style={styles.gridItem}
                                onPress={() => navigation.navigate(config.nextScreen as any)}
                            >
                                <View style={styles.logoContainer}>
                                    {typeof item.logo === 'number' ? (
                                        <Image source={item.logo} style={styles.logo} resizeMode="contain" />
                                    ) : (
                                        <MaterialCommunityIcons name={config.icon} size={30} color={Colors.primary} />
                                    )}
                                </View>
                                <Text style={styles.operatorText}>{item.operator}</Text>
                            </TouchableOpacity>
                        ))}
                    </View>
                </View>

                {/* Banner Section */}
                <LinearGradient
                    colors={[Colors.primaryDark, Colors.primary]}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 0 }}
                    style={styles.banner}>
                    <View style={{ flex: 1 }}>
                        <Text style={styles.bannerSub}>NEW FEATURE</Text>
                        <Text style={styles.bannerTitle}>{config.bannerTitle}</Text>
                        <Text style={styles.bannerDesc}>{config.bannerDesc}</Text>
                    </View>
                    <MaterialCommunityIcons name={config.bannerIcon} size={40} color={Colors.white} />
                </LinearGradient>

                {/* Recent Recharges Section */}
                {config.recentData?.some(item => item.date && item.amount) && (
                    <>
                        {/* <View style={styles.sectionHeader}>
                            <Text style={styles.sectionTitle}>Recent Recharges</Text>
                            <TouchableOpacity>
                                <Text style={styles.viewAll}>View All</Text>
                            </TouchableOpacity>
                        </View> */}
                        <View style={styles.rechargesList}>
                            {config.recentData.filter(item => item.date && item.amount).map((item) => (
                                <TouchableOpacity
                                    key={item.id}
                                    style={styles.rechargeItem}
                                    onPress={() => navigation.navigate(config.nextScreen as any)}
                                >
                                    <View style={styles.rechargeLogoContainer}>
                                        {typeof item.logo === 'number' ? (
                                            <Image source={item.logo} style={styles.rechargeLogo} resizeMode="contain" />
                                        ) : typeof item.logo === 'string' && item.logo.startsWith('http') ? (
                                            <Image source={{ uri: item.logo }} style={styles.rechargeLogo} resizeMode="contain" />
                                        ) : (
                                            <MaterialCommunityIcons name={config.icon} size={20} color={Colors.primary} />
                                        )}
                                    </View>
                                    <View style={styles.rechargeInfo}>
                                        <Text style={styles.rechargeName}>{item.operator}</Text>
                                        <Text style={styles.rechargeDate}>{item.date} • ID: {item.id_number || '...'}</Text>
                                    </View>
                                    <View style={styles.rechargeAmountSection}>
                                        <Text style={styles.rechargeAmount}>₹{item.amount}.00</Text>
                                        <View style={styles.rePayBadge}>
                                            <Text style={styles.rePayText}>Re-Pay</Text>
                                        </View>
                                    </View>
                                </TouchableOpacity>
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
    scrollContent: { padding: 16 },
    card: { backgroundColor: Colors.white, borderRadius: 12, padding: 16, elevation: 0.3, shadowColor: Colors.shadow, shadowOpacity: 0.05, shadowRadius: 10 },
    label: { fontSize: 12, fontWeight: '700', color: Colors.textSecondary, marginBottom: 8, fontFamily: Poppins.semiBold, },

    labelRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 16, marginBottom: 8 },
    dropdown: {
        flexDirection: 'row',
        alignItems: 'center',
        borderWidth: 1,
        borderColor: Colors.inputBorder,
        borderRadius: 12,
        padding: 12
    },
    dropdownText: { flex: 1, color: Colors.textBody, fontSize: 16, marginLeft: 12, },

    iconContainer: { padding: 8, backgroundColor: Colors.bgInput, borderRadius: 8, borderWidth: 1, borderColor: Colors.inputBorder },
    helpLink: { flexDirection: 'row', alignItems: 'center' },
    helpText: { fontSize: 12, color: Colors.primary, fontWeight: 'bold', },

    input: { borderWidth: 1, borderColor: Colors.inputBorder, borderRadius: 12, padding: 16, fontSize: 16, color: Colors.textDark, },

    payButton: {
        backgroundColor: Colors.primary,
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        padding: 18,
        borderRadius: 12,
        marginTop: 24
    },
    payButtonText: { color: Colors.white, fontWeight: 'bold', fontSize: 16, marginRight: 8, },

    sectionTitle: { fontSize: 16, fontWeight: '700', color: Colors.textDark, marginTop: 24, marginBottom: 16, },

    grid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between' },
    gridContainer: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        justifyContent: 'space-between',
        paddingHorizontal: 4,
    },
    gridItem: {
        width: '48%',
        backgroundColor: Colors.white,
        borderRadius: 24,
        paddingVertical: 24,
        alignItems: 'center',
        marginBottom: 16,
        borderWidth: 1,
        borderColor: Colors.borderLight,
        elevation: 0.3,
        shadowColor: Colors.shadow,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.04,
        shadowRadius: 12,
    },
    logoContainer: {
        width: 64,
        height: 64,
        borderRadius: 32,
        backgroundColor: Colors.bgInput,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 12,
        borderWidth: 1,
        borderColor: Colors.borderLight,
    },
    logo: { width: 40, height: 40 },
    operatorText: {
        fontSize: 16,

        fontWeight: 'bold',
        color: Colors.textDark,
        textAlign: 'center',
    },
    banner: {
        borderRadius: 16,
        padding: 20,
        flexDirection: 'row',
        alignItems: 'center',
        marginTop: 20,
        marginBottom: 40
    },
    bannerSub: { color: Colors.primaryLight, fontSize: 12, fontWeight: 'bold', letterSpacing: 1, },

    bannerTitle: { color: Colors.white, fontSize: 20, fontWeight: 'bold', marginVertical: 4, },

    bannerDesc: { color: Colors.white, fontSize: 12, },

    sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 24, marginBottom: 16 },
    viewAll: { color: Colors.primary, fontWeight: 'bold', fontSize: 12, },

    rechargesList: { gap: 12, marginBottom: 40 },
    rechargeItem: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: Colors.white,
        padding: 16,
        borderRadius: 16,
        borderWidth: 1,
        borderColor: Colors.borderLight,
    },
    rechargeLogoContainer: {
        width: 44,
        height: 44,
        borderRadius: 12,
        backgroundColor: Colors.bgInput,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 12,
    },
    rechargeLogo: { width: 28, height: 28 },
    rechargeInfo: { flex: 1 },
    rechargeName: { fontSize: 16, fontWeight: 'bold', color: Colors.textDark, },

    rechargeDate: { fontSize: 12, color: Colors.textSecondary, marginTop: 2, },

    rechargeAmountSection: { alignItems: 'flex-end' },
    rechargeAmount: { fontSize: 16, fontWeight: 'bold', color: Colors.textDark, },

    rePayBadge: {
        backgroundColor: Colors.successLight,
        paddingHorizontal: 8,
        paddingVertical: 2,
        borderRadius: 4,
        marginTop: 4,
        borderWidth: 1,
        borderColor: Colors.successBorder,
    },
    rePayText: { color: Colors.successDark, fontSize: 12, fontWeight: 'bold', },

});

export default UtilityRechargeBase;
