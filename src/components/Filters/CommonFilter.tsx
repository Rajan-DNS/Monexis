import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  Modal,
  ScrollView,
  Dimensions,
} from 'react-native';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import Colors from '../../theme/colors';
import { Poppins } from '../../theme/typography';

const { height } = Dimensions.get('window');

export interface FilterField {
  key: string;
  label: string;
  type: 'text' | 'dropdown' | 'date';
  placeholder?: string;
  options?: Array<{ value: any; text: string }>;
  keyboardType?: 'default' | 'numeric' | 'email-address' | 'phone-pad';
}

interface CommonFilterProps {
  isVisible: boolean;
  onClose: () => void;
  onApply: (filters: Record<string, any>) => void;
  onClear: () => void;
  fields: FilterField[];
  initialValues?: Record<string, any>;
}

const CommonFilter: React.FC<CommonFilterProps> = ({
  isVisible,
  onClose,
  onApply,
  onClear,
  fields,
  initialValues = {},
}) => {
  const [filterValues, setFilterValues] = useState<Record<string, any>>(initialValues);
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null);

  const handleInputChange = (key: string, value: any) => {
    setFilterValues((prev) => ({
      ...prev,
      [key]: value,
    }));
  };

  const handleDropdownSelect = (key: string, option: { value: any; text: string }) => {
    setFilterValues((prev) => ({
      ...prev,
      [key]: option.value,
      [`${key}_text`]: option.text,
    }));
    setActiveDropdown(null);
  };

  const handleApply = () => {
    onApply(filterValues);
    onClose();
  };

  const handleClear = () => {
    setFilterValues({});
    onClear();
  };

  const renderField = (field: FilterField) => {
    const value = filterValues[field.key];
    const displayText = filterValues[`${field.key}_text`] || '';

    switch (field.type) {
      case 'text':
        return (
          <View key={field.key} style={styles.filterGroup}>
            <Text style={styles.filterLabel}>{field.label}</Text>
            <TextInput
              style={styles.filterInput}
              placeholder={field.placeholder || `Enter ${field.label}`}
              placeholderTextColor="#8F9BB3"
              value={value || ''}
              onChangeText={(text) => handleInputChange(field.key, text)}
              keyboardType={field.keyboardType || 'default'}
            />
          </View>
        );

      case 'dropdown':
        return (
          <View key={field.key} style={styles.filterGroup}>
            <Text style={styles.filterLabel}>{field.label}</Text>
            <TouchableOpacity
              style={styles.dropdownTrigger}
              onPress={() => setActiveDropdown(field.key)}
            >
              <Text
                style={displayText ? styles.dropdownText : styles.dropdownPlaceholder}
                numberOfLines={1}
              >
                {displayText || field.placeholder || `Select ${field.label}`}
              </Text>
              <MaterialIcons name="keyboard-arrow-down" size={24} color="#8F9BB3" />
            </TouchableOpacity>
          </View>
        );

      case 'date':
        return (
          <View key={field.key} style={styles.filterGroup}>
            <Text style={styles.filterLabel}>{field.label}</Text>
            <TextInput
              style={styles.filterInput}
              placeholder={field.placeholder || 'YYYY-MM-DD'}
              placeholderTextColor="#8F9BB3"
              value={value || ''}
              onChangeText={(text) => handleInputChange(field.key, text)}
            />
          </View>
        );

      default:
        return null;
    }
  };

  return (
    <>
      <Modal visible={isVisible} transparent animationType="slide">
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            {/* Header */}
            <View style={styles.header}>
              <Text style={styles.headerTitle}>Filter Options</Text>
              <TouchableOpacity onPress={onClose}>
                <MaterialIcons name="close" size={24} color="#1E293B" />
              </TouchableOpacity>
            </View>

            {/* Filter Fields */}
            <ScrollView
              showsVerticalScrollIndicator={false}
              contentContainerStyle={styles.scrollContent}
            >
              {fields.map((field) => renderField(field))}
            </ScrollView>

            {/* Action Buttons */}
            <View style={styles.actionButtons}>
              <TouchableOpacity
                style={styles.clearButton}
                onPress={handleClear}
                activeOpacity={0.8}
              >
                <Text style={styles.clearButtonText}>Clear All</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.applyButton}
                onPress={handleApply}
                activeOpacity={0.8}
              >
                <MaterialIcons name="search" size={20} color="#FFF" style={{ marginRight: 8 }} />
                <Text style={styles.applyButtonText}>Apply Filters</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Dropdown Modal */}
      {activeDropdown && (
        <Modal visible={true} transparent animationType="fade">
          <TouchableOpacity
            style={styles.dropdownOverlay}
            activeOpacity={1}
            onPress={() => setActiveDropdown(null)}
          >
            <View style={styles.dropdownModal}>
              <View style={styles.dropdownHeader}>
                <Text style={styles.dropdownTitle}>
                  Select {fields.find((f) => f.key === activeDropdown)?.label}
                </Text>
                <TouchableOpacity onPress={() => setActiveDropdown(null)}>
                  <MaterialIcons name="close" size={24} color="#1E293B" />
                </TouchableOpacity>
              </View>

              <ScrollView showsVerticalScrollIndicator={false}>
                {fields
                  .find((f) => f.key === activeDropdown)
                  ?.options?.map((option, index) => (
                    <TouchableOpacity
                      key={index}
                      style={styles.dropdownItem}
                      onPress={() => handleDropdownSelect(activeDropdown, option)}
                    >
                      <Text style={styles.dropdownItemText}>{option.text}</Text>
                      {filterValues[activeDropdown] === option.value && (
                        <MaterialCommunityIcons name="check" size={20} color={Colors.primary} />
                      )}
                    </TouchableOpacity>
                  ))}
              </ScrollView>
            </View>
          </TouchableOpacity>
        </Modal>
      )}
    </>
  );
};

const styles = StyleSheet.create({
  modalContainer: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#FFF',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    maxHeight: height * 0.85,
    paddingTop: 20,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  headerTitle: {
    fontSize: 20,
    fontFamily: Poppins.bold,
    color: '#1E293B',
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  filterGroup: {
    marginBottom: 16,
  },
  filterLabel: {
    fontSize: 12,
    fontFamily: Poppins.bold,
    color: '#64748B',
    marginBottom: 8,
    textTransform: 'uppercase',
  },
  filterInput: {
    height: 50,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 12,
    paddingHorizontal: 16,
    fontSize: 16,
    fontFamily: Poppins.regular,
    color: '#1E293B',
    backgroundColor: '#FAFAFA',
  },
  dropdownTrigger: {
    height: 50,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 12,
    paddingHorizontal: 16,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#FAFAFA',
  },
  dropdownText: {
    fontSize: 16,
    fontFamily: Poppins.semiBold,
    color: '#1E293B',
    flex: 1,
  },
  dropdownPlaceholder: {
    fontSize: 16,
    fontFamily: Poppins.regular,
    color: '#8F9BB3',
    flex: 1,
  },
  actionButtons: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    paddingVertical: 20,
    gap: 12,
    borderTopWidth: 1,
    borderTopColor: '#E2E8F0',
  },
  clearButton: {
    flex: 1,
    height: 50,
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: '#E2E8F0',
    justifyContent: 'center',
    alignItems: 'center',
  },
  clearButtonText: {
    fontSize: 16,
    fontFamily: Poppins.bold,
    color: '#64748B',
  },
  applyButton: {
    flex: 1,
    height: 50,
    borderRadius: 12,
    backgroundColor: Colors.primary,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  applyButtonText: {
    fontSize: 16,
    fontFamily: Poppins.bold,
    color: '#FFF',
  },
  dropdownOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    padding: 20,
  },
  dropdownModal: {
    backgroundColor: '#FFF',
    borderRadius: 20,
    maxHeight: height * 0.6,
    overflow: 'hidden',
  },
  dropdownHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
  },
  dropdownTitle: {
    fontSize: 16,
    fontFamily: Poppins.bold,
    color: '#1E293B',
  },
  dropdownItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 16,
    paddingHorizontal: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  dropdownItemText: {
    fontSize: 16,
    fontFamily: Poppins.medium,
    color: '#1E293B',
    flex: 1,
  },
});

export default CommonFilter;
