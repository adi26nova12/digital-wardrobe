import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from "recharts";
import { Leaf } from "lucide-react";
import type { WearStats } from "@/hooks/useWearStatistics";
import type { WardrobeItem } from "@/types/wardrobe";

const COLORS = ["#3b82f6", "#ef4444", "#10b981", "#f59e0b", "#8b5cf6", "#ec4899", "#14b8a6", "#f97316"];

interface StatisticsDisplayProps {
  stats: WearStats;
  allItems?: WardrobeItem[];
}

export function StatisticsDisplay({ stats, allItems = [] }: StatisticsDisplayProps) {
  const categoryData = Object.entries(stats.categoryBreakdown).map(([category, count]) => ({
    name: category,
    value: count,
  }));

  // Calculate least worn items
  const leastWornItems = allItems
    .sort((a, b) => (a.wearCount || 0) - (b.wearCount || 0))
    .slice(0, 4);

  return (
    <div className="space-y-8">
      {/* Summary Cards */}
      <div className="grid grid-cols-2 gap-4">
        <div className="bg-card rounded-lg border border-border p-6">
          <p className="text-xs text-muted-foreground font-medium mb-2">Total Item Wears</p>
          <p className="font-display text-3xl font-bold">{stats.totalItemWears}</p>
        </div>
        <div className="bg-card rounded-lg border border-border p-6">
          <p className="text-xs text-muted-foreground font-medium mb-2">Total Outfit Wears</p>
          <p className="font-display text-3xl font-bold">{stats.totalOutfitWears}</p>
        </div>
      </div>

      {/* Least Worn Items - Sustainability Spotlight */}
      {leastWornItems.length > 0 && (
        <div className="space-y-4 rounded-lg border border-primary/30 bg-card/80 p-5 backdrop-blur-sm">
          <div>
            <h2 className="font-display text-xl font-semibold flex items-center gap-2 mb-1">
              <Leaf className="h-5 w-5 text-primary" />
              Sustainability Spotlight
            </h2>
            <p className="text-sm text-muted-foreground font-body">
              Rewear the least-used pieces in your wardrobe to reduce waste and get more value from what you already own.
            </p>
          </div>

          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            {leastWornItems.map((item) => (
              <div key={item.id} className="smooth-card rounded-lg bg-background/70 border border-border overflow-hidden p-3">
                <div className="mb-3 flex aspect-square items-center justify-center overflow-hidden rounded-md bg-card/60">
                  <img
                    src={item.imageUrl}
                    alt={item.tag || item.category}
                    className="h-full w-full object-contain p-2"
                    loading="lazy"
                  />
                </div>
                <div className="mb-1 flex items-center justify-between gap-2">
                  <p className="line-clamp-1 text-sm font-semibold leading-tight">
                    {item.tag || item.category}
                  </p>
                  <span className="whitespace-nowrap rounded-full bg-primary/15 px-2 py-0.5 text-[11px] font-semibold text-primary">
                    {item.wearCount || 0} wears
                  </span>
                </div>
                <p className="text-xs text-muted-foreground font-body">
                  Rewearing extends garment life and reduces unnecessary buying.
                </p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Most Worn Item */}
      {stats.mostWornItem && (
        <div className="bg-card rounded-lg border border-border p-6">
          <h3 className="font-display text-lg font-semibold mb-4">Most Worn Item</h3>
          <div className="flex gap-4">
            <div className="w-24 h-24 rounded-lg bg-background flex items-center justify-center overflow-hidden">
              <img
                src={stats.mostWornItem.imageUrl}
                alt="Most worn item"
                className="h-full w-full object-contain"
              />
            </div>
            <div className="flex-1">
              <p className="text-sm text-muted-foreground mb-1">{stats.mostWornItem.category}</p>
              <p className="font-semibold text-base mb-2">
                {stats.itemStats.find((s) => s.item.id === stats.mostWornItem.id)?.wearCount || 0} times worn
              </p>
              <div className="w-full bg-background rounded-full h-2">
                <div
                  className="bg-primary rounded-full h-2"
                  style={{
                    width: `${stats.itemStats.find((s) => s.item.id === stats.mostWornItem.id)?.percentage || 0}%`,
                  }}
                />
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                {stats.itemStats.find((s) => s.item.id === stats.mostWornItem.id)?.percentage || 0}% of all wears
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Category Breakdown */}
      {categoryData.length > 0 && (
        <div className="bg-card rounded-lg border border-border p-6">
          <h3 className="font-display text-lg font-semibold mb-4">Category Breakdown</h3>
          <div className="h-80 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={categoryData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {categoryData.map((_, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      {/* Top Worn Items */}
      {stats.itemStats.length > 0 && (
        <div className="bg-card rounded-lg border border-border p-6">
          <h3 className="font-display text-lg font-semibold mb-4">Top 10 Most Worn Items</h3>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 lg:grid-cols-10 gap-4">
            {stats.itemStats.slice(0, 10).map((stat, index) => (
              <div key={stat.item.id} className="flex flex-col items-center text-center">
                <div className="relative w-full aspect-square rounded-lg bg-background border border-border overflow-hidden mb-2 hover:shadow-md transition-shadow">
                  <img
                    src={stat.item.imageUrl}
                    alt={stat.item.tag || stat.item.category}
                    className="h-full w-full object-cover"
                  />
                  <div className="absolute top-1 right-1 bg-primary text-primary-foreground rounded-full w-6 h-6 flex items-center justify-center text-xs font-bold">
                    {index + 1}
                  </div>
                </div>
                <p className="text-xs font-semibold text-foreground mb-1">
                  {stat.wearCount}x
                </p>
                <p className="text-xs text-muted-foreground line-clamp-2">
                  {stat.item.tag || stat.item.category}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Top Worn Outfits */}
      {stats.outfitStats.length > 0 && (
        <div className="bg-card rounded-lg border border-border p-6">
          <h3 className="font-display text-lg font-semibold mb-4">Top Worn Outfits</h3>
          <div className="space-y-3">
            {stats.outfitStats.slice(0, 5).map((stat, index) => (
              <div key={stat.outfit.id} className="flex items-center gap-3 pb-3 border-b border-border last:border-0">
                <div className="flex-shrink-0 w-12 h-12 rounded-lg bg-background flex items-center justify-center overflow-hidden">
                  {stat.outfit.top && (
                    <img
                      src={stat.outfit.top.imageUrl}
                      alt="outfit"
                      className="h-full w-full object-cover"
                    />
                  )}
                </div>
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-semibold">#{index + 1}</p>
                    <p className="text-sm text-muted-foreground">{stat.wearCount} wears</p>
                  </div>
                  <div className="w-full bg-background rounded-full h-1.5 mt-1">
                    <div
                      className="bg-primary rounded-full h-1.5"
                      style={{ width: `${stat.percentage}%` }}
                    />
                  </div>
                  <p className="text-xs text-muted-foreground mt-0.5">{stat.percentage}% of outfit wears</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
