import type { ClothingOccasion } from "@/types/wardrobe";
import { cn } from "@/lib/utils";
import { Briefcase, Zap, ShoppingBag, Heart, Users, Mountain } from "lucide-react";

const occasions: ClothingOccasion[] = ["All", "Casual", "Formal", "Athletic", "Work", "Party", "Outdoor", "Weekend"];

const occasionIcons: Record<ClothingOccasion, React.ReactNode> = {
  All: "◆",
  Casual: "👕",
  Formal: "🎩",
  Athletic: "⚽",
  Work: "💼",
  Party: "🎉",
  Weekend: "☀️",
  Outdoor: "🏔️",
};

interface OccasionFilterProps {
  active: ClothingOccasion;
  onSelect: (occasion: ClothingOccasion) => void;
}

export function OccasionFilter({ active, onSelect }: OccasionFilterProps) {
  return (
    <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-none">
      {occasions.map((occasion) => (
        <button
          key={occasion}
          onClick={() => onSelect(occasion)}
          className={cn(
            "shrink-0 rounded-full px-3 py-2 text-xs font-medium font-body transition-all flex items-center gap-1.5",
            occasion === active
              ? "bg-primary text-primary-foreground"
              : "bg-secondary text-muted-foreground hover:text-foreground"
          )}
          title={occasion}
        >
          <span className="text-sm">{occasionIcons[occasion]}</span>
          <span className="hidden sm:inline">{occasion}</span>
        </button>
      ))}
    </div>
  );
}
