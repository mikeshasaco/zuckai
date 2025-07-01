'use client'

import { useState } from 'react'
import { AdRecommendation, SelectedRecommendation } from '@/lib/types'
import { createClient } from '@supabase/supabase-js'

interface AdRecommendationsProps {
  recommendations: AdRecommendation[]
  adId: string
  onSelectionChange: (selectedId: string) => void
}

export default function AdRecommendations({ 
  recommendations, 
  adId, 
  onSelectionChange 
}: AdRecommendationsProps) {
  const [selectedRecommendations, setSelectedRecommendations] = useState<string[]>([])
  const [loading, setLoading] = useState(false)
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )

  const handleRecommendationToggle = async (recommendationId: string) => {
    setLoading(true)
    
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      const isSelected = selectedRecommendations.includes(recommendationId)
      
      if (isSelected) {
        // Remove from selection
        const newSelected = selectedRecommendations.filter(id => id !== recommendationId)
        setSelectedRecommendations(newSelected)
        onSelectionChange(recommendationId)
        
        // Update database - set status to 'archived'
        await supabase
          .from('selected_recommendations')
          .update({ status: 'archived' })
          .eq('recommendation_id', recommendationId)
          .eq('user_id', user.id)
      } else {
        // Add to selection
        const newSelected = [...selectedRecommendations, recommendationId]
        setSelectedRecommendations(newSelected)
        onSelectionChange(recommendationId)
        
        // Insert or update database - set status to 'active'
        await supabase
          .from('selected_recommendations')
          .upsert({
            user_id: user.id,
            recommendation_id: recommendationId,
            status: 'active'
          })
      }
    } catch (error) {
      console.error('Error updating recommendation selection:', error)
    } finally {
      setLoading(false)
    }
  }

  if (recommendations.length === 0) {
    return (
      <div className="bg-gray-50 rounded-lg p-6 text-center">
        <p className="text-gray-600">No recommendations available yet.</p>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold text-gray-900">
        AI-Generated Ad Variations
      </h3>
      <p className="text-sm text-gray-600 mb-4">
        Select the variations you'd like to test. You can select multiple variations.
      </p>
      
      <div className="grid gap-4">
        {recommendations.map((recommendation, index) => (
          <div
            key={recommendation.id || index}
            className={`border rounded-lg p-4 transition-all ${
              selectedRecommendations.includes(recommendation.id || `variation_${index + 1}`)
                ? 'border-blue-500 bg-blue-50'
                : 'border-gray-200 bg-white hover:border-gray-300'
            }`}
          >
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-3">
                  <span className="text-sm font-medium text-gray-900">
                    Variation {index + 1}
                  </span>
                  {recommendation.ai_score && (
                    <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded">
                      Score: {(recommendation.ai_score * 100).toFixed(0)}%
                    </span>
                  )}
                  <input
                    type="checkbox"
                    checked={selectedRecommendations.includes(recommendation.id || `variation_${index + 1}`)}
                    onChange={() => handleRecommendationToggle(recommendation.id || `variation_${index + 1}`)}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                </div>
                
                {recommendation.headline && (
                  <div className="mb-3">
                    <span className="text-xs font-medium text-gray-500 block mb-1">Headline:</span>
                    <p className="text-sm text-gray-900 font-medium">{recommendation.headline}</p>
                  </div>
                )}
                
                {recommendation.primary_text && (
                  <div className="mb-3">
                    <span className="text-xs font-medium text-gray-500 block mb-1">Primary Text:</span>
                    <p className="text-sm text-gray-900">{recommendation.primary_text}</p>
                  </div>
                )}
                
                {recommendation.call_to_action && (
                  <div className="mb-3">
                    <span className="text-xs font-medium text-gray-500 block mb-1">Call to Action:</span>
                    <p className="text-sm text-gray-900 font-medium">{recommendation.call_to_action}</p>
                  </div>
                )}
                
                {recommendation.targeting && (
                  <div className="mb-3">
                    <span className="text-xs font-medium text-gray-500 block mb-1">Targeting:</span>
                    <p className="text-sm text-gray-900">{recommendation.targeting}</p>
                  </div>
                )}
                
                {recommendation.budget_recommendation && (
                  <div>
                    <span className="text-xs font-medium text-gray-500 block mb-1">Budget:</span>
                    <p className="text-sm text-gray-900">{recommendation.budget_recommendation}</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
      
      {selectedRecommendations.length > 0 && (
        <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
          <p className="text-sm text-blue-800">
            <strong>{selectedRecommendations.length}</strong> variation(s) selected for testing.
            You can now track performance and get follow-up recommendations.
          </p>
        </div>
      )}
    </div>
  )
} 