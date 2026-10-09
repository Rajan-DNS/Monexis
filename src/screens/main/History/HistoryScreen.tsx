import React, { useState } from 'react';
import {
    StyleSheet,
    Text,
    View,
    TouchableOpacity,
    ScrollView,
    FlatList,
    SectionList,
} from 'react-native';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import Colors from '../../../theme/colors';
import AppHeader from '../../../components/Header/AppHeader';
import { useNavigation } from '@react-navigation/native';
import { Poppins } from '../../../theme/typography';

const HISTORY_DATA = [
    {
        id: '1',
        title: 'Today',
        date: 'OCT 24, 2023',
        items: [
            { id: 't1', type: 'Mobile', icon: 'cellphone', subtitle: '+91 98765 43210', time: '10:45 AM', amount: '-$15.00', status: 'SUCCESS' },
            { id: 't2', type: 'Electricity', icon: 'lightning-bolt', subtitle: 'BP-29384756', time: '08:20 AM', amount: '-$84.50', status: 'PENDING' },
        ]
    },
    {
        id: '2',
        title: 'Yesterday',
        date: 'OCT 23, 2023',
        items: [
            { id: 'y1', type: 'Internet', icon: 'wifi', subtitle: 'Home Network Plan', time: '05:15 PM', amount: '-$45.00', status: 'SUCCESS' },
            { id: 'y2', type: 'Water', icon: 'water', subtitle: 'City Supply #0922', time: '11:30 AM', amount: '-$22.40', status: 'FAILED' },
        ]
    }
];

const HistoryScreen = () => {
    const navigation = useNavigation();
    const [activeTab, setActiveTab] = useState('All');

    // Filtering Logic
    const getFilteredData = () => {
        if (activeTab === 'All') return HISTORY_DATA;

        return HISTORY_DATA.map(section => ({
            ...section,
            data: section.items.filter(item => { // SectionList expects 'data' key
                if (activeTab === 'Successful') return item.status === 'SUCCESS';
                if (activeTab === 'Pending') return item.status === 'PENDING';
                if (activeTab === 'Failed') return item.status === 'FAILED';
                return true;
            })
        })).filter(section => section.data.length > 0);
    };

    // Prepare data for SectionList (mapping 'items' to 'data' if needed, or just using it directly)
    const sections = HISTORY_DATA.map(s => ({ ...s, data: s.items }));
    const filteredSections = activeTab === 'All'
        ? sections
        : sections.map(s => ({
            ...s,
            data: s.data.filter(item => {
                if (activeTab === 'Successful') return item.status === 'SUCCESS';
                if (activeTab === 'Pending') return item.status === 'PENDING';
                if (activeTab === 'Failed') return item.status === 'FAILED';
                return true;
            })
        })).filter(s => s.data.length > 0);

    const renderItem = ({ item }: any) => (
        <View style={styles.card}>
            <View style={[styles.iconContainer, { backgroundColor: getIconBgColor(item.type) }]}>
                <MaterialCommunityIcons name={item.icon} size={24} color={Colors.primary} />
            </View>
            <View style={styles.details}>
                <Text style={styles.itemTitle}>{item.type}</Text>
                <Text style={styles.itemSubtitle}>{item.subtitle}</Text>
                <Text style={styles.itemTime}>{item.time}</Text>
            </View>
            <View style={styles.amountContainer}>
                <Text style={styles.amountText}>{item.amount}</Text>
                <View style={[styles.statusBadge, { backgroundColor: getStatusColor(item.status).bg }]}>
                    <Text style={[styles.statusText, { color: getStatusColor(item.status).text }]}>{item.status}</Text>
                </View>
            </View>
        </View>
    );

    const renderSectionHeader = ({ section: { title, date } }: any) => (
        <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>{title}</Text>
            <Text style={styles.sectionDate}>{date}</Text>
        </View>
    );

    return (
        <View style={styles.container}>
            <AppHeader title="History" onBackPress={() => navigation.goBack()} showBack />

            {/* Filter Tabs */}
            <View style={styles.tabsContainer}>
                <FilterTab label="All" active={activeTab === 'All'} onPress={() => setActiveTab('All')} />
                <FilterTab label="Successful" active={activeTab === 'Successful'} onPress={() => setActiveTab('Successful')} />
                <FilterTab label="Pending" active={activeTab === 'Pending'} onPress={() => setActiveTab('Pending')} />
                <FilterTab label="Failed" active={activeTab === 'Failed'} onPress={() => setActiveTab('Failed')} />
            </View>

            <SectionList
                sections={filteredSections}
                keyExtractor={(item) => item.id}
                renderItem={renderItem}
                renderSectionHeader={renderSectionHeader}
                contentContainerStyle={styles.listContent}
                stickySectionHeadersEnabled={false}
                showsVerticalScrollIndicator={false}
                ListEmptyComponent={
                    <View style={styles.emptyContainer}>
                        <MaterialCommunityIcons name="history" size={60} color={Colors.divider} />
                        <Text style={styles.emptyText}>No transactions found</Text>
                    </View>
                }
            />
        </View>
    );
};

const FilterTab = ({ label, active, onPress }: any) => (
    <TouchableOpacity
        style={[styles.tab, active && styles.activeTab]}
        onPress={onPress}
    >
        <Text style={[styles.tabText, active && styles.activeTabText]}>{label}</Text>
    </TouchableOpacity>
);

const getStatusColor = (status: string) => {
    switch (status) {
        case 'SUCCESS': return { bg: '#E8F5E9', text: '#2E7D32' };
        case 'PENDING': return { bg: '#FFF3E0', text: '#E65100' };
        case 'FAILED': return { bg: '#FFEBEE', text: '#C62828' };
        default: return { bg: '#F5F5F5', text: '#757575' };
    }
};

const getIconBgColor = (type: string) => {
    switch (type) {
        case 'Mobile': return '#E3F2FD';
        case 'Electricity': return '#FFF3E0';
        case 'Internet': return '#E0F2F1';
        case 'Water': return '#E1F5FE';
        default: return Colors.bgInput;
    }
};

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: Colors.bg },
    tabsContainer: {
        flexDirection: 'row',
        paddingHorizontal: 12,
        paddingVertical: 15,
        gap: 8
    },
    tab: {
        flex: 1,
        paddingHorizontal: 4,
        paddingVertical: 8,
        borderRadius: 20,
        borderWidth: 1,
        borderColor: Colors.inputBorder,
        backgroundColor: Colors.white,
        alignItems: 'center',
        justifyContent: 'center',
    },
    activeTab: {
        backgroundColor: '#EBF4FF',
        borderColor: Colors.primary
    },
    tabText: {
        fontSize: 12,
        fontFamily: Poppins.medium,
        color: Colors.textSecondary,
    },
    activeTabText: {
        color: Colors.primary,
    },
    listContent: { paddingHorizontal: 20, paddingBottom: 30 },
    sectionHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'baseline',
        marginTop: 20,
        marginBottom: 15
    },
    sectionTitle: { fontSize: 20, color: Colors.textDark, fontFamily: Poppins.medium,},
    sectionDate: { fontSize: 12, color: '#B0B0B0', textTransform: 'uppercase', fontFamily: Poppins.medium,},
    card: {
        flexDirection: 'row',
        backgroundColor: Colors.white,
        borderRadius: 20,
        padding: 16,
        marginBottom: 12,
        alignItems: 'center',
        elevation: 1,
        shadowColor: '#000',
        shadowOpacity: 0.05,
        shadowRadius: 10,
    },
    iconContainer: {
        width: 50,
        height: 50,
        borderRadius: 25,
        justifyContent: 'center',
        alignItems: 'center',
    },
    details: { flex: 1, marginLeft: 15 },
    itemTitle: { fontSize: 16, color: Colors.textDark, fontFamily: Poppins.medium,},
    itemSubtitle: { fontSize: 12, color: Colors.textSecondary, marginTop: 2, fontFamily: Poppins.medium,},
    itemTime: { fontSize: 12, color: '#B0B0B0', marginTop: 4, fontFamily: Poppins.medium,},
    amountContainer: { alignItems: 'flex-end' },
    amountText: { fontSize: 16, color: Colors.textDark, fontFamily: Poppins.medium,},
    statusBadge: {
        paddingHorizontal: 10,
        paddingVertical: 4,
        borderRadius: 8,
        marginTop: 8,
    },
    statusText: { fontSize: 12, fontFamily: Poppins.medium,},
    emptyContainer: {
        alignItems: 'center',
        justifyContent: 'center',
        marginTop: 100,
    },
    emptyText: {
        fontSize: 16,
        fontFamily: Poppins.medium,
        color: Colors.textSecondary,
        marginTop: 12,
    },
});

export default HistoryScreen;
