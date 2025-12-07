
import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../hooks/useAuth';
import { supabase } from '../lib/supabase';
import HomePage from '../pages/HomePage';
import LoginPage from '../pages/LoginPage';
import SignUpPage from '../pages/SignUpPage';
import JournalDashboardPage from '../pages/JournalDashboardPage';
import JournalEntryPage from '../pages/JournalEntryPage';
import { Page } from '../types';
import { RouterContext } from './RouterContext';
import Header from '../components/Header';

const AppRouter: React.FC = () => {
  const { user } = useAuth();
  const [page, setPage] = useState<Page>(Page.Home);
  const [params, setParams] = useState<Record<string, string>>({});

  const parseHash = useCallback(() => {
    const hash = window.location.hash.slice(1);
    if (!hash) {
      return { page: user ? Page.Dashboard : Page.Home, params: {} };
    }
    const [path, queryString] = hash.split('?');
    const pageKey = path.toUpperCase() as Page;

    const queryParams: Record<string, string> = {};
    if (queryString) {
      new URLSearchParams(queryString).forEach((value, key) => {
        queryParams[key] = value;
      });
    }

    return { page: pageKey, params: queryParams };
  }, [user]);

  useEffect(() => {
    // Check for OAuth callback in URL hash (Supabase adds tokens to hash)
    const checkOAuthCallback = async () => {
      const hash = window.location.hash;
      // Check if this is an OAuth callback (contains access_token or similar)
      if (hash.includes('access_token') || hash.includes('type=recovery')) {
        // Let Supabase handle the callback - it will trigger onAuthStateChange
        const { data: { session } } = await supabase.auth.getSession();
        if (session) {
          // Clean up the hash and redirect to dashboard
          window.location.hash = '#dashboard';
        }
      }
    };

    checkOAuthCallback();

    const { page: initialPage, params: initialParams } = parseHash();
    if (user && (initialPage === Page.Home || initialPage === Page.Login || initialPage === Page.SignUp)) {
      setPage(Page.Dashboard);
      setParams({});
      window.location.hash = `#${Page.Dashboard.toLowerCase()}`;
    } else if (!user && (initialPage === Page.Dashboard || initialPage === Page.Entry)) {
      setPage(Page.Home);
      setParams({});
      window.location.hash = `#${Page.Home.toLowerCase()}`;
    } else {
      setPage(initialPage);
      setParams(initialParams);
    }

    const handleHashChange = () => {
      const { page: newPage, params: newParams } = parseHash();
      setPage(newPage);
      setParams(newParams);
    };

    window.addEventListener('hashchange', handleHashChange);
    
    return () => {
      window.removeEventListener('hashchange', handleHashChange);
    };
  }, [user, parseHash]);

  const navigate = (page: Page, params: Record<string, string> = {}) => {
    const searchParams = new URLSearchParams(params).toString();
    const hash = `#${page.toLowerCase()}${searchParams ? `?${searchParams}` : ''}`;
    window.location.hash = hash;
  };

  const renderPage = () => {
    if (!user) {
      switch (page) {
        case Page.Login:
          return <LoginPage />;
        case Page.SignUp:
          return <SignUpPage />;
        default:
          return <HomePage />;
      }
    }

    switch (page) {
      case Page.Dashboard:
        return <JournalDashboardPage />;
      case Page.Entry:
        return <JournalEntryPage />;
      default:
        return <JournalDashboardPage />;
    }
  };

  return (
    <RouterContext.Provider value={{ page, params, navigate }}>
      <div className="min-h-screen flex flex-col bg-gray-50 text-gray-800">
        <Header />
        <main className="flex-grow">
          {renderPage()}
        </main>
      </div>
    </RouterContext.Provider>
  );
};

export default AppRouter;
