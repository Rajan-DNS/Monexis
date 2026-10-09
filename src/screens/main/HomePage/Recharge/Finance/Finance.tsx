import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../../../../navigation/RootNavigator';
import CustomIcon from '../../../../../components/CostomIcon/Icon';
import { Colors } from '../../../../../theme';

interface SectionHeaderProps {
    title: string;
}

const SectionHeader: React.FC<SectionHeaderProps> = ({ title }) => (
    <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>{title}</Text>
        <TouchableOpacity>
            <Text style={styles.viewAll}>View All</Text>
        </TouchableOpacity>
    </View>
);

const Finance: React.FC = () => {
    const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();

    return (
        <View style={styles.container}>
          <View style={styles.header}>
                <Text style={styles.title}> Insurance </Text>
            </View>

            <View style={styles.gridContainer}>
                <CustomIcon
                    name="cellphone-nfc"
                    title="Company Banck"
                    color="#747675"
                    bgColor="#fffaf0"
                    borderColor="#f5e0d0"
                    onPress={onDmtPress || (() => navigation.navigate(''))}
                />
                <CustomIcon
                    name="account-cash-plus"
                    title="ADD TOPUP"
                    color={Colors.primary}
                    bgColor={Colors.bgSecondaryBtn}
                    borderColor={Colors.primaryLight}
                    onPress={(() => setIsModalVisible(true))}
                />
                <CustomIcon
                    name="account-cash"
                    title="TOPUP List"
                    color="#12cb5f"
                    bgColor="#f0fff6"
                    borderColor="#d0ffdd"
                    onPress={(() => navigation.navigate('TopUpList'))}
                />
                <CustomIcon
                    name="fingerprint"
                    title="AEPS"
                    color="#d9258e"
                    bgColor="#fff0f9"
                    borderColor="#FFD0D0"
                />
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        // marginBottom: 8,
    },
    sectionHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 16,
        paddingHorizontal: 5
    },
    sectionTitle: {
        fontSize: 16,
        // fontFamily: Poppins.bold,
        fontWeight: 'bold',
        color: Colors.textDark,
    },
    viewAll: {
        color: Colors.primary,
        fontWeight: '600',
        fontSize: 16,
        // fontFamily: Poppins.semiBold,
    },
    gridContainer: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        justifyContent: 'space-between',
        alignItems: 'center',

        backgroundColor: Colors.white,
        borderRadius: 24,
        padding: 10,
        marginBottom: 16,

        borderWidth: 1,
        borderColor: Colors.borderLight,

        // iOS Shadow
        shadowColor: Colors.shadow,
        shadowOffset: {
            width: 0,
            height: 2,
        },
        shadowOpacity: 0.25,
        shadowRadius: 1,

        // Android Shadow
        elevation: 2,
    },
});


export default Finance;
