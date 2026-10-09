import React from 'react';
import { View, Text, StyleSheet, ScrollView, Dimensions, TouchableOpacity } from 'react-native';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import { Colors } from '../../../../../../theme';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../../../../../navigation/RootNavigator';
import { Poppins } from '../../../../../../theme/typography';

const { width } = Dimensions.get('window');
const CARD_WIDTH = width * 0.75;

interface RePopularPlansProps {
    data: any[];
    onSelectPlan: (plan: any) => void;
}

export const RePopularPlans: React.FC<RePopularPlansProps> = ({ data, onSelectPlan }) => {

    if (!data || data.length === 0) {
        return null;
    }

    return (
        <View style={styles.container}>
            <View style={styles.sectionHeader}>
                <Text style={styles.sectionTitle}>Recommended Offers</Text>
                <MaterialCommunityIcons name="brightness-percent" size={24} color={Colors.warningText} />
            </View>
            <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.scrollContainer}
                snapToInterval={CARD_WIDTH + 16}
                decelerationRate="fast"
            >
                {data.map((item, index) => (
                    <TouchableOpacity
                        key={index}
                        style={styles.card}
                        activeOpacity={0.9}
                        onPress={() => onSelectPlan({ rs: item.price, desc: item.ofrtext, validity: 'N/A' })}
                    >
                        <View style={styles.cardHeader}>
                            <View style={styles.priceContainer}>
                                <Text style={styles.currency}>₹</Text>
                                <Text style={styles.price}>{item.price}</Text>
                            </View>
                            {item.commissionAmount && item.commissionAmount !== "0" && (
                                <View style={styles.commissionBadge}>
                                    <Text style={styles.commissionText}>
                                        Save {item.commissionUnit === 'P' ? `${item.commissionAmount}%` : `₹${item.commissionAmount}`}
                                    </Text>
                                </View>
                            )}
                        </View>

                        <View style={styles.divider} />

                        <Text style={styles.offerText} numberOfLines={3}>
                            {item.ofrtext}
                        </Text>

                        <Text style={styles.logDesc} numberOfLines={1}>
                            {item.logdesc}
                        </Text>

                        <View style={styles.footer}>
                            <Text style={styles.selectText}>Select Offer</Text>
                            <MaterialCommunityIcons name="chevron-right-circle" size={20} color={Colors.primary} />
                        </View>
                    </TouchableOpacity>
                ))}
            </ScrollView>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        marginTop: 20,
        marginBottom: 10,
    },
    sectionHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 20,
        marginBottom: 12,
    },
    sectionTitle: {
        fontSize: 20,
        fontFamily: Poppins.bold,
        fontWeight: '900',
        color: Colors.textDark,
        marginRight: 8,
        letterSpacing: 0.5,
    },
    scrollContainer: {
        paddingHorizontal: 20,
        paddingBottom: 20,
    },
    card: {
        width: CARD_WIDTH,
        backgroundColor: Colors.white,
        borderRadius: 20,
        marginRight: 16,
        padding: 16,
        shadowColor: Colors.primary,
        shadowOffset: {
            width: 0,
            height: 3,
        },
        shadowOpacity: 0.17,
        shadowRadius: 3.05,
        elevation: 2,
        borderWidth: 1,
        borderColor: Colors.decorLine,
        borderTopWidth: 4,
        borderTopColor: Colors.warningText,
    },
    cardHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        marginBottom: 12,
    },
    priceContainer: {
        flexDirection: 'row',
        alignItems: 'baseline',
    },
    currency: {
        fontSize: 16,
        fontFamily: Poppins.bold,
        fontWeight: '800',
        color: Colors.textDark,
        marginRight: 2,
    },
    price: {
        fontSize: 20,
        fontFamily: Poppins.bold,
        fontWeight: '900',
        color: Colors.textDark,
        letterSpacing: -1,
    },
    commissionBadge: {
        backgroundColor: Colors.warningLight,
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 8,
        borderWidth: 1,
        borderColor: Colors.warningBorder,
    },
    commissionText: {
        fontSize: 12,
        fontFamily: Poppins.bold,
        fontWeight: '800',
        color: Colors.warningText,
    },
    divider: {
        height: 1,
        backgroundColor: Colors.divider,
        marginBottom: 12,
    },
    offerText: {
        fontSize: 16,
        fontFamily: Poppins.semiBold,
        color: Colors.textDark,
        fontWeight: '600',
        lineHeight: 20,
        marginBottom: 8,
    },
    logDesc: {
        fontSize: 12,
        fontFamily: Poppins.medium,
        color: Colors.textSecondary,
        fontWeight: '500',
        marginBottom: 12,
    },
    footer: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginTop: 'auto',
        backgroundColor: Colors.bg,
        padding: 8,
        borderRadius: 10,
    },
    selectText: {
        fontSize: 12,
        fontFamily: Poppins.bold,
        fontWeight: '700',
        color: Colors.primary,
    }
});
