import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Plus, ChevronLeft, Calendar, BarChart3, Sparkles, RotateCw } from "lucide-react";
import { FilterChips } from "@/components/FilterChips";
import { WardrobeGrid } from "@/components/WardrobeGrid";
import { OutfitsGrid } from "@/components/OutfitsGrid";
import { RecommendedOutfitsGrid } from "@/components/RecommendedOutfitsGrid";
import { OutfitCalendar } from "@/components/OutfitCalendar";
import { RecommendationsScheduler } from "@/components/RecommendationsScheduler";
import { StatisticsDisplay } from "@/components/StatisticsDisplay";
import { AddItemSheet } from "@/components/AddItemSheet";
import { OutfitBuilder } from "@/components/OutfitBuilder";
import { Button } from "@/components/ui/button";
import { useWardrobe } from "@/hooks/useWardrobe";
import { useWearStatistics } from "@/hooks/useWearStatistics";
import { createRecommendations } from "@/lib/recommendations";
import { cn } from "@/lib/utils";

const Index = () => {
  const { items, allItems, activeFilter, setActiveFilter, addItem, deleteItem, outfits, addOutfit, deleteOutfit, schedule, scheduleOutfit, removeSchedule, getOutfitForDate, markOutfitAsWorn, unmarkOutfitAsWorn, updateItemTag, updateItemCategory } = useWardrobe();
  const [sheetOpen, setSheetOpen] = useState(false);
  const [outfitBuilderOpen, setOutfitBuilderOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<"wardrobe" | "outfits" | "recommendations" | "calendar" | "statistics">("wardrobe");
  const [rerollSeed, setRerollSeed] = useState(0);
  const navigate = useNavigate();

  const recommendations = useMemo(() => createRecommendations(allItems, outfits, rerollSeed), [allItems, outfits, rerollSeed]);
  const stats = useWearStatistics(allItems, outfits, schedule);
  const hasData = stats.totalItemWears > 0 || stats.totalOutfitWears > 0;

  const handleReroll = () => {
    setRerollSeed((prev) => prev + 1);
  };

  return (
    <div className="min-h-screen bg-background animate-rise-in">
      <header className="sticky top-0 z-30 bg-background/95 backdrop-blur-sm px-5 pt-8 pb-4 animate-rise-in [animation-delay:80ms]">
        <button onClick={() => navigate("/")} className="flex items-center gap-1 text-sm text-muted-foreground font-body mb-3 hover:text-foreground transition-colors">
          <ChevronLeft className="h-4 w-4" /> Home
        </button>
        <div className="flex items-baseline justify-between mb-4">
          <h1 className="font-display text-3xl font-semibold tracking-tight">Wardrobe</h1>
          <span className="text-sm text-muted-foreground font-body">
            {activeTab === "wardrobe" ? allItems.length : outfits.length} {activeTab === "wardrobe" ? (allItems.length === 1 ? "item" : "items") : (outfits.length === 1 ? "outfit" : "outfits")}
          </span>
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
              "px-4 py-2 text-sm font-body font-medium border-b-2 transition-colors whitespace-nowrap",
              activeTab === "recommendations"
                ? "border-primary text-foreground"
                : "border-transparent text-muted-foreground hover:text-foreground"
            )}
          >
            Recommendations
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
          <FilterChips active={activeFilter} onSelect={setActiveFilter} />
        )}
      </header>

      <main key={activeTab} className="px-5 pb-24 animate-rise-in [animation-delay:120ms]">
        {activeTab === "wardrobe" ? (
          <WardrobeGrid items={items} onDelete={deleteItem} onUpdateTag={updateItemTag} onUpdateCategory={updateItemCategory} />
        ) : activeTab === "outfits" ? (
          <OutfitsGrid outfits={outfits} onDelete={deleteOutfit} />
        ) : activeTab === "recommendations" ? (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-sm text-muted-foreground font-body">
                  {recommendations.length} {recommendations.length === 1 ? "look" : "looks"} generated from your wardrobe
                </h2>
              </div>
              {recommendations.length > 0 && (
                <Button
                  onClick={handleReroll}
                  variant="ghost"
                  size="sm"
                  className="gap-1"
                  title="Generate new recommendations"
                >
                  <RotateCw className="h-4 w-4" />
                </Button>
              )}
            </div>
            <RecommendedOutfitsGrid recommendations={recommendations} />
          </div>
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
                recommendations={recommendations}
              />

              {recommendations.length > 0 && (
                <RecommendationsScheduler
                  recommendations={recommendations}
                  onScheduleOutfit={scheduleOutfit}
                />
              )}
            </div>
          )
        ) : activeTab === "statistics" ? (
          !hasData ? (
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
          ) : (
            <StatisticsDisplay stats={stats} />
          )
        ) : null}
      </main>

      {/* FAB */}
      {(activeTab === "wardrobe" || activeTab === "outfits") && (
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
