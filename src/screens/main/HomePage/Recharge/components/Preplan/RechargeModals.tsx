import React from 'react';
import { View, Text, TouchableOpacity, Modal, FlatList, Image } from 'react-native';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import { rechargeStyles as styles } from '../../rechargeStyles';
import { Colors } from '../../../../../../theme';
const baseUrl = 'https://webapi.monexis.store/';


interface OperatorModalProps {
    visible: boolean;
    onClose: () => void;
    data: any[];
    selectedId: string;
    onSelect: (item: any) => void;
}

export const OperatorModal: React.FC<OperatorModalProps> = ({
    visible, onClose, data, selectedId, onSelect
}) => (
    <Modal
        visible={visible}
        transparent
        animationType="slide"
        onRequestClose={onClose}
    >
        <View style={styles.modalOverlay}>
            <View style={styles.modalContent}>
                <View style={styles.modalHeader}>
                    <Text style={styles.modalTitle}>Select Operator</Text>
                    <TouchableOpacity onPress={onClose}>
                        <MaterialCommunityIcons name="close" size={24} color={Colors.textDark} />
                    </TouchableOpacity>
                </View>
                <FlatList
                    data={data}
                    keyExtractor={(item, index) => item.id?.toString() || item.operatorId?.toString() || index.toString()}
                    renderItem={({ item }) => (
                        <TouchableOpacity
                            style={styles.selectionItem}
                            onPress={() => onSelect(item)}
                        >
                            <View style={styles.operatorLogoSmall}>
                                <Image source={{ uri: `${baseUrl}${item.logoURL || item.operatorImage}` }} style={styles.logoSmall} resizeMode="contain" />
                            </View>
                            <Text style={styles.selectionText}>{item.name || item.operatorName}</Text>
                            {(selectedId === item.id || selectedId === item.operatorId) && (
                                <MaterialCommunityIcons name="check-circle" size={20} color={Colors.primary} />
                            )}
                        </TouchableOpacity>
                    )}
                />
            </View>
        </View>
    </Modal>
);

interface CircleModalProps {
    visible: boolean;
    onClose: () => void;
    data: any[];
    selected: string;
    onSelect: (circle: string) => void;
}

export const CircleModal: React.FC<CircleModalProps> = ({
    visible, onClose, data, selected, onSelect
}) => (
    <Modal
        visible={visible}
        transparent
        animationType="slide"
        onRequestClose={onClose}
    >
        <View style={styles.modalOverlay}>
            <View style={styles.modalContent}>
                <View style={styles.modalHeader}>
                    <Text style={styles.modalTitle}>Select Circle</Text>
                    <TouchableOpacity onPress={onClose}>
                        <MaterialCommunityIcons name="close" size={24} color={Colors.textDark} />
                    </TouchableOpacity>
                </View>
                <FlatList
                    data={data}
                    keyExtractor={(item, index) => typeof item === 'string' ? item : (item.id?.toString() || item.circleCode?.toString() || index.toString())}
                    renderItem={({ item }) => {
                        const circleName = typeof item === 'string' ? item : item.circleName;
                        return (
                            <TouchableOpacity
                                style={styles.selectionItem}
                                onPress={() => onSelect(circleName)}
                            >
                                <Text style={styles.selectionText}>{circleName}</Text>
                                {selected === circleName && (
                                    <MaterialCommunityIcons name="check-circle" size={20} color={Colors.primary} />
                                )}
                            </TouchableOpacity>
                        );
                    }}
                />
            </View>
        </View>
    </Modal>
);

interface SuccessModalProps {
    visible: boolean;
    onClose: () => void;
    mobileNumber: string;
    amount: string;
    operatorName: string;
}

export const SuccessModal: React.FC<SuccessModalProps> = ({
    visible, onClose, mobileNumber, amount, operatorName
}) => (
    <Modal
        visible={visible}
        transparent
        animationType="fade"
        onRequestClose={onClose}
    >
        <View style={styles.modalOverlay}>
            <View style={styles.successCard}>
                <View style={styles.successIconContainer}>
                    <MaterialCommunityIcons name="check-decagram" size={80} color={Colors.success} />
                </View>
                <Text style={styles.successTitle}>Recharge Successful!</Text>
                <Text style={styles.successSubTitle}>Your recharge for {mobileNumber || '9876543210'} of ₹{amount || '719'} was successful.</Text>

                <View style={styles.successDetails}>
                    <View style={styles.detailRow}>
                        <Text style={styles.detailLabel}>Operator</Text>
                        <Text style={styles.detailValue}>{operatorName}</Text>
                    </View>
                    <View style={styles.detailRow}>
                        <Text style={styles.detailLabel}>Transaction ID</Text>
                        <Text style={styles.detailValue}>#DNS{Math.floor(Math.random() * 1000000)}</Text>
                    </View>
                </View>

                <TouchableOpacity
                    style={styles.doneButton}
                    onPress={onClose}
                >
                    <Text style={styles.doneButtonText}>Done</Text>
                </TouchableOpacity>
            </View>
        </View>
    </Modal>
);
