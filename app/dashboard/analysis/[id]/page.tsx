'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import { Brain, ArrowLeft, Target, TrendingUp, Share2, Download } from 'lucide-react'
import Link from 'next/link'
import toast from 'react-hot-toast'

interface Ad {
  id: string
  headline: string
  primary_text: string
  call_to_action?: string
  media_url?: string
  created_at: string
  gpt_summary?: string
  facebook_ads: any[]
}

interface Analysis {
  id: string
  gpt_response: string
  created_at: string
}

export default function AnalysisPage() {
  const params = useParams()
  const router = useRouter()
  const [ad, setAd] = useState<Ad | null>(null)
  const [analysis, setAnalysis] = useState<Analysis | null>(null)
  const [loading, setLoading] = useState(true)
  const [analyzing, setAnalyzing] = useState(false)

  useEffect(() => {
    fetchAdAndAnalysis()
  }, [params.id])

  const fetchAdAndAnalysis = async () => {
    try {
      // Fetch ad data
      const { data: adData, error: adError } = await supabase
        .from('ads')
        .select(`
          *,
          facebook_ads (*)
        `)
        .eq('id', params.id)
        .single()

      if (adError) throw adError
      setAd(adData)

      // Fetch existing analysis
      const { data: analysisData, error: analysisError } = await supabase
        .from('ai_analyses')
        .select('*')
        .eq('ad_id', params.id)
        .order('created_at', { ascending: false })
        .limit(1)
        .single()

      if (!analysisError && analysisData) {
        setAnalysis(analysisData)
      }
    } catch (error: any) {
      toast.error('Error fetching ad data')
    } finally {
      setLoading(false)
    }
  }

  const runAnalysis = async () => {
    setAnalyzing(true)
    try {
      const response = await fetch('/api/analyze', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ adId: params.id }),
      })

      if (!response.ok) {
        throw new Error('Analysis failed')
      }

      const result = await response.json()
      
      // Refresh the analysis data
      await fetchAdAndAnalysis()
      
      toast.success('Analysis completed!')
    } catch (error: any) {
      toast.error('Error running analysis')
    } finally {
      setAnalyzing(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Brain className="h-12 w-12 text-zuck-600 mx-auto mb-4 animate-pulse" />
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    )
  }

  if (!ad) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600">Ad not found</p>
          <Link href="/dashboard" className="text-zuck-600 hover:text-zuck-700">
            Back to Dashboard
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navigation */}
      <nav className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <Link href="/dashboard" className="flex items-center text-gray-600 hover:text-gray-900">
                <ArrowLeft className="h-5 w-5 mr-2" />
                Back to Dashboard
              </Link>
            </div>
            <div className="flex items-center">
              <Brain className="h-8 w-8 text-zuck-600" />
              <span className="ml-2 text-xl font-bold text-gray-900">Zuck AI</span>
            </div>
          </div>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Ad Details */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-8">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Ad Analysis</h1>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Ad Creative</h3>
              <div className="space-y-3">
                <div>
                  <label className="text-sm font-medium text-gray-600">Headline</label>
                  <p className="text-gray-900">{ad.headline}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-600">Primary Text</label>
                  <p className="text-gray-900">{ad.primary_text}</p>
                </div>
                {ad.call_to_action && (
                  <div>
                    <label className="text-sm font-medium text-gray-600">Call to Action</label>
                    <p className="text-gray-900">{ad.call_to_action}</p>
                  </div>
                )}
                {ad.media_url && (
                  <div>
                    <label className="text-sm font-medium text-gray-600">Media URL</label>
                    <a href={ad.media_url} target="_blank" rel="noopener noreferrer" className="text-zuck-600 hover:text-zuck-700">
                      View Media
                    </a>
                  </div>
                )}
              </div>
            </div>

            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Campaign Settings</h3>
              <div className="space-y-3">
                {ad.facebook_ads[0] && (
                  <>
                    <div>
                      <label className="text-sm font-medium text-gray-600">Objective</label>
                      <p className="text-gray-900">{ad.facebook_ads[0].objective}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-600">Budget</label>
                      <p className="text-gray-900">${ad.facebook_ads[0].budget_amount || 'Not specified'}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-600">Targeting</label>
                      <p className="text-gray-900">
                        {ad.facebook_ads[0].age_min}-{ad.facebook_ads[0].age_max} years, {ad.facebook_ads[0].gender}
                      </p>
                    </div>
                    {ad.facebook_ads[0].destination_url && (
                      <div>
                        <label className="text-sm font-medium text-gray-600">Destination URL</label>
                        <a href={ad.facebook_ads[0].destination_url} target="_blank" rel="noopener noreferrer" className="text-zuck-600 hover:text-zuck-700">
                          {ad.facebook_ads[0].destination_url}
                        </a>
                      </div>
                    )}
                  </>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Analysis Section */}
        <div className="bg-white rounded-lg shadow-sm p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-semibold text-gray-900">Zuck AI Analysis</h2>
            {!analysis && (
              <button
                onClick={runAnalysis}
                disabled={analyzing}
                className="inline-flex items-center px-4 py-2 bg-zuck-600 text-white font-medium rounded-lg hover:bg-zuck-700 focus:outline-none focus:ring-2 focus:ring-zuck-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {analyzing ? (
                  <>
                    <Brain className="h-4 w-4 mr-2 animate-spin" />
                    Analyzing...
                  </>
                ) : (
                  <>
                    <Target className="h-4 w-4 mr-2" />
                    Run Analysis
                  </>
                )}
              </button>
            )}
          </div>

          {analysis ? (
            <div className="prose max-w-none">
              <div className="bg-gray-50 rounded-lg p-6">
                <div className="whitespace-pre-wrap text-gray-900 leading-relaxed">
                  {analysis.gpt_response}
                </div>
              </div>
              
              <div className="mt-6 flex items-center justify-between text-sm text-gray-500">
                <span>Analysis completed on {new Date(analysis.created_at).toLocaleDateString()}</span>
                <div className="flex items-center space-x-4">
                  <button className="flex items-center text-gray-600 hover:text-gray-900">
                    <Share2 className="h-4 w-4 mr-1" />
                    Share
                  </button>
                  <button className="flex items-center text-gray-600 hover:text-gray-900">
                    <Download className="h-4 w-4 mr-1" />
                    Export
                  </button>
                </div>
              </div>
            </div>
          ) : (
            <div className="text-center py-12">
              <Brain className="h-16 w-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">Ready for Analysis</h3>
              <p className="text-gray-600 mb-6">
                Click the button above to get Zuck AI's expert analysis and recommendations for your Facebook ad.
              </p>
              <button
                onClick={runAnalysis}
                disabled={analyzing}
                className="inline-flex items-center px-6 py-3 bg-zuck-600 text-white font-semibold rounded-lg hover:bg-zuck-700 focus:outline-none focus:ring-2 focus:ring-zuck-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {analyzing ? (
                  <>
                    <Brain className="h-5 w-5 mr-2 animate-spin" />
                    Analyzing with Zuck AI...
                  </>
                ) : (
                  <>
                    <TrendingUp className="h-5 w-5 mr-2" />
                    Start Analysis
                  </>
                )}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
} 