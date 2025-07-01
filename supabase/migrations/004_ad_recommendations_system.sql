-- Ad Recommendations System Migration
-- This implements the structured ad recommendation system with vector-based learning

-- Enable pgvector extension for embeddings
CREATE EXTENSION IF NOT EXISTS "pgvector";

-- Create recommendation status enum
CREATE TYPE recommendation_status AS ENUM ('draft', 'active', 'completed', 'archived');

-- Create ad_recommendations table to store AI-generated variations
CREATE TABLE ad_recommendations (
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

-- Create selected_recommendations table to track user selections
CREATE TABLE selected_recommendations (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE NOT NULL,
  recommendation_id UUID REFERENCES ad_recommendations(id) ON DELETE CASCADE NOT NULL,
  status recommendation_status DEFAULT 'draft',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Update ai_analyses table to include embeddings and recommendation references
ALTER TABLE ai_analyses 
ADD COLUMN recommendation_id UUID REFERENCES ad_recommendations(id) ON DELETE CASCADE,
ADD COLUMN embedding VECTOR(1536), -- For semantic search
ADD COLUMN analysis_type TEXT DEFAULT 'initial'; -- 'initial', 'follow_up', 'performance_review'

-- Create indexes for better performance
CREATE INDEX idx_ad_recommendations_ad_id ON ad_recommendations(ad_id);
CREATE INDEX idx_selected_recommendations_user_id ON selected_recommendations(user_id);
CREATE INDEX idx_selected_recommendations_status ON selected_recommendations(status);
CREATE INDEX idx_ai_analyses_recommendation_id ON ai_analyses(recommendation_id);
CREATE INDEX idx_ai_analyses_embedding ON ai_analyses USING ivfflat (embedding vector_cosine_ops);

-- Enable RLS on new tables
ALTER TABLE ad_recommendations ENABLE ROW LEVEL SECURITY;
ALTER TABLE selected_recommendations ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for ad_recommendations
CREATE POLICY "Users can view own ad recommendations" ON ad_recommendations 
FOR SELECT USING (
  EXISTS (SELECT 1 FROM ads WHERE ads.id = ad_recommendations.ad_id AND ads.user_id = auth.uid())
);

CREATE POLICY "Users can insert own ad recommendations" ON ad_recommendations 
FOR INSERT WITH CHECK (
  EXISTS (SELECT 1 FROM ads WHERE ads.id = ad_recommendations.ad_id AND ads.user_id = auth.uid())
);

CREATE POLICY "Users can update own ad recommendations" ON ad_recommendations 
FOR UPDATE USING (
  EXISTS (SELECT 1 FROM ads WHERE ads.id = ad_recommendations.ad_id AND ads.user_id = auth.uid())
);

CREATE POLICY "Users can delete own ad recommendations" ON ad_recommendations 
FOR DELETE USING (
  EXISTS (SELECT 1 FROM ads WHERE ads.id = ad_recommendations.ad_id AND ads.user_id = auth.uid())
);

-- Create RLS policies for selected_recommendations
CREATE POLICY "Users can view own selected recommendations" ON selected_recommendations 
FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own selected recommendations" ON selected_recommendations 
FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own selected recommendations" ON selected_recommendations 
FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own selected recommendations" ON selected_recommendations 
FOR DELETE USING (auth.uid() = user_id);

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create trigger for selected_recommendations updated_at
CREATE TRIGGER update_selected_recommendations_updated_at 
    BEFORE UPDATE ON selected_recommendations 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Create function to generate embeddings for semantic search
CREATE OR REPLACE FUNCTION generate_analysis_embedding()
RETURNS TRIGGER AS $$
BEGIN
  -- This will be called by the application when creating AI analyses
  -- The embedding will be generated using OpenAI's embedding API
  RETURN NEW;
END;
$$ LANGUAGE plpgsql; 