import { StyleSheet, Text, View } from "react-native";
import { Colors } from "../../../../theme";
import { Poppins } from "../../../../theme/typography";

export const SummaryRow = ({ label, value, isSuccess }: any) => (
    <View style={styles.summaryRow}>
        <Text style={styles.summaryLabel}>{label}</Text>
        <Text style={[styles.summaryValue, isSuccess && { color: Colors.warningText, fontWeight: 'bold' }]}>
            {value}
        </Text>
    </View>
);
const styles = StyleSheet.create({

    summaryRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 12,
    },
    summaryLabel: {
        color: Colors.textSecondary,
        fontSize: 16,
        // fontWeight: '500',
        fontFamily: Poppins.regular,
    },
    summaryValue: {
        color: Colors.textDark,
        fontSize: 16,
        // fontWeight: 'bold',
        fontFamily: Poppins.regular,
    },
    summaryDivider: {
        height: 1,
        backgroundColor: Colors.divider,
        marginVertical: 12,
    },
})