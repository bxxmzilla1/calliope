import React, { useState } from 'react';
import { useAuth } from '../hooks/useAuth';
import { useSubscription } from '../hooks/useSubscription';
import { useRouter } from '../hooks/useRouter';
import { Page } from '../types';

const SettingsPage: React.FC = () => {
  const { user } = useAuth();
  const { subscriptionTier, isPremium, upgradeToPremium, loading: subscriptionLoading } = useSubscription();
  const { navigate } = useRouter();
  const [upgrading, setUpgrading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleUpgrade = async () => {
    setUpgrading(true);
    setError('');
    setSuccess('');
    try {
      await upgradeToPremium();
      setSuccess('Successfully upgraded to Premium! You now have unlimited entries.');
    } catch (err: any) {
      setError(err.message || 'Failed to upgrade to Premium. Please try again.');
    } finally {
      setUpgrading(false);
    }
  };

  return (
    <div className="min-h-full py-12 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto">
        <div className="bg-white shadow-lg rounded-lg">
          <div className="px-6 py-5 border-b border-gray-200">
            <h2 className="text-2xl font-bold text-gray-900">Settings</h2>
          </div>

          <div className="px-6 py-5 space-y-8">
            {/* User Profile Section */}
            <div>
              <h3 className="text-lg font-medium text-gray-900 mb-4">User Profile</h3>
              <div className="bg-gray-50 rounded-lg p-4">
                <div className="space-y-3">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Email</label>
                    <p className="mt-1 text-sm text-gray-900">{user?.email}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Subscription Section */}
            <div>
              <h3 className="text-lg font-medium text-gray-900 mb-4">Subscription</h3>
              <div className="bg-gray-50 rounded-lg p-6">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h4 className="text-base font-semibold text-gray-900">
                      Current Plan: {subscriptionTier === 'premium' ? 'Premium' : 'Free'}
                    </h4>
                    <p className="mt-1 text-sm text-gray-600">
                      {isPremium
                        ? 'You have unlimited journal entries.'
                        : 'You can create up to 5 journal entries. Upgrade to Premium for unlimited entries.'}
                    </p>
                  </div>
                  {subscriptionTier === 'premium' && (
                    <span className="px-3 py-1 text-sm font-medium text-teal-800 bg-teal-100 rounded-full">
                      Premium
                    </span>
                  )}
                </div>

                {!isPremium && (
                  <div className="mt-6 border-t border-gray-200 pt-6">
                    <div className="mb-4">
                      <h5 className="text-base font-semibold text-gray-900 mb-2">Upgrade to Premium</h5>
                      <ul className="list-disc list-inside text-sm text-gray-600 space-y-1">
                        <li>Unlimited journal entries</li>
                        <li>All premium features</li>
                        <li>Priority support</li>
                      </ul>
                    </div>
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
                    <button
                      onClick={handleUpgrade}
                      disabled={upgrading || subscriptionLoading}
                      className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-teal-600 hover:bg-teal-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-teal-500 disabled:bg-teal-400 disabled:cursor-not-allowed"
                    >
                      {upgrading ? 'Upgrading...' : 'Upgrade to Premium'}
                    </button>
                    <p className="mt-2 text-xs text-gray-500 text-center">
                      Note: This is a demo upgrade. In production, integrate with a payment provider like Stripe.
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* Back Button */}
            <div className="pt-4">
              <button
                onClick={() => navigate(Page.Dashboard)}
                className="w-full sm:w-auto px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-teal-500"
              >
                Back to Dashboard
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SettingsPage;

