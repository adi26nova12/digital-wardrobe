-- Create wardrobe_items table
CREATE TABLE IF NOT EXISTS wardrobe_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  category TEXT NOT NULL CHECK (category IN ('Tops', 'Bottoms', 'Shoes', 'Outerwear')),
  image_url TEXT NOT NULL,
  tag TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Create outfits table
CREATE TABLE IF NOT EXISTS outfits (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  top_id UUID REFERENCES wardrobe_items(id) ON DELETE SET NULL,
  bottom_id UUID REFERENCES wardrobe_items(id) ON DELETE SET NULL,
  shoes_id UUID REFERENCES wardrobe_items(id) ON DELETE SET NULL,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Create outfit_schedules table
CREATE TABLE IF NOT EXISTS outfit_schedules (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  outfit_id UUID NOT NULL REFERENCES outfits(id) ON DELETE CASCADE,
  date_iso TEXT NOT NULL,
  created_at TIMESTAMP DEFAULT NOW(),
  worn BOOLEAN DEFAULT FALSE,
  worn_date TIMESTAMP,
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_wardrobe_items_category ON wardrobe_items(category);
CREATE INDEX IF NOT EXISTS idx_outfits_created_at ON outfits(created_at);
CREATE INDEX IF NOT EXISTS idx_outfit_schedules_date_iso ON outfit_schedules(date_iso);
CREATE INDEX IF NOT EXISTS idx_outfit_schedules_outfit_id ON outfit_schedules(outfit_id);

-- Enable Row Level Security
ALTER TABLE wardrobe_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE outfits ENABLE ROW LEVEL SECURITY;
ALTER TABLE outfit_schedules ENABLE ROW LEVEL SECURITY;

-- Create a storage bucket for wardrobe images
INSERT INTO storage.buckets (id, name) VALUES ('wardrobe-images', 'wardrobe-images') ON CONFLICT (id) DO NOTHING;

-- Allow public read access to wardrobe-images bucket
CREATE POLICY "Public Read Access" ON storage.objects
  FOR SELECT USING (bucket_id = 'wardrobe-images');

-- Allow authenticated uploads to wardrobe-images bucket
CREATE POLICY "Authenticated Upload" ON storage.objects
  FOR INSERT WITH CHECK (bucket_id = 'wardrobe-images');
