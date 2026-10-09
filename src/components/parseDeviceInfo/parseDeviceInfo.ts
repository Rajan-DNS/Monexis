import DeviceInfo from 'react-native-device-info';
import { Platform } from 'react-native';

export interface CompleteDeviceData {
  // Static / Synchronous Data
  uniqueId: string;
  bundleId: string;
  systemName: string;
  systemVersion: string;
  brand: string;
  model: string;
  deviceId: string;
  apiLevel: number;
  isEmulator: boolean;
  isTablet: boolean;
  appName: string;
  appVersion: string;
  buildNumber: string;
  
  // Dynamic / Asynchronous Data
  batteryLevel: number;
  isCharging: boolean;
  ipAddress: string;
  macAddress: string;
  totalMemory: number;
  freeDiskStorage: number;
  userAgent: string;
}

/**
 * Gathers all synchronous and asynchronous device specifications 
 * into a single unified data object.
 */
export const getAllDeviceData = async (): Promise<CompleteDeviceData> => {
  // 1. Grab synchronous fields immediately
  const syncData = {
    uniqueId: DeviceInfo.getUniqueIdSync(),
    bundleId: DeviceInfo.getBundleId(),
    systemName: DeviceInfo.getSystemName(),
    systemVersion: DeviceInfo.getSystemVersion(),
    brand: DeviceInfo.getBrand(),
    model: DeviceInfo.getModel(),
    deviceId: DeviceInfo.getDeviceId(),
    apiLevel: Platform.OS === 'android' ? DeviceInfo.getApiLevelSync() : -1,
    isEmulator: DeviceInfo.isEmulatorSync(),
    isTablet: DeviceInfo.isTablet(),
    appName: DeviceInfo.getApplicationName(),
    appVersion: DeviceInfo.getVersion(),
    buildNumber: DeviceInfo.getBuildNumber(),
  };

  // 2. Resolve asynchronous fields safely in parallel
  const [
    batteryLevelRes,
    isChargingRes,
    ipAddressRes,
    macAddressRes,
    totalMemoryRes,
    freeDiskStorageRes,
    userAgentRes,
  ] = await Promise.allSettled([
    DeviceInfo.getBatteryLevel(),
    DeviceInfo.isBatteryCharging(),
    DeviceInfo.getIpAddress(),
    DeviceInfo.getMacAddress(),
    DeviceInfo.getTotalMemory(),
    DeviceInfo.getFreeDiskStorage(),
    DeviceInfo.getUserAgent(),
  ]);

  // 3. Merge them together with structural fallback guards
  return {
    ...syncData,
    batteryLevel: batteryLevelRes.status === 'fulfilled' ? batteryLevelRes.value : -1,
    isCharging: isChargingRes.status === 'fulfilled' ? isChargingRes.value : false,
    ipAddress: ipAddressRes.status === 'fulfilled' ? ipAddressRes.value : 'unknown',
    macAddress: macAddressRes.status === 'fulfilled' ? macAddressRes.value : 'unknown',
    totalMemory: totalMemoryRes.status === 'fulfilled' ? totalMemoryRes.value : 0,
    freeDiskStorage: freeDiskStorageRes.status === 'fulfilled' ? freeDiskStorageRes.value : 0,
    userAgent: userAgentRes.status === 'fulfilled' ? userAgentRes.value : 'unknown',
  };
};

/**
 * Helper runner to trigger the collection and print it directly
 * as a clean, strong string in your debugger terminal.
 */
export const logAllDeviceData = async (): Promise<void> => {
  try {
    const allData = await getAllDeviceData();
    
    // Formats the object tree into a readable string block
  } catch (error) {
    console.error("Failed to gather complete device metrics:", error);
  }
};