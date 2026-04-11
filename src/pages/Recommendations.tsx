import { useEffect, useMemo, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { ChevronLeft, Sparkles, RotateCw, Cloud, Loader } from "lucide-react";
import { RecommendedOutfitsGrid } from "@/components/RecommendedOutfitsGrid";
import { OccasionFilter } from "@/components/OccasionFilter";
import { Button } from "@/components/ui/button";
import { useWardrobe } from "@/hooks/useWardrobe";
import { useWeather } from "@/hooks/useWeather";
import { createRecommendations } from "@/lib/recommendations";
import { formatWeather } from "@/lib/weatherService";
import type { RecommendationContext, Outfit, ClothingOccasion } from "@/types/wardrobe";

const Recommendations = () => {
  const navigate = useNavigate();
  const { allItems, outfits, addOutfit } = useWardrobe();
  const { weather } = useWeather();
  const [recommendations, setRecommendations] = useState<Outfit[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [activeOccasion, setActiveOccasion] = useState<ClothingOccasion>("All");

  // Memoize filtered items to prevent infinite loops
  const occasionFilteredItems = useMemo(
    () => {
      const filtered =
        activeOccasion === "All"
          ? allItems
          : allItems.filter((item) => item.occasion === activeOccasion);
      
      // Debug logging
      console.log(`📊 Occasion filter: ${activeOccasion}`);
      console.log(`   Total items: ${allItems.length}`);
      console.log(`   Filtered items: ${filtered.length}`);
      if (filtered.length > 0) {
        console.log(`   Sample items:`, filtered.slice(0, 3).map(item => `${item.tag}(${item.category})`).join(", "));
      }
      
      return filtered;
    },
    [allItems, activeOccasion],
  );

  // Memoize context to prevent infinite loops
  const context: RecommendationContext = useMemo(
    () => ({
      weather: weather ?? undefined,
      occasion: activeOccasion === "All" ? undefined : activeOccasion,
      userPreferences: {
        preferredStyles: ["casual"],
      },
    }),
    [weather, activeOccasion],
  );

  // Generate recommendations - with stable dependencies
  useEffect(() => {
    // Only generate if we have data
    if (occasionFilteredItems.length === 0) {
      console.log("ℹ️ No items for this occasion, waiting...");
      setRecommendations([]);
      setLoading(false);
      return;
    }

    let isMounted = true; // Prevent state updates after unmount

    const generateRecommendations = async () => {
      if (!isMounted) return;
      setLoading(true);
      setError(null);
      
      try {
        console.log("🚀 Starting recommendation generation with", occasionFilteredItems.length, "items for occasion:", activeOccasion);
        const results = await createRecommendations(occasionFilteredItems, outfits, context);
        if (isMounted) {
          console.log("✅ Recommendations generated:", results.length);
          setRecommendations(results);
        }
      } catch (err) {
        if (isMounted) {
          console.error("Failed to generate recommendations:", err);
          setError(err instanceof Error ? err.message : "Failed to generate recommendations");
          setRecommendations([]);
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    generateRecommendations();

    return () => {
      isMounted = false; // Cleanup on unmount
    };
  }, [activeOccasion, occasionFilteredItems.length, outfits.length]);

  return (
    <div className="min-h-screen bg-transparent animate-rise-in">
      <header className="sticky top-0 z-30 bg-background/55 backdrop-blur-md px-5 pt-8 pb-4 animate-rise-in [animation-delay:80ms]">
        <button onClick={() => navigate("/wardrobe")} className="flex items-center gap-1 text-sm text-muted-foreground font-body mb-3 hover:text-foreground transition-colors">
          <ChevronLeft className="h-4 w-4" /> Wardrobe
        </button>

        <div className="flex items-center justify-between gap-3 mb-1">
          <h1 className="font-display text-3xl font-semibold tracking-tight">Recommendations</h1>
          <div className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-muted-foreground" />
            {!loading && recommendations.length > 0 && (
              <Button
                onClick={() => window.location.reload()}
                variant="ghost"
                size="sm"
                className="gap-1"
                title="Regenerate recommendations"
              >
                <RotateCw className="h-4 w-4" />
              </Button>
            )}
          </div>
        </div>

        <div className="flex flex-col gap-3">
          {/* Occasion Filter */}
          <div>
            <p className="text-xs text-muted-foreground mb-2 font-body">Filter by Occasion</p>
            <OccasionFilter active={activeOccasion} onSelect={setActiveOccasion} />
          </div>

          {loading ? (
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Loader className="h-4 w-4 animate-spin" />
              <span>Analyzing{activeOccasion !== "All" ? " " + activeOccasion.toLowerCase() : ""} outfits with AI...</span>
            </div>
          ) : error ? (
            <div className="flex items-center gap-2 text-sm text-red-500">
              <Sparkles className="h-4 w-4" />
              <span>{error}</span>
            </div>
          ) : (
            <p className="text-sm text-muted-foreground font-body">
              {recommendations.length} {recommendations.length === 1 ? "look" : "looks"} {activeOccasion !== "All" ? "for " + activeOccasion.toLowerCase() + " " : ""}generated
            </p>
          )}

          {/* Weather Display */}
          {weather && (
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Cloud className="h-4 w-4" />
              <span>{formatWeather(weather)}</span>
            </div>
          )}
        </div>
      </header>

      <main className="px-5 pb-16 pt-2 animate-rise-in [animation-delay:120ms]">
        <div className="space-y-8">
          {/* No Items State */}
          {occasionFilteredItems.length === 0 && (
            <div className="rounded-lg border border-blue-200 bg-blue-50 p-6 text-center">
              <p className="text-sm text-blue-900 font-medium">{activeOccasion === "All" ? "Add items to your wardrobe" : `No ${activeOccasion.toLowerCase()} items found`} to get recommendations</p>
              <Button
                onClick={() => navigate("/wardrobe")}
                className="mt-4"
              >
                Go to Wardrobe
              </Button>
            </div>
          )}

          {/* Loading State */}
          {occasionFilteredItems.length > 0 && loading && (
            <div className="flex flex-col items-center justify-center py-16 gap-4">
              <Loader className="h-8 w-8 animate-spin text-muted-foreground" />
              <div className="text-center">
                <p className="text-sm text-muted-foreground">Analyzing your wardrobe with AI...</p>
                <p className="text-xs text-muted-foreground/60 mt-2">Classifying clothing items (Step 1/3)</p>
              </div>
            </div>
          )}

          {/* Error State */}
          {error && !loading && (
            <div className="rounded-lg border border-red-200 bg-red-50 p-4">
              <p className="text-sm text-red-800">{error}</p>
              <p className="text-xs text-red-600 mt-2">Try refreshing or adding more items to your wardrobe.</p>
            </div>
          )}

          {/* Suggested Outfits */}
          {occasionFilteredItems.length > 0 && !loading && !error && (
            <div>
              <h2 className="text-lg font-semibold font-display mb-4 flex items-center gap-2">
                <Sparkles className="h-5 w-5" />
                Suggested Outfits
              </h2>
              {recommendations.length > 0 ? (
                <RecommendedOutfitsGrid recommendations={recommendations} onAdd={addOutfit} />
              ) : (
                <div className="text-center py-8">
                  <p className="text-sm text-muted-foreground">No recommendations available.</p>
                  <p className="text-xs text-muted-foreground/60 mt-2">Try adding more items to your wardrobe.</p>
                </div>
              )}
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default Recommendations;
