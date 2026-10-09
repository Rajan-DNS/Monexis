import React from 'react';
import {
  Modal,
  StyleSheet,
  Text,
  TouchableOpacity,
  TouchableWithoutFeedback,
  View,
} from 'react-native';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import Colors from '../theme/colors';
import { Poppins } from '../theme/typography';

type BillInfoModalProps = {
  visible: boolean;
  data?: any;
  onClose: () => void;
  onProceed?: () => void;
};

const BillInfoModal: React.FC<BillInfoModalProps> = ({ visible, data, onClose, onProceed }) => {
  const rows = [
    { label: 'Bill Number', value: data?.billNumber },
    { label: 'Customer Name', value: data?.customerName },
    { label: 'Due Amount', value: data?.dueAmount ? `₹ ${data.dueAmount}` : '' },
    { label: 'Due Date', value: data?.dueDate },
    { label: 'Bill Period', value: data?.billPeriod },
    { label: 'Bill Date', value: data?.billDate || 'N/A' },
  ];

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <TouchableWithoutFeedback onPress={onClose}>
        <View style={styles.overlay}>
          <TouchableWithoutFeedback>
            <View style={styles.card}>
              <View style={styles.header}>
                <View style={styles.iconWrap}>
                  <MaterialCommunityIcons name="receipt-text-check-outline" size={26} color={Colors.primary} />
                </View>
                <TouchableOpacity onPress={onClose} style={styles.closeButton}>
                  <MaterialCommunityIcons name="close" size={22} color={Colors.textSecondary} />
                </TouchableOpacity>
              </View>

              <Text style={styles.title}>Bill Info</Text>
              <Text style={styles.subtitle}>Bill details fetched successfully</Text>

              <View style={styles.amountBox}>
                <Text style={styles.amountLabel}>Due Amount</Text>
                <Text style={styles.amountValue}>₹ {data?.dueAmount || '0'}</Text>
              </View>

              <View style={styles.detailBox}>
                {rows.map((row, index) => (
                  <View key={row.label} style={[styles.row, index === rows.length - 1 && styles.lastRow]}>
                    <Text style={styles.rowLabel}>{row.label}</Text>
                    <Text style={styles.rowValue}>{row.value || 'N/A'}</Text>
                  </View>
                ))}
              </View>

              <View style={styles.actions}>
                <TouchableOpacity style={styles.secondaryButton} onPress={onClose} activeOpacity={0.85}>
                  <Text style={styles.secondaryText}>Close</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.primaryButton}
                  onPress={onProceed || onClose}
                  activeOpacity={0.85}
                >
                  <Text style={styles.primaryText}>Proceed</Text>
                  <MaterialCommunityIcons name="arrow-right" size={18} color={Colors.white} />
                </TouchableOpacity>
              </View>
            </View>
          </TouchableWithoutFeedback>
        </View>
      </TouchableWithoutFeedback>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(15, 23, 42, 0.48)',
    justifyContent: 'center',
    padding: 20,
  },
  card: {
    backgroundColor: Colors.white,
    borderRadius: 18,
    padding: 18,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  iconWrap: {
    width: 50,
    height: 50,
    borderRadius: 14,
    backgroundColor: Colors.bgLightest,
    justifyContent: 'center',
    alignItems: 'center',
  },
  closeButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F8FAFC',
  },
  title: {
    fontSize: 20,
    color: Colors.textDark,
    fontFamily: Poppins.bold,
    marginTop: 14,
  },
  subtitle: {
    fontSize: 13,
    color: Colors.textSecondary,
    fontFamily: Poppins.regular,
    marginTop: 3,
  },
  amountBox: {
    backgroundColor: Colors.bgLightest,
    borderRadius: 14,
    padding: 16,
    marginTop: 16,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  amountLabel: {
    fontSize: 12,
    color: Colors.textSecondary,
    fontFamily: Poppins.medium,
  },
  amountValue: {
    fontSize: 28,
    color: Colors.primary,
    fontFamily: Poppins.bold,
    marginTop: 3,
  },
  detailBox: {
    borderWidth: 1,
    borderColor: '#EEF2F7',
    borderRadius: 14,
    marginTop: 14,
    overflow: 'hidden',
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 12,
    paddingVertical: 12,
    paddingHorizontal: 14,
    borderBottomWidth: 1,
    borderBottomColor: '#EEF2F7',
  },
  lastRow: {
    borderBottomWidth: 0,
  },
  rowLabel: {
    flex: 1,
    fontSize: 12,
    color: Colors.textSecondary,
    fontFamily: Poppins.medium,
  },
  rowValue: {
    flex: 1.3,
    fontSize: 13,
    color: Colors.textDark,
    fontFamily: Poppins.semiBold,
    textAlign: 'right',
  },
  actions: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 18,
  },
  secondaryButton: {
    flex: 1,
    height: 48,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  secondaryText: {
    fontSize: 14,
    color: Colors.textDark,
    fontFamily: Poppins.semiBold,
  },
  primaryButton: {
    flex: 1,
    height: 48,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    gap: 8,
    backgroundColor: Colors.primary,
  },
  primaryText: {
    fontSize: 14,
    color: Colors.white,
    fontFamily: Poppins.semiBold,
  },
});

export default BillInfoModal;
