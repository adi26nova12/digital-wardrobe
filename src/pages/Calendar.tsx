import { useNavigate } from "react-router-dom";
import { ChevronLeft, Calendar } from "lucide-react";
import { OutfitCalendar } from "@/components/OutfitCalendar";
import { useWardrobe } from "@/hooks/useWardrobe";

const CalendarPage = () => {
  const navigate = useNavigate();
  const { outfits, schedule, scheduleOutfit, removeSchedule, getOutfitForDate, markOutfitAsWorn, unmarkOutfitAsWorn } = useWardrobe();

  return (
    <div className="min-h-screen bg-background animate-rise-in">
      <header className="sticky top-0 z-30 bg-background/95 backdrop-blur-sm px-5 pt-8 pb-4 animate-rise-in [animation-delay:80ms]">
        <button
          onClick={() => navigate("/")}
          className="flex items-center gap-1 text-sm text-muted-foreground font-body mb-3 hover:text-foreground transition-colors"
        >
          <ChevronLeft className="h-4 w-4" /> Home
        </button>

        <div className="flex items-center justify-between gap-3 mb-1">
          <h1 className="font-display text-3xl font-semibold tracking-tight">Calendar</h1>
          <Calendar className="h-5 w-5 text-muted-foreground" />
        </div>

        <p className="text-sm text-muted-foreground font-body">
          Plan your outfits for upcoming days
        </p>
      </header>

      <main className="px-5 pb-16 pt-2 animate-rise-in [animation-delay:120ms]">
        {outfits.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-24 text-center">
            <p className="font-display text-2xl text-muted-foreground mb-2">No outfits yet</p>
            <p className="text-sm text-muted-foreground mb-6">Create some outfits in your wardrobe to schedule them</p>
            <button
              onClick={() => navigate("/wardrobe")}
              className="px-4 py-2 rounded-md bg-primary text-primary-foreground hover:bg-primary/90 transition-colors text-sm font-medium"
            >
              Go to Wardrobe
            </button>
          </div>
        ) : (
          <OutfitCalendar
            outfits={outfits}
            schedule={schedule}
            onScheduleOutfit={scheduleOutfit}
            onRemoveSchedule={removeSchedule}
            getOutfitForDate={getOutfitForDate}
            onMarkAsWorn={markOutfitAsWorn}
            onUnmarkAsWorn={unmarkOutfitAsWorn}
          />
        )}
      </main>
    </div>
  );
};

export default CalendarPage;
