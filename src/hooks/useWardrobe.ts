import { useState, useCallback } from "react";
import type { WardrobeItem, ClothingCategory } from "@/types/wardrobe";
import { sampleItems } from "@/data/sampleItems";

const STORAGE_KEY = "wardrobe_items";
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

function saveItems(items: WardrobeItem[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
}

export function useWardrobe() {
  const [items, setItems] = useState<WardrobeItem[]>(loadItems);
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

  const filteredItems =
    activeFilter === "All" ? items : items.filter((item) => item.category === activeFilter);

  return { items: filteredItems, allItems: items, activeFilter, setActiveFilter, addItem, deleteItem };
}
