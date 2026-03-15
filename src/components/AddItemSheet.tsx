import { useState, useRef } from "react";
import type { ClothingCategory } from "@/types/wardrobe";
import { Camera, Image, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

const itemCategories: Exclude<ClothingCategory, "All">[] = ["Tops", "Bottoms", "Shoes", "Outerwear"];

interface AddItemSheetProps {
  open: boolean;
  onClose: () => void;
  onAdd: (data: { imageUrl: string; category: Exclude<ClothingCategory, "All"> }) => void;
}

export function AddItemSheet({ open, onClose, onAdd }: AddItemSheetProps) {
  const [step, setStep] = useState<"source" | "category" | "processing">("source");
  const [imageData, setImageData] = useState<string | null>(null);
  const [category, setCategory] = useState<Exclude<ClothingCategory, "All"> | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);

  const reset = () => {
    setStep("source");
    setImageData(null);
    setCategory(null);
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

  const handleSubmit = async () => {
    if (!imageData || !category) return;
    setStep("processing");

    // Try remove.bg, fall back to original image
    try {
      const blob = await fetch(imageData).then((r) => r.blob());
      const formData = new FormData();
      formData.append("image_file", blob, "image.png");
      formData.append("size", "auto");

      const apiKey = localStorage.getItem("removebg_api_key");
      if (apiKey) {
        const res = await fetch("https://api.remove.bg/v1.0/removebg", {
          method: "POST",
          headers: { "X-Api-Key": apiKey },
          body: formData,
        });
        if (res.ok) {
          const resultBlob = await res.blob();
          const url = URL.createObjectURL(resultBlob);
          onAdd({ imageUrl: url, category });
          handleClose();
          toast.success("Item added to wardrobe");
          return;
        }
      }
      // Fallback: use original image
      onAdd({ imageUrl: imageData, category });
      handleClose();
      toast.success("Item added (without background removal)");
    } catch {
      onAdd({ imageUrl: imageData, category });
      handleClose();
      toast.success("Item added (without background removal)");
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
              <Image className="h-8 w-8" />
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
            <button
              onClick={handleSubmit}
              disabled={!category}
              className="w-full rounded-lg bg-primary py-3 text-sm font-body font-semibold text-primary-foreground transition-opacity disabled:opacity-40"
            >
              Add to Wardrobe
            </button>
          </div>
        )}

        {step === "processing" && (
          <div className="space-y-4">
            <div className="mx-auto h-32 w-32 rounded-lg shimmer" />
            <p className="text-center text-sm text-muted-foreground font-body">Removing background...</p>
          </div>
        )}
      </div>
    </>
  );
}
