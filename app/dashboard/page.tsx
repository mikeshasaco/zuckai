'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import { Brain, Plus, MessageSquare, LogOut, Settings } from 'lucide-react'
import Link from 'next/link'
import toast from 'react-hot-toast'

interface Session {
  id: string
  title: string
  created_at: string
  company_description: string
  messages: Array<{role: 'user' | 'assistant', content: string}>
}

export default function DashboardPage() {
  const [user, setUser] = useState<any>(null)
  const [sessions, setSessions] = useState<Session[]>([])
  const [loading, setLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    checkUser()
  }, [])

  const checkUser = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        router.push('/auth')
        return
      }
      setUser(user)
      loadSessions()
    } catch (error) {
      console.error('Error checking user:', error)
      router.push('/auth')
    }
  }

  const loadSessions = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      const { data, error } = await supabase
        .from('analysis_sessions')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(10)

      if (error) throw error
      setSessions(data || [])
    } catch (error: any) {
      console.error('Error loading sessions:', error)
      toast.error('Failed to load sessions')
    } finally {
      setLoading(false)
    }
  }

  const handleSignOut = async () => {
    try {
      await supabase.auth.signOut()
      router.push('/auth')
    } catch (error) {
      console.error('Error signing out:', error)
    }
  }

  const getMessageCount = (messages: any[]) => {
    return messages?.length || 0
  }

  const getLastMessage = (messages: any[]) => {
    if (!messages || messages.length === 0) return 'No messages yet'
    const lastMessage = messages[messages.length - 1]
    return lastMessage.content.substring(0, 100) + (lastMessage.content.length > 100 ? '...' : '')
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Brain className="h-12 w-12 text-zuck-600 mx-auto mb-4 animate-spin" />
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <nav className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <Brain className="h-8 w-8 text-zuck-600" />
              <span className="ml-2 text-xl font-bold text-gray-900">Zuck AI</span>
            </div>
            <div className="flex items-center space-x-4">
              <span className="text-sm text-gray-600">
                Welcome, {user?.user_metadata?.name || user?.email}
              </span>
              <button
                onClick={handleSignOut}
                className="flex items-center text-gray-600 hover:text-gray-900"
              >
                <LogOut className="h-4 w-4 mr-1" />
                Sign Out
              </button>
            </div>
          </div>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Welcome Section */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Welcome to Zuck AI
          </h1>
          <p className="text-gray-600">
            Your AI-powered Facebook Ads assistant. Chat with Zuck AI to get intelligent recommendations and optimize your campaigns.
          </p>
        </div>

        {/* Quick Actions */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold text-gray-900">Quick Actions</h2>
          </div>
          <div className="mt-4 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <Link
              href="/dashboard/new-chat"
              className="bg-white p-6 rounded-lg shadow-sm border border-gray-200 hover:shadow-md transition-shadow"
            >
              <div className="flex items-center">
                <Plus className="h-8 w-8 text-zuck-600 mr-4" />
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">New Chat</h3>
                  <p className="text-gray-600">Start a fresh conversation with Zuck AI</p>
                </div>
              </div>
            </Link>

            <Link
              href="/pricing"
              className="bg-white p-6 rounded-lg shadow-sm border border-gray-200 hover:shadow-md transition-shadow"
            >
              <div className="flex items-center">
                <Settings className="h-8 w-8 text-zuck-600 mr-4" />
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">Upgrade Plan</h3>
                  <p className="text-gray-600">Get more analyses and features</p>
                </div>
              </div>
            </Link>
          </div>
        </div>

        {/* Recent Sessions */}
        <div className="bg-white rounded-lg shadow-sm">
          <div className="px-6 py-4 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-semibold text-gray-900">Recent Chat Sessions</h2>
              <Link
                href="/dashboard/sessions"
                className="text-zuck-600 hover:text-zuck-700 font-medium"
              >
                View All
              </Link>
            </div>
          </div>

          <div className="divide-y divide-gray-200">
            {sessions.length === 0 ? (
              <div className="px-6 py-12 text-center">
                <MessageSquare className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No chat sessions yet</h3>
                <p className="text-gray-600 mb-4">
                  Start your first conversation with Zuck AI to get personalized Facebook Ads recommendations.
                </p>
                <Link
                  href="/dashboard/new-chat"
                  className="inline-flex items-center px-4 py-2 bg-zuck-600 text-white rounded-lg hover:bg-zuck-700"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Start First Chat
                </Link>
              </div>
            ) : (
              sessions.map((session) => (
                <Link
                  key={session.id}
                  href={`/dashboard/sessions`}
                  className="block hover:bg-gray-50 transition-colors"
                >
                  <div className="px-6 py-4">
                    <div className="flex items-center justify-between">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center">
                          <MessageSquare className="h-5 w-5 text-gray-400 mr-3" />
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-gray-900 truncate">
                              {session.title}
                            </p>
                            <p className="text-sm text-gray-500">
                              {new Date(session.created_at).toLocaleDateString()} • {getMessageCount(session.messages)} messages
                            </p>
                          </div>
                        </div>
                        <p className="mt-2 text-sm text-gray-600 line-clamp-2">
                          {getLastMessage(session.messages)}
                        </p>
                      </div>
                      <div className="ml-4 flex-shrink-0">
                        <Brain className="h-5 w-5 text-gray-400" />
                      </div>
                    </div>
                  </div>
                </Link>
              ))
            )}
          </div>
        </div>

        {/* Stats Overview */}
        <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white p-6 rounded-lg shadow-sm">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <MessageSquare className="h-8 w-8 text-zuck-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Chats</p>
                <p className="text-2xl font-semibold text-gray-900">{sessions.length}</p>
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-sm">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <Brain className="h-8 w-8 text-zuck-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Messages</p>
                <p className="text-2xl font-semibold text-gray-900">
                  {sessions.reduce((total, session) => total + getMessageCount(session.messages), 0)}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-sm">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <Settings className="h-8 w-8 text-zuck-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Plan</p>
                <p className="text-2xl font-semibold text-gray-900">Free</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
} 