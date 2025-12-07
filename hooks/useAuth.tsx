
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

    let oauthCallbackProcessed = false;

    // Listen for auth changes (including OAuth callbacks) - set this up FIRST
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      console.log('Auth state changed:', event, session?.user?.email, 'Session:', session);
      
      // Handle INITIAL_SESSION event - this fires on page load
      if (event === 'INITIAL_SESSION') {
        if (session?.user?.email) {
          console.log('Initial session found:', session.user.email);
          setUser({ email: session.user.email });
          setLoading(false);
        } else if (isOAuthCallback && !oauthCallbackProcessed) {
          // If we have OAuth tokens but no session yet, wait and retry
          console.log('OAuth callback detected but no session yet, will retry...');
          oauthCallbackProcessed = true;
          // Don't set loading to false yet - we'll retry
        } else {
          setUser(null);
          setLoading(false);
        }
      }
      
      // Handle SIGNED_IN event - this fires after successful OAuth
      if (event === 'SIGNED_IN' && session?.user?.email) {
        console.log('User signed in:', session.user.email);
        setUser({ email: session.user.email });
        setLoading(false);
        oauthCallbackProcessed = true;
        
        // Clean up the hash and redirect
        const currentHash = window.location.hash;
        if (currentHash.includes('access_token') || currentHash.includes('type=recovery')) {
          console.log('Cleaning up OAuth hash and redirecting to dashboard');
          setTimeout(() => {
            window.location.hash = '#dashboard';
          }, 200);
        }
      }
      
      // Handle TOKEN_REFRESHED
      if (event === 'TOKEN_REFRESHED' && session?.user?.email) {
        setUser({ email: session.user.email });
        setLoading(false);
      }
      
      // Handle SIGNED_OUT
      if (event === 'SIGNED_OUT') {
        setUser(null);
        setLoading(false);
      }
    });

    // Check for existing session (after setting up the listener)
    const initializeAuth = async () => {
      // If OAuth callback, wait longer for Supabase to process it
      if (isOAuthCallback) {
        console.log('OAuth callback detected, waiting for Supabase to process...');
        // Give Supabase time to process the OAuth tokens from the hash
        // Supabase automatically processes tokens in the hash on initialization
        await new Promise(resolve => setTimeout(resolve, 1500));
        
        // Try multiple times to get the session
        let attempts = 0;
        let sessionFound = false;
        while (attempts < 5 && !sessionFound) {
          const { data: { session }, error } = await supabase.auth.getSession();
          if (error) {
            console.error('Error getting session (attempt', attempts + 1, '):', error);
          }
          if (session?.user?.email) {
            console.log('Session found after OAuth (attempt', attempts + 1, '):', session.user.email);
            setUser({ email: session.user.email });
            setLoading(false);
            sessionFound = true;
            oauthCallbackProcessed = true;
            // Clean up the hash and redirect
            if (window.location.hash !== '#dashboard') {
              window.location.hash = '#dashboard';
            }
            return;
          }
          attempts++;
          if (!sessionFound && attempts < 5) {
            console.log('No session yet, retrying in 500ms... (attempt', attempts + 1, ')');
            await new Promise(resolve => setTimeout(resolve, 500));
          }
        }
        
        if (!sessionFound) {
          console.error('Failed to get session after OAuth callback after', attempts, 'attempts');
          setLoading(false);
        }
        return;
      }
      
      // Normal session check (not OAuth callback)
      const { data: { session }, error } = await supabase.auth.getSession();
      if (error) {
        console.error('Error getting session:', error);
      }
      
      if (session?.user?.email) {
        setUser({ email: session.user.email });
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
