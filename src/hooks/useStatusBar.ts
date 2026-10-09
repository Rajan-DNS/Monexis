import { useEffect } from 'react';
import { StatusBar, StatusBarStyle } from 'react-native';
import { getStatusBarStyle } from '../utils/statusBarHelper';

interface UseStatusBarOptions {
  backgroundColor?: string;
  barStyle?: StatusBarStyle;
  animated?: boolean;
}

/**
 * Custom hook to manage StatusBar configuration for a screen
 * Automatically determines the appropriate bar style based on background color
 * 
 * @param options - Configuration options for the StatusBar
 * 
 * @example
 * // In a screen component:
 * useStatusBar({ backgroundColor: Colors.primary });
 * 
 * @example
 * // With explicit bar style:
 * useStatusBar({ backgroundColor: Colors.bg, barStyle: 'dark-content' });
 */
export function useStatusBar(options: UseStatusBarOptions = {}) {
  const {
    backgroundColor = '#FFFFFF',
    barStyle,
    animated = true,
  } = options;

  useEffect(() => {
    // Determine bar style automatically if not provided
    const finalBarStyle = barStyle || getStatusBarStyle(backgroundColor);
    
    StatusBar.setBarStyle(finalBarStyle, animated);
    
    // Set background color on Android
    if (StatusBar.setBackgroundColor) {
      StatusBar.setBackgroundColor(backgroundColor, animated);
    }
  }, [backgroundColor, barStyle, animated]);
}
