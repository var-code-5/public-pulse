import { useState, useEffect } from 'react';
import * as Location from 'expo-location';

interface LocationData {
  latitude: number;
  longitude: number;
}

interface UseLocationReturn {
  location: LocationData | null;
  error: string | null;
  loading: boolean;
  requestPermission: () => Promise<boolean>;
  getCurrentLocation: () => Promise<void>;
}

export const useLocation = (): UseLocationReturn => {
  const [location, setLocation] = useState<LocationData | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(false);

  // Request location permissions
  const requestPermission = async (): Promise<boolean> => {
    setLoading(true);
    setError(null);
    
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        setError('Permission to access location was denied');
        return false;
      }
      return true;
    } catch (err: any) {
      setError(err.message || 'Failed to request location permission');
      return false;
    } finally {
      setLoading(false);
    }
  };

  // Get current location
  const getCurrentLocation = async (): Promise<void> => {
    setLoading(true);
    setError(null);
    
    try {
      // First check if we have permission
      const { status } = await Location.getForegroundPermissionsAsync();
      if (status !== 'granted') {
        const permissionGranted = await requestPermission();
        if (!permissionGranted) {
          return;
        }
      }
      
      const location = await Location.getCurrentPositionAsync({});
      setLocation({
        latitude: location.coords.latitude,
        longitude: location.coords.longitude,
      });
    } catch (err: any) {
      setError(err.message || 'Failed to get location');
    } finally {
      setLoading(false);
    }
  };

  return {
    location,
    error,
    loading,
    requestPermission,
    getCurrentLocation,
  };
};
