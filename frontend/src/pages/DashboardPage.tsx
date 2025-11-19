import { Link } from 'react-router-dom';
import { PenLine, Brain, TrendingUp, Network } from 'lucide-react';

export default function DashboardPage() {
  return (
    <div>
      <h1 className="text-3xl font-bold mb-6">Dashboard</h1>
      
      {/* Welcome Card with CTA */}
      <div className="bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl shadow-lg p-8 mb-8 text-white">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <h2 className="text-2xl font-bold mb-3">Welcome to your Cognitive Canvas!</h2>
            <p className="text-indigo-100 mb-6 text-lg">
              Start your self-discovery journey by writing your first journal entry. 
              Our AI will help you understand your thoughts, emotions, and patterns.
            </p>
            <Link
              to="/journal"
              className="inline-flex items-center gap-2 px-6 py-3 bg-white text-indigo-600 rounded-lg hover:bg-indigo-50 transition-colors font-semibold shadow-md"
            >
              <PenLine className="w-5 h-5" />
              Write Your First Entry
            </Link>
          </div>
          <Brain className="w-24 h-24 opacity-20 hidden lg:block" />
        </div>
      </div>

      {/* Feature Cards */}
      <div className="grid md:grid-cols-3 gap-6">
        <div className="bg-white rounded-lg shadow p-6 hover:shadow-md transition-shadow">
          <div className="w-12 h-12 bg-indigo-100 rounded-lg flex items-center justify-center mb-4">
            <PenLine className="w-6 h-6 text-indigo-600" />
          </div>
          <h3 className="text-lg font-semibold mb-2">Journal</h3>
          <p className="text-gray-600 text-sm mb-4">
            Write your thoughts and feelings. Track your emotional journey over time.
          </p>
          <Link to="/journal" className="text-indigo-600 hover:text-indigo-700 font-medium text-sm">
            Go to Journal →
          </Link>
        </div>

        <div className="bg-white rounded-lg shadow p-6 hover:shadow-md transition-shadow">
          <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mb-4">
            <TrendingUp className="w-6 h-6 text-purple-600" />
          </div>
          <h3 className="text-lg font-semibold mb-2">Insights</h3>
          <p className="text-gray-600 text-sm mb-4">
            Discover emotional trends, patterns, and cognitive distortions in your entries.
          </p>
          <Link to="/insights" className="text-purple-600 hover:text-purple-700 font-medium text-sm">
            View Insights →
          </Link>
        </div>

        <div className="bg-white rounded-lg shadow p-6 hover:shadow-md transition-shadow">
          <div className="w-12 h-12 bg-pink-100 rounded-lg flex items-center justify-center mb-4">
            <Network className="w-6 h-6 text-pink-600" />
          </div>
          <h3 className="text-lg font-semibold mb-2">Canvas</h3>
          <p className="text-gray-600 text-sm mb-4">
            Visualize the connections between your thoughts, emotions, and experiences.
          </p>
          <Link to="/canvas" className="text-pink-600 hover:text-pink-700 font-medium text-sm">
            Explore Canvas →
          </Link>
        </div>
      </div>
    </div>
  );
}
