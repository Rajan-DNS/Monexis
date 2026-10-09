import React, { useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  StatusBar,
  Animated,
  Image,
} from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { jwtDecode } from 'jwt-decode';
import Colors from '../../theme/colors';
import { Poppins } from '../../theme/typography';
import { useAppSelector } from '../../redux/hooks';

type RootStackParamList = {
  Splash: undefined;
  Login: undefined;
  MainTabs: undefined;
};

type SplashScreenProps = NativeStackScreenProps<RootStackParamList, 'Splash'>;

// Define the shape of your JWT payload
interface JwtPayload {
  exp?: number;
  [key: string]: any;
}

// Helper function using jwt-decode
const isTokenExpired = (token: string | null): boolean => {
  if (!token) return true;
  try {
    const decoded = jwtDecode<JwtPayload>(token);
    console.log("------>", decoded)

    // exp is in seconds, Date.now() is in milliseconds
    if (decoded.exp && decoded.exp * 1000 < Date.now()) {
      return true; // Token has expired
    }

    return false; // Token is still valid
  } catch (error) {
    console.error("Invalid token format:", error);
    return true; // Send to login screen if token is corrupt or malformed
  }
};

const SplashScreen: React.FC<SplashScreenProps> = ({ navigation }) => {
  const token = useAppSelector((state: any) => state.auth.token);
  console.log("-------->", token)

  // Verify token exists and is valid
  const isUserValid = token !== null && !isTokenExpired(token);
  const authRef = useRef(isUserValid);

  useEffect(() => {
    authRef.current = isUserValid;
  }, [isUserValid]);

  // Animation values
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.5)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 2000,
        useNativeDriver: true,
      }),
      Animated.spring(scaleAnim, {
        toValue: 1,
        friction: 6,
        useNativeDriver: true,
      }),
    ]).start();

    const timer = setTimeout(() => {
      if (authRef.current) {
        navigation.replace('MainTabs');
      } else {
        navigation.replace('Login');
      }
    }, 2500);

    return () => clearTimeout(timer);
  }, [navigation]);

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor={Colors.bg} />

      <Animated.View
        style={[
          styles.logoContainer,
          {
            opacity: fadeAnim,
            transform: [{ scale: scaleAnim }]
          }
        ]}
      >
        <Image
          source={require('../../Assets/images/splashw.png')}
          style={styles.logo}
        />
        
      </Animated.View>

      <View style={styles.footer}>
        <Text style={styles.version}>Version 1.0.0</Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#ffff',
    justifyContent: 'center',
    alignItems: 'center',
  },
  logoContainer: {
    marginBottom: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  logo: {
    width: 300,
    height: 700,
    resizeMode: 'contain',
  },
  footer: {
    position: 'absolute',
    bottom: 40,
  },
  version: {
    color: 'rgba(255, 255, 255, 0.6)',
    fontSize: 12,
    fontFamily: Poppins.regular,
  },
});

export default SplashScreen;