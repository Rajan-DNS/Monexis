import React from 'react';
import { View, Text, TouchableOpacity, Image } from 'react-native';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import { rechargeStyles as styles } from '../../rechargeStyles';

interface BillHistoryItem {
    id: string;
    operator: string;
    logo: string;
    date: string;
    amount: string;
}

interface RecentBillsProps {
    data: BillHistoryItem[];
}


export const RecentBills: React.FC<RecentBillsProps> = ({ data }) => {
    return (
        <View style={{ marginTop: 10 }}>
            {/* <View style={styles.sectionHeader}>
                <Text style={styles.sectionTitle}>Recent Bills</Text>
                <TouchableOpacity>
                    <Text style={styles.viewAll}>VIEW ALL</Text>
                </TouchableOpacity>
            </View> */}

            {data.map((bill) => (
                <View key={bill.id} style={styles.recentBillItem}>
                    <View style={styles.billIconContainer}>
                        <Image
                            source={{ uri: bill.logo }}
                            style={{ width: 32, height: 32, borderRadius: 16 }}
                            resizeMode="contain"
                        />
                    </View>
                    <View style={styles.recentInfo}>
                        <Text style={styles.recentName}>{bill.operator} Postpaid</Text>
                        <Text style={styles.recentPhone}>{bill.date}</Text>
                    </View>
                    <View style={{ alignItems: 'flex-end', marginRight: 16 }}>
                        <Text style={[styles.recentName, { fontSize: 16 }]}>₹{bill.amount}</Text>
                    </View>
                    <TouchableOpacity style={styles.repeatBtn}>
                        <MaterialCommunityIcons name="refresh" size={22} color="#3B82F6" />
                    </TouchableOpacity>
                </View>
            ))}
        </View>
    );
};
