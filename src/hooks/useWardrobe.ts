import { useEffect, useState, useCallback } from "react";
import { v4 as uuidv4 } from "uuid";
import type { WardrobeItem, ClothingCategory, Outfit, OutfitSchedule } from "@/types/wardrobe";
import { sampleItems } from "@/data/sampleItems";
import * as supabaseService from "@/lib/supabaseService";

const STORAGE_KEY = "wardrobe_items";
const OUTFITS_STORAGE_KEY = "wardrobe_outfits";
const SCHEDULE_STORAGE_KEY = "wardrobe_schedule";
const INITIALIZED_KEY = "wardrobe_initialized";

function loadItems(): WardrobeItem[] {
  try {
    const data = localStorage.getItem(STORAGE_KEY);
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

export function useWardrobe() {
  const [items, setItems] = useState<WardrobeItem[]>(loadItems);
  const [outfits, setOutfits] = useState<Outfit[]>(loadOutfits);
  const [schedule, setSchedule] = useState<OutfitSchedule[]>(loadSchedule);
  const [activeFilter, setActiveFilter] = useState<ClothingCategory>("All");

  // Load data from Supabase on mount
  useEffect(() => {
    const loadFromSupabase = async () => {
      try {
        // Fetch items from Supabase
        const supabaseItems = await supabaseService.fetchWardrobeItems();
        if (supabaseItems && supabaseItems.length > 0) {
          setItems(supabaseItems);
          saveItems(supabaseItems);
        } else {
          // Initialize with sample items if empty
          const initialized = localStorage.getItem(INITIALIZED_KEY);
          if (!initialized) {
            localStorage.setItem(INITIALIZED_KEY, "true");
            setItems(sampleItems);
            saveItems(sampleItems);
          }
        }

        // Fetch outfits from Supabase
        const supabaseOutfits = await supabaseService.fetchOutfits();
        if (supabaseOutfits && supabaseOutfits.length > 0) {
          setOutfits(supabaseOutfits);
          saveOutfits(supabaseOutfits);
        }

        // Fetch schedules from Supabase
        const supabaseSchedules = await supabaseService.fetchOutfitSchedules();
        if (supabaseSchedules && supabaseSchedules.length > 0) {
          setSchedule(supabaseSchedules);
          saveSchedule(supabaseSchedules);
        }
      } catch (error) {
        console.error("Failed to load from Supabase:", error);
      }
    };

    loadFromSupabase();
  }, []);

  const addItem = useCallback(
    async (item: Omit<WardrobeItem, "id" | "createdAt">) => {
      const newItem: WardrobeItem = {
        ...item,
        id: uuidv4(),
        createdAt: Date.now(),
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
    // Update Supabase
    try {
      await supabaseService.updateWardrobeItemTag(id, tag);
    } catch (error) {
      console.error("Failed to update tag in Supabase:", error);
    }

    // Update local state
    setItems((prev) => {
      const updated = prev.map((item) =>
        item.id === id ? { ...item, tag: tag || undefined } : item
      );
      saveItems(updated);
      return updated;
    });
  }, []);

  const updateItemCategory = useCallback(async (id: string, category: Exclude<ClothingCategory, "All">) => {
    // Update Supabase
    try {
      await supabaseService.updateWardrobeItemCategory(id, category);
    } catch (error) {
      console.error("Failed to update category in Supabase:", error);
    }

    // Update local state
    setItems((prev) => {
      const updated = prev.map((item) =>
        item.id === id ? { ...item, category } : item
      );
      saveItems(updated);
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
    schedule,
    scheduleOutfit,
    removeSchedule,
    getOutfitForDate,
    markOutfitAsWorn,
    unmarkOutfitAsWorn,
    updateItemTag,
    updateItemCategory,
  };
}
