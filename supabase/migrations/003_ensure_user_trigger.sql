-- Ensure user trigger migration
-- This ensures the trigger is properly set up for hosted Supabase instances

-- Drop existing trigger and function if they exist
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP FUNCTION IF EXISTS public.handle_new_user();

-- Create function to handle new user signups
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.users (id, email, name)
  VALUES (NEW.id, NEW.email, COALESCE(NEW.raw_user_meta_data->>'name', NEW.email))
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger to automatically create user record on signup
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Also create a function to manually create user records for existing users
CREATE OR REPLACE FUNCTION public.create_user_for_existing_auth()
RETURNS void AS $$
DECLARE
  auth_user RECORD;
BEGIN
  FOR auth_user IN SELECT id, email, raw_user_meta_data FROM auth.users LOOP
    INSERT INTO public.users (id, email, name)
    VALUES (
      auth_user.id, 
      auth_user.email, 
      COALESCE(auth_user.raw_user_meta_data->>'name', auth_user.email)
    )
    ON CONFLICT (id) DO NOTHING;
  END LOOP;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER; 