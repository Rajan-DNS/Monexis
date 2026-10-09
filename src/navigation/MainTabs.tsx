import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Text, Platform, View, Animated } from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';

// Tab route params
export type TabParamList = {
  Home: undefined;
  Report: undefined;
  Ledger: undefined;
  Profile: undefined;
};

// Screens
import HomeScreen from '../screens/main/HomePage/HomeScreen';
import LedgerScreen from '../screens/main/LedgerScreen';
import ProfileScreen from '../screens/main/Profile/ProfileScreen';

// Theme
import Colors from '../theme/colors';
import ReportsScreen from '../screens/main/ReportScreen/ReportsScreen';

// Role-based logic
import { useAppSelector } from '../redux/hooks';
import HomeScreenD from '../screens/Destributor/mainScreen/HomePage/HomeScreenD';
import TransactionReportScreen from '../screens/main/ReportScreen/TransactionReportScreen';

const TabIcon = ({ focused, iconName, color, size }: any) => {
  const lineAnim = React.useRef(new Animated.Value(focused ? 1 : 0)).current;

  React.useEffect(() => {
    Animated.timing(lineAnim, {
      toValue: focused ? 1 : 0,
      duration: 300,
      useNativeDriver: false,
    }).start();
  }, [focused]);

  return (
    <View style={{ alignItems: 'center', justifyContent: 'center', width: 40 }}>
      <Animated.View
        style={{
          position: 'absolute',
          top: Platform.OS === 'ios' ? -5 : -10,
          width: 24,
          height: 3,
          backgroundColor: Colors.primary,
          borderRadius: 2,
          transform: [{ scaleX: lineAnim }],
          opacity: lineAnim,
        }}
      />
      <Ionicons name={iconName} size={size} color={color} style={{ marginTop: 2 }} />
    </View>
  );
};

const MainTabs: React.FC = () => {
  const user = useAppSelector((state) => state.auth.user);

  const userRole = user?.role?.toLowerCase() || '';
  const isDistributor = userRole === 'distributor' || userRole === 'Retailer';
  const Tab = createBottomTabNavigator();

  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,

        tabBarActiveTintColor: Colors.primary,
        tabBarInactiveTintColor: Colors.textSecondary,
        tabBarLabelStyle: {
          fontSize: 12,
          fontWeight: '600',
          marginBottom: Platform.OS === 'ios' ? 0 : 5,
        },
        tabBarStyle: {
          backgroundColor: Colors.white,
          height: Platform.OS === 'ios' ? 88 : 65,
          paddingBottom: Platform.OS === 'ios' ? 30 : 10,
          paddingTop: 10,
        },
        // Using a centralized icon renderer
        tabBarIcon: ({ color, size, focused }) => {
          let iconName;
          if (route.name === 'Home') {
            iconName = focused ? 'home' : 'home-outline';
          } else if (route.name === 'Report') {
            iconName = focused ? 'wallet' : 'wallet-outline';
          } else if (route.name === 'Ledger') {
            iconName = focused ? 'receipt' : 'receipt-outline';
          } else if (route.name === 'Profile') {
            iconName = focused ? 'person' : 'person-outline';
          }

          return <TabIcon focused={focused} iconName={iconName} color={color} size={size} />;
        },
      })}
    >
      <Tab.Screen
        name="Home"
        component={(isDistributor ? HomeScreenD : HomeScreen) as any}
        options={{ tabBarLabel: isDistributor ? 'Distributor' : 'Home' }}
      />
      <Tab.Screen
        name="Report"
        component={ReportsScreen}
        options={{ tabBarLabel: 'Report' }}
      />
      <Tab.Screen
        name="Ledger"
        component={TransactionReportScreen}
        options={{ tabBarLabel: 'Ledger' }}
      />
      <Tab.Screen
        name="Profile"
        component={ProfileScreen}
        options={{ tabBarLabel: 'Profile' }}
      />
    </Tab.Navigator>
  );
};

export default MainTabs;