import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Plus, ChevronLeft, Calendar, BarChart3, Sparkles, Cloud, Loader, Zap } from "lucide-react";
import { FilterChips } from "@/components/FilterChips";
import { OccasionFilter } from "@/components/OccasionFilter";
import { WardrobeGrid } from "@/components/WardrobeGrid";
import { OutfitsGrid } from "@/components/OutfitsGrid";
import { OutfitCalendar } from "@/components/OutfitCalendar";
import { RecommendationsScheduler } from "@/components/RecommendationsScheduler";
import { RecommendedOutfitsGrid } from "@/components/RecommendedOutfitsGrid";
import { StatisticsDisplay } from "@/components/StatisticsDisplay";
import { AddItemSheet } from "@/components/AddItemSheet";
import { OutfitBuilder } from "@/components/OutfitBuilder";
import { Button } from "@/components/ui/button";
import { useWardrobe } from "@/hooks/useWardrobe";
import { useWearStatistics } from "@/hooks/useWearStatistics";
import { createRecommendations } from "@/lib/recommendations";
import { cn } from "@/lib/utils";
import type { Outfit, ClothingOccasion } from "@/types/wardrobe";

const Index = () => {
  const { items, allItems, activeFilter, setActiveFilter, addItem, deleteItem, outfits, addOutfit, deleteOutfit, schedule, scheduleOutfit, removeSchedule, getOutfitForDate, markOutfitAsWorn, unmarkOutfitAsWorn, updateItemTag, updateItemCategory, updateItemOccasion } = useWardrobe();
  const stats = useWearStatistics(allItems, outfits, schedule);
  const [sheetOpen, setSheetOpen] = useState(false);
  const [outfitBuilderOpen, setOutfitBuilderOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<"wardrobe" | "outfits" | "recommendations" | "calendar" | "statistics">("wardrobe");
  
  // Initialize occasion filter from localStorage
  const [activeOccasionFilter, setActiveOccasionFilterState] = useState<ClothingOccasion>(() => {
    try {
      const saved = localStorage.getItem("activeOccasionFilter");
      return (saved as ClothingOccasion) || "All";
    } catch {
      return "All";
    }
  });

  // Wrapper to persist occasion filter to localStorage
  const setActiveOccasionFilter = (occasion: ClothingOccasion) => {
    setActiveOccasionFilterState(occasion);
    try {
      localStorage.setItem("activeOccasionFilter", occasion);
      console.log(`✓ Occasion filter saved: ${occasion}`);
    } catch (error) {
      console.error("Failed to save occasion filter:", error);
    }
  };

  const [recommendations, setRecommendations] = useState<Outfit[]>([]);
  const [recLoading, setRecLoading] = useState(false);
  const [recError, setRecError] = useState<string | null>(null);
  const [recType, setRecType] = useState<"random" | "ai">("random");
  const navigate = useNavigate();
  const hasData = stats.totalItemWears > 0 || stats.totalOutfitWears > 0;

  // Filter items by category AND occasion
  const categoryFilteredItems = 
    activeFilter === "All" 
      ? allItems 
      : allItems.filter((item) => item.category === activeFilter);
  
  const occasionFilteredItems = 
    activeOccasionFilter === "All" 
      ? categoryFilteredItems 
      : categoryFilteredItems.filter((item) => item.occasion === activeOccasionFilter);

  // Debug logging
  useEffect(() => {
    if (activeTab === "wardrobe") {
      console.log("🔍 Wardrobe Filter Debug:");
      console.log(`  Category filter: ${activeFilter}`);
      console.log(`  Occasion filter: ${activeOccasionFilter}`);
      console.log(`  Total items: ${allItems.length}`);
      console.log(`  Category filtered: ${categoryFilteredItems.length}`);
      console.log(`  Final (occasion filtered): ${occasionFilteredItems.length}`);
      if (occasionFilteredItems.length > 0) {
        console.log(`  Sample item occasions:`, occasionFilteredItems.slice(0, 3).map(i => `${i.tag}(${i.occasion})`));
      }
    }
  }, [activeFilter, activeOccasionFilter, activeTab, allItems.length, categoryFilteredItems.length, occasionFilteredItems.length]);

  // Helper function to generate a single random outfit
  const generateSingleOutfit = (): Outfit | null => {
    const itemsWithImages = allItems.filter((item) => item.imageUrl);
    if (itemsWithImages.length === 0) return null;

    const tops = itemsWithImages.filter((item) => item.category?.toLowerCase() === "tops");
    const bottoms = itemsWithImages.filter((item) => item.category?.toLowerCase() === "bottoms");
    const shoes = itemsWithImages.filter((item) => item.category?.toLowerCase() === "shoes");
    const outerwear = itemsWithImages.filter((item) => item.category?.toLowerCase() === "outerwear");
    const allTops = [...tops, ...outerwear];

    const randomTop = allTops.length > 0 ? allTops[Math.floor(Math.random() * allTops.length)] : undefined;
    const randomBottom = bottoms.length > 0 ? bottoms[Math.floor(Math.random() * bottoms.length)] : undefined;
    const randomShoe = shoes.length > 0 ? shoes[Math.floor(Math.random() * shoes.length)] : undefined;

    if (randomTop || randomBottom || randomShoe) {
      return {
        id: `random-${Date.now()}-${Math.random()}`,
        top: randomTop,
        bottom: randomBottom,
        shoes: randomShoe,
        createdAt: new Date(),
      };
    }
    return null;
  };

  // Handler for when an outfit is added
  const handleOutfitAdded = (outfitId: string) => {
    // Remove the added outfit and generate a new one based on type
    setRecommendations((prev) => {
      const filtered = prev.filter((o) => o.id !== outfitId);
      
      if (recType === "ai") {
        // For AI, let the useEffect regenerate everything
        return filtered;
      } else {
        // For random, generate a new random outfit
        const newOutfit = generateSingleOutfit();
        return newOutfit ? [...filtered, newOutfit] : filtered;
      }
    });
  };

  // Generate recommendations when tab is opened or recType changes
  useEffect(() => {
    if (activeTab !== "recommendations") return;

    const itemsWithImages = allItems.filter((item) => item.imageUrl);
    
    if (itemsWithImages.length === 0) {
      setRecommendations([]);
      setRecLoading(false);
      return;
    }

    setRecLoading(true);
    setRecError(null);

    const generateRecommendations = async () => {
      try {
        if (recType === "ai") {
          // Use AI-based recommendations from ML pipeline
          const aiRecs = await createRecommendations(allItems, outfits, {});
          setRecommendations(aiRecs);
        } else {
          // Generate random outfit combinations
          const tops = itemsWithImages.filter((item) => item.category?.toLowerCase() === "tops");
          const bottoms = itemsWithImages.filter((item) => item.category?.toLowerCase() === "bottoms");
          const shoes = itemsWithImages.filter((item) => item.category?.toLowerCase() === "shoes");
          const outerwear = itemsWithImages.filter((item) => item.category?.toLowerCase() === "outerwear");

          // Add outerwear to tops as an alternative
          const allTops = [...tops, ...outerwear];

          // Generate 8 random outfit combinations with flexible category matching
          const randomOutfits: Outfit[] = [];
          for (let i = 0; i < 8; i++) {
            const randomTop = allTops.length > 0 ? allTops[Math.floor(Math.random() * allTops.length)] : undefined;
            const randomBottom = bottoms.length > 0 ? bottoms[Math.floor(Math.random() * bottoms.length)] : undefined;
            const randomShoe = shoes.length > 0 ? shoes[Math.floor(Math.random() * shoes.length)] : undefined;

            // Only add outfit if it has at least one item
            if (randomTop || randomBottom || randomShoe) {
              randomOutfits.push({
                id: `random-${i}-${Date.now()}`,
                top: randomTop,
                bottom: randomBottom,
                shoes: randomShoe,
                createdAt: new Date(),
              });
            }
          }

          setRecommendations(randomOutfits);
        }
      } catch (err) {
        console.error("Failed to generate recommendations:", err);
        setRecError(err instanceof Error ? err.message : "Failed to generate recommendations");
        setRecommendations([]);
      } finally {
        setRecLoading(false);
      }
    };

    generateRecommendations();
  }, [activeTab, allItems, recType, outfits]);

  return (
    <div className="min-h-screen bg-transparent animate-rise-in">
      <header className="sticky top-0 z-30 bg-background/55 backdrop-blur-md px-5 pt-8 pb-4 animate-rise-in [animation-delay:80ms]">
        <button onClick={() => navigate("/")} className="flex items-center gap-1 text-sm text-muted-foreground font-body mb-3 hover:text-foreground transition-colors">
          <ChevronLeft className="h-4 w-4" /> Home
        </button>
        <div className="flex items-baseline justify-between mb-4">
          <h1 className="font-display text-3xl font-semibold tracking-tight">Wardrobe</h1>
          <div className="flex items-center gap-2">
            <Button
              onClick={() => navigate("/recommendations")}
              variant="outline"
              size="sm"
              className="gap-2"
              title="View AI-powered recommendations"
            >
              <Sparkles className="h-4 w-4" />
              AI based recommendation
            </Button>
            <Button
              onClick={() => navigate("/weather-recommendations")}
              variant="outline"
              size="sm"
              className="gap-2"
              title="View weather-based outfit recommendations"
            >
              <Cloud className="h-4 w-4" />
              Weather
            </Button>
            <span className="text-sm text-muted-foreground font-body">
              {activeTab === "wardrobe" ? occasionFilteredItems.length : activeTab === "recommendations" ? recommendations.length : outfits.length} {activeTab === "wardrobe" ? (occasionFilteredItems.length === 1 ? "item" : "items") : activeTab === "recommendations" ? (recommendations.length === 1 ? "outfit" : "outfits") : (outfits.length === 1 ? "outfit" : "outfits")}
            </span>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-2 mb-4 border-b border-border animate-rise-in [animation-delay:140ms] overflow-x-auto">
          <button
            onClick={() => setActiveTab("wardrobe")}
            className={cn(
              "px-4 py-2 text-sm font-body font-medium border-b-2 transition-colors whitespace-nowrap",
              activeTab === "wardrobe"
                ? "border-primary text-foreground"
                : "border-transparent text-muted-foreground hover:text-foreground"
            )}
          >
            Wardrobe
          </button>
          <button
            onClick={() => setActiveTab("outfits")}
            className={cn(
              "px-4 py-2 text-sm font-body font-medium border-b-2 transition-colors whitespace-nowrap",
              activeTab === "outfits"
                ? "border-primary text-foreground"
                : "border-transparent text-muted-foreground hover:text-foreground"
            )}
          >
            Outfits
          </button>
          <button
            onClick={() => setActiveTab("recommendations")}
            className={cn(
              "px-4 py-2 text-sm font-body font-medium border-b-2 transition-colors whitespace-nowrap flex items-center gap-1",
              activeTab === "recommendations"
                ? "border-primary text-foreground"
                : "border-transparent text-muted-foreground hover:text-foreground"
            )}
          >
            <Sparkles className="h-4 w-4" />
            AI based recommendation
          </button>
          <button
            onClick={() => setActiveTab("calendar")}
            className={cn(
              "px-4 py-2 text-sm font-body font-medium border-b-2 transition-colors whitespace-nowrap flex items-center gap-1",
              activeTab === "calendar"
                ? "border-primary text-foreground"
                : "border-transparent text-muted-foreground hover:text-foreground"
            )}
          >
            <Calendar className="h-4 w-4" />
            Calendar
          </button>
          <button
            onClick={() => setActiveTab("statistics")}
            className={cn(
              "px-4 py-2 text-sm font-body font-medium border-b-2 transition-colors whitespace-nowrap flex items-center gap-1",
              activeTab === "statistics"
                ? "border-primary text-foreground"
                : "border-transparent text-muted-foreground hover:text-foreground"
            )}
          >
            <BarChart3 className="h-4 w-4" />
            Stats
          </button>
        </div>

        {/* Filter Chips (only for wardrobe tab) */}
        {activeTab === "wardrobe" && (
          <>
            <FilterChips active={activeFilter} onSelect={setActiveFilter} />
            <div className="mt-3">
              <p className="text-xs text-muted-foreground mb-2 font-body">Sort by Occasion (AI Detected)</p>
              <OccasionFilter active={activeOccasionFilter} onSelect={setActiveOccasionFilter} />
            </div>
          </>
        )}
      </header>

      <main key={activeTab} className="px-5 pb-24 animate-rise-in [animation-delay:120ms]">
        {activeTab === "wardrobe" ? (
          <WardrobeGrid items={occasionFilteredItems} onDelete={deleteItem} onUpdateTag={updateItemTag} onUpdateCategory={updateItemCategory} onUpdateOccasion={updateItemOccasion} />
        ) : activeTab === "outfits" ? (
          <OutfitsGrid outfits={outfits} onDelete={deleteOutfit} />
        ) : activeTab === "recommendations" ? (
          allItems.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-24 text-center">
              <p className="font-display text-2xl text-muted-foreground mb-2">No items yet</p>
              <p className="text-sm text-muted-foreground">Add items to your wardrobe to get recommendations</p>
            </div>
          ) : recLoading ? (
            <div className="flex flex-col items-center justify-center py-24">
              <Zap className="h-12 w-12 text-primary mb-3 animate-pulse" />
              <p className="text-muted-foreground">
                {recType === "ai" ? "Analyzing with AI..." : "Generating outfits..."}
              </p>
            </div>
          ) : recError ? (
            <div className="flex flex-col items-center justify-center py-24 text-center">
              <p className="font-display text-2xl text-muted-foreground mb-2">Error</p>
              <p className="text-sm text-destructive">{recError}</p>
            </div>
          ) : recommendations.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-24 text-center">
              <p className="font-display text-2xl text-muted-foreground mb-2">No outfits generated</p>
              <p className="text-sm text-muted-foreground">Try adding more items to your wardrobe</p>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h2 className="font-display text-lg font-semibold">Suggested Outfits</h2>
                  <p className="text-xs text-muted-foreground mt-1">{recType === "random" ? "Random combinations" : "AI powered"}</p>
                </div>
                <div className="flex gap-1">
                  <Button
                    onClick={() => setRecType("random")}
                    variant={recType === "random" ? "default" : "outline"}
                    size="sm"
                    className="text-xs"
                  >
                    Random
                  </Button>
                  <Button
                    onClick={() => setRecType("ai")}
                    variant={recType === "ai" ? "default" : "outline"}
                    size="sm"
                    className="text-xs gap-1"
                  >
                    <Sparkles className="h-3 w-3" />
                    AI
                  </Button>
                </div>
              </div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-muted-foreground">{recommendations.length} outfit{recommendations.length !== 1 ? "s" : ""}</span>
                <Button
                  onClick={() => {
                    // Trigger regeneration by re-running the effect
                    setRecLoading(true);
                    setTimeout(() => {
                      if (recType === "ai") {
                        // Regenerate AI recommendations
                        createRecommendations(allItems, outfits, {}).then((aiRecs) => {
                          setRecommendations(aiRecs);
                          setRecLoading(false);
                        });
                      } else {
                        // Regenerate random recommendations
                        const itemsWithImages = allItems.filter((item) => item.imageUrl);
                        const tops = itemsWithImages.filter((item) => item.category?.toLowerCase() === "tops");
                        const bottoms = itemsWithImages.filter((item) => item.category?.toLowerCase() === "bottoms");
                        const shoes = itemsWithImages.filter((item) => item.category?.toLowerCase() === "shoes");
                        const outerwear = itemsWithImages.filter((item) => item.category?.toLowerCase() === "outerwear");
                        const allTops = [...tops, ...outerwear];
                        const randomOutfits: Outfit[] = [];
                        for (let i = 0; i < 8; i++) {
                          const randomTop = allTops.length > 0 ? allTops[Math.floor(Math.random() * allTops.length)] : undefined;
                          const randomBottom = bottoms.length > 0 ? bottoms[Math.floor(Math.random() * bottoms.length)] : undefined;
                          const randomShoe = shoes.length > 0 ? shoes[Math.floor(Math.random() * shoes.length)] : undefined;
                          if (randomTop || randomBottom || randomShoe) {
                            randomOutfits.push({
                              id: `random-${i}-${Date.now()}`,
                              top: randomTop,
                              bottom: randomBottom,
                              shoes: randomShoe,
                              createdAt: new Date(),
                            });
                          }
                        }
                        setRecommendations(randomOutfits);
                        setRecLoading(false);
                      }
                    }, 300);
                  }}
                  variant="outline"
                  size="sm"
                  className="gap-2"
                >
                  <Sparkles className="h-4 w-4" />
                  Shuffle
                </Button>
              </div>
              <RecommendedOutfitsGrid recommendations={recommendations} onAdd={addOutfit} onOutfitAdded={handleOutfitAdded} />
            </div>
          )
        ) : activeTab === "calendar" ? (
          outfits.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-24 text-center">
              <p className="font-display text-2xl text-muted-foreground mb-2">No outfits yet</p>
              <p className="text-sm text-muted-foreground mb-6">Create some outfits in your wardrobe to schedule them</p>
              <button
                onClick={() => setActiveTab("outfits")}
                className="px-4 py-2 rounded-md bg-primary text-primary-foreground hover:bg-primary/90 transition-colors text-sm font-medium"
              >
                Go to Outfits
              </button>
            </div>
          ) : (
            <div className="space-y-8">
              <OutfitCalendar
                outfits={outfits}
                schedule={schedule}
                onScheduleOutfit={scheduleOutfit}
                onRemoveSchedule={removeSchedule}
                getOutfitForDate={getOutfitForDate}
                onMarkAsWorn={markOutfitAsWorn}
                onUnmarkAsWorn={unmarkOutfitAsWorn}
                recommendations={[]}
              />
            </div>
          )
        ) : activeTab === "statistics" ? (
          <div className="space-y-8">
            {hasData ? (
              <StatisticsDisplay stats={stats} allItems={allItems} />
            ) : (
              <div className="flex flex-col items-center justify-center py-24 text-center">
                <p className="font-display text-2xl text-muted-foreground mb-2">No wear data yet</p>
                <p className="text-sm text-muted-foreground mb-6">
                  Start scheduling and marking outfits as worn to see statistics
                </p>
                <button
                  onClick={() => setActiveTab("calendar")}
                  className="px-4 py-2 rounded-md bg-primary text-primary-foreground hover:bg-primary/90 transition-colors text-sm font-medium"
                >
                  Go to Calendar
                </button>
              </div>
            )}
          </div>
        ) : null}
      </main>

      {/* FAB */}
      {(activeTab === "wardrobe" || activeTab === "outfits" || activeTab === "recommendations") && (
        <button
          onClick={() => activeTab === "wardrobe" ? setSheetOpen(true) : setOutfitBuilderOpen(true)}
          className="group fixed bottom-8 right-6 z-30 flex h-14 w-14 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-lg transition-transform hover:scale-105 active:scale-95 animate-rise-in [animation-delay:240ms]"
          aria-label={activeTab === "wardrobe" ? "Add clothing item" : "Create outfit"}
        >
          <Plus className="h-6 w-6 transition-transform duration-300 group-hover:rotate-90" />
        </button>
      )}

      <AddItemSheet
        open={sheetOpen}
        onClose={() => setSheetOpen(false)}
        onAdd={addItem}
      />

      <OutfitBuilder
        items={allItems}
        open={outfitBuilderOpen}
        onClose={() => setOutfitBuilderOpen(false)}
        onAdd={addOutfit}
      />
    </div>
  );
};

export default Index;
