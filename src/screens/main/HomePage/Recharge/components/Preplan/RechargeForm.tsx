import React, { useState } from 'react';
import {
    View,
    Text,
    TouchableOpacity,
    TextInput,
    Image,
    Platform,
    PermissionsAndroid,
    Modal,
    FlatList,
    StyleSheet
} from 'react-native';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import { Controller } from 'react-hook-form';
import Contacts from 'react-native-contacts';
import { rechargeStyles as styles } from '../../rechargeStyles';
import { Colors } from '../../../../../../theme';
import { Poppins } from '../../../../../../theme/typography';

interface RechargeFormProps {
    control: any;
    errors: any;
    setValue: any; // Make sure this is passed from the parent component!
    selectedOperator: any;
    onOperatorPress: () => void;
    selectedCircle: string;
    onCirclePress: () => void;
    onSubmit: () => void;
}

export const RechargeForm: React.FC<RechargeFormProps> = ({
    control,
    errors,
    setValue,
    selectedOperator,
    onOperatorPress,
    selectedCircle,
    onCirclePress,
    onSubmit,
}) => {
    const [modalVisible, setModalVisible] = useState(false);
    const [allContacts, setAllContacts] = useState<any[]>([]);
    const [filteredContacts, setFilteredContacts] = useState<any[]>([]);
    const [searchQuery, setSearchQuery] = useState('');

    const handlePickContact = async () => {
        try {
            if (Platform.OS === 'android') {
                const granted = await PermissionsAndroid.request(
                    PermissionsAndroid.PERMISSIONS.READ_CONTACTS,
                    {
                        title: 'Contacts Permission',
                        message: 'This app needs access to your contacts to let you pick a number.',
                        buttonPositive: 'OK',
                    }
                );

                if (granted !== PermissionsAndroid.RESULTS.GRANTED) {
                    console.log('Contact permission denied');
                    return;
                }
            }

            const contactsList = await Contacts.getAll();
            const validContacts = contactsList.filter(c => c.phoneNumbers && c.phoneNumbers.length > 0);

            setAllContacts(validContacts);
            setFilteredContacts(validContacts);
            setModalVisible(true);
        } catch (error) {
            console.warn(error);
        }
    };

    const handleSearch = (text: string) => {
        setSearchQuery(text);
        if (!text) {
            setFilteredContacts(allContacts);
            return;
        }

        const formattedQuery = text.toLowerCase();
        const filtered = allContacts.filter(contact => {
            const nameMatch = contact.displayName?.toLowerCase().includes(formattedQuery);
            const numberMatch = contact.phoneNumbers?.some((p: any) => {
                const numStr = p?.number ? String(p.number).replace(/\D/g, '') : '';
                return numStr.includes(formattedQuery);
            });
            return nameMatch || numberMatch;
        });
        setFilteredContacts(filtered);
    };

    // Strict guard check on both the rawNumber and the setValue function
    const selectContactNumber = (rawNumber: any) => {
        const stringifiedNumber = String(rawNumber || '').trim();

        if (!stringifiedNumber) {
            console.log('Skipped: Number string is empty.');
            return;
        }

        let cleanedNumber = stringifiedNumber.replace(/\D/g, '');
        if (cleanedNumber.length > 10) {
            cleanedNumber = cleanedNumber.slice(-10);
        }

        // CRITICAL CHECK: Ensure setValue exists before execution
        if (typeof setValue === 'function') {
            setValue('mobileNumber', cleanedNumber, { shouldValidate: true });
        } else {
            console.error("CRITICAL ERROR: 'setValue' prop was not passed down to RechargeForm from the parent component!");
        }

        setModalVisible(false);
        setSearchQuery('');
    };

    return (
        <View style={styles.formContainer}>
            <Text style={styles.label}>MOBILE NUMBER</Text>
            <View style={[styles.inputWrapper, errors.mobileNumber && { borderColor: Colors.error }]}>
                <Controller
                    control={control}
                    name="mobileNumber"
                    render={({ field: { onChange, onBlur, value } }) => (
                        <TextInput
                            style={styles.input}
                            placeholder="Enter 10 digit number"
                            keyboardType="phone-pad"
                            onBlur={onBlur}
                            onChangeText={onChange}
                            value={value}
                            maxLength={10}
                            placeholderTextColor={Colors.textSecondary}
                        />
                    )}
                />
                <TouchableOpacity onPress={handlePickContact} activeOpacity={0.7}>
                    <MaterialCommunityIcons
                        name="card-account-details-outline"
                        size={24}
                        color={errors.mobileNumber ? Colors.error : Colors.textSecondary}
                    />
                </TouchableOpacity>
            </View>
            {errors.mobileNumber && <Text style={{ color: Colors.error, fontSize: 12, marginTop: 4 }}>{errors.mobileNumber.message}</Text>}

            {/* --- CONTACT PICKER OVERLAY MODAL --- */}
            <Modal visible={modalVisible} animationType="slide" transparent={true}>
                <View style={localStyles.modalContainer}>
                    <View style={localStyles.modalContent}>
                        <View style={localStyles.modalHeader}>
                            <Text style={localStyles.modalTitle}>Select Contact</Text>
                            <TouchableOpacity onPress={() => setModalVisible(false)}>
                                <MaterialCommunityIcons name="close" size={24} color="#000" />
                            </TouchableOpacity>
                        </View>

                        <View style={localStyles.searchBarContainer}>
                            <MaterialCommunityIcons name="magnify" size={20} color={Colors.textSecondary} />
                            <TextInput
                                style={localStyles.searchInput}
                                placeholder="Search by name or number..."
                                value={searchQuery}
                                onChangeText={handleSearch}
                                placeholderTextColor={Colors.textSecondary}
                            />
                        </View>

                        <FlatList
                            data={filteredContacts}
                            keyExtractor={(item, index) => item.recordID || String(index)}
                            renderItem={({ item }) => (
                                <View style={localStyles.contactCard}>
                                    <Text style={localStyles.contactName}>{item.displayName || "Unknown Name"}</Text>
                                    {item.phoneNumbers && item.phoneNumbers.map((phone: any, index: number) => {
                                        const currentNumber = phone && typeof phone === 'object' ? phone.number : phone;
                                        const displayNo = currentNumber ? String(currentNumber).trim() : '';

                                        if (!displayNo) return null;

                                        return (
                                            <TouchableOpacity
                                                key={`${item.recordID || index}-${index}`}
                                                style={localStyles.numberRow}
                                                onPress={() => selectContactNumber(displayNo)}
                                            >
                                                <Text style={localStyles.contactNumber}>{displayNo}</Text>
                                                <MaterialCommunityIcons name="chevron-right" size={18} color={Colors.primary} />
                                            </TouchableOpacity>
                                        );
                                    })}
                                </View>
                            )}
                            ListEmptyComponent={
                                <Text style={localStyles.emptyText}>No contacts matched your search.</Text>
                            }
                        />
                    </View>
                </View>
            </Modal>

            {/* --- WORKFLOW FOOTER OPTIONS --- */}
            <View style={styles.row}>
                <TouchableOpacity style={{ flex: 1 }} onPress={onOperatorPress}>
                    <Text style={styles.label}>OPERATOR</Text>
                    <View style={styles.dropdown}>
                        <View style={styles.operatorLogo}>
                            <Image source={{ uri: selectedOperator?.logo }} style={styles.logo} resizeMode="contain" />
                        </View>
                        <Text style={styles.dropdownText}>{selectedOperator?.name || selectedOperator?.operatorName || 'Select Operator'}</Text>
                        <MaterialCommunityIcons name="chevron-down" size={20} color={Colors.textSecondary} />
                    </View>
                </TouchableOpacity>
                <TouchableOpacity style={{ flex: 1, marginTop: 10 }} onPress={onCirclePress}>
                    <Text style={styles.label}>CIRCLE</Text>
                    <View style={styles.dropdown}>
                        <MaterialCommunityIcons name="map-marker-outline" size={20} color={Colors.primary} />
                        <Text style={styles.dropdownText}>{selectedCircle}</Text>
                        <MaterialCommunityIcons name="chevron-down" size={20} color={Colors.textSecondary} />
                    </View>
                </TouchableOpacity>
            </View>

            <Text style={styles.label}>AMOUNT</Text>
            <View style={[styles.inputWrapper, errors.amount && { borderColor: Colors.error }]}>
                <Controller
                    control={control}
                    name="amount"
                    render={({ field: { onChange, onBlur, value } }) => (
                        <TextInput
                            style={styles.input}
                            placeholder="Enter Amount"
                            keyboardType="numeric"
                            onBlur={onBlur}
                            onChangeText={onChange}
                            value={value}
                            placeholderTextColor={Colors.textSecondary}
                        />
                    )}
                />
                <Text style={[styles.currency, errors.amount && { color: Colors.error }]}>₹</Text>
            </View>
            {errors.amount && <Text style={{ color: Colors.error, fontSize: 12, marginTop: 4 }}>{errors.amount.message}</Text>}

            <TouchableOpacity style={styles.submitButton} onPress={onSubmit}>
                <Text style={styles.submitButtonText}>Submit</Text>
            </TouchableOpacity>
        </View>
    );
};

const localStyles = StyleSheet.create({
    modalContainer: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' },
    modalContent: { backgroundColor: '#fff', borderTopLeftRadius: 20, borderTopRightRadius: 20, height: '75%', padding: 16 },
    modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 },
    modalTitle: { fontSize: 16, fontWeight: 'bold', color: '#000', fontFamily: Poppins.bold,},
    searchBarContainer: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#f0f0f0', borderRadius: 8, paddingHorizontal: 10, marginBottom: 16, height: 45 },
    searchInput: { flex: 1, marginLeft: 8, color: '#000', fontSize: 16, fontFamily: Poppins.bold,},
    contactCard: { borderBottomWidth: 1, borderBottomColor: '#f0f0f0', paddingVertical: 12 },
    contactName: { fontSize: 16, fontWeight: '600', color: '#333', marginBottom: 4, fontFamily: Poppins.bold,},
    numberRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 6, paddingLeft: 4 },
    contactNumber: { fontSize: 16, color: '#666', fontFamily: Poppins.bold,},
    emptyText: { textAlign: 'center', color: '#999', marginTop: 40, fontSize: 16, fontFamily: Poppins.bold,},
});