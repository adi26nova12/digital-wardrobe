import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import type { Outfit } from "@/types/wardrobe";
import { Calendar } from "lucide-react";

interface RecommendationsSchedulerProps {
  recommendations: Outfit[];
  onScheduleOutfit: (outfitId: string, dateISO: string) => void;
}

export function RecommendationsScheduler({ recommendations, onScheduleOutfit }: RecommendationsSchedulerProps) {
  const [selectedDateISO, setSelectedDateISO] = useState<string>("");

  if (recommendations.length === 0) {
    return null;
  }

  const handleSchedule = (outfitId: string) => {
    if (selectedDateISO) {
      onScheduleOutfit(outfitId, selectedDateISO);
      setSelectedDateISO("");
    }
  };

  const today = new Date().toISOString().split("T")[0];

  return (
    <div className="bg-card rounded-lg border border-border p-4 space-y-3">
      <div className="flex items-center gap-2">
        <Calendar className="h-4 w-4 text-primary" />
        <h3 className="font-display text-base font-semibold">Schedule Recommendations</h3>
      </div>
      
      <p className="text-xs text-muted-foreground">
        Pick a suggested outfit and a date to schedule it
      </p>

      <div className="space-y-2">
        {/* Date picker */}
        <div className="flex flex-col gap-1">
          <label className="text-xs font-medium">Select Date</label>
          <input
            type="date"
            value={selectedDateISO}
            onChange={(e) => setSelectedDateISO(e.target.value)}
            min={today}
            className="px-2 py-1 rounded-md border border-border bg-background text-foreground text-sm"
          />
        </div>

        {/* Recommended outfits grid */}
        <div>
          <p className="text-xs text-muted-foreground mb-1">Recommended Outfits</p>
          <div className="grid grid-cols-4 gap-1 max-h-64 overflow-y-auto">
            {recommendations.map((outfit) => (
              <Dialog key={outfit.id}>
                <DialogTrigger asChild>
                  <button
                    className="group relative aspect-square rounded-lg bg-card overflow-hidden border border-border transition-all hover:border-foreground/30 hover:scale-105 cursor-pointer"
                  >
                    <div className="h-full w-full flex items-center justify-center p-2 bg-card/50">
                      <div className="relative h-full w-full">
                        {outfit.top && (
                          <div className="absolute top-[4%] left-1/2 h-[44%] w-[78%] -translate-x-1/2 flex items-center justify-center">
                            <img
                              src={outfit.top.imageUrl}
                              alt="top"
                              className="h-full w-full object-contain"
                            />
                          </div>
                        )}
                        {outfit.bottom && (
                          <div className="absolute top-[42%] left-1/2 h-[46%] w-[76%] -translate-x-1/2 flex items-center justify-center">
                            <img
                              src={outfit.bottom.imageUrl}
                              alt="bottom"
                              className="h-full w-full object-contain"
                            />
                          </div>
                        )}
                        {outfit.shoes && (
                          <div className="absolute bottom-[2%] left-1/2 h-[18%] w-[86%] -translate-x-1/2 flex items-center justify-center">
                            <img
                              src={outfit.shoes.imageUrl}
                              alt="shoes"
                              className="h-full w-full object-contain"
                            />
                          </div>
                        )}
                      </div>
                    </div>
                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors rounded-lg" />
                  </button>
                </DialogTrigger>

                <DialogContent>
                  <DialogHeader>
                    <DialogTitle className="text-base">Schedule This Outfit</DialogTitle>
                  </DialogHeader>

                  <div className="space-y-2">
                    <div className="h-40 rounded-lg bg-card/50 flex items-center justify-center p-2 relative w-full">
                      {outfit.top && (
                        <div className="absolute top-[4%] left-1/2 h-[44%] w-[78%] -translate-x-1/2 flex items-center justify-center">
                          <img
                            src={outfit.top.imageUrl}
                            alt="top"
                            className="h-full w-full object-contain"
                          />
                        </div>
                      )}
                      {outfit.bottom && (
                        <div className="absolute top-[42%] left-1/2 h-[46%] w-[76%] -translate-x-1/2 flex items-center justify-center">
                          <img
                            src={outfit.bottom.imageUrl}
                            alt="bottom"
                            className="h-full w-full object-contain"
                          />
                        </div>
                      )}
                      {outfit.shoes && (
                        <div className="absolute bottom-[2%] left-1/2 h-[18%] w-[86%] -translate-x-1/2 flex items-center justify-center">
                          <img
                            src={outfit.shoes.imageUrl}
                            alt="shoes"
                            className="h-full w-full object-contain"
                          />
                        </div>
                      )}
                    </div>

                    <div className="bg-background rounded-lg p-2 text-xs">
                      <p className="text-muted-foreground">
                        {selectedDateISO
                          ? `Scheduled for ${new Date(selectedDateISO + "T00:00:00").toLocaleDateString("en-US", {
                              weekday: "short",
                              month: "short",
                              day: "numeric",
                            })}`
                          : "Select a date above"}
                      </p>
                    </div>

                    <Button
                      onClick={() => {
                        handleSchedule(outfit.id);
                      }}
                      disabled={!selectedDateISO}
                      className="w-full"
                      size="sm"
                    >
                      Schedule Outfit
                    </Button>
                  </div>
                </DialogContent>
              </Dialog>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
