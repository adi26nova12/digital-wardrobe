export type ClothingCategory = "All" | "Tops" | "Bottoms" | "Shoes" | "Outerwear";

export interface WardrobeItem {
  id: string;
  imageUrl: string;
  category: Exclude<ClothingCategory, "All">;
  createdAt: number;
}
