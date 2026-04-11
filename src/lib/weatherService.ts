import type { WeatherData, WeatherCondition } from "@/types/wardrobe";

/**
 * Weather Service Module
 * Handles weather API integration and data normalization
 * 
 * CURRENTLY: Mock implementation for testing
 * TODO: Integrate with OpenWeatherMap, WeatherAPI, or similar
 */

// Mock weather data for development
const MOCK_WEATHER: WeatherData = {
  temperature: 22,
  condition: "sunny" as WeatherCondition,
  humidity: 65,
  windSpeed: 10,
  feelsLike: 20,
  uvIndex: 6,
};

/**
 * Fetch weather data either from API or mock
 * @param latitude - User's latitude
 * @param longitude - User's longitude
 * @returns Promise<WeatherData>
 */
export async function fetchWeatherData(latitude?: number, longitude?: number): Promise<WeatherData> {
  try {
    // Check if we have a real API key configured
    const apiKey = import.meta.env.VITE_OPENWEATHER_API_KEY;

    if (!apiKey || !latitude || !longitude) {
      console.warn("Weather API not configured, using mock data");
      return MOCK_WEATHER;
    }

    const response = await fetch(
      `https://api.openweathermap.org/data/2.5/weather?lat=${latitude}&lon=${longitude}&units=metric&appid=${apiKey}`,
    );

    if (!response.ok) throw new Error("Weather API failed");

    const data = await response.json();
    return normalizeWeatherData(data);
  } catch (error) {
    console.error("Failed to fetch weather:", error);
    return MOCK_WEATHER;
  }
}

/**
 * Get mock weather data for testing
 */
export function getMockWeather(overrides?: Partial<WeatherData>): WeatherData {
  return { ...MOCK_WEATHER, ...overrides };
}

/**
 * Normalize OpenWeatherMap API response to our WeatherData format
 */
function normalizeWeatherData(apiResponse: any): WeatherData {
  const temp = Math.round(apiResponse.main.temp);
  const condition = normalizeCondition(apiResponse.weather[0].main);

  return {
    temperature: temp,
    condition,
    humidity: apiResponse.main.humidity,
    windSpeed: Math.round(apiResponse.wind.speed),
    feelsLike: Math.round(apiResponse.main.feels_like),
    uvIndex: 0, // Not provided by free tier, would need separate UV API
  };
}

/**
 * Map OpenWeatherMap conditions to our WeatherCondition type
 */
function normalizeCondition(weatherMain: string): WeatherCondition {
  const main = weatherMain.toLowerCase();

  if (main.includes("clear") || main.includes("sunny")) return "sunny";
  if (main.includes("cloud")) return "cloudy";
  if (main.includes("rain")) return "rainy";
  if (main.includes("snow")) return "snowy";
  if (main.includes("wind")) return "windy";
  if (main.includes("humid")) return "humid";

  return "cloudy"; // default fallback
}

/**
 * Get seasonal recommendation based on temperature
 */
export function getSeasonFromTemp(temp: number): "summer" | "spring" | "fall" | "winter" {
  if (temp > 25) return "summer";
  if (temp > 15) return "spring";
  if (temp > 5) return "fall";
  return "winter";
}

/**
 * Get comfort-level emoji for weather display
 */
export function getWeatherEmoji(weather: WeatherData): string {
  if (weather.condition === "sunny") return "☀️";
  if (weather.condition === "cloudy") return "☁️";
  if (weather.condition === "rainy") return "🌧️";
  if (weather.condition === "snowy") return "❄️";
  if (weather.condition === "windy") return "💨";
  if (weather.condition === "humid") return "💧";
  return "🌡️";
}

/**
 * Format weather for display
 */
export function formatWeather(weather: WeatherData): string {
  return `${getWeatherEmoji(weather)} ${weather.temperature}°C, ${weather.condition}`;
}
