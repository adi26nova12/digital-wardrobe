import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from "recharts";
import type { WearStats } from "@/hooks/useWearStatistics";

const COLORS = ["#3b82f6", "#ef4444", "#10b981", "#f59e0b", "#8b5cf6", "#ec4899", "#14b8a6", "#f97316"];

interface StatisticsDisplayProps {
  stats: WearStats;
}

export function StatisticsDisplay({ stats }: StatisticsDisplayProps) {
  const categoryData = Object.entries(stats.categoryBreakdown).map(([category, count]) => ({
    name: category,
    value: count,
  }));

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
          <div className="h-80 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={stats.itemStats.slice(0, 10).map((item) => ({
                  name: `${item.item.category} (${item.wearCount}x)`,
                  wears: item.wearCount,
                }))}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis
                  dataKey="name"
                  angle={-45}
                  textAnchor="end"
                  height={100}
                  tick={{ fontSize: 12 }}
                />
                <YAxis />
                <Tooltip />
                <Bar dataKey="wears" fill="#3b82f6" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      {/* Top Worn Outfits */}
      {stats.outfitStats.length > 0 && (
        <div className="bg-card rounded-lg border border-border p-6">
          <h3 className="font-display text-lg font-semibold mb-4">Top Wore Outfits</h3>
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
