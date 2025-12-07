# Calliope - Journal App

A modern journaling application built with React, TypeScript, and Supabase.

## Features

- 🔐 Secure authentication with Supabase Auth
- 📝 Create, edit, and delete journal entries
- 😊 Track your mood with each entry
- ☁️ Cloud-synced data with Supabase
- 🎨 Modern, responsive UI

## Tech Stack

- **Frontend**: React 19, TypeScript, Vite
- **Backend**: Supabase (Auth + Database)
- **Deployment**: Vercel

## Prerequisites

- Node.js (v18 or higher)
- npm or yarn
- A Supabase account and project

## Getting Started

### 1. Clone the Repository

```bash
git clone <your-repo-url>
cd calliope
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Set Up Environment Variables

Copy the example environment file:

```bash
cp .env.example .env.local
```

Then edit `.env.local` and add your Supabase credentials:

```env
VITE_SUPABASE_URL=https://your-project-id.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key-here
```

You can find these values in your Supabase project settings:
1. Go to https://app.supabase.com
2. Select your project
3. Navigate to Settings → API
4. Copy the Project URL and anon/public key

### 4. Run the Development Server

```bash
npm run dev
```

The app will be available at `http://localhost:3000`

## Building for Production

```bash
npm run build
```

The production build will be in the `dist` directory.

## Deployment to Vercel

### Option 1: Deploy via Vercel CLI

1. Install Vercel CLI:
   ```bash
   npm i -g vercel
   ```

2. Deploy:
   ```bash
   vercel
   ```

3. Add environment variables in Vercel dashboard:
   - Go to your project settings
   - Navigate to Environment Variables
   - Add:
     - `VITE_SUPABASE_URL`
     - `VITE_SUPABASE_ANON_KEY`

### Option 2: Deploy via GitHub

1. Push your code to GitHub:
   ```bash
   git add .
   git commit -m "Initial commit"
   git push origin main
   ```

2. Import your repository in Vercel:
   - Go to https://vercel.com
   - Click "Add New Project"
   - Import your GitHub repository
   - Vercel will auto-detect Vite configuration

3. Add environment variables:
   - In the project settings, add:
     - `VITE_SUPABASE_URL`
     - `VITE_SUPABASE_ANON_KEY`

4. Deploy!

### Environment Variables in Vercel

Make sure to add these environment variables in your Vercel project settings:

- `VITE_SUPABASE_URL` - Your Supabase project URL
- `VITE_SUPABASE_ANON_KEY` - Your Supabase anon/public key

**Important**: After adding environment variables, you'll need to trigger a new deployment for them to take effect.

## Project Structure

```
calliope/
├── components/          # Reusable React components
├── hooks/              # Custom React hooks (auth, journal, router)
├── lib/                # Utility libraries (Supabase client)
├── pages/              # Page components
├── router/             # Routing logic
├── types.ts            # TypeScript type definitions
├── App.tsx             # Main app component
├── index.tsx           # Entry point
└── vite.config.ts      # Vite configuration
```

## Database Schema

The app uses a `journal_entries` table in Supabase with the following structure:

- `id` (UUID) - Primary key
- `user_id` (UUID) - Foreign key to auth.users
- `title` (TEXT) - Entry title
- `content` (TEXT) - Entry content
- `date` (TIMESTAMPTZ) - Entry date
- `mood` (TEXT) - Mood value (happy, sad, neutral, excited, calm)
- `created_at` (TIMESTAMPTZ) - Creation timestamp
- `updated_at` (TIMESTAMPTZ) - Last update timestamp

Row Level Security (RLS) is enabled to ensure users can only access their own entries.

## License

MIT
