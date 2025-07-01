-- Fixed and Complete Schema Migration
-- This corrects the issues in the provided schema and ensures proper setup

-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "vector";

-- Create custom types
CREATE TYPE subscription_status AS ENUM ('active', 'canceled', 'past_due', 'unpaid');
CREATE TYPE gender_targeting AS ENUM ('all', 'men', 'women');
CREATE TYPE recommendation_status AS ENUM ('draft', 'active', 'completed', 'archived');

-- Create storage bucket for ad media
INSERT INTO storage.buckets (id, name, public) 
VALUES ('ad-media', 'ad-media', true)
ON CONFLICT (id) DO NOTHING;

-- Create storage policy for ad media
CREATE POLICY "Users can upload their own ad media" ON storage.objects
FOR INSERT WITH CHECK (bucket_id = 'ad-media' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can view their own ad media" ON storage.objects
FOR SELECT USING (bucket_id = 'ad-media' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can update their own ad media" ON storage.objects
FOR UPDATE USING (bucket_id = 'ad-media' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can delete their own ad media" ON storage.objects
FOR DELETE USING (bucket_id = 'ad-media' AND auth.uid()::text = (storage.foldername(name))[1]);

-- Create users table
CREATE TABLE IF NOT EXISTS users (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  name TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create plans table
CREATE TABLE IF NOT EXISTS plans (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  name TEXT NOT NULL,
  price_id TEXT UNIQUE NOT NULL,
  price DECIMAL(10,2) NOT NULL,
  features JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create ads table
CREATE TABLE IF NOT EXISTS ads (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE NOT NULL,
  headline TEXT NOT NULL,
  primary_text TEXT NOT NULL,
  call_to_action TEXT,
  media_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create ad_recommendations table
CREATE TABLE IF NOT EXISTS ad_recommendations (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  ad_id UUID REFERENCES ads(id) ON DELETE CASCADE NOT NULL,
  headline TEXT,
  primary_text TEXT,
  call_to_action TEXT,
  targeting JSONB,
  budget_recommendation TEXT,
  ai_score DECIMAL(3,2), -- AI confidence score for this variation
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create selected_recommendations table
CREATE TABLE IF NOT EXISTS selected_recommendations (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE NOT NULL,
  recommendation_id UUID REFERENCES ad_recommendations(id) ON DELETE CASCADE NOT NULL,
  status recommendation_status DEFAULT 'draft',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create ad_results table
CREATE TABLE IF NOT EXISTS ad_results (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  ad_id UUID REFERENCES ads(id) ON DELETE CASCADE NOT NULL,
  impressions INTEGER,
  clicks INTEGER,
  spend DECIMAL(10,2),
  conversions INTEGER,
  conversion_rate DECIMAL(5,4),
  ctr DECIMAL(5,4),
  cpc DECIMAL(10,2),
  cpm DECIMAL(10,2),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create ai_analyses table with vector support
CREATE TABLE IF NOT EXISTS ai_analyses (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  ad_id UUID REFERENCES ads(id) ON DELETE CASCADE NOT NULL,
  recommendation_id UUID REFERENCES ad_recommendations(id) ON DELETE CASCADE,
  analysis TEXT NOT NULL,
  recommendations JSONB,
  score DECIMAL(3,2),
  embedding VECTOR(1536), -- For semantic search
  analysis_type TEXT DEFAULT 'initial', -- 'initial', 'follow_up', 'performance_review'
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create analysis_sessions table
CREATE TABLE IF NOT EXISTS analysis_sessions (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE NOT NULL,
  title TEXT NOT NULL,
  company_description TEXT NOT NULL,
  ad_creative JSONB,
  messages JSONB DEFAULT '[]',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create facebook_ads table
CREATE TABLE IF NOT EXISTS facebook_ads (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  ad_id UUID REFERENCES ads(id) ON DELETE CASCADE NOT NULL,
  objective TEXT NOT NULL,
  budget_amount DECIMAL(10,2),
  age_min INTEGER DEFAULT 18,
  age_max INTEGER DEFAULT 65,
  gender gender_targeting DEFAULT 'all',
  detailed_targeting JSONB,
  destination_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create subscriptions table
CREATE TABLE IF NOT EXISTS subscriptions (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE NOT NULL,
  plan_id UUID REFERENCES plans(id) ON DELETE CASCADE NOT NULL,
  stripe_subscription_id TEXT UNIQUE NOT NULL,
  status subscription_status NOT NULL DEFAULT 'active',
  current_period_start TIMESTAMP WITH TIME ZONE,
  current_period_end TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_subscriptions_user_id ON subscriptions(user_id);
CREATE INDEX IF NOT EXISTS idx_subscriptions_stripe_id ON subscriptions(stripe_subscription_id);
CREATE INDEX IF NOT EXISTS idx_analysis_sessions_user_id ON analysis_sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_analysis_sessions_created_at ON analysis_sessions(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_ads_user_id ON ads(user_id);
CREATE INDEX IF NOT EXISTS idx_facebook_ads_ad_id ON facebook_ads(ad_id);
CREATE INDEX IF NOT EXISTS idx_ad_results_ad_id ON ad_results(ad_id);
CREATE INDEX IF NOT EXISTS idx_ai_analyses_ad_id ON ai_analyses(ad_id);
CREATE INDEX IF NOT EXISTS idx_ad_recommendations_ad_id ON ad_recommendations(ad_id);
CREATE INDEX IF NOT EXISTS idx_selected_recommendations_user_id ON selected_recommendations(user_id);
CREATE INDEX IF NOT EXISTS idx_selected_recommendations_status ON selected_recommendations(status);
CREATE INDEX IF NOT EXISTS idx_ai_analyses_recommendation_id ON ai_analyses(recommendation_id);
CREATE INDEX IF NOT EXISTS idx_ai_analyses_embedding ON ai_analyses USING ivfflat (embedding vector_cosine_ops);

-- Enable Row Level Security
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE analysis_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE ads ENABLE ROW LEVEL SECURITY;
ALTER TABLE facebook_ads ENABLE ROW LEVEL SECURITY;
ALTER TABLE ad_results ENABLE ROW LEVEL SECURITY;
ALTER TABLE ai_analyses ENABLE ROW LEVEL SECURITY;
ALTER TABLE ad_recommendations ENABLE ROW LEVEL SECURITY;
ALTER TABLE selected_recommendations ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for users
CREATE POLICY "Users can view own profile" ON users FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users can update own profile" ON users FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "Users can insert own profile" ON users FOR INSERT WITH CHECK (auth.uid() = id);

-- Create RLS policies for subscriptions
CREATE POLICY "Users can view own subscriptions" ON subscriptions FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own subscriptions" ON subscriptions FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own subscriptions" ON subscriptions FOR UPDATE USING (auth.uid() = user_id);

-- Create RLS policies for analysis_sessions
CREATE POLICY "Users can view own analysis sessions" ON analysis_sessions FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own analysis sessions" ON analysis_sessions FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own analysis sessions" ON analysis_sessions FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own analysis sessions" ON analysis_sessions FOR DELETE USING (auth.uid() = user_id);

-- Create RLS policies for ads
CREATE POLICY "Users can view own ads" ON ads FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own ads" ON ads FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own ads" ON ads FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own ads" ON ads FOR DELETE USING (auth.uid() = user_id);

-- Create RLS policies for facebook_ads
CREATE POLICY "Users can view own facebook ads" ON facebook_ads FOR SELECT USING (
  EXISTS (SELECT 1 FROM ads WHERE ads.id = facebook_ads.ad_id AND ads.user_id = auth.uid())
);
CREATE POLICY "Users can insert own facebook ads" ON facebook_ads FOR INSERT WITH CHECK (
  EXISTS (SELECT 1 FROM ads WHERE ads.id = facebook_ads.ad_id AND ads.user_id = auth.uid())
);
CREATE POLICY "Users can update own facebook ads" ON facebook_ads FOR UPDATE USING (
  EXISTS (SELECT 1 FROM ads WHERE ads.id = facebook_ads.ad_id AND ads.user_id = auth.uid())
);
CREATE POLICY "Users can delete own facebook ads" ON facebook_ads FOR DELETE USING (
  EXISTS (SELECT 1 FROM ads WHERE ads.id = facebook_ads.ad_id AND ads.user_id = auth.uid())
);

-- Create RLS policies for ad_results
CREATE POLICY "Users can view own ad results" ON ad_results FOR SELECT USING (
  EXISTS (SELECT 1 FROM ads WHERE ads.id = ad_results.ad_id AND ads.user_id = auth.uid())
);
CREATE POLICY "Users can insert own ad results" ON ad_results FOR INSERT WITH CHECK (
  EXISTS (SELECT 1 FROM ads WHERE ads.id = ad_results.ad_id AND ads.user_id = auth.uid())
);
CREATE POLICY "Users can update own ad results" ON ad_results FOR UPDATE USING (
  EXISTS (SELECT 1 FROM ads WHERE ads.id = ad_results.ad_id AND ads.user_id = auth.uid())
);
CREATE POLICY "Users can delete own ad results" ON ad_results FOR DELETE USING (
  EXISTS (SELECT 1 FROM ads WHERE ads.id = ad_results.ad_id AND ads.user_id = auth.uid())
);

-- Create RLS policies for ai_analyses
CREATE POLICY "Users can view own ai analyses" ON ai_analyses FOR SELECT USING (
  EXISTS (SELECT 1 FROM ads WHERE ads.id = ai_analyses.ad_id AND ads.user_id = auth.uid())
);
CREATE POLICY "Users can insert own ai analyses" ON ai_analyses FOR INSERT WITH CHECK (
  EXISTS (SELECT 1 FROM ads WHERE ads.id = ai_analyses.ad_id AND ads.user_id = auth.uid())
);
CREATE POLICY "Users can update own ai analyses" ON ai_analyses FOR UPDATE USING (
  EXISTS (SELECT 1 FROM ads WHERE ads.id = ai_analyses.ad_id AND ads.user_id = auth.uid())
);
CREATE POLICY "Users can delete own ai analyses" ON ai_analyses FOR DELETE USING (
  EXISTS (SELECT 1 FROM ads WHERE ads.id = ai_analyses.ad_id AND ads.user_id = auth.uid())
);

-- Create RLS policies for ad_recommendations
CREATE POLICY "Users can view own ad recommendations" ON ad_recommendations FOR SELECT USING (
  EXISTS (SELECT 1 FROM ads WHERE ads.id = ad_recommendations.ad_id AND ads.user_id = auth.uid())
);
CREATE POLICY "Users can insert own ad recommendations" ON ad_recommendations FOR INSERT WITH CHECK (
  EXISTS (SELECT 1 FROM ads WHERE ads.id = ad_recommendations.ad_id AND ads.user_id = auth.uid())
);
CREATE POLICY "Users can update own ad recommendations" ON ad_recommendations FOR UPDATE USING (
  EXISTS (SELECT 1 FROM ads WHERE ads.id = ad_recommendations.ad_id AND ads.user_id = auth.uid())
);
CREATE POLICY "Users can delete own ad recommendations" ON ad_recommendations FOR DELETE USING (
  EXISTS (SELECT 1 FROM ads WHERE ads.id = ad_recommendations.ad_id AND ads.user_id = auth.uid())
);

-- Create RLS policies for selected_recommendations
CREATE POLICY "Users can view own selected recommendations" ON selected_recommendations FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own selected recommendations" ON selected_recommendations FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own selected recommendations" ON selected_recommendations FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own selected recommendations" ON selected_recommendations FOR DELETE USING (auth.uid() = user_id);

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers for updated_at columns
CREATE TRIGGER update_users_updated_at 
    BEFORE UPDATE ON users 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_subscriptions_updated_at 
    BEFORE UPDATE ON subscriptions 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_analysis_sessions_updated_at 
    BEFORE UPDATE ON analysis_sessions 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_selected_recommendations_updated_at 
    BEFORE UPDATE ON selected_recommendations 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

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
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user(); 