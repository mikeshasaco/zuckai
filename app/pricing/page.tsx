'use client'

import { useState, useEffect } from 'react'
import { CheckCircle, Brain, Target, TrendingUp, Users, Zap, Star } from 'lucide-react'
import Link from 'next/link'
import { supabase } from '@/lib/supabase'
import { loadStripe } from '@stripe/stripe-js'
import toast from 'react-hot-toast'

const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!)

const plans = [
  {
    id: 'starter',
    name: 'Starter',
    price: 20,
    description: 'Perfect for small businesses getting started with Facebook ads',
    features: [
      '5 ad analyses per month',
      'Basic recommendations',
      'Email support',
      'Standard response time',
      'Basic campaign templates'
    ],
    popular: false
  },
  {
    id: 'builder',
    name: 'Builder',
    price: 50,
    description: 'Ideal for growing businesses that need more comprehensive analysis',
    features: [
      '25 ad analyses per month',
      'Advanced recommendations',
      'Priority support',
      'Campaign templates',
      'Performance insights',
      'A/B testing suggestions'
    ],
    popular: true
  },
  {
    id: 'pro',
    name: 'Pro',
    price: 100,
    description: 'For agencies and businesses that need unlimited access and premium features',
    features: [
      'Unlimited ad analyses',
      'Premium recommendations',
      'Phone support',
      'Custom strategies',
      'API access',
      'White-label options',
      'Dedicated account manager'
    ],
    popular: false
  }
]

export default function PricingPage() {
  const [billingCycle, setBillingCycle] = useState<'monthly' | 'yearly'>('monthly')
  const [user, setUser] = useState<any>(null)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    checkUser()
  }, [])

  const checkUser = async () => {
    const { data: { user } } = await supabase.auth.getUser()
    setUser(user)
  }

  const handleSubscribe = async (planId: string) => {
    if (!user) {
      // Redirect to auth if not logged in
      window.location.href = '/auth'
      return
    }

    setLoading(true)
    try {
      const response = await fetch('/api/create-checkout-session', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          planId,
          userId: user.id,
        }),
      })

      if (!response.ok) {
        throw new Error('Failed to create checkout session')
      }

      const { sessionId } = await response.json()
      const stripe = await stripePromise

      if (stripe) {
        const { error } = await stripe.redirectToCheckout({ sessionId })
        if (error) {
          toast.error(error.message || 'Checkout failed')
        }
      }
    } catch (error: any) {
      toast.error('Failed to start checkout process')
      console.error('Checkout error:', error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-zuck-50 to-blue-50">
      {/* Navigation */}
      <nav className="bg-white/80 backdrop-blur-sm border-b border-gray-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <Brain className="h-8 w-8 text-zuck-600" />
              <span className="ml-2 text-xl font-bold text-gray-900">Zuck AI</span>
            </div>
            <div className="flex items-center space-x-4">
              <Link href="/" className="text-gray-600 hover:text-gray-900">
                Home
              </Link>
              {user ? (
                <Link href="/dashboard" className="bg-zuck-600 text-white px-4 py-2 rounded-lg hover:bg-zuck-700 transition-colors">
                  Dashboard
                </Link>
              ) : (
                <Link href="/auth" className="bg-zuck-600 text-white px-4 py-2 rounded-lg hover:bg-zuck-700 transition-colors">
                  Get Started
                </Link>
              )}
            </div>
          </div>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        {/* Header */}
        <div className="text-center mb-16">
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
            Choose Your Plan
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Start with our free trial and scale as you grow. All plans include our core AI analysis features.
          </p>
        </div>

        {/* Billing Toggle */}
        <div className="flex justify-center mb-12">
          <div className="bg-white rounded-lg p-1 shadow-sm">
            <button
              onClick={() => setBillingCycle('monthly')}
              className={`px-6 py-2 rounded-md font-medium transition-colors ${
                billingCycle === 'monthly'
                  ? 'bg-zuck-600 text-white'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              Monthly
            </button>
            <button
              onClick={() => setBillingCycle('yearly')}
              className={`px-6 py-2 rounded-md font-medium transition-colors ${
                billingCycle === 'yearly'
                  ? 'bg-zuck-600 text-white'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              Yearly
              <span className="ml-1 text-xs bg-green-100 text-green-800 px-2 py-1 rounded-full">
                Save 20%
              </span>
            </button>
          </div>
        </div>

        {/* Plans */}
        <div className="grid md:grid-cols-3 gap-8">
          {plans.map((plan) => (
            <div
              key={plan.id}
              className={`bg-white rounded-lg shadow-lg p-8 relative ${
                plan.popular ? 'ring-2 ring-zuck-600' : ''
              }`}
            >
              {plan.popular && (
                <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                  <span className="bg-zuck-600 text-white px-4 py-1 rounded-full text-sm font-semibold flex items-center">
                    <Star className="h-3 w-3 mr-1" />
                    Most Popular
                  </span>
                </div>
              )}

              <div className="text-center mb-8">
                <h3 className="text-2xl font-bold text-gray-900 mb-2">{plan.name}</h3>
                <p className="text-gray-600 mb-4">{plan.description}</p>
                <div className="mb-4">
                  <span className="text-4xl font-bold text-gray-900">
                    ${billingCycle === 'yearly' ? Math.round(plan.price * 0.8) : plan.price}
                  </span>
                  <span className="text-gray-600">/month</span>
                </div>
                {billingCycle === 'yearly' && (
                  <p className="text-sm text-green-600 font-medium">
                    Save ${plan.price * 12 - Math.round(plan.price * 0.8) * 12} per year
                  </p>
                )}
              </div>

              <ul className="space-y-4 mb-8">
                {plan.features.map((feature, index) => (
                  <li key={index} className="flex items-start">
                    <CheckCircle className="h-5 w-5 text-green-500 mr-3 mt-0.5 flex-shrink-0" />
                    <span className="text-gray-700">{feature}</span>
                  </li>
                ))}
              </ul>

              <button
                onClick={() => handleSubscribe(plan.id)}
                disabled={loading}
                className={`w-full py-3 px-4 rounded-lg font-semibold text-center block transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${
                  plan.popular
                    ? 'bg-zuck-600 text-white hover:bg-zuck-700'
                    : 'bg-gray-100 text-gray-900 hover:bg-gray-200'
                }`}
              >
                {loading ? 'Processing...' : (user ? 'Subscribe Now' : 'Start Free Trial')}
              </button>
            </div>
          ))}
        </div>

        {/* FAQ Section */}
        <div className="mt-20">
          <h2 className="text-3xl font-bold text-gray-900 text-center mb-12">
            Frequently Asked Questions
          </h2>
          <div className="grid md:grid-cols-2 gap-8">
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                Can I change my plan anytime?
              </h3>
              <p className="text-gray-600">
                Yes, you can upgrade or downgrade your plan at any time. Changes will be prorated and reflected in your next billing cycle.
              </p>
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                Is there a free trial?
              </h3>
              <p className="text-gray-600">
                Yes! All plans come with a 7-day free trial. No credit card required to start.
              </p>
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                What happens if I exceed my monthly limit?
              </h3>
              <p className="text-gray-600">
                You'll be notified when you're close to your limit. You can upgrade your plan or wait until the next billing cycle.
              </p>
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                Can I cancel anytime?
              </h3>
              <p className="text-gray-600">
                Absolutely. You can cancel your subscription at any time with no cancellation fees.
              </p>
            </div>
          </div>
        </div>

        {/* CTA Section */}
        <div className="mt-20 text-center">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">
            Ready to optimize your Facebook ads?
          </h2>
          <p className="text-xl text-gray-600 mb-8">
            Join thousands of marketers who trust Zuck AI to improve their ad performance.
          </p>
          {user ? (
            <Link
              href="/dashboard"
              className="inline-flex items-center px-8 py-4 bg-zuck-600 text-white font-semibold rounded-lg hover:bg-zuck-700 transition-colors text-lg"
            >
              <Brain className="h-5 w-5 mr-2" />
              Go to Dashboard
            </Link>
          ) : (
            <Link
              href="/auth"
              className="inline-flex items-center px-8 py-4 bg-zuck-600 text-white font-semibold rounded-lg hover:bg-zuck-700 transition-colors text-lg"
            >
              <Brain className="h-5 w-5 mr-2" />
              Start Your Free Trial
            </Link>
          )}
        </div>
      </div>
    </div>
  )
} 