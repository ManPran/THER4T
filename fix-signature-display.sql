-- Fix signature display issue
-- Run this in your Supabase SQL Editor

-- Drop existing policies
DROP POLICY IF EXISTS "Public read access to signatures" ON signatures;
DROP POLICY IF EXISTS "Allow public signature insertions" ON signatures;

-- Create new policies that allow both read and write for anonymous users
CREATE POLICY "Allow public signature operations" ON signatures 
FOR ALL USING (true) WITH CHECK (true);

-- Grant necessary permissions
GRANT SELECT ON signatures TO anon;
GRANT INSERT ON signatures TO anon;

-- Verify the policies
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual 
FROM pg_policies 
WHERE tablename = 'signatures';
