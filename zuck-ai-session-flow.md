# Zuck AI Session Flow and Prompt Structure

## Overview

Zuck AI is designed to provide focused, single-ad optimization sessions with a structured flow that ensures consistent, relevant analysis throughout the ad lifecycle.

## Session Flow Architecture

### 1. Initial Creative Phase

**Purpose:** User submits ad creative details for AI analysis and variation generation.

**User Actions:**
- Fill out creative ad section with complete ad details
- Submit for AI analysis
- Receive 2-5 improved ad variations

**AI Behavior:**
- Analyzes provided ad creative
- Generates 2-3 improved variations
- Each variation includes: headline, primary text, call to action, media suggestion, campaign objective, budget, age range, gender, and detailed targeting
- **Strict focus on submitted ad only**

**UI State:**
- "Creative Ad" button available for editing
- Chat disabled until creative ad is configured
- Follow-up phase not yet accessible

### 2. Follow-Up Phase

**Purpose:** User provides performance metrics for the specific ad, enabling data-driven optimization.

**User Actions:**
- Submit performance metrics through popup form
- Provide additional context or questions
- Receive performance-based recommendations

**Performance Metrics Collected:**
- Impressions
- Clicks
- Spend
- Conversions
- Conversion Rate
- CTR (Click Through Rate)
- CPC (Cost Per Click)
- CPM (Cost Per Mille)

**Data Storage:**
```sql
CREATE TABLE ad_results (
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
```

**AI Behavior:**
- Analyzes performance data for the specific ad
- Provides data-driven recommendations
- Asks strategic follow-up questions
- **Maintains focus on submitted ad only**

**UI State:**
- "Follow Up" button replaces "Creative Ad" button
- Performance metrics form available
- Chat enabled for questions and insights

### 3. Message Phase

**Purpose:** Ongoing conversation with full context of ad creative and performance data.

**User Actions:**
- Ask questions about the ad
- Request specific optimizations
- Seek insights and recommendations

**AI Behavior:**
- Combines context from initial creative and follow-up metrics
- Maintains memory across all session inputs
- Provides insights based on complete ad lifecycle
- **Strictly focused on the current ad session**

**UI State:**
- Full chat functionality available
- "Follow Up" button for additional metrics
- Complete session context maintained

## Prompt Structure

### Initial Ad Creation Prompt

**System Prompt Template:**
```
You are Zuck AI, an expert in Facebook advertising. The user will provide details about their initial ad creative. Your task is to analyze it and generate 2 to 5 improved ad variations. Each variation must include: headline, primary text, call to action, media suggestion, campaign objective, budget, age range, gender, and detailed targeting.

You must follow these strict rules:
- Do not mention or analyze any other ads.
- Do not answer questions unrelated to this ad creative.
- Do not provide general Facebook advertising advice.
- Focus solely on the provided ad and any additional user context.
- If additional context is given, use it only to inform your analysis of this specific ad.
- Generate exactly 2-5 variations, no more, no less.
- Each variation should be distinctly different while maintaining the core message.
- Provide specific, actionable recommendations for each variation.
```

**Input Combination:**
- Creative ad form data (headline, description, media, targeting, etc.)
- Additional context text field
- Combined into single prompt for AI analysis

### Follow-Up Prompt

**System Prompt Template:**
```
You are Zuck AI. The user will provide performance metrics and feedback on a single ad. Your task is to offer precise, relevant recommendations and insights strictly related to this one ad. Do not discuss any other ads or topics. Stay focused on the provided ad and the metrics shared by the user.

Strict guidelines:
- Do not shift focus to other campaigns or hypothetical ads.
- Do not answer questions unrelated to this ad.
- Use only the provided performance data and user context to give insights.
- Provide specific, actionable recommendations based on the metrics.
- Ask strategic follow-up questions to gather more insights.
- Maintain context of the original ad creative throughout the analysis.
```

**Input Combination:**
- Performance metrics data
- Additional context text field
- Original ad creative context
- Combined for comprehensive analysis

### Message Phase Prompt

**System Prompt Template:**
```
You are Zuck AI, maintaining full context of a specific Facebook ad session. You have access to:
1. The original ad creative details
2. Performance metrics and analysis
3. Previous conversation context

Your role is to provide focused insights and recommendations for this specific ad only. You must:
- Reference the original ad creative when providing insights
- Use performance data to inform recommendations
- Maintain conversation continuity
- Ask clarifying questions when needed
- Provide specific, actionable advice
- Never discuss other ads or campaigns
- Stay within the context of this single ad session
```

**Input Combination:**
- User's current question/request
- Complete session history (creative + metrics + conversation)
- Additional context text field
- Full context maintained across all interactions

## Implementation Phases

### Phase 1: Initial Creative Phase ✅ (Current)

**Status:** Implemented
**Components:**
- Creative ad form with all required fields
- AI analysis and variation generation
- Session state management
- Basic prompt structure

**Next Steps:**
- Refine initial prompt template
- Implement variation generation logic
- Add validation for required fields

### Phase 2: Follow-Up Phase (Next)

**Status:** Planned
**Components to Implement:**
- Performance metrics form popup
- Data storage in ad_results table
- Follow-up prompt integration
- Metrics analysis and recommendations

**Implementation Tasks:**
1. Create performance metrics form
2. Add ad_results table integration
3. Implement follow-up prompt logic
4. Add metrics validation
5. Create performance analysis UI

### Phase 3: Message Phase (Future)

**Status:** Planned
**Components to Implement:**
- Enhanced conversation context
- Full session memory
- Advanced prompt engineering
- Context-aware responses

**Implementation Tasks:**
1. Enhance session context management
2. Implement full conversation history
3. Add context-aware prompt generation
4. Create advanced response logic
5. Add session persistence

## Technical Requirements

### Database Schema
- `analysis_sessions` table for session management
- `ad_results` table for performance metrics
- Proper relationships and constraints

### State Management
- Session phase tracking
- Creative ad configuration state
- Performance metrics state
- Conversation history

### UI Components
- Creative ad form modal
- Performance metrics form
- Chat interface with context
- Session state indicators

### API Integration
- OpenAI GPT-4 integration
- Prompt engineering
- Response parsing
- Context management

## Success Criteria

### Phase 1 Success Metrics
- [ ] User can successfully submit creative ad details
- [ ] AI generates 2-5 relevant variations
- [ ] Session state properly managed
- [ ] No off-topic responses from AI

### Phase 2 Success Metrics
- [ ] Performance metrics properly collected and stored
- [ ] AI provides data-driven recommendations
- [ ] Follow-up questions are relevant and strategic
- [ ] Context maintained between creative and metrics

### Phase 3 Success Metrics
- [ ] Full conversation context maintained
- [ ] AI responses reference complete ad lifecycle
- [ ] No context loss across session phases
- [ ] Seamless user experience throughout

## Next Steps

1. **Refine Phase 1** - Optimize initial creative phase prompts and validation
2. **Design Phase 2** - Create performance metrics form and data flow
3. **Plan Phase 3** - Design enhanced conversation context system
4. **Test and Iterate** - Validate each phase before moving to the next

This structured approach ensures a focused, effective AI optimization experience for Facebook advertisers. 