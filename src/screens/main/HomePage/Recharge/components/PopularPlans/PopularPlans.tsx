import React, { useState } from 'react';
import { View, Text, TouchableOpacity, Dimensions, ScrollView, StyleSheet, FlatList } from 'react-native';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import { Colors } from '../../../../../../theme';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../../../../../navigation/RootNavigator';
import { Poppins } from '../../../../../../theme/typography';

const { width } = Dimensions.get('window');

interface PlanCardProps {
    plan: any;
    onSelectPlan: (plan: any) => void;
}

export const PlanCard: React.FC<PlanCardProps> = ({ plan, onSelectPlan }) => {

    return (
        <View style={styles.cardContainer}>
            <View style={styles.accentBar} />
            <View style={styles.cardContent}>

                <View style={styles.headerRow}>
                    <View style={styles.priceContainer}>
                        <Text style={styles.currency}>₹</Text>
                        <Text style={styles.price}>{plan.rs}</Text>
                    </View>
                    <View style={styles.validityBadge}>
                        <MaterialCommunityIcons name="calendar-clock" size={14} color={Colors.primaryDark} style={{ marginRight: 4 }} />
                        <Text style={styles.validityText}>{plan.validity}</Text>
                    </View>
                </View>

                <View style={styles.divider} />

                <View style={styles.descContainer}>
                    <Text style={styles.descText} numberOfLines={4}>
                        {plan.desc}
                    </Text>
                </View>

                <TouchableOpacity
                    style={styles.selectBtn}
                    onPress={() => onSelectPlan(plan)}
                    activeOpacity={0.8}
                >
                    <Text style={styles.selectBtnText}>Select Plan</Text>
                    <MaterialCommunityIcons name="arrow-right-circle" size={20} color={Colors.white} />
                </TouchableOpacity>
            </View>
        </View>
    );
};

interface PopularPlansProps {
    data: any;
    onSelectPlan: (plan: any) => void;
}

export const PopularPlans: React.FC<PopularPlansProps> = ({ data, onSelectPlan }) => {
    const categories = data ? Object.keys(data) : [];
    const [activeTab, setActiveTab] = useState(categories.length > 0 ? categories[0] : '');
    const [visibleItemsCount, setVisibleItemsCount] = useState(10); // Moved to top!

    React.useEffect(() => {
        if (categories.length > 0 && !categories.includes(activeTab)) {
            setActiveTab(categories[0]);
        }
        setVisibleItemsCount(10);
    }, [data, categories, activeTab]);

    if (!data || categories.length === 0) {
        return null;
    }

    const currentPlans = data[activeTab] || [];
    const paginatedPlans = currentPlans.slice(0, visibleItemsCount);

    const loadMorePlans = () => {
        if (visibleItemsCount < currentPlans.length) {
            setVisibleItemsCount(prevCount => prevCount + 10);
        }
    };

    return (
        <View style={styles.container}>
            <View style={styles.sectionHeader}>
                <Text style={styles.sectionTitle}>Explore Plans</Text>
                <MaterialCommunityIcons name="star-shooting" size={24} color={Colors.warningText} />
            </View>

            <View style={styles.tabsWrapper}>
                <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.tabsScroll}>
                    {categories.map((cat) => {
                        const isActive = activeTab === cat;
                        return (
                            <TouchableOpacity
                                key={cat}
                                onPress={() => setActiveTab(cat)}
                                style={styles.tab}
                                activeOpacity={0.7}
                            >
                                <Text style={[
                                    styles.tabText,
                                    isActive ? styles.tabTextActive : styles.tabTextInactive
                                ]}>
                                    {cat}
                                </Text>
                                {/* This creates the clean active line indicator underneath the text */}
                                <View style={[
                                    styles.indicatorLine,
                                    isActive ? styles.indicatorActive : styles.indicatorInactive
                                ]} />
                            </TouchableOpacity>
                        );
                    })}
                </ScrollView>
            </View>
            <FlatList
                data={paginatedPlans}
                renderItem={({ item }) => (
                    <PlanCard plan={item} onSelectPlan={onSelectPlan} />
                )}
                keyExtractor={(item, index) => index.toString()}
                contentContainerStyle={styles.plansList}
                onEndReached={loadMorePlans}
                onEndReachedThreshold={0.1}
            />
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        // flex: 1,
        marginTop: 20,
    },
    sectionHeader: {
        flexDirection: 'row',
        // alignItems: 'center',
        paddingHorizontal: 16,
        marginBottom: 16,
    },
    sectionTitle: {
        fontSize: 20,
        fontFamily: Poppins.bold,

        color: Colors.textDark,
        marginRight: 8,
        letterSpacing: 0.5,
    },
    tabsWrapper: {
        marginBottom: 20,
        backgroundColor: '#fff',
        borderBottomWidth: 1,
        borderBottomColor: Colors.decorLine,
    },
    tabsScroll: {
        paddingHorizontal: 16,
    },
    tab: {
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: 20,
    },
    tabText: {
        paddingHorizontal: 4,
        paddingVertical: 12,
        fontSize: 14,
        letterSpacing: 0.3,
        fontWeight: '500',
    },
    tabTextActive: {
        color: Colors.primary,
        fontWeight: '600',
    },
    tabTextInactive: {
        color: Colors.textSecondary,
    },
    indicatorLine: {
        height: 3,
        width: '100%',
        borderRadius: 2,
        marginTop: -2,
    },
    indicatorActive: {
        backgroundColor: Colors.warningText,
    },
    indicatorInactive: {
        backgroundColor: 'transparent',
    },
    plansList: {
        paddingHorizontal: 20,
        paddingBottom: 24,
    },

    // PlanCard Styles
    cardContainer: {
        backgroundColor: Colors.white,
        borderRadius: 24,
        marginBottom: 20,
        width: '100%',
        alignSelf: 'center',
        shadowColor: Colors.primary,
        shadowOffset: {
            width: 0,
            height: 3,
        },
        shadowOpacity: 0.17,
        shadowRadius: 3.05,
        elevation: 2,
        overflow: 'hidden',
        borderWidth: 1,
        borderColor: Colors.decorLine,
    },
    accentBar: {
        height: 6,
        width: '100%',
        backgroundColor: Colors.primary,
    },
    cardContent: {
        padding: 20,
    },
    headerRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 16,
    },
    priceContainer: {
        flexDirection: 'row',
        alignItems: 'baseline',
    },
    currency: {
        fontSize: 20,
        fontFamily: Poppins.bold,

        color: Colors.textDark,
        marginRight: 2,
    },
    price: {
        fontSize: 20,
        fontFamily: Poppins.bold,

        color: Colors.textDark,
        letterSpacing: -1,
    },
    validityBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: Colors.primaryLight || '#E0E7FF',
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 12,
    },
    validityText: {
        fontSize: 12,
        fontFamily: Poppins.bold,

        color: Colors.primaryDark,
    },
    divider: {
        height: 1,
        backgroundColor: Colors.divider,
        marginBottom: 16,
    },
    descContainer: {
        marginBottom: 20,
        backgroundColor: Colors.bg,
        padding: 12,
        borderRadius: 12,
        borderWidth: 1,
        borderColor: Colors.decorLine,
    },
    descText: {
        fontSize: 12,
        fontFamily: Poppins.medium,
        color: Colors.textBody,
        lineHeight: 20,

    },
    selectBtn: {
        backgroundColor: Colors.primaryDark,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 14,
        borderRadius: 16,
        shadowColor: Colors.primary,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
        elevation: 0.3,
    },
    selectBtnText: {
        color: Colors.white,
        fontSize: 16,
        fontFamily: Poppins.bold,

        marginRight: 8,
        letterSpacing: 0.5,
    },
});
