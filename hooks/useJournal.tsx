
import React, { createContext, useState, useContext, useEffect, useCallback, useMemo } from 'react';
import { JournalEntry } from '../types';
import { useAuth } from './useAuth';
import { supabase } from '../lib/supabase';

interface JournalContextType {
  entries: JournalEntry[];
  getEntry: (id: string) => JournalEntry | undefined;
  addEntry: (entry: Omit<JournalEntry, 'id' | 'date'>) => Promise<JournalEntry>;
  updateEntry: (id: string, entryData: Partial<Omit<JournalEntry, 'id'>>) => Promise<JournalEntry>;
  deleteEntry: (id: string) => Promise<void>;
  loading: boolean;
}

const JournalContext = createContext<JournalContextType | undefined>(undefined);

export const JournalProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user } = useAuth();
  const [entries, setEntries] = useState<JournalEntry[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchEntries = useCallback(async () => {
    if (!user?.email) {
      setEntries([]);
      setLoading(false);
      return;
    }

    try {
      const { data: { user: authUser } } = await supabase.auth.getUser();
      if (!authUser) {
        setEntries([]);
        setLoading(false);
        return;
      }

      const { data, error } = await supabase
        .from('journal_entries')
        .select('*')
        .eq('user_id', authUser.id)
        .order('date', { ascending: false });

      if (error) {
        console.error('Error fetching entries:', error);
        setEntries([]);
      } else {
        const formattedEntries: JournalEntry[] = (data || []).map(entry => ({
          id: entry.id.toString(),
          title: entry.title,
          content: entry.content,
          date: entry.date,
          mood: entry.mood,
        }));
        setEntries(formattedEntries);
      }
    } catch (error) {
      console.error('Error fetching entries:', error);
      setEntries([]);
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    fetchEntries();
  }, [fetchEntries]);

  const addEntry = useCallback(async (entryData: Omit<JournalEntry, 'id' | 'date'>): Promise<JournalEntry> => {
    if (!user?.email) throw new Error("User not logged in");

    const { data: { user: authUser } } = await supabase.auth.getUser();
    if (!authUser) throw new Error("User not authenticated");

    // Check subscription limit for free users
    if (user.subscriptionTier === 'free' || !user.subscriptionTier) {
      if (entries.length >= 5) {
        throw new Error("Free users can only create 5 journal entries. Upgrade to Premium for unlimited entries.");
      }
    }

    const { data, error } = await supabase
      .from('journal_entries')
      .insert({
        user_id: authUser.id,
        title: entryData.title,
        content: entryData.content,
        mood: entryData.mood,
        date: new Date().toISOString(),
      })
      .select()
      .single();

    if (error) {
      throw new Error(error.message || 'Failed to create entry');
    }

    const newEntry: JournalEntry = {
      id: data.id.toString(),
      title: data.title,
      content: data.content,
      date: data.date,
      mood: data.mood,
    };

    await fetchEntries();
    return newEntry;
  }, [user, fetchEntries]);

  const updateEntry = useCallback(async (id: string, entryData: Partial<Omit<JournalEntry, 'id'>>): Promise<JournalEntry> => {
    if (!user?.email) throw new Error("User not logged in");

    const { data: { user: authUser } } = await supabase.auth.getUser();
    if (!authUser) throw new Error("User not authenticated");

    const updateData: any = {};
    if (entryData.title !== undefined) updateData.title = entryData.title;
    if (entryData.content !== undefined) updateData.content = entryData.content;
    if (entryData.mood !== undefined) updateData.mood = entryData.mood;

    const { data, error } = await supabase
      .from('journal_entries')
      .update(updateData)
      .eq('id', id)
      .eq('user_id', authUser.id)
      .select()
      .single();

    if (error) {
      throw new Error(error.message || 'Failed to update entry');
    }

    if (!data) {
      throw new Error("Entry not found");
    }

    const updatedEntry: JournalEntry = {
      id: data.id.toString(),
      title: data.title,
      content: data.content,
      date: data.date,
      mood: data.mood,
    };

    await fetchEntries();
    return updatedEntry;
  }, [user, fetchEntries]);

  const deleteEntry = useCallback(async (id: string): Promise<void> => {
    if (!user?.email) throw new Error("User not logged in");

    const { data: { user: authUser } } = await supabase.auth.getUser();
    if (!authUser) throw new Error("User not authenticated");

    const { error } = await supabase
      .from('journal_entries')
      .delete()
      .eq('id', id)
      .eq('user_id', authUser.id);

    if (error) {
      throw new Error(error.message || 'Failed to delete entry');
    }

    await fetchEntries();
  }, [user, fetchEntries]);
  
  const getEntry = useCallback((id: string) => {
    return entries.find(entry => entry.id === id);
  }, [entries]);

  const value = useMemo(() => ({ entries, getEntry, addEntry, updateEntry, deleteEntry, loading }), [entries, getEntry, addEntry, updateEntry, deleteEntry, loading]);

  return (
    <JournalContext.Provider value={value}>
      {children}
    </JournalContext.Provider>
  );
};

export const useJournal = () => {
  const context = useContext(JournalContext);
  if (context === undefined) {
    throw new Error('useJournal must be used within a JournalProvider');
  }
  return context;
};
