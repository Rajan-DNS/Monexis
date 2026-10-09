import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import MaterialCommunityIcons from "react-native-vector-icons/MaterialCommunityIcons";
import { Colors } from "../theme";
import { Poppins } from "../theme/typography";

export const PaymentOption = ({ id, title, subtitle, icon, selected, onSelect }: any) => (
    <TouchableOpacity
        style={[styles.paymentItem, selected && styles.paymentItemSelected]}
        onPress={() => onSelect(id)}
    >
        <View style={styles.paymentIconBox}>
            <MaterialCommunityIcons name={icon} size={24} color={Colors.primary} />
        </View>
        <View style={{ flex: 1, marginLeft: 12 }}>
            <Text  style={styles.paymentTitle}>{title}</Text>
            <Text style={styles.paymentSub}>{subtitle}</Text>
        </View>
        <MaterialCommunityIcons
            name={selected ? "radiobox-marked" : "radiobox-blank"}
            size={24}
            color={selected ? Colors.primary : Colors.inputBorder}
        />
    </TouchableOpacity>
);

const styles = StyleSheet.create({
    paymentMethods: { gap: 12 },
    paymentItem: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: Colors.white,
        paddingHorizontal: 16,
        paddingVertical:8,
        borderRadius: 20,
        borderWidth: 1,
        // borderColor: Colors.borderLight,
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
        shadowColor: Colors.primary,
        elevation: 4,

    },
    paymentItemSelected: { borderColor: Colors.primary, backgroundColor: Colors.infoBg },
    paymentIconBox: { width: 48, height: 48, borderRadius: 24, backgroundColor: Colors.bgInput, justifyContent: 'center', alignItems: 'center' },
    paymentTitle: { fontSize: 16,  color: Colors.textDark, fontFamily: Poppins.semiBold, },
    paymentSub: { fontSize: 12, color: Colors.textSecondary, marginTop: 2, fontFamily: Poppins.semiBold, },
})