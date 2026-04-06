import type { Outfit } from "@/types/wardrobe";

interface RecommendedOutfitsGridProps {
  recommendations: Outfit[];
}

export function RecommendedOutfitsGrid({ recommendations }: RecommendedOutfitsGridProps) {
  if (recommendations.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-24 text-center">
        <p className="font-display text-2xl text-muted-foreground mb-2">Not enough items yet</p>
        <p className="text-sm text-muted-foreground">Add tops, bottoms, and shoes to unlock recommendations</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 gap-3">
      {recommendations.map((outfit, index) => (
        <div
          key={outfit.id}
          className="group relative aspect-square rounded-lg bg-card overflow-hidden animate-fade-in border border-border transition-transform duration-300 hover:-translate-y-1"
          style={{ animationDelay: `${index * 55}ms` }}
        >
          <div className="h-full w-full flex items-center justify-center p-3 bg-card/50 transition-transform duration-300 group-hover:scale-[1.02]">
            <div className="relative h-full w-full">
              {outfit.top && (
                <div className="absolute top-[4%] left-1/2 h-[44%] w-[78%] -translate-x-1/2 flex items-center justify-center">
                  <img
                    src={outfit.top.imageUrl}
                    alt="top"
                    className="h-full w-full object-contain"
                  />
                </div>
              )}

              {outfit.bottom && (
                <div className="absolute top-[42%] left-1/2 h-[46%] w-[76%] -translate-x-1/2 flex items-center justify-center">
                  <img
                    src={outfit.bottom.imageUrl}
                    alt="bottom"
                    className="h-full w-full object-contain"
                  />
                </div>
              )}

              {outfit.shoes && (
                <div className="absolute bottom-[2%] left-1/2 h-[18%] w-[86%] -translate-x-1/2 flex items-center justify-center">
                  <img
                    src={outfit.shoes.imageUrl}
                    alt="shoes"
                    className="h-full w-full object-contain"
                  />
                </div>
              )}
            </div>
          </div>

          <span className="absolute top-2 left-2 rounded-full bg-primary/90 px-2.5 py-0.5 text-xs font-body font-medium text-primary-foreground">
            Suggested
          </span>
        </div>
      ))}
    </div>
  );
}
