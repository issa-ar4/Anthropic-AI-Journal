import { Link } from 'react-router-dom';
import { PenLine, Brain, TrendingUp, Network } from 'lucide-react';

export default function DashboardPage() {
  return (
    <div>
      <div className="mb-8">
        <h1 className="text-4xl md:text-5xl font-bold mb-3 bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">Dashboard</h1>
        <p className="text-gray-600 text-lg">Welcome back! Here's your mental wellness overview.</p>
      </div>
      
      {/* Welcome Card with CTA */}
      <div className="relative bg-gradient-to-br from-purple-600 via-blue-600 to-indigo-600 rounded-2xl shadow-2xl p-10 mb-12 text-white overflow-hidden">
        <div className="absolute inset-0 bg-grid-white/10" />
        <div className="relative flex items-start justify-between">
          <div className="flex-1">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Welcome to your Cognitive Canvas!</h2>
            <p className="text-purple-100 mb-8 text-xl max-w-2xl leading-relaxed">
              Start your self-discovery journey by writing your first journal entry. 
              Our AI will help you understand your thoughts, emotions, and patterns.
            </p>
            <Link
              to="/journal"
              className="inline-flex items-center gap-2 px-8 py-4 bg-white text-purple-600 rounded-xl hover:bg-gray-50 hover:shadow-2xl hover:scale-105 transition-all font-semibold text-lg shadow-xl"
            >
              <PenLine className="w-5 h-5" />
              Write Your First Entry
            </Link>
          </div>
          <Brain className="w-32 h-32 opacity-20 hidden lg:block" />
        </div>
      </div>

      {/* Feature Cards */}
      <div className="grid md:grid-cols-3 gap-8">
        <div className="group bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all hover:-translate-y-1 p-8 border border-gray-100">
          <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
            <PenLine className="w-8 h-8 text-white" />
          </div>
          <h3 className="text-2xl font-semibold mb-3 text-gray-900">Journal</h3>
          <p className="text-gray-600 mb-6 leading-relaxed">
            Write your thoughts and feelings. Track your emotional journey over time.
          </p>
          <Link to="/journal" className="inline-flex items-center gap-2 text-purple-600 hover:text-purple-700 font-semibold group/link">
            Go to Journal
            <span className="group-hover/link:translate-x-1 transition-transform">→</span>
          </Link>
        </div>

        <div className="group bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all hover:-translate-y-1 p-8 border border-gray-100">
          <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
            <TrendingUp className="w-8 h-8 text-white" />
          </div>
          <h3 className="text-2xl font-semibold mb-3 text-gray-900">Insights</h3>
          <p className="text-gray-600 mb-6 leading-relaxed">
            Discover emotional trends, patterns, and cognitive distortions in your entries.
          </p>
          <Link to="/insights" className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-700 font-semibold group/link">
            View Insights
            <span className="group-hover/link:translate-x-1 transition-transform">→</span>
          </Link>
        </div>

        <div className="group bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all hover:-translate-y-1 p-8 border border-gray-100">
          <div className="w-16 h-16 bg-gradient-to-br from-indigo-500 to-indigo-600 rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
            <Network className="w-8 h-8 text-white" />
          </div>
          <h3 className="text-2xl font-semibold mb-3 text-gray-900">Canvas</h3>
          <p className="text-gray-600 mb-6 leading-relaxed">
            Visualize the connections between your thoughts, emotions, and experiences.
          </p>
          <Link to="/canvas" className="inline-flex items-center gap-2 text-indigo-600 hover:text-indigo-700 font-semibold group/link">
            Explore Canvas
            <span className="group-hover/link:translate-x-1 transition-transform">→</span>
          </Link>
        </div>
      </div>
    </div>
  );
}
