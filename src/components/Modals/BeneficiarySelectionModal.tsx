import React from 'react';
import {
  Modal,
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  StyleSheet
} from 'react-native';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import { Poppins } from '../../theme/typography';

// Interface definitions for strict typing
interface Beneficiary {
  id: string | number;
  bankName?: string;
  accountHolderName: string;
  accountNumber: string;
}

interface BeneficiarySelectionModalProps {
  visible: boolean;
  onClose: () => void;
  beneficiaries: Beneficiary[];
  selectedBeneficiary: Beneficiary | null;
  onSelect: (beneficiary: Beneficiary) => void;
  maskAccountNumber: (accountNumber: string) => string;
}

const BeneficiarySelectionModal = ({
  visible,
  onClose,
  beneficiaries,
  selectedBeneficiary,
  onSelect,
  maskAccountNumber
}: BeneficiarySelectionModalProps) => (
  <Modal visible={visible} transparent animationType="slide">
    <View style={styles.modalOverlayBottom}>
      <View style={styles.beneficiaryModalContainer}>
        <View style={styles.beneficiaryModalHeader}>
          <Text style={styles.beneficiaryModalTitle}>Select Beneficiary</Text>
          <TouchableOpacity onPress={onClose}>
            <MaterialIcons name="close" size={24} color="#1E293B" />
          </TouchableOpacity>
        </View>

        <ScrollView showsVerticalScrollIndicator={false}>
          {beneficiaries.length === 0 ? (
            <View style={styles.emptyBeneficiaryContainer}>
              <MaterialCommunityIcons name="account-off-outline" size={60} color="#8F9BB3" />
              <Text style={styles.emptyBeneficiaryText}>No beneficiaries found</Text>
              <Text style={styles.emptyBeneficiarySubtext}>Add a beneficiary to start transferring</Text>
            </View>
          ) : (
            beneficiaries.map((beneficiary: Beneficiary) => (
              <TouchableOpacity
                key={beneficiary.id}
                style={[
                  styles.beneficiaryItem,
                  selectedBeneficiary?.id === beneficiary.id && styles.beneficiaryItemSelected,
                ]}
                onPress={() => onSelect(beneficiary)}
                activeOpacity={0.7}
              >
                <View style={styles.beneficiaryItemIcon}>
                  <MaterialCommunityIcons name="bank" size={24} color="#1A73E8" />
                </View>
                <View style={styles.beneficiaryItemInfo}>
                  <Text style={styles.beneficiaryItemBank}>{beneficiary.bankName || 'Unknown Bank'}</Text>
                  <Text style={styles.beneficiaryItemName}>{beneficiary.accountHolderName}</Text>
                  <Text style={styles.beneficiaryItemAccount}>
                    {maskAccountNumber(beneficiary.accountNumber)}
                  </Text>
                </View>
                {selectedBeneficiary?.id === beneficiary.id && (
                  <MaterialCommunityIcons name="check-circle" size={24} color="#10B981" />
                )}
              </TouchableOpacity>
            ))
          )}
        </ScrollView>
      </View>
    </View>
  </Modal>
);

// Reusing your stylesheet setup from the parent/previous container snippet
const styles = StyleSheet.create({
  modalOverlayBottom: {
    flex: 1,
    backgroundColor: 'rgba(15, 23, 42, 0.6)',
    justifyContent: 'flex-end',
  },
  beneficiaryModalContainer: {
    backgroundColor: '#FFF',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    maxHeight: '80%',
    padding: 20,
  },
  beneficiaryModalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  beneficiaryModalTitle: {
    fontSize: 20,
    fontFamily: Poppins.bold,
    fontWeight: '700',
    color: '#1E293B',
  },
  beneficiaryItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8FAFC',
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  beneficiaryItemSelected: {
    borderColor: '#10B981',
    backgroundColor: '#ECFDF5',
  },
  beneficiaryItemIcon: {
    width: 48,
    height: 48,
    borderRadius: 12,
    backgroundColor: '#EFF6FF',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  beneficiaryItemInfo: {
    flex: 1,
  },
  beneficiaryItemBank: {
    fontSize: 16,
    fontFamily: Poppins.bold,
    fontWeight: '700',
    color: '#1E293B',
    marginBottom: 2,
  },
  beneficiaryItemName: {
    fontSize: 12,
    fontFamily: Poppins.semiBold,
    fontWeight: '600',
    color: '#64748B',
    textTransform: 'uppercase',
    marginBottom: 4,
  },
  beneficiaryItemAccount: {
    fontSize: 16,
    fontFamily: Poppins.regular,
    color: '#1E293B',
    letterSpacing: 1,
  },
  emptyBeneficiaryContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
  },
  emptyBeneficiaryText: {
    fontSize: 16,
    fontFamily: Poppins.semiBold,
    fontWeight: '600',
    color: '#1E293B',
    marginTop: 16,
  },
  emptyBeneficiarySubtext: {
    fontSize: 16,
    fontFamily: Poppins.regular,
    color: '#64748B',
    marginTop: 8,
  },
});

export default BeneficiarySelectionModal;