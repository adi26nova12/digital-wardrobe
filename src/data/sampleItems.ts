import sampleTshirt from "@/assets/sample-tshirt.png";
import sampleJeans from "@/assets/sample-jeans.png";
import sampleSneakers from "@/assets/sample-sneakers.png";
import sampleJacket from "@/assets/sample-jacket.png";
import sampleHoodie from "@/assets/sample-hoodie.png";
import sampleShorts from "@/assets/sample-shorts.png";
import type { WardrobeItem } from "@/types/wardrobe";

export const sampleItems: WardrobeItem[] = [
  { id: "sample-1", imageUrl: sampleTshirt, category: "Tops", createdAt: Date.now() - 5000 },
  { id: "sample-2", imageUrl: sampleJeans, category: "Bottoms", createdAt: Date.now() - 4000 },
  { id: "sample-3", imageUrl: sampleSneakers, category: "Shoes", createdAt: Date.now() - 3000 },
  { id: "sample-4", imageUrl: sampleJacket, category: "Outerwear", createdAt: Date.now() - 2000 },
  { id: "sample-5", imageUrl: sampleHoodie, category: "Tops", createdAt: Date.now() - 1000 },
  { id: "sample-6", imageUrl: sampleShorts, category: "Bottoms", createdAt: Date.now() },
];
