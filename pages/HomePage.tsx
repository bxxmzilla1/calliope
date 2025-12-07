
import React from 'react';
import { useRouter } from '../hooks/useRouter';
import { Page } from '../types';

const HomePage: React.FC = () => {
  const { navigate } = useRouter();

  return (
    <div className="bg-white">
      <div className="max-w-7xl mx-auto py-16 px-4 sm:py-24 sm:px-6 lg:px-8">
        <div className="text-center">
            <h1 className="text-4xl font-extrabold text-gray-900 sm:text-5xl sm:tracking-tight lg:text-6xl">
              <span className="block">Find clarity and calm.</span>
              <span className="block text-teal-600">Your daily journal awaits.</span>
            </h1>
            <p className="mt-5 max-w-xl mx-auto text-xl text-gray-500">
              Calliope is your private, secure space to reflect, grow, and capture life's moments. Start your journey of self-discovery today.
            </p>
            <div className="mt-8 flex justify-center space-x-4">
              <button
                onClick={() => navigate(Page.SignUp)}
                className="inline-flex items-center justify-center px-6 py-3 border border-transparent text-base font-medium rounded-md shadow-sm text-white bg-teal-600 hover:bg-teal-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-teal-500"
              >
                Get started
              </button>
              <button
                onClick={() => navigate(Page.Login)}
                className="inline-flex items-center justify-center px-6 py-3 border border-gray-300 text-base font-medium rounded-md shadow-sm text-teal-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-teal-500"
              >
                Login
              </button>
            </div>
        </div>
      </div>
    </div>
  );
};

export default HomePage;
