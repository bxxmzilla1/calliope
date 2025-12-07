# Deployment Guide

This guide will help you deploy Calliope to Vercel.

## Prerequisites

- A GitHub account
- A Vercel account (sign up at https://vercel.com)
- A Supabase project (already set up)

## Step 1: Push to GitHuba

1. Initialize git (if not already done):
   ```bash
   git init
   ```

2. Add all files:
   ```bash
   git add .
   ```

3. Create initial commit:
   ```bash
   git commit -m "Initial commit: Calliope journal app"
   ```

4. Create a new repository on GitHub:
   - Go to https://github.com/new
   - Create a new repository (e.g., `calliope`)
   - **Do NOT** initialize with README, .gitignore, or license

5. Push to GitHub:
   ```bash
   git remote add origin https://github.com/YOUR_USERNAME/calliope.git
   git branch -M main
   git push -u origin main
   ```

## Step 2: Deploy to Vercel

### Option A: Deploy via Vercel Dashboard (Recommended)

1. Go to https://vercel.com and sign in
2. Click "Add New Project"
3. Import your GitHub repository
4. Vercel will auto-detect Vite configuration
5. **Important**: Add environment variables:
   - Click "Environment Variables"
   - Add the following:
     - `VITE_SUPABASE_URL` = `https://qpsklhwqorglmwckyjub.supabase.co`
     - `VITE_SUPABASE_ANON_KEY` = `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFwc2tsaHdxb3JnbG13Y2t5anViIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjUxMzA3NTQsImV4cCI6MjA4MDcwNjc1NH0.U0Saq0qRd8hlAGKHzJf4bDMDQpHbpDooCI00FMo09Dc`
6. Click "Deploy"

### Option B: Deploy via Vercel CLI

1. Install Vercel CLI:
   ```bash
   npm i -g vercel
   ```

2. Login to Vercel:
   ```bash
   vercel login
   ```

3. Deploy:
   ```bash
   vercel
   ```

4. Follow the prompts and add environment variables when asked

## Step 3: Configure Environment Variables

After deployment, make sure your environment variables are set:

1. Go to your Vercel project dashboard
2. Navigate to Settings → Environment Variables
3. Ensure these are set for **Production**, **Preview**, and **Development**:
   - `VITE_SUPABASE_URL`
   - `VITE_SUPABASE_ANON_KEY`

4. If you added them after deployment, trigger a new deployment:
   - Go to Deployments tab
   - Click the three dots on the latest deployment
   - Select "Redeploy"

## Step 4: Verify Deployment

1. Visit your deployed URL (provided by Vercel)
2. Test the following:
   - Sign up with a new account
   - Log in
   - Create a journal entry
   - Edit an entry
   - Delete an entry

## Troubleshooting

### Build Fails

- Check that all environment variables are set in Vercel
- Verify your Supabase credentials are correct
- Check the build logs in Vercel dashboard

### App Works Locally But Not on Vercel

- Ensure environment variables are set in Vercel (not just locally)
- Check that variables start with `VITE_` prefix
- Redeploy after adding environment variables

### Authentication Issues

- Verify Supabase project is active
- Check that Row Level Security (RLS) policies are enabled
- Ensure Supabase Auth is enabled in your project settings

## Continuous Deployment

Vercel automatically deploys when you push to your main branch:
- Push to `main` → Production deployment
- Push to other branches → Preview deployment
- Open a Pull Request → Preview deployment with PR comments

## Custom Domain (Optional)

1. Go to your Vercel project settings
2. Navigate to Domains
3. Add your custom domain
4. Follow DNS configuration instructions

## Support

For issues:
- Check Vercel logs: Project → Deployments → Click on deployment → View Function Logs
- Check Supabase logs: Supabase Dashboard → Logs
- Review README.md for local development setup

