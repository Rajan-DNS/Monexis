import React from "react";
import { ScrollView, StyleSheet, TouchableOpacity, View, Text } from "react-native";
import MaterialIcons from "react-native-vector-icons/MaterialIcons";
import { Poppins } from "../../../../theme/typography";

interface DropdownFieldProps {
  dropdownKey: string;
  label: string;
  placeholder: string;
  options: Array<{ value: any; text: string }>;
  selectedValue: any;
  activeDropdown: string | null;
  setActiveDropdown: (key: string | null) => void;
  onSelect: (key: string, value: any) => void;
}

const FilterDropdownField: React.FC<DropdownFieldProps> = ({
  dropdownKey,
  label,
  placeholder,
  options,
  selectedValue,
  activeDropdown,
  setActiveDropdown,
  onSelect,
}) => {
  const selectedOption = options.find(o => o.value === selectedValue);
  const isOpen = activeDropdown === dropdownKey;

  return (
    <View style={styles.filterFieldBox}>
      <Text style={styles.fieldLabel}>{label}</Text>
      <TouchableOpacity
        style={styles.dropdownTrigger}
        onPress={() => setActiveDropdown(isOpen ? null : dropdownKey)}
      >
        <Text
          style={[
            styles.dropdownTriggerText,
            !selectedOption ? { color: '#94A3B8' } : null
          ]}
          numberOfLines={1}
        >
          {selectedOption ? selectedOption.text : placeholder}
        </Text>
        <MaterialIcons name={isOpen ? "arrow-drop-up" : "arrow-drop-down"} size={24} color="#64748B" />
      </TouchableOpacity>

      {isOpen && (
        <View style={styles.dropdownContainer}>
          <ScrollView nestedScrollEnabled style={{ maxHeight: 150 }}>
            {options.map((opt) => (
              <TouchableOpacity
                key={opt.value}
                style={[styles.dropdownItem, selectedValue === opt.value && styles.dropdownItemActive]}
                onPress={() => {
                  onSelect(dropdownKey, opt.value);
                  setActiveDropdown(null);
                }}
              >
                <Text style={[styles.dropdownItemText, selectedValue === opt.value && styles.dropdownItemTextActive]}>
                  {opt.text}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>
      )}
    </View>
  );
};

export default FilterDropdownField;

const styles = StyleSheet.create({
  filterFieldBox: {
    width: '48%',
    marginBottom: 14,
    position: 'relative',
  },
  fieldLabel: {
    fontSize: 12,
    fontFamily: Poppins.semiBold,
    fontWeight: '600',
    color: '#64748B',
    marginBottom: 6,
  },
  dropdownTrigger: {
    height: 40,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 8,
    paddingHorizontal: 10,
    backgroundColor: '#F8FAFC',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  dropdownTriggerText: {
    fontSize: 12,
    fontFamily: Poppins.regular,
    color: '#1E293B',
    flex: 1,
  },
  dropdownContainer: {
    position: 'absolute',
    top: 64,
    left: 0,
    right: 0,
    backgroundColor: '#FFF',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 8,
    zIndex: 99,
    maxHeight: 150,
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 5,
  },
  dropdownItem: {
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  dropdownItemActive: {
    backgroundColor: '#EFF6FF',
  },
  dropdownItemText: {
    fontSize: 12,
    fontFamily: Poppins.regular,
    color: '#475569',
  },
  dropdownItemTextActive: {
    color: '#2563EB',
    fontWeight: '600',
  },
});