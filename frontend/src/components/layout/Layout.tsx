import { ReactNode, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Brain, BookOpen, LogOut, Menu, X, MessageCircle } from 'lucide-react';
import { useAuthStore } from '../../lib/store';

interface LayoutProps {
  children: ReactNode;
}

export default function Layout({ children }: LayoutProps) {
  const { user, logout } = useAuthStore();
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/');
    setMobileMenuOpen(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-blue-50">
      {/* Header */}
      <header className="sticky top-0 bg-white/80 backdrop-blur-md border-b border-gray-200 z-50 shadow-sm">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <Link to="/dashboard" className="flex items-center gap-2 group">
              <div className="relative">
                <Brain className="w-7 h-7 text-purple-600 group-hover:scale-110 transition-transform" />
                <div className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-green-500 rounded-full animate-pulse" />
              </div>
              <span className="text-xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent hidden sm:inline">Cognitive Canvas</span>
              <span className="text-xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent sm:hidden">CC</span>
            </Link>

            {/* Desktop Navigation */}
            <nav className="hidden lg:flex items-center gap-1">
              <Link
                to="/dashboard"
                className="px-4 py-2 rounded-lg text-gray-700 hover:text-purple-600 hover:bg-purple-50 transition-all font-medium"
              >
                Dashboard
              </Link>
              <Link
                to="/root-cause"
                className="flex items-center gap-2 px-4 py-2 rounded-lg text-gray-700 hover:text-purple-600 hover:bg-purple-50 transition-all font-medium"
              >
                <MessageCircle className="w-4 h-4" />
                Root Cause
              </Link>
              <Link
                to="/journal"
                className="flex items-center gap-2 px-4 py-2 rounded-lg text-gray-700 hover:text-purple-600 hover:bg-purple-50 transition-all font-medium"
              >
                <BookOpen className="w-4 h-4" />
                Journal
              </Link>
              <Link
                to="/insights"
                className="px-4 py-2 rounded-lg text-gray-700 hover:text-purple-600 hover:bg-purple-50 transition-all font-medium"
              >
                Insights
              </Link>
              <Link
                to="/canvas"
                className="px-4 py-2 rounded-lg text-gray-700 hover:text-purple-600 hover:bg-purple-50 transition-all font-medium"
              >
                Canvas
              </Link>
              <div className="border-l border-gray-300 pl-4 ml-4 flex items-center gap-3">
                <span className="text-sm text-gray-600 hidden xl:inline max-w-[150px] truncate">{user?.email}</span>
                <button
                  onClick={handleLogout}
                  className="flex items-center gap-2 px-4 py-2 text-sm text-gray-700 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all font-medium"
                >
                  <LogOut className="w-4 h-4" />
                  <span className="hidden md:inline">Logout</span>
                </button>
              </div>
            </nav>

            {/* Mobile Menu Button */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="lg:hidden p-2 text-gray-700 hover:text-gray-900"
              aria-label="Toggle menu"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>

          {/* Mobile Menu */}
          {mobileMenuOpen && (
            <div className="lg:hidden border-t border-gray-200 py-4">
              <nav className="flex flex-col space-y-4">
                <Link
                  to="/dashboard"
                  onClick={() => setMobileMenuOpen(false)}
                  className="text-gray-700 hover:text-gray-900 transition-colors"
                >
                  Dashboard
                </Link>
                <Link
                  to="/root-cause"
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center gap-2 text-gray-700 hover:text-gray-900 transition-colors"
                >
                  <MessageCircle className="w-4 h-4" />
                  Root Cause Analysis
                </Link>
                <Link
                  to="/journal"
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center gap-2 text-gray-700 hover:text-gray-900 transition-colors"
                >
                  <BookOpen className="w-4 h-4" />
                  Journal
                </Link>
                <Link
                  to="/insights"
                  onClick={() => setMobileMenuOpen(false)}
                  className="text-gray-700 hover:text-gray-900 transition-colors"
                >
                  Insights
                </Link>
                <Link
                  to="/canvas"
                  onClick={() => setMobileMenuOpen(false)}
                  className="text-gray-700 hover:text-gray-900 transition-colors"
                >
                  Canvas
                </Link>
                <div className="border-t pt-4 space-y-2">
                  <p className="text-sm text-gray-600">{user?.email}</p>
                  <button
                    onClick={handleLogout}
                    className="flex items-center gap-2 px-4 py-2 text-sm text-gray-700 hover:text-gray-900 transition-colors"
                  >
                    <LogOut className="w-4 h-4" />
                    Logout
                  </button>
                </div>
              </nav>
            </div>
          )}
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-6 sm:py-10 max-w-7xl">{children}</main>
    </div>
  );
}
