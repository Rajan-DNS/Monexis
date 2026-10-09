import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { Colors } from "../../theme";
interface SectionHeaderProps {
  title: string;
}
const SectionHeader: React.FC<SectionHeaderProps> = ({ title }) => (
  <View style={styles.sectionHeader}>
    <Text style={styles.sectionTitle}>{title}</Text>
    <TouchableOpacity>
      {/* <Text style={styles.viewAll}>View All</Text> */}
    </TouchableOpacity>
  </View>
);

const styles = StyleSheet.create({ sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
    paddingHorizontal: 5
  },
  sectionTitle: {
    fontSize: 16,
    // fontFamily: Poppins.bold,
    fontWeight: 'bold',
    color: Colors.textDark,
  },
  viewAll: {
    color: Colors.primary,
    fontWeight: '600',
    fontSize: 16,
    // fontFamily: Poppins.semiBold,
  },
});

export default SectionHeader;
  