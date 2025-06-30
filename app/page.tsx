import Link from 'next/link'
import { Brain, Target, TrendingUp, Users, Zap, CheckCircle } from 'lucide-react'

export default function HomePage() {
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
              <Link href="/pricing" className="text-gray-600 hover:text-gray-900">
                Pricing
              </Link>
              <Link href="/auth" className="text-gray-600 hover:text-gray-900">
                Sign In
              </Link>
              <Link 
                href="/auth" 
                className="bg-zuck-600 text-white px-4 py-2 rounded-lg hover:bg-zuck-700 transition-colors"
              >
                Get Started
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="pt-20 pb-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto text-center">
          <h1 className="text-5xl md:text-6xl font-bold text-gray-900 mb-6">
            Meet <span className="text-zuck-600">Zuck</span>, Your
            <br />
            <span className="text-zuck-600">Ivy League</span> Facebook Ad Strategist
          </h1>
          <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
            Upload your Facebook ad creative and get intelligent GPT-powered analysis with 2-5 new campaign recommendations. 
            Zuck learns from real results to become smarter over time.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link 
              href="/auth" 
              className="bg-zuck-600 text-white px-8 py-4 rounded-lg text-lg font-semibold hover:bg-zuck-700 transition-colors"
            >
              Start Your Free Analysis
            </Link>
            <Link 
              href="#features" 
              className="border border-zuck-600 text-zuck-600 px-8 py-4 rounded-lg text-lg font-semibold hover:bg-zuck-50 transition-colors"
            >
              See How It Works
            </Link>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-16 px-4 sm:px-6 lg:px-8 bg-white">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              Why Choose Zuck AI?
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Our AI assistant combines the expertise of top Facebook ad strategists with machine learning from real campaign data.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            <div className="text-center p-6">
              <div className="bg-zuck-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <Brain className="h-8 w-8 text-zuck-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">AI-Powered Analysis</h3>
              <p className="text-gray-600">
                Get detailed analysis of your ad creative, targeting, and strategy using GPT-4o technology.
              </p>
            </div>

            <div className="text-center p-6">
              <div className="bg-zuck-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <Target className="h-8 w-8 text-zuck-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Smart Recommendations</h3>
              <p className="text-gray-600">
                Receive 2-5 new campaign ideas tailored to your specific goals and audience.
              </p>
            </div>

            <div className="text-center p-6">
              <div className="bg-zuck-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <TrendingUp className="h-8 w-8 text-zuck-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Continuous Learning</h3>
              <p className="text-gray-600">
                Zuck learns from real campaign results to provide better recommendations over time.
              </p>
            </div>

            <div className="text-center p-6">
              <div className="bg-zuck-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <Users className="h-8 w-8 text-zuck-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Industry Insights</h3>
              <p className="text-gray-600">
                Access anonymized data from successful campaigns across similar industries.
              </p>
            </div>

            <div className="text-center p-6">
              <div className="bg-zuck-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <Zap className="h-8 w-8 text-zuck-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Fast & Easy</h3>
              <p className="text-gray-600">
                Upload your ad and get analysis in minutes, not hours or days.
              </p>
            </div>

            <div className="text-center p-6">
              <div className="bg-zuck-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <CheckCircle className="h-8 w-8 text-zuck-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Proven Results</h3>
              <p className="text-gray-600">
                Track your campaign performance and get follow-up optimization suggestions.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 bg-gray-50">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              Simple, Transparent Pricing
            </h2>
            <p className="text-xl text-gray-600">
              Choose the plan that fits your needs. All plans include core AI analysis features.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <div className="bg-white p-8 rounded-lg shadow-lg">
              <h3 className="text-2xl font-bold text-gray-900 mb-2">Starter</h3>
              <p className="text-4xl font-bold text-zuck-600 mb-4">$20<span className="text-lg text-gray-600">/month</span></p>
              <ul className="space-y-3 mb-8">
                <li className="flex items-center">
                  <CheckCircle className="h-5 w-5 text-green-500 mr-2" />
                  5 ad analyses per month
                </li>
                <li className="flex items-center">
                  <CheckCircle className="h-5 w-5 text-green-500 mr-2" />
                  Basic recommendations
                </li>
                <li className="flex items-center">
                  <CheckCircle className="h-5 w-5 text-green-500 mr-2" />
                  Email support
                </li>
              </ul>
              <Link 
                href="/auth" 
                className="w-full bg-zuck-600 text-white py-3 rounded-lg font-semibold hover:bg-zuck-700 transition-colors block text-center"
              >
                Get Started
              </Link>
            </div>

            <div className="bg-white p-8 rounded-lg shadow-lg border-2 border-zuck-600 relative">
              <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                <span className="bg-zuck-600 text-white px-4 py-1 rounded-full text-sm font-semibold">
                  Most Popular
                </span>
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-2">Builder</h3>
              <p className="text-4xl font-bold text-zuck-600 mb-4">$50<span className="text-lg text-gray-600">/month</span></p>
              <ul className="space-y-3 mb-8">
                <li className="flex items-center">
                  <CheckCircle className="h-5 w-5 text-green-500 mr-2" />
                  25 ad analyses per month
                </li>
                <li className="flex items-center">
                  <CheckCircle className="h-5 w-5 text-green-500 mr-2" />
                  Advanced recommendations
                </li>
                <li className="flex items-center">
                  <CheckCircle className="h-5 w-5 text-green-500 mr-2" />
                  Priority support
                </li>
                <li className="flex items-center">
                  <CheckCircle className="h-5 w-5 text-green-500 mr-2" />
                  Campaign templates
                </li>
              </ul>
              <Link 
                href="/auth" 
                className="w-full bg-zuck-600 text-white py-3 rounded-lg font-semibold hover:bg-zuck-700 transition-colors block text-center"
              >
                Get Started
              </Link>
            </div>

            <div className="bg-white p-8 rounded-lg shadow-lg">
              <h3 className="text-2xl font-bold text-gray-900 mb-2">Pro</h3>
              <p className="text-4xl font-bold text-zuck-600 mb-4">$100<span className="text-lg text-gray-600">/month</span></p>
              <ul className="space-y-3 mb-8">
                <li className="flex items-center">
                  <CheckCircle className="h-5 w-5 text-green-500 mr-2" />
                  Unlimited ad analyses
                </li>
                <li className="flex items-center">
                  <CheckCircle className="h-5 w-5 text-green-500 mr-2" />
                  Premium recommendations
                </li>
                <li className="flex items-center">
                  <CheckCircle className="h-5 w-5 text-green-500 mr-2" />
                  Phone support
                </li>
                <li className="flex items-center">
                  <CheckCircle className="h-5 w-5 text-green-500 mr-2" />
                  Custom strategies
                </li>
                <li className="flex items-center">
                  <CheckCircle className="h-5 w-5 text-green-500 mr-2" />
                  API access
                </li>
              </ul>
              <Link 
                href="/auth" 
                className="w-full bg-zuck-600 text-white py-3 rounded-lg font-semibold hover:bg-zuck-700 transition-colors block text-center"
              >
                Get Started
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="grid md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center mb-4">
                <Brain className="h-8 w-8 text-zuck-400" />
                <span className="ml-2 text-xl font-bold">Zuck AI</span>
              </div>
              <p className="text-gray-400">
                The intelligent Facebook ad strategist that learns and improves with every campaign.
              </p>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Product</h4>
              <ul className="space-y-2 text-gray-400">
                <li><Link href="#features" className="hover:text-white">Features</Link></li>
                <li><Link href="/auth" className="hover:text-white">Pricing</Link></li>
                <li><Link href="/auth" className="hover:text-white">API</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Company</h4>
              <ul className="space-y-2 text-gray-400">
                <li><Link href="#" className="hover:text-white">About</Link></li>
                <li><Link href="#" className="hover:text-white">Blog</Link></li>
                <li><Link href="#" className="hover:text-white">Careers</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Support</h4>
              <ul className="space-y-2 text-gray-400">
                <li><Link href="#" className="hover:text-white">Help Center</Link></li>
                <li><Link href="#" className="hover:text-white">Contact</Link></li>
                <li><Link href="#" className="hover:text-white">Privacy</Link></li>
              </ul>
            </div>
          </div>
          <div className="border-t border-gray-800 mt-8 pt-8 text-center text-gray-400">
            <p>&copy; 2024 Zuck AI. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  )
} 