'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import { Brain, ArrowLeft } from 'lucide-react'
import Link from 'next/link'
import toast from 'react-hot-toast'



export default function NewChatPage() {
  const [loading, setLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    createNewSession()
  }, [])

  const createNewSession = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        router.push('/auth')
        return
      }

      // Generate session_id in the same format as the database
      const timestamp = Math.floor(Date.now() / 1000)
      const randomPart1 = Math.random().toString(36).substring(2, 10)
      const randomPart2 = Math.random().toString(36).substring(2, 5)
      const sessionId = `S${timestamp}${randomPart1}${randomPart2}`

      const { data, error } = await supabase
        .from('analysis_sessions')
        .insert([
          {
            user_id: user.id,
            title: `Chat ${new Date().toLocaleDateString()}`,
            company_description: '',
            ad_creative: {},
            messages: [],
            session_id: sessionId
          }
        ])
        .select()
        .single()

      if (error) throw error

      toast.success('New chat session created!')
      router.push(`/dashboard/sessions?session=${data.session_id}`)
    } catch (error: any) {
      console.error('Error creating session:', error)
      toast.error('Failed to create session')
      router.push('/dashboard')
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
        <div className="text-center">
          <Brain className="h-16 w-16 text-zuck-600 mx-auto mb-4 animate-spin" />
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Creating New Chat Session</h1>
          <p className="text-gray-600">Setting up your conversation with Zuck AI...</p>
        </div>
      </div>
    </div>
  )
} 