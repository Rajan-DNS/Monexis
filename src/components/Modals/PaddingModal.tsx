import React from 'react';
import {
    StyleSheet,
    Modal,
    View,
    Text,
    TouchableOpacity
} from 'react-native';
import { useNavigation } from '@react-navigation/native'; // Fix 1: Added missing hook import
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import { Poppins } from '../../theme/typography';
import { Dimensions } from '../../theme/spacing';

const Colors = {
    primary: '#2563EB',
    bgSecondaryBox: '#F1F5F9',
};

interface PenddingModalProps {
    visible: boolean;
    onClose: () => void;
    transactionData?: {
        amount?: string | number;
        transferType?: string;
        error?: string;
        utrNumber?: string;
        txnId?: string;
        beneficiary?: {
            accountHolderName?: string;
        };
        date?: any;
    };
    amount?: string | number;
    transferType?: string;
    selectedBeneficiary?: {
        accountHolderName?: string;
    };
    formatDate: (date: any) => string;

}

const PenddingModal = ({
    visible,
    onClose,
    transactionData,
    amount,
    transferType,
    selectedBeneficiary,
    formatDate
}: PenddingModalProps) => {
    const navigation = useNavigation<any>();

    return (
        <Modal visible={visible} transparent animationType="fade">
            <View style={styles.modalOverlay}>
                <View style={styles.modalContainer}>
                    <View style={[styles.modalIcon, { backgroundColor: '#FEE2E2' }]}>
                        <MaterialCommunityIcons name="alert-circle" size={40} color="#EF4444" />
                    </View>
                    <Text style={styles.modalTitle}>Transaction Failed</Text>
                    <Text style={styles.modalSubtitle}>
                        {transactionData?.error || 'Transaction could not be completed. Please try again.'}
                    </Text>

                    <View style={styles.receiptBox}>
                        <View style={styles.receiptRow}>
                            <Text style={styles.receiptLabel}>Amount</Text>
                            <Text style={styles.receiptValue}>₹{transactionData?.amount || amount || '0.00'}</Text>
                        </View>
                        <View style={styles.receiptRow}>
                            <Text style={styles.receiptLabel}>Transfer Type</Text>
                            <Text style={styles.receiptValue}>{transactionData?.transferType || transferType || 'N/A'}</Text>
                        </View>
                        {/* utrNumber */}
                        <View style={styles.receiptRow}>
                            <Text style={styles.receiptLabel}>UTR Number</Text>
                            <Text style={styles.receiptValue}>
                                {transactionData?.utrNumber || 'N/A'}
                            </Text>
                        </View>
                        <View style={styles.receiptRow}>
                            <Text style={styles.receiptLabel}>Transaction ID</Text>
                            <Text style={styles.receiptValue}>
                                {transactionData?.txnId || 'N/A'}
                            </Text>
                        </View>
                        {/* <View style={styles.receiptRow}>
              <Text style={styles.receiptLabel}>Beneficiary</Text>
              <Text style={styles.receiptValue}>
                {transactionData?.beneficiary?.accountHolderName || selectedBeneficiary?.accountHolderName || 'N/A'}
              </Text>
            </View> */}

                    </View>

                    <TouchableOpacity style={[styles.primaryModalButton, { backgroundColor: '#B91C1C' }]} onPress={onClose}>
                        <MaterialCommunityIcons name="refresh" size={20} color="#FFF" style={{ marginRight: 8 }} />
                        <Text style={styles.primaryModalButtonText}>Retry</Text>
                    </TouchableOpacity>

                    <TouchableOpacity style={styles.secondaryModalButton} onPress={onClose}>
                        <Text style={styles.secondaryModalButtonText}>Close</Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                        style={{ marginTop: 16 }}
                        activeOpacity={0.7}
                        onPress={() => {
                            onClose();
                            navigation.navigate('ContactUs');
                        }}
                    >
                        <Text style={styles.contactSupportText}>Contact Support</Text>
                    </TouchableOpacity>
                </View>
            </View>
        </Modal>
    );
};

const styles = StyleSheet.create({
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(15, 23, 42, 0.6)',
        justifyContent: 'center',
        padding: 24,
    },
    modalContainer: {
        backgroundColor: '#FFF',
        borderRadius: 24,
        padding: 24,
        alignItems: 'center',
    },
    modalIcon: {
        width: 80,
        height: 80,
        borderRadius: 40,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 20,
    },
    modalTitle: {
        fontSize: 20,
        fontFamily: Poppins.bold,
        fontWeight: '700',
        color: '#1E293B',
        marginBottom: 8,
    },
    modalSubtitle: {
        fontSize: 16,
        fontFamily: Poppins.regular,
        color: '#64748B',
        textAlign: 'center',
        marginBottom: 20,
    },
    receiptBox: {
        width: '100%',
        backgroundColor: Colors.bgSecondaryBox || '#F1F5F9',
        borderRadius: 16,
        padding: 16,
        marginBottom: 24,
    },
    receiptRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 12,
    },
    receiptLabel: {
        fontSize: 12,
        fontFamily: Poppins.regular,
        color: '#64748B',
    },
    receiptValue: {
        fontSize: 12,
        fontFamily: Poppins.bold,
        fontWeight: '700',
        color: '#1E293B',
    },
    primaryModalButton: {
        flexDirection: 'row',
        width: '100%',
        height: Dimensions.buttonHeight,
        borderRadius: 12,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 12,
    },
    primaryModalButtonText: {
        color: '#FFF',
        fontSize: 16,
        fontFamily: Poppins.bold,
        fontWeight: '700',
    },
    secondaryModalButton: {
        width: '100%',
        height: Dimensions.buttonHeight,
        borderRadius: 12,
        borderWidth: 1,
        borderColor: '#E2E8F0',
        justifyContent: 'center',
        alignItems: 'center',
    },
    secondaryModalButtonText: {
        color: '#64748B',
        fontSize: 16,
        fontFamily: Poppins.semiBold,
        fontWeight: '600',
    },
    contactSupportText: {
        color: '#2563EB',
        fontSize: 16,
        fontFamily: Poppins.semiBold,
        fontWeight: '600',
    },
});

export default PenddingModal;