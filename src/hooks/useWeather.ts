import { useEffect, useState } from "react";
import type { WeatherData } from "@/types/wardrobe";
import { fetchWeatherData, getMockWeather } from "@/lib/weatherService";

interface UseWeatherResult {
  weather: WeatherData | null;
  loading: boolean;
  error: string | null;
  refetch: () => void;
}

/**
 * Hook to fetch and manage weather data
 * Uses geolocation if available, falls back to mock data
 */
export function useWeather(): UseWeatherResult {
  const [weather, setWeather] = useState<WeatherData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchWeather = async () => {
    setLoading(true);
    setError(null);

    try {
      // Try to get user's location
      if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
          async (position) => {
            const { latitude, longitude } = position.coords;
            const data = await fetchWeatherData(latitude, longitude);
            setWeather(data);
            setLoading(false);
          },
          () => {
            // Geolocation failed, use mock data
            setWeather(getMockWeather());
            setLoading(false);
          },
        );
      } else {
        // Geolocation not supported
        setWeather(getMockWeather());
        setLoading(false);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to fetch weather");
      setWeather(getMockWeather());
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchWeather();
  }, []);

  return { weather, loading, error, refetch: fetchWeather };
}
