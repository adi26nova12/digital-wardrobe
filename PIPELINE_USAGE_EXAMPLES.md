/**
 * QUICK START: Recommendation Pipeline Usage Examples
 * 
 * The pipeline is already integrated in Recommendations.tsx
 * Here are examples for testing and extending
 */

// ============================================================================
// Example 1: Basic Usage (Already implemented in Recommendations.tsx)
// ============================================================================

import { createRecommendations } from '@/lib/recommendations';
import { useWeather } from '@/hooks/useWeather';
import type { RecommendationContext } from '@/types/wardrobe';

function MyComponent() {
  const { weather } = useWeather();
  
  const context: RecommendationContext = {
    weather,
    userPreferences: {
      preferredStyles: ['casual'],
      avoidColors: ['bright']
    }
  };
  
  const recommendations = createRecommendations(items, outfits, context);
  
  return (
    <div>
      {recommendations.map(outfit => (
        <div key={outfit.id}>
          {/* outfit.score is 0-1 confidence */}
          <Outfit outfit={outfit} confidence={outfit.score} />
        </div>
      ))}
    </div>
  );
}

// ============================================================================
// Example 2: Mock Weather for Testing
// ============================================================================

import { getMockWeather, getSeasonFromTemp } from '@/lib/weatherService';

// Very hot day
const hotContext: RecommendationContext = {
  weather: getMockWeather({ temperature: 35, condition: 'sunny' })
};

// Rainy day
const rainyContext: RecommendationContext = {
  weather: getMockWeather({ temperature: 15, condition: 'rainy' })
};

// Very cold day
const coldContext: RecommendationContext = {
  weather: getMockWeather({ temperature: -5, condition: 'snowy' })
};

// ============================================================================
// Example 3: Inspect Recommendation Scoring
// ============================================================================

import { scoreOutfit } from '@/lib/recommendations';

function DebugRecommendations() {
  const recommendations = createRecommendations(items, outfits, context, 5);
  
  recommendations.forEach(outfit => {
    console.group(`Outfit ${outfit.id}`);
    console.log('Overall Score:', outfit.score);
    console.log('Scoring Breakdown:', outfit.breakdown);
    // Example output:
    // {
    //   weatherMatch: 0.85,
    //   colorHarmony: 0.6,
    //   wearFrequency: 0.4,
    //   novelty: 0.95
    // }
    console.groupEnd();
  });
}

// ============================================================================
// Example 4: Access Item Features (Stage 1)
// ============================================================================

import { extractItemFeatures } from '@/lib/recommendations';
import type { ClothingItemFeatures } from '@/lib/recommendations';

function InspectItemFeatures(item: WardrobeItem) {
  const features: ClothingItemFeatures = extractItemFeatures(item);
  
  console.log('Item Features:');
  console.log('- Thickness:', features.thickness);      // 0-1 scale
  console.log('- Seasonal Scores:', features.seasonalScore);  // {summer, spring, fall, winter}
  console.log('- Color Harmony:', features.colorHarmony); // 0-1 scale
  console.log('- Wear Frequency:', features.wearFrequency); // 0-1 normalized
}

// ============================================================================
// Example 5: Weather Suitability (Stage 2)
// ============================================================================

import { getWeatherSuitability } from '@/lib/recommendations';

function CheckItemWeatherMatch(item: WardrobeItem, weather: WeatherData) {
  const suitability = getWeatherSuitability(item, weather);
  
  console.log(`${item.tag} suitability for ${weather.temperature}°C, ${weather.condition}:`, suitability);
  
  if (suitability > 0.8) console.log('✅ Perfect match');
  else if (suitability > 0.6) console.log('✓ Good match');
  else if (suitability > 0.4) console.log('~ Fair match');
  else console.log('❌ Poor match');
}

// ============================================================================
// Example 6: Add to Sample Data with Features
// ============================================================================

import { ClothingCategory, WardrobeItem, ClothingColor, ClothingStyle } from '@/types/wardrobe';

const sampleItemWithFeatures: WardrobeItem = {
  id: 'item-1',
  imageUrl: 'https://example.com/image.jpg',
  category: 'Tops' as ClothingCategory,
  tag: 'Blue T-shirt',
  createdAt: Date.now(),
  wearCount: 5,
  
  // New feature fields:
  color: 'blue' as ClothingColor,
  style: 'casual' as ClothingStyle,
  thickness: 'thin',      // For hot weather
  season: 'summer',
  material: 'cotton'
};

// ============================================================================
// Example 7: Test Different Occasions
// ============================================================================

const workContext: RecommendationContext = {
  weather: getMockWeather({ temperature: 22, condition: 'cloudy' }),
  occasion: 'work',
  userPreferences: {
    preferredStyles: ['formal', 'business-casual']
  }
};

const casualContext: RecommendationContext = {
  weather: getMockWeather({ temperature: 25, condition: 'sunny' }),
  occasion: 'casual',
  userPreferences: {
    preferredStyles: ['casual', 'streetwear']
  }
};

// ============================================================================
// Example 8: Performance Testing
// ============================================================================

function benchmarkPipeline() {
  const start = performance.now();
  
  const recommendations = createRecommendations(
    allItems,    // Your wardrobe
    outfits,     // Saved outfits
    context,
    20           // Request top 20 instead of 8
  );
  
  const duration = performance.now() - start;
  console.log(`Generated ${recommendations.length} recommendations in ${duration.toFixed(2)}ms`);
  
  // Typical: <50ms for wardrobes < 100 items
  // Note: O(n³) complexity, optimize if > 200 items
}

// ============================================================================
// Environment Variables (Add to .env)
// ============================================================================

// .env
// VITE_OPENWEATHER_API_KEY=your_api_key_here
// VITE_HUGGINGFACE_API_KEY=your_api_key_here  (for future ML integration)

// Then access in code:
// const apiKey = import.meta.env.VITE_OPENWEATHER_API_KEY;

// ============================================================================
// Type Safety Reference
// ============================================================================

type WeatherCondition = 'sunny' | 'cloudy' | 'rainy' | 'snowy' | 'windy' | 'humid';
type ClothingColor = 'black' | 'white' | 'red' | 'blue' | 'green' | 'yellow' | 'gray' | 'brown' | 'neutral' | 'other';
type ClothingStyle = 'casual' | 'formal' | 'athletic' | 'streetwear' | 'bohemian' | 'vintage' | 'minimal' | 'other';

// Add custom colors/styles as needed:
// type ClothingColor = ... | 'navy' | 'maroon' | ...
