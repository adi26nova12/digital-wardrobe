import { useState, useRef } from "react";
import type { ClothingCategory } from "@/types/wardrobe";
import { Camera, Image as ImageIcon, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { REMOVEBG_API_KEY } from "@/config/constants";
import * as supabaseService from "@/lib/supabaseService";

const itemCategories: Exclude<ClothingCategory, "All">[] = ["Tops", "Bottoms", "Shoes", "Outerwear"];

interface AddItemSheetProps {
  open: boolean;
  onClose: () => void;
  onAdd: (data: { imageUrl: string; category: Exclude<ClothingCategory, "All">; tag?: string }) => Promise<void>;
}

export function AddItemSheet({ open, onClose, onAdd }: AddItemSheetProps) {
  const [step, setStep] = useState<"source" | "category" | "tag" | "processing">("source");
  const [imageData, setImageData] = useState<string | null>(null);
  const [category, setCategory] = useState<Exclude<ClothingCategory, "All"> | null>(null);
  const [tag, setTag] = useState<string>("");
  const [removeBackground, setRemoveBackground] = useState(true);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);

  const reset = () => {
    setStep("source");
    setImageData(null);
    setCategory(null);
    setTag("");
    setRemoveBackground(true);
  };

  const handleClose = () => {
    reset();
    onClose();
  };

  const handleFile = (file: File) => {
    if (!file.type.startsWith("image/")) {
      toast.error("Please select an image file");
      return;
    }
    const reader = new FileReader();
    reader.onload = (e) => {
      setImageData(e.target?.result as string);
      setStep("category");
    };
    reader.readAsDataURL(file);
  };

  const compressImage = async (base64Data: string): Promise<Blob> => {
    return new Promise((resolve) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement("canvas");
        const MAX_WIDTH = 1024;
        const MAX_HEIGHT = 1024;
        let width = img.width;
        let height = img.height;

        if (width > height) {
          if (width > MAX_WIDTH) {
            height *= MAX_WIDTH / width;
            width = MAX_WIDTH;
          }
        } else {
          if (height > MAX_HEIGHT) {
            width *= MAX_HEIGHT / height;
            height = MAX_HEIGHT;
          }
        }

        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext("2d");
        ctx?.drawImage(img, 0, 0, width, height);
        canvas.toBlob(resolve, "image/jpeg", 0.8);
      };
      img.src = base64Data;
    });
  };

  const handleSubmit = async () => {
    if (!imageData || !category) return;
    setStep("processing");

    try {
      let finalBlob: Blob;
      let isBackgroundRemoved = false;

      // Compress image
      const compressedBlob = await compressImage(imageData);

      // Try background removal if enabled
      if (removeBackground) {
        try {
          const formData = new FormData();
          formData.append("image_file", compressedBlob, "image.jpg");
          formData.append("size", "auto");

          const controller = new AbortController();
          const timeoutId = setTimeout(() => controller.abort(), 10000);

          const res = await fetch("https://api.remove.bg/v1.0/removebg", {
            method: "POST",
            headers: { "X-Api-Key": REMOVEBG_API_KEY },
            body: formData,
            signal: controller.signal,
          });

          clearTimeout(timeoutId);

          if (res.ok) {
            finalBlob = await res.blob();
            isBackgroundRemoved = true;
          } else {
            finalBlob = compressedBlob;
          }
        } catch (error) {
          console.error("Background removal failed:", error);
          finalBlob = compressedBlob;
        }
      } else {
        finalBlob = compressedBlob;
      }

      // Upload to Supabase Storage
      let publicUrl: string;
      try {
        const url = await supabaseService.uploadImage(
          finalBlob,
          `${category.toLowerCase()}/${Date.now()}-${Math.random().toString(36).substring(7)}`
        );
        
        if (!url) {
          console.error("uploadImage returned null");
          toast.error("Failed to upload image - please try again");
          handleClose();
          return;
        }
        
        publicUrl = url;
      } catch (error) {
        console.error("Exception during upload:", error);
        toast.error("Failed to upload image");
        handleClose();
        return;
      }

      // Add item with Supabase Storage URL
      try {
        await onAdd({ imageUrl: publicUrl, category, tag: tag || undefined });
      } catch (error) {
        console.error("Failed to add item:", error);
        toast.error("Failed to add item");
        handleClose();
        return;
      }
      
      handleClose();
      
      if (isBackgroundRemoved) {
        toast.success("Item added - background removed!");
      } else {
        toast.success("Item added to wardrobe");
      }
    } catch (error: any) {
      console.error("Error in handleSubmit:", error);
      toast.error("Failed to add item");
      handleClose();
    }
  };

  if (!open) return null;

  return (
    <>
      <div className="fixed inset-0 z-40 bg-foreground/20" onClick={handleClose} />
      <div className="fixed inset-x-0 bottom-0 z-50 rounded-t-2xl bg-background p-6 shadow-lg animate-slide-up">
        <div className="flex items-center justify-between mb-6">
          <h3 className="font-display text-xl">
            {step === "source" && "Add Item"}
            {step === "category" && "Select Category"}
            {step === "tag" && "Add Tag (Optional)"}
            {step === "processing" && "Processing..."}
          </h3>
          <button onClick={handleClose} className="rounded-full p-1 hover:bg-secondary">
            <X className="h-5 w-5" />
          </button>
        </div>

        {step === "source" && (
          <div className="flex gap-3">
            <button
              onClick={() => cameraInputRef.current?.click()}
              className="flex flex-1 flex-col items-center gap-3 rounded-lg bg-secondary p-6 font-body text-sm font-medium transition-colors hover:bg-muted"
            >
              <Camera className="h-8 w-8" />
              Take Photo
            </button>
            <button
              onClick={() => fileInputRef.current?.click()}
              className="flex flex-1 flex-col items-center gap-3 rounded-lg bg-secondary p-6 font-body text-sm font-medium transition-colors hover:bg-muted"
            >
              <ImageIcon className="h-8 w-8" />
              Gallery
            </button>
            <input
              ref={cameraInputRef}
              type="file"
              accept="image/*"
              capture="environment"
              className="hidden"
              onChange={(e) => e.target.files?.[0] && handleFile(e.target.files[0])}
            />
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={(e) => e.target.files?.[0] && handleFile(e.target.files[0])}
            />
          </div>
        )}

        {step === "category" && (
          <div className="space-y-4">
            {imageData && (
              <div className="mx-auto h-32 w-32 rounded-lg bg-card overflow-hidden">
                <img src={imageData} alt="Preview" className="h-full w-full object-cover" />
              </div>
            )}
            <div className="grid grid-cols-2 gap-2">
              {itemCategories.map((cat) => (
                <button
                  key={cat}
                  onClick={() => setCategory(cat)}
                  className={cn(
                    "rounded-lg px-4 py-3 text-sm font-body font-medium transition-all",
                    cat === category
                      ? "bg-primary text-primary-foreground"
                      : "bg-secondary text-foreground hover:bg-muted"
                  )}
                >
                  {cat}
                </button>
              ))}
            </div>
            <div className="flex items-center gap-3 px-4 py-3 rounded-lg bg-secondary/50">
              <input
                type="checkbox"
                id="remove-bg"
                checked={removeBackground}
                onChange={(e) => setRemoveBackground(e.target.checked)}
                className="w-4 h-4 cursor-pointer"
              />
              <label htmlFor="remove-bg" className="text-sm font-body cursor-pointer flex-1">
                Remove background
              </label>
            </div>
            <button
              onClick={() => setStep("tag")}
              disabled={!category}
              className="w-full rounded-lg bg-primary py-3 text-sm font-body font-semibold text-primary-foreground transition-opacity disabled:opacity-40"
            >
              Next
            </button>
          </div>
        )}

        {step === "tag" && (
          <div className="space-y-4">
            <div className="mx-auto h-24 w-24 rounded-lg bg-card overflow-hidden">
              {imageData && <img src={imageData} alt="Preview" className="h-full w-full object-cover" />}
            </div>
            <div>
              <label className="text-sm font-body font-medium text-foreground">
                Item Tag (e.g., "Navy Hoodie")
              </label>
              <input
                type="text"
                value={tag}
                onChange={(e) => setTag(e.target.value)}
                placeholder="Enter a tag for this item..."
                maxLength={50}
                className="w-full mt-2 px-3 py-2 rounded-lg bg-secondary border border-transparent focus:border-primary focus:outline-none text-sm font-body"
              />
              <p className="text-xs text-muted-foreground mt-1">{tag.length}/50</p>
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => setStep("category")}
                className="flex-1 rounded-lg bg-secondary py-3 text-sm font-body font-semibold text-foreground transition-colors hover:bg-muted"
              >
                Back
              </button>
              <button
                onClick={handleSubmit}
                className="flex-1 rounded-lg bg-primary py-3 text-sm font-body font-semibold text-primary-foreground transition-opacity hover:bg-primary/90"
              >
                Add to Wardrobe
              </button>
            </div>
          </div>
        )}

        {step === "processing" && (
          <div className="space-y-4">
            <div className="mx-auto h-32 w-32 rounded-lg shimmer" />
            <p className="text-center text-sm text-muted-foreground font-body">
              {removeBackground ? "Removing background..." : "Adding item..."}
            </p>
          </div>
        )}
      </div>
    </>
  );
}
