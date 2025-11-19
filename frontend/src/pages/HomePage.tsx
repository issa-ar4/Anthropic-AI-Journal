import { Link } from 'react-router-dom';
import { Brain, TrendingUp, Network, ArrowRight, Sparkles, Shield, Zap, Users, Check, Star, BookOpen } from 'lucide-react';

export default function HomePage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-blue-50">
      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 bg-white/80 backdrop-blur-md border-b border-gray-200 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-2">
              <div className="relative">
                <Brain className="w-8 h-8 text-purple-600" />
                <div className="absolute -top-1 -right-1 w-3 h-3 bg-green-500 rounded-full animate-pulse" />
              </div>
              <span className="text-xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
                Cognitive Canvas
              </span>
            </div>
            <div className="flex gap-4 items-center">
              <Link
                to="/login"
                className="px-4 py-2 text-gray-700 hover:text-gray-900 font-medium transition-colors"
              >
                Sign In
              </Link>
              <Link
                to="/register"
                className="px-6 py-2 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-lg hover:shadow-lg hover:scale-105 font-medium transition-all"
              >
                Get Started Free
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-32 pb-24">
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-purple-100 rounded-full text-purple-700 font-medium mb-6">
            <Sparkles className="w-4 h-4" />
            <span>AI-Powered Mental Wellness Platform</span>
          </div>
          <h1 className="text-6xl md:text-7xl font-bold text-gray-900 mb-6 leading-tight">
            Transform Your Thoughts
            <br />
            into{' '}
            <span className="bg-gradient-to-r from-purple-600 via-blue-600 to-indigo-600 bg-clip-text text-transparent">
              Visual Insights
            </span>
          </h1>
          <p className="text-xl text-gray-600 mb-10 max-w-3xl mx-auto leading-relaxed">
            An AI-powered journaling platform that helps you understand your mental patterns,
            track emotional trends, and discover the root causes of your thoughts and behaviors.
          </p>
          <div className="flex gap-4 justify-center mb-12">
            <Link
              to="/register"
              className="group px-8 py-4 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-xl hover:shadow-2xl hover:scale-105 font-semibold text-lg flex items-center gap-2 transition-all"
            >
              Start Your Journey
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </Link>
            <Link
              to="/login"
              className="px-8 py-4 bg-white text-purple-600 rounded-xl hover:bg-gray-50 font-semibold text-lg border-2 border-purple-600 hover:shadow-lg transition-all"
            >
              View Demo
            </Link>
          </div>
          <div className="flex items-center justify-center gap-8 text-sm text-gray-600">
            <div className="flex items-center gap-2">
              <Check className="w-5 h-5 text-green-500" />
              <span>Free to start</span>
            </div>
            <div className="flex items-center gap-2">
              <Check className="w-5 h-5 text-green-500" />
              <span>No credit card required</span>
            </div>
            <div className="flex items-center gap-2">
              <Check className="w-5 h-5 text-green-500" />
              <span>Private & secure</span>
            </div>
          </div>
        </div>

        {/* Visual Demo Mockup */}
        <div className="relative max-w-5xl mx-auto">
          <div className="absolute inset-0 bg-gradient-to-r from-purple-600/20 to-blue-600/20 rounded-3xl blur-3xl" />
          <div className="relative bg-white/90 backdrop-blur-sm rounded-2xl shadow-2xl p-8 border border-gray-200">
            <div className="flex items-center gap-2 mb-6">
              <div className="w-3 h-3 rounded-full bg-red-500" />
              <div className="w-3 h-3 rounded-full bg-yellow-500" />
              <div className="w-3 h-3 rounded-full bg-green-500" />
            </div>
            <div className="grid grid-cols-3 gap-4 h-80">
              <div className="col-span-2 bg-gradient-to-br from-purple-50 to-blue-50 rounded-lg p-6 relative overflow-hidden">
                {/* Animated nodes with connections */}
                <svg className="absolute inset-0 w-full h-full" viewBox="0 0 400 300">
                  {/* Connection lines */}
                  <line x1="100" y1="75" x2="160" y2="100" stroke="#9333ea" strokeWidth="2" opacity="0.4" className="animate-pulse" />
                  <line x1="160" y1="100" x2="130" y2="225" stroke="#3b82f6" strokeWidth="2" opacity="0.4" className="animate-pulse" style={{ animationDelay: '0.5s' }} />
                  <line x1="100" y1="75" x2="280" y2="150" stroke="#6366f1" strokeWidth="2" opacity="0.4" className="animate-pulse" style={{ animationDelay: '1s' }} />
                  
                  {/* Node 1 - Anxiety */}
                  <g className="animate-pulse">
                    <circle cx="100" cy="75" r="32" fill="#a855f7" opacity="0.9" />
                    <text x="100" y="80" textAnchor="middle" fill="white" fontSize="12" fontWeight="600">Anxiety</text>
                  </g>
                  
                  {/* Node 2 - Work */}
                  <g className="animate-pulse" style={{ animationDelay: '0.3s' }}>
                    <circle cx="160" cy="100" r="24" fill="#3b82f6" opacity="0.9" />
                    <text x="160" y="105" textAnchor="middle" fill="white" fontSize="11" fontWeight="600">Work</text>
                  </g>
                  
                  {/* Node 3 - Self-doubt */}
                  <g className="animate-pulse" style={{ animationDelay: '0.6s' }}>
                    <circle cx="130" cy="225" r="28" fill="#6366f1" opacity="0.9" />
                    <text x="130" y="228" textAnchor="middle" fill="white" fontSize="11" fontWeight="600">Self</text>
                    <text x="130" y="240" textAnchor="middle" fill="white" fontSize="11" fontWeight="600">Doubt</text>
                  </g>
                  
                  {/* Node 4 - Stress */}
                  <g className="animate-pulse" style={{ animationDelay: '0.9s' }}>
                    <circle cx="280" cy="150" r="26" fill="#8b5cf6" opacity="0.9" />
                    <text x="280" y="155" textAnchor="middle" fill="white" fontSize="11" fontWeight="600">Stress</text>
                  </g>
                </svg>
              </div>
              <div className="space-y-4">
                <div className="bg-gradient-to-r from-purple-100 to-purple-50 rounded-lg p-4 border border-purple-200">
                  <div className="flex items-center gap-2 mb-2">
                    <Brain className="w-4 h-4 text-purple-600" />
                    <span className="text-xs font-semibold text-purple-900">Pattern Detected</span>
                  </div>
                  <div className="h-2 bg-purple-200 rounded-full overflow-hidden">
                    <div className="h-full bg-purple-600 rounded-full animate-pulse" style={{ width: '85%' }} />
                  </div>
                </div>
                <div className="bg-gradient-to-r from-blue-100 to-blue-50 rounded-lg p-4 border border-blue-200">
                  <div className="flex items-center gap-2 mb-2">
                    <TrendingUp className="w-4 h-4 text-blue-600" />
                    <span className="text-xs font-semibold text-blue-900">Emotional Trend</span>
                  </div>
                  <div className="h-2 bg-blue-200 rounded-full overflow-hidden">
                    <div className="h-full bg-blue-600 rounded-full animate-pulse" style={{ width: '72%', animationDelay: '0.3s' }} />
                  </div>
                </div>
                <div className="bg-gradient-to-r from-indigo-100 to-indigo-50 rounded-lg p-4 border border-indigo-200">
                  <div className="flex items-center gap-2 mb-2">
                    <Network className="w-4 h-4 text-indigo-600" />
                    <span className="text-xs font-semibold text-indigo-900">Connections</span>
                  </div>
                  <div className="h-2 bg-indigo-200 rounded-full overflow-hidden">
                    <div className="h-full bg-indigo-600 rounded-full animate-pulse" style={{ width: '93%', animationDelay: '0.6s' }} />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
            Everything you need for mental clarity
          </h2>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Powerful features designed to help you understand yourself better
          </p>
        </div>
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          <div className="group bg-white p-8 rounded-2xl shadow-lg hover:shadow-2xl transition-all hover:-translate-y-1 border border-gray-100">
            <div className="w-14 h-14 bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
              <Brain className="w-7 h-7 text-white" />
            </div>
            <h3 className="text-2xl font-semibold text-gray-900 mb-3">
              AI-Powered Analysis
            </h3>
            <p className="text-gray-600 leading-relaxed">
              Get deep insights into your thoughts and emotions with advanced AI analysis
              powered by Claude. Understand patterns you never knew existed.
            </p>
          </div>

          <div className="group bg-white p-8 rounded-2xl shadow-lg hover:shadow-2xl transition-all hover:-translate-y-1 border border-gray-100">
            <div className="w-14 h-14 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
              <TrendingUp className="w-7 h-7 text-white" />
            </div>
            <h3 className="text-2xl font-semibold text-gray-900 mb-3">
              Emotional Trends
            </h3>
            <p className="text-gray-600 leading-relaxed">
              Track your emotional patterns over time and discover what influences your mood
              and well-being with beautiful visualizations.
            </p>
          </div>

          <div className="group bg-white p-8 rounded-2xl shadow-lg hover:shadow-2xl transition-all hover:-translate-y-1 border border-gray-100">
            <div className="w-14 h-14 bg-gradient-to-br from-indigo-500 to-indigo-600 rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
              <Network className="w-7 h-7 text-white" />
            </div>
            <h3 className="text-2xl font-semibold text-gray-900 mb-3">
              Visual Canvas
            </h3>
            <p className="text-gray-600 leading-relaxed">
              Explore your mental landscape through interactive visual maps that reveal
              connections and patterns in your thinking.
            </p>
          </div>

          <div className="group bg-white p-8 rounded-2xl shadow-lg hover:shadow-2xl transition-all hover:-translate-y-1 border border-gray-100">
            <div className="w-14 h-14 bg-gradient-to-br from-green-500 to-green-600 rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
              <Shield className="w-7 h-7 text-white" />
            </div>
            <h3 className="text-2xl font-semibold text-gray-900 mb-3">
              Private & Secure
            </h3>
            <p className="text-gray-600 leading-relaxed">
              Your thoughts are yours alone. End-to-end encryption ensures your journal
              entries remain completely private and secure.
            </p>
          </div>

          <div className="group bg-white p-8 rounded-2xl shadow-lg hover:shadow-2xl transition-all hover:-translate-y-1 border border-gray-100">
            <div className="w-14 h-14 bg-gradient-to-br from-orange-500 to-orange-600 rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
              <Zap className="w-7 h-7 text-white" />
            </div>
            <h3 className="text-2xl font-semibold text-gray-900 mb-3">
              Instant Insights
            </h3>
            <p className="text-gray-600 leading-relaxed">
              Get immediate feedback and analysis on your journal entries. No waiting,
              no delays - just instant understanding.
            </p>
          </div>

          <div className="group bg-white p-8 rounded-2xl shadow-lg hover:shadow-2xl transition-all hover:-translate-y-1 border border-gray-100">
            <div className="w-14 h-14 bg-gradient-to-br from-pink-500 to-pink-600 rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
              <Users className="w-7 h-7 text-white" />
            </div>
            <h3 className="text-2xl font-semibold text-gray-900 mb-3">
              Guided Sessions
            </h3>
            <p className="text-gray-600 leading-relaxed">
              Navigate complex emotions with AI-guided therapeutic sessions that help
              you reach the root cause of your feelings.
            </p>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 bg-gradient-to-br from-purple-50 to-blue-50 rounded-3xl">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
            How it works
          </h2>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Start your journey to self-discovery in three simple steps
          </p>
        </div>
        <div className="grid md:grid-cols-3 gap-12">
          <div className="text-center">
            <div className="w-16 h-16 bg-gradient-to-br from-purple-600 to-blue-600 rounded-2xl flex items-center justify-center mx-auto mb-6 text-white text-2xl font-bold">
              1
            </div>
            <h3 className="text-2xl font-semibold text-gray-900 mb-3">Write</h3>
            <p className="text-gray-600 leading-relaxed">
              Express your thoughts and feelings in your private journal. Write freely without judgment.
            </p>
          </div>
          <div className="text-center">
            <div className="w-16 h-16 bg-gradient-to-br from-purple-600 to-blue-600 rounded-2xl flex items-center justify-center mx-auto mb-6 text-white text-2xl font-bold">
              2
            </div>
            <h3 className="text-2xl font-semibold text-gray-900 mb-3">Analyze</h3>
            <p className="text-gray-600 leading-relaxed">
              Our AI analyzes your entries to identify patterns, emotions, and cognitive distortions.
            </p>
          </div>
          <div className="text-center">
            <div className="w-16 h-16 bg-gradient-to-br from-purple-600 to-blue-600 rounded-2xl flex items-center justify-center mx-auto mb-6 text-white text-2xl font-bold">
              3
            </div>
            <h3 className="text-2xl font-semibold text-gray-900 mb-3">Discover</h3>
            <p className="text-gray-600 leading-relaxed">
              Visualize your mental landscape and gain insights that lead to meaningful personal growth.
            </p>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
            Loved by thousands
          </h2>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            See what our users are saying about their journey
          </p>
        </div>
        <div className="grid md:grid-cols-3 gap-8">
          <div className="bg-white p-8 rounded-2xl shadow-lg border border-gray-100">
            <div className="flex gap-1 mb-4">
              {[...Array(5)].map((_, i) => (
                <Star key={i} className="w-5 h-5 fill-yellow-400 text-yellow-400" />
              ))}
            </div>
            <p className="text-gray-700 mb-6 leading-relaxed">
              "This app has completely transformed how I understand my emotions. The visual canvas
              feature is mind-blowing!"
            </p>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-purple-400 to-blue-400 rounded-full" />
              <div>
                <div className="font-semibold text-gray-900">Sarah Chen</div>
                <div className="text-sm text-gray-600">Product Designer</div>
              </div>
            </div>
          </div>
          <div className="bg-white p-8 rounded-2xl shadow-lg border border-gray-100">
            <div className="flex gap-1 mb-4">
              {[...Array(5)].map((_, i) => (
                <Star key={i} className="w-5 h-5 fill-yellow-400 text-yellow-400" />
              ))}
            </div>
            <p className="text-gray-700 mb-6 leading-relaxed">
              "Finally, a journaling app that actually helps me understand patterns in my thinking.
              The AI insights are incredibly accurate."
            </p>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-green-400 to-blue-400 rounded-full" />
              <div>
                <div className="font-semibold text-gray-900">Michael Torres</div>
                <div className="text-sm text-gray-600">Software Engineer</div>
              </div>
            </div>
          </div>
          <div className="bg-white p-8 rounded-2xl shadow-lg border border-gray-100">
            <div className="flex gap-1 mb-4">
              {[...Array(5)].map((_, i) => (
                <Star key={i} className="w-5 h-5 fill-yellow-400 text-yellow-400" />
              ))}
            </div>
            <p className="text-gray-700 mb-6 leading-relaxed">
              "The guided sessions have helped me work through complex emotions I've struggled with
              for years. Truly life-changing."
            </p>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-pink-400 to-purple-400 rounded-full" />
              <div>
                <div className="font-semibold text-gray-900">Emma Williams</div>
                <div className="text-sm text-gray-600">Marketing Manager</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
        <div className="relative bg-gradient-to-r from-purple-600 to-blue-600 rounded-3xl overflow-hidden">
          <div className="absolute inset-0 bg-grid-white/10" />
          <div className="relative px-8 py-20 text-center">
            <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
              Ready to understand yourself better?
            </h2>
            <p className="text-xl text-purple-100 mb-10 max-w-2xl mx-auto">
              Join thousands of people discovering clarity through AI-powered journaling
            </p>
            <Link
              to="/register"
              className="inline-flex items-center gap-2 px-8 py-4 bg-white text-purple-600 rounded-xl hover:bg-gray-50 font-semibold text-lg hover:shadow-2xl hover:scale-105 transition-all"
            >
              Start Free Today
              <ArrowRight className="w-5 h-5" />
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-4 gap-12 mb-12">
            <div className="col-span-2">
              <div className="flex items-center gap-2 mb-4">
                <Brain className="w-8 h-8 text-purple-400" />
                <span className="text-xl font-bold">Cognitive Canvas</span>
              </div>
              <p className="text-gray-400 leading-relaxed max-w-md">
                Transform your thoughts into visual insights with AI-powered journaling.
                Your path to mental clarity starts here.
              </p>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Product</h4>
              <ul className="space-y-3 text-gray-400">
                <li><a href="#" className="hover:text-white transition-colors">Features</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Pricing</a></li>
                <li><a href="#" className="hover:text-white transition-colors">FAQ</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Roadmap</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Company</h4>
              <ul className="space-y-3 text-gray-400">
                <li><a href="#" className="hover:text-white transition-colors">About</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Blog</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Privacy</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Terms</a></li>
              </ul>
            </div>
          </div>
          <div className="pt-8 border-t border-gray-800 text-center text-gray-400">
            <p>© 2025 Cognitive Canvas. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
