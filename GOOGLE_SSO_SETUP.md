# Google SSO Setup Guide

## 🚀 Setting up Google OAuth with Supabase SSR

### Step 1: Create Google OAuth Credentials

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select an existing one
3. Enable the Google+ API
4. Go to "Credentials" → "Create Credentials" → "OAuth 2.0 Client IDs"
5. Choose "Web application"
6. Add authorized redirect URIs:
   - `https://your-project-ref.supabase.co/auth/v1/callback`
   - `http://localhost:3000/auth/callback` (for local development)
7. Copy the Client ID and Client Secret

### Step 2: Configure Supabase Auth

1. Go to your Supabase Dashboard
2. Navigate to Authentication → Providers
3. Find "Google" and click "Edit"
4. Enable Google provider
5. Enter your Google Client ID and Client Secret
6. Save the configuration

### Step 3: Update Environment Variables

Add these to your `.env.local`:

```bash
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

### Step 4: Run Database Migrations

Make sure you've run the database migrations to create the user trigger:

```bash
# Run the migrations in your Supabase dashboard
npm run migrate:init
npm run migrate:user-trigger
```

### Step 5: Test the Integration

1. Start your development server: `npm run dev`
2. Go to `/auth`
3. Click "Continue with Google"
4. Complete the OAuth flow

## 🔧 Architecture Overview

### What We're Using

- **@supabase/ssr**: Latest Supabase package for SSR support
- **Custom Auth UI**: Modern, maintainable auth interface
- **Middleware**: Automatic auth redirects and session management
- **Server Client**: Secure API route authentication
- **Database Trigger**: Automatic user record creation

### Key Features

- ✅ **Google SSO**: One-click sign-in with Google
- ✅ **Email/Password**: Traditional auth as fallback
- ✅ **Automatic Redirects**: Middleware handles auth flow
- ✅ **User Creation**: Database trigger creates user records
- ✅ **SSR Support**: Better performance and SEO
- ✅ **Type Safety**: Full TypeScript support

## 🔧 Troubleshooting

### Common Issues:

1. **Redirect URI mismatch**: Make sure the redirect URI in Google Console matches your Supabase callback URL
2. **CORS errors**: Ensure your domain is properly configured in Google Console
3. **Auth state errors**: Check that your Supabase project is properly linked
4. **User not created**: Verify the database trigger is running

### Debug Steps:

1. Check browser console for errors
2. Verify environment variables are loaded
3. Confirm Google OAuth is enabled in Supabase
4. Test with a different browser/incognito mode
5. Check Supabase logs for auth events

## 📝 Notes

- The user trigger will automatically create user records in your `users` table
- Google SSO users will have their email and name automatically populated
- The middleware will handle redirects automatically
- Users can still sign up with email/password as a fallback
- All auth is handled by Supabase's battle-tested auth system

## 🎯 Next Steps

After setup:
1. Test the complete auth flow with both Google and email
2. Verify user records are created in the database
3. Test session creation and chat functionality
4. Deploy to production and update Google OAuth redirect URIs
5. Monitor auth events in Supabase dashboard

## 🔒 Security Features

- **Row Level Security**: All database operations are protected
- **Session Management**: Secure cookie-based sessions
- **OAuth 2.0**: Industry-standard authentication
- **Automatic Logout**: Session expiration handling
- **CSRF Protection**: Built into Supabase auth 