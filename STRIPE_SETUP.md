# Stripe Integration Setup Guide

This guide will help you set up Stripe integration for the Calliope journal app.

## Prerequisites

1. A Stripe account (sign up at https://stripe.com)
2. Your Supabase project with Edge Functions enabled

## Step 1: Get Stripe API Keys

1. Go to https://dashboard.stripe.com
2. Navigate to **Developers** → **API keys**
3. Copy your **Publishable key** and **Secret key** (use test keys for development)
4. Keep these keys secure - you'll need them in the next steps

## Step 2: Update Database Schema

Run the SQL script in your Supabase SQL Editor:

1. Go to your Supabase project dashboard
2. Navigate to **SQL Editor**
3. Open and run `supabase-schema-stripe.sql`
4. This adds Stripe-related columns to the `user_profiles` table

## Step 3: Create Supabase Edge Functions

### Function 1: create-checkout

1. Go to your Supabase project dashboard
2. Navigate to **Edge Functions**
3. Click **Create a new function**
4. Name it: `create-checkout`
5. Copy the contents of `supabase/functions/create-checkout/index.ts` into the editor
6. Click **Deploy**

### Function 2: stripe-webhook

1. In **Edge Functions**, click **Create a new function**
2. Name it: `stripe-webhook`
3. Copy the contents of `supabase/functions/stripe-webhook/index.ts` into the editor
4. Click **Deploy**

## Step 4: Configure Environment Variables in Supabase

1. Go to **Project Settings** → **Edge Functions**
2. Add the following secrets:

   - `STRIPE_SECRET_KEY` = Your Stripe Secret Key (starts with `sk_`)
   - `STRIPE_WEBHOOK_SECRET` = Your Stripe Webhook Secret (you'll get this in Step 5)
   - `SUPABASE_URL` = Your Supabase project URL
   - `SUPABASE_SERVICE_ROLE_KEY` = Your Supabase Service Role Key (from Project Settings → API)
   - `SITE_URL` = Your app URL (e.g., `https://your-app.vercel.app`)

## Step 5: Set Up Stripe Webhook

1. Go to https://dashboard.stripe.com/webhooks
2. Click **Add endpoint**
3. Enter your webhook URL:
   ```
   https://YOUR_PROJECT_REF.supabase.co/functions/v1/stripe-webhook
   ```
   Replace `YOUR_PROJECT_REF` with your Supabase project reference
4. Select these events to listen to:
   - `checkout.session.completed`
   - `customer.subscription.updated`
   - `customer.subscription.deleted`
   - `invoice.payment_succeeded`
   - `invoice.payment_failed`
5. Click **Add endpoint**
6. Copy the **Signing secret** (starts with `whsec_`)
7. Add this as `STRIPE_WEBHOOK_SECRET` in Supabase Edge Functions secrets

## Step 6: Create Stripe Product and Price (Optional)

If you want to use a pre-created product instead of creating it dynamically:

1. Go to https://dashboard.stripe.com/products
2. Create a new product: "Calliope Premium"
3. Set price to $0.50/month (recurring)
4. Copy the Price ID (starts with `price_`)
5. Update the `create-checkout` function to use this Price ID instead of `price_data`

## Step 7: Test the Integration

### Test Mode

1. Use Stripe test mode keys
2. Use test card: `4242 4242 4242 4242`
3. Any future expiry date and CVC
4. Any ZIP code

### Test Flow

1. Log in to your app
2. Go to Settings
3. Click "Upgrade to Premium"
4. Complete the Stripe checkout
5. Verify subscription is updated in your database
6. Check that you can create unlimited entries

## Troubleshooting

### Checkout not working

- Verify Edge Functions are deployed
- Check Edge Function logs in Supabase dashboard
- Verify `STRIPE_SECRET_KEY` is set correctly
- Check browser console for errors

### Webhook not receiving events

- Verify webhook URL is correct
- Check `STRIPE_WEBHOOK_SECRET` matches Stripe dashboard
- View webhook logs in Stripe dashboard
- Check Edge Function logs in Supabase

### Subscription not updating

- Check webhook is receiving events
- Verify database schema is updated
- Check RLS policies allow updates
- Review Edge Function logs

## Production Checklist

- [ ] Switch to Stripe live mode keys
- [ ] Update webhook endpoint to production URL
- [ ] Test with real payment method
- [ ] Set up email notifications in Stripe
- [ ] Configure subscription cancellation flow
- [ ] Set up invoice emails
- [ ] Test subscription renewal
- [ ] Test payment failure handling

## Support

For issues:
- Check Supabase Edge Function logs
- Check Stripe webhook logs
- Review browser console for errors
- Verify all environment variables are set

