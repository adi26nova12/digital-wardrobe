import { useState, useCallback } from "react";
import type { WardrobeItem, ClothingCategory, Outfit } from "@/types/wardrobe";
import { sampleItems } from "@/data/sampleItems";

const STORAGE_KEY = "wardrobe_items";
const OUTFITS_STORAGE_KEY = "wardrobe_outfits";
const INITIALIZED_KEY = "wardrobe_initialized";

function loadItems(): WardrobeItem[] {
  try {
    const initialized = localStorage.getItem(INITIALIZED_KEY);
    if (!initialized) {
      localStorage.setItem(INITIALIZED_KEY, "true");
      localStorage.setItem(STORAGE_KEY, JSON.stringify(sampleItems));
      return sampleItems;
    }
    const data = localStorage.getItem(STORAGE_KEY);
    return data ? JSON.parse(data) : [];
  } catch {
    return [];
  }
}

function loadOutfits(): Outfit[] {
  try {
    const data = localStorage.getItem(OUTFITS_STORAGE_KEY);
    const result = data ? JSON.parse(data) : [];
    console.log("📂 Loaded outfits from localStorage:", result);
    return result;
  } catch {
    return [];
  }
}

function saveItems(items: WardrobeItem[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
}

function saveOutfits(outfits: Outfit[]) {
  console.log("💾 Saving outfits to localStorage:", outfits);
  localStorage.setItem(OUTFITS_STORAGE_KEY, JSON.stringify(outfits));
  console.log("✅ Outfits saved. Current localStorage:", localStorage.getItem(OUTFITS_STORAGE_KEY));
}

export function useWardrobe() {
  const [items, setItems] = useState<WardrobeItem[]>(loadItems);
  const [outfits, setOutfits] = useState<Outfit[]>(loadOutfits);
  const [activeFilter, setActiveFilter] = useState<ClothingCategory>("All");

  const addItem = useCallback((item: Omit<WardrobeItem, "id" | "createdAt">) => {
    const newItem: WardrobeItem = {
      ...item,
      id: crypto.randomUUID(),
      createdAt: Date.now(),
    };
    setItems((prev) => {
      const updated = [newItem, ...prev];
      saveItems(updated);
      return updated;
    });
  }, []);

  const deleteItem = useCallback((id: string) => {
    setItems((prev) => {
      const updated = prev.filter((item) => item.id !== id);
      saveItems(updated);
      return updated;
    });
  }, []);

  const addOutfit = useCallback((outfit: Omit<Outfit, "id" | "createdAt">) => {
    console.log("🎯 addOutfit called with:", outfit);
    const newOutfit: Outfit = {
      ...outfit,
      id: crypto.randomUUID(),
      createdAt: Date.now(),
    };
    console.log("📝 Creating new outfit:", newOutfit);
    setOutfits((prev) => {
      const updated = [newOutfit, ...prev];
      saveOutfits(updated);
      return updated;
    });
  }, []);

  const deleteOutfit = useCallback((id: string) => {
    setOutfits((prev) => {
      const updated = prev.filter((outfit) => outfit.id !== id);
      saveOutfits(updated);
      return updated;
    });
  }, []);

  const filteredItems =
    activeFilter === "All" ? items : items.filter((item) => item.category === activeFilter);

  return { 
    items: filteredItems, 
    allItems: items, 
    activeFilter, 
    setActiveFilter, 
    addItem, 
    deleteItem,
    outfits,
    addOutfit,
    deleteOutfit,
  };
}
