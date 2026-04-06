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
    <div className="grid grid-cols-2 gap-3">
      {outfits.map((outfit, index) => (
        <div
          key={outfit.id}
<<<<<<< HEAD
          className="group relative aspect-square rounded-lg bg-card overflow-hidden animate-fade-in border border-border transition-transform duration-300 hover:-translate-y-1"
          style={{ animationDelay: `${index * 55}ms` }}
        >
          {/* Outfit display */}
          <div className="h-full w-full flex items-center justify-center p-4 bg-card/50 transition-transform duration-300 group-hover:scale-[1.02]">
            <div className="relative w-full h-full flex flex-col items-center justify-center gap-1">
=======
          className="group relative aspect-square rounded-lg bg-gradient-to-b from-secondary/30 to-secondary/10 overflow-hidden animate-fade-in border border-border"
        >
          {/* Outfit display */}
          <div className="h-full w-full flex items-center justify-center p-4 bg-card/50">
            <div className="relative w-full h-full flex flex-col items-center justify-start gap-0">
>>>>>>> 054d590 (sizing of outfits)
              {/* Top */}
              {outfit.top && (
                <div className="flex items-start justify-center pt-1" style={{ flex: "0 0 30%" }}>
                  <img
                    src={outfit.top.imageUrl}
                    alt="top"
                    className="h-full w-auto max-w-[75%] object-contain"
                  />
                </div>
              )}

              {/* Bottom */}
              {outfit.bottom && (
                <div className="flex items-center justify-center -mt-2" style={{ flex: "0 0 45%" }}>
                  <img
                    src={outfit.bottom.imageUrl}
                    alt="bottom"
                    className="h-full w-auto max-w-[80%] object-contain"
                  />
                </div>
              )}

              {/* Shoes */}
              {outfit.shoes && (
                <div className="flex items-end justify-center -mt-1" style={{ flex: "0 0 25%" }}>
                  <img
                    src={outfit.shoes.imageUrl}
                    alt="shoes"
                    className="h-full w-auto max-w-[85%] object-contain"
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
