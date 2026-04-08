import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { ChevronLeft, Sparkles, RotateCw } from "lucide-react";
import { RecommendedOutfitsGrid } from "@/components/RecommendedOutfitsGrid";
import { Button } from "@/components/ui/button";
import { useWardrobe } from "@/hooks/useWardrobe";
import { createRecommendations } from "@/lib/recommendations";
import type { Outfit, WardrobeItem } from "@/types/wardrobe";

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
