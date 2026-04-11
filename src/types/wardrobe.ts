export type ClothingCategory = "All" | "Tops" | "Bottoms" | "Shoes" | "Outerwear";
export type ViewMode = "wardrobe" | "outfits";
export type ClothingColor = "black" | "white" | "red" | "blue" | "green" | "yellow" | "gray" | "brown" | "neutral" | "other";
export type ClothingStyle = "casual" | "formal" | "athletic" | "streetwear" | "bohemian" | "vintage" | "minimal" | "other";
export type ClothingOccasion = "All" | "Casual" | "Formal" | "Athletic" | "Work" | "Party" | "Weekend" | "Outdoor";
export type WeatherCondition = "sunny" | "cloudy" | "rainy" | "snowy" | "windy" | "humid";

export interface ClothingFeatures {
  // Stage 1: Image Understanding (CNN output)
  color?: ClothingColor;
  style?: ClothingStyle;
  occasion?: Exclude<ClothingOccasion, "All">; // ML-detected occasion
  thickness?: "thin" | "medium" | "thick"; // For temperature matching
  season?: "summer" | "spring" | "fall" | "winter";
  material?: string; // e.g., "cotton", "wool", "synthetic"
}

export interface WardrobeItem extends ClothingFeatures {
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
  score?: number; // Recommendation confidence score
}

export interface OutfitSchedule {
  id: string;
  outfitId: string;
  dateISO: string; // ISO date string (YYYY-MM-DD)
  createdAt: number;
  worn?: boolean; // Mark if outfit was actually worn
  wornDate?: number; // Timestamp of when it was worn
}

// Stage 2: Weather Input
export interface WeatherData {
  temperature: number; // Celsius
  condition: WeatherCondition;
  humidity?: number; // 0-100
  windSpeed?: number; // km/h
  feelsLike?: number; // Celsius
  uvIndex?: number; // 0-11
}

// Pipeline orchestration
export interface RecommendationContext {
  weather?: WeatherData;
  userPreferences?: {
    preferredStyles?: ClothingStyle[];
    avoidColors?: ClothingColor[];
    favoriteItems?: string[]; // item IDs
  };
  occasion?: string; // e.g., "work", "casual", "formal"
}
