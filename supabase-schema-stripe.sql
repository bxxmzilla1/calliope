-- ============================================
-- Stripe Integration - Database Schema Updates
-- ============================================
-- Run this SQL in your Supabase SQL Editor to add Stripe support

-- Add Stripe-related columns to user_profiles table
ALTER TABLE user_profiles 
ADD COLUMN IF NOT EXISTS stripe_customer_id TEXT,
ADD COLUMN IF NOT EXISTS stripe_subscription_id TEXT,
ADD COLUMN IF NOT EXISTS stripe_subscription_status TEXT;

-- Create index for Stripe customer ID lookups
CREATE INDEX IF NOT EXISTS idx_user_profiles_stripe_customer_id 
ON user_profiles(stripe_customer_id) 
WHERE stripe_customer_id IS NOT NULL;

-- Create index for Stripe subscription ID lookups
CREATE INDEX IF NOT EXISTS idx_user_profiles_stripe_subscription_id 
ON user_profiles(stripe_subscription_id) 
WHERE stripe_subscription_id IS NOT NULL;

-- Add comment for documentation
COMMENT ON COLUMN user_profiles.stripe_customer_id IS 'Stripe customer ID for payment processing';
COMMENT ON COLUMN user_profiles.stripe_subscription_id IS 'Stripe subscription ID for recurring payments';
COMMENT ON COLUMN user_profiles.stripe_subscription_status IS 'Current Stripe subscription status (active, canceled, past_due, etc.)';

