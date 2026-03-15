import type { ClothingCategory } from "@/types/wardrobe";
import { cn } from "@/lib/utils";

const categories: ClothingCategory[] = ["All", "Tops", "Bottoms", "Shoes", "Outerwear"];

interface FilterChipsProps {
  active: ClothingCategory;
  onSelect: (cat: ClothingCategory) => void;
}

export function FilterChips({ active, onSelect }: FilterChipsProps) {
  return (
    <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-none">
      {categories.map((cat) => (
        <button
          key={cat}
          onClick={() => onSelect(cat)}
          className={cn(
            "shrink-0 rounded-full px-5 py-2 text-sm font-medium font-body transition-all",
            cat === active
              ? "bg-primary text-primary-foreground"
              : "bg-secondary text-muted-foreground hover:text-foreground"
          )}
        >
          {cat}
        </button>
      ))}
    </div>
  );
}
