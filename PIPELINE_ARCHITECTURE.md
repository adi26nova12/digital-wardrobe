# Recommendation Pipeline Architecture

This document outlines the three-stage recommendation pipeline for dress-dox.

## Overview

```
┌─────────────────────────────────────────────────────────────────┐
│                  RECOMMENDATION PIPELINE                         │
├─────────────────────────────────────────────────────────────────┤
│                                                                   │
│  STAGE 1: IMAGE UNDERSTANDING (Clothing Recognition)             │
│  ┌────────────────────────────────────────────────────────────┐ │
│  │ Input: WardrobeItem images                                  │ │
│  │ Process: Extract features using CNN/Vision Transformer      │ │
│  │ Output: ClothingItemFeatures                               │ │
│  │   - color, style, thickness, season, material              │ │
│  │                                                              │ │
│  │ Current: Heuristic extraction (placeholder)                │ │
│  │ TODO: Integrate with TensorFlow.js or Hugging Face         │ │
│  └────────────────────────────────────────────────────────────┘ │
│                              ↓                                    │
│  STAGE 2: WEATHER-BASED FILTERING                                │
│  ┌────────────────────────────────────────────────────────────┐ │
│  │ Input: WeatherData + ClothingItemFeatures                  │ │
│  │ Process: Score item suitability for current weather         │ │
│  │ Output: Weather suitability scores (0-1)                   │ │
│  │   - Temperature matching (thin/thick selection)            │ │
│  │   - Weather condition modifiers                            │ │
│  │                                                              │ │
│  │ Current: Rule-based thresholds                              │ │
│  │ TODO: ML-based weather preference learning                 │ │
│  └────────────────────────────────────────────────────────────┘ │
│                              ↓                                    │
│  STAGE 3: RECOMMENDATION ENGINE (Content-Based Filtering)        │
│  ┌────────────────────────────────────────────────────────────┐ │
│  │ Input: Candidate outfits + RecommendationContext           │ │
│  │ Process: Score and rank outfits                            │ │
│  │ Output: Top-N recommended Outfits with scores              │ │
│  │   - Weather match (50 weight)                              │ │
│  │   - Novelty/rotation (30 weight)                           │ │
│  │   - Color harmony (10 weight)                              │ │
│  │   - Wear frequency (10 weight)                             │ │
│  │                                                              │ │
│  │ Current: Content-based filtering rules                     │ │
│  │ TODO: User preferences learning + collaborative filtering  │ │
│  └────────────────────────────────────────────────────────────┘ │
│                                                                   │
└─────────────────────────────────────────────────────────────────┘
```

## File Structure

```
src/
├── types/wardrobe.ts
│   ├── ClothingFeatures         # Features extracted from images
│   ├── WardrobeItem             # Enhanced with feature metadata
│   ├── WeatherData              # Temperature, condition, humidity
│   ├── RecommendationContext    # Pipeline input + preferences
│   └── Outfit                   # Enhanced with score field
│
├── lib/
│   ├── recommendations.ts       # Main pipeline orchestrator
│   │   ├── extractItemFeatures()        # Stage 1: Image analysis
│   │   ├── getWeatherSuitability()      # Stage 2: Weather filter
│   │   ├── scoreOutfit()                # Stage 3: Ranking engine
│   │   └── createRecommendations()      # Orchestration
│   │
│   └── weatherService.ts        # External data integration
│       ├── fetchWeatherData()   # OpenWeatherMap API
│       ├── getMockWeather()     # Testing/fallback
│       ├── normalizeWeatherData()
│       └── formatWeather()
│
├── hooks/
│   ├── useWeather.ts            # React hook for weather
│   └── useWardrobe.ts           # Existing wardrobe state
│
└── pages/
    └── Recommendations.tsx      # Pipeline consumer
        └── Passes RecommendationContext to createRecommendations()
```

## Key Interfaces

### Stage 1: ClothingFeatures
```typescript
interface ClothingFeatures {
  color?: ClothingColor;          // black, white, red, etc.
  style?: ClothingStyle;          // casual, formal, athletic, etc.
  thickness?: string;            // thin, medium, thick
  season?: string;               // summer, spring, fall, winter
  material?: string;             // cotton, wool, synthetic
}
```

### Stage 2: WeatherData
```typescript
interface WeatherData {
  temperature: number;            // Celsius
  condition: WeatherCondition;    // sunny, rainy, snowy, etc.
  humidity?: number;             // 0-100
  windSpeed?: number;            // km/h
  feelsLike?: number;
  uvIndex?: number;
}
```

### Stage 3: RecommendationContext
```typescript
interface RecommendationContext {
  weather?: WeatherData;          // Current conditions
  userPreferences?: {
    preferredStyles?: ClothingStyle[];
    avoidColors?: ClothingColor[];
    favoriteItems?: string[];     // Item IDs
  };
  occasion?: string;              // work, casual, formal
}
```

## How to Extend

### 1. Integrate Real Image Recognition (Stage 1)

**Option A: TensorFlow.js (Client-side)**
```typescript
// In extractItemFeatures()
import * as tf from '@tensorflow/tfjs';
import * as mobilenet from '@tensorflow-models/mobilenet';

// Load item image, run through model, extract features
```

**Option B: Hugging Face API (Server-side)**
```typescript
// Call Hugging Face inference endpoint
const features = await fetch('https://api-inference.huggingface.co/models/...')
  .then(r => r.json());
```

**Option C: Custom CNN**
```typescript
// Deploy your own trained model on FastAPI/Node.js
// Call /api/extract-features?imageUrl=...
```

### 2. Add User Preference Learning (Stage 3)

```typescript
// Track which outfits are actually worn
interface UserBehavior {
  outfitId: string;
  worn: boolean;
  wornDate: number;
  rating?: 1-5;  // User satisfaction
}

// Use collaborative filtering or ranking learning
// to personalize recommendations over time
```

### 3. Implement Collaborative Filtering

```typescript
// When you have enough users wearing similar items:
// - Find users with similar style preferences
// - Recommend outfits they enjoyed
// - "Users who liked this also liked..."
```

### 4. Add Occasion-Based Recommendations

```typescript
// Enhanced context:
context: RecommendationContext = {
  occasion: "work",
  weather: weatherData,
  userPreferences: { preferredStyles: ["business-casual"] }
}

// Filter items by occasion appropriateness
```

## Current Weights (Customizable)

In `scoreOutfit()`:
```typescript
finalScore = 
  breakdown.weatherMatch * 0.5 +      // 50% importance
  breakdown.novelty * 0.3 +           // 30% importance (avoid repetition)
  breakdown.colorHarmony * 0.1 +      // 10% importance
  breakdown.wearFrequency * 0.1;      // 10% importance
```

Adjust these weights based on:
- User feedback
- A/B testing results
- Domain expertise

## Testing the Pipeline

### Mock Weather
```typescript
import { getMockWeather } from '@/lib/weatherService';

const mockContext = {
  weather: getMockWeather({ temperature: 10, condition: 'snowy' })
};

const recommendations = createRecommendations(items, outfits, mockContext);
```

### Scoring Breakdown
```typescript
const scored = recommendations.map(r => ({
  outfit: r,
  score: r.score,
  breakdown: r.breakdown  // See component scoreOutfit()
}));
```

## API Integration TODOs

- [ ] Get OpenWeatherMap API key from env
- [ ] Add location permission prompt
- [ ] Cache weather data (5-15 min TTL)
- [ ] Add temperature unit preference (C/F)
- [ ] Integrate image recognition model
- [ ] Build user behavior tracking
- [ ] Set up collaborative filtering dataset

## Performance Notes

- **Current:** O(n³) outfit generation (tops × bottoms × shoes)
- **Optimization:** Cache outfit scores, update incrementally
- **Scaling:** Consider pagination for large wardrobes (>100 items)
