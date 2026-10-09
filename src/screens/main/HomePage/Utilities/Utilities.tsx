import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import CustomIcon from '../../../../components/CostomIcon/Icon';
import { Colors } from '../../../../theme';
import { RootStackParamList } from '../../../../navigation/RootNavigator';
import { Poppins } from '../../../../theme/typography';

interface SectionHeaderProps {
  title: string;
  isExpanded: boolean;
  onToggleViewAll: () => void;
}

const SectionHeader: React.FC<SectionHeaderProps> = ({
  title,
  isExpanded,
  onToggleViewAll,
}) => (
  <View style={styles.sectionHeader}>
    <Text style={styles.sectionTitle}>{title}</Text>
    <TouchableOpacity onPress={onToggleViewAll} activeOpacity={0.7}>
      <Text style={styles.viewAll}>{isExpanded ? 'Show Less' : 'View All'}</Text>
    </TouchableOpacity>
  </View>
);

const Utilities: React.FC = () => {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const [isExpanded, setIsExpanded] = useState(false);

  // All utility items list
  const utilitiesData = [
    {
      id: 'gas',
      name: 'cylinder',
      title: 'Gas Pipe',
      color: '#1E8E3E',
      bgColor: '#F0FFF4',
      borderColor: '#D0F5D8',
      screen: 'GasRechargeScreen' as keyof RootStackParamList,
    },
    {
      id: 'broadband',
      name: 'router-wireless',
      title: 'Broadband',
      color: Colors.primary,
      bgColor: Colors.bgSecondaryBtn,
      borderColor: Colors.primaryLight,
      screen: 'BroadbandRechargeScreen' as keyof RootStackParamList,
    },
    {
      id: 'water',
      name: 'water',
      title: 'Water',
      color: '#12B5CB',
      bgColor: '#F0FDFF',
      borderColor: '#D0F9FF',
      screen: 'WaterRechargeScreen' as keyof RootStackParamList,
    },
    // {
    //   id: 'fastag',
    //   name: 'car-connected',
    //   title: 'FastTag',
    //   color: '#D93025',
    //   bgColor: '#FFF0F0',
    //   borderColor: '#FFD0D0',
    //   screen: 'FastagRechargeScreen' as keyof RootStackParamList,
    // },
    {
      id: 'lic',
      name: 'security',
      title: 'Insurance',
      color: '#0066FF',
      bgColor: '#F0F7FF',
      borderColor: '#D0E3FF',
      screen: 'BookNewPolicyScreen' as keyof RootStackParamList,
    },
    {
      id: 'landline',
      name: 'phone-classic',
      title: 'Landline',
      color: '#0066FF',
      bgColor: '#F0F7FF',
      borderColor: '#D0E3FF',
      screen: 'LandlineRechargeScreen' as keyof RootStackParamList,
    },
    {
      id: 'gas-booking',
      name: "propane-tank",
      title: "Gas Booking",
      color: "#996D00",
      bgColor: "#fff8f0",
      borderColor: "#f8c793ff",
      screen: 'GasBookingScreen' as keyof RootStackParamList,
    },


  ];

  // Slice array to show only first 4 items when collapsed
  const visibleUtilities = isExpanded ? utilitiesData : utilitiesData.slice(0, 4);

  return (
    <View style={styles.container}>
      <SectionHeader
        title="Utilities"
        isExpanded={isExpanded}
        onToggleViewAll={() => setIsExpanded(!isExpanded)}
      />
      <View style={styles.gridContainer}>
        {visibleUtilities.map((item) => (
          <CustomIcon
            key={item.id}
            name={item.name}
            title={item.title}
            color={item.color}
            bgColor={item.bgColor}
            borderColor={item.borderColor}
            onPress={() => navigation.navigate(item.screen as any)}
          />
        ))}
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
    marginHorizontal: 5,
  },
  sectionTitle: {
    fontSize: 16,
    // fontFamily: Poppins.bold,
    fontWeight: 'bold',
    color: '#1A1D2E',
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
    justifyContent: 'flex-start',
    alignItems: 'center',
    gap: 12, // Space between icon items

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

export default Utilities;