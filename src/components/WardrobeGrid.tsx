import type { WardrobeItem } from "@/types/wardrobe";
import { Trash2 } from "lucide-react";

interface WardrobeGridProps {
  items: WardrobeItem[];
  onDelete: (id: string) => void;
}

export function WardrobeGrid({ items, onDelete }: WardrobeGridProps) {
  if (items.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-24 text-center">
        <p className="font-display text-2xl text-muted-foreground mb-2">Your wardrobe is empty</p>
        <p className="text-sm text-muted-foreground">Tap the + button to add your first item</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 gap-3">
      {items.map((item) => (
        <div
          key={item.id}
          className="group relative aspect-square rounded-lg bg-card overflow-hidden animate-fade-in"
        >
          <img
            src={item.imageUrl}
            alt={item.category}
            className="h-full w-full object-contain p-4"
            loading="lazy"
          />
          <button
            onClick={() => onDelete(item.id)}
            className="absolute top-2 right-2 rounded-full bg-background/80 p-1.5 opacity-0 transition-opacity group-hover:opacity-100 hover:bg-destructive hover:text-primary-foreground"
            aria-label="Delete item"
          >
            <Trash2 className="h-4 w-4" />
          </button>
          <span className="absolute bottom-2 left-2 rounded-full bg-background/80 px-2.5 py-0.5 text-xs font-body font-medium text-foreground">
            {item.category}
          </span>
        </div>
      ))}
    </div>
  );
}
