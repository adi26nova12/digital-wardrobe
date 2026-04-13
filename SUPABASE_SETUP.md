# Supabase Setup Instructions

## Step 1: Create Database Tables

1. Go to https://app.supabase.com and log in
2. Select your project: `adi26nova12@gmail.com's Project`
3. Go to **SQL Editor** (left sidebar)
4. Click **New Query**
5. Copy the SQL from `supabase/migrations/setup_wardrobe_tables.sql`
6. Paste it into the SQL editor
7. Click **Run**
                                                                                                                                                        
The script will create:
- ✅ `wardrobe_items` table
- ✅ `outfits` table
- ✅ `outfit_schedules` table
- ✅ `wardrobe-images` storage bucket

## Step 2: Verify Storage Bucket

1. Go to **Storage** in the left sidebar
2. Look for `wardrobe-images` bucket
3. If it doesn't exist, click **New bucket** and create one named `wardrobe-images`

## Step 3: Set Storage Policies (if not auto-created)

If policies weren't created by the SQL:

1. Click on `wardrobe-images` bucket
2. Go to **Policies** tab
3. Create these policies:

**Public Read Policy:**
- Click **New Policy** → **For query builder**
- Select `storage.objects` table
- Operation: `SELECT`
- Conditions: `bucket_id = 'wardrobe-images'`
- Granted role: `anon`

**Authenticated Upload Policy:**
- Click **New Policy** → **For query builder**
- Select `storage.objects` table
- Operation: `INSERT`
- Conditions: `bucket_id = 'wardrobe-images'`
- Granted role: `authenticated`

## Step 4: Verify Connection

The app is now configured with your Supabase credentials. When you upload an image:
1. Image is uploaded to `wardrobe-images` bucket
2. Item metadata is saved to `wardrobe_items` table
3. Data auto-syncs between app and Supabase

## Database Schema

### wardrobe_items
```
- id (UUID, primary key)
- category (text: 'Tops', 'Bottoms', 'Shoes', 'Outerwear')
- image_url (text)
- created_at (timestamp)
- updated_at (timestamp)
```

### outfits
```
- id (UUID, primary key)
- top_id (UUID, foreign key → wardrobe_items)
- bottom_id (UUID, foreign key → wardrobe_items)
- shoes_id (UUID, foreign key → wardrobe_items)
- created_at (timestamp)
- updated_at (timestamp)
```

### outfit_schedules
```
- id (UUID, primary key)
- outfit_id (UUID, foreign key → outfits)
- date_iso (text)
- created_at (timestamp)
- worn (boolean)
- worn_date (timestamp, nullable)
- updated_at (timestamp)
```

## Troubleshooting

**Issue: "Table does not exist"**
- Run the SQL migration script again in SQL Editor

**Issue: "Permission denied" on image upload**
- Check storage policies are set correctly
- Make sure bucket is named exactly `wardrobe-images`

**Issue: Images not showing**
- Clear browser localStorage (old blob URLs)
- Refresh the app

Questions? Check `/supabase/migrations/setup_wardrobe_tables.sql` for the complete schema.
