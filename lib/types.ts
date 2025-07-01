// Zuck AI TypeScript Interfaces

export interface User {
  id: string
  email: string
  name?: string
  created_at: string
  updated_at: string
}

export interface AdCreative {
  headline: string
  primary_text: string
  call_to_action: string
  media_url?: string
  objective: string
  budget_amount?: string
  age_min: string
  age_max: string
  gender: string
  detailed_targeting?: string
  destination?: string[]
  app_install_type?: string[]
}

export interface Ad {
  id: string
  user_id: string
  headline: string
  primary_text: string
  call_to_action?: string
  media_url?: string
  created_at: string
}

export interface AdRecommendation {
  id: string
  ad_id: string
  headline?: string
  primary_text?: string
  call_to_action?: string
  targeting?: any
  budget_recommendation?: string
  ai_score?: number
  created_at: string
}

export interface SelectedRecommendation {
  id: string
  user_id: string
  recommendation_id: string
  status: 'draft' | 'active' | 'completed' | 'archived'
  created_at: string
  updated_at: string
}

export interface AdResult {
  id: string
  ad_id: string
  impressions?: number
  clicks?: number
  spend?: number
  conversions?: number
  conversion_rate?: number
  ctr?: number
  cpc?: number
  cpm?: number
  created_at: string
}

export interface AIAnalysis {
  id: string
  ad_id: string
  recommendation_id?: string
  analysis: string
  recommendations?: any
  score?: number
  embedding?: number[]
  analysis_type: 'initial' | 'follow_up' | 'performance_review'
  created_at: string
}

export interface AnalysisSession {
  id: string
  user_id: string
  title: string
  company_description: string
  ad_creative?: AdCreative
  messages: ChatMessage[]
  created_at: string
  updated_at: string
}

export interface ChatMessage {
  role: 'user' | 'assistant'
  content: string
  recommendations?: any[]
}

export interface FacebookAd {
  id: string
  ad_id: string
  objective: string
  budget_amount?: number
  age_min: number
  age_max: number
  gender: 'all' | 'men' | 'women'
  detailed_targeting?: any
  destination_url?: string
  created_at: string
}

export interface Plan {
  id: string
  name: string
  price_id: string
  price: number
  features?: any
  created_at: string
}

export interface Subscription {
  id: string
  user_id: string
  plan_id: string
  stripe_subscription_id: string
  status: 'active' | 'canceled' | 'past_due' | 'unpaid'
  current_period_start?: string
  current_period_end?: string
  created_at: string
  updated_at: string
}

// API Request/Response Types
export interface AnalyzeRequest {
  companyDescription: string
  adCreative: AdCreative
  conversation: ChatMessage[]
  phase?: 'initial' | 'follow_up' | 'performance_review'
}

export interface AnalyzeResponse {
  analysis: string
  recommendations?: AdRecommendation[]
  score?: number
}

// UI State Types
export interface SessionState {
  currentSession: AnalysisSession | null
  sessions: AnalysisSession[]
  loading: boolean
  sendingMessage: boolean
  creativeAdConfigured: boolean
  firstMessageSent: boolean
}

export interface AdCreativeState {
  headline: string
  primary_text: string
  call_to_action: string
  media_url: string
  objective: string
  budget_amount: string
  age_min: string
  age_max: string
  gender: string
  detailed_targeting: string
  destination: string[]
  app_install_type: string[]
} 