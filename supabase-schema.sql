-- ============================================
-- Calliope Journal App - Supabase Schema
-- ============================================
-- This SQL script creates the database schema for the Calliope journal app
-- Run this in your Supabase SQL Editor: https://app.supabase.com/project/_/sql

-- ============================================
-- 1. Create journal_entries table
-- ============================================
CREATE TABLE IF NOT EXISTS journal_entries (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  date TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  mood TEXT NOT NULL CHECK (mood IN ('happy', 'sad', 'neutral', 'excited', 'calm')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- 2. Create indexes for better query performance
-- ============================================
CREATE INDEX IF NOT EXISTS idx_journal_entries_user_id ON journal_entries(user_id);
CREATE INDEX IF NOT EXISTS idx_journal_entries_date ON journal_entries(date DESC);

-- ============================================
-- 3. Enable Row Level Security (RLS)
-- ============================================
ALTER TABLE journal_entries ENABLE ROW LEVEL SECURITY;

-- ============================================
-- 4. Drop existing policies (if they exist) and create RLS Policies
-- ============================================

-- Drop existing policies if they exist (makes script idempotent)
DROP POLICY IF EXISTS "Users can view their own entries" ON journal_entries;
DROP POLICY IF EXISTS "Users can insert their own entries" ON journal_entries;
DROP POLICY IF EXISTS "Users can update their own entries" ON journal_entries;
DROP POLICY IF EXISTS "Users can delete their own entries" ON journal_entries;

-- Policy: Users can view their own entries
CREATE POLICY "Users can view their own entries"
  ON journal_entries
  FOR SELECT
  USING (auth.uid() = user_id);

-- Policy: Users can insert their own entries
CREATE POLICY "Users can insert their own entries"
  ON journal_entries
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Policy: Users can update their own entries
CREATE POLICY "Users can update their own entries"
  ON journal_entries
  FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Policy: Users can delete their own entries
CREATE POLICY "Users can delete their own entries"
  ON journal_entries
  FOR DELETE
  USING (auth.uid() = user_id);

-- ============================================
-- 5. Create function to update updated_at timestamp
-- ============================================
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$;

-- ============================================
-- 6. Create trigger to automatically update updated_at
-- ============================================
-- Drop trigger if it exists (makes script idempotent)
DROP TRIGGER IF EXISTS update_journal_entries_updated_at ON journal_entries;

CREATE TRIGGER update_journal_entries_updated_at
  BEFORE UPDATE ON journal_entries
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- ============================================
-- Verification Queries (Optional - run to verify)
-- ============================================
-- Check if table exists:
-- SELECT * FROM information_schema.tables WHERE table_name = 'journal_entries';

-- Check if RLS is enabled:
-- SELECT tablename, rowsecurity FROM pg_tables WHERE tablename = 'journal_entries';

-- Check policies:
-- SELECT * FROM pg_policies WHERE tablename = 'journal_entries';

