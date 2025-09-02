-- Fix Stories Table Structure for Rise for Texas
-- Run this in your Supabase SQL Editor

-- Drop existing stories table if it exists
DROP TABLE IF EXISTS stories;

-- Create new stories table with proper structure
CREATE TABLE stories (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  location TEXT NOT NULL,
  role TEXT NOT NULL,
  issue TEXT NOT NULL,
  title TEXT NOT NULL,
  story TEXT NOT NULL,
  consent BOOLEAN NOT NULL DEFAULT true,
  is_approved BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX idx_stories_approved ON stories(is_approved);
CREATE INDEX idx_stories_role ON stories(role);
CREATE INDEX idx_stories_created_at ON stories(created_at);
CREATE INDEX idx_stories_issue ON stories(issue);

-- Enable Row Level Security
ALTER TABLE stories ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for stories
CREATE POLICY "Allow public read access to approved stories" ON stories
  FOR SELECT USING (is_approved = true);

CREATE POLICY "Allow public insert to stories" ON stories
  FOR INSERT WITH CHECK (true);

-- Grant necessary permissions
GRANT SELECT ON stories TO anon;
GRANT INSERT ON stories TO anon;

-- Verify the table structure
SELECT column_name, data_type, is_nullable, column_default 
FROM information_schema.columns 
WHERE table_name = 'stories' 
ORDER BY ordinal_position; 