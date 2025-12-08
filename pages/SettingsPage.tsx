import React, { useState, useEffect } from 'react';
import { useAuth } from '../hooks/useAuth';
import { useRouter } from '../hooks/useRouter';
import { Page } from '../types';
import { createCheckoutSession, cancelSubscription } from '../lib/stripe';
import { supabase } from '../lib/supabase';
import { createCheckoutSession, cancelSubscription } from '../lib/stripe';
import { supabase } from '../lib/supabase';

const SettingsPage: React.FC = () => {
  const { user, updateSubscription } = useAuth();
  const { navigate } = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Check for Stripe checkout success/cancel in URL params
  useEffect(() => {
    const hash = window.location.hash;
    const params = new URLSearchParams(hash.split('?')[1] || '');
    
    if (params.get('success') === 'true' && params.get('session_id')) {
      setSuccess('Payment successful! Your premium subscription is now active.');
      // Refresh user data to get updated subscription
      window.location.hash = '#settings';
      setTimeout(() => {
        window.location.reload();
      }, 2000);
    } else if (params.get('canceled') === 'true') {
      setError('Payment was canceled. You can try again anytime.');
      window.location.hash = '#settings';
    }
  }, []);

  const handleUpgrade = async () => {
    setLoading(true);
    setError('');
    setSuccess('');
    try {
      // Create Stripe checkout session
      const checkoutUrl = await createCheckoutSession();
      // Redirect to Stripe checkout
      window.location.href = checkoutUrl;
    } catch (err: any) {
      setError(err.message || 'Failed to start checkout process');
      setLoading(false);
    }
  };

  const handleDowngrade = async () => {
    setLoading(true);
    setError('');
    setSuccess('');
    try {
      // Check if user has a Stripe subscription
      const { data: { user: authUser } } = await supabase.auth.getUser();
      if (!authUser) throw new Error("User not authenticated");

      const { data: profile } = await supabase
        .from('user_profiles')
        .select('stripe_subscription_id')
        .eq('user_id', authUser.id)
        .single();

      if (profile?.stripe_subscription_id) {
        // Cancel Stripe subscription
        await cancelSubscription();
        setSuccess('Subscription canceled. You will remain on Premium until the end of your billing period.');
      } else {
        // No Stripe subscription, just update directly
        await updateSubscription('free');
        setSuccess('Subscription changed to Free tier.');
      }
    } catch (err: any) {
      setError(err.message || 'Failed to cancel subscription');
    } finally {
      setLoading(false);
    }
  };

  const isPremium = user?.subscriptionTier === 'premium';

  return (
    <div className="min-h-full py-12 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto">
        <div className="bg-white shadow-lg rounded-lg">
          <div className="px-6 py-5 border-b border-gray-200">
            <h2 className="text-2xl font-bold text-gray-900">Settings</h2>
          </div>

          <div className="px-6 py-6 space-y-8">
            {/* User Profile Section */}
            <div>
              <h3 className="text-lg font-medium text-gray-900 mb-4">User Profile</h3>
              <div className="bg-gray-50 rounded-lg p-4">
                <div className="space-y-2">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Email</label>
                    <p className="mt-1 text-sm text-gray-900">{user?.email}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Subscription</label>
                    <p className="mt-1">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        isPremium 
                          ? 'bg-purple-100 text-purple-800' 
                          : 'bg-gray-100 text-gray-800'
                      }`}>
                        {isPremium ? 'Premium' : 'Free'}
                      </span>
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Subscription Section */}
            <div>
              <h3 className="text-lg font-medium text-gray-900 mb-4">Subscription</h3>
              
              {error && (
                <div className="mb-4 rounded-md bg-red-50 p-4">
                  <div className="flex">
                    <div className="ml-3">
                      <h3 className="text-sm font-medium text-red-800">{error}</h3>
                    </div>
                  </div>
                </div>
              )}

              {success && (
                <div className="mb-4 rounded-md bg-green-50 p-4">
                  <div className="flex">
                    <div className="ml-3">
                      <h3 className="text-sm font-medium text-green-800">{success}</h3>
                    </div>
                  </div>
                </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Free Plan */}
                <div className={`border-2 rounded-lg p-6 ${
                  !isPremium ? 'border-teal-500 bg-teal-50' : 'border-gray-200'
                }`}>
                  <div className="flex justify-between items-start">
                    <div>
                      <h4 className="text-lg font-semibold text-gray-900">Free Plan</h4>
                      <p className="mt-2 text-sm text-gray-600">Perfect for getting started</p>
                      <ul className="mt-4 space-y-2 text-sm text-gray-600">
                        <li className="flex items-center">
                          <svg className="h-5 w-5 text-teal-500 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                          </svg>
                          Up to 5 journal entries
                        </li>
                        <li className="flex items-center">
                          <svg className="h-5 w-5 text-teal-500 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                          </svg>
                          Basic mood tracking
                        </li>
                      </ul>
                      <p className="mt-4 text-2xl font-bold text-gray-900">$0<span className="text-sm font-normal text-gray-600">/month</span></p>
                    </div>
                    {!isPremium && (
                      <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-teal-100 text-teal-800">
                        Current Plan
                      </span>
                    )}
                  </div>
                </div>

                {/* Premium Plan */}
                <div className={`border-2 rounded-lg p-6 ${
                  isPremium ? 'border-purple-500 bg-purple-50' : 'border-gray-200'
                }`}>
                  <div className="flex justify-between items-start">
                    <div>
                      <h4 className="text-lg font-semibold text-gray-900">Premium Plan</h4>
                      <p className="mt-2 text-sm text-gray-600">Unlock unlimited possibilities</p>
                      <ul className="mt-4 space-y-2 text-sm text-gray-600">
                        <li className="flex items-center">
                          <svg className="h-5 w-5 text-purple-500 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                          </svg>
                          Unlimited journal entries
                        </li>
                        <li className="flex items-center">
                          <svg className="h-5 w-5 text-purple-500 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                          </svg>
                          Advanced mood tracking
                        </li>
                        <li className="flex items-center">
                          <svg className="h-5 w-5 text-purple-500 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                          </svg>
                          Priority support
                        </li>
                      </ul>
                      <p className="mt-4 text-2xl font-bold text-gray-900">$0.50<span className="text-sm font-normal text-gray-600">/month</span></p>
                    </div>
                    {isPremium && (
                      <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
                        Current Plan
                      </span>
                    )}
                  </div>
                  <div className="mt-6">
                    {!isPremium ? (
                      <button
                        onClick={handleUpgrade}
                        disabled={loading}
                        className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-purple-600 hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500 disabled:bg-purple-400"
                      >
                        {loading ? 'Processing...' : 'Upgrade to Premium'}
                      </button>
                    ) : (
                      <button
                        onClick={handleDowngrade}
                        disabled={loading}
                        className="w-full flex justify-center py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-teal-500 disabled:bg-gray-100"
                      >
                        {loading ? 'Processing...' : 'Downgrade to Free'}
                      </button>
                    )}
                  </div>
                </div>
              </div>

              <div className="mt-6 p-4 bg-blue-50 rounded-lg">
                <p className="text-sm text-blue-800">
                  <strong>Note:</strong> Premium subscriptions are processed securely through Stripe. Your payment information is never stored on our servers.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SettingsPage;

