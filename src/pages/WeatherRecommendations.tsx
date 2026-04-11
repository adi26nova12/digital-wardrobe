import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  ChevronLeft,
  Cloud,
  CloudRain,
  Sun,
  Wind,
  Droplets,
  Loader,
  AlertCircle,
  Zap,
} from "lucide-react";
import { RecommendedOutfitsGrid } from "@/components/RecommendedOutfitsGrid";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useWardrobe } from "@/hooks/useWardrobe";
import { useWeather } from "@/hooks/useWeather";
import { createRecommendations } from "@/lib/recommendations";
import { formatWeather, getWeatherEmoji } from "@/lib/weatherService";
import type { RecommendationContext, Outfit } from "@/types/wardrobe";

const WeatherRecommendations = () => {
  const navigate = useNavigate();
  const { allItems, outfits } = useWardrobe();
  const { weather, loading: weatherLoading, error: weatherError, refetch } = useWeather();
  const [recommendations, setRecommendations] = useState<Outfit[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Memoize context with strong weather focus
  const context: RecommendationContext = useMemo(
    () => ({
      weather: weather ?? undefined,
      userPreferences: {
        preferredStyles: [],
        weatherPriority: true, // Prioritize weather matching
      },
    }),
    [weather],
  );

  // Generate weather-optimized recommendations
  useEffect(() => {
    if (allItems.length === 0) {
      setRecommendations([]);
      setLoading(false);
      return;
    }

    if (!weather) {
      console.log("⏳ Waiting for weather data...");
      setLoading(true);
      return;
    }

    const generateWeatherRecommendations = async () => {
      setLoading(true);
      setError(null);
      try {
        console.log("🌦️ Generating weather-optimized recommendations for:", formatWeather(weather));
        const results = await createRecommendations(allItems, outfits, context);
        console.log("✅ Weather recommendations generated:", results.length);
        setRecommendations(results);
      } catch (err) {
        console.error("Failed to generate weather recommendations:", err);
        setError(
          err instanceof Error ? err.message : "Failed to generate weather recommendations",
        );
        setRecommendations([]);
      } finally {
        setLoading(false);
      }
    };

    generateWeatherRecommendations();
  }, [allItems, outfits, context, weather]);

  const getWeatherIcon = () => {
    if (!weather) return <Cloud className="h-5 w-5" />;

    switch (weather.condition?.toLowerCase()) {
      case "sunny":
      case "clear":
        return <Sun className="h-5 w-5 text-yellow-500" />;
      case "rainy":
      case "rain":
        return <CloudRain className="h-5 w-5 text-blue-500" />;
      case "cloudy":
      case "clouds":
        return <Cloud className="h-5 w-5 text-gray-500" />;
      default:
        return <Cloud className="h-5 w-5" />;
    }
  };

  const getTemperatureAdvice = (temp?: number) => {
    if (temp === undefined) return "";

    if (temp < 0)
      return "🥶 Freezing! Layer up with heavy coats and insulated clothing.";
    if (temp < 10) return "❄️ Cold! Wear jackets, sweaters, and warm layers.";
    if (temp < 15)
      return "🧥 Cool! Lightweight jackets and long sleeves recommended.";
    if (temp < 20)
      return "😊 Mild! Light layers and comfortable clothing work well.";
    if (temp < 25) return "😄 Warm! T-shirts, shorts, and light clothing perfect.";
    if (temp < 30) return "☀️ Hot! Light fabrics, shorts, and breathable clothing.";
    return "🔥 Very hot! Wear minimal layers and light colors.";
  };

  return (
    <div className="min-h-screen bg-transparent animate-rise-in">
      <header className="sticky top-0 z-30 bg-background/55 backdrop-blur-md px-5 pt-8 pb-4 animate-rise-in [animation-delay:80ms]">
        <button
          onClick={() => navigate("/wardrobe")}
          className="flex items-center gap-1 text-sm text-muted-foreground font-body mb-3 hover:text-foreground transition-colors"
        >
          <ChevronLeft className="h-4 w-4" /> Back
        </button>

        <div className="flex items-center justify-between gap-3 mb-4">
          <div>
            <h1 className="font-display text-3xl font-semibold tracking-tight">
              Weather Recommender
            </h1>
            <p className="text-sm text-muted-foreground mt-1">
              AI-optimized outfits for your current weather
            </p>
          </div>
          {getWeatherIcon()}
        </div>

        {/* Weather Display Card */}
        {!weatherLoading && weather && !weatherError && (
          <div className="bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-950 dark:to-blue-900 rounded-lg p-4 mb-4">
            <div className="grid grid-cols-2 gap-4 mb-3">
              <div>
                <div className="text-2xl font-bold">{Math.round(weather.temp ?? 0)}°C</div>
                <div className="text-sm text-muted-foreground capitalize flex items-center gap-1">
                  {getWeatherEmoji(weather)}
                  {weather.condition}
                </div>
              </div>
              <div className="space-y-2 text-sm">
                <div className="flex items-center gap-2">
                  <Droplets className="h-4 w-4 text-blue-500" />
                  <span>Humidity: {weather.humidity}%</span>
                </div>
                <div className="flex items-center gap-2">
                  <Wind className="h-4 w-4 text-gray-500" />
                  <span>Wind: {weather.windSpeed} km/h</span>
                </div>
              </div>
            </div>

            {/* Temperature Advice */}
            <div className="bg-white/50 dark:bg-gray-900/50 rounded p-2 text-sm">
              {getTemperatureAdvice(weather.temp)}
            </div>
          </div>
        )}

        {/* Loading Weather */}
        {weatherLoading && (
          <Alert className="mb-4">
            <Loader className="h-4 w-4 animate-spin" />
            <AlertDescription>Fetching weather data...</AlertDescription>
          </Alert>
        )}

        {/* Weather Error */}
        {weatherError && (
          <Alert variant="destructive" className="mb-4">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              Could not fetch weather. Using mock data for recommendations.
            </AlertDescription>
          </Alert>
        )}

        {/* No Items Alert */}
        {allItems.length === 0 && !loading && (
          <Alert className="mb-4">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              Add items to your wardrobe to get weather-based recommendations.
            </AlertDescription>
          </Alert>
        )}
      </header>

      <main className="px-5 pb-8">
        {/* Loading State */}
        {loading && (
          <div className="flex flex-col items-center justify-center py-16">
            <Zap className="h-12 w-12 text-primary mb-3 animate-pulse" />
            <p className="text-muted-foreground">
              Analyzing your wardrobe for current weather...
            </p>
          </div>
        )}

        {/* Error State */}
        {error && (
          <Alert variant="destructive" className="mb-4">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {/* Results State */}
        {!loading && recommendations.length > 0 && (
          <div>
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-display text-xl font-semibold">
                Perfect for {weather?.condition}
              </h2>
              <span className="text-sm text-muted-foreground">
                {recommendations.length} outfit{recommendations.length !== 1 ? "s" : ""}
              </span>
            </div>
            <RecommendedOutfitsGrid recommendations={recommendations} />

            {/* Refresh Button */}
            <div className="flex justify-center mt-6">
              <Button
                onClick={() => refetch()}
                variant="outline"
                className="gap-2"
              >
                <Zap className="h-4 w-4" />
                Refresh Weather & Recommendations
              </Button>
            </div>
          </div>
        )}

        {/* No Results State */}
        {!loading && recommendations.length === 0 && allItems.length > 0 && (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <Cloud className="h-12 w-12 text-muted-foreground mb-3 opacity-50" />
            <p className="text-muted-foreground">
              No outfits match the current weather conditions.
            </p>
            <p className="text-sm text-muted-foreground mt-1">
              Try adding more varied items to your wardrobe.
            </p>
          </div>
        )}
      </main>
    </div>
  );
};

export default WeatherRecommendations;
