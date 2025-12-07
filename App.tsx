
import React from 'react';
import { AuthProvider } from './hooks/useAuth';
import AppRouter from './router/AppRouter';
import { JournalProvider } from './hooks/useJournal';

const App: React.FC = () => {
  return (
    <AuthProvider>
      <JournalProvider>
        <AppRouter />
      </JournalProvider>
    </AuthProvider>
  );
};

export default App;
