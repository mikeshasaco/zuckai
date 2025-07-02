'use client'

import { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import { Brain, Send, Plus, MessageSquare, LogOut, Upload, X, Paperclip } from 'lucide-react'
import Link from 'next/link'
import toast from 'react-hot-toast'
import { AdCreativeState, AnalysisSession, ChatMessage, AdRecommendation } from '@/lib/types'

interface Session {
  id: string
  title: string
  created_at: string
  company_description: string
  ad_creative: {
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
}

export default function SessionsPage() {
  const [sessions, setSessions] = useState<AnalysisSession[]>([])
  const [currentSession, setCurrentSession] = useState<AnalysisSession | null>(null)
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [newMessage, setNewMessage] = useState('')
  const [loading, setLoading] = useState(false)
  const [sendingMessage, setSendingMessage] = useState(false)
  const [creativeAdConfigured, setCreativeAdConfigured] = useState(false)
  const [firstMessageSent, setFirstMessageSent] = useState(false)
  const [showCreativeModal, setShowCreativeModal] = useState(false)
  const [recommendations, setRecommendations] = useState<AdRecommendation[]>([])
  const [selectedRecommendations, setSelectedRecommendations] = useState<string[]>([])
  const [currentSessionSelections, setCurrentSessionSelections] = useState<string[]>([])
  const [sessionPhase, setSessionPhase] = useState<'initial' | 'follow_up' | 'performance_review'>('initial')
  const [selectedRecommendationData, setSelectedRecommendationData] = useState<any[]>([])
  const [savedRecommendations, setSavedRecommendations] = useState<any[]>([])
  const [adResults, setAdResults] = useState<{[key: string]: {
    impressions: string
    clicks: string
    spend: string
    conversions: string
    conversion_rate: string
    ctr: string
    cpc: string
    cpm: string
  }}>({})

  const [adCreative, setAdCreative] = useState<AdCreativeState>({
    headline: '',
    primary_text: '',
    call_to_action: '',
    media_url: '',
    objective: 'traffic',
    budget_amount: '',
    age_min: '18',
    age_max: '65',
    gender: 'all',
    detailed_targeting: '',
    destination: [],
    app_install_type: []
  })

  const router = useRouter()

  // Load sessions on mount and check for session parameter
  useEffect(() => {
    loadSessions()
    
    // Check for session parameter in URL
    const urlParams = new URLSearchParams(window.location.search)
    const sessionId = urlParams.get('session')
    if (sessionId) {
      // Load the specific session after sessions are loaded
      setTimeout(() => {
        loadSession(sessionId)
      }, 100)
    }
  }, [])

  // Check authentication on mount
  useEffect(() => {
    const checkAuth = async () => {
      try {
        const { data: { session }, error } = await supabase.auth.getSession()
        
        if (error) {
          console.error('Session check error:', error)
          router.push('/auth')
          return
        }
        
        if (!session?.user) {
          console.log('No authenticated user, redirecting to auth')
          router.push('/auth')
          return
        }
        
        console.log('User authenticated:', session.user.id)
      } catch (error) {
        console.error('Error checking authentication:', error)
        router.push('/auth')
      }
    }

    checkAuth()
  }, [router])

  // Utility function to ensure user record exists
  const ensureUserRecord = async (user: any) => {
    try {
      console.log('Ensuring user record exists for:', user.id)
      const { data: existingUser, error: userCheckError } = await supabase
        .from('users')
        .select('id')
        .eq('id', user.id)
        .single()

      if (userCheckError && userCheckError.code === 'PGRST116') {
        // User doesn't exist in our table, create them
        console.log('Creating user record for existing auth user:', user.id)
        const { error: createUserError } = await supabase
          .from('users')
          .insert([
            {
              id: user.id,
              email: user.email || '',
              name: user.user_metadata?.name || user.email?.split('@')[0] || '',
            },
          ])

        if (createUserError) {
          console.error('Error creating user record:', createUserError)
          return false
        } else {
          console.log('User record created successfully')
          return true
        }
      } else if (userCheckError) {
        console.error('Error checking user:', userCheckError)
        return false
      } else {
        console.log('User record already exists:', existingUser?.id)
        return true
      }
    } catch (error: any) {
      console.error('Error ensuring user record:', error)
      return false
    }
  }

  const loadSessions = async () => {
    try {
      setLoading(true)
      const { data: { user }, error: userError } = await supabase.auth.getUser()
      
      if (userError || !user) {
        console.error('User error:', userError)
        router.push('/auth')
        return
      }

      // Ensure user record exists before loading sessions
      const userRecordExists = await ensureUserRecord(user)
      if (!userRecordExists) {
        console.error('Failed to ensure user record exists')
        toast.error('Authentication error. Please sign out and sign in again.')
        await supabase.auth.signOut()
        router.push('/auth')
        return
      }

      const { data, error } = await supabase
        .from('analysis_sessions')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })

      if (error) {
        console.error('Error loading sessions:', error)
        throw error
      }

      setSessions(data || [])
      console.log('Sessions loaded:', data?.length || 0)
    } catch (error: any) {
      console.error('Error loading sessions:', error)
      toast.error('Failed to load sessions')
    } finally {
      setLoading(false)
    }
  }

  const loadSession = async (sessionId: string) => {
    try {
      // Try to load by session_id first (for URL parameters), then by id (for sidebar clicks)
      let { data: session, error } = await supabase
        .from('analysis_sessions')
        .select('*')
        .eq('session_id', sessionId)
        .single()

      if (error) {
        // If not found by session_id, try by id
        const { data: sessionById, error: errorById } = await supabase
          .from('analysis_sessions')
          .select('*')
          .eq('id', sessionId)
          .single()
        
        if (errorById) throw errorById
        session = sessionById
      }

      // Update the URL to reflect the current session using session_id
      const newUrl = `/dashboard/sessions?session=${session.session_id}`
      window.history.pushState({}, '', newUrl)

      setCurrentSession(session)
      setMessages(session.messages || [])
      setAdCreative({
        headline: session.ad_creative.headline || '',
        primary_text: session.ad_creative.primary_text || '',
        call_to_action: session.ad_creative.call_to_action || '',
        media_url: session.ad_creative.media_url || '',
        objective: session.ad_creative.objective || 'TRAFFIC',
        budget_amount: session.ad_creative.budget_amount || '',
        age_min: session.ad_creative.age_min || '18',
        age_max: session.ad_creative.age_max || '65',
        gender: session.ad_creative.gender || 'all',
        detailed_targeting: session.ad_creative.detailed_targeting || '',
        destination: (session.ad_creative as any).destination || [],
        app_install_type: (session.ad_creative as any).app_install_type || []
      })
      if (session.ad_creative.media_url) {
        setAdCreative(prev => ({ ...prev, media_url: session.ad_creative.media_url }))
      }

      // Check if creative ad has been configured (has at least headline or primary_text)
      const hasCreativeAd = session.ad_creative.headline || session.ad_creative.primary_text || session.ad_creative.media_url
      setCreativeAdConfigured(!!hasCreativeAd)

      // Check if first message has been sent (more than 0 messages)
      setFirstMessageSent((session.messages || []).length > 0)
      
      // Clear current session selections and load recommendations
      setCurrentSessionSelections([])
      setSelectedRecommendationData([])
      
      // Extract recommendations from messages and set selected ones
      const allRecommendations = session.messages
        ?.filter((msg: any) => msg.recommendations)
        .flatMap((msg: any) => msg.recommendations || []) || []
      
      setRecommendations(allRecommendations)
      
      // Find selected recommendations from the session
      const selectedIds = allRecommendations
        .filter((rec: any) => rec.is_selected)
        .map((rec: any) => rec.id || rec.db_id)
      
      setCurrentSessionSelections(selectedIds)
      setSelectedRecommendationData(allRecommendations.filter((rec: any) => rec.is_selected))
    } catch (error) {
      console.error('Error loading session:', error)
      toast.error('Failed to load session')
    }
  }

  const handleFileUpload = async (file: File) => {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      const fileExt = file.name.split('.').pop()
      const fileName = `${user.id}/${Date.now()}.${fileExt}`

      const { error: uploadError } = await supabase.storage
        .from('ad-media')
        .upload(fileName, file)

      if (uploadError) {
        console.error('Upload error:', uploadError)
        toast.error('Failed to upload file')
        return
      }

      const { data: { publicUrl } } = supabase.storage
        .from('ad-media')
        .getPublicUrl(fileName)

      setAdCreative(prev => ({ ...prev, media_url: publicUrl }))
      toast.success('File uploaded successfully!')
    } catch (error) {
      console.error('Upload error:', error)
      toast.error('Failed to upload file')
    }
  }

  const removeUploadedFile = () => {
    setAdCreative(prev => ({ ...prev, media_url: '' }))
  }

  const handleCreativeAdSave = () => {
    if (!adCreative.headline || !adCreative.primary_text || !adCreative.call_to_action) {
      toast.error('Please fill in all required fields')
      return
    }
    setCreativeAdConfigured(true)
    setShowCreativeModal(false)
    toast.success('Creative ad settings saved!')
  }

  const handleAdResultsSave = async () => {
    try {
      if (!currentSession?.id) {
        toast.error('No active session found')
        return
      }

      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        toast.error('User not authenticated')
        return
      }

      // Get the ad ID from the current session
      const { data: adData, error: adError } = await supabase
        .from('ads')
        .select('id')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(1)
        .single()

      if (adError || !adData) {
        toast.error('Could not find ad data')
        return
      }

      // Save ad results for each selected recommendation
      const resultsToSave = Object.entries(adResults).map(([recommendationId, results]) => ({
        ad_id: adData.id,
        recommendation_id: recommendationId,
        impressions: results.impressions ? parseInt(results.impressions) : null,
        clicks: results.clicks ? parseInt(results.clicks) : null,
        spend: results.spend ? parseFloat(results.spend) : null,
        conversions: results.conversions ? parseInt(results.conversions) : null,
        conversion_rate: results.conversion_rate ? parseFloat(results.conversion_rate) : null,
        ctr: results.ctr ? parseFloat(results.ctr) : null,
        cpc: results.cpc ? parseFloat(results.cpc) : null,
        cpm: results.cpm ? parseFloat(results.cpm) : null,
      }))

      if (resultsToSave.length > 0) {
        const { error: resultsError } = await supabase
          .from('ad_results')
          .insert(resultsToSave)

        if (resultsError) {
          console.error('Error saving ad results:', resultsError)
          toast.error('Failed to save ad results')
          return
        }
      }

      toast.success('Ad results saved successfully!')
      setShowCreativeModal(false)
      
      // Clear the form
      setAdResults({})

    } catch (error) {
      console.error('Error saving ad results:', error)
      toast.error('Failed to save ad results')
    }
  }

  const fetchSavedRecommendations = async () => {
    try {
      if (!currentSession?.id) {
        console.error('No active session found')
        return
      }

      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        console.error('User not authenticated')
        return
      }

      // Get the ad ID from the current session
      const { data: adData, error: adError } = await supabase
        .from('ads')
        .select('id')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(1)
        .single()

      if (adError || !adData) {
        console.error('Could not find ad data')
        return
      }

      // Fetch recommendations that are currently selected in this session
      const { data: recommendationsData, error: recommendationsError } = await supabase
        .from('selected_recommendations')
        .select(`
          *,
          ad_recommendations (
            id,
            headline,
            primary_text,
            call_to_action,
            targeting,
            budget_recommendation,
            ai_score,
            created_at
          )
        `)
        .eq('user_id', user.id)
        .in('recommendation_id', currentSessionSelections)
        .order('created_at', { ascending: false })

      if (recommendationsError) {
        console.error('Error fetching saved recommendations:', recommendationsError)
        return
      }

      setSavedRecommendations(recommendationsData || [])
      console.log('Current session saved recommendations:', recommendationsData)

    } catch (error) {
      console.error('Error fetching saved recommendations:', error)
    }
  }

  const sendMessage = async () => {
    if (!newMessage.trim()) return

    // Validate ad creative is configured
    if (!creativeAdConfigured) {
      toast.error('Please configure your creative ad settings first')
      return
    }

    // Ensure ad_creative has all required fields
    const validatedAdCreative = {
      headline: adCreative.headline || '',
      primary_text: adCreative.primary_text || '',
      call_to_action: adCreative.call_to_action || '',
      media_url: adCreative.media_url || '',
      objective: adCreative.objective || 'traffic',
      budget_amount: adCreative.budget_amount || '',
      age_min: adCreative.age_min || '18',
      age_max: adCreative.age_max || '65',
      gender: adCreative.gender || 'all',
      detailed_targeting: adCreative.detailed_targeting || '',
      destination: adCreative.destination || [],
      app_install_type: adCreative.app_install_type || []
    }

    setSendingMessage(true)
    const userMessage = { role: 'user' as const, content: newMessage }
    const updatedMessages = [...messages, userMessage]
    setMessages(updatedMessages)
    setNewMessage('')

    try {
      // Get current user
      const { data: { user }, error: userError } = await supabase.auth.getUser()
      if (userError || !user) {
        console.error('User error:', userError)
        router.push('/auth')
        return
      }

      // Ensure user record exists in our users table
      const userRecordExists = await ensureUserRecord(user)
      if (!userRecordExists) {
        console.error('User record check failed')
        throw new Error('User record check failed')
      }

      // If no current session, create one
      let sessionId = currentSession?.id
      if (!sessionId) {
        console.log('Creating new session with ad creative:', validatedAdCreative)

        const { data, error } = await supabase
          .from('analysis_sessions')
          .insert([
            {
              user_id: user.id,
              title: `Analysis ${new Date().toLocaleDateString()}`,
              company_description: 'Chat-based analysis',
              ad_creative: validatedAdCreative,
              messages: updatedMessages
            }
          ])
          .select()
          .single()

        if (error) {
          console.error('Session creation error:', error)
          throw error
        }
        
        sessionId = data.id
        setCurrentSession(data)
        setSessions([data, ...sessions])
        console.log('New session created:', sessionId)
      } else {
        // Save message to existing session
        console.log('Updating existing session:', sessionId)
        const { error } = await supabase
          .from('analysis_sessions')
          .update({ messages: updatedMessages })
          .eq('id', sessionId)

        if (error) {
          console.error('Session update error:', error)
          throw error
        }
      }

      // Get AI response
      console.log('Sending request to AI with conversation length:', updatedMessages.length)
      const response = await fetch('/api/analyze', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${(await supabase.auth.getSession()).data.session?.access_token}`
        },
        body: JSON.stringify({
          companyDescription: currentSession?.company_description || 'Chat-based analysis',
          adCreative: validatedAdCreative,
          conversation: updatedMessages,
          phase: sessionPhase
        })
      })

      if (!response.ok) {
        const errorText = await response.text()
        console.error('AI response error:', response.status, errorText)
        throw new Error(`Failed to get AI response: ${response.status} ${errorText}`)
      }

      const aiResponse = await response.json()
      
      // Create a single assistant message that includes everything
      let finalMessages: ChatMessage[];
      
      if (sessionPhase === 'initial' && aiResponse.recommendations) {
        const recommendationsMessage = { 
          role: 'assistant' as const, 
          content: aiResponse.analysis + '\n\nHere are your AI-generated ad variations. Please select the ones you\'d like to test:',
          recommendations: aiResponse.recommendations
        }
        finalMessages = [...updatedMessages, recommendationsMessage];
        setRecommendations(aiResponse.recommendations)
        setSessionPhase('follow_up')
        console.log('Recommendations received:', aiResponse.recommendations)
      } else {
        const assistantMessage = { role: 'assistant' as const, content: aiResponse.analysis }
        finalMessages = [...updatedMessages, assistantMessage];
      }
      
      setMessages(finalMessages)

      // Save AI response to database
      console.log('Saving AI response to database')
      const { error: saveError } = await supabase
        .from('analysis_sessions')
        .update({ messages: finalMessages })
        .eq('id', sessionId)

      if (saveError) {
        console.error('Save AI response error:', saveError)
        throw saveError
      }

      // Mark that first message has been sent
      setFirstMessageSent(true)

      console.log('Message sent successfully')

    } catch (error: any) {
      console.error('Error sending message:', error)
      
      // Provide more specific error messages
      if (error.message?.includes('409')) {
        toast.error('Session conflict. Please refresh the page and try again.')
      } else if (error.message?.includes('Failed to get AI response')) {
        toast.error('AI service error. Please try again.')
      } else if (error.code === '23503') {
        toast.error('Authentication error. Please sign out and sign in again.')
        // Force sign out and redirect to auth
        await supabase.auth.signOut()
        router.push('/auth')
      } else {
        toast.error('Failed to send message. Please try again.')
      }
    } finally {
      setSendingMessage(false)
    }
  }

  const handleRecommendationSelection = async (selectedId: string) => {
    const isSelected = currentSessionSelections.includes(selectedId)
    let newSelectedIds: string[] = []
    
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        toast.error('User not authenticated')
        return
      }

      // Get the current ad ID
      const { data: adData, error: adError } = await supabase
        .from('ads')
        .select('id')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(1)
        .single()

      if (adError || !adData) {
        console.error('Could not find ad data')
        toast.error('Could not find ad data')
        return
      }

      if (isSelected) {
        newSelectedIds = currentSessionSelections.filter(id => id !== selectedId)
        // Remove from selected data
        setSelectedRecommendationData(prev => prev.filter(rec => rec.id !== selectedId))
        
        // Remove from selected_recommendations table using the actual UUID
        const { error: deleteError } = await supabase
          .from('selected_recommendations')
          .delete()
          .eq('user_id', user.id)
          .eq('recommendation_id', selectedId)
        
        if (deleteError) {
          console.error('Error removing selected recommendation:', deleteError)
        }
      } else {
        newSelectedIds = [...currentSessionSelections, selectedId]
        // Add to selected data - find the recommendation in messages
        const allRecommendations = messages
          .filter(msg => msg.recommendations)
          .flatMap(msg => msg.recommendations || [])
        const selectedRec = allRecommendations.find(rec => rec.id === selectedId || rec.db_id === selectedId)
        if (selectedRec) {
          setSelectedRecommendationData(prev => [...prev, selectedRec])
        }
        
        // Add to selected_recommendations table using the actual UUID
        const { error: insertError } = await supabase
          .from('selected_recommendations')
          .insert([
            {
              user_id: user.id,
              recommendation_id: selectedId,
              status: 'draft'
            }
          ])
        
        if (insertError) {
          console.error('Error saving selected recommendation:', insertError)
          toast.error('Failed to save selection')
          return
        }
      }
      
      setCurrentSessionSelections(newSelectedIds)
      console.log('Current session selected recommendations:', newSelectedIds)
      
    } catch (error) {
      console.error('Error handling recommendation selection:', error)
      toast.error('Failed to update selection')
    }
    
    // If this is the first selection, trigger AI response
    if (newSelectedIds.length === 1 && !isSelected) {
      const userMessage = { role: 'user' as const, content: `I've selected variation ${selectedId}. Are these the ads you like the most?` }
      const updatedMessages = [...messages, userMessage]
      setMessages(updatedMessages)
      setNewMessage('')
      
      try {
        // Get AI response about the selection
        const response = await fetch('/api/analyze', {
          method: 'POST',
          headers: { 
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${(await supabase.auth.getSession()).data.session?.access_token}`
          },
          body: JSON.stringify({
            companyDescription: currentSession?.company_description || 'Chat-based analysis',
            adCreative: adCreative,
            conversation: updatedMessages,
            phase: 'follow_up'
          })
        })

        if (!response.ok) {
          throw new Error(`Failed to get AI response: ${response.status}`)
        }

        const aiResponse = await response.json()
        const assistantMessage = { role: 'assistant' as const, content: aiResponse.analysis }

        const finalMessages = [...updatedMessages, assistantMessage]
        setMessages(finalMessages)

        // Save to database
        if (currentSession?.id) {
          const { error: saveError } = await supabase
            .from('analysis_sessions')
            .update({ messages: finalMessages })
            .eq('id', currentSession.id)

          if (saveError) {
            console.error('Save selection response error:', saveError)
          }
        }
      } catch (error) {
        console.error('Error getting selection response:', error)
        toast.error('Failed to get AI response about your selection')
      }
    }
  }

  const handleSignOut = async () => {
    try {
      setLoading(true)
      const { error } = await supabase.auth.signOut()
      if (error) throw error
      
      // Clear local state
      setSessions([])
      setCurrentSession(null)
      setMessages([])
      setAdCreative({
        headline: '',
        primary_text: '',
        call_to_action: '',
        media_url: '',
        objective: 'TRAFFIC',
        budget_amount: '',
        age_min: '18',
        age_max: '65',
        gender: 'all',
        detailed_targeting: '',
        destination: [] as string[],
        app_install_type: [] as string[]
      })
      setCreativeAdConfigured(false)
      setFirstMessageSent(false)
      
      toast.success('Signed out successfully')
      router.push('/auth')
    } catch (error) {
      console.error('Error signing out:', error)
      toast.error('Error signing out')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Left Sidebar - Sessions */}
      <div className="w-80 bg-white border-r border-gray-200 flex flex-col">
        <div className="p-4 border-b border-gray-200">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center">
              <Brain className="h-8 w-8 text-zuck-600" />
              <span className="ml-2 text-xl font-bold text-gray-900">Zuck AI</span>
            </div>
            <button
              onClick={handleSignOut}
              className="text-gray-600 hover:text-gray-900"
            >
              <LogOut className="h-4 w-4" />
            </button>
          </div>
          <Link
            href="/dashboard/new-chat"
            className="w-full flex items-center justify-center px-4 py-2 bg-zuck-600 text-white rounded-lg hover:bg-zuck-700"
          >
            <Plus className="h-4 w-4 mr-2" />
            New Chat
          </Link>
        </div>

        <div className="flex-1 overflow-y-auto">
          <div className="p-4">
            <h3 className="text-sm font-medium text-gray-700 mb-3">Chat Sessions</h3>
            {sessions.map((session) => (
              <div
                key={session.id}
                onClick={() => loadSession(session.session_id || session.id)}
                className={`p-3 rounded-lg cursor-pointer mb-2 transition-colors ${
                  currentSession?.id === session.id
                    ? 'bg-zuck-50 border border-zuck-200'
                    : 'hover:bg-gray-50'
                }`}
              >
                <div className="flex items-center">
                  <MessageSquare className="h-4 w-4 text-gray-400 mr-2" />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <p className="text-sm font-medium text-gray-900 truncate">
                        {session.title}
                      </p>
                      <span className="text-xs text-blue-600 font-mono bg-blue-50 px-2 py-1 rounded border border-blue-200" title={session.session_id || 'N/A'}>
                        #{session.session_id ? session.session_id.substring(0, 8) + '...' : 'N/A'}
                      </span>
                    </div>
                    <p className="text-xs text-gray-500">
                      {new Date(session.created_at).toLocaleDateString()}
                    </p>
                  </div>
                </div>
              </div>
            ))}
            {sessions.length === 0 && (
              <div className="text-center py-8">
                <MessageSquare className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <p className="text-sm text-gray-500 mb-4">
                  No chat sessions yet. Start a new chat to begin your conversation with Zuck AI!
                </p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Main Content - Chat Interface */}
      <div className="flex-1 flex flex-col relative">
        {/* Chat Messages - With padding for fixed input */}
        <div className="flex-1 overflow-y-auto p-4 pt-48 pb-24" aria-label="messages">
          <div className="max-w-4xl mx-auto space-y-4">
            {messages.length === 0 && (
              <div className="text-center py-12">
                <Brain className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  Welcome to Zuck AI!
                </h3>
                <p className="text-gray-600 mb-4">
                  I'm here to help you optimize your Facebook advertising strategy. Ask me anything about your ads, targeting, or campaign optimization.
                </p>
                <div className="text-sm text-gray-500">
                  💡 Try asking: 'How can I improve my ad performance?' or 'What targeting should I use?'
                </div>
              </div>
            )}
            
            {messages.map((message, index) => (
              <div
                key={index}
                className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-3xl px-4 py-2 rounded-lg ${
                    message.role === 'user'
                      ? 'bg-zuck-600 text-white'
                      : 'bg-gray-100 text-gray-900'
                  }`}
                >
                  <div className="prose prose-sm max-w-none">
                    {message.content.split('\n').map((line, lineIndex) => {
                      if (line.startsWith('=== ANALYSIS ===')) {
                        return (
                          <div key={lineIndex} className="mb-4">
                            <h3 className="text-lg font-semibold text-blue-600 mb-2 flex items-center">
                              <span className="mr-2">📊</span>
                              Analysis
                            </h3>
                          </div>
                        )
                      } else if (line.startsWith('=== VARIATION')) {
                        const variationNum = line.match(/VARIATION (\d+)/)?.[1]
                        return (
                          <div key={lineIndex} className="mb-4">
                            <h4 className="text-md font-semibold text-green-600 mb-2 flex items-center">
                              <span className="mr-2">🎯</span>
                              Variation {variationNum}
                            </h4>
                          </div>
                        )
                      } else if (line.includes('Headline:')) {
                        const headline = line.replace('Headline:', '').trim()
                        return (
                          <div key={lineIndex} className="mb-2">
                            <span className="text-xs font-medium text-gray-500 uppercase tracking-wide">Headline:</span>
                            <p className="text-sm font-semibold text-gray-900 mt-1">{headline}</p>
                          </div>
                        )
                      } else if (line.includes('Primary Text:')) {
                        const text = line.replace('Primary Text:', '').trim()
                        return (
                          <div key={lineIndex} className="mb-2">
                            <span className="text-xs font-medium text-gray-500 uppercase tracking-wide">Primary Text:</span>
                            <p className="text-sm text-gray-700 mt-1 leading-relaxed">{text}</p>
                          </div>
                        )
                      } else if (line.includes('Call to Action:')) {
                        const cta = line.replace('Call to Action:', '').trim()
                        return (
                          <div key={lineIndex} className="mb-2">
                            <span className="text-xs font-medium text-gray-500 uppercase tracking-wide">Call to Action:</span>
                            <p className="text-sm font-medium text-blue-600 mt-1">{cta}</p>
                          </div>
                        )
                      } else if (line.includes('Targeting:')) {
                        const targeting = line.replace('Targeting:', '').trim()
                        return (
                          <div key={lineIndex} className="mb-2">
                            <span className="text-xs font-medium text-gray-500 uppercase tracking-wide">Targeting:</span>
                            <p className="text-sm text-gray-700 mt-1">{targeting}</p>
                          </div>
                        )
                      } else if (line.includes('Budget:')) {
                        const budget = line.replace('Budget:', '').trim()
                        return (
                          <div key={lineIndex} className="mb-2">
                            <span className="text-xs font-medium text-gray-500 uppercase tracking-wide">Budget:</span>
                            <p className="text-sm font-medium text-green-600 mt-1">{budget}</p>
                          </div>
                        )
                      } else if (line.includes('AI Score:')) {
                        const score = line.replace('AI Score:', '').trim()
                        const scoreNum = parseFloat(score)
                        return (
                          <div key={lineIndex} className="mb-3">
                            <span className="text-xs font-medium text-gray-500 uppercase tracking-wide">AI Confidence:</span>
                            <div className="flex items-center mt-1">
                              <div className="w-16 bg-gray-200 rounded-full h-2 mr-2">
                                <div 
                                  className="bg-gradient-to-r from-green-400 to-green-600 h-2 rounded-full transition-all duration-300"
                                  style={{ width: `${scoreNum * 100}%` }}
                                ></div>
                              </div>
                              <span className="text-sm font-semibold text-green-600">{scoreNum * 100}%</span>
                            </div>
                          </div>
                        )
                      } else if (line.trim() && !line.startsWith('===')) {
                        return (
                          <p key={lineIndex} className="text-sm text-gray-700 leading-relaxed mb-2">
                            {line}
                          </p>
                        )
                      } else {
                        return null
                      }
                    })}
                  </div>
                  
                  {/* Show recommendations if this message has them */}
                  {message.recommendations && (
                    <div className="mt-4 space-y-3">
                      {message.recommendations.map((rec: any, recIndex: number) => (
                        <div
                          key={recIndex}
                          className={`border rounded-lg p-3 transition-all ${
                            selectedRecommendations.includes(rec.id || `variation_${recIndex + 1}`)
                              ? 'border-blue-500 bg-blue-50'
                              : 'border-gray-200 bg-white'
                          }`}
                        >
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-2">
                                <span className="text-xs font-medium text-gray-700">
                                  Variation {recIndex + 1}
                                </span>
                                {rec.ai_score && (
                                  <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded">
                                    {(rec.ai_score * 100).toFixed(0)}%
                                  </span>
                                )}
                                <input
                                  type="checkbox"
                                                                      checked={currentSessionSelections.includes(rec.id || rec.db_id || `variation_${recIndex + 1}`)}
                                  onChange={() => handleRecommendationSelection(rec.id || rec.db_id || `variation_${recIndex + 1}`)}
                                  className="h-3 w-3 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                                  aria-label="checkbox-ai"
                                />
                              </div>
                              
                              {rec.headline && (
                                <div className="mb-2">
                                  <span className="text-xs font-medium text-gray-500">Headline:</span>
                                  <p className="text-xs text-gray-900 font-medium">{rec.headline}</p>
                                </div>
                              )}
                              
                              {rec.primary_text && (
                                <div className="mb-2">
                                  <span className="text-xs font-medium text-gray-500">Text:</span>
                                  <p className="text-xs text-gray-900">{rec.primary_text}</p>
                                </div>
                              )}
                              
                              {rec.call_to_action && (
                                <div className="mb-2">
                                  <span className="text-xs font-medium text-gray-500">CTA:</span>
                                  <p className="text-xs text-gray-900">{rec.call_to_action}</p>
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            ))}
            
            {sendingMessage && (
              <div className="flex justify-start">
                <div className="bg-gray-100 text-gray-900 px-4 py-2 rounded-lg">
                  <div className="flex items-center">
                    <Brain className="h-4 w-4 mr-2 animate-spin" />
                    Zuck AI is thinking...
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Chat Input - Fixed Position */}
        <div className="fixed bottom-0 left-80 right-0 bg-white border-t border-gray-200 p-4 z-10">
          <div className="max-w-4xl mx-auto">
            <div className="flex items-center space-x-2">
              <div className="flex-1 relative">
                <input
                  type="text"
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
                  placeholder={creativeAdConfigured 
                    ? "Ask Zuck AI about your Facebook advertising strategy..." 
                    : "Configure your creative ad first to start chatting..."
                  }
                  aria-label="message-box"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-zuck-500 focus:border-transparent text-gray-900 placeholder-gray-500 disabled:bg-gray-100 disabled:cursor-not-allowed"
                  disabled={!creativeAdConfigured}
                />
              </div>
              
              {/* Show Creative Ad button if not configured OR if configured but first message not sent yet */}
              {(!creativeAdConfigured || (creativeAdConfigured && !firstMessageSent)) && (
                <button
                  onClick={() => setShowCreativeModal(true)}
                  aria-label="creative ad"
                  className="relative px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors text-sm font-medium overflow-hidden group"
                >
                  <div className="absolute inset-0 rounded-lg bg-gradient-to-r from-blue-400 via-blue-500 to-blue-600 opacity-0 group-hover:opacity-20 transition-opacity duration-300"></div>
                  <div className="absolute inset-0 rounded-lg">
                    <div className="absolute inset-0 rounded-lg border-2 border-transparent bg-gradient-to-r from-blue-400 via-blue-500 to-blue-600 bg-clip-border animate-pulse"></div>
                    <div className="absolute inset-0 rounded-lg border-2 border-transparent bg-gradient-to-r from-blue-400 via-blue-500 to-blue-600 bg-clip-border animate-spin" style={{ animationDuration: '3s' }}></div>
                  </div>
                  <span className="relative z-10">Creative Ad</span>
                </button>
              )}

              {/* Show Follow Up button if creative ad configured and first message sent */}
              {creativeAdConfigured && firstMessageSent && (
                <button
                  onClick={async () => {
                    await fetchSavedRecommendations()
                    setShowCreativeModal(true)
                  }}
                  aria-label="creative ad"
                  className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors text-sm font-medium"
                >
                  Follow Up
                </button>
              )}

              {/* Show Send button if creative ad configured */}
              {creativeAdConfigured && (
                <button
                  onClick={sendMessage}
                  disabled={!newMessage.trim() || sendingMessage}
                  aria-label="send message"
                  className="px-4 py-2 bg-zuck-500 text-white rounded-lg hover:bg-zuck-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  {sendingMessage ? (
                    <div className="flex items-center">
                      <Brain className="h-4 w-4 mr-2 animate-spin" />
                      Thinking...
                    </div>
                  ) : (
                    <Send className="h-4 w-4" />
                  )}
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Creative Ad Modal */}
        {showCreativeModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
              <div className="p-6">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-xl font-semibold text-gray-900">
                    {firstMessageSent ? 'Follow Up - Ad Results' : 'Creative Ad Settings'}
                  </h2>
                  <button
                    onClick={() => setShowCreativeModal(false)}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    <X className="h-6 w-6" />
                  </button>
                </div>

                {!firstMessageSent ? (
                  // Initial Creative Ad Form
                  <>
                    {/* Ad Creative Section */}
                    <div className="mb-6">
                      <h3 className="text-lg font-medium text-gray-900 mb-4">Ad Creative</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Ad Headline
                      </label>
                      <input
                        type="text"
                        value={adCreative.headline}
                        onChange={(e) => setAdCreative(prev => ({ ...prev, headline: e.target.value }))}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-zuck-500 focus:border-transparent text-gray-900 placeholder-gray-500"
                        placeholder="Enter your ad headline"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Ad Media
                      </label>
                      
                      {!adCreative.media_url ? (
                        <div className="space-y-2">
                          <div className="flex items-center space-x-2">
                            <input
                              ref={(input) => {
                                if (input) input.style.display = 'none'
                              }}
                              type="file"
                              accept="image/*,video/*"
                              onChange={(e) => {
                                const file = e.target.files?.[0]
                                if (file) handleFileUpload(file)
                              }}
                              className="hidden"
                            />
                            <button
                              type="button"
                              onClick={() => {
                                const fileInput = document.querySelector('input[type="file"]') as HTMLInputElement
                                if (fileInput) fileInput.click()
                              }}
                              className="flex items-center px-3 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed text-sm text-gray-700"
                            >
                              📎 Upload Media
                            </button>
                          </div>
                          <p className="text-xs text-gray-500">
                            Supported: JPG, PNG, GIF, WebP, MP4, MOV, AVI (max 10MB)
                          </p>
                        </div>
                      ) : (
                        <div className="flex items-center space-x-2">
                          <div className="flex-1">
                            {adCreative.media_url.match(/\.(jpg|jpeg|png|gif|webp)$/i) ? (
                              <img
                                src={adCreative.media_url}
                                alt="Uploaded ad media"
                                className="h-12 w-12 object-cover rounded border border-gray-200"
                              />
                            ) : (
                              <video
                                src={adCreative.media_url}
                                className="h-12 w-12 object-cover rounded border border-gray-200"
                                muted
                              />
                            )}
                          </div>
                          <button
                            onClick={removeUploadedFile}
                            className="flex items-center px-2 py-1 text-red-600 hover:text-red-700 text-sm"
                          >
                            <X className="h-4 w-4 mr-1" />
                            Remove
                          </button>
                        </div>
                      )}
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Call to Action
                      </label>
                      <div className="flex items-center space-x-2">
                        <select
                          value={adCreative.call_to_action}
                          onChange={(e) => setAdCreative(prev => ({ ...prev, call_to_action: e.target.value }))}
                          className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-zuck-500 focus:border-transparent text-gray-900"
                        >
                          <option value="">Select CTA</option>
                          <option value="SHOP_NOW">Shop Now</option>
                          <option value="SIGN_UP">Sign Up</option>
                          <option value="LEARN_MORE">Learn More</option>
                          <option value="GET_QUOTE">Get Quote</option>
                          <option value="CONTACT_US">Contact Us</option>
                          <option value="DOWNLOAD">Download</option>
                          <option value="BOOK_NOW">Book Now</option>
                          <option value="APPLY_NOW">Apply Now</option>
                        </select>
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Ad Description
                      </label>
                      <textarea
                        value={adCreative.primary_text}
                        onChange={(e) => setAdCreative(prev => ({ ...prev, primary_text: e.target.value }))}
                        rows={2}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-zuck-500 focus:border-transparent text-gray-900 placeholder-gray-500"
                        placeholder="Enter your ad description"
                      />
                    </div>
                  </div>
                </div>

                {/* Campaign Settings Section */}
                <div className="mb-6">
                  <h3 className="text-lg font-medium text-gray-900 mb-4">Campaign Settings</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Campaign Objective
                      </label>
                      <select
                        value={adCreative.objective}
                        onChange={(e) => setAdCreative(prev => ({ ...prev, objective: e.target.value }))}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-zuck-500 focus:border-transparent text-gray-900"
                      >
                        <option value="TRAFFIC">Traffic</option>
                        <option value="AWARENESS">Awareness</option>
                        <option value="LEADS">Lead Generation</option>
                        <option value="SALES">Sales</option>
                        <option value="ENGAGEMENT">Engagement</option>
                        <option value="APP_INSTALLS">App Installs</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Daily Budget ($)
                      </label>
                      <input
                        type="number"
                        value={adCreative.budget_amount}
                        onChange={(e) => setAdCreative(prev => ({ ...prev, budget_amount: e.target.value }))}
                        min="1"
                        step="0.01"
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-zuck-500 focus:border-transparent text-gray-900 placeholder-gray-500"
                        placeholder="50.00"
                      />
                    </div>
                  </div>

                  {/* Destination Field for Lead Generation, Sales, and Traffic */}
                  {(adCreative.objective === 'LEADS' || adCreative.objective === 'SALES' || adCreative.objective === 'TRAFFIC') && (
                    <div className="mt-4">
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Destination
                      </label>
                      <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                        <label className="flex items-center p-3 border border-gray-300 rounded-lg cursor-pointer hover:bg-gray-50">
                          <input
                            type="checkbox"
                            checked={adCreative.destination.includes('none')}
                            onChange={(e) => setAdCreative(prev => ({ 
                              ...prev, 
                              destination: e.target.checked 
                                ? [...prev.destination.filter(d => d !== 'none'), 'none']
                                : prev.destination.filter(d => d !== 'none')
                            }))}
                            className="mr-2 h-4 w-4 text-zuck-500 focus:ring-zuck-500 border-gray-300 rounded"
                          />
                          <span className="text-sm text-gray-700">None</span>
                        </label>
                        <label className="flex items-center p-3 border border-gray-300 rounded-lg cursor-pointer hover:bg-gray-50">
                          <input
                            type="checkbox"
                            checked={adCreative.destination.includes('messenger')}
                            onChange={(e) => setAdCreative(prev => ({ 
                              ...prev, 
                              destination: e.target.checked 
                                ? [...prev.destination.filter(d => d !== 'messenger'), 'messenger']
                                : prev.destination.filter(d => d !== 'messenger')
                            }))}
                            className="mr-2 h-4 w-4 text-zuck-500 focus:ring-zuck-500 border-gray-300 rounded"
                          />
                          <span className="text-sm text-gray-700">Call Messenger</span>
                        </label>
                        <label className="flex items-center p-3 border border-gray-300 rounded-lg cursor-pointer hover:bg-gray-50">
                          <input
                            type="checkbox"
                            checked={adCreative.destination.includes('instagram')}
                            onChange={(e) => setAdCreative(prev => ({ 
                              ...prev, 
                              destination: e.target.checked 
                                ? [...prev.destination.filter(d => d !== 'instagram'), 'instagram']
                                : prev.destination.filter(d => d !== 'instagram')
                            }))}
                            className="mr-2 h-4 w-4 text-zuck-500 focus:ring-zuck-500 border-gray-300 rounded"
                          />
                          <span className="text-sm text-gray-700">Instagram Direct</span>
                        </label>
                        <label className="flex items-center p-3 border border-gray-300 rounded-lg cursor-pointer hover:bg-gray-50">
                          <input
                            type="checkbox"
                            checked={adCreative.destination.includes('whatsapp')}
                            onChange={(e) => setAdCreative(prev => ({ 
                              ...prev, 
                              destination: e.target.checked 
                                ? [...prev.destination.filter(d => d !== 'whatsapp'), 'whatsapp']
                                : prev.destination.filter(d => d !== 'whatsapp')
                            }))}
                            className="mr-2 h-4 w-4 text-zuck-500 focus:ring-zuck-500 border-gray-300 rounded"
                          />
                          <span className="text-sm text-gray-700">WhatsApp</span>
                        </label>
                        <label className="flex items-center p-3 border border-gray-300 rounded-lg cursor-pointer hover:bg-gray-50">
                          <input
                            type="checkbox"
                            checked={adCreative.destination.includes('instant_form')}
                            onChange={(e) => setAdCreative(prev => ({ 
                              ...prev, 
                              destination: e.target.checked 
                                ? [...prev.destination.filter(d => d !== 'instant_form'), 'instant_form']
                                : prev.destination.filter(d => d !== 'instant_form')
                            }))}
                            className="mr-2 h-4 w-4 text-zuck-500 focus:ring-zuck-500 border-gray-300 rounded"
                          />
                          <span className="text-sm text-gray-700">Instant Form</span>
                        </label>
                      </div>
                    </div>
                  )}

                  {/* App Install Field for App Installs Objective */}
                  {adCreative.objective === 'APP_INSTALLS' && (
                    <div className="mt-4">
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        App Install Type
                      </label>
                      <div className="grid grid-cols-2 gap-3">
                        <label className="flex items-center p-3 border border-gray-300 rounded-lg cursor-pointer hover:bg-gray-50">
                          <input
                            type="checkbox"
                            checked={adCreative.app_install_type.includes('app')}
                            onChange={(e) => setAdCreative(prev => ({ 
                              ...prev, 
                              app_install_type: e.target.checked 
                                ? [...prev.app_install_type.filter(a => a !== 'app'), 'app']
                                : prev.app_install_type.filter(a => a !== 'app')
                            }))}
                            className="mr-2 h-4 w-4 text-zuck-500 focus:ring-zuck-500 border-gray-300 rounded"
                          />
                          <span className="text-sm text-gray-700">App</span>
                        </label>
                        <label className="flex items-center p-3 border border-gray-300 rounded-lg cursor-pointer hover:bg-gray-50">
                          <input
                            type="checkbox"
                            checked={adCreative.app_install_type.includes('playable')}
                            onChange={(e) => setAdCreative(prev => ({ 
                              ...prev, 
                              app_install_type: e.target.checked 
                                ? [...prev.app_install_type.filter(a => a !== 'playable'), 'playable']
                                : prev.app_install_type.filter(a => a !== 'playable')
                            }))}
                            className="mr-2 h-4 w-4 text-zuck-500 focus:ring-zuck-500 border-gray-300 rounded"
                          />
                          <span className="text-sm text-gray-700">Playable Source</span>
                        </label>
                      </div>
                    </div>
                  )}
                </div>

                {/* Targeting Settings Section */}
                <div className="mb-6">
                  <h3 className="text-lg font-medium text-gray-900 mb-4">Target Audience</h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Age Min
                      </label>
                      <select
                        value={adCreative.age_min}
                        onChange={(e) => setAdCreative(prev => ({ ...prev, age_min: e.target.value }))}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-zuck-500 focus:border-transparent text-gray-900"
                      >
                        <option value="13">13</option>
                        <option value="18">18</option>
                        <option value="21">21</option>
                        <option value="25">25</option>
                        <option value="30">30</option>
                        <option value="35">35</option>
                        <option value="40">40</option>
                        <option value="45">45</option>
                        <option value="50">50</option>
                        <option value="55">55</option>
                        <option value="60">60</option>
                        <option value="65">65</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Age Max
                      </label>
                      <select
                        value={adCreative.age_max}
                        onChange={(e) => setAdCreative(prev => ({ ...prev, age_max: e.target.value }))}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-zuck-500 focus:border-transparent text-gray-900"
                      >
                        <option value="17">17</option>
                        <option value="24">24</option>
                        <option value="34">34</option>
                        <option value="44">44</option>
                        <option value="54">54</option>
                        <option value="64">64</option>
                        <option value="65">65+</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Gender
                      </label>
                      <select
                        value={adCreative.gender}
                        onChange={(e) => setAdCreative(prev => ({ ...prev, gender: e.target.value }))}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-zuck-500 focus:border-transparent text-gray-900"
                      >
                        <option value="all">All</option>
                        <option value="men">Men</option>
                        <option value="women">Women</option>
                      </select>
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Detailed Targeting
                    </label>
                    <textarea
                      value={adCreative.detailed_targeting}
                      onChange={(e) => setAdCreative(prev => ({ ...prev, detailed_targeting: e.target.value }))}
                      rows={2}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-zuck-500 focus:border-transparent text-gray-900 placeholder-gray-500"
                      placeholder="Enter interests, behaviors, demographics, or custom audiences (e.g., 'Interested in fitness, Small business owners, Parents')"
                    />
                    <p className="mt-1 text-sm text-gray-500">
                      Separate multiple targeting options with commas
                    </p>
                  </div>
                </div>

                {/* Modal Actions */}
                <div className="flex justify-end space-x-3 pt-4 border-t border-gray-200">
                  <button
                    onClick={() => setShowCreativeModal(false)}
                    className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleCreativeAdSave}
                    className="px-4 py-2 bg-zuck-500 text-white rounded-lg hover:bg-zuck-600 transition-colors"
                  >
                    Save Settings
                  </button>
                </div>
                  </>
                ) : (
                  // Follow Up - Selected Recommendations and Ad Results
                  <>
                    {/* Saved Recommendations Section */}
                    {savedRecommendations.length > 0 && (
                      <div className="mb-6">
                        <h3 className="text-lg font-medium text-gray-900 mb-4">Saved Recommendations from Database</h3>
                        <div className="space-y-3">
                          {savedRecommendations.map((selectedRec, index) => {
                            const rec = selectedRec.ad_recommendations
                            if (!rec) return null
                            
                            return (
                              <div key={index} className="p-4 border border-gray-200 rounded-lg bg-gray-50">
                                <div className="flex items-start justify-between">
                                  <div className="flex-1">
                                    <h4 className="font-medium text-gray-900 mb-2">{rec.headline || 'Ad Recommendation'}</h4>
                                    <p className="text-sm text-gray-600 mb-2">{rec.primary_text}</p>
                                    <div className="flex items-center space-x-4 text-xs text-gray-500">
                                      {rec.call_to_action && <span>CTA: {rec.call_to_action}</span>}
                                      {rec.targeting && <span>Targeting: {rec.targeting}</span>}
                                      {rec.budget_recommendation && <span>Budget: {rec.budget_recommendation}</span>}
                                      {rec.ai_score && <span>AI Score: {(rec.ai_score * 100).toFixed(0)}%</span>}
                                      {rec.created_at && <span>Created: {new Date(rec.created_at).toLocaleDateString()}</span>}
                                    </div>
                                  </div>
                                </div>
                              </div>
                            )
                          })}
                        </div>
                      </div>
                    )}

                    {savedRecommendations.length === 0 && (
                      <div className="mb-6">
                        <div className="p-4 border border-gray-200 rounded-lg bg-yellow-50">
                          <p className="text-sm text-yellow-800">
                            No saved recommendations found. Make sure to select recommendations during your chat session.
                          </p>
                        </div>
                      </div>
                    )}

                    {/* Ad Results Section - Individual Forms for Each Recommendation */}
                    <div className="mb-6">
                      <h3 className="text-lg font-medium text-gray-900 mb-4">Campaign Performance Results</h3>
                      <div className="space-y-6">
                        {savedRecommendations.map((selectedRec, index) => {
                          const rec = selectedRec.ad_recommendations
                          if (!rec) return null
                          
                          const recommendationId = rec.id
                          const currentResults = adResults[recommendationId] || {
                            impressions: '',
                            clicks: '',
                            spend: '',
                            conversions: '',
                            conversion_rate: '',
                            ctr: '',
                            cpc: '',
                            cpm: ''
                          }
                          
                          return (
                            <div key={index} className="p-4 border border-gray-200 rounded-lg bg-gray-50">
                              <h4 className="font-medium text-gray-900 mb-3">{rec.headline || 'Ad Recommendation'}</h4>
                              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                <div>
                                  <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Impressions
                                  </label>
                                  <input
                                    type="number"
                                    value={currentResults.impressions}
                                    onChange={(e) => setAdResults(prev => ({
                                      ...prev,
                                      [recommendationId]: {
                                        ...currentResults,
                                        impressions: e.target.value
                                      }
                                    }))}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-zuck-500 focus:border-transparent"
                                    placeholder="0"
                                  />
                                </div>
                                <div>
                                  <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Clicks
                                  </label>
                                  <input
                                    type="number"
                                    value={currentResults.clicks}
                                    onChange={(e) => setAdResults(prev => ({
                                      ...prev,
                                      [recommendationId]: {
                                        ...currentResults,
                                        clicks: e.target.value
                                      }
                                    }))}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-zuck-500 focus:border-transparent"
                                    placeholder="0"
                                  />
                                </div>
                                <div>
                                  <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Spend ($)
                                  </label>
                                  <input
                                    type="number"
                                    step="0.01"
                                    value={currentResults.spend}
                                    onChange={(e) => setAdResults(prev => ({
                                      ...prev,
                                      [recommendationId]: {
                                        ...currentResults,
                                        spend: e.target.value
                                      }
                                    }))}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-zuck-500 focus:border-transparent"
                                    placeholder="0.00"
                                  />
                                </div>
                                <div>
                                  <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Conversions
                                  </label>
                                  <input
                                    type="number"
                                    value={currentResults.conversions}
                                    onChange={(e) => setAdResults(prev => ({
                                      ...prev,
                                      [recommendationId]: {
                                        ...currentResults,
                                        conversions: e.target.value
                                      }
                                    }))}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-zuck-500 focus:border-transparent"
                                    placeholder="0"
                                  />
                                </div>
                                <div>
                                  <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Conversion Rate (%)
                                  </label>
                                  <input
                                    type="number"
                                    step="0.01"
                                    value={currentResults.conversion_rate}
                                    onChange={(e) => setAdResults(prev => ({
                                      ...prev,
                                      [recommendationId]: {
                                        ...currentResults,
                                        conversion_rate: e.target.value
                                      }
                                    }))}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-zuck-500 focus:border-transparent"
                                    placeholder="0.00"
                                  />
                                </div>
                                <div>
                                  <label className="block text-sm font-medium text-gray-700 mb-2">
                                    CTR (%)
                                  </label>
                                  <input
                                    type="number"
                                    step="0.01"
                                    value={currentResults.ctr}
                                    onChange={(e) => setAdResults(prev => ({
                                      ...prev,
                                      [recommendationId]: {
                                        ...currentResults,
                                        ctr: e.target.value
                                      }
                                    }))}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-zuck-500 focus:border-transparent"
                                    placeholder="0.00"
                                  />
                                </div>
                                <div>
                                  <label className="block text-sm font-medium text-gray-700 mb-2">
                                    CPC ($)
                                  </label>
                                  <input
                                    type="number"
                                    step="0.01"
                                    value={currentResults.cpc}
                                    onChange={(e) => setAdResults(prev => ({
                                      ...prev,
                                      [recommendationId]: {
                                        ...currentResults,
                                        cpc: e.target.value
                                      }
                                    }))}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-zuck-500 focus:border-transparent"
                                    placeholder="0.00"
                                  />
                                </div>
                                <div>
                                  <label className="block text-sm font-medium text-gray-700 mb-2">
                                    CPM ($)
                                  </label>
                                  <input
                                    type="number"
                                    step="0.01"
                                    value={currentResults.cpm}
                                    onChange={(e) => setAdResults(prev => ({
                                      ...prev,
                                      [recommendationId]: {
                                        ...currentResults,
                                        cpm: e.target.value
                                      }
                                    }))}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-zuck-500 focus:border-transparent"
                                    placeholder="0.00"
                                  />
                                </div>
                              </div>
                            </div>
                          )
                        })}
                      </div>
                    </div>

                    {/* Follow Up Modal Actions */}
                    <div className="flex justify-end space-x-3 pt-4 border-t border-gray-200">
                      <button
                        onClick={() => setShowCreativeModal(false)}
                        className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
                      >
                        Cancel
                      </button>
                      <button
                        onClick={handleAdResultsSave}
                        className="px-4 py-2 bg-zuck-500 text-white rounded-lg hover:bg-zuck-600 transition-colors"
                      >
                        Save Results
                      </button>
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
} 