import type { Outfit, WardrobeItem } from "@/types/wardrobe";

export function hasStableImage(item: WardrobeItem) {
  return Boolean(item.imageUrl);
}

// Seeded random number generator for reproducible shuffling
function seededRandom(seed: number): number {
  const x = Math.sin(seed) * 10000;
  return x - Math.floor(x);
}

export function createRecommendations(items: WardrobeItem[], savedOutfits: Outfit[], seed: number = 0): Outfit[] {
  const stableItems = items.filter(hasStableImage);
  const tops = stableItems.filter((item) => item.category === "Tops" || item.category === "Outerwear");
  const bottoms = stableItems.filter((item) => item.category === "Bottoms");
  const shoes = stableItems.filter((item) => item.category === "Shoes");

  if (tops.length === 0 || bottoms.length === 0 || shoes.length === 0) {
    return [];
  }

  const existingKeys = new Set(
    savedOutfits.map((outfit) => `${outfit.top?.id ?? ""}-${outfit.bottom?.id ?? ""}-${outfit.shoes?.id ?? ""}`),
  );

  const total = Math.min(8, tops.length * bottoms.length * shoes.length);
  const recommendations: Outfit[] = [];
  let cursor = 0;

  while (recommendations.length < total && cursor < total * 4) {
    const topIndex = Math.floor(seededRandom(seed + cursor) * tops.length);
    const bottomIndex = Math.floor(seededRandom(seed + cursor + 1000) * bottoms.length);
    const shoeIndex = Math.floor(seededRandom(seed + cursor + 2000) * shoes.length);

    const top = tops[topIndex];
    const bottom = bottoms[bottomIndex];
    const shoe = shoes[shoeIndex];
    const key = `${top.id}-${bottom.id}-${shoe.id}`;

    if (!existingKeys.has(key)) {
      recommendations.push({
        id: `rec-${top.id}-${bottom.id}-${shoe.id}`,
        top,
        bottom,
        shoes: shoe,
        createdAt: Date.now() - cursor,
      });
      existingKeys.add(key);
    }

    cursor += 1;
  }

  return recommendations;
}
