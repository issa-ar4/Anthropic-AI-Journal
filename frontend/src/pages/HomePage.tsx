import { Link } from 'react-router-dom';
import { Brain, BookOpen, TrendingUp } from 'lucide-react';

export default function HomePage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50">
      {/* Header */}
      <header className="container mx-auto px-4 py-6">
        <nav className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-2xl font-bold">
            <Brain className="w-8 h-8 text-indigo-600" />
            <span>Cognitive Canvas</span>
          </div>
          <div className="flex gap-4">
            <Link
              to="/login"
              className="px-4 py-2 text-gray-700 hover:text-gray-900 transition-colors"
            >
              Login
            </Link>
            <Link
              to="/register"
              className="px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
            >
              Get Started
            </Link>
          </div>
        </nav>
      </header>

      {/* Hero Section */}
      <main className="container mx-auto px-4 py-20">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-5xl md:text-6xl font-bold text-gray-900 mb-6">
            Your Mind,{' '}
            <span className="bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
              Visualized
            </span>
          </h1>
          <p className="text-xl text-gray-600 mb-12 max-w-2xl mx-auto">
            Transform your daily reflections into an interactive, visual model of your mind. 
            Understand your emotional patterns and build a more intentional life.
          </p>
          <Link
            to="/register"
            className="inline-block px-8 py-4 bg-indigo-600 text-white text-lg rounded-lg hover:bg-indigo-700 transition-colors shadow-lg hover:shadow-xl"
          >
            Start Your Journey
          </Link>
        </div>

        {/* Features */}
        <div className="grid md:grid-cols-3 gap-8 mt-24 max-w-5xl mx-auto">
          <div className="bg-white p-8 rounded-xl shadow-sm hover:shadow-md transition-shadow">
            <div className="w-12 h-12 bg-indigo-100 rounded-lg flex items-center justify-center mb-4">
              <BookOpen className="w-6 h-6 text-indigo-600" />
            </div>
            <h3 className="text-xl font-semibold mb-3">Smart Journaling</h3>
            <p className="text-gray-600">
              Write naturally while AI analyzes your entries for emotional patterns and insights.
            </p>
          </div>

          <div className="bg-white p-8 rounded-xl shadow-sm hover:shadow-md transition-shadow">
            <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mb-4">
              <Brain className="w-6 h-6 text-purple-600" />
            </div>
            <h3 className="text-xl font-semibold mb-3">Cognitive Mapping</h3>
            <p className="text-gray-600">
              See your thoughts, emotions, and triggers visualized as an interactive cognitive canvas.
            </p>
          </div>

          <div className="bg-white p-8 rounded-xl shadow-sm hover:shadow-md transition-shadow">
            <div className="w-12 h-12 bg-pink-100 rounded-lg flex items-center justify-center mb-4">
              <TrendingUp className="w-6 h-6 text-pink-600" />
            </div>
            <h3 className="text-xl font-semibold mb-3">Pattern Discovery</h3>
            <p className="text-gray-600">
              Discover hidden connections and recurring patterns in your emotional life.
            </p>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="container mx-auto px-4 py-8 mt-20 border-t">
        <div className="text-center text-gray-600">
          <p>© 2025 Cognitive Canvas. Built with ❤️ for better self-understanding.</p>
        </div>
      </footer>
    </div>
  );
}
