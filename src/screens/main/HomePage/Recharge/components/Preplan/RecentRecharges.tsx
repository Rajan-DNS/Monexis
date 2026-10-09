import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import { rechargeStyles as styles } from '../../rechargeStyles';
import { Colors } from '../../../../../../theme';

interface RecentItemProps {
    item: any;
    recentType: 'personal' | 'agent';
}

export const RecentItem: React.FC<RecentItemProps> = ({ item, recentType }) => (
    <View style={styles.recentItem}>
        <View style={styles.avatar}>
            <Text style={styles.avatarText}>{item.initials}</Text>
        </View>
        <View style={styles.recentInfo}>
            <Text style={styles.recentName}>{item.name}</Text>
            <Text style={styles.recentPhone}>{item.phone}</Text>
            {recentType === 'agent' && (
                <View style={styles.agentBadge}>
                    <Text style={styles.agentBadgeText}>Agent Comm: ₹5.00</Text>
                </View>
            )}
        </View>
        <TouchableOpacity style={styles.repeatBtn}>
            <MaterialCommunityIcons name="reload" size={20} color={Colors.primary} />
        </TouchableOpacity>
    </View>
);

interface RecentRechargesProps {
    data: any[];
    showAll: boolean;
    onToggleShowAll: () => void;
    recentType: 'personal' | 'agent';
    onTypeChange: (type: 'personal' | 'agent') => void;
}

export const RecentRecharges: React.FC<RecentRechargesProps> = ({
    data,
    showAll,
    onToggleShowAll,
    recentType,
    onTypeChange
}) => {
    return (
        <View>
            <View style={styles.sectionHeader}>
                {/* <View>
                    <Text style={styles.sectionTitle}>Recent Recharges</Text>
                    <View style={styles.miniTabContainer}>
                        <TouchableOpacity
                            onPress={() => onTypeChange('personal')}
                            style={[styles.miniTab, recentType === 'personal' && styles.activeMiniTab]}
                        >
                            <Text style={[styles.miniTabText, recentType === 'personal' && styles.activeMiniTabText]}>Personal</Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                            onPress={() => onTypeChange('agent')}
                            style={[styles.miniTab, recentType === 'agent' && styles.activeMiniTab]}
                        >
                            <Text style={[styles.miniTabText, recentType === 'agent' && styles.activeMiniTabText]}>Agent</Text>
                        </TouchableOpacity>
                    </View>
                </View> */}
                {/* <TouchableOpacity onPress={onToggleShowAll}>
                    <Text style={styles.viewAll}>{showAll ? 'SHOW LESS' : 'VIEW ALL'}</Text>
                </TouchableOpacity> */}
            </View>

            <View style={styles.recentList}>
                {(showAll ? data : data.slice(0, 2)).map((item) => (
                    <RecentItem key={item.id} item={item} recentType={recentType} />
                ))}
            </View>
        </View>
    );
};
