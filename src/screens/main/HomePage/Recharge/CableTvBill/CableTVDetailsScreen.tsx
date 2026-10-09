import React, { useState } from 'react';
import {
    StyleSheet,
    Text,
    View,
    TouchableOpacity,
    ScrollView,
    SafeAreaView,
    StatusBar,
    Image,
} from 'react-native';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import Colors from '../../../../../theme/colors';
import { Poppins } from '../../../../../theme/typography';
import AppHeader from '../../../../../components/Header/AppHeader';
import { useNavigation, useRoute } from '@react-navigation/native';

interface Plan {
    id: string;
    name: string;
    price: number;
    channels: number;
    validity: string;
    features: string[];
    popular?: boolean;
}

const PLANS: Plan[] = [
    {
        id: 'basic',
        name: 'Basic',
        price: 199,
        channels: 100,
        validity: '30 days',
        features: ['HD Channels', 'News & Entertainment', 'Regional Channels'],
    },
    {
        id: 'family',
        name: 'Family',
        price: 299,
        channels: 150,
        validity: '30 days',
        features: ['HD Channels', 'Kids Channels', 'Movies & Entertainment', 'Regional'],
        popular: true,
    },
    {
        id: 'hd',
        name: 'HD',
        price: 399,
        channels: 200,
        validity: '30 days',
        features: ['Full HD Channels', 'Premium Movies', 'Sports Channels', 'Kids & Regional'],
    },
    {
        id: 'sports',
        name: 'Sports',
        price: 499,
        channels: 180,
        validity: '30 days',
        features: ['All Sports Channels', 'Live Matches', 'HD Quality', 'Entertainment'],
    },
    {
        id: 'premium',
        name: 'Premium',
        price: 699,
        channels: 300,
        validity: '30 days',
        features: ['All Channels', '4K Quality', 'Premium Sports', 'International Channels', 'Movies On Demand'],
    },
];

const CableTVDetailsScreen = () => {
    const navigation = useNavigation();
    const route = useRoute();
    const { operator, circle, consumerNumber } = route.params as any;
    
    const [selectedPlan, setSelectedPlan] = useState<Plan | null>(null);

    const handleBookNow = (plan: Plan) => {
        navigation.navigate('CableTVPayScreen' as any, {
            operator,
            circle,
            consumerNumber,
            plan,
        });
    };

    return (
        <SafeAreaView style={styles.container}>
            <StatusBar barStyle="dark-content" backgroundColor={Colors.white} />

            <AppHeader
                title="Select Plan"
                showBack
                onBackPress={() => navigation.goBack()}
            />

            <ScrollView
                contentContainerStyle={styles.scrollContent}
                showsVerticalScrollIndicator={false}
            >
                {/* Account Info Card */}
                <View style={styles.accountCard}>
                    <View style={styles.accountHeader}>
                        <View style={styles.operatorBadge}>
                            <Text style={styles.operatorBadgeText}>{operator.shortName}</Text>
                        </View>
                        <View style={styles.accountInfo}>
                            <Text style={styles.operatorName}>{operator.name}</Text>
                            <Text style={styles.consumerNumber}>{consumerNumber}</Text>
                        </View>
                    </View>
                    <View style={styles.locationRow}>
                        <MaterialIcons name="location-on" size={16} color={Colors.primary} />
                        <Text style={styles.locationText}>{circle.name}</Text>
                        <TouchableOpacity
                            style={styles.changeButton}
                            onPress={() => navigation.goBack()}
                        >
                            <Text style={styles.changeButtonText}>Change Plan</Text>
                        </TouchableOpacity>
                    </View>
                </View>

                {/* Plans Section */}
                <View style={styles.plansSection}>
                    <Text style={styles.sectionTitle}>Available Plans</Text>
                    <Text style={styles.sectionSubtitle}>Choose the best plan for your entertainment</Text>

                    {PLANS.map((plan, index) => (
                        <View
                            key={plan.id}
                            style={[
                                styles.planCard,
                                plan.popular && styles.planCardPopular,
                            ]}
                        >
                            {plan.popular && (
                                <View style={styles.popularBadge}>
                                    <MaterialIcons name="star" size={14} color={Colors.white} />
                                    <Text style={styles.popularText}>Most Popular</Text>
                                </View>
                            )}

                            <View style={styles.planHeader}>
                                <View style={styles.planLeft}>
                                    <Text style={styles.planName}>{plan.name}</Text>
                                    <View style={styles.channelsRow}>
                                        <MaterialCommunityIcons 
                                            name="television-play" 
                                            size={16} 
                                            color={Colors.textSecondary} 
                                        />
                                        <Text style={styles.channelsText}>{plan.channels}+ Channels</Text>
                                    </View>
                                </View>
                                <View style={styles.planRight}>
                                    <Text style={styles.planPrice}>₹{plan.price}</Text>
                                    <Text style={styles.planValidity}>{plan.validity}</Text>
                                </View>
                            </View>

                            {/* Features */}
                            <View style={styles.featuresContainer}>
                                {plan.features.map((feature, idx) => (
                                    <View key={idx} style={styles.featureRow}>
                                        <MaterialIcons 
                                            name="check-circle" 
                                            size={16} 
                                            color={Colors.success} 
                                        />
                                        <Text style={styles.featureText}>{feature}</Text>
                                    </View>
                                ))}
                            </View>

                            {/* Channel Logos */}
                            <View style={styles.channelLogos}>
                                <View style={styles.channelLogo}>
                                    <MaterialCommunityIcons name="netflix" size={20} color="#E50914" />
                                </View>
                                <View style={styles.channelLogo}>
                                    <MaterialCommunityIcons name="youtube" size={20} color="#FF0000" />
                                </View>
                                <View style={styles.channelLogo}>
                                    <MaterialCommunityIcons name="play-circle" size={20} color={Colors.primary} />
                                </View>
                                <View style={styles.channelLogo}>
                                    <MaterialCommunityIcons name="television" size={20} color={Colors.secondary} />
                                </View>
                                <View style={styles.moreChannels}>
                                    <Text style={styles.moreChannelsText}>+{plan.channels - 4}</Text>
                                </View>
                            </View>

                            {/* Book Now Button */}
                            <TouchableOpacity
                                style={[
                                    styles.bookButton,
                                    plan.popular && styles.bookButtonPopular,
                                ]}
                                onPress={() => handleBookNow(plan)}
                                activeOpacity={0.8}
                            >
                                <Text style={styles.bookButtonText}>Book Now</Text>
                                <MaterialIcons name="arrow-forward" size={18} color={Colors.white} />
                            </TouchableOpacity>
                        </View>
                    ))}
                </View>

                {/* Info Note */}
                <View style={styles.infoBox}>
                    <MaterialIcons name="info-outline" size={18} color={Colors.infoDark} />
                    <Text style={styles.infoText}>
                        All plans are auto-renewable. You can change or cancel anytime from your account settings.
                    </Text>
                </View>
            </ScrollView>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: Colors.bgLightest,
    },
    scrollContent: {
        paddingBottom: 24,
    },

    /* Account Card */
    accountCard: {
        backgroundColor: Colors.white,
        margin: 20,
        marginBottom: 16,
        borderRadius: 16,
        padding: 16,
        borderWidth: 1,
        borderColor: Colors.divider,
        shadowColor: Colors.shadow,
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 8,
        elevation: 2,
    },
    accountHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 12,
        gap: 12,
    },
    operatorBadge: {
        backgroundColor: Colors.error,
        paddingHorizontal: 12,
        paddingVertical: 8,
        borderRadius: 8,
    },
    operatorBadgeText: {
        fontSize: 12,
        fontWeight: '700',
        fontFamily: Poppins.bold,
        color: Colors.white,
    },
    accountInfo: {
        flex: 1,
    },
    operatorName: {
        fontSize: 16,
        fontWeight: '700',
        fontFamily: Poppins.bold,
        color: Colors.textDark,
        marginBottom: 2,
    },
    consumerNumber: {
        fontSize: 13,
        fontFamily: Poppins.medium,
        color: Colors.textSecondary,
    },
    locationRow: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingTop: 12,
        borderTopWidth: 1,
        borderTopColor: Colors.divider,
        gap: 6,
    },
    locationText: {
        flex: 1,
        fontSize: 13,
        fontFamily: Poppins.medium,
        color: Colors.textSecondary,
    },
    changeButton: {
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 6,
        backgroundColor: Colors.primaryLight,
    },
    changeButtonText: {
        fontSize: 12,
        fontWeight: '600',
        fontFamily: Poppins.semiBold,
        color: Colors.primary,
    },

    /* Plans Section */
    plansSection: {
        paddingHorizontal: 20,
    },
    sectionTitle: {
        fontSize: 20,
        fontWeight: '800',
        fontFamily: Poppins.extraBold,
        color: Colors.textDark,
        marginBottom: 4,
    },
    sectionSubtitle: {
        fontSize: 13,
        fontFamily: Poppins.regular,
        color: Colors.textSecondary,
        marginBottom: 20,
    },

    /* Plan Card */
    planCard: {
        backgroundColor: Colors.white,
        borderRadius: 16,
        padding: 16,
        marginBottom: 16,
        borderWidth: 1,
        borderColor: Colors.divider,
        shadowColor: Colors.shadow,
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 8,
        elevation: 2,
    },
    planCardPopular: {
        borderColor: Colors.primary,
        borderWidth: 2,
        shadowColor: Colors.primary,
        shadowOpacity: 0.15,
    },
    popularBadge: {
        position: 'absolute',
        top: -1,
        right: 16,
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: Colors.primary,
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderBottomLeftRadius: 8,
        borderBottomRightRadius: 8,
        gap: 4,
        shadowColor: Colors.primary,
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.3,
        shadowRadius: 4,
        elevation: 4,
    },
    popularText: {
        fontSize: 11,
        fontWeight: '700',
        fontFamily: Poppins.bold,
        color: Colors.white,
    },
    planHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        marginBottom: 16,
    },
    planLeft: {
        flex: 1,
    },
    planName: {
        fontSize: 18,
        fontWeight: '800',
        fontFamily: Poppins.extraBold,
        color: Colors.textDark,
        marginBottom: 6,
    },
    channelsRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
    },
    channelsText: {
        fontSize: 13,
        fontFamily: Poppins.medium,
        color: Colors.textSecondary,
    },
    planRight: {
        alignItems: 'flex-end',
    },
    planPrice: {
        fontSize: 24,
        fontWeight: '800',
        fontFamily: Poppins.extraBold,
        color: Colors.primary,
    },
    planValidity: {
        fontSize: 12,
        fontFamily: Poppins.regular,
        color: Colors.textMuted,
    },

    /* Features */
    featuresContainer: {
        marginBottom: 16,
        gap: 8,
    },
    featureRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
    },
    featureText: {
        fontSize: 13,
        fontFamily: Poppins.regular,
        color: Colors.textBody,
    },

    /* Channel Logos */
    channelLogos: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
        marginBottom: 16,
        paddingTop: 12,
        borderTopWidth: 1,
        borderTopColor: Colors.divider,
    },
    channelLogo: {
        width: 40,
        height: 40,
        borderRadius: 8,
        backgroundColor: Colors.bgLight,
        alignItems: 'center',
        justifyContent: 'center',
        borderWidth: 1,
        borderColor: Colors.divider,
    },
    moreChannels: {
        width: 40,
        height: 40,
        borderRadius: 8,
        backgroundColor: Colors.primaryLight,
        alignItems: 'center',
        justifyContent: 'center',
    },
    moreChannelsText: {
        fontSize: 11,
        fontWeight: '700',
        fontFamily: Poppins.bold,
        color: Colors.primary,
    },

    /* Book Button */
    bookButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: Colors.primaryDark,
        borderRadius: 12,
        paddingVertical: 14,
        gap: 8,
        shadowColor: Colors.primary,
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.2,
        shadowRadius: 4,
        elevation: 3,
    },
    bookButtonPopular: {
        backgroundColor: Colors.primary,
    },
    bookButtonText: {
        fontSize: 15,
        fontWeight: '700',
        fontFamily: Poppins.bold,
        color: Colors.white,
    },

    /* Info Box */
    infoBox: {
        flexDirection: 'row',
        alignItems: 'flex-start',
        backgroundColor: Colors.infoBg,
        borderRadius: 12,
        padding: 14,
        marginHorizontal: 20,
        marginTop: 8,
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
});

export default CableTVDetailsScreen;
