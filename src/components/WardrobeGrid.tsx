import { useState } from "react";
import type { WardrobeItem, ClothingCategory, ClothingOccasion } from "@/types/wardrobe";
import { Trash2, Edit2 } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

const itemCategories: Exclude<ClothingCategory, "All">[] = ["Tops", "Bottoms", "Shoes", "Outerwear"];
const occasionOptions: Exclude<ClothingOccasion, "All">[] = ["Casual", "Formal", "Athletic", "Work", "Party", "Outdoor", "Weekend"];

interface WardrobeGridProps {
  items: WardrobeItem[];
  onDelete: (id: string) => void;
  onUpdateTag?: (id: string, tag: string) => Promise<void>;
  onUpdateCategory?: (id: string, category: Exclude<ClothingCategory, "All">) => Promise<void>;
  onUpdateOccasion?: (id: string, occasion: Exclude<ClothingOccasion, "All">) => Promise<void>;
}

export function WardrobeGrid({ items, onDelete, onUpdateTag, onUpdateCategory, onUpdateOccasion }: WardrobeGridProps) {
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingTag, setEditingTag] = useState<string>("");
  const [editingCategory, setEditingCategory] = useState<Exclude<ClothingCategory, "All"> | null>(null);
  const [editingOccasion, setEditingOccasion] = useState<Exclude<ClothingOccasion, "All"> | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleEditClick = (item: WardrobeItem) => {
    setEditingId(item.id);
    setEditingTag(item.tag || "");
    setEditingCategory(item.category);
    setEditingOccasion((item.occasion as Exclude<ClothingOccasion, "All">) || "Casual");
  };

  const handleSaveChanges = async () => {
    if (!editingId) return;
    
    setIsLoading(true);
    try {
      if (onUpdateTag) {
        await onUpdateTag(editingId, editingTag);
      }
      if (onUpdateCategory && editingCategory) {
        await onUpdateCategory(editingId, editingCategory);
      }
      if (onUpdateOccasion && editingOccasion) {
        await onUpdateOccasion(editingId, editingOccasion);
      }
      setEditingId(null);
      setEditingTag("");
      setEditingCategory(null);
      setEditingOccasion(null);
    } catch (error) {
      console.error("Failed to update item:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCloseDialog = () => {
    setEditingId(null);
    setEditingTag("");
    setEditingCategory(null);
    setEditingOccasion(null);
  };

  if (items.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-24 text-center">
        <p className="font-display text-2xl text-muted-foreground mb-2">Your wardrobe is empty</p>
        <p className="text-sm text-muted-foreground">Tap the + button to add your first item</p>
      </div>
    );
  }
  return (
    <>
      <div className="grid grid-cols-4 gap-1">
        {items.map((item, index) => (
          <div
            key={item.id}
            className="smooth-card group relative aspect-square rounded-lg bg-card overflow-hidden animate-fade-in"
            style={{ animationDelay: `${index * 55}ms` }}
          >
            <img
              src={item.imageUrl}
              alt={item.tag || item.category}
              className="h-full w-full object-contain p-1 transition-transform duration-300 group-hover:scale-[1.03]"
              loading="lazy"
            />
            <div className="absolute top-2 right-2 flex gap-1 opacity-0 transition-opacity group-hover:opacity-100">
              {onUpdateTag && (
                <button
                  onClick={() => handleEditClick(item)}
                  className="rounded-full bg-background/80 p-1.5 hover:bg-primary hover:text-primary-foreground transition-colors"
                  aria-label="Edit tag"
                >
                  <Edit2 className="h-4 w-4" />
                </button>
              )}
              <button
                onClick={() => onDelete(item.id)}
                className="rounded-full bg-background/80 p-1.5 hover:bg-destructive hover:text-primary-foreground transition-colors"
                aria-label="Delete item"
              >
                <Trash2 className="h-4 w-4" />
              </button>
            </div>
            <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-background/90 to-transparent p-2">
              <p className="text-xs font-body font-medium text-foreground">
                {item.tag || item.category}
              </p>
              {item.occasion && (
                <p className="text-xs font-body text-muted-foreground">
                  {item.occasion}
                </p>
              )}
            </div>
          </div>
        ))}
      </div>

      <Dialog open={!!editingId} onOpenChange={handleCloseDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Item</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium">Category</label>
              <div className="grid grid-cols-2 gap-2 mt-2">
                {itemCategories.map((cat) => (
                  <button
                    key={cat}
                    onClick={() => setEditingCategory(cat)}
                    className={cn(
                      "rounded-lg px-3 py-2 text-sm font-medium transition-all",
                      editingCategory === cat
                        ? "bg-primary text-primary-foreground"
                        : "bg-secondary text-foreground hover:bg-muted"
                    )}
                  >
                    {cat}
                  </button>
                ))}
              </div>
            </div>
            <div>
              <label className="text-sm font-medium">Occasion</label>
              <div className="grid grid-cols-2 gap-2 mt-2">
                {occasionOptions.map((occ) => (
                  <button
                    key={occ}
                    onClick={() => setEditingOccasion(occ)}
                    className={cn(
                      "rounded-lg px-3 py-2 text-sm font-medium transition-all",
                      editingOccasion === occ
                        ? "bg-primary text-primary-foreground"
                        : "bg-secondary text-foreground hover:bg-muted"
                    )}
                  >
                    {occ}
                  </button>
                ))}
              </div>
            </div>
            <div>
              <label className="text-sm font-medium">Tag Name (Optional)</label>
              <Input
                value={editingTag}
                onChange={(e) => setEditingTag(e.target.value.slice(0, 50))}
                placeholder="e.g. Navy Hoodie"
                maxLength={50}
                className="mt-2"
              />
              <p className="text-xs text-muted-foreground mt-1">{editingTag.length}/50</p>
            </div>
          </div>
          <DialogFooter className="gap-2">
            <Button variant="outline" onClick={handleCloseDialog}>
              Cancel
            </Button>
            <Button onClick={handleSaveChanges} disabled={isLoading}>
              {isLoading ? "Saving..." : "Save"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
