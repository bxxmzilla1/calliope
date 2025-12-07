
import React from 'react';
import { Page } from '../types';

interface RouterContextType {
  page: Page;
  params: Record<string, string>;
  navigate: (page: Page, params?: Record<string, string>) => void;
}

export const RouterContext = React.createContext<RouterContextType | undefined>(undefined);
