import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase-server'
import openai from '@/lib/openai'

export async function POST(request: NextRequest) {
  try {
    const supabase = createClient()
    
    // Get the current user
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { companyDescription, adCreative, conversation } = await request.json()

    // Validate required fields
    if (!adCreative || !conversation) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    // Phase 1: Initial Creative Analysis
    const systemPrompt = `You are Zuck AI, an expert Facebook advertising consultant. You specialize in analyzing ad creatives and providing actionable recommendations for optimization.

Your role is to analyze the submitted ad creative and generate 2-3 improved variations with detailed targeting recommendations. Focus ONLY on the submitted ad creative - do not ask for additional information.

For each ad variation, provide:
1. **Headline**: An improved, compelling headline
2. **Primary Text**: Enhanced ad copy that's engaging and conversion-focused
3. **Call to Action**: Appropriate CTA button text
4. **Targeting Recommendations**: Specific audience targeting suggestions based on the ad objective
5. **Budget Recommendations**: Suggested daily budget range
6. **Optimization Tips**: 2-3 specific tips for improving performance

Keep your responses focused, actionable, and professional.`

    const userPrompt = `Please analyze this Facebook ad creative and provide 2-3 improved variations:

**Company Description**: ${companyDescription}

**Ad Creative**:
- Headline: ${adCreative.headline}
- Primary Text: ${adCreative.primary_text}
- Call to Action: ${adCreative.call_to_action}
- Media: ${adCreative.media_url ? 'Image/Video uploaded' : 'No media'}
- Objective: ${adCreative.objective}
- Budget: ${adCreative.budget_amount}
- Age Range: ${adCreative.age_min}-${adCreative.age_max}
- Gender: ${adCreative.gender}
- Detailed Targeting: ${adCreative.detailed_targeting}
${adCreative.destination.length > 0 ? `- Destination: ${adCreative.destination.join(', ')}` : ''}
${adCreative.app_install_type.length > 0 ? `- App Install Type: ${adCreative.app_install_type.join(', ')}` : ''}

**Conversation History**: ${conversation.map((msg: any) => `${msg.role}: ${msg.content}`).join('\n')}

Please provide 2-3 improved ad variations with detailed targeting and optimization recommendations.`

    const completion = await openai.chat.completions.create({
      model: 'gpt-4o',
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt }
      ],
      max_tokens: 2000,
      temperature: 0.7,
    })

    const analysis = completion.choices[0]?.message?.content || 'No analysis generated'

    return NextResponse.json({ analysis })

  } catch (error) {
    console.error('Analysis error:', error)
    return NextResponse.json(
      { error: 'Failed to analyze ad creative' },
      { status: 500 }
    )
  }
} 