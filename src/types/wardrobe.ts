export type ClothingCategory = "All" | "Tops" | "Bottoms" | "Shoes" | "Outerwear";
export type ViewMode = "wardrobe" | "outfits";

export interface WardrobeItem {
  id: string;
  imageUrl: string;
  category: Exclude<ClothingCategory, "All">;
  createdAt: number;
}

export interface Outfit {
  id: string;
  top?: WardrobeItem;
  bottom?: WardrobeItem;
  shoes?: WardrobeItem;
  createdAt: number;
}
