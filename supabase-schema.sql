-- Supabase Schema for Rise for Texas
-- Run this in your Supabase SQL Editor

-- Enable Row Level Security
ALTER DATABASE postgres SET "app.jwt_secret" TO 'your-jwt-secret-here';

-- Create custom types
CREATE TYPE user_role AS ENUM ('ADMIN', 'EDITOR', 'MODERATOR', 'USER');

-- Users table
CREATE TABLE users (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  password_hash TEXT,
  role user_role DEFAULT 'USER',
  display_name TEXT NOT NULL,
  avatar_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Bills table
CREATE TABLE bills (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  provider TEXT NOT NULL,
  provider_id TEXT NOT NULL,
  bill_number TEXT NOT NULL,
  chamber TEXT NOT NULL,
  session TEXT NOT NULL,
  title TEXT NOT NULL,
  summary TEXT NOT NULL,
  status TEXT NOT NULL,
  last_action TEXT NOT NULL,
  last_action_date TIMESTAMP WITH TIME ZONE NOT NULL,
  sponsors JSONB NOT NULL,
  subjects TEXT[] NOT NULL,
  versions JSONB NOT NULL,
  roll_calls JSONB,
  is_primary_petition BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(provider, provider_id)
);

-- Create indexes for bills
CREATE INDEX idx_bills_bill_number ON bills(bill_number);
CREATE INDEX idx_bills_chamber_status ON bills(chamber, status);
CREATE INDEX idx_bills_session ON bills(session);
CREATE INDEX idx_bills_primary_petition ON bills(is_primary_petition);

-- Petitions table
CREATE TABLE petitions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  bill_id UUID REFERENCES bills(id) ON DELETE SET NULL,
  slug TEXT UNIQUE NOT NULL,
  title TEXT NOT NULL,
  description_md TEXT NOT NULL,
  blurb TEXT NOT NULL,
  category TEXT NOT NULL,
  goal_count INTEGER NOT NULL,
  is_main BOOLEAN DEFAULT FALSE,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for petitions
CREATE INDEX idx_petitions_slug ON petitions(slug);
CREATE INDEX idx_petitions_active ON petitions(is_active);
CREATE INDEX idx_petitions_category ON petitions(category);
CREATE INDEX idx_petitions_main ON petitions(is_main);

-- Signatures table
CREATE TABLE signatures (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  petition_id UUID NOT NULL REFERENCES petitions(id) ON DELETE CASCADE,
  user_id UUID REFERENCES users(id) ON DELETE SET NULL,
  name TEXT NOT NULL,
  email_hash TEXT NOT NULL,
  zip_code TEXT NOT NULL,
  display_public BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(petition_id, email_hash)
);

-- Create indexes for signatures
CREATE INDEX idx_signatures_petition_id ON signatures(petition_id);
CREATE INDEX idx_signatures_created_at ON signatures(created_at);
CREATE INDEX idx_signatures_user_id ON signatures(user_id);

-- Social shares table
CREATE TABLE social_shares (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  platform TEXT NOT NULL,
  entity_type TEXT NOT NULL,
  entity_id UUID,
  ip_address INET,
  user_agent TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for social shares
CREATE INDEX idx_social_shares_entity_type ON social_shares(entity_type);
CREATE INDEX idx_social_shares_platform ON social_shares(platform);
CREATE INDEX idx_social_shares_created_at ON social_shares(created_at);

-- Stories table
CREATE TABLE stories (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES users(id) ON DELETE SET NULL,
  title TEXT NOT NULL,
  content_md TEXT NOT NULL,
  category TEXT NOT NULL,
  is_approved BOOLEAN DEFAULT FALSE,
  moderator_id UUID REFERENCES users(id) ON DELETE SET NULL,
  moderated_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for stories
CREATE INDEX idx_stories_user_id ON stories(user_id);
CREATE INDEX idx_stories_approved ON stories(is_approved);
CREATE INDEX idx_stories_category ON stories(category);
CREATE INDEX idx_stories_created_at ON stories(created_at);

-- Insert default petition for HB 1481
INSERT INTO petitions (
  slug,
  title,
  description_md,
  blurb,
  category,
  goal_count,
  is_main,
  is_active
) VALUES (
  'hb1481-device-restrictions',
  'Stop HB 1481: Personal Device Restrictions in Schools',
  'Join Texans demanding our legislators vote NO on HB 1481, which will prohibit students from possessing or using personal communication devices during the school day, effective September 1, 2025.',
  'Oppose harmful legislation that restricts student communication and access to technology in schools.',
  'education',
  10000,
  TRUE,
  TRUE
);

-- Insert default bill for HB 1481
INSERT INTO bills (
  provider,
  provider_id,
  bill_number,
  chamber,
  session,
  title,
  summary,
  status,
  last_action,
  last_action_date,
  sponsors,
  subjects,
  versions,
  is_primary_petition
) VALUES (
  'texas_legislature',
  'hb1481_89r',
  'HB 1481',
  'House',
  '89(R) 2025',
  'Relating to the possession and use of personal communication devices by students in public schools.',
  'This bill prohibits students from possessing or using personal communication devices during the school day, with limited exceptions for IEP, medical, and safety needs.',
  'Introduced',
  'Filed with the Chief Clerk of the House',
  '2025-01-01',
  '[{"name": "Representative", "district": "TBD"}]',
  ARRAY['education', 'student rights', 'technology'],
  '[{"url": "https://capitol.texas.gov/BillLookup/History.aspx?LegSess=89R&Bill=HB1481", "label": "Official Text", "date": "2025-01-01"}]',
  TRUE
);

-- Update the petition to reference the bill
UPDATE petitions 
SET bill_id = (SELECT id FROM bills WHERE is_primary_petition = TRUE)
WHERE is_main = TRUE;

-- Create functions for updated_at timestamps
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers for updated_at
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_bills_updated_at BEFORE UPDATE ON bills
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_petitions_updated_at BEFORE UPDATE ON petitions
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_stories_updated_at BEFORE UPDATE ON stories
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Enable Row Level Security (RLS)
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE bills ENABLE ROW LEVEL SECURITY;
ALTER TABLE petitions ENABLE ROW LEVEL SECURITY;
ALTER TABLE signatures ENABLE ROW LEVEL SECURITY;
ALTER TABLE social_shares ENABLE ROW LEVEL SECURITY;
ALTER TABLE stories ENABLE ROW LEVEL SECURITY;

-- Create policies for public read access
CREATE POLICY "Public read access to bills" ON bills FOR SELECT USING (true);
CREATE POLICY "Public read access to petitions" ON petitions FOR SELECT USING (true);
CREATE POLICY "Public read access to signatures" ON signatures FOR SELECT USING (true);
CREATE POLICY "Public read access to social shares" ON social_shares FOR SELECT USING (true);
CREATE POLICY "Public read access to approved stories" ON stories FOR SELECT USING (is_approved = true);

-- Create policies for authenticated users
CREATE POLICY "Users can insert signatures" ON signatures FOR INSERT WITH CHECK (true);
CREATE POLICY "Users can insert social shares" ON social_shares FOR INSERT WITH CHECK (true);
CREATE POLICY "Users can insert stories" ON stories FOR INSERT WITH CHECK (true);

-- Create policies for admins/moderators
CREATE POLICY "Admins can manage all data" ON users FOR ALL USING (role IN ('ADMIN', 'EDITOR', 'MODERATOR'));
CREATE POLICY "Admins can manage all data" ON bills FOR ALL USING (role IN ('ADMIN', 'EDITOR', 'MODERATOR'));
CREATE POLICY "Admins can manage all data" ON petitions FOR ALL USING (role IN ('ADMIN', 'EDITOR', 'MODERATOR'));
CREATE POLICY "Admins can manage all data" ON signatures FOR ALL USING (role IN ('ADMIN', 'EDITOR', 'MODERATOR'));
CREATE POLICY "Admins can manage all data" ON social_shares FOR ALL USING (role IN ('ADMIN', 'EDITOR', 'MODERATOR'));
CREATE POLICY "Admins can manage all data" ON stories FOR ALL USING (role IN ('ADMIN', 'EDITOR', 'MODERATOR'));

-- Grant necessary permissions
GRANT USAGE ON SCHEMA public TO anon, authenticated;
GRANT ALL ON ALL TABLES IN SCHEMA public TO anon, authenticated;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO anon, authenticated;
GRANT ALL ON ALL FUNCTIONS IN SCHEMA public TO anon, authenticated;
