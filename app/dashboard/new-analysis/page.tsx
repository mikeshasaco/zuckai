'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import { Brain, Upload, ArrowLeft } from 'lucide-react'
import Link from 'next/link'
import toast from 'react-hot-toast'

export default function NewAnalysisPage() {
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    headline: '',
    primary_text: '',
    call_to_action: '',
    media_url: '',
    objective: 'CONVERSIONS',
    budget_amount: '',
    age_min: '18',
    age_max: '65',
    gender: 'all',
    detailed_targeting: '',
    destination_url: '',
  })
  const router = useRouter()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        router.push('/auth')
        return
      }

      const { data: adData, error: adError } = await supabase
        .from('ads')
        .insert([
          {
            user_id: user.id,
            headline: formData.headline,
            primary_text: formData.primary_text,
            call_to_action: formData.call_to_action,
            media_url: formData.media_url,
          },
        ])
        .select()
        .single()

      if (adError) throw adError

      const { error: fbAdError } = await supabase
        .from('facebook_ads')
        .insert([
          {
            ad_id: adData.id,
            objective: formData.objective,
            budget_amount: parseFloat(formData.budget_amount) || 0,
            age_min: parseInt(formData.age_min),
            age_max: parseInt(formData.age_max),
            gender: formData.gender,
            detailed_targeting: formData.detailed_targeting ? JSON.parse(formData.detailed_targeting) : null,
            destination_url: formData.destination_url,
          },
        ])

      if (fbAdError) throw fbAdError

      toast.success('Ad uploaded successfully! Analyzing with Zuck AI...')
      router.push(`/dashboard/analysis/${adData.id}`)
    } catch (error: any) {
      toast.error(error.message || 'Error creating analysis')
    } finally {
      setLoading(false)
    }
  }

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }))
  }

  return (
    <div className="min-h-screen bg-gray-50">
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
          <h1 className="text-3xl font-bold text-gray-900 mb-2">New Ad Analysis</h1>
          <p className="text-gray-600">
            Upload your Facebook ad details and let Zuck AI provide intelligent recommendations.
          </p>
        </div>

        <div className="bg-white rounded-lg shadow-sm p-8">
          <form onSubmit={handleSubmit} className="space-y-8">
            <div>
              <h2 className="text-xl font-semibold text-gray-900 mb-6">Ad Creative</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Headline *
                  </label>
                  <input
                    type="text"
                    value={formData.headline}
                    onChange={(e) => handleInputChange('headline', e.target.value)}
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-zuck-500 focus:border-transparent text-gray-900 placeholder-gray-500 bg-white"
                    placeholder="Enter your ad headline"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Call to Action
                  </label>
                  <select
                    value={formData.call_to_action}
                    onChange={(e) => handleInputChange('call_to_action', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-zuck-500 focus:border-transparent text-gray-900 bg-white"
                  >
                    <option value="">Select CTA</option>
                    <option value="SHOP_NOW">Shop Now</option>
                    <option value="SIGN_UP">Sign Up</option>
                    <option value="LEARN_MORE">Learn More</option>
                    <option value="GET_QUOTE">Get Quote</option>
                    <option value="CONTACT_US">Contact Us</option>
                    <option value="DOWNLOAD">Download</option>
                  </select>
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Primary Text *
                  </label>
                  <textarea
                    value={formData.primary_text}
                    onChange={(e) => handleInputChange('primary_text', e.target.value)}
                    required
                    rows={4}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-zuck-500 focus:border-transparent text-gray-900 placeholder-gray-500 bg-white"
                    placeholder="Enter your ad description"
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Media URL (Image/Video)
                  </label>
                  <input
                    type="url"
                    value={formData.media_url}
                    onChange={(e) => handleInputChange('media_url', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-zuck-500 focus:border-transparent text-gray-900 placeholder-gray-500 bg-white"
                    placeholder="https://example.com/image.jpg"
                  />
                </div>
              </div>
            </div>

            <div>
              <h2 className="text-xl font-semibold text-gray-900 mb-6">Campaign Settings</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Campaign Objective *
                  </label>
                  <select
                    value={formData.objective}
                    onChange={(e) => handleInputChange('objective', e.target.value)}
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-zuck-500 focus:border-transparent text-gray-900 bg-white"
                  >
                    <option value="CONVERSIONS">Conversions</option>
                    <option value="TRAFFIC">Traffic</option>
                    <option value="AWARENESS">Awareness</option>
                    <option value="LEADS">Lead Generation</option>
                    <option value="SALES">Sales</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Daily Budget ($)
                  </label>
                  <input
                    type="number"
                    value={formData.budget_amount}
                    onChange={(e) => handleInputChange('budget_amount', e.target.value)}
                    min="1"
                    step="0.01"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-zuck-500 focus:border-transparent text-gray-900 placeholder-gray-500 bg-white"
                    placeholder="50.00"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Age Range
                  </label>
                  <div className="flex items-center space-x-2">
                    <input
                      type="number"
                      value={formData.age_min}
                      onChange={(e) => handleInputChange('age_min', e.target.value)}
                      min="13"
                      max="65"
                      className="w-20 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-zuck-500 focus:border-transparent text-gray-900 bg-white"
                    />
                    <span className="text-gray-500">to</span>
                    <input
                      type="number"
                      value={formData.age_max}
                      onChange={(e) => handleInputChange('age_max', e.target.value)}
                      min="13"
                      max="65"
                      className="w-20 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-zuck-500 focus:border-transparent text-gray-900 bg-white"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Gender
                  </label>
                  <select
                    value={formData.gender}
                    onChange={(e) => handleInputChange('gender', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-zuck-500 focus:border-transparent text-gray-900 bg-white"
                  >
                    <option value="all">All</option>
                    <option value="men">Men</option>
                    <option value="women">Women</option>
                  </select>
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Destination URL
                  </label>
                  <input
                    type="url"
                    value={formData.destination_url}
                    onChange={(e) => handleInputChange('destination_url', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-zuck-500 focus:border-transparent text-gray-900 placeholder-gray-500 bg-white"
                    placeholder="https://yourwebsite.com/landing-page"
                  />
                </div>
              </div>
            </div>

            <div className="flex justify-end">
              <button
                type="submit"
                disabled={loading}
                className="inline-flex items-center px-8 py-3 bg-zuck-600 text-white font-semibold rounded-lg hover:bg-zuck-700 focus:outline-none focus:ring-2 focus:ring-zuck-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {loading ? (
                  <>
                    <Brain className="h-5 w-5 mr-2 animate-spin" />
                    Analyzing...
                  </>
                ) : (
                  <>
                    <Upload className="h-5 w-5 mr-2" />
                    Upload & Analyze
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
} 