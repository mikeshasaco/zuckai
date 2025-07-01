# 🧠 Zuck AI – Ad Session Architecture & Implementation Guide

## 🔧 Project Overview

Zuck AI is a sophisticated session-based ad optimization tool built in **Next.js** with a **Supabase** backend. It implements a structured recommendation system with vector-based learning to help users optimize their Facebook ad campaigns.

## 🏗️ Core Architecture

### Database Schema

#### Key Tables

1. **`users`** - User profiles and authentication
2. **`ads`** - Original user-submitted ad creatives
3. **`ad_recommendations`** - AI-generated ad variations
4. **`selected_recommendations`** - User selections for testing
5. **`ad_results`** - Performance metrics from tested ads
6. **`ai_analyses`** - AI analysis with vector embeddings
7. **`analysis_sessions`** - Chat sessions and conversation history

#### New Schema Features

```sql
-- Ad Recommendations Table
CREATE TABLE ad_recommendations (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  ad_id UUID REFERENCES ads(id) ON DELETE CASCADE NOT NULL,
  headline TEXT,
  primary_text TEXT,
  call_to_action TEXT,
  targeting JSONB,
  budget_recommendation TEXT,
  ai_score DECIMAL(3,2), -- AI confidence score
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Selected Recommendations Table
CREATE TABLE selected_recommendations (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE NOT NULL,
  recommendation_id UUID REFERENCES ad_recommendations(id) ON DELETE CASCADE NOT NULL,
  status recommendation_status DEFAULT 'draft', -- 'draft', 'active', 'completed', 'archived'
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enhanced AI Analyses with Vector Embeddings
ALTER TABLE ai_analyses 
ADD COLUMN recommendation_id UUID REFERENCES ad_recommendations(id),
ADD COLUMN embedding VECTOR(1536), -- For semantic search
ADD COLUMN analysis_type TEXT DEFAULT 'initial'; -- 'initial', 'follow_up', 'performance_review'
```

## 🔄 Session Flow & Phases

### Phase 1: Initial Creative Analysis
1. **User Input**: Submits original ad creative via "Creative Ad" modal
2. **AI Analysis**: Zuck AI generates 2-3 optimized variations
3. **Database Storage**: 
   - Original ad stored in `ads` table
   - Variations stored in `ad_recommendations` table
   - Initial analysis stored in `ai_analyses` table
4. **UI Display**: Recommendations shown with selection interface

### Phase 2: Recommendation Selection
1. **User Selection**: User selects which variations to test
2. **Status Tracking**: Selected recommendations marked as 'active' in `selected_recommendations`
3. **Session Lock**: "Creative Ad" button replaced with "Follow Up" button
4. **Focus Shift**: Chat now focuses only on selected variations

### Phase 3: Performance Tracking
1. **Results Input**: User reports performance metrics via popup
2. **Data Storage**: Metrics stored in `ad_results` table
3. **AI Analysis**: Performance review with vector embeddings
4. **Learning**: Successful patterns stored for future recommendations

### Phase 4: Ongoing Optimization
1. **Semantic Search**: Vector embeddings enable finding similar successful ads
2. **Pattern Recognition**: AI learns from historical performance data
3. **Continuous Improvement**: Recommendations improve over time

## 🛠️ Implementation Details

### Key Components

#### 1. AdRecommendations Component
- Displays AI-generated variations
- Handles user selection with database updates
- Shows AI confidence scores
- Manages selection state

#### 2. Enhanced Analyze API
- Phase-aware processing (`initial`, `follow_up`, `performance_review`)
- Structured JSON responses for recommendations
- Database integration for storing variations
- Vector embedding generation

#### 3. Session Management
- Phase tracking (`sessionPhase` state)
- Recommendation state management
- Selection persistence
- Chat context awareness

### Vector-Based Learning

#### Embedding Generation
```typescript
// Generate embeddings for semantic search
const embedding = await openai.embeddings.create({
  model: 'text-embedding-3-small',
  input: analysisText
})
```

#### Semantic Search
```sql
-- Find similar successful analyses
SELECT * FROM ai_analyses 
WHERE embedding <-> $1 < 0.3 
AND score > 0.7 
ORDER BY embedding <-> $1;
```

## 🎯 Key Features

### 1. Structured Recommendations
- **AI-Generated Variations**: 2-3 optimized ad versions
- **Confidence Scoring**: AI provides confidence scores (0.0-1.0)
- **Targeting Suggestions**: Specific audience optimization
- **Budget Recommendations**: Optimal budget allocation

### 2. Selection Management
- **Multi-Selection**: Users can select multiple variations
- **Status Tracking**: Active/archived status management
- **Database Persistence**: Selections stored and tracked
- **UI Feedback**: Visual indication of selections

### 3. Vector-Based Learning
- **Semantic Search**: Find similar successful patterns
- **Performance Analysis**: Learn from historical data
- **Continuous Improvement**: Recommendations improve over time
- **Pattern Recognition**: Identify successful ad elements

### 4. Phase-Based Workflow
- **Initial Phase**: Generate variations from original creative
- **Follow-Up Phase**: Focus on selected variations
- **Performance Review**: Analyze actual results
- **Ongoing Optimization**: Continuous learning and improvement

## 🔐 Security & Permissions

### Row Level Security (RLS)
- Users can only access their own data
- Proper foreign key relationships
- Secure API endpoints with authentication
- Service role access for admin operations

### Data Privacy
- User data isolation
- Secure file uploads with validation
- Encrypted storage for sensitive data
- Audit trails for data access

## 🚀 Deployment & Migration

### Database Migrations
1. **001_initial_schema.sql** - Base schema
2. **002_add_user_trigger.sql** - User creation trigger
3. **003_ensure_user_trigger.sql** - Trigger verification
4. **004_ad_recommendations_system.sql** - New recommendation system

### Environment Setup
- Supabase project with pgvector extension
- OpenAI API key for AI analysis
- Storage bucket for ad media
- Proper RLS policies

## 📊 Performance Considerations

### Database Optimization
- Indexes on frequently queried columns
- Vector indexes for semantic search
- Efficient foreign key relationships
- Proper data partitioning

### Caching Strategy
- Session state caching
- Recommendation caching
- Vector embedding caching
- API response caching

## 🔮 Future Enhancements

### Planned Features
1. **A/B Testing Framework**: Automated testing of variations
2. **Advanced Analytics**: Detailed performance insights
3. **Multi-Platform Support**: Instagram, Google Ads integration
4. **Collaborative Features**: Team-based optimization
5. **Advanced AI Models**: Fine-tuned models for specific industries

### Technical Improvements
1. **Real-time Updates**: WebSocket integration
2. **Offline Support**: Progressive Web App features
3. **Mobile Optimization**: Native mobile app
4. **API Rate Limiting**: Advanced rate limiting
5. **Monitoring & Analytics**: Comprehensive logging

## 📝 Usage Guide

### For Users
1. **Create Session**: Configure creative ad settings
2. **Get Recommendations**: Receive AI-generated variations
3. **Select Variations**: Choose which to test
4. **Track Performance**: Report results and get insights
5. **Optimize Continuously**: Use learnings for future campaigns

### For Developers
1. **Database Setup**: Run migrations in order
2. **Environment Configuration**: Set up API keys and URLs
3. **Component Integration**: Use provided React components
4. **API Integration**: Follow RESTful patterns
5. **Testing**: Comprehensive test coverage

---

This architecture provides a robust foundation for AI-powered ad optimization with continuous learning capabilities and scalable design patterns. 