
import React from 'react';
import { useJournal } from '../hooks/useJournal';
import { useAuth } from '../hooks/useAuth';
import { useSubscription } from '../hooks/useSubscription';
import { useRouter } from '../hooks/useRouter';
import { JournalEntry, Page } from '../types';

const JournalCard: React.FC<{ entry: JournalEntry }> = ({ entry }) => {
  const { navigate } = useRouter();
  const { deleteEntry } = useJournal();
  
  const formattedDate = new Date(entry.date).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation();
    if(window.confirm('Are you sure you want to delete this entry?')) {
        deleteEntry(entry.id);
    }
  }

  const moodEmojis = {
    happy: '😊',
    sad: '😢',
    neutral: '😐',
    excited: '😃',
    calm: '😌'
  };

  return (
    <div 
        onClick={() => navigate(Page.Entry, { id: entry.id })}
        className="bg-white rounded-lg shadow-md p-6 cursor-pointer hover:shadow-lg transition-shadow duration-300 flex flex-col justify-between"
    >
        <div>
            <div className="flex justify-between items-start">
                <h3 className="text-xl font-bold text-gray-800 truncate pr-4">{entry.title}</h3>
                <span className="text-4xl">{moodEmojis[entry.mood]}</span>
            </div>
            <p className="text-sm text-gray-500 mt-1">{formattedDate}</p>
            <p className="text-gray-600 mt-4 line-clamp-3">{entry.content}</p>
        </div>
        <div className="mt-6 flex justify-end space-x-3">
             <button
                onClick={handleDelete}
                className="text-sm font-medium text-red-600 hover:text-red-800"
            >
                Delete
            </button>
            <button
                onClick={() => navigate(Page.Entry, { id: entry.id })}
                className="text-sm font-medium text-teal-600 hover:text-teal-800"
            >
                View / Edit
            </button>
        </div>
    </div>
  );
};

const JournalDashboardPage: React.FC = () => {
  const { user } = useAuth();
  const { entries, loading, canAddEntry, entryLimit } = useJournal();
  const { isPremium } = useSubscription();
  const { navigate } = useRouter();

  if (loading) {
    return <div className="text-center py-10">Loading entries...</div>;
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="flex justify-between items-center mb-8">
        <div>
            <h1 className="text-3xl font-bold text-gray-900">Your Journal</h1>
            <p className="text-lg text-gray-600 mt-1">Welcome back, {user?.email}</p>
            {!isPremium && entryLimit && (
              <p className="text-sm text-gray-500 mt-1">
                {entries.length} / {entryLimit} entries used
              </p>
            )}
        </div>
        <button
          onClick={() => navigate(Page.Entry)}
          disabled={!canAddEntry}
          className="inline-flex items-center justify-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-teal-600 hover:bg-teal-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-teal-500 disabled:bg-gray-400 disabled:cursor-not-allowed"
        >
          + New Entry
        </button>
      </div>

      {!canAddEntry && (
        <div className="mb-6 rounded-md bg-yellow-50 border border-yellow-200 p-4">
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
                  You've reached the limit of {entryLimit} entries for free users. 
                  <button
                    onClick={() => navigate(Page.Settings)}
                    className="ml-1 font-medium underline hover:text-yellow-800"
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

      {entries.length > 0 ? (
        <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
          {entries.map(entry => (
            <JournalCard key={entry.id} entry={entry} />
          ))}
        </div>
      ) : (
        <div className="text-center py-16 px-6 bg-white rounded-lg shadow-md">
          <h3 className="text-xl font-medium text-gray-900">No entries yet</h3>
          <p className="mt-2 text-gray-500">Click "New Entry" to start writing.</p>
        </div>
      )}
    </div>
  );
};

export default JournalDashboardPage;
