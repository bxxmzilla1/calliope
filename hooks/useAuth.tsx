
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
    // Check for existing session
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user?.email) {
        setUser({ email: session.user.email });
      }
      setLoading(false);
    });

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session?.user?.email) {
        setUser({ email: session.user.email });
      } else {
        setUser(null);
      }
      setLoading(false);
    });

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

    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: redirectUrl,
      },
    });

    if (error) {
      throw new Error(error.message || 'Failed to sign in with Google.');
    }
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
