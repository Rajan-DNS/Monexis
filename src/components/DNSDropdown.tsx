import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Modal,
  FlatList,
  TouchableWithoutFeedback,
  Image,
} from 'react-native';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import Colors from '../theme/colors';
import { Dimensions } from '../theme/spacing';

export interface DropdownOption {
  label: string;
  value: string;
  logoURL?: string;
}

interface DNSDropdownProps {
  label: string;
  value: string;
  options: (string | DropdownOption)[];
  onSelect: (item: DropdownOption) => void;
  placeholder?: string;
}

const baseUrl = 'https://webapi.monexis.store';

const DNSDropdown: React.FC<DNSDropdownProps> = ({
  label,
  value,
  options,
  onSelect,
  placeholder = 'Select option',
}) => {
  const [visible, setVisible] = useState(false);

  // Normalize array input to unified DropdownOption format
  const normalizedOptions: DropdownOption[] = options.map((opt) =>
    typeof opt === 'string'
      ? { label: opt, value: opt, logoURL: '' }
      : opt
  );

  const selectedOption = normalizedOptions.find(
    (opt) => opt.label === value || opt.value === value
  );

  return (
    <View style={styles.container}>
      <Text style={styles.label}>{label}</Text>
      <TouchableOpacity
        style={styles.dropdown}
        onPress={() => setVisible(true)}
        activeOpacity={0.7}
      >
        <View style={styles.selectedValueContainer}>
          {selectedOption?.logoURL ? (
            <Image
              source={{ uri: `${baseUrl}${selectedOption.logoURL}` }}
              style={styles.selectedLogo}
              resizeMode="contain"
            />
          ) : null}
          <Text style={[styles.value, !value && styles.placeholder]}>
            {value || placeholder}
          </Text>
        </View>
        <MaterialCommunityIcons name="chevron-down" size={24} color="#999" />
      </TouchableOpacity>

      <Modal
        visible={visible}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setVisible(false)}
      >
        <TouchableWithoutFeedback onPress={() => setVisible(false)}>
          <View style={styles.modalOverlay}>
            <TouchableWithoutFeedback>
              <View style={styles.modalContent}>
                <View style={styles.modalHeader}>
                  <Text style={styles.modalTitle}>{label}</Text>
                  <TouchableOpacity onPress={() => setVisible(false)}>
                    <MaterialCommunityIcons name="close" size={24} color="#333" />
                  </TouchableOpacity>
                </View>
                <FlatList
                  data={normalizedOptions}
                  keyExtractor={(item, index) => `${item.value}-${index}`}
                  renderItem={({ item }) => {
                    const isSelected = item.label === value || item.value === value;
                    const hasLogo = Boolean(item.logoURL && item.logoURL.trim().length > 0);

                    return (
                      <TouchableOpacity
                        style={styles.optionItem}
                        onPress={() => {
                          onSelect(item);
                          setVisible(false);
                        }}
                      >
                        <View style={styles.optionLeftContainer}>
                          <View style={styles.operatorLogoSmall}>
                            {hasLogo ? (
                              <Image
                                source={{ uri: `${baseUrl}${item.logoURL}` }}
                                style={styles.logoSmall}
                                resizeMode="contain"
                              />
                            ) : (
                              <MaterialCommunityIcons
                                name="television-classic"
                                size={18}
                                color={Colors.primary}
                              />
                            )}
                          </View>
                          <Text
                            style={[
                              styles.optionText,
                              isSelected && styles.selectedOptionText,
                            ]}
                          >
                            {item.label}
                          </Text>
                        </View>
                        {isSelected && (
                          <MaterialCommunityIcons
                            name="check"
                            size={20}
                            color={Colors.primary}
                          />
                        )}
                      </TouchableOpacity>
                    );
                  }}
                  ItemSeparatorComponent={() => <View style={styles.separator} />}
                  ListEmptyComponent={() => (
                    <View style={styles.emptyItem}>
                      <Text style={styles.emptyText}>No options found</Text>
                    </View>
                  )}
                />
              </View>
            </TouchableWithoutFeedback>
          </View>
        </TouchableWithoutFeedback>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: 20,
  },
  label: {
    fontSize: 12,
    fontWeight: '700',
    color: Colors.textDark,
    marginBottom: 8,
    letterSpacing: 0.5,
    textTransform: 'uppercase',
  },
  dropdown: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#FFF',
    borderWidth: 1.2,
    borderColor: '#E0E0E0',
    borderRadius: 14,
    paddingHorizontal: 16,
    height: Dimensions.inputHeight,
  },
  selectedValueContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  selectedLogo: {
    width: 24,
    height: 24,
    marginRight: 10,
  },
  value: {
    fontSize: 14,
    color: Colors.textDark,
  },
  placeholder: {
    color: '#999',
  },
  optionLeftContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  operatorLogoSmall: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: Colors.bgInput || '#F5F5F5',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
    borderWidth: 1,
    borderColor: Colors.divider || '#E0E0E0',
    overflow: 'hidden',
  },
  logoSmall: {
    width: '100%',
    height: '100%',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.4)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#FFF',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    maxHeight: '60%',
    paddingBottom: 40,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  modalTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: Colors.textDark,
  },
  optionItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
  },
  optionText: {
    fontSize: 14,
    fontWeight: '700',
    color: Colors.textDark,
  },
  selectedOptionText: {
    color: Colors.primary,
    fontWeight: '600',
  },
  separator: {
    height: 1,
    backgroundColor: '#F0F0F0',
    marginHorizontal: 20,
  },
  emptyItem: {
    padding: 20,
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 14,
    fontWeight: '700',
    color: Colors.textSecondary,
  },
});

export default DNSDropdown;