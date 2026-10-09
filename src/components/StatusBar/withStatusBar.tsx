import React from 'react';
import { StatusBarStyle } from 'react-native';
import { useStatusBar } from '../../hooks/useStatusBar';

interface WithStatusBarOptions {
  backgroundColor?: string;
  barStyle?: StatusBarStyle;
}

/**
 * Higher-Order Component that wraps a screen component with StatusBar configuration
 * This allows individual screens to customize their StatusBar appearance
 * 
 * @param Component - The screen component to wrap
 * @param options - StatusBar configuration options
 * 
 * @example
 * export default withStatusBar(MyScreen, { 
 *   backgroundColor: Colors.primary, 
 *   barStyle: 'light-content' 
 * });
 */
export function withStatusBar<P extends object>(
  Component: React.ComponentType<P>,
  options: WithStatusBarOptions = {}
) {
  return function WithStatusBarWrapper(props: P) {
    useStatusBar(options);
    return <Component {...props} />;
  };
}
