import type { Outfit } from "@/types/wardrobe";
import { Plus, Loader } from "lucide-react";
import { useState } from "react";

interface RecommendedOutfitsGridProps {
  recommendations: Outfit[];
  onAdd?: (outfit: Omit<Outfit, "id" | "createdAt">) => Promise<void>;
  onOutfitAdded?: (outfitId: string) => void;
}

export function RecommendedOutfitsGrid({ recommendations, onAdd, onOutfitAdded }: RecommendedOutfitsGridProps) {
  const [addingId, setAddingId] = useState<string | null>(null);
  if (recommendations.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-24 text-center">
        <p className="font-display text-2xl text-muted-foreground mb-2">Not enough items yet</p>
        <p className="text-sm text-muted-foreground">Add tops, bottoms, and shoes to unlock recommendations</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-3 gap-1">
      {recommendations.map((outfit, index) => (
        <div
          key={outfit.id}
          className="smooth-card group relative aspect-square rounded-lg bg-gradient-to-br from-background to-background/80 overflow-hidden animate-fade-in border border-border/50"
          style={{ animationDelay: `${index * 55}ms` }}
        >
          <div className="h-full w-full flex items-center justify-center p-0.5 bg-background/40 backdrop-blur-sm transition-all duration-300 group-hover:bg-background/20 group-hover:scale-[1.02]">
            <div className="relative h-full w-full flex items-center justify-center">
              {outfit.top && (
                <div className="absolute top-[4%] left-1/2 h-[44%] w-[78%] -translate-x-1/2 flex items-center justify-center z-30">
                  <img
                    src={outfit.top.imageUrl}
                    alt="top"
                    className="h-full w-full object-contain drop-shadow-lg"
                    loading="eager"
                  />
                </div>
              )}

              {outfit.bottom && (
                <div className="absolute top-[42%] left-1/2 h-[46%] w-[76%] -translate-x-1/2 flex items-center justify-center z-20">
                  <img
                    src={outfit.bottom.imageUrl}
                    alt="bottom"
                    className="h-full w-full object-contain drop-shadow-lg"
                    loading="eager"
                  />
                </div>
              )}

              {outfit.shoes && (
                <div className="absolute bottom-[-2%] left-1/2 h-[28%] w-[90%] -translate-x-1/2 flex items-center justify-center z-10">
                  <img
                    src={outfit.shoes.imageUrl}
                    alt="shoes"
                    className="h-full w-full object-contain drop-shadow-lg"
                    loading="eager"
                  />
                </div>
              )}
            </div>
          </div>

          <span className="absolute top-2 left-2 rounded-full bg-pink-500/90 px-2.5 py-0.5 text-xs font-body font-medium text-white z-40 shadow-lg">
            Suggested
          </span>

          {onAdd && (
            <button
              onClick={async () => {
                setAddingId(outfit.id);
                try {
                  await onAdd({ top: outfit.top, bottom: outfit.bottom, shoes: outfit.shoes });
                  onOutfitAdded?.(outfit.id);
                } finally {
                  setAddingId(null);
                }
              }}
              disabled={addingId === outfit.id}
              className="absolute top-2 right-2 rounded-full bg-white/90 backdrop-blur-sm p-1.5 opacity-0 transition-opacity group-hover:opacity-100 hover:bg-white hover:text-primary disabled:opacity-100 disabled:bg-primary disabled:text-white shadow-lg z-40"
              aria-label="Add outfit"
            >
              {addingId === outfit.id ? (
                <Loader className="h-4 w-4 animate-spin" />
              ) : (
                <Plus className="h-4 w-4" />
              )}
            </button>
          )}
        </div>
      ))}
    </div>
  );
}
