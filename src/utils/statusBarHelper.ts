import { StatusBarStyle } from 'react-native';

/**
 * Calculate the relative luminance of a color
 * Based on WCAG 2.0 formula
 */
function getLuminance(hexColor: string): number {
  // Remove # if present
  const hex = hexColor.replace('#', '');
  
  // Parse RGB values
  const r = parseInt(hex.substring(0, 2), 16) / 255;
  const g = parseInt(hex.substring(2, 4), 16) / 255;
  const b = parseInt(hex.substring(4, 6), 16) / 255;
  
  // Apply gamma correction
  const rsRGB = r <= 0.03928 ? r / 12.92 : Math.pow((r + 0.055) / 1.055, 2.4);
  const gsRGB = g <= 0.03928 ? g / 12.92 : Math.pow((g + 0.055) / 1.055, 2.4);
  const bsRGB = b <= 0.03928 ? b / 12.92 : Math.pow((b + 0.055) / 1.055, 2.4);
  
  // Calculate luminance
  return 0.2126 * rsRGB + 0.7152 * gsRGB + 0.0722 * bsRGB;
}

/**
 * Determine the appropriate StatusBar style based on background color
 * Returns 'dark-content' for light backgrounds and 'light-content' for dark backgrounds
 * 
 * @param backgroundColor - Hex color string (e.g., '#FFFFFF' or '#0E21A0')
 * @returns StatusBarStyle - 'dark-content' or 'light-content'
 */
export function getStatusBarStyle(backgroundColor: string): StatusBarStyle {
  try {
    const luminance = getLuminance(backgroundColor);
    
    // If luminance is greater than 0.5, it's a light color, use dark icons
    // Otherwise, it's a dark color, use light icons
    return luminance > 0.5 ? 'dark-content' : 'light-content';
  } catch (error) {
    // Default to dark-content if there's an error parsing the color
    console.warn('Error determining StatusBar style:', error);
    return 'dark-content';
  }
}

/**
 * Get StatusBar configuration for common app backgrounds
 * This provides consistent StatusBar styling across the app
 */
export const statusBarConfig = {
  default: {
    backgroundColor: '#FFFFFF',
    barStyle: 'dark-content' as StatusBarStyle,
  },
  primary: {
    backgroundColor: '#0E21A0',
    barStyle: 'light-content' as StatusBarStyle,
  },
  transparent: {
    backgroundColor: 'transparent',
    barStyle: 'dark-content' as StatusBarStyle,
    translucent: true,
  },
};
