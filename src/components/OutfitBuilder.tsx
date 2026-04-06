import { useState } from "react";
import { X } from "lucide-react";
import type { WardrobeItem, Outfit } from "@/types/wardrobe";

interface OutfitBuilderProps {
  items: WardrobeItem[];
  open: boolean;
  onClose: () => void;
  onAdd: (outfit: Omit<Outfit, "id" | "createdAt">) => void;
}

export function OutfitBuilder({ items, open, onClose, onAdd }: OutfitBuilderProps) {
  const [selectedTop, setSelectedTop] = useState<WardrobeItem | undefined>();
  const [selectedBottom, setSelectedBottom] = useState<WardrobeItem | undefined>();
  const [selectedShoes, setSelectedShoes] = useState<WardrobeItem | undefined>();

  const tops = items.filter((item) => item.category === "Tops");
  const bottoms = items.filter((item) => item.category === "Bottoms");
  const shoes = items.filter((item) => item.category === "Shoes");

  const handleAddOutfit = () => {
    if (selectedTop || selectedBottom || selectedShoes) {
      console.log("📸 Saving outfit:", { selectedTop, selectedBottom, selectedShoes });
      onAdd({
        top: selectedTop,
        bottom: selectedBottom,
        shoes: selectedShoes,
      });
      setSelectedTop(undefined);
      setSelectedBottom(undefined);
      setSelectedShoes(undefined);
      onClose();
    }
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/50" onClick={onClose}>
      <div 
        className="fixed bottom-0 left-0 right-0 z-50 rounded-t-2xl bg-background flex flex-col h-[90vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-6 border-b border-border shrink-0">
          <h2 className="font-display text-2xl font-semibold">Create Outfit</h2>
          <button
            onClick={onClose}
            className="rounded-full p-2 hover:bg-secondary transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Scrollable Content */}
        <div className="overflow-y-auto px-5 py-6 flex-1 min-h-0">
          <div className="space-y-6">
            {/* Preview */}
            {(selectedTop || selectedBottom || selectedShoes) && (
              <div className="rounded-lg bg-card p-6 flex items-center justify-center h-96 border border-border">
                <div className="relative w-full h-full flex flex-col items-center justify-center gap-1">
                  {selectedTop && (
                    <div className="absolute top-0 w-64 h-56 flex items-center justify-center">
                      <img
                        src={selectedTop.imageUrl}
                        alt="top"
                        className="h-full w-full object-contain"
                      />
                    </div>
                  )}
                  {selectedBottom && (
                    <div className="absolute top-40 w-64 h-64 flex items-center justify-center">
                      <img
                        src={selectedBottom.imageUrl}
                        alt="bottom"
                        className="h-full w-full object-contain"
                      />
                    </div>
                  )}
                  {selectedShoes && (
                    <div className="absolute bottom-0 w-72 h-24 flex items-center justify-center">
                      <img
                        src={selectedShoes.imageUrl}
                        alt="shoes"
                        className="h-full w-full object-contain"
                      />
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Categories */}
            <div className="space-y-6">
              {/* Tops */}
              {tops.length > 0 && (
                <div>
                  <h3 className="font-display text-lg font-semibold mb-3">Tops</h3>
                  <div className="grid grid-cols-3 gap-2">
                    {tops.map((item) => (
                      <button
                        key={item.id}
                        onClick={() =>
                          setSelectedTop(selectedTop?.id === item.id ? undefined : item)
                        }
                        className={`aspect-square rounded-lg overflow-hidden border-2 transition-all ${
                          selectedTop?.id === item.id
                            ? "border-primary bg-primary/10"
                            : "border-transparent bg-card"
                        }`}
                      >
                        <img
                          src={item.imageUrl}
                          alt="top"
                          className="h-full w-full object-contain p-2"
                        />
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Bottoms */}
              {bottoms.length > 0 && (
                <div>
                  <h3 className="font-display text-lg font-semibold mb-3">Bottoms</h3>
                  <div className="grid grid-cols-3 gap-2">
                    {bottoms.map((item) => (
                      <button
                        key={item.id}
                        onClick={() =>
                          setSelectedBottom(selectedBottom?.id === item.id ? undefined : item)
                        }
                        className={`aspect-square rounded-lg overflow-hidden border-2 transition-all ${
                          selectedBottom?.id === item.id
                            ? "border-primary bg-primary/10"
                            : "border-transparent bg-card"
                        }`}
                      >
                        <img
                          src={item.imageUrl}
                          alt="bottom"
                          className="h-full w-full object-contain p-2"
                        />
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Shoes */}
              {shoes.length > 0 && (
                <div>
                  <h3 className="font-display text-lg font-semibold mb-3">Shoes</h3>
                  <div className="grid grid-cols-3 gap-2">
                    {shoes.map((item) => (
                      <button
                        key={item.id}
                        onClick={() =>
                          setSelectedShoes(selectedShoes?.id === item.id ? undefined : item)
                        }
                        className={`aspect-square rounded-lg overflow-hidden border-2 transition-all ${
                          selectedShoes?.id === item.id
                            ? "border-primary bg-primary/10"
                            : "border-transparent bg-card"
                        }`}
                      >
                        <img
                          src={item.imageUrl}
                          alt="shoes"
                          className="h-full w-full object-contain p-2"
                        />
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
            
            {/* Bottom padding for scrolling */}
            <div className="h-4" />
          </div>
        </div>

        {/* Footer with Action buttons */}
        <div className="border-t border-border px-5 py-4 grid grid-cols-2 gap-3 shrink-0">
          <button
            onClick={onClose}
            className="py-3 rounded-full border border-border font-body font-semibold transition-colors hover:bg-secondary"
          >
            Cancel
          </button>
          <button
            onClick={handleAddOutfit}
            disabled={!selectedTop && !selectedBottom && !selectedShoes}
            className="py-3 rounded-full bg-primary text-primary-foreground font-body font-semibold transition-all disabled:opacity-50 disabled:cursor-not-allowed hover:enabled:scale-[1.02] active:enabled:scale-[0.98]"
          >
            Save Outfit
          </button>
        </div>
      </div>
    </div>
  );
}
