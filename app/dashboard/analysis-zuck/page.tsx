'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import { Brain, ArrowLeft, Upload } from 'lucide-react'
import Link from 'next/link'
import toast from 'react-hot-toast'

// Function to generate a unique session identifier
const generateSessionId = () => {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789'
  let result = ''
  
  // Use crypto.randomBytes for better randomness if available
  if (typeof window !== 'undefined' && window.crypto && window.crypto.getRandomValues) {
    const array = new Uint8Array(16)
    window.crypto.getRandomValues(array)
    
    for (let i = 0; i < 16; i++) {
      result += chars.charAt(array[i] % chars.length)
    }
  } else {
    // Fallback to Math.random for older browsers
    for (let i = 0; i < 16; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length))
    }
  }
  
  return result
}

export default function AnalysisZuckPage() {
  const [loading, setLoading] = useState(false)
  const [companyDescription, setCompanyDescription] = useState('')
  const [adCreative, setAdCreative] = useState({
    headline: '',
    primary_text: '',
    call_to_action: '',
    media_url: '',
  })
  const router = useRouter()

  const createNewSession = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!companyDescription.trim()) {
      toast.error('Please provide a company description')
      return
    }

    setLoading(true)
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        router.push('/auth')
        return
      }

      const sessionId = generateSessionId()
      const { data, error } = await supabase
        .from('analysis_sessions')
        .insert([
          {
            user_id: user.id,
            title: `Analysis ${new Date().toLocaleDateString()}`,
            company_description: companyDescription,
            ad_creative: adCreative,
            messages: [],
            session_id: sessionId
          }
        ])
        .select()
        .single()

      if (error) throw error

      toast.success('New session created! Redirecting to chat...')
      router.push('/dashboard/sessions')
    } catch (error: any) {
      console.error('Error creating session:', error)
      toast.error('Failed to create session')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
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

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Start Your AI Analysis</h1>
          <p className="text-gray-600">
            Tell us about your business and upload your ad creative to get personalized Facebook Ads recommendations from Zuck AI.
          </p>
        </div>

        <form onSubmit={createNewSession} className="space-y-8">
          {/* Company Description Section */}
          <div className="bg-white rounded-lg shadow-sm p-8">
            <h2 className="text-xl font-semibold text-gray-900 mb-6">Tell Us About Your Business</h2>
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Company Description *
                </label>
                <textarea
                  value={companyDescription}
                  onChange={(e) => setCompanyDescription(e.target.value)}
                  rows={6}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-zuck-500 focus:border-transparent text-gray-900 placeholder-gray-500 bg-white"
                  placeholder="Describe your company, products/services, target audience, business model, and whether you're targeting local or online customers. The more details you provide, the better Zuck AI can help you optimize your Facebook advertising strategy."
                />
                <p className="mt-2 text-sm text-gray-500">
                  Include information about your industry, target market, goals, and current advertising challenges.
                </p>
              </div>
            </div>
          </div>

          {/* Ad Creative Section */}
          <div className="bg-white rounded-lg shadow-sm p-8">
            <h2 className="text-xl font-semibold text-gray-900 mb-6">Ad Creative (Optional)</h2>
            <p className="text-gray-600 mb-6">
              If you have existing Facebook ads, share them here for more specific recommendations. This is optional - you can still get great advice based on your company description alone.
            </p>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Headline
                </label>
                <input
                  type="text"
                  value={adCreative.headline}
                  onChange={(e) => setAdCreative(prev => ({ ...prev, headline: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-zuck-500 focus:border-transparent text-gray-900 placeholder-gray-500 bg-white"
                  placeholder="Enter your ad headline"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Call to Action
                </label>
                <select
                  value={adCreative.call_to_action}
                  onChange={(e) => setAdCreative(prev => ({ ...prev, call_to_action: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-zuck-500 focus:border-transparent text-gray-900 bg-white"
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

              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Primary Text
                </label>
                <textarea
                  value={adCreative.primary_text}
                  onChange={(e) => setAdCreative(prev => ({ ...prev, primary_text: e.target.value }))}
                  rows={4}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-zuck-500 focus:border-transparent text-gray-900 placeholder-gray-500 bg-white"
                  placeholder="Enter your ad description or copy"
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Media URL (Image/Video)
                </label>
                <input
                  type="url"
                  value={adCreative.media_url}
                  onChange={(e) => setAdCreative(prev => ({ ...prev, media_url: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-zuck-500 focus:border-transparent text-gray-900 placeholder-gray-500 bg-white"
                  placeholder="https://example.com/image.jpg"
                />
                <p className="mt-2 text-sm text-gray-500">
                  Provide a direct link to your ad image or video for visual analysis.
                </p>
              </div>
            </div>
          </div>

          {/* Submit Button */}
          <div className="flex justify-end">
            <button
              type="submit"
              disabled={loading}
              className="inline-flex items-center px-8 py-3 bg-zuck-600 text-white font-semibold rounded-lg hover:bg-zuck-700 focus:outline-none focus:ring-2 focus:ring-zuck-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {loading ? (
                <>
                  <Brain className="h-5 w-5 mr-2 animate-spin" />
                  Creating Session...
                </>
              ) : (
                <>
                  <Upload className="h-5 w-5 mr-2" />
                  Start Analysis Session
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
} 