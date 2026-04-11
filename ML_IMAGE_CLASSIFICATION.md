# ML Image Classification Integration Guide

## What's New 🤖

Your recommendation pipeline now **automatically classifies clothing images** using **MobileNet v2** (pre-trained on ImageNet).

### Architecture

```
👕 Wardrobe Item
    ↓
Load Image from URL
    ↓
MobileNet v2 Classification
    ↓
Extract Features:
  • Type (t-shirt, jeans, jacket, etc.)
  • Color (blue, black, white, etc.)
  • Style (casual, formal, athletic, etc.)
  • Thickness (thin, medium, thick)
  • Season (summer, spring, fall, winter)
    ↓
Use for Recommendations
```

## How It Works

### 1. **First Time Setup** (Automatic)
When recommendations are first generated:
```
Browser loads MobileNet model (~20 MB)
  ↓
Model cached in memory
  ↓
Classify each wardrobe item's image
```

### 2. **Classification Pipeline** (`mlImageService.ts`)

```typescript
// Automatically called for each item
const features = await classifyClothingFromUrl(imageUrl);

// Returns:
{
  color: "blue",              // ClothingColor
  style: "casual",            // ClothingStyle  
  thickness: "thin",          // thin | medium | thick
  season: "summer",           // season of ideal wear
  confidence: 0.87            // ML model confidence 0-1
}
```

### 3. **Feature Parsing** 

The model returns ImageNet class names like:
```
"blue t-shirt" → {color: "blue", style: "casual", thickness: "thin"}
"leather jacket" → {color: "black", style: "casual", thickness: "thick", season: "fall"}
"shorts" → {color: "neutral", style: "casual", thickness: "thin", season: "summer"}
```

### 4. **Fall-Back Behavior**

If ML classification fails (bad image, network error):
```
→ Use heuristics based on existing item metadata
→ Return sensible defaults like "neutral", "casual", "medium"
→ No crash, app keeps working
```

## Performance

| Metric | Value |
|--------|-------|
| Model Load Time | ~2-3 seconds (first time) |
| Per-Item Classification | ~200-300ms |
| Total for 20 items | ~4-6 seconds |
| Memory (loaded model) | ~20 MB |
| Caching | ✅ In-memory after first load |

## Usage in Components

### Current Implementation (Automatic)
```typescript
// In Recommendations.tsx - fully automatic
const recommendations = await createRecommendations(items, outfits, context);
// ML classification happens internally
```

### Manual Classification (if needed)
```typescript
import { classifyClothingFromUrl } from '@/lib/mlImageService';

const features = await classifyClothingFromUrl('https://example.com/image.jpg');
console.log(features);
// {
//   color: "blue",
//   style: "casual", 
//   thickness: "thin",
//   season: "summer",
//   confidence: 0.92
// }
```

### Batch Classification
```typescript
import { classifyClothingBatch } from '@/lib/mlImageService';

const imageUrls = ['url1', 'url2', 'url3'];
const results = await classifyClothingBatch(imageUrls);

// Map of url → features
results.forEach((features, url) => {
  console.log(`${url}: ${features.color} ${features.style}`);
});
```

## Supported Clothing Types

### Tops
- T-shirts, shirts, polos, blouses, dress shirts, hoodies, sweatshirts

### Outerwear  
- Jackets, leather jackets, blazers, coats, parkas

### Bottoms
- Jeans, denim, trousers, pants, shorts, skirts

### Shoes
- Running shoes, sneakers, athletic shoes, boots, heels, loafers, flip-flops

### Colors Recognized
- black, white, red, blue, green, yellow, gray, brown, navy, beige, khaki, tan

## Advanced: Training Your Own Model

To use a custom clothing classifier:

```typescript
// 1. Train a model on fashion dataset
// (Fashion MNIST, DeepFashion, custom clothing dataset)

// 2. Export to TensorFlow.js format
// saveModel('indexeddb://my-fashion-model')

// 3. Update mlImageService.ts
// Replace MobileNet with your model:
import * as tf from '@tensorflow/tfjs';

async function loadModel() {
  return await tf.loadLayersModel('indexeddb://my-fashion-model/model.json');
}
```

## Troubleshooting

### Issue: Images not loading
```
❌ CORS error when loading image from URL

Solution: 
- Ensure image URL is CORS-enabled
- Or proxy through your server
- Add crossOrigin="Anonymous" to image fetching
```

### Issue: Slow classification
```
❌ Takes 5+ seconds per item

Solution:
- First load: 2-3s for model initialization (normal)
- Subsequent loads: Should be <500ms
- If still slow, check browser DevTools → Network
- Classify in batches to parallelize
```

### Issue: Low confidence scores
```
❌ Model returning <0.5 confidence

Solution:
- Image is unclear or not clothing
- Model didn't train on this clothing type
- Try with higher quality images
- Use fallback heuristics (automatic)
```

## Environment Variables

No additional env vars needed! MobileNet is loaded from CDN.

Optional: To use custom API key for model serving:
```env
VITE_ML_MODEL_ENDPOINT=https://your-server.com/model
```

## API Reference

### `classifyClothingFromUrl(imageUrl: string)`
```typescript
// Classify single image
const features = await classifyClothingFromUrl(url);

Returns: ExtractedClothingFeatures
  - color: ClothingColor
  - style: ClothingStyle
  - thickness: "thin" | "medium" | "thick"
  - season: "summer" | "spring" | "fall" | "winter"
  - confidence: 0-1
```

### `classifyClothingBatch(imageUrls: string[])`
```typescript
// Classify multiple images in parallel
const results = await classifyClothingBatch(urls);

Returns: Map<url, ExtractedClothingFeatures>
```

### `loadImageFromUrl(url: string)`
```typescript
// Internal: Load image for processing
const img = await loadImageFromUrl(url);
```

### `parseClothingClass(imagenetClass: string)`
```typescript
// Internal: Parse ImageNet class name to features
const features = parseClothingClass("blue t-shirt");
```

### `cleanupTensorFlow()`
```typescript
// Call on unmount to free memory
cleanupTensorFlow();
```

### `getModelInfo()`
```typescript
// Debug: Get model information
const info = await getModelInfo();
console.log(info); // "MobileNet v2 - Ready for inference"
```

## 🎉 New Feature: Occasion-Based Sorting

### What It Does
The ML model now detects the **occasion** for which clothing is appropriate:
- **Casual** - Everyday wear, relaxed style
- **Formal** - Professional, dress-up occasions
- **Athletic** - Sports and workout clothes
- **Work** - Office/business appropriate
- **Party** - Evening wear, special events
- **Outdoor** - Adventure/hiking oriented
- **Weekend** - Fun, relaxed activities

### How to Use

1. **Wardrobe Tab** - New occasion filter bar appears below category filter
2. **Auto-Detection** - Occasions are automatically detected via MobileNet when items are added
3. **Filtering** - Click occasion buttons (👕 Casual, 🎩 Formal, ⚽ Athletic, etc.) to sort
4. **Visual Indicator** - Each item displays its detected occasion in the bottom label
5. **Combined Filtering** - Use both category AND occasion filters together

### Example

```
User has these items:
- Blue T-shirt (Clothes.tsx detects: Casual)
- Dress shirt (ML detects: Formal)
- Running shoes (ML detects: Athletic)
- Jeans (ML detects: Casual)
- Blazer (ML detects: Work)

User selects:
- Category: "All"  
- Occasion: "Casual"

Result: Blue T-shirt and Jeans displayed
```

### Implementation Details

**Features Extracted:**
```typescript
interface ClothingFeatures {
  color?: ClothingColor;
  style?: ClothingStyle;
  occasion?: "Casual" | "Formal" | "Athletic" | "Work" | "Party" | "Weekend" | "Outdoor";
  thickness?: "thin" | "medium" | "thick";
  season?: "summer" | "spring" | "fall" | "winter";
  material?: string;
}
```

**Component Structure:**
- `OccasionFilter` - Filter button group component
- `WardrobeGrid` - Displays occasion label under each item
- `Index.tsx` - Integrates occasion filtering with category filtering
- `recommendations.ts` - Extracts occasion in ML pipeline

**Filter States:**
```typescript
const [activeOccasionFilter, setActiveOccasionFilter] = useState<ClothingOccasion>("All");

// Filters items by both category AND occasion
const occasionFilteredItems = 
  activeOccasionFilter === "All" 
    ? items 
    : items.filter((item) => item.occasion === activeOccasionFilter);
```

## Next Steps

1. **Test with your wardrobe** - Add items and see classifications in console
2. **Fine-tune weights** - Adjust recommendation weights in `scoreOutfit()`
3. **Add user feedback** - Track which recommendations users accept
4. **Implement custom model** - Train on your fashion dataset
5. **Color harmony** - Add ML-based color matching algorithm

## Resources

- [TensorFlow.js Docs](https://js.tensorflow.org/)
- [MobileNet Paper](https://arxiv.org/abs/1704.04861)
- [ImageNet Classes](https://github.com/amirgholami/imagenet_classes)
- [Fashion DBMM Dataset](http://mmlab.ie.cuhk.edu.hk/projects/DeepFashion.html)
