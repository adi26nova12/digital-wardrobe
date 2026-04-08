import { useMemo } from "react";
import type { Outfit, WardrobeItem, OutfitSchedule } from "@/types/wardrobe";

interface WearStats {
  itemStats: Array<{
    item: WardrobeItem;
    category: string;
    wearCount: number;
    percentage: number;
  }>;
  outfitStats: Array<{
    outfit: Outfit;
    wearCount: number;
    percentage: number;
  }>;
  totalItemWears: number;
  totalOutfitWears: number;
  mostWornItem?: WardrobeItem;
  mostWornOutfit?: Outfit;
  categoryBreakdown: Record<string, number>;
}

export const useWearStatistics = (
  allItems: WardrobeItem[],
  outfits: Outfit[],
  schedule: OutfitSchedule[]
): WearStats => {
  return useMemo(() => {
    // Calculate worn counts from schedule
    const wornSchedules = schedule.filter((s) => s.worn);

    // Build item wear counts
    const itemWearMap = new Map<string, number>();
    const categoryWearMap = new Map<string, number>();

    allItems.forEach((item) => {
      itemWearMap.set(item.id, item.wearCount || 0);
      const category = item.category;
      categoryWearMap.set(category, (categoryWearMap.get(category) || 0) + (item.wearCount || 0));
    });

    wornSchedules.forEach((sch) => {
      const outfit = outfits.find((o) => o.id === sch.outfitId);
      if (outfit) {
        if (outfit.top?.id) itemWearMap.set(outfit.top.id, (itemWearMap.get(outfit.top.id) || 0) + 1);
        if (outfit.bottom?.id) itemWearMap.set(outfit.bottom.id, (itemWearMap.get(outfit.bottom.id) || 0) + 1);
        if (outfit.shoes?.id) itemWearMap.set(outfit.shoes.id, (itemWearMap.get(outfit.shoes.id) || 0) + 1);

        if (outfit.top?.id) categoryWearMap.set(outfit.top.category, (categoryWearMap.get(outfit.top.category) || 0) + 1);
        if (outfit.bottom?.id) categoryWearMap.set(outfit.bottom.category, (categoryWearMap.get(outfit.bottom.category) || 0) + 1);
        if (outfit.shoes?.id) categoryWearMap.set(outfit.shoes.category, (categoryWearMap.get(outfit.shoes.category) || 0) + 1);
      }
    });

    // Calculate outfit wear counts
    const outfitWearMap = new Map<string, number>();
    wornSchedules.forEach((sch) => {
      outfitWearMap.set(sch.outfitId, (outfitWearMap.get(sch.outfitId) || 0) + 1);
    });

    const totalItemWears = Array.from(itemWearMap.values()).reduce((a, b) => a + b, 0);
    const totalOutfitWears = wornSchedules.length;

    // Build item stats
    const itemStats = allItems
      .filter((item) => itemWearMap.get(item.id)! > 0)
      .map((item) => ({
        item,
        category: item.category,
        wearCount: itemWearMap.get(item.id) || 0,
        percentage: totalItemWears > 0 ? Math.round((itemWearMap.get(item.id) || 0) / totalItemWears * 100) : 0,
      }))
      .sort((a, b) => b.wearCount - a.wearCount);

    // Build outfit stats
    const outfitStats = outfits
      .filter((outfit) => outfitWearMap.get(outfit.id)! > 0)
      .map((outfit) => ({
        outfit,
        wearCount: outfitWearMap.get(outfit.id) || 0,
        percentage: totalOutfitWears > 0 ? Math.round((outfitWearMap.get(outfit.id) || 0) / totalOutfitWears * 100) : 0,
      }))
      .sort((a, b) => b.wearCount - a.wearCount);

    const mostWornItem = itemStats.length > 0 ? itemStats[0].item : undefined;
    const mostWornOutfit = outfitStats.length > 0 ? outfitStats[0].outfit : undefined;

    return {
      itemStats,
      outfitStats,
      totalItemWears,
      totalOutfitWears,
      mostWornItem,
      mostWornOutfit,
      categoryBreakdown: Object.fromEntries(categoryWearMap),
    };
  }, [allItems, outfits, schedule]);
};
