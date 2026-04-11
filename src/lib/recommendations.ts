import type { Outfit, WardrobeItem, RecommendationContext, WeatherData } from "@/types/wardrobe";
import { classifyClothingFromUrl } from "@/lib/mlImageService";

// ============================================================================
// STAGE 1: IMAGE UNDERSTANDING - Feature Extraction from Clothing Items
// ============================================================================
// Uses MobileNet ML model for real image classification
// Falls back to heuristics if ML inference fails

export interface ClothingItemFeatures {
  itemId: string;
  thickness: number; // 0-1: thin to thick
  seasonalScore: Record<"summer" | "spring" | "fall" | "winter", number>; // 0-1 match scores
  colorHarmony: number; // 0-1 how well it combines with other items
  wearFrequency: number; // normalized 0-1
  mlConfidence?: number; // ML classifier confidence
}

/**
 * Extract features from a wardrobe item using ML image classification
 * Falls back to heuristic extraction if ML fails
 */
export async function extractItemFeatures(item: WardrobeItem): Promise<ClothingItemFeatures> {
  // Try ML classification first
  let mlConfidence = 0;
  
  try {
    if (item.imageUrl && item.imageUrl.trim().length > 0) {
      const mlFeatures = await classifyClothingFromUrl(item.imageUrl);
      // Update item with ML-extracted features (but NOT occasion - that comes from item data)
      item.color = mlFeatures.color;
      item.style = mlFeatures.style;
      item.thickness = mlFeatures.thickness;
      item.season = mlFeatures.season;
      
      mlConfidence = mlFeatures.confidence;
      console.log(`✓ ML features for ${item.id}:`, { color: item.color, style: item.style, occasion: item.occasion });
    }
  } catch (error) {
    // Don't crash - just log and continue with heuristics
    console.warn(`⚠️ ML classification skipped for ${item.id}:`, error instanceof Error ? error.message : "Unknown error");
  }

  // Build feature scores (using ML-extracted or heuristic/default values)
  const thickness = getThicknessScore(item);
  const seasonalScore = getSeasonalScore(item);
  const colorHarmony = 0.5; // TODO: Integrate with color harmony ML
  const wearFrequency = Math.min(1, (item.wearCount ?? 0) / 10);

  return {
    itemId: item.id,
    thickness,
    seasonalScore,
    colorHarmony,
    wearFrequency,
    mlConfidence,
  };
}

function getThicknessScore(item: WardrobeItem): number {
  if (item.thickness === "thick") return 0.8;
  if (item.thickness === "medium") return 0.5;
  return 0.2; // thin
}

function getSeasonalScore(item: WardrobeItem): Record<"summer" | "spring" | "fall" | "winter", number> {
  const baseScore = 0.5;
  const season = item.season;

  return {
    summer: season === "summer" ? 0.9 : baseScore,
    spring: season === "spring" ? 0.9 : baseScore,
    fall: season === "fall" ? 0.9 : baseScore,
    winter: season === "winter" ? 0.9 : baseScore,
  };
}

// ============================================================================
// STAGE 2: WEATHER-BASED FILTERING
// ============================================================================

/**
 * Temperatures that define weather thresholds (Celsius)
 */
const WEATHER_THRESHOLDS = {
  VERY_COLD: 0,
  COLD: 10,
  COOL: 15,
  WARM: 20,
  HOT: 25,
  VERY_HOT: 30,
};

/**
 * Get seasonal/thickness recommendations based on weather
 */
export function getWeatherSuitability(item: WardrobeItem, weather: WeatherData): number {
  let score = 0.5; // neutral baseline

  // Temperature matching
  if (weather.temperature > WEATHER_THRESHOLDS.VERY_HOT) {
    // Very hot day - prefer thin items
    score = item.thickness === "thin" ? 0.95 : item.thickness === "medium" ? 0.6 : 0.2;
  } else if (weather.temperature > WEATHER_THRESHOLDS.HOT) {
    // Hot - prefer light to medium
    score = item.thickness !== "thick" ? 0.85 : 0.3;
  } else if (weather.temperature > WEATHER_THRESHOLDS.WARM) {
    // Warm - medium thickness ideal
    score = item.thickness === "medium" ? 0.9 : 0.6;
  } else if (weather.temperature > WEATHER_THRESHOLDS.COOL) {
    // Cool - medium to thick
    score = item.thickness === "medium" || item.thickness === "thick" ? 0.85 : 0.4;
  } else if (weather.temperature > WEATHER_THRESHOLDS.COLD) {
    // Cold - prefer thick
    score = item.thickness === "thick" ? 0.9 : 0.5;
  } else {
    // Very cold - must be thick
    score = item.thickness === "thick" ? 0.95 : 0.2;
  }

  // Weather condition modifiers
  if (weather.condition === "rainy") {
    // Prefer weather-resistant materials
    score *= 0.9;
  } else if (weather.condition === "sunny") {
    score *= 1.05; // Slight boost for any item on clear days
  }

  return Math.min(1, score);
}

// ============================================================================
// STAGE 3: CONTENT-BASED RECOMMENDATION ENGINE
// ============================================================================

export interface OutfitRecommendationScore {
  outfit: Outfit;
  score: number;
  breakdown: {
    weatherMatch: number;
    colorHarmony: number;
    wearFrequency: number;
    novelty: number;
  };
}

/**
 * Content-based filtering: recommend outfits based on item features + weather + occasion
 */
export function scoreOutfit(
  outfit: Outfit,
  context: RecommendationContext,
  existingOutfits: Outfit[],
): OutfitRecommendationScore {
  let finalScore = 0;
  const breakdown = {
    weatherMatch: 0,
    colorHarmony: 0,
    wearFrequency: 0,
    novelty: 0,
  };

  const itemScores: number[] = [];

  // Score individual items
  if (outfit.top) {
    const weatherScore = context.weather ? getWeatherSuitability(outfit.top, context.weather) : 0.5;
    itemScores.push(weatherScore);
    breakdown.weatherMatch += weatherScore / 3;
  }
  if (outfit.bottom) {
    const weatherScore = context.weather ? getWeatherSuitability(outfit.bottom, context.weather) : 0.5;
    itemScores.push(weatherScore);
    breakdown.weatherMatch += weatherScore / 3;
  }
  if (outfit.shoes) {
    const weatherScore = context.weather ? getWeatherSuitability(outfit.shoes, context.weather) : 0.5;
    itemScores.push(weatherScore);
    breakdown.weatherMatch += weatherScore / 3;
  }

  // Penalize outfit repetition (novelty)
  const outfitKey = getOutfitKey(outfit);
  const timesWorn = existingOutfits.filter((o) => getOutfitKey(o) === outfitKey).length;
  breakdown.novelty = Math.max(0.1, 1 - timesWorn * 0.3);

  // Combine scores
  finalScore = breakdown.weatherMatch * 0.5 + breakdown.novelty * 0.3 + (breakdown.colorHarmony + breakdown.wearFrequency) * 0.1;

  return {
    outfit,
    score: Math.min(1, Math.max(0, finalScore)),
    breakdown,
  };
}

// ============================================================================
// ORCHESTRATION: Main Recommendation Pipeline
// ============================================================================

export function hasStableImage(item: WardrobeItem) {
  return Boolean(item.imageUrl);
}

function getOutfitKey(outfit: Outfit): string {
  return `${outfit.top?.id ?? ""}-${outfit.bottom?.id ?? ""}-${outfit.shoes?.id ?? ""}`;
}

/**
 * Main recommendation pipeline:
 * 1. Stage 1: Extract features from items using ML classification
 * 2. Stage 2: Filter by weather
 * 3. Stage 3: Score and rank outfits
 * 
 * Now async to support ML model inference
 */
export async function createRecommendations(
  items: WardrobeItem[],
  savedOutfits: Outfit[],
  context: RecommendationContext = {},
  limit: number = 8,
): Promise<Outfit[]> {
  const stableItems = items.filter(hasStableImage);
  const tops = stableItems.filter((item) => item.category === "Tops" || item.category === "Outerwear");
  const bottoms = stableItems.filter((item) => item.category === "Bottoms");
  const shoes = stableItems.filter((item) => item.category === "Shoes");

  if (tops.length === 0 || bottoms.length === 0 || shoes.length === 0) {
    console.warn("Not enough items to create recommendations. Need tops, bottoms, and shoes.");
    return [];
  }

  // Stage 1: Extract features from all items (with ML classification)
  console.log("🔥 Stage 1: Extracting features from", stableItems.length, "items...");
  const itemFeatures = new Map<string, ClothingItemFeatures>();

  // Extract features in parallel with timeout protection for better speed
  const allItems = [...tops, ...bottoms, ...shoes];
  const featurePromises = allItems.map(async (item) => {
    try {
      // Create a promise that times out after 15 seconds to prevent hanging
      const featurePromise = extractItemFeatures(item);
      const timeoutPromise = new Promise<ClothingItemFeatures>((_, reject) =>
        setTimeout(() => reject(new Error("Feature extraction timeout")), 15000)
      );
      
      const features = await Promise.race([featurePromise, timeoutPromise]);
      return { id: item.id, features };
    } catch (error) {
      console.error(`⚠️ Feature extraction failed for ${item.id}:`, error instanceof Error ? error.message : error);
      // Return defaults on error
      return {
        id: item.id,
        features: {
          itemId: item.id,
          thickness: 0.5,
          seasonalScore: { summer: 0.5, spring: 0.5, fall: 0.5, winter: 0.5 },
          colorHarmony: 0.5,
          wearFrequency: 0,
        },
      };
    }
  });

  // Process all features in parallel
  const featureResults = await Promise.all(featurePromises);
  featureResults.forEach(({ id, features }) => {
    itemFeatures.set(id, features);
  });

  console.log("✓ Stage 1 complete: Features extracted for", allItems.length, "items");

  // Generate candidate outfits
  const candidates: Outfit[] = [];
  const existingKeys = new Set(savedOutfits.map(getOutfitKey));

  for (const top of tops) {
    for (const bottom of bottoms) {
      for (const shoe of shoes) {
        const key = `${top.id}-${bottom.id}-${shoe.id}`;
        if (!existingKeys.has(key)) {
          candidates.push({
            id: `rec-${top.id}-${bottom.id}-${shoe.id}`,
            top,
            bottom,
            shoes: shoe,
            createdAt: Date.now(),
          });
        }
      }
    }
  }

  // Stage 3: Score and rank
  console.log("🌦️  Stage 2-3: Filtering by weather and ranking...");
  const scored = candidates
    .map((outfit) => scoreOutfit(outfit, context, savedOutfits))
    .sort((a, b) => b.score - a.score);

  console.log("✓ Recommendation pipeline complete:", scored.length, "candidate outfits ranked");

  // **DEDUPLICATION PASS**: Ensure unique tops, bottoms, and shoes
  // This prevents the same items from being suggested multiple times while maximizing variety
  const seenTops = new Set<string>();
  const seenBottoms = new Set<string>();
  const seenShoes = new Set<string>();
  const dedupedRecommendations: OutfitRecommendationScore[] = [];

  for (const recommendation of scored) {
    const { outfit } = recommendation;
    const topId = outfit.top?.id;
    const bottomId = outfit.bottom?.id;
    const shoeId = outfit.shoes?.id;

    // Check if any item in this outfit has already been used
    const hasConflict = 
      (topId && seenTops.has(topId)) ||
      (bottomId && seenBottoms.has(bottomId)) ||
      (shoeId && seenShoes.has(shoeId));

    if (!hasConflict) {
      dedupedRecommendations.push(recommendation);
      // Mark items as used
      if (topId) seenTops.add(topId);
      if (bottomId) seenBottoms.add(bottomId);
      if (shoeId) seenShoes.add(shoeId);

      // Stop when we have enough recommendations
      if (dedupedRecommendations.length >= limit) {
        break;
      }
    }
  }

  console.log(`✓ Deduplication complete: ${scored.length} candidates → ${dedupedRecommendations.length} unique recommendations (unique tops, bottoms & shoes)`);

  // Return deduplicated results with scores attached
  return dedupedRecommendations.map(({ outfit, score }) => ({
    ...outfit,
    score,
  }));
}
