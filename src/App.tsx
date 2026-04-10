import { useEffect, useMemo, useRef, useState } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { SUPABASE_URL } from "@/config/constants";
import Home from "./pages/Home.tsx";
import Index from "./pages/Index.tsx";
import NotFound from "./pages/NotFound.tsx";
import Recommendations from "./pages/Recommendations.tsx";
import Calendar from "./pages/Calendar.tsx";
import Statistics from "./pages/Statistics.tsx";

const queryClient = new QueryClient();
const backgroundVideoUrl = `${SUPABASE_URL}/storage/v1/object/public/wardrobe-images/background/background-web.mp4?v=1`;

const App = () => {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const videoSources = useMemo(
    () => [backgroundVideoUrl, "/video/background-web.mp4"],
    []
  );
  const [sourceIndex, setSourceIndex] = useState(0);

  useEffect(() => {
    const el = videoRef.current;
    if (!el) return;

    const tryPlay = async () => {
      try {
        await el.play();
      } catch {
        // Autoplay can fail transiently; browser often retries after metadata arrives.
      }
    };

    tryPlay();
  }, [sourceIndex]);

  const handleVideoError = () => {
    setSourceIndex((prev) => (prev < videoSources.length - 1 ? prev + 1 : prev));
  };

  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <div className="app-shell">
          <video
            ref={videoRef}
            className="app-bg-video"
            src={videoSources[sourceIndex]}
            autoPlay
            loop
            muted
            playsInline
            preload="metadata"
            aria-hidden="true"
            onError={handleVideoError}
          >
            <source src={videoSources[sourceIndex]} type="video/mp4" />
          </video>
          <div className="app-bg-overlay" aria-hidden="true" />
          <div className="app-content">
            <Toaster />
            <Sonner />
            <BrowserRouter>
              <Routes>
                <Route path="/" element={<Home />} />
                <Route path="/wardrobe" element={<Index />} />
                <Route path="/recommendations" element={<Recommendations />} />
                <Route path="/calendar" element={<Calendar />} />
                <Route path="/statistics" element={<Statistics />} />
                {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
                <Route path="*" element={<NotFound />} />
              </Routes>
            </BrowserRouter>
          </div>
        </div>
      </TooltipProvider>
    </QueryClientProvider>
  );
};

export default App;
