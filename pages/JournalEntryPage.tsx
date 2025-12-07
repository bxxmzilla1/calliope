
import React, { useState, useEffect } from 'react';
import { useRouter } from '../hooks/useRouter';
import { useJournal } from '../hooks/useJournal';
import { useSubscription } from '../hooks/useSubscription';
import { JournalEntry, Page } from '../types';

type Mood = JournalEntry['mood'];

const moodOptions: { mood: Mood; emoji: string; label: string }[] = [
  { mood: 'happy', emoji: '😊', label: 'Happy' },
  { mood: 'excited', emoji: '😃', label: 'Excited' },
  { mood: 'calm', emoji: '😌', label: 'Calm' },
  { mood: 'neutral', emoji: '😐', label: 'Neutral' },
  { mood: 'sad', emoji: '😢', label: 'Sad' },
];

const JournalEntryPage: React.FC = () => {
  const { params, navigate } = useRouter();
  const { getEntry, addEntry, updateEntry, canAddEntry, entryLimit } = useJournal();
  const { isPremium } = useSubscription();
  
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [mood, setMood] = useState<Mood>('neutral');
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (params.id) {
      const entry = getEntry(params.id);
      if (entry) {
        setTitle(entry.title);
        setContent(entry.content);
        setMood(entry.mood);
        setIsEditing(true);
      }
    } else {
      setIsEditing(false);
    }
  }, [params.id, getEntry]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      if (isEditing && params.id) {
        await updateEntry(params.id, { title, content, mood });
      } else {
        await addEntry({ title, content, mood });
      }
      navigate(Page.Dashboard);
    } catch (err: any) {
      console.error("Failed to save entry:", err);
      setError(err.message || 'Failed to save entry. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <form onSubmit={handleSubmit} className="space-y-8 bg-white p-8 rounded-lg shadow-lg">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">{isEditing ? 'Edit Entry' : 'New Journal Entry'}</h1>
          <p className="text-gray-500">What's on your mind today?</p>
        </div>

        {error && (
          <div className="rounded-md bg-red-50 border border-red-200 p-4">
            <div className="flex">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3">
                <h3 className="text-sm font-medium text-red-800">{error}</h3>
                {error.includes('Upgrade to Premium') && (
                  <div className="mt-2">
                    <button
                      type="button"
                      onClick={() => navigate(Page.Settings)}
                      className="text-sm font-medium text-red-800 underline hover:text-red-900"
                    >
                      Go to Settings to upgrade
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {!isEditing && !canAddEntry && (
          <div className="rounded-md bg-yellow-50 border border-yellow-200 p-4">
            <div className="flex">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-yellow-400" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3">
                <h3 className="text-sm font-medium text-yellow-800">
                  Entry limit reached
                </h3>
                <div className="mt-2 text-sm text-yellow-700">
                  <p>
                    You've reached the limit of {entryLimit} entries for free users.{' '}
                    <button
                      type="button"
                      onClick={() => navigate(Page.Settings)}
                      className="font-medium underline hover:text-yellow-800"
                    >
                      Upgrade to Premium
                    </button>
                    {' '}for unlimited entries.
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}
        
        <div>
          <label htmlFor="title" className="block text-sm font-medium text-gray-700">
            Title
          </label>
          <div className="mt-1">
            <input
              type="text"
              name="title"
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="shadow-sm focus:ring-teal-500 focus:border-teal-500 block w-full sm:text-sm border-gray-300 rounded-md"
              placeholder="A memorable day"
              required
            />
          </div>
        </div>

        <div>
          <label htmlFor="content" className="block text-sm font-medium text-gray-700">
            Content
          </label>
          <div className="mt-1">
            <textarea
              id="content"
              name="content"
              rows={12}
              value={content}
              onChange={(e) => setContent(e.target.value)}
              className="shadow-sm focus:ring-teal-500 focus:border-teal-500 block w-full sm:text-sm border border-gray-300 rounded-md"
              placeholder="Today was..."
              required
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">How are you feeling?</label>
          <div className="mt-2 flex flex-wrap gap-3">
            {moodOptions.map(({ mood: moodValue, emoji, label }) => (
              <button
                type="button"
                key={moodValue}
                onClick={() => setMood(moodValue)}
                className={`flex items-center space-x-2 px-4 py-2 text-sm font-medium border rounded-full transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-teal-500 ${
                  mood === moodValue
                    ? 'bg-teal-100 border-teal-500 text-teal-800'
                    : 'bg-white border-gray-300 text-gray-700 hover:bg-gray-50'
                }`}
              >
                <span>{emoji}</span>
                <span>{label}</span>
              </button>
            ))}
          </div>
        </div>

        <div className="flex justify-end space-x-4">
          <button
            type="button"
            onClick={() => navigate(Page.Dashboard)}
            className="py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-teal-500"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={loading}
            className="inline-flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-teal-600 hover:bg-teal-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-teal-500 disabled:bg-teal-400"
          >
            {loading ? 'Saving...' : 'Save Entry'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default JournalEntryPage;
