import { useEffect, useState, useCallback } from "react";
import { v4 as uuidv4 } from "uuid";
import type { WardrobeItem, ClothingCategory, ClothingOccasion, Outfit, OutfitSchedule } from "@/types/wardrobe";
import { sampleItems } from "@/data/sampleItems";
import * as supabaseService from "@/lib/supabaseService";

const STORAGE_KEY = "wardrobe_items";
const OUTFITS_STORAGE_KEY = "wardrobe_outfits";
const SCHEDULE_STORAGE_KEY = "wardrobe_schedule";
const INITIALIZED_KEY = "wardrobe_initialized";
const DATA_VERSION_KEY = "wardrobe_data_version";
const CURRENT_DATA_VERSION = "2"; // Increment when sample data changes

function loadItems(): WardrobeItem[] {
  try {
    const data = localStorage.getItem(STORAGE_KEY);
    // Simply load what's there - initialization handles empty case
    return data ? JSON.parse(data) : [];
  } catch {
    return [];
  }
}

function loadOutfits(): Outfit[] {
  try {
    const data = localStorage.getItem(OUTFITS_STORAGE_KEY);
    return data ? JSON.parse(data) : [];
  } catch {
    return [];
  }
}

function loadSchedule(): OutfitSchedule[] {
  try {
    const data = localStorage.getItem(SCHEDULE_STORAGE_KEY);
    return data ? JSON.parse(data) : [];
  } catch {
    return [];
  }
}

function saveItems(items: WardrobeItem[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
}

function saveOutfits(outfits: Outfit[]) {
  localStorage.setItem(OUTFITS_STORAGE_KEY, JSON.stringify(outfits));
}

function saveSchedule(schedule: OutfitSchedule[]) {
  localStorage.setItem(SCHEDULE_STORAGE_KEY, JSON.stringify(schedule));
}

// Migration: Add occasion field to items that don't have it
function migrateItemsWithOccasion(items: WardrobeItem[]): WardrobeItem[] {
  return items.map((item) => {
    if (!item.occasion) {
      // Try to infer occasion from tag or category first
      const tag = (item.tag || "").toLowerCase();
      const category = (item.category || "").toLowerCase();
      
      // Check tag/category for keywords
      if (tag.includes("party") || tag.includes("sequin") || tag.includes("formal")) {
        return { ...item, occasion: "Party" };
      }
      if (tag.includes("work") || tag.includes("office") || tag.includes("business") || tag.includes("blazer")) {
        return { ...item, occasion: "Work" };
      }
      if (tag.includes("athletic") || tag.includes("sport") || tag.includes("running") || tag.includes("gym")) {
        return { ...item, occasion: "Athletic" };
      }
      if (tag.includes("weekend") || tag.includes("casual")) {
        return { ...item, occasion: "Casual" };
      }
      if (tag.includes("outdoor") || tag.includes("hiking") || tag.includes("adventure")) {
        return { ...item, occasion: "Outdoor" };
      }
      
      // Fall back to style-based detection
      const style = item.style || "casual";
      const occasion = 
        style === "formal" ? "Formal" :
        style === "athletic" ? "Athletic" :
        style === "streetwear" ? "Casual" :
        style === "bohemian" ? "Weekend" :
        style === "vintage" ? "Weekend" :
        style === "minimal" ? "Work" :
        "Casual"; // default
      
      return { ...item, occasion };
    }
    return item;
  });
}

export function useWardrobe() {
  const [items, setItems] = useState<WardrobeItem[]>(() => {
    const loaded = loadItems();
    return migrateItemsWithOccasion(loaded);
  });
  const [outfits, setOutfits] = useState<Outfit[]>(loadOutfits);
  const [schedule, setSchedule] = useState<OutfitSchedule[]>(loadSchedule);
  
  // Initialize category filter from localStorage
  const [activeFilter, setActiveFilterState] = useState<ClothingCategory>(() => {
    try {
      const saved = localStorage.getItem("activeCategoryFilter");
      return (saved as ClothingCategory) || "All";
    } catch {
      return "All";
    }
  });

  // Wrapper to persist category filter to localStorage
  const setActiveFilter = (category: ClothingCategory) => {
    setActiveFilterState(category);
    try {
      localStorage.setItem("activeCategoryFilter", category);
    } catch (error) {
      console.error("Failed to save category filter:", error);
    }
  };

  // Load data from Supabase on mount
  useEffect(() => {
    const initializeData = async () => {
      try {
        // Check if we have local items first - they take priority over Supabase
        const existingLocal = localStorage.getItem(STORAGE_KEY);
        if (existingLocal && existingLocal.length > 2) {
          console.log("✓ Using local items from localStorage (local changes preserved)");
          // Local data is already loaded in useState, don't override it
          return;
        }

        // If no local data, try loading from Supabase
        console.log("📍 No local data, checking Supabase...");
        const supabaseItems = await supabaseService.fetchWardrobeItems();
        
        if (supabaseItems && supabaseItems.length > 0) {
          console.log("✓ Loading", supabaseItems.length, "items from Supabase");
          const migratedItems = migrateItemsWithOccasion(supabaseItems);
          setItems(migratedItems);
          saveItems(migratedItems);
        } else {
          // Initialize with sample items if both localStorage and Supabase are empty
          console.log("📋 No data found, loading sample items...");
          const migratedItems = migrateItemsWithOccasion(sampleItems);
          setItems(migratedItems);
          saveItems(migratedItems);
        }

        // Fetch outfits from Supabase
        const supabaseOutfits = await supabaseService.fetchOutfits();
        if (supabaseOutfits && supabaseOutfits.length > 0) {
          const existingLocal = localStorage.getItem(OUTFITS_STORAGE_KEY);
          if (!existingLocal) {
            setOutfits(supabaseOutfits);
            saveOutfits(supabaseOutfits);
          }
        }

        // Fetch schedules from Supabase
        const supabaseSchedules = await supabaseService.fetchOutfitSchedules();
        if (supabaseSchedules && supabaseSchedules.length > 0) {
          const existingLocal = localStorage.getItem(SCHEDULE_STORAGE_KEY);
          if (!existingLocal) {
            setSchedule(supabaseSchedules);
            saveSchedule(supabaseSchedules);
          }
        }
      } catch (error) {
        console.error("Failed to initialize data:", error);
        // If Supabase fails entirely, load sample data as fallback
        const existingLocal = localStorage.getItem(STORAGE_KEY);
        if (!existingLocal || existingLocal === "[]") {
          console.log("⚠️ Supabase failed, loading sample items as fallback");
          const migratedItems = migrateItemsWithOccasion(sampleItems);
          setItems(migratedItems);
          saveItems(migratedItems);
        }
      }
    };

    initializeData();
  }, []);

  const addItem = useCallback(
    async (item: Omit<WardrobeItem, "id" | "createdAt">) => {
      const newItem: WardrobeItem = {
        ...item,
        id: uuidv4(),
        createdAt: Date.now(),
        occasion: item.occasion || "Casual",
      };

      // Add to Supabase
      try {
        const result = await supabaseService.createWardrobeItem(newItem.category, newItem.imageUrl, newItem.tag);
        if (!result) {
          console.warn("Item not saved to Supabase, saving locally only");
        }
      } catch (error) {
        console.error("Failed to add item to Supabase:", error);
      }

      // Update local state
      setItems((prev) => {
        const updated = [newItem, ...prev];
        saveItems(updated);
        return updated;
      });
    },
    []
  );

  const deleteItem = useCallback(async (id: string) => {
    // Delete from Supabase
    try {
      await supabaseService.deleteWardrobeItem(id);
    } catch (error) {
      console.error("Failed to delete item from Supabase:", error);
    }

    // Update local state
    setItems((prev) => {
      const updated = prev.filter((item) => item.id !== id);
      saveItems(updated);
      return updated;
    });
  }, []);

  const addOutfit = useCallback(
    async (outfit: Omit<Outfit, "id" | "createdAt">) => {
      const newOutfit: Outfit = {
        ...outfit,
        id: uuidv4(),
        createdAt: Date.now(),
      };

      // Add to Supabase
      try {
        await supabaseService.createOutfit(outfit.top?.id || null, outfit.bottom?.id || null, outfit.shoes?.id || null);
      } catch (error) {
        console.error("Failed to add outfit to Supabase:", error);
      }

      // Update local state
      setOutfits((prev) => {
        const updated = [newOutfit, ...prev];
        saveOutfits(updated);
        return updated;
      });
    },
    []
  );

  const deleteOutfit = useCallback(async (id: string) => {
    // Delete from Supabase
    try {
      await supabaseService.deleteOutfit(id);
    } catch (error) {
      console.error("Failed to delete outfit from Supabase:", error);
    }

    // Update local state
    setOutfits((prev) => {
      const updated = prev.filter((outfit) => outfit.id !== id);
      saveOutfits(updated);
      return updated;
    });
  }, []);

  const scheduleOutfit = useCallback(async (outfitId: string, dateISO: string) => {
    setSchedule((prev) => {
      const existing = prev.find((s) => s.dateISO === dateISO);
      let updated: OutfitSchedule[];

      if (existing) {
        updated = prev.map((s) => (s.dateISO === dateISO ? { ...s, outfitId } : s));
        try {
          supabaseService.removeOutfitSchedule(existing.id);
          supabaseService.createOutfitSchedule(outfitId, dateISO);
        } catch (error) {
          console.error("Failed to update schedule in Supabase:", error);
        }
      } else {
        const newSchedule: OutfitSchedule = {
          id: uuidv4(),
          outfitId,
          dateISO,
          createdAt: Date.now(),
        };
        updated = [newSchedule, ...prev];
        try {
          supabaseService.createOutfitSchedule(outfitId, dateISO);
        } catch (error) {
          console.error("Failed to add schedule to Supabase:", error);
        }
      }

      saveSchedule(updated);
      return updated;
    });
  }, []);

  const removeSchedule = useCallback(async (id: string) => {
    setSchedule((prev) => {
      const updated = prev.filter((s) => s.id !== id);
      saveSchedule(updated);
      try {
        supabaseService.removeOutfitSchedule(id);
      } catch (error) {
        console.error("Failed to remove schedule from Supabase:", error);
      }
      return updated;
    });
  }, []);

  const getOutfitForDate = useCallback(
    (dateISO: string): Outfit | undefined => {
      const scheduleEntry = schedule.find((s) => s.dateISO === dateISO);
      if (!scheduleEntry) return undefined;
      return outfits.find((o) => o.id === scheduleEntry.outfitId);
    },
    [schedule, outfits]
  );

  const markOutfitAsWorn = useCallback(async (scheduleId: string) => {
    setSchedule((prev) => {
      const updated = prev.map((s) =>
        s.id === scheduleId
          ? { ...s, worn: true, wornDate: Date.now() }
          : s
      );
      saveSchedule(updated);
      try {
        supabaseService.markOutfitAsWorn(scheduleId, true);
      } catch (error) {
        console.error("Failed to mark as worn in Supabase:", error);
      }
      return updated;
    });
  }, []);

  const unmarkOutfitAsWorn = useCallback(async (scheduleId: string) => {
    setSchedule((prev) => {
      const updated = prev.map((s) =>
        s.id === scheduleId
          ? { ...s, worn: false, wornDate: undefined }
          : s
      );
      saveSchedule(updated);
      try {
        supabaseService.markOutfitAsWorn(scheduleId, false);
      } catch (error) {
        console.error("Failed to unmark as worn in Supabase:", error);
      }
      return updated;
    });
  }, []);

  const updateItemTag = useCallback(async (id: string, tag: string) => {
    // Get the full item first
    const item = items.find((i) => i.id === id);
    if (!item) return;

    // Update local state immediately
    const updatedItem = { ...item, tag: tag || undefined };
    setItems((prev) => {
      const updated = prev.map((i) =>
        i.id === id ? updatedItem : i
      );
      saveItems(updated);
      return updated;
    });

    // Sync to Supabase asynchronously (creates if doesn't exist)
    try {
      const result = await supabaseService.syncWardrobeItem(updatedItem);
      if (result) {
        console.log(`✓ Tag updated and synced to Supabase for item ${id}: "${tag}"`);
      } else {
        console.warn(`⚠️ Failed to sync tag to Supabase for item ${id}`);
      }
    } catch (error) {
      console.error(`❌ Failed to sync tag to Supabase:`, error);
    }
  }, [items]);

  const updateItemCategory = useCallback(async (id: string, category: Exclude<ClothingCategory, "All">) => {
    // Get the full item first
    const item = items.find((i) => i.id === id);
    if (!item) return;

    // Update local state immediately
    const updatedItem = { ...item, category };
    setItems((prev) => {
      const updated = prev.map((i) =>
        i.id === id ? updatedItem : i
      );
      saveItems(updated);
      return updated;
    });

    // Sync to Supabase asynchronously (creates if doesn't exist)
    try {
      const result = await supabaseService.syncWardrobeItem(updatedItem);
      if (result) {
        console.log(`✓ Category updated and synced to Supabase for item ${id}: "${category}"`);
      } else {
        console.warn(`⚠️ Failed to sync category to Supabase for item ${id}`);
      }
    } catch (error) {
      console.error(`❌ Failed to sync category to Supabase:`, error);
    }
  }, [items]);

  const updateItemOccasion = useCallback(async (id: string, occasion: Exclude<ClothingOccasion, "All">) => {
    // Get the full item first
    const item = items.find((i) => i.id === id);
    if (!item) return;

    // Update local state immediately
    const updatedItem = { ...item, occasion };
    setItems((prev) => {
      const updated = prev.map((i) =>
        i.id === id ? updatedItem : i
      );
      saveItems(updated);
      return updated;
    });

    // Sync to Supabase asynchronously (creates if doesn't exist)
    try {
      const result = await supabaseService.syncWardrobeItem(updatedItem);
      if (result) {
        console.log(`✓ Occasion updated and synced to Supabase for item ${id}: "${occasion}"`);
      } else {
        console.warn(`⚠️ Failed to sync occasion to Supabase for item ${id}`);
      }
    } catch (error) {
      console.error(`❌ Failed to sync occasion to Supabase:`, error);
    }
  }, [items]);

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
    schedule,
    scheduleOutfit,
    removeSchedule,
    getOutfitForDate,
    markOutfitAsWorn,
    unmarkOutfitAsWorn,
    updateItemTag,
    updateItemCategory,
    updateItemOccasion,
  };
}
