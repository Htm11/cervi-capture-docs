
# Supabase Setup Guide for CerviScan

This guide explains how to set up your Supabase project for the CerviScan application.

## 1. Create a Supabase Project

1. Go to [https://app.supabase.co/](https://app.supabase.co/) and sign in
2. Click "New Project" and follow the setup wizard
3. Choose a name for your project and set a secure database password
4. Select a region closest to your users
5. Wait for your project to be created (this may take a few minutes)

## 2. Set Up Database Schema

1. In your Supabase project dashboard, go to the "SQL Editor" section
2. Create a new query
3. Copy and paste the contents of `src/lib/supabase-schema.sql` into the editor
4. Run the query to create all necessary tables and policies

## 3. Configure Storage

The schema automatically creates a `cervical_images` bucket with appropriate permissions.

## 4. Update Your Environment Variables

1. Create a `.env` file in your project root (if it doesn't exist)
2. Add your Supabase URL and anon key:

```
VITE_SUPABASE_URL=your-supabase-url
VITE_SUPABASE_ANON_KEY=your-supabase-anon-key
```

3. For development with mock authentication:

```
VITE_USE_MOCK_AUTH=true
```

## 5. Testing Your Setup

1. Register a new doctor account
2. Check the Supabase dashboard to confirm a new entry in the `doctors` table
3. Create a test patient and screening record
4. Verify data is correctly stored in the database

## Troubleshooting

If you encounter issues:

1. Check the "Logs" section in your Supabase dashboard
2. Verify RLS policies are correct for your use case
3. Test API endpoints using the Supabase API documentation
