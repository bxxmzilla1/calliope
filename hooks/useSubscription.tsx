import React, { createContext, useState, useContext, useEffect, useCallback, useMemo } from 'react';
import { UserProfile, SubscriptionTier } from '../types';
import { useAuth } from './useAuth';
import { supabase } from '../lib/supabase';

interface SubscriptionContextType {
  profile: UserProfile | null;
  subscriptionTier: SubscriptionTier;
  isPremium: boolean;
  upgradeToPremium: () => Promise<void>;
  loading: boolean;
}

const SubscriptionContext = createContext<SubscriptionContextType | undefined>(undefined);

export const SubscriptionProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user } = useAuth();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchProfile = useCallback(async () => {
    if (!user?.email) {
      setProfile(null);
      setLoading(false);
      return;
    }

    try {
      const { data: { user: authUser } } = await supabase.auth.getUser();
      if (!authUser) {
        setProfile(null);
        setLoading(false);
        return;
      }

      // Try to get existing profile
      let { data, error } = await supabase
        .from('user_profiles')
        .select('*')
        .eq('user_id', authUser.id)
        .single();

      // If profile doesn't exist, create one
      if (error && error.code === 'PGRST116') {
        const { data: newProfile, error: createError } = await supabase
          .from('user_profiles')
          .insert({
            user_id: authUser.id,
            subscription_tier: 'free',
          })
          .select()
          .single();

        if (createError) {
          console.error('Error creating profile:', createError);
          setProfile(null);
        } else {
          setProfile(newProfile as UserProfile);
        }
      } else if (error) {
        console.error('Error fetching profile:', error);
        setProfile(null);
      } else {
        setProfile(data as UserProfile);
      }
    } catch (error) {
      console.error('Error fetching profile:', error);
      setProfile(null);
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    fetchProfile();
  }, [fetchProfile]);

  const upgradeToPremium = useCallback(async () => {
    if (!user?.email) throw new Error("User not logged in");

    const { data: { user: authUser } } = await supabase.auth.getUser();
    if (!authUser) throw new Error("User not authenticated");

    const { data, error } = await supabase
      .from('user_profiles')
      .update({ subscription_tier: 'premium' })
      .eq('user_id', authUser.id)
      .select()
      .single();

    if (error) {
      throw new Error(error.message || 'Failed to upgrade to premium');
    }

    setProfile(data as UserProfile);
  }, [user]);

  const subscriptionTier = profile?.subscription_tier || 'free';
  const isPremium = subscriptionTier === 'premium';

  const value = useMemo(
    () => ({ profile, subscriptionTier, isPremium, upgradeToPremium, loading }),
    [profile, subscriptionTier, isPremium, upgradeToPremium, loading]
  );

  return (
    <SubscriptionContext.Provider value={value}>
      {children}
    </SubscriptionContext.Provider>
  );
};

export const useSubscription = () => {
  const context = useContext(SubscriptionContext);
  if (context === undefined) {
    throw new Error('useSubscription must be used within a SubscriptionProvider');
  }
  return context;
};

