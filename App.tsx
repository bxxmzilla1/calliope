
import React from 'react';
import { AuthProvider } from './hooks/useAuth';
import AppRouter from './router/AppRouter';
import { JournalProvider } from './hooks/useJournal';
import { SubscriptionProvider } from './hooks/useSubscription';

const App: React.FC = () => {
  return (
    <AuthProvider>
      <SubscriptionProvider>
        <JournalProvider>
          <AppRouter />
        </JournalProvider>
      </SubscriptionProvider>
    </AuthProvider>
  );
};

export default App;
