import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import CustomIcon from '../../../../components/CostomIcon/Icon';
import { RootStackParamList } from '../../../../navigation/RootNavigator';
import { Poppins } from '../../../../theme/typography';

interface SectionHeaderProps {
  title: string;
}

const SectionHeader: React.FC<SectionHeaderProps> = ({ title }) => (
  <View style={styles.sectionHeader}>
    <Text style={styles.sectionTitle}>{title}</Text>
    <TouchableOpacity>
      <Text style={styles.viewAll}>View All</Text>
    </TouchableOpacity>
  </View>
);

const Bookings: React.FC = () => {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();

  return (
    <View style={styles.container}>
      <SectionHeader title="Bookings & Others" />
      <View style={styles.gridContainer}>
        <CustomIcon
          name="propane-tank"
          title="Gas Booking"
          color="#996D00"
          bgColor="#fff8f0"
          borderColor="#f8c793ff"
          onPress={() => navigation.navigate('GasBookingScreen')}
        />

        <CustomIcon
          name="lic"
          title="LIC"
          color="#0066FF"
          bgColor="#F0F7FF"
          borderColor="#D0E3FF"
          onPress={() => navigation.navigate('BookNewPolicyScreen')}
        />

        <CustomIcon
          name="airplane"
          title="Flight"
          color="#9333EA"
          bgColor="#FAF5FF"
          borderColor="#E9D5FF"
        />
        <CustomIcon
          name="dots-horizontal"
          title="More"
          color="#666"
          bgColor="#F5F5F5"
          borderColor="#E0E0E0"
        />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: 8,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 16,
    fontFamily: Poppins.bold,
    fontWeight: 'bold',
    color: '#1A1D2E',
  },
  viewAll: {
    color: '#0066FF',
    fontWeight: '600',
    fontSize: 16,
    fontFamily: Poppins.semiBold,
  },
  gridContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    padding: 16,
    borderWidth: 1,
    borderColor: '#F0F0F0',
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 0.03,
  },
});

export default Bookings;
