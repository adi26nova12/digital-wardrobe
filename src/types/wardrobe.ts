export type ClothingCategory = "All" | "Tops" | "Bottoms" | "Shoes" | "Outerwear";
export type ViewMode = "wardrobe" | "outfits";

export interface WardrobeItem {
  id: string;
  imageUrl: string;
  category: Exclude<ClothingCategory, "All">;
  tag?: string; // Optional label/name for the item
  createdAt: number;
  wearCount?: number; // Track how many times item was worn
}

export interface Outfit {
  id: string;
  top?: WardrobeItem;
  bottom?: WardrobeItem;
  shoes?: WardrobeItem;
  createdAt: number;
  wearCount?: number; // Track how many times outfit was worn
}

export interface OutfitSchedule {
  id: string;
  outfitId: string;
  dateISO: string; // ISO date string (YYYY-MM-DD)
  createdAt: number;
  worn?: boolean; // Mark if outfit was actually worn
  wornDate?: number; // Timestamp of when it was worn
}
