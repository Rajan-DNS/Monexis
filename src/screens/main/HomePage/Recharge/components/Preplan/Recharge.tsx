import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import CustomIcon from '../../../../../../components/CostomIcon/Icon';
import { Colors } from '../../../../../../theme';
import { RootStackParamList } from '../../../../../../navigation/RootNavigator';
import { Poppins } from '../../../../../../theme/typography';

interface SectionHeaderProps {
  title: string;
}

const SectionHeader: React.FC<SectionHeaderProps> = ({ title }) => (
  <View style={styles.sectionHeader}>
    <Text style={styles.sectionTitle}>{title}</Text>
    {/* <TouchableOpacity>
      <Text style={styles.viewAll}>View All</Text>
    </TouchableOpacity> */}
  </View>
);

const Recharge: React.FC = () => {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();

  return (
    <View style={styles.container}>
      <SectionHeader title="Recharge & Pay Bills" />
      <View style={styles.gridContainer}>
        <CustomIcon
          name="cellphone-nfc"
          title="Recharge"
          color={Colors.icon}
          bgColor={Colors.bgSecondaryBtn}
          borderColor={Colors.primaryLight}
          onPress={() => navigation.navigate('RechargeScreen')}
        />

        <CustomIcon
          name="lightning-bolt"
          title="Electricity"
          color="#FFA500"
          bgColor="#FFF8F0"
          borderColor="#FFE8D0"
          onPress={() => navigation.navigate('ElectricityRechargeScreen')}
        />
        <CustomIcon
          name="rss"
          title="DTH"
          color="#9333EA"
          bgColor="#FAF5FF"
          borderColor="#E9D5FF"
          onPress={() => navigation.navigate('DTHRechargeScreen')}
        />
        <CustomIcon
          name="history"
          title="History"
          color="#D93025"
          bgColor="#FFF0F0"
          borderColor="#FFD0D0"
          onPress={() => navigation.navigate('RechargeReport')}
        />

      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    // marginBottom: 8,
  },
  sectionHeader: {
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
  gridContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    alignItems: 'center',

    backgroundColor: Colors.white,
    borderRadius: 24,
    padding: 10,
    marginBottom: 16,

    borderWidth: 1,
    borderColor: Colors.borderLight,

    // iOS Shadow
    shadowColor: Colors.shadow,
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 1,

    // Android Shadow
    elevation: 2,
  },
});


export default Recharge;
