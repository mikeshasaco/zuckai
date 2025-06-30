# Database Migrations

This directory contains database migrations for the Zuck AI application.

## Migration Files

- `001_initial_schema.sql` - Initial database schema with all tables, types, and policies
- `002_add_user_trigger.sql` - User trigger to automatically create user records on signup

## How to Run Migrations

Since we're not using the Supabase CLI yet, you need to run these migrations manually in your Supabase dashboard:

### Option 1: Using npm scripts (recommended)

```bash
# See what migrations need to be run
npm run migrate:all

# Run initial schema
npm run migrate:init

# Run user trigger
npm run migrate:user-trigger
```

### Option 2: Manual execution

1. Go to your Supabase dashboard
2. Navigate to the SQL Editor
3. Copy and paste the contents of each migration file in order:
   - First: `001_initial_schema.sql`
   - Second: `002_add_user_trigger.sql`

## Migration Order

Always run migrations in numerical order:

1. `001_initial_schema.sql` - Creates all tables and policies
2. `002_add_user_trigger.sql` - Adds the user trigger

## Future Migrations

When you need to make database changes:

1. Create a new migration file: `003_your_migration_name.sql`
2. Add your SQL changes to the file
3. Run it in the Supabase dashboard
4. Update this README if needed

## Example: Adding a new column

```sql
-- 003_add_user_preferences.sql
ALTER TABLE users ADD COLUMN preferences JSONB DEFAULT '{}';
```

## Setting up Supabase CLI (Optional)

If you want to use the Supabase CLI for automated migrations:

```bash
# Install Supabase CLI
brew install supabase/tap/supabase

# Initialize Supabase in your project
supabase init

# Link to your project
supabase link --project-ref your-project-id

# Push migrations
supabase db push --linked
```

## Current Schema

The database includes:

- **users** - User profiles
- **plans** - Subscription plans
- **subscriptions** - User subscriptions
- **analysis_sessions** - Chat sessions with AI
- **ads** - Ad creatives
- **facebook_ads** - Facebook ad configurations
- **ad_results** - Ad performance results
- **ai_analyses** - AI analysis results

All tables have Row Level Security (RLS) enabled with appropriate policies. 