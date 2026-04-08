import { useState } from "react";
import { ChevronLeft, ChevronRight, X, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import type { Outfit, OutfitSchedule } from "@/types/wardrobe";

interface OutfitCalendarProps {
  outfits: Outfit[];
  schedule: OutfitSchedule[];
  onScheduleOutfit: (outfitId: string, dateISO: string) => void;
  onRemoveSchedule: (dateISO: string) => void;
  getOutfitForDate: (dateISO: string) => Outfit | undefined;
  onMarkAsWorn?: (scheduleId: string) => void;
  onUnmarkAsWorn?: (scheduleId: string) => void;
}

export function OutfitCalendar({
  outfits,
  schedule,
  onScheduleOutfit,
  onRemoveSchedule,
  getOutfitForDate,
  onMarkAsWorn,
  onUnmarkAsWorn,
}: OutfitCalendarProps) {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<string | null>(null);

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  const firstDay = new Date(year, month, 1);
  const lastDay = new Date(year, month + 1, 0);
  const daysInMonth = lastDay.getDate();
  const startingDayOfWeek = firstDay.getDay();

  const days = [];
  for (let i = 0; i < startingDayOfWeek; i++) {
    days.push(null);
  }
  for (let i = 1; i <= daysInMonth; i++) {
    days.push(i);
  }

  const handlePrevMonth = () => {
    setCurrentDate(new Date(year, month - 1, 1));
  };

  const handleNextMonth = () => {
    setCurrentDate(new Date(year, month + 1, 1));
  };

  const getDateISO = (day: number): string => {
    return new Date(year, month, day).toISOString().split("T")[0];
  };

  const isToday = (day: number): boolean => {
    const today = new Date();
    return (
      day === today.getDate() &&
      month === today.getMonth() &&
      year === today.getFullYear()
    );
  };

  const monthNames = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December",
  ];

  const dayNames = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

  return (
    <div className="w-full">
      <div className="bg-card rounded-lg border border-border p-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <h2 className="font-display text-2xl font-semibold">
            {monthNames[month]} {year}
          </h2>
          <div className="flex gap-2">
            <Button
              onClick={handlePrevMonth}
              variant="outline"
              size="sm"
              className="gap-I"
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <Button
              onClick={handleNextMonth}
              variant="outline"
              size="sm"
              className="gap-1"
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Day names */}
        <div className="grid grid-cols-7 gap-1 mb-2">
          {dayNames.map((day) => (
            <div key={day} className="text-center text-xs font-semibold text-muted-foreground py-2">
              {day}
            </div>
          ))}
        </div>

        {/* Calendar grid */}
        <div className="grid grid-cols-7 gap-1">
          {days.map((day, index) => {
            if (day === null) {
              return <div key={`empty-${index}`} className="aspect-square" />;
            }

            const dateISO = getDateISO(day);
            const outfit = getOutfitForDate(dateISO);
            const today = isToday(day);

            return (
              <Dialog key={day}>
                <DialogTrigger asChild>
                  <button
                    onClick={() => setSelectedDate(dateISO)}
                    className={`aspect-square rounded-md p-1 text-xs font-medium transition-all hover:bg-accent flex flex-col items-center justify-center gap-1 cursor-pointer ${
                      today
                        ? "bg-primary/10 border-2 border-primary"
                        : "bg-card border border-border hover:border-foreground/20"
                    } ${outfit ? "ring-2 ring-primary/50" : ""}`}
                  >
                    <span className="font-semibold text-sm">{day}</span>
                    {outfit && (
                      <div className="w-full h-6 rounded overflow-hidden">
                        <img
                          src={outfit.top?.imageUrl || outfit.bottom?.imageUrl || outfit.shoes?.imageUrl || ""}
                          alt="outfit"
                          className="h-full w-full object-cover"
                        />
                      </div>
                    )}
                  </button>
                </DialogTrigger>

                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>
                      {monthNames[month]} {day}, {year}
                    </DialogTitle>
                  </DialogHeader>

                  <div className="space-y-4">
                    {outfit ? (
                      <>
                        <div className="bg-card rounded-lg border border-border p-4">
                          <h3 className="text-sm font-semibold mb-3">Current Outfit</h3>
                          <div className="aspect-square rounded-lg bg-card/50 flex items-center justify-center p-4 relative w-full">
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
                          <div className="flex gap-2 mt-4">
                            {(() => {
                              const scheduleEntry = schedule.find((s) => s.dateISO === dateISO);
                              return (
                                <>
                                  <Button
                                    onClick={() => {
                                      onRemoveSchedule(dateISO);
                                      setSelectedDate(null);
                                    }}
                                    variant="destructive"
                                    className="flex-1"
                                    size="sm"
                                  >
                                    <X className="h-4 w-4 mr-2" />
                                    Remove
                                  </Button>
                                  {scheduleEntry && onMarkAsWorn && (
                                    <Button
                                      onClick={() => {
                                        scheduleEntry.worn ? onUnmarkAsWorn?.(scheduleEntry.id) : onMarkAsWorn(scheduleEntry.id);
                                      }}
                                      variant={scheduleEntry.worn ? "default" : "outline"}
                                      className="flex-1"
                                      size="sm"
                                    >
                                      <Check className="h-4 w-4 mr-2" />
                                      {scheduleEntry.worn ? "Worn" : "Mark Worn"}
                                    </Button>
                                  )}
                                </>
                              );
                            })()}
                          </div>
                        </div>
                        <div className="border-t pt-4">
                          <h3 className="text-sm font-semibold mb-3">Or choose another:</h3>
                        </div>
                      </>
                    ) : (
                      <p className="text-sm text-muted-foreground">No outfit scheduled for this date</p>
                    )}

                    <div className="grid grid-cols-2 gap-3 max-h-[300px] overflow-y-auto">
                      {outfits.map((outfitOption) => (
                        <button
                          key={outfitOption.id}
                          onClick={() => {
                            onScheduleOutfit(outfitOption.id, dateISO);
                            setSelectedDate(null);
                          }}
                          className="group relative aspect-square rounded-lg bg-card overflow-hidden border border-border transition-all hover:border-foreground/30 hover:scale-105"
                        >
                          <div className="h-full w-full flex items-center justify-center p-2 bg-card/50">
                            <div className="relative h-full w-full">
                              {outfitOption.top && (
                                <div className="absolute top-[4%] left-1/2 h-[44%] w-[78%] -translate-x-1/2 flex items-center justify-center">
                                  <img
                                    src={outfitOption.top.imageUrl}
                                    alt="top"
                                    className="h-full w-full object-contain"
                                  />
                                </div>
                              )}
                              {outfitOption.bottom && (
                                <div className="absolute top-[42%] left-1/2 h-[46%] w-[76%] -translate-x-1/2 flex items-center justify-center">
                                  <img
                                    src={outfitOption.bottom.imageUrl}
                                    alt="bottom"
                                    className="h-full w-full object-contain"
                                  />
                                </div>
                              )}
                              {outfitOption.shoes && (
                                <div className="absolute bottom-[2%] left-1/2 h-[18%] w-[86%] -translate-x-1/2 flex items-center justify-center">
                                  <img
                                    src={outfitOption.shoes.imageUrl}
                                    alt="shoes"
                                    className="h-full w-full object-contain"
                                  />
                                </div>
                              )}
                            </div>
                          </div>
                          <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors rounded-lg" />
                        </button>
                      ))}
                    </div>
                  </div>
                </DialogContent>
              </Dialog>
            );
          })}
        </div>
      </div>
    </div>
  );
}
