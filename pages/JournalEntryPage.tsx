
import React, { useState, useEffect } from 'react';
import { useRouter } from '../hooks/useRouter';
import { useJournal } from '../hooks/useJournal';
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
  const { getEntry, addEntry, updateEntry } = useJournal();
  
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [mood, setMood] = useState<Mood>('neutral');
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(false);

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
    setLoading(true);
    try {
      if (isEditing && params.id) {
        await updateEntry(params.id, { title, content, mood });
      } else {
        await addEntry({ title, content, mood });
      }
      navigate(Page.Dashboard);
    } catch (error) {
      console.error("Failed to save entry:", error);
      // You could set an error state here to show the user
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
