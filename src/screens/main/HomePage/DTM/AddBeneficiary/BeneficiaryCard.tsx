import React, { memo } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import Colors from '../../../../../theme/colors';
import { Poppins } from '../../../../../theme/typography';

interface BeneficiaryCardProps {
  item: any;
  isExpanded: boolean;
  colors: { bg: string; icon: string };
  onToggleExpand: (id: number) => void;
  onEdit: (item: any) => void;
  onDelete: (item: any) => void;
  maskCardNumber: (number: string) => string;
}

const BeneficiaryCard: React.FC<BeneficiaryCardProps> = ({
  item,
  isExpanded,
  colors,
  onToggleExpand,
  onEdit,
  onDelete,
  maskCardNumber,
}) => {
  return (
    <View style={styles.card}>
      <View style={styles.cardHeader}>
        <View style={styles.bankInfoRow}>
          <View style={[styles.bankIconContainer, { backgroundColor: colors.bg }]}>
            <MaterialCommunityIcons name="bank" size={24} color={colors.icon} />
          </View>
          <View style={styles.bankTextContainer}>
            <Text numberOfLines={1} ellipsizeMode="tail" style={[styles.bankName, { color: Colors.textDark }]}>
              {item.bankName || 'Unknown Bank'}
            </Text>
            <Text numberOfLines={1} ellipsizeMode="tail" style={styles.holderName}>
              {item.accountHolderName}
            </Text>
          </View>
        </View>

        <View style={styles.actionsRow}>
          <TouchableOpacity onPress={() => onEdit(item)} style={styles.actionIcon}>
            <MaterialIcons name="edit" size={20} color="#5F6368" />
          </TouchableOpacity>
          <TouchableOpacity onPress={() => onDelete(item)} style={styles.actionIcon}>
            <MaterialIcons name="delete" size={20} color="#C5221F" />
          </TouchableOpacity>
        </View>
      </View>

      {/* Date line */}
      {/* <Text style={styles.dateText}>{item.createdDate || item.date || 'N/A'}</Text> */}

      <View style={styles.divider} />

      {/* Essential Info */}
      <View style={styles.infoRow}>
        <Text style={styles.infoLabel}>Mobile Number</Text>
        <Text style={[styles.infoValue, { color: Colors.textDark }]}>{item.mobileNumber || 'N/A'}</Text>
      </View>

      <View style={styles.infoRow}>
        <Text style={styles.infoLabel}>Account Number</Text>
        <Text style={[styles.infoValue, { color: Colors.textDark }]}>
          {maskCardNumber(item.accountNumber || item.accountnumber || 'N/A')}
        </Text>
      </View>

      <View style={styles.infoRow}>
        <Text style={styles.infoLabel}>IFSC Code</Text>
        <Text style={[styles.infoValue, { color: Colors.textDark }]}>{item.ifscCode || item.ifsccode || 'N/A'}</Text>
      </View>

      {/* Extended Details */}
      {isExpanded && (
        <View style={styles.expandedContent}>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Aadhar Number</Text>
            <Text style={[styles.infoValue, { color: Colors.textDark }]}>
              {item.aadharNumber || 'N/A'}
            </Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Pan Number</Text>
            <Text style={[styles.infoValue, { color: Colors.textDark }]}>
              {item.panNumber || 'N/A'}
            </Text>
          </View>
        </View>
      )}

      {/* Expand Trigger Button */}
      <TouchableOpacity
        style={styles.expandTrigger}
        onPress={() => onToggleExpand(item.id)}
        activeOpacity={0.7}
      >
        <Text style={[styles.expandText, { color: Colors.primary }]}>
          {isExpanded ? 'View Less' : 'View More'}
        </Text>
        <MaterialIcons
          name={isExpanded ? 'keyboard-arrow-up' : 'keyboard-arrow-down'}
          size={18}
          color={Colors.primary}
        />
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: Colors.white,
    borderRadius: 24,
    borderWidth: 1.5,
    borderColor: Colors.divider,
    padding: 20,
    marginBottom: 16,
    shadowColor: Colors.shadow,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.02,
    shadowRadius: 8,
    elevation: 1,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  bankInfoRow: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    paddingRight: 10,
  },
  bankIconContainer: {
    width: 44,
    height: 44,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 14,
  },
  bankTextContainer: {
    flex: 1,
    marginRight: 10,
  },
  bankName: {
    fontSize: 16,
    fontFamily: Poppins.bold,
    fontWeight: 'bold',
  },
  holderName: {
    fontSize: 12,
    fontFamily: Poppins.bold,
    fontWeight: 'bold',
    color: Colors.textSecondary,
    marginTop: 2,
    textTransform: 'uppercase',
  },
  actionsRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  actionIcon: {
    padding: 6,
    marginLeft: 8,
  },
  dateText: {
    fontSize: 12,
    fontFamily: Poppins.bold,
    fontWeight: 'bold',
    color: '#8F9BB3',
    position: 'absolute',
    top: 20,
    right: 20,
  },
  divider: {
    height: 1,
    backgroundColor: Colors.bgInput,
    marginVertical: 14,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  infoLabel: {
    fontSize: 12,
    fontFamily: Poppins.medium,
    fontWeight: '500',
    color: '#8F9BB3',
  },
  infoValue: {
    fontSize: 12,
    fontFamily: Poppins.bold,
    fontWeight: 'bold',
  },
  expandedContent: {
    marginTop: 10,
    borderTopWidth: 1,
    borderTopColor: Colors.bgInput,
    paddingTop: 12,
  },
  expandTrigger: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 12,
    paddingTop: 8,
  },
  expandText: {
    fontSize: 12,
    fontFamily: Poppins.bold,
    fontWeight: 'bold',
    marginRight: 4,
  },
});

// Memoize the component to prevent unnecessary re-renders
export default memo(BeneficiaryCard, (prevProps, nextProps) => {
  return (
    prevProps.item.id === nextProps.item.id &&
    prevProps.isExpanded === nextProps.isExpanded &&
    prevProps.colors.bg === nextProps.colors.bg &&
    prevProps.colors.icon === nextProps.colors.icon
  );
});
