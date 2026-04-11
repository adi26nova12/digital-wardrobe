import * as tf from "@tensorflow/tfjs";
import * as mobilenet from "@tensorflow-models/mobilenet";
import type { ClothingColor, ClothingStyle } from "@/types/wardrobe";

/**
 * Machine Learning Image Classification Service
 * Uses MobileNet pre-trained model for fast fashion item classification
 * 
 * Flow: Image URL → Fetch & Load → MobileNet Inference → Extract Clothing Features
 */

interface MLPrediction {
  className: string;
  probability: number;
}

interface ExtractedClothingFeatures {
  color: ClothingColor;
  style: ClothingStyle;
  thickness: "thin" | "medium" | "thick";
  season: "summer" | "spring" | "fall" | "winter";
  material?: string;
  confidence: number;
}

// Pre-loaded model (lazy loaded on first use)
let modelInstance: mobilenet.MobileNet | null = null;
let modelLoadingPromise: Promise<mobilenet.MobileNet> | null = null;

/**
 * Load MobileNet model (cached on first call, with retry logic)
 */
async function loadModel(): Promise<mobilenet.MobileNet> {
  // Return cached model if available
  if (modelInstance) return modelInstance;

  // If already loading, wait for that promise instead of loading twice
  if (modelLoadingPromise) return modelLoadingPromise;

  try {
    console.log("📦 Loading MobileNet model...");
    modelLoadingPromise = mobilenet.load({ version: 2, alpha: 0.5 });
    modelInstance = await modelLoadingPromise;
    console.log("✓ MobileNet model loaded successfully");
    return modelInstance;
  } catch (error) {
    console.error("❌ Failed to load MobileNet:", error);
    modelLoadingPromise = null; // Reset so next call can retry
    throw new Error("ML model initialization failed. Using heuristics instead.");
  }
}

/**
 * Classify a single clothing image
 * Returns top-5 predictions from ImageNet
 */
async function classifyClothingImage(imageElement: HTMLImageElement): Promise<MLPrediction[]> {
  const model = await loadModel();

  try {
    const predictions = await model.classify(imageElement, 5);
    return predictions as MLPrediction[];
  } catch (error) {
    console.error("Classification error:", error);
    throw new Error("Failed to classify image");
  }
}

/**
 * Load image from URL into HTMLImageElement
 * With proper CORS handling and fallback support
 * Supports both HTTP URLs and data: URLs
 */
function loadImageFromUrl(imageUrl: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    if (!imageUrl || imageUrl.trim().length === 0) {
      reject(new Error("Empty image URL"));
      return;
    }

    const img = new Image();
    
    // Only set crossOrigin for non-data URLs
    if (!imageUrl.startsWith("data:")) {
      img.crossOrigin = "Anonymous";
    }

    // Add timeout of 10 seconds per image
    const timeout = setTimeout(() => {
      reject(new Error(`Image load timeout: ${imageUrl.substring(0, 50)}...`));
    }, 10000);

    img.onload = () => {
      clearTimeout(timeout);
      resolve(img);
    };
    
    img.onerror = () => {
      clearTimeout(timeout);
      reject(new Error(`Failed to load image`));
    };

    img.src = imageUrl;
  });
}

/**
 * Parse ImageNet class name and extract clothing features
 * Example: "T-shirt" → { clothing: "t-shirt", color: null, style: "casual" }
 */
function parseClothingClass(imagenetClass: string): Partial<ExtractedClothingFeatures> {
  const lower = imagenetClass.toLowerCase();

  // Clothing type detection
  const typeMap: Record<string, { style: ClothingStyle; thickness: string; season: string }> = {
    // Tops
    "t-shirt": { style: "casual", thickness: "thin", season: "summer" },
    shirt: { style: "casual", thickness: "thin", season: "spring" },
    "polo shirt": { style: "casual", thickness: "thin", season: "summer" },
    blouse: { style: "formal", thickness: "thin", season: "spring" },
    "dress shirt": { style: "formal", thickness: "medium", season: "spring" },

    // Outerwear
    hoodie: { style: "casual", thickness: "thick", season: "fall" },
    "sweatshirt": { style: "casual", thickness: "thick", season: "fall" },
    jacket: { style: "casual", thickness: "thick", season: "fall" },
    "leather jacket": { style: "casual", thickness: "thick", season: "fall" },
    "blazer": { style: "formal", thickness: "medium", season: "spring" },
    "coat": { style: "formal", thickness: "thick", season: "winter" },
    "parka": { style: "casual", thickness: "thick", season: "winter" },

    // Bottoms
    jeans: { style: "casual", thickness: "medium", season: "spring" },
    "denim": { style: "casual", thickness: "medium", season: "spring" },
    "trousers": { style: "formal", thickness: "medium", season: "spring" },
    pants: { style: "casual", thickness: "medium", season: "spring" },
    shorts: { style: "casual", thickness: "thin", season: "summer" },
    skirt: { style: "casual", thickness: "thin", season: "summer" },
    "athletic shorts": { style: "athletic", thickness: "thin", season: "summer" },

    // Shoes
    "running shoe": { style: "athletic", thickness: "medium", season: "spring" },
    sneaker: { style: "casual", thickness: "medium", season: "spring" },
    "athletic shoe": { style: "athletic", thickness: "medium", season: "spring" },
    boot: { style: "casual", thickness: "thick", season: "fall" },
    "high heel": { style: "formal", thickness: "thin", season: "spring" },
    loafer: { style: "formal", thickness: "medium", season: "spring" },
    "flip-flop": { style: "casual", thickness: "thin", season: "summer" },
  };

  // Find matching type
  let matchedType = { style: "casual" as ClothingStyle, thickness: "medium", season: "spring" };
  for (const [type, features] of Object.entries(typeMap)) {
    if (lower.includes(type)) {
      matchedType = features as typeof matchedType;
      break;
    }
  }

  // Color detection from class name
  const colorMap: Record<string, ClothingColor> = {
    black: "black",
    white: "white",
    red: "red",
    blue: "blue",
    green: "green",
    yellow: "yellow",
    gray: "gray",
    grey: "gray",
    brown: "brown",
    navy: "blue",
    beige: "neutral",
    khaki: "neutral",
    tan: "neutral",
  };

  let color: ClothingColor = "neutral";
  for (const [colorName, colorType] of Object.entries(colorMap)) {
    if (lower.includes(colorName)) {
      color = colorType;
      break;
    }
  }

  return {
    style: matchedType.style,
    thickness: matchedType.thickness as "thin" | "medium" | "thick",
    season: matchedType.season as "summer" | "spring" | "fall" | "winter",
    color,
  };
}

/**
 * Main function: Classify clothing image and extract features
 * This replaces the heuristic feature extraction in recommendations.ts
 * Gracefully falls back to defaults if anything fails
 */
export async function classifyClothingFromUrl(imageUrl: string): Promise<ExtractedClothingFeatures> {
  try {
    // Validate URL
    if (!imageUrl || imageUrl.trim().length === 0) {
      throw new Error("Invalid image URL");
    }

    // Load image
    const img = await loadImageFromUrl(imageUrl);

    // Run classification
    const predictions = await classifyClothingImage(img);

    if (!predictions || predictions.length === 0) {
      throw new Error("No predictions returned from model");
    }

    // Use top prediction
    const topPrediction = predictions[0];
    const confidence = topPrediction.probability;
    
    console.log(
      `🎯 ML Classification: ${topPrediction.className} (${(confidence * 100).toFixed(1)}% confidence)`,
    );

    // Parse features from prediction
    const parsedFeatures = parseClothingClass(topPrediction.className);

    const features: ExtractedClothingFeatures = {
      color: parsedFeatures.color ?? "neutral",
      style: parsedFeatures.style ?? "casual",
      thickness: (parsedFeatures.thickness as "thin" | "medium" | "thick") ?? "medium",
      season: (parsedFeatures.season as "summer" | "spring" | "fall" | "winter") ?? "spring",
      confidence: Math.round(confidence * 100) / 100, // Round to 2 decimals
    };

    return features;
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    console.warn("⚠️ ML classification failed:", message);
    
    // Return sensible defaults if ML fails - don't crash
    return {
      color: "neutral",
      style: "casual",
      thickness: "medium",
      season: "spring",
      confidence: 0,
    };
  }
}

/**
 * Batch classify multiple images
 * Useful for processing entire wardrobe
 */
export async function classifyClothingBatch(
  imageUrls: string[],
): Promise<Map<string, ExtractedClothingFeatures>> {
  const results = new Map<string, ExtractedClothingFeatures>();

  for (const url of imageUrls) {
    try {
      const features = await classifyClothingFromUrl(url);
      results.set(url, features);
    } catch (error) {
      console.warn(`Failed to classify ${url}:`, error);
    }
  }

  return results;
}

/**
 * Cleanup: Dispose TensorFlow memory
 * Call on component unmount if dealing with many images
 */
export function cleanupTensorFlow() {
  tf.disposeVariables();
}

/**
 * Get model info (for debugging)
 */
export async function getModelInfo(): Promise<string> {
  const model = await loadModel();
  return `MobileNet v2 - Ready for inference`;
}
