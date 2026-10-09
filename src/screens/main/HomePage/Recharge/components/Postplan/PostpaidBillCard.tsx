import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import { rechargeStyles as styles } from '../../rechargeStyles';

interface PostpaidBillCardProps {
    amount: string;
    dueDate: string;
    onRechargeNow: () => void;
}

export const PostpaidBillCard: React.FC<PostpaidBillCardProps> = ({ amount, dueDate, onRechargeNow }) => {
    return (
        <View style={styles.postpaidBillCard}>
            <View style={styles.billDecoration} />
            <Text style={styles.billLabelSmall}>CURRENT BILL</Text>
            <Text style={styles.billAmount}>
                ₹{amount}<Text style={styles.billAmountDecimals}>.00</Text>
            </Text>
            
            <View style={styles.billDateRow}>
                <MaterialCommunityIcons name="calendar-clock" size={20} color="white" />
                <Text style={styles.billDateText}>Due Date: {dueDate}</Text>
            </View>

            <TouchableOpacity style={styles.billButton} onPress={onRechargeNow}>
                <Text style={styles.billButtonText}>Recharge Now </Text>
                <MaterialCommunityIcons name="arrow-right" size={20} color="white" />
            </TouchableOpacity>
        </View>
    );
};
