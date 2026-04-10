import type { Outfit } from "@/types/wardrobe";
import { Trash2 } from "lucide-react";

interface OutfitsGridProps {
  outfits: Outfit[];
  onDelete: (id: string) => void;
}

export function OutfitsGrid({ outfits, onDelete }: OutfitsGridProps) {
  if (outfits.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-24 text-center">
        <p className="font-display text-2xl text-muted-foreground mb-2">No outfits yet</p>
        <p className="text-sm text-muted-foreground">Tap the + button to create your first outfit</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-3 gap-1">
      {outfits.map((outfit, index) => (
        <div
          key={outfit.id}
          className="smooth-card group relative aspect-square rounded-lg bg-card overflow-hidden animate-fade-in border border-border"
          style={{ animationDelay: `${index * 55}ms` }}
        >
          {/* Outfit display */}
          <div className="h-full w-full flex items-center justify-center p-0.5 bg-card/50 transition-transform duration-300 group-hover:scale-[1.02]">
            <div className="relative h-full w-full">
              {/* Top */}
              {outfit.top && (
                <div className="absolute top-[4%] left-1/2 h-[44%] w-[78%] -translate-x-1/2 flex items-center justify-center">
                  <img
                    src={outfit.top.imageUrl}
                    alt="top"
                    className="h-full w-full object-contain"
                  />
                </div>
              )}

              {/* Bottom */}
              {outfit.bottom && (
                <div className="absolute top-[42%] left-1/2 h-[46%] w-[76%] -translate-x-1/2 flex items-center justify-center">
                  <img
                    src={outfit.bottom.imageUrl}
                    alt="bottom"
                    className="h-full w-full object-contain"
                  />
                </div>
              )}

              {/* Shoes */}
              {outfit.shoes && (
                <div className="absolute bottom-[-2%] left-1/2 h-[28%] w-[90%] -translate-x-1/2 flex items-center justify-center">
                  <img
                    src={outfit.shoes.imageUrl}
                    alt="shoes"
                    className="h-full w-full object-contain"
                  />
                </div>
              )}
            </div>
          </div>

          {/* Delete button */}
          <button
            onClick={() => onDelete(outfit.id)}
            className="absolute top-2 right-2 rounded-full bg-background/80 p-1.5 opacity-0 transition-opacity group-hover:opacity-100 hover:bg-destructive hover:text-primary-foreground"
            aria-label="Delete outfit"
          >
            <Trash2 className="h-4 w-4" />
          </button>

          {/* Item count */}
          <span className="absolute bottom-2 left-2 rounded-full bg-background/80 px-2.5 py-0.5 text-xs font-body font-medium text-foreground">
            {[outfit.top, outfit.bottom, outfit.shoes].filter(Boolean).length} items
          </span>
        </div>
      ))}
    </div>
  );
}
