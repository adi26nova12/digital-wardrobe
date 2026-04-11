import { supabase } from "./supabase";
import type { WardrobeItem, Outfit, OutfitSchedule } from "@/types/wardrobe";

// ============ IMAGES ============
export async function uploadImage(file: Blob, path: string): Promise<string | null> {
  try {
    // Try to upload to storage
    const { data, error } = await supabase.storage
      .from("wardrobe-images")
      .upload(path, file, { upsert: true });

    if (error) {
      console.error("Storage upload error:", error);
      // If bucket doesn't exist or access denied, return a fallback object URL
      // The item will still be saved locally
      const objectUrl = URL.createObjectURL(file);
      console.warn("Using local blob URL as fallback:", objectUrl);
      return objectUrl;
    }

    // Get public URL from the uploaded file
    const { data: publicData } = supabase.storage
      .from("wardrobe-images")
      .getPublicUrl(data.path);

    console.log("Image uploaded successfully:", publicData.publicUrl);
    return publicData.publicUrl;
  } catch (error) {
    console.error("Image upload exception:", error);
    // Fallback to local blob URL if upload fails
    const objectUrl = URL.createObjectURL(file);
    console.warn("Using local blob URL as fallback:", objectUrl);
    return objectUrl;
  }
}

// ============ WARDROBE ITEMS ============
export async function createWardrobeItem(
  category: WardrobeItem["category"],
  imageUrl: string,
  tag?: string
): Promise<WardrobeItem | null> {
  try {
    const { data, error } = await supabase
      .from("wardrobe_items")
      .insert([{ category, image_url: imageUrl, tag: tag || null }])
      .select()
      .single();

    if (error) {
      console.error("Database insert error:", error);
      return {
        id: `local-${Date.now()}`,
        category,
        imageUrl,
        tag,
        createdAt: Date.now(),
      };
    }

    return data
      ? {
          id: data.id,
          category: data.category,
          imageUrl: data.image_url,
          tag: data.tag,
          createdAt: new Date(data.created_at).getTime(),
        }
      : null;
  } catch (error) {
    console.error("Failed to create wardrobe item:", error);
    return {
      id: `local-${Date.now()}`,
      category,
      imageUrl,
      tag,
      createdAt: Date.now(),
    };
  }
}

export async function fetchWardrobeItems(): Promise<WardrobeItem[]> {
  try {
    const { data, error } = await supabase
      .from("wardrobe_items")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) throw error;

    return data.map((item) => ({
      id: item.id,
      category: item.category,
      imageUrl: item.image_url,
      tag: item.tag,
      color: item.color,
      style: item.style,
      occasion: item.occasion,
      thickness: item.thickness,
      season: item.season,
      material: item.material,
      wearCount: item.wear_count,
      createdAt: new Date(item.created_at).getTime(),
    }));
  } catch (error) {
    console.error("Failed to fetch wardrobe items:", error);
    return [];
  }
}

export async function deleteWardrobeItem(id: string): Promise<boolean> {
  try {
    const { error } = await supabase.from("wardrobe_items").delete().eq("id", id);

    if (error) throw error;
    return true;
  } catch (error) {
    console.error("Failed to delete wardrobe item:", error);
    return false;
  }
}

export async function updateWardrobeItemTag(id: string, tag: string): Promise<boolean> {
  try {
    const { error, data } = await supabase
      .from("wardrobe_items")
      .update({ tag: tag || null })
      .eq("id", id)
      .select();

    if (error) {
      console.error("Database error updating tag:", error);
      return false;
    }

    // Check if any rows were actually updated
    if (!data || data.length === 0) {
      console.warn(`No rows updated for id ${id} - item may not exist in Supabase`);
      return false;
    }

    return true;
  } catch (error) {
    console.error("Failed to update wardrobe item tag:", error);
    return false;
  }
}

export async function updateWardrobeItemCategory(id: string, category: WardrobeItem["category"]): Promise<boolean> {
  try {
    const { error, data } = await supabase
      .from("wardrobe_items")
      .update({ category })
      .eq("id", id)
      .select();

    if (error) {
      console.error("Database error updating category:", error);
      return false;
    }

    if (!data || data.length === 0) {
      console.warn(`No rows updated for id ${id} - item may not exist in Supabase`);
      return false;
    }

    return true;
  } catch (error) {
    console.error("Failed to update wardrobe item category:", error);
    return false;
  }
}

export async function updateWardrobeItemOccasion(id: string, occasion: WardrobeItem["occasion"]): Promise<boolean> {
  try {
    const { error, data } = await supabase
      .from("wardrobe_items")
      .update({ occasion })
      .eq("id", id)
      .select();

    if (error) {
      console.error("Database error updating occasion:", error);
      return false;
    }

    if (!data || data.length === 0) {
      console.warn(`No rows updated for id ${id} - item may not exist in Supabase`);
      return false;
    }

    return true;
  } catch (error) {
    console.error("Failed to update wardrobe item occasion:", error);
    return false;
  }
}

/**
 * Sync (upsert) a wardrobe item to Supabase
 * Creates it if it doesn't exist, otherwise updates it
 */
export async function syncWardrobeItem(item: WardrobeItem): Promise<boolean> {
  try {
    // Try to insert or update using upsert
    const { error } = await supabase
      .from("wardrobe_items")
      .upsert(
        {
          id: item.id,
          category: item.category,
          image_url: item.imageUrl,
          tag: item.tag || null,
          color: item.color || null,
          style: item.style || null,
          occasion: item.occasion || null,
          thickness: item.thickness || null,
          season: item.season || null,
          material: item.material || null,
          wear_count: item.wearCount || 0,
          created_at: new Date(item.createdAt).toISOString(),
        },
        { onConflict: "id" }
      );

    if (error) {
      console.error(`Failed to sync item ${item.id} to Supabase:`, error);
      return false;
    }

    console.log(`✓ Item ${item.id} synced to Supabase`);
    return true;
  } catch (error) {
    console.error(`Failed to sync wardrobe item ${item.id}:`, error);
    return false;
  }
}

// ============ OUTFITS ============
export async function createOutfit(
  topId: string | null,
  bottomId: string | null,
  shoesId: string | null
): Promise<Outfit | null> {
  try {
    const { data, error } = await supabase
      .from("outfits")
      .insert([{ top_id: topId, bottom_id: bottomId, shoes_id: shoesId }])
      .select()
      .single();

    if (error) throw error;

    return await formatOutfitData(data);
  } catch (error) {
    console.error("Failed to create outfit:", error);
    return null;
  }
}

export async function fetchOutfits(): Promise<Outfit[]> {
  try {
    const { data, error } = await supabase
      .from("outfits")
      .select("*, top_id(*), bottom_id(*), shoes_id(*)")
      .order("created_at", { ascending: false });

    if (error) throw error;

    return Promise.all(data.map((outfit) => formatOutfitData(outfit)));
  } catch (error) {
    console.error("Failed to fetch outfits:", error);
    return [];
  }
}

export async function deleteOutfit(id: string): Promise<boolean> {
  try {
    const { error } = await supabase.from("outfits").delete().eq("id", id);

    if (error) throw error;
    return true;
  } catch (error) {
    console.error("Failed to delete outfit:", error);
    return false;
  }
}

// ============ OUTFIT SCHEDULES ============
export async function createOutfitSchedule(
  outfitId: string,
  dateISO: string
): Promise<OutfitSchedule | null> {
  try {
    const { data, error } = await supabase
      .from("outfit_schedules")
      .insert([{ outfit_id: outfitId, date_iso: dateISO }])
      .select()
      .single();

    if (error) throw error;

    return {
      id: data.id,
      outfitId: data.outfit_id,
      dateISO: data.date_iso,
      createdAt: new Date(data.created_at).getTime(),
      worn: data.worn,
      wornDate: data.worn_date ? new Date(data.worn_date).getTime() : undefined,
    };
  } catch (error) {
    console.error("Failed to create outfit schedule:", error);
    return null;
  }
}

export async function fetchOutfitSchedules(): Promise<OutfitSchedule[]> {
  try {
    const { data, error } = await supabase
      .from("outfit_schedules")
      .select("*")
      .order("date_iso", { ascending: false });

    if (error) throw error;

    return data.map((schedule) => ({
      id: schedule.id,
      outfitId: schedule.outfit_id,
      dateISO: schedule.date_iso,
      createdAt: new Date(schedule.created_at).getTime(),
      worn: schedule.worn,
      wornDate: schedule.worn_date ? new Date(schedule.worn_date).getTime() : undefined,
    }));
  } catch (error) {
    console.error("Failed to fetch outfit schedules:", error);
    return [];
  }
}

export async function removeOutfitSchedule(id: string): Promise<boolean> {
  try {
    const { error } = await supabase.from("outfit_schedules").delete().eq("id", id);

    if (error) throw error;
    return true;
  } catch (error) {
    console.error("Failed to remove outfit schedule:", error);
    return false;
  }
}

export async function markOutfitAsWorn(
  scheduleId: string,
  worn: boolean = true
): Promise<boolean> {
  try {
    const { error } = await supabase
      .from("outfit_schedules")
      .update({ worn, worn_date: worn ? new Date().toISOString() : null })
      .eq("id", scheduleId);

    if (error) throw error;
    return true;
  } catch (error) {
    console.error("Failed to mark outfit as worn:", error);
    return false;
  }
}

// ============ HELPERS ============
async function formatOutfitData(outfit: any): Promise<Outfit> {
  // Fetch full item data if needed
  let top, bottom, shoes;

  if (outfit.top_id && typeof outfit.top_id === "string") {
    const { data } = await supabase
      .from("wardrobe_items")
      .select("*")
      .eq("id", outfit.top_id)
      .single();
    top = data
      ? {
          id: data.id,
          category: data.category,
          imageUrl: data.image_url,
          createdAt: new Date(data.created_at).getTime(),
        }
      : undefined;
  } else {
    top = outfit.top_id
      ? {
          id: outfit.top_id.id,
          category: outfit.top_id.category,
          imageUrl: outfit.top_id.image_url,
          createdAt: new Date(outfit.top_id.created_at).getTime(),
        }
      : undefined;
  }

  if (outfit.bottom_id && typeof outfit.bottom_id === "string") {
    const { data } = await supabase
      .from("wardrobe_items")
      .select("*")
      .eq("id", outfit.bottom_id)
      .single();
    bottom = data
      ? {
          id: data.id,
          category: data.category,
          imageUrl: data.image_url,
          createdAt: new Date(data.created_at).getTime(),
        }
      : undefined;
  } else {
    bottom = outfit.bottom_id
      ? {
          id: outfit.bottom_id.id,
          category: outfit.bottom_id.category,
          imageUrl: outfit.bottom_id.image_url,
          createdAt: new Date(outfit.bottom_id.created_at).getTime(),
        }
      : undefined;
  }

  if (outfit.shoes_id && typeof outfit.shoes_id === "string") {
    const { data } = await supabase
      .from("wardrobe_items")
      .select("*")
      .eq("id", outfit.shoes_id)
      .single();
    shoes = data
      ? {
          id: data.id,
          category: data.category,
          imageUrl: data.image_url,
          createdAt: new Date(data.created_at).getTime(),
        }
      : undefined;
  } else {
    shoes = outfit.shoes_id
      ? {
          id: outfit.shoes_id.id,
          category: outfit.shoes_id.category,
          imageUrl: outfit.shoes_id.image_url,
          createdAt: new Date(outfit.shoes_id.created_at).getTime(),
        }
      : undefined;
  }

  return {
    id: outfit.id,
    top,
    bottom,
    shoes,
    createdAt: new Date(outfit.created_at).getTime(),
  };
}
