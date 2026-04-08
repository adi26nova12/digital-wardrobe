import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { ChevronLeft, Sparkles, RotateCw } from "lucide-react";
import { RecommendedOutfitsGrid } from "@/components/RecommendedOutfitsGrid";
import { Button } from "@/components/ui/button";
import { useWardrobe } from "@/hooks/useWardrobe";
import type { Outfit, WardrobeItem } from "@/types/wardrobe";

function hasStableImage(item: WardrobeItem) {
  return Boolean(item.imageUrl) && !item.imageUrl.startsWith("blob:");
}

// Seeded random number generator for reproducible shuffling
function seededRandom(seed: number): number {
  const x = Math.sin(seed) * 10000;
  return x - Math.floor(x);
}

function createRecommendations(items: WardrobeItem[], savedOutfits: Outfit[], seed: number = 0): Outfit[] {
  const stableItems = items.filter(hasStableImage);
  const tops = stableItems.filter((item) => item.category === "Tops" || item.category === "Outerwear");
  const bottoms = stableItems.filter((item) => item.category === "Bottoms");
  const shoes = stableItems.filter((item) => item.category === "Shoes");

  if (tops.length === 0 || bottoms.length === 0 || shoes.length === 0) {
    return [];
  }

  const existingKeys = new Set(
    savedOutfits.map((outfit) => `${outfit.top?.id ?? ""}-${outfit.bottom?.id ?? ""}-${outfit.shoes?.id ?? ""}`),
  );

  const total = Math.min(8, tops.length * bottoms.length * shoes.length);
  const recommendations: Outfit[] = [];
  let cursor = 0;

  while (recommendations.length < total && cursor < total * 4) {
    const topIndex = Math.floor(seededRandom(seed + cursor) * tops.length);
    const bottomIndex = Math.floor(seededRandom(seed + cursor + 1000) * bottoms.length);
    const shoeIndex = Math.floor(seededRandom(seed + cursor + 2000) * shoes.length);

    const top = tops[topIndex];
    const bottom = bottoms[bottomIndex];
    const shoe = shoes[shoeIndex];
    const key = `${top.id}-${bottom.id}-${shoe.id}`;

    if (!existingKeys.has(key)) {
      recommendations.push({
        id: `rec-${top.id}-${bottom.id}-${shoe.id}`,
        top,
        bottom,
        shoes: shoe,
        createdAt: Date.now() - cursor,
      });
      existingKeys.add(key);
    }

    cursor += 1;
  }

  return recommendations;
}

const Recommendations = () => {
  const navigate = useNavigate();
  const { allItems, outfits } = useWardrobe();
  const [rerollSeed, setRerollSeed] = useState(0);

  const recommendations = useMemo(() => createRecommendations(allItems, outfits, rerollSeed), [allItems, outfits, rerollSeed]);

  const handleReroll = () => {
    setRerollSeed((prev) => prev + 1);
  };

  return (
    <div className="min-h-screen bg-background animate-rise-in">
      <header className="sticky top-0 z-30 bg-background/95 backdrop-blur-sm px-5 pt-8 pb-4 animate-rise-in [animation-delay:80ms]">
        <button onClick={() => navigate("/wardrobe")} className="flex items-center gap-1 text-sm text-muted-foreground font-body mb-3 hover:text-foreground transition-colors">
          <ChevronLeft className="h-4 w-4" /> Wardrobe
        </button>

        <div className="flex items-center justify-between gap-3 mb-1">
          <h1 className="font-display text-3xl font-semibold tracking-tight">Recommendations</h1>
          <div className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-muted-foreground" />
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
        </div>

        <p className="text-sm text-muted-foreground font-body">
          {recommendations.length} {recommendations.length === 1 ? "look" : "looks"} generated from your wardrobe
        </p>
      </header>

      <main className="px-5 pb-16 pt-2 animate-rise-in [animation-delay:120ms]">
        <RecommendedOutfitsGrid recommendations={recommendations} />
      </main>
    </div>
  );
};

export default Recommendations;
