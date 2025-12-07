
export interface User {
  email: string;
}

export type SubscriptionTier = 'free' | 'premium';

export interface UserProfile {
  id: string;
  user_id: string;
  subscription_tier: SubscriptionTier;
  created_at: string;
  updated_at: string;
}

export interface JournalEntry {
  id: string;
  title: string;
  content: string;
  date: string;
  mood: 'happy' | 'sad' | 'neutral' | 'excited' | 'calm';
}

export enum Page {
  Home = 'HOME',
  Login = 'LOGIN',
  SignUp = 'SIGNUP',
  Dashboard = 'DASHBOARD',
  Entry = 'ENTRY',
  Settings = 'SETTINGS',
}
