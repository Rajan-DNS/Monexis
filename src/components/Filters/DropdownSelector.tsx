import React, { useMemo } from "react";
import { LayoutAnimation, FlatList, StyleSheet, TextInput, TouchableOpacity, View, Text } from "react-native";
import MaterialCommunityIcons from "react-native-vector-icons/MaterialCommunityIcons";
import { Colors } from "../../theme";
import { Poppins } from "../../theme/typography";

export const DropdownSelector = ({
  label,
  value,
  options,
  onSelect,
  dropdownId,
  placeholder,
  activeDropdown,
  setActiveDropdown,
  dropdownSearch,
  setDropdownSearch,
  displayText,
}: any) => {
  const isExpanded = activeDropdown === dropdownId;
  // Use displayText if provided (e.g. from form state), otherwise look up from options
  const selectedText = displayText || options.find((opt: any) => String(opt.value) === String(value))?.text || placeholder;

  const filteredOptions = useMemo(() => {
    if (!isExpanded || !dropdownSearch.trim()) return options;
    return options.filter((opt: any) =>
      opt.text?.toLowerCase().includes(dropdownSearch.toLowerCase())
    );
  }, [options, dropdownSearch, isExpanded]);

  const toggleDropdown = () => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    if (isExpanded) {
      setActiveDropdown(null);
      setDropdownSearch('');
    } else {
      setActiveDropdown(dropdownId);
      setDropdownSearch('');
    }
  };

  return (
    <View style={styles.filterInputGroup}>
      <Text style={styles.filterLabel}>{label}</Text>
      <TouchableOpacity
        style={[styles.filterInputWrapper, isExpanded && styles.activeDropdownBorder]}
        onPress={toggleDropdown}
        activeOpacity={0.7}
      >
        <Text style={[styles.filterInput, !value && { color: Colors.textMuted }]}>
          {selectedText}
        </Text>
        <MaterialCommunityIcons
          name={isExpanded ? "chevron-up" : "chevron-down"}
          size={20}
          color={isExpanded ? Colors.primary : Colors.textSecondary}
        />
      </TouchableOpacity>

      {isExpanded && (
        <View style={styles.inlineDropdownList}>
          <TextInput
            style={styles.dropdownSearchInput}
            placeholder="Search..."
            value={dropdownSearch}
            onChangeText={setDropdownSearch}
            placeholderTextColor={Colors.textMuted}
            autoCorrect={false}
          />
          <FlatList
            data={filteredOptions}
            keyExtractor={(item: any) => String(item.value)}
            style={{ maxHeight: 200 }}
            keyboardShouldPersistTaps="handled"
            nestedScrollEnabled
            renderItem={({ item }) => (
              <TouchableOpacity
                style={styles.inlineDropdownItem}
                onPress={() => {
                  onSelect(item.value);
                }}
              >
                <Text style={[styles.inlineDropdownText, String(item.value) === String(value) && styles.selectedDropdownText]}>
                  {item.text}
                </Text>
                {String(item.value) === String(value) && (
                  <MaterialCommunityIcons name="check" size={18} color={Colors.primary} />
                )}
              </TouchableOpacity>
            )}
            ListEmptyComponent={
              <Text style={styles.noOptionsText}>No options available</Text>
            }
          />
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  filterInputGroup: {
    marginBottom: 5,
  },
  filterLabel: {
    fontSize: 12,
    fontFamily: Poppins.semiBold,
    fontWeight: '600',
    color: Colors.textSecondary,
    marginBottom: 8,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  filterInputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#F9FAFB',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 10,
    paddingHorizontal: 12,
    height: 44,
    gap: 10,
  },
  filterInput: {
    fontSize: 16,
    fontFamily: Poppins.regular,
    color: Colors.textDark,
  },
  activeDropdownBorder: {
    borderColor: Colors.primary,
  },
  inlineDropdownList: {
    backgroundColor: '#FFFFFF',
    borderRadius: 10,
    marginTop: 5,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    padding: 5,
  },
  dropdownSearchInput: {
    height: 40,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
    paddingHorizontal: 10,
    fontSize: 16,
    fontFamily: Poppins.regular,
    color: Colors.textDark,
    marginBottom: 5,
    padding: 0,
  },
  inlineDropdownItem: {
    paddingVertical: 12,
    paddingHorizontal: 10,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: '#F9FAFB',
  },
  inlineDropdownText: {
    fontSize: 16,
    fontFamily: Poppins.regular,
    color: Colors.textDark,
  },
  selectedDropdownText: {
    color: Colors.primary,
    fontWeight: '700',
  },
  noOptionsText: {
    padding: 15,
    textAlign: 'center',
    color: Colors.textMuted,
    fontSize: 16,
    fontFamily: Poppins.regular,
  },
});