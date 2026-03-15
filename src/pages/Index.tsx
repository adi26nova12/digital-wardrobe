import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Plus, ChevronLeft } from "lucide-react";
import { FilterChips } from "@/components/FilterChips";
import { WardrobeGrid } from "@/components/WardrobeGrid";
import { AddItemSheet } from "@/components/AddItemSheet";
import { useWardrobe } from "@/hooks/useWardrobe";

const Index = () => {
  const { items, allItems, activeFilter, setActiveFilter, addItem, deleteItem } = useWardrobe();
  const [sheetOpen, setSheetOpen] = useState(false);
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-30 bg-background/95 backdrop-blur-sm px-5 pt-8 pb-4">
        <button onClick={() => navigate("/")} className="flex items-center gap-1 text-sm text-muted-foreground font-body mb-3 hover:text-foreground transition-colors">
          <ChevronLeft className="h-4 w-4" /> Home
        </button>
        <div className="flex items-baseline justify-between mb-4">
          <h1 className="font-display text-3xl font-semibold tracking-tight">Wardrobe</h1>
          <span className="text-sm text-muted-foreground font-body">
            {allItems.length} {allItems.length === 1 ? "item" : "items"}
          </span>
        </div>
        <FilterChips active={activeFilter} onSelect={setActiveFilter} />
      </header>

      <main className="px-5 pb-24">
        <WardrobeGrid items={items} onDelete={deleteItem} />
      </main>

      {/* FAB */}
      <button
        onClick={() => setSheetOpen(true)}
        className="fixed bottom-8 right-6 z-30 flex h-14 w-14 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-lg transition-transform hover:scale-105 active:scale-95"
        aria-label="Add clothing item"
      >
        <Plus className="h-6 w-6" />
      </button>

      <AddItemSheet
        open={sheetOpen}
        onClose={() => setSheetOpen(false)}
        onAdd={addItem}
      />
    </div>
  );
};

export default Index;
