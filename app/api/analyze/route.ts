import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import OpenAI from 'openai'
import { ChatMessage, AdCreative, AdRecommendation } from '@/lib/types'

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
})

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

// Helper function to extract field values from text
function extractField(text: string, fieldName: string): string {
  const regex = new RegExp(`${fieldName}:\\s*(.+?)(?=\\n|$)`, 'i')
  const match = text.match(regex)
  return match ? match[1].trim() : ''
}

export async function POST(request: NextRequest) {
  try {
    const { companyDescription, adCreative, conversation, phase = 'initial' } = await request.json()

    if (!companyDescription || !adCreative) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    // Get current user
    const authHeader = request.headers.get('authorization')
    if (!authHeader) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const token = authHeader.replace('Bearer ', '')
    const { data: { user }, error: userError } = await supabase.auth.getUser(token)
    
    if (userError || !user) {
      return NextResponse.json(
        { error: 'Invalid token' },
        { status: 401 }
      )
    }

    let analysis = ''
    let recommendations: any[] = []
    let score = 0
    let finalAnalysis = ''
    let finalRecommendations: any[] = []
    let finalScore = 0

    if (phase === 'initial') {
      // Phase 1: Generate ad variations based on initial creative
      const prompt = `You are Zuck AI, an expert Facebook Ads optimization assistant. 

COMPANY DESCRIPTION:
${companyDescription}

ORIGINAL AD CREATIVE:
- Headline: ${adCreative.headline}
- Primary Text: ${adCreative.primary_text}
- Call to Action: ${adCreative.call_to_action}
- Media URL: ${adCreative.media_url || 'None'}
- Objective: ${adCreative.objective}
- Budget: ${adCreative.budget_amount || 'Not specified'}
- Targeting: ${adCreative.age_min}-${adCreative.age_max} years, ${adCreative.gender}, ${adCreative.detailed_targeting || 'No detailed targeting'}

TASK: Generate 2-3 optimized ad variations that improve upon the original creative. Focus ONLY on the submitted ad creative - do not suggest completely different concepts.

For each variation, provide:
1. Headline (improved version)
2. Primary Text (enhanced copy)
3. Call to Action (optimized)
4. Targeting recommendations (specific improvements)
5. Budget recommendations (if applicable)
6. AI confidence score (0.0-1.0)

Format your response as follows:

=== ANALYSIS ===
Brief analysis of the original ad and key improvement areas

=== VARIATION 1 ===
Headline: [Improved headline]
Primary Text: [Enhanced primary text]
Call to Action: [Optimized CTA]
Targeting: [Specific targeting improvements]
Budget: [Budget optimization suggestions]
AI Score: [0.85]

=== VARIATION 2 ===
Headline: [Improved headline]
Primary Text: [Enhanced primary text]
Call to Action: [Optimized CTA]
Targeting: [Specific targeting improvements]
Budget: [Budget optimization suggestions]
AI Score: [0.82]

=== VARIATION 3 ===
Headline: [Improved headline]
Primary Text: [Enhanced primary text]
Call to Action: [Optimized CTA]
Targeting: [Specific targeting improvements]
Budget: [Budget optimization suggestions]
AI Score: [0.78]

Focus on practical, actionable improvements that can be tested immediately.`

      const completion = await openai.chat.completions.create({
        model: 'gpt-4o',
        messages: [{ role: 'user', content: prompt }],
        temperature: 0.7,
      })

      const response = completion.choices[0]?.message?.content
      if (!response) {
        throw new Error('No response from OpenAI')
      }

      // Parse the response to extract variations
      const variations: any[] = []
      const variationRegex = /=== VARIATION (\d+) ===\n([\s\S]*?)(?=== VARIATION \d+ ===|$)/g
      let match

      while ((match = variationRegex.exec(response)) !== null) {
        const variationText = match[2].trim()
        const variation = {
          id: `variation_${match[1]}`,
          headline: extractField(variationText, 'Headline'),
          primary_text: extractField(variationText, 'Primary Text'),
          call_to_action: extractField(variationText, 'Call to Action'),
          targeting: extractField(variationText, 'Targeting'),
          budget_recommendation: extractField(variationText, 'Budget'),
          ai_score: parseFloat(extractField(variationText, 'AI Score')) || 0.75,
          full_text: variationText
        }
        variations.push(variation)
      }

      // Extract analysis section (only the first occurrence)
      const analysisMatch = response.match(/=== ANALYSIS ===\n([\s\S]*?)(?=== VARIATION|$)/)
      const analysis = analysisMatch ? analysisMatch[1].trim() : 'Analysis of your ad creative'
      
      // Clean up the response to remove duplicate analysis sections
      const cleanResponse = response.replace(/=== ANALYSIS ===[\s\S]*?(?=== VARIATION|$)/g, (match, index) => {
        // Keep only the first occurrence
        return index === 0 ? match : ''
      }).replace(/\n\n+/g, '\n\n').trim()

      // Store the original ad in the ads table
      const { data: adData, error: adError } = await supabase
        .from('ads')
        .insert([
          {
            user_id: user.id,
            headline: adCreative.headline,
            primary_text: adCreative.primary_text,
            call_to_action: adCreative.call_to_action,
            media_url: adCreative.media_url,
          }
        ])
        .select()
        .single()

      if (adError) {
        console.error('Error creating ad:', adError)
        throw adError
      }

      // Store recommendations in ad_recommendations table
      let storedRecommendations: any[] = []
      if (variations.length > 0) {
        const recommendationData = variations.map(rec => ({
          ad_id: adData.id,
          headline: rec.headline,
          primary_text: rec.primary_text,
          call_to_action: rec.call_to_action,
          targeting: rec.targeting,
          budget_recommendation: rec.budget_recommendation,
          ai_score: rec.ai_score,
        }))

        const { data: storedRecs, error: recError } = await supabase
          .from('ad_recommendations')
          .insert(recommendationData)
          .select()

        if (recError) {
          console.error('Error storing recommendations:', recError)
        } else {
          storedRecommendations = storedRecs || []
        }
      }

      // Store AI analysis
      const { error: analysisError } = await supabase
        .from('ai_analyses')
        .insert([
          {
            ad_id: adData.id,
            analysis: analysis,
            recommendations: variations,
            score: variations.reduce((sum, v) => sum + v.ai_score, 0) / variations.length,
            analysis_type: 'initial'
          }
        ])

      if (analysisError) {
        console.error('Error storing analysis:', analysisError)
      }

      finalAnalysis = cleanResponse
      finalRecommendations = storedRecommendations.map((storedRec, index) => ({
        ...variations[index],
        id: storedRec.id, // Use the actual database UUID
        db_id: storedRec.id // Keep the UUID for reference
      }))
      finalScore = variations.reduce((sum, v) => sum + v.ai_score, 0) / variations.length

    } else if (phase === 'follow_up') {
      // Phase 2: Follow-up analysis based on selected recommendations and performance
      const prompt = `You are Zuck AI, analyzing a Facebook ad campaign.

COMPANY DESCRIPTION:
${companyDescription}

ORIGINAL AD CREATIVE:
- Headline: ${adCreative.headline}
- Primary Text: ${adCreative.primary_text}
- Call to Action: ${adCreative.call_to_action}

CONVERSATION HISTORY:
${conversation.map((msg: ChatMessage) => `${msg.role}: ${msg.content}`).join('\n')}

TASK: Provide follow-up analysis and recommendations based on the conversation. Focus on:
1. Performance insights
2. Optimization opportunities
3. Next steps for testing
4. Budget allocation recommendations

Provide a comprehensive analysis that builds on the conversation context.`

      const completion = await openai.chat.completions.create({
        model: 'gpt-4o',
        messages: [{ role: 'user', content: prompt }],
        temperature: 0.7,
      })

      analysis = completion.choices[0]?.message?.content || 'No analysis generated'

    } else if (phase === 'performance_review') {
      // Phase 3: Performance review based on actual results
      const prompt = `You are Zuck AI, reviewing Facebook ad performance data.

COMPANY DESCRIPTION:
${companyDescription}

AD CREATIVE:
- Headline: ${adCreative.headline}
- Primary Text: ${adCreative.primary_text}
- Call to Action: ${adCreative.call_to_action}

PERFORMANCE DATA: [This would come from ad_results table]

TASK: Analyze the performance data and provide:
1. Performance insights
2. Optimization recommendations
3. Future testing suggestions
4. Budget optimization advice

Provide actionable insights based on the performance metrics.`

      const completion = await openai.chat.completions.create({
        model: 'gpt-4o',
        messages: [{ role: 'user', content: prompt }],
        temperature: 0.7,
      })

      analysis = completion.choices[0]?.message?.content || 'No analysis generated'
    }

    return NextResponse.json({
      analysis: phase === 'initial' ? finalAnalysis : analysis,
      recommendations: phase === 'initial' ? finalRecommendations : undefined,
      score: phase === 'initial' ? finalScore : undefined,
    })

  } catch (error: any) {
    console.error('Analysis error:', error)
    return NextResponse.json(
      { error: 'Failed to analyze ad' },
      { status: 500 }
    )
  }
} 