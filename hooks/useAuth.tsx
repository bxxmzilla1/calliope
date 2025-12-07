
import React, { createContext, useState, useContext, useEffect, useCallback, useMemo } from 'react';
import { User } from '../types';
import { supabase } from '../lib/supabase';

interface AuthContextType {
  user: User | null;
  login: (email: string, password: string) => Promise<User>;
  signup: (email: string, password: string) => Promise<User>;
  signInWithGoogle: () => Promise<void>;
  logout: () => void;
  loading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check if this is an OAuth callback by looking for tokens in the hash
    const hash = window.location.hash;
    const isOAuthCallback = hash.includes('access_token') || hash.includes('type=recovery') || hash.includes('error');

    // Listen for auth changes (including OAuth callbacks) - set this up FIRST
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      console.log('Auth state changed:', event, session?.user?.email);
      
      if (session?.user?.email) {
        setUser({ email: session.user.email });
        
        // If this is an OAuth callback and we just signed in, redirect to dashboard
        if (event === 'SIGNED_IN') {
          const currentHash = window.location.hash;
          const isCallback = currentHash.includes('access_token') || currentHash.includes('type=recovery');
          if (isCallback) {
            // Clean up the hash and redirect
            setTimeout(() => {
              window.location.hash = '#dashboard';
            }, 100);
          }
        }
      } else {
        setUser(null);
      }
      setLoading(false);
    });

    // Check for existing session (after setting up the listener)
    const initializeAuth = async () => {
      // If OAuth callback, wait a bit for Supabase to process it
      if (isOAuthCallback) {
        // Give Supabase time to process the OAuth tokens
        await new Promise(resolve => setTimeout(resolve, 500));
      }
      
      const { data: { session }, error } = await supabase.auth.getSession();
      if (error) {
        console.error('Error getting session:', error);
      }
      
      if (session?.user?.email) {
        setUser({ email: session.user.email });
        // If we have a session after OAuth callback, clean up the hash
        if (isOAuthCallback && window.location.hash !== '#dashboard') {
          window.location.hash = '#dashboard';
        }
      }
      setLoading(false);
    };

    initializeAuth();

    return () => subscription.unsubscribe();
  }, []);

  const login = useCallback(async (email: string, password: string): Promise<User> => {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      throw new Error(error.message || 'Invalid email or password.');
    }

    if (!data.user?.email) {
      throw new Error('Failed to sign in.');
    }

    const loggedInUser = { email: data.user.email };
    setUser(loggedInUser);
    return loggedInUser;
  }, []);

  const signup = useCallback(async (email: string, password: string): Promise<User> => {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
    });

    if (error) {
      throw new Error(error.message || 'Failed to create account.');
    }

    if (!data.user?.email) {
      throw new Error('Failed to create account.');
    }

    const newUser = { email: data.user.email };
    setUser(newUser);
    return newUser;
  }, []);

  const signInWithGoogle = useCallback(async (): Promise<void> => {
    const redirectUrl = import.meta.env.PROD 
      ? 'https://calliope-git-main-heavenzy-ais-projects.vercel.app/#dashboard'
      : `${window.location.origin}/#dashboard`;

    const { data, error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: redirectUrl,
        queryParams: {
          access_type: 'offline',
          prompt: 'consent',
        },
      },
    });

    if (error) {
      throw new Error(error.message || 'Failed to sign in with Google.');
    }

    // Note: The actual redirect happens automatically
    // The session will be available after the redirect completes
  }, []);

  const logout = useCallback(async () => {
    await supabase.auth.signOut();
    setUser(null);
  }, []);

  const value = useMemo(
    () => ({ user, login, signup, signInWithGoogle, logout, loading }),
    [user, login, signup, signInWithGoogle, logout, loading]
  );

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
