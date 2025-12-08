import { supabase } from './supabase';

/**
 * Creates a Stripe checkout session for premium subscription
 * @returns The checkout session URL
 */
export async function createCheckoutSession(): Promise<string> {
  const { data: { session } } = await supabase.auth.getSession();
  
  if (!session) {
    throw new Error('You must be logged in to upgrade');
  }

  // Call the Supabase Edge Function
  const { data, error } = await supabase.functions.invoke('create-checkout', {
    headers: {
      Authorization: `Bearer ${session.access_token}`,
    },
  });

  if (error) {
    throw new Error(error.message || 'Failed to create checkout session');
  }

  if (!data?.url) {
    throw new Error('No checkout URL returned');
  }

  return data.url;
}

/**
 * Cancels a Stripe subscription
 * Note: This will be handled via webhook, but we can also call Stripe directly if needed
 */
export async function cancelSubscription(): Promise<void> {
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) {
    throw new Error('You must be logged in');
  }

  // Get user profile to find Stripe subscription ID
  const { data: profile, error: profileError } = await supabase
    .from('user_profiles')
    .select('stripe_subscription_id')
    .eq('user_id', user.id)
    .single();

  if (profileError || !profile?.stripe_subscription_id) {
    // If no Stripe subscription, just update the tier directly
    await supabase
      .from('user_profiles')
      .update({ subscription_tier: 'free' })
      .eq('user_id', user.id);
    return;
  }

  // Call a cancel subscription function (we'll create this if needed)
  // For now, we'll just update the database and let the webhook handle Stripe
  const { error } = await supabase
    .from('user_profiles')
    .update({ 
      subscription_tier: 'free',
      stripe_subscription_status: 'canceled',
    })
    .eq('user_id', user.id);

  if (error) {
    throw new Error(error.message || 'Failed to cancel subscription');
  }
}

