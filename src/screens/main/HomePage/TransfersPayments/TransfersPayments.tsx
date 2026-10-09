import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../../../navigation/RootNavigator';
import CustomIcon from '../../../../components/CostomIcon/Icon';
import { Colors, Spacing } from '../../../../theme';
import { Poppins } from '../../../../theme/typography';
import AddTopUpModal from '../../../Destributor/mainScreen/HomePage/Top-up-service/AddTopUpModal';
import { useAppSelector } from '../../../../redux/hooks';
import { selectCurrentUser } from '../../../../redux/slices/authSlice';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface PaymentItemProps {
    title: string;
    subtitle: string;
    iconName: string;
    iconColor: string;
    bgColor: string;
    borderColor: string;
    isLast?: boolean;
    onPress?: () => void;
}

const PaymentItem: React.FC<PaymentItemProps> = ({
    title,
    subtitle,
    iconName,
    iconColor,
    bgColor,
    borderColor,
    isLast,
    onPress,
}) => (
    <View>
        <TouchableOpacity
            style={styles.itemRow}
            onPress={onPress}
            activeOpacity={0.6}
        >
            <View style={[styles.iconContainer, { backgroundColor: bgColor, borderColor: borderColor }]}>
                <MaterialCommunityIcons name={iconName} size={28} color={iconColor} />
            </View>

            <View style={styles.textContainer}>
                <Text style={styles.itemTitle}>{title}</Text>
                <Text style={styles.itemSubtitle}>{subtitle}</Text>
            </View>

            <MaterialIcons name="chevron-right" size={24} color="#C7C7CC" />
        </TouchableOpacity>

        {!isLast && <View style={styles.divider} />}
    </View>
);

interface TransfersPaymentsProps {
    onDmtPress?: () => void;
}

const TransfersPayments: React.FC<TransfersPaymentsProps> = ({ onDmtPress }) => {
    const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
    const [isModalVisible, setIsModalVisible] = useState(false);
    const token = useAppSelector((state: any) => state.auth);
    console.log("-------->", token)

    const [userData, setUserData] = useState<any>(null);

    useEffect(() => {
        const fetchUserData = async () => {
            try {
                const storedData = await AsyncStorage.getItem('userData');
                if (storedData) {
                    setUserData(JSON.parse(storedData));
                }
            } catch (error) {
                console.log('Error fetching user data', error);
            }
        };
        fetchUserData();
    }, []);

    return (

        <View style={styles.container}>
            <View style={styles.header}>
                <Text style={styles.title}>Money Transfers</Text>
                <TouchableOpacity>
                    <Text style={styles.viewAll}>View All</Text>
                </TouchableOpacity>
            </View>

            <View style={styles.gridContainer}>
                <CustomIcon
                    name="bank-transfer"
                    title="DMT"
                    color="#747675"
                    bgColor="#fffaf0"
                    borderColor="#f5e0d0"
                    onPress={onDmtPress || (() => navigation.navigate('Dtm_services'))}
                />
                <CustomIcon
                    name="qrcode-scan"
                    title="Scan & Pay"
                    color={Colors.primary}
                    bgColor={Colors.bgSecondaryBtn}
                    borderColor={Colors.primaryLight}
                    onPress={(() => navigation.navigate('ScanPayConfirmScreen'))}
                />
                <CustomIcon
                    name="credit-card-minus-outline"
                    title="Card to Cash"
                    color="#12cb5f"
                    bgColor="#f0fff6"
                    borderColor="#d0ffdd"
                    onPress={(() => navigation.navigate('CardToCashConfirmScreen'))}
                />
                <CustomIcon
                    name="fingerprint"
                    title="AEPS"
                    color="#d9258e"
                    bgColor="#fff0f9"
                    borderColor="#FFD0D0"
                />
            </View>
            {userData?.parentId === 1 && (
                <>
                    <View style={styles.header}>
                        <Text style={styles.title}>Finance</Text>
                    </View>

                    <View style={styles.gridContainer}>
                        <CustomIcon
                            name="bank-outline"
                            title="Company Bank"
                            color="#2563EB"
                            bgColor="#EFF6FF"
                            borderColor="#BFDBFE"
                            onPress={() => navigation.navigate('CompanyBankList' as any)}
                        />
                        <CustomIcon
                            name="cash-plus"
                            title="Add Top-up"
                            color="#16A34A"
                            bgColor="#F0FDF4"
                            borderColor="#BBF7D0"
                            onPress={(() => setIsModalVisible(true))}
                        />
                        <CustomIcon
                            name="clipboard-list-outline"
                            title="Top-up List"
                            color="#F77F00"
                            bgColor="#FFF7ED"
                            borderColor="#FED7AA"
                            onPress={(() => navigation.navigate('TopUpList'))}
                        />

                    </View>
                </>
            )}
            <View style={styles.container}>
                <View style={styles.header}>
                    <Text style={styles.title}>Reports</Text> {/* Fixed typo "Reporta" */}
                    <TouchableOpacity>
                        <Text style={styles.viewAll}>View All</Text>
                    </TouchableOpacity>
                </View>
                <View style={styles.gridContainer}>
                    <CustomIcon
                        name="bank-transfer"
                        title="Commission Report"
                        color={Colors.primaryDark}
                        bgColor={Colors.bgSecondaryBtn}
                        borderColor={Colors.primaryLight}
                        onPress={() => navigation.navigate('CommissionReport')}
                    />
                    <CustomIcon
                        name="chart-bell-curve-cumulative"
                        title="Commission Range"
                        color="#F77F00"
                        bgColor="#fffaf0"
                        borderColor="#f5e0d0"
                        onPress={() => navigation.navigate('CommissionRange')}
                    />
                    <CustomIcon
                        name="account-group-outline"
                        title="Referral Report"
                        color="#59B292"
                        bgColor="#f0fff1ff"
                        borderColor="#d0f5d9ff"
                        onPress={(() => navigation.navigate('ReferralReport'))}

                    />
                    <CustomIcon
                        name="cash-refund"
                        title="Cash back Report"
                        color='#F77F00'
                        bgColor="#fffaf0"
                        borderColor="#f5e0d0"
                        onPress={(() => navigation.navigate('CashBackReport'))}

                    />

                    <CustomIcon
                        name="link-variant"
                        title="Referral Link Report"
                        color='#9B0F06'
                        bgColor="#fff2f0ff"
                        borderColor="#ffd1cdff"
                        onPress={(() => navigation.navigate('ReferralLinkReport'))}
                    />
                </View>
                {/* <View style={styles.cardWrapper}>
                    <PaymentItem
                        title="Commission Report"
                        subtitle="commission details and history"
                        iconName="percent-outline"
                        iconColor="#5F6368"
                        bgColor="#F1F3F4"
                        borderColor="#DADCE0"
                        onPress={onDmtPress || (() => navigation.navigate('Dtm_services'))}
                    />

                    <PaymentItem
                        title="Cash back Report"
                        subtitle="cash back details and history"
                        iconName="cash-refund"
                        iconColor="#1A73E8"
                        bgColor="#E8F0FE"
                        borderColor="#D2E3FC"
                    />

                    <PaymentItem
                        title="Referral Report"
                        subtitle="referral details and history"
                        iconName="account-group-outline"
                        iconColor="#1A73E8"
                        bgColor="#E8F0FE"
                        borderColor="#D2E3FC"
                    />

                    <PaymentItem
                        title="Referral Link Report"
                        subtitle="referral link details and history"
                        iconName="link-variant"
                        iconColor="#1A73E8"
                        bgColor="#E8F0FE"
                        borderColor="#D2E3FC"
                        isLast={true}
                    />
                </View> */}
            </View>
            {isModalVisible && (
                <AddTopUpModal
                    isVisible={isModalVisible}
                    initialData={null}
                    onClose={() => {
                        setIsModalVisible(false);

                    }}
                />
            )}
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        marginTop: 15
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 12,
        paddingHorizontal: Spacing.sm,
    },
    title: {
        fontSize: 16,
        // fontFamily: Poppins.bold,
        fontWeight: 'bold',
        color: '#1A1D2E',
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
    viewAll: {
        fontSize: 16,
        // fontFamily: Poppins.semiBold,
        color: Colors.primary,
        fontWeight: '600',
    },
    cardWrapper: {
        backgroundColor: '#FFFFFF',
        borderRadius: 24,
        borderWidth: 1,
        borderColor: '#F0F0F0',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 0 },
        shadowOpacity: 0.05,
        shadowRadius: 10,
        elevation: 0.03,
        overflow: 'hidden',
    },
    itemRow: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 16,
    },
    iconContainer: {
        width: 52,
        height: 52,
        borderRadius: 16,
        borderWidth: 1.5,
        justifyContent: 'center',
        alignItems: 'center',
    },
    textContainer: {
        flex: 1,
        marginLeft: 16,
    },
    itemTitle: {
        fontSize: 16,
        // fontFamily: Poppins.bold,
        fontWeight: 'bold',
        // fontWeight: '700',
        color: '#202124',
    },
    itemSubtitle: {
        fontSize: 12,
        // fontFamily: Poppins.regular,
        color: '#5F6368',
        marginTop: 2,
    },
    divider: {
        height: 1,
        backgroundColor: '#F1F3F4',
        marginLeft: 84,
        marginRight: 16,
    },
});

export default TransfersPayments;
