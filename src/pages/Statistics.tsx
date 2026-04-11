import { useNavigate } from "react-router-dom";
import { ChevronLeft, BarChart3 } from "lucide-react";
import { StatisticsDisplay } from "@/components/StatisticsDisplay";
import { useWardrobe } from "@/hooks/useWardrobe";
import { useWearStatistics } from "@/hooks/useWearStatistics";

const Statistics = () => {
  const navigate = useNavigate();
  const { allItems, outfits, schedule } = useWardrobe();
  const stats = useWearStatistics(allItems, outfits, schedule);

  const hasData = stats.totalItemWears > 0 || stats.totalOutfitWears > 0;

  return (
    <div className="min-h-screen bg-transparent animate-rise-in">
      <header className="sticky top-0 z-30 bg-background/55 backdrop-blur-md px-5 pt-8 pb-4 animate-rise-in [animation-delay:80ms]">
        <button
          onClick={() => navigate("/")}
          className="flex items-center gap-1 text-sm text-muted-foreground font-body mb-3 hover:text-foreground transition-colors"
        >
          <ChevronLeft className="h-4 w-4" /> Home
        </button>

        <div className="flex items-center justify-between gap-3 mb-1">
          <h1 className="font-display text-3xl font-semibold tracking-tight">Statistics</h1>
          <BarChart3 className="h-5 w-5 text-muted-foreground" />
        </div>

        <p className="text-sm text-muted-foreground font-body">
          Analyze your outfit wear patterns and preferences
        </p>
      </header>

      <main className="px-5 pb-16 pt-2 animate-rise-in [animation-delay:120ms]">
        <div className="space-y-8">
          {!hasData ? (
            <div className="flex flex-col items-center justify-center py-16 text-center">
              <p className="font-display text-2xl text-muted-foreground mb-2">No wear data yet</p>
              <p className="text-sm text-muted-foreground mb-6">
                Start scheduling and marking outfits as worn to see statistics
              </p>
              <button
                onClick={() => navigate("/calendar")}
                className="px-4 py-2 rounded-md bg-primary text-primary-foreground hover:bg-primary/90 transition-colors text-sm font-medium"
              >
                Go to Calendar
              </button>
            </div>
          ) : (
            <StatisticsDisplay stats={stats} allItems={allItems} />
          )}
        </div>
      </main>
    </div>
  );
};

export default Statistics;
