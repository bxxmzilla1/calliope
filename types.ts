
export type SubscriptionTier = 'free' | 'premium';

export interface User {
  email: string;
  subscriptionTier?: SubscriptionTier;
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
