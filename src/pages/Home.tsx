import { useNavigate } from "react-router-dom";
import { ArrowRight, Camera, Sparkles, Grid3X3 } from "lucide-react";
import heroImage from "@/assets/hero-wardrobe.png";

const Home = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-background flex flex-col animate-rise-in">
      {/* Hero */}
      <div className="relative overflow-hidden">
        <img
          src={heroImage}
          alt="Curated wardrobe"
          className="w-full h-72 object-cover object-center animate-soft-zoom"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-background via-background/40 to-transparent" />
        <div className="absolute bottom-6 left-6 right-6">
          <h1 className="font-display text-4xl font-bold tracking-tight leading-tight animate-rise-in [animation-delay:120ms]">
            Your Digital<br />Wardrobe
          </h1>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 px-6 pt-6 pb-10 space-y-8">
        <p className="text-muted-foreground font-body text-base leading-relaxed max-w-sm animate-rise-in [animation-delay:180ms]">
          Digitize your closet. Photograph your clothes, remove backgrounds automatically, and organize everything in one place.
        </p>

        {/* Feature pills */}
        <div className="space-y-3">
          {[
            { icon: Camera, title: "Snap & Capture", desc: "Take a photo or pick from gallery" },
            { icon: Sparkles, title: "Auto Background Removal", desc: "Clean catalog-style images instantly" },
            { icon: Grid3X3, title: "Organize & Filter", desc: "Categorize tops, bottoms, shoes & more" },
          ].map(({ icon: Icon, title, desc }, index) => (
            <div
              key={title}
              className="flex items-start gap-4 rounded-lg bg-card p-4 transition-transform duration-300 hover:-translate-y-0.5 animate-rise-in"
              style={{ animationDelay: `${260 + index * 100}ms` }}
            >
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary text-primary-foreground">
                <Icon className="h-5 w-5" />
              </div>
              <div>
                <p className="font-body font-semibold text-sm">{title}</p>
                <p className="text-xs text-muted-foreground font-body mt-0.5">{desc}</p>
              </div>
            </div>
          ))}
        </div>

        {/* CTA */}
        <button
          onClick={() => navigate("/wardrobe")}
          className="group flex w-full items-center justify-center gap-2 rounded-full bg-primary py-4 text-sm font-body font-semibold text-primary-foreground transition-transform hover:scale-[1.02] active:scale-[0.98] animate-rise-in [animation-delay:620ms]"
        >
          Open My Wardrobe
          <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
        </button>
      </div>
    </div>
  );
};

export default Home;
