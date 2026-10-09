import Geolocation from "@react-native-community/geolocation";
import { LocationCoords } from "./LocationCoords";

export const getCurrentGPSCoordinates = (
  onSuccess: (coords: LocationCoords) => void,
  onError?: (error: any) => void,
  enableHighAccuracy = true
) => {
  Geolocation.getCurrentPosition(
    (position) => {
      const { latitude, longitude } = position.coords;
      onSuccess({ latitude, longitude });
    },
    (error) => {
      console.warn('Geolocation tracing failed code:', error.code, error.message);
      // Fallback to coarse accuracy if high accuracy times out
      if (enableHighAccuracy && error.code === 3) {
        getCurrentGPSCoordinates(onSuccess, onError, false);
      } else if (onError) {
        onError(error);
      }
    },
    {
      enableHighAccuracy,
      timeout: enableHighAccuracy ? 15000 : 20000,
      maximumAge: 30000,
    }
  );
};