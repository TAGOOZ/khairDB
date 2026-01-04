CREATE TABLE IF NOT EXISTS districts (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL UNIQUE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE districts ENABLE ROW LEVEL SECURITY;

-- Policies
CREATE POLICY "Allow public read access" ON districts FOR SELECT USING (true);
CREATE POLICY "Allow authenticated insert" ON districts FOR INSERT WITH CHECK (auth.role() = 'authenticated');
CREATE POLICY "Allow authenticated update" ON districts FOR UPDATE USING (auth.role() = 'authenticated');
CREATE POLICY "Allow authenticated delete" ON districts FOR DELETE USING (auth.role() = 'authenticated');

-- Seed Data
INSERT INTO districts (name) VALUES
('الكنيسة'),
('عمارة المعلمين'),
('المرور'),
('المنشية'),
('الرشيدية'),
('شارع الثورة'),
('الزهور'),
('أبو خليل'),
('الكوادي'),
('القطعة'),
('كفر امليط'),
('الشيخ زايد'),
('السببل'),
('قري')
ON CONFLICT (name) DO NOTHING;
