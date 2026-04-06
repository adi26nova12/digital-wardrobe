import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Plus, ChevronLeft } from "lucide-react";
import { FilterChips } from "@/components/FilterChips";
import { WardrobeGrid } from "@/components/WardrobeGrid";
import { OutfitsGrid } from "@/components/OutfitsGrid";
import { AddItemSheet } from "@/components/AddItemSheet";
import { OutfitBuilder } from "@/components/OutfitBuilder";
import { useWardrobe } from "@/hooks/useWardrobe";
import { cn } from "@/lib/utils";

const Index = () => {
  const { items, allItems, activeFilter, setActiveFilter, addItem, deleteItem, outfits, addOutfit, deleteOutfit } = useWardrobe();
  const [sheetOpen, setSheetOpen] = useState(false);
  const [outfitBuilderOpen, setOutfitBuilderOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<"wardrobe" | "outfits">("wardrobe");
  const navigate = useNavigate();

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
        <div className="flex gap-2 mb-4 border-b border-border animate-rise-in [animation-delay:140ms]">
          <button
            onClick={() => setActiveTab("wardrobe")}
            className={cn(
              "px-4 py-2 text-sm font-body font-medium border-b-2 transition-colors",
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
              "px-4 py-2 text-sm font-body font-medium border-b-2 transition-colors",
              activeTab === "outfits"
                ? "border-primary text-foreground"
                : "border-transparent text-muted-foreground hover:text-foreground"
            )}
          >
            Outfits
          </button>
          <button
            onClick={() => navigate("/recommendations")}
            className="px-4 py-2 text-sm font-body font-medium border-b-2 transition-colors border-transparent text-muted-foreground hover:text-foreground"
          >
            Recommendations
          </button>
        </div>

        {/* Filter Chips (only for wardrobe tab) */}
        {activeTab === "wardrobe" && (
          <FilterChips active={activeFilter} onSelect={setActiveFilter} />
        )}
      </header>

      <main key={activeTab} className="px-5 pb-24 animate-rise-in [animation-delay:120ms]">
        {activeTab === "wardrobe" ? (
          <WardrobeGrid items={items} onDelete={deleteItem} />
        ) : (
          <OutfitsGrid outfits={outfits} onDelete={deleteOutfit} />
        )}
      </main>

      {/* FAB */}
      <button
        onClick={() => activeTab === "wardrobe" ? setSheetOpen(true) : setOutfitBuilderOpen(true)}
        className="group fixed bottom-8 right-6 z-30 flex h-14 w-14 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-lg transition-transform hover:scale-105 active:scale-95 animate-rise-in [animation-delay:240ms]"
        aria-label={activeTab === "wardrobe" ? "Add clothing item" : "Create outfit"}
      >
        <Plus className="h-6 w-6 transition-transform duration-300 group-hover:rotate-90" />
      </button>

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
