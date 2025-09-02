-- Fix RLS Policies for Rise for Texas
-- Run this in your Supabase SQL Editor to fix the signature insertion issue

-- Drop existing problematic policies
DROP POLICY IF EXISTS "Users can insert signatures" ON signatures;
DROP POLICY IF EXISTS "Users can insert social shares" ON social_shares;
DROP POLICY IF EXISTS "Users can insert stories" ON stories;

-- Create new policies that allow anonymous users to insert
CREATE POLICY "Allow public signature insertions" ON signatures 
FOR INSERT WITH CHECK (true);

CREATE POLICY "Allow public social share insertions" ON social_shares 
FOR INSERT WITH CHECK (true);

CREATE POLICY "Allow public story insertions" ON stories 
FOR INSERT WITH CHECK (true);

-- Ensure public read access
CREATE POLICY "Public read access to signatures" ON signatures 
FOR SELECT USING (true);

CREATE POLICY "Public read access to social shares" ON social_shares 
FOR SELECT USING (true);

CREATE POLICY "Public read access to stories" ON stories 
FOR SELECT USING (is_approved = true OR is_approved IS NULL);

-- Grant necessary permissions to anonymous users
GRANT INSERT ON signatures TO anon;
GRANT INSERT ON social_shares TO anon;
GRANT INSERT ON stories TO anon;

-- Verify the policies are working
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual 
FROM pg_policies 
WHERE tablename IN ('signatures', 'social_shares', 'stories'); 